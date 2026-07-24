-- ============================================================================
-- Migration 023: Rewards Production Readiness
-- Atomic redemption, inventory automation, house integration, fixed RLS, cleanup
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- SCHEMA REPAIR: Add missing students.clerk_user_id column (idempotent)
-- This column is required by RLS policies but was missing from base schema
-- ════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Add clerk_user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE students ADD COLUMN clerk_user_id TEXT;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- PRIORITY 1: Atomic Redemption — single RPC
-- ════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS redeem_reward_with_token;

CREATE OR REPLACE FUNCTION redeem_reward_with_token(
  p_student_id UUID,
  p_reward_id UUID,
  p_token TEXT,
  p_qr_data TEXT DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_cost INTEGER;
  v_reward_name TEXT;
  v_reward_type TEXT;
  v_reward_category TEXT;
  v_current_balance INTEGER;
  v_tx_id UUID;
  v_redemption_id UUID;
  v_new_balance INTEGER;
  v_token_id UUID;
  v_student_house TEXT;
BEGIN
  -- 1. Validate reward
  SELECT cost, name, reward_type, category INTO v_cost, v_reward_name, v_reward_type, v_reward_category
  FROM rewards_config WHERE id = p_reward_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or inactive');
  END IF;

  -- 2. Check duplicate redemption
  IF EXISTS (
    SELECT 1 FROM redemptions
    WHERE student_id = p_student_id AND reward_id = p_reward_id AND status = 'completed'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already redeemed this reward');
  END IF;

  -- 3. Check stock
  IF EXISTS (
    SELECT 1 FROM rewards_config
    WHERE id = p_reward_id AND stock IS NOT NULL AND stock <= 0
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward out of stock');
  END IF;

  -- 4. Check balance
  SELECT balance INTO v_current_balance FROM student_balance WHERE student_id = p_student_id;
  IF v_current_balance IS NULL OR v_current_balance < v_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;

  -- 5. Deduct balance
  UPDATE student_balance SET
    balance = balance - v_cost,
    lifetime_spent = lifetime_spent + v_cost,
    updated_at = now()
  WHERE student_id = p_student_id
  RETURNING balance INTO v_new_balance;

  -- 6. Create spend transaction
  INSERT INTO coin_transactions (student_id, tx_type, amount, direction, description)
  VALUES (p_student_id, 'redeem_reward', v_cost, 'spend', 'Redeemed: ' || v_reward_name)
  RETURNING id INTO v_tx_id;

  -- 7. Decrement stock
  UPDATE rewards_config SET stock = stock - 1
  WHERE id = p_reward_id AND stock IS NOT NULL;

  -- 8. Insert redemption
  INSERT INTO redemptions (student_id, reward_id, coin_tx_id, status)
  VALUES (p_student_id, p_reward_id, v_tx_id, 'pending')
  RETURNING id INTO v_redemption_id;

  -- 9. Generate QR token
  INSERT INTO redemption_tokens (redemption_id, token, qr_data, expires_at, status)
  VALUES (v_redemption_id, p_token, p_qr_data, now() + interval '7 days', 'ready')
  RETURNING id INTO v_token_id;

  -- 10. Mark redemption completed
  UPDATE redemptions SET status = 'completed' WHERE id = v_redemption_id;

  -- 11. Auto-generate coupon if reward type is 'coupon'
  IF v_reward_type = 'coupon' THEN
    INSERT INTO coupons (student_id, redemption_id, code, description, category, expiry_date)
    VALUES (
      p_student_id, v_redemption_id,
      'CPN-' || upper(substr(p_student_id::text, 1, 8)) || '-' || upper(substr(md5(random()::text), 1, 8)),
      v_reward_name, 'food', now() + interval '30 days'
    );
  END IF;

  -- 12. Update house score if student has a house
  SELECT house INTO v_student_house FROM students WHERE id = p_student_id;
  IF v_student_house IS NOT NULL THEN
    PERFORM update_house_score(v_student_house, v_cost, 'all_time');
    PERFORM update_house_score(v_student_house, v_cost, 'monthly');
  END IF;

  -- 13. Log inventory change
  INSERT INTO inventory_logs (reward_id, change_type, quantity, notes)
  VALUES (p_reward_id, 'redeem', -1, 'Redeemed by student ' || p_student_id);

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'redemption_id', v_redemption_id,
    'token_id', v_token_id,
    'token', p_token,
    'new_balance', v_new_balance,
    'reward_name', v_reward_name,
    'reward_type', v_reward_type
  );
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- PRIORITY 2: Inventory Automation — trigger on stock change
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_update_inventory_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.stock IS NOT NULL AND NEW.stock <= 0 THEN
    NEW.inventory_status := 'out_of_stock';
  ELSIF NEW.stock IS NOT NULL AND NEW.stock > 0 THEN
    IF OLD.inventory_status = 'out_of_stock' OR OLD.inventory_status = 'discontinued' THEN
      NEW.inventory_status := 'in_stock';
    ELSIF NEW.stock <= 5 THEN
      NEW.inventory_status := 'low_stock';
    ELSE
      NEW.inventory_status := 'in_stock';
    END IF;
  ELSE
    NEW.inventory_status := 'in_stock';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_inventory_status ON rewards_config;
CREATE TRIGGER trg_auto_inventory_status
  BEFORE INSERT OR UPDATE OF stock ON rewards_config
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_inventory_status();

-- ════════════════════════════════════════════════════════════════════════════
-- PRIORITY 3: Parent Notifications — coupon expiry checker
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_expiring_coupons()
RETURNS TABLE(coupon_id UUID, student_id UUID, guardian_id UUID, coupon_code TEXT, description TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.student_id,
    ga.guardian_id,
    c.code,
    c.description
  FROM coupons c
  JOIN guardian_access ga ON ga.student_id = c.student_id
  WHERE c.status = 'active'
    AND c.expiry_date BETWEEN now() AND now() + interval '24 hours'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.student_id = c.student_id
        AND n.title = 'Coupon Expiring Soon'
        AND n.body LIKE '%' || c.code || '%'
        AND n.created_at > now() - interval '1 day'
    );
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- PRIORITY 4: House integration — extend earn_coins to update house score
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION earn_coins(
  p_student_id UUID,
  p_amount INTEGER,
  p_tx_type coin_tx_type,
  p_description TEXT,
  p_created_by UUID DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_balance INTEGER;
  v_tx_id UUID;
  v_student_house TEXT;
BEGIN
  INSERT INTO coin_transactions (student_id, tx_type, amount, direction, description, created_by, reference_id)
  VALUES (p_student_id, p_tx_type, p_amount, 'earn', p_description, p_created_by, p_reference_id)
  RETURNING id INTO v_tx_id;

  INSERT INTO student_balance (student_id, balance, lifetime_earned, lifetime_spent)
  VALUES (p_student_id, p_amount, p_amount, 0)
  ON CONFLICT (student_id) DO UPDATE SET
    balance = student_balance.balance + p_amount,
    lifetime_earned = student_balance.lifetime_earned + p_amount,
    updated_at = now()
  RETURNING balance INTO v_new_balance;

  -- Update house scores automatically
  SELECT house INTO v_student_house FROM students WHERE id = p_student_id;
  IF v_student_house IS NOT NULL THEN
    PERFORM update_house_score(v_student_house, p_amount, 'all_time');
    PERFORM update_house_score(v_student_house, p_amount, 'monthly');
  END IF;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_new_balance);
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- PRIORITY 6: RLS — fix Clerk UUID mismatch in migration 021 & 022 policies
-- ════════════════════════════════════════════════════════════════════════════

-- Drop all old policies from 021
DROP POLICY IF EXISTS "student_balance_select" ON student_balance;
DROP POLICY IF EXISTS "coin_transactions_select" ON coin_transactions;
DROP POLICY IF EXISTS "redemptions_select" ON redemptions;
DROP POLICY IF EXISTS "rewards_config_select" ON rewards_config;
DROP POLICY IF EXISTS "rewards_config_insert" ON rewards_config;
DROP POLICY IF EXISTS "rewards_config_update" ON rewards_config;

-- Drop all old policies from 022
DROP POLICY IF EXISTS "redemption_tokens_select" ON redemption_tokens;
DROP POLICY IF EXISTS "vendors_select" ON vendors;
DROP POLICY IF EXISTS "vendor_scan_logs_select" ON vendor_scan_logs;
DROP POLICY IF EXISTS "vendor_scan_logs_insert" ON vendor_scan_logs;
DROP POLICY IF EXISTS "redemption_tokens_update" ON redemption_tokens;
DROP POLICY IF EXISTS "facilities_select" ON facilities;
DROP POLICY IF EXISTS "facility_slots_select" ON facility_slots;
DROP POLICY IF EXISTS "facility_bookings_select" ON facility_bookings;
DROP POLICY IF EXISTS "coupons_select" ON coupons;
DROP POLICY IF EXISTS "campaigns_select" ON campaigns;
DROP POLICY IF EXISTS "campaign_rewards_select" ON campaign_rewards;
DROP POLICY IF EXISTS "campaigns_insert" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update" ON campaigns;
DROP POLICY IF EXISTS "mystery_boxes_select" ON mystery_boxes;
DROP POLICY IF EXISTS "mystery_box_items_select" ON mystery_box_items;
DROP POLICY IF EXISTS "mystery_boxes_insert" ON mystery_boxes;
DROP POLICY IF EXISTS "student_mystery_purchases_select" ON student_mystery_purchases;
DROP POLICY IF EXISTS "achievements_select" ON achievements;
DROP POLICY IF EXISTS "achievements_insert" ON achievements;
DROP POLICY IF EXISTS "student_achievements_select" ON student_achievements;
DROP POLICY IF EXISTS "house_scores_select" ON house_scores;
DROP POLICY IF EXISTS "inventory_logs_select" ON inventory_logs;

-- ── Rewards Config (021) ──
CREATE POLICY "rewards_config_select" ON rewards_config FOR SELECT USING (true);
CREATE POLICY "rewards_config_insert" ON rewards_config FOR INSERT WITH CHECK (
  is_admin() OR get_teacher_id() IS NOT NULL
);
CREATE POLICY "rewards_config_update" ON rewards_config FOR UPDATE USING (
  is_admin() OR get_teacher_id() IS NOT NULL
);

-- ── Student Balance (021) ──
CREATE POLICY "student_balance_select" ON student_balance FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
);

-- ── Coin Transactions (021) ──
CREATE POLICY "coin_transactions_select" ON coin_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
);

-- ── Redemptions (021) ──
CREATE POLICY "redemptions_select" ON redemptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
);

-- ── Redemption Tokens (022) ──
CREATE POLICY "redemption_tokens_select" ON redemption_tokens FOR SELECT USING (
  EXISTS (SELECT 1 FROM redemptions r JOIN students s ON s.id = r.student_id WHERE r.id = redemption_id AND s.clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
  OR EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
);
CREATE POLICY "redemption_tokens_update" ON redemption_tokens FOR UPDATE USING (
  EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- ── Vendors (022) ──
CREATE POLICY "vendors_select" ON vendors FOR SELECT USING (true);

-- ── Vendor Scan Logs (022) ──
CREATE POLICY "vendor_scan_logs_select" ON vendor_scan_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);
CREATE POLICY "vendor_scan_logs_insert" ON vendor_scan_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- ── Facilities & Slots (022) ──
CREATE POLICY "facilities_select" ON facilities FOR SELECT USING (true);
CREATE POLICY "facility_slots_select" ON facility_slots FOR SELECT USING (true);

-- ── Facility Bookings (022) ──
CREATE POLICY "facility_bookings_select" ON facility_bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
  OR EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- ── Coupons (022) ──
CREATE POLICY "coupons_select" ON coupons FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
  OR EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- ── Campaigns (022) ──
CREATE POLICY "campaigns_select" ON campaigns FOR SELECT USING (true);
CREATE POLICY "campaign_rewards_select" ON campaign_rewards FOR SELECT USING (true);
CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT WITH CHECK (
  get_teacher_id() IS NOT NULL OR is_admin()
);
CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE USING (
  get_teacher_id() IS NOT NULL OR is_admin()
);

-- ── Mystery Boxes (022) ──
CREATE POLICY "mystery_boxes_select" ON mystery_boxes FOR SELECT USING (true);
CREATE POLICY "mystery_box_items_select" ON mystery_box_items FOR SELECT USING (true);
CREATE POLICY "mystery_boxes_insert" ON mystery_boxes FOR INSERT WITH CHECK (is_admin());

-- ── Student Mystery Purchases (022) ──
CREATE POLICY "student_mystery_purchases_select" ON student_mystery_purchases FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
);

-- ── Achievements (022) ──
CREATE POLICY "achievements_select" ON achievements FOR SELECT USING (true);
CREATE POLICY "achievements_insert" ON achievements FOR INSERT WITH CHECK (
  get_teacher_id() IS NOT NULL OR is_admin()
);

-- ── Student Achievements (022) ──
CREATE POLICY "student_achievements_select" ON student_achievements FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND clerk_user_id = auth.jwt() ->> 'sub')
  OR get_teacher_id() IS NOT NULL
  OR is_admin()
);

-- ── House Scores (022) ──
CREATE POLICY "house_scores_select" ON house_scores FOR SELECT USING (true);

-- ── Inventory Logs (022) ──
CREATE POLICY "inventory_logs_select" ON inventory_logs FOR SELECT USING (
  get_teacher_id() IS NOT NULL OR is_admin()
);

-- ════════════════════════════════════════════════════════════════════════════
-- PRIORITY 5: Analytics — SQL aggregation functions (no hard limits)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION analytics_top_redeemed()
RETURNS TABLE(reward_name TEXT, cnt BIGINT)
LANGUAGE sql
AS $$
  SELECT rc.name, COUNT(r.id)::BIGINT
  FROM redemptions r
  JOIN rewards_config rc ON rc.id = r.reward_id
  WHERE r.status = 'completed'
  GROUP BY rc.id, rc.name
  ORDER BY COUNT(r.id) DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION analytics_category_breakdown()
RETURNS TABLE(category TEXT, cnt BIGINT)
LANGUAGE sql
AS $$
  SELECT rc.category, COUNT(r.id)::BIGINT
  FROM redemptions r
  JOIN rewards_config rc ON rc.id = r.reward_id
  WHERE r.status = 'completed'
  GROUP BY rc.category
  ORDER BY COUNT(r.id) DESC;
$$;

CREATE OR REPLACE FUNCTION analytics_daily_coins()
RETURNS TABLE(day TEXT, earned BIGINT, spent BIGINT)
LANGUAGE sql
AS $$
  SELECT
    to_char(created_at, 'YYYY-MM-DD') AS day,
    COALESCE(SUM(amount) FILTER (WHERE direction = 'earn'), 0)::BIGINT AS earned,
    COALESCE(SUM(amount) FILTER (WHERE direction = 'spend'), 0)::BIGINT AS spent
  FROM coin_transactions
  WHERE created_at >= now() - interval '30 days'
  GROUP BY to_char(created_at, 'YYYY-MM-DD')
  ORDER BY day;
$$;

CREATE OR REPLACE FUNCTION analytics_coin_totals()
RETURNS TABLE(total_earned BIGINT, total_spent BIGINT)
LANGUAGE sql
AS $$
  SELECT
    COALESCE(SUM(lifetime_earned), 0)::BIGINT,
    COALESCE(SUM(lifetime_spent), 0)::BIGINT
  FROM student_balance;
$$;

CREATE OR REPLACE FUNCTION analytics_inventory_usage()
RETURNS TABLE(reward_name TEXT, stock INTEGER, redeemed BIGINT)
LANGUAGE sql
AS $$
  SELECT
    rc.name,
    rc.stock,
    COALESCE(rd.cnt, 0)::BIGINT AS redeemed
  FROM rewards_config rc
  LEFT JOIN (
    SELECT reward_id, COUNT(*)::BIGINT AS cnt
    FROM redemptions WHERE status = 'completed'
    GROUP BY reward_id
  ) rd ON rd.reward_id = rc.id
  ORDER BY rc.name;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- PRIORITY 7: Cleanup — remove unused functions
-- ════════════════════════════════════════════════════════════════════════════

-- generate_redemption_token is replaced by redeem_reward_with_token
DROP FUNCTION IF EXISTS generate_redemption_token(UUID, TEXT, TEXT);
