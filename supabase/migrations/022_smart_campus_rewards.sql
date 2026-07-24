-- ============================================================================
-- Migration 022: Smart Campus Rewards Ecosystem
-- Extends Migration 021 with QR redemption, vendor portal, facility booking,
-- digital coupons, campaigns, mystery boxes, achievements, house integration.
-- ============================================================================

-- Older deployed base schemas did not include the Clerk mapping on students,
-- but the rewards RLS policies depend on it.
ALTER TABLE students ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- ────────────────────────────────────────────────────────────────────────────
-- 0. Extend existing coin_tx_type enum
-- ────────────────────────────────────────────────────────────────────────────
ALTER TYPE coin_tx_type ADD VALUE IF NOT EXISTS 'earn_achievement';
ALTER TYPE coin_tx_type ADD VALUE IF NOT EXISTS 'earn_mystery';
ALTER TYPE coin_tx_type ADD VALUE IF NOT EXISTS 'earn_campaign';

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Extend rewards_config with smart inventory + facility/coupon flags
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT NULL;
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS weekly_limit INTEGER DEFAULT NULL;
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS monthly_limit INTEGER DEFAULT NULL;
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS availability_window_start TIME DEFAULT NULL;
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS availability_window_end TIME DEFAULT NULL;
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS inventory_status TEXT DEFAULT 'in_stock' CHECK (inventory_status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued'));
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'item' CHECK (reward_type IN ('item', 'coupon', 'facility'));
ALTER TABLE rewards_config ADD COLUMN IF NOT EXISTS facility_id UUID DEFAULT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Redemption Tokens (QR codes for physical redemption)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redemption_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redemption_id UUID NOT NULL REFERENCES redemptions(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  qr_data TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'redeemed', 'expired', 'cancelled')),
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Redemption status extend
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE redemptions DROP CONSTRAINT IF EXISTS redemptions_status_check;
ALTER TABLE redemptions ADD CONSTRAINT redemptions_status_check CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded', 'expired'));

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Vendors (canteen, library, sports, facility staff)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  clerk_user_id TEXT UNIQUE,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('canteen', 'library', 'sports', 'facility', 'general')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Vendor scan audit log
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  redemption_token_id UUID REFERENCES redemption_tokens(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  details TEXT,
  scanned_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Facilities (bookable spaces)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('sports', 'library', 'music', 'art', 'lab', 'studio', 'other')),
  location TEXT,
  capacity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Facility time slots
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INTEGER DEFAULT 1,
  UNIQUE (facility_id, day_of_week, start_time)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Facility bookings
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  slot_id UUID NOT NULL REFERENCES facility_slots(id) ON DELETE RESTRICT,
  redemption_id UUID REFERENCES redemptions(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  qr_token TEXT UNIQUE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (facility_id, slot_id, booking_date)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. Digital Coupons
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  redemption_id UUID REFERENCES redemptions(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'print', 'pass', 'merchandise', 'other')),
  expiry_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. Campaigns
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  bonus_multiplier NUMERIC(3,1) DEFAULT 1.0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 11. Campaign rewards (special rewards during campaign)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards_config(id) ON DELETE CASCADE,
  bonus_cost INTEGER,
  UNIQUE (campaign_id, reward_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 12. Mystery Boxes
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mystery_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL CHECK (cost > 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 13. Mystery Box items (weighted probabilities)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mystery_box_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES mystery_boxes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('coins', 'reward', 'coupon', 'badge', 'ticket')),
  item_name TEXT NOT NULL,
  item_description TEXT,
  item_value INTEGER DEFAULT 0,
  probability NUMERIC(5,2) NOT NULL CHECK (probability > 0 AND probability <= 100),
  quantity INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT true
);

-- ────────────────────────────────────────────────────────────────────────────
-- 14. Student mystery box purchases
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_mystery_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  box_id UUID NOT NULL REFERENCES mystery_boxes(id) ON DELETE RESTRICT,
  coin_tx_id UUID NOT NULL REFERENCES coin_transactions(id) ON DELETE RESTRICT,
  item_won TEXT NOT NULL,
  won_type TEXT NOT NULL,
  won_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 15. Achievements
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('attendance', 'homework', 'sports', 'behaviour', 'academic', 'club', 'transport', 'special')),
  coins_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 16. Student achievements
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  coin_tx_id UUID REFERENCES coin_transactions(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (student_id, achievement_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 17. House scores (if student.house column exists)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS house_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'yearly', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (house, period_type, period_start)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 18. Inventory change log
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES rewards_config(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('restock', 'redeem', 'expired', 'adjust', 'return')),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE redemption_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mystery_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Read policies: students see own, teachers/admins/vendors see all
CREATE POLICY "redemption_tokens_select" ON redemption_tokens FOR SELECT USING (
  EXISTS (SELECT 1 FROM redemptions r WHERE r.id = redemption_id AND r.student_id = auth.uid())
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "vendors_select" ON vendors FOR SELECT USING (true);
CREATE POLICY "vendor_scan_logs_select" ON vendor_scan_logs FOR SELECT USING (
  vendor_id = auth.uid()
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "facilities_select" ON facilities FOR SELECT USING (true);
CREATE POLICY "facility_slots_select" ON facility_slots FOR SELECT USING (true);

CREATE POLICY "facility_bookings_select" ON facility_bookings FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "coupons_select" ON coupons FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "campaigns_select" ON campaigns FOR SELECT USING (true);
CREATE POLICY "campaign_rewards_select" ON campaign_rewards FOR SELECT USING (true);
CREATE POLICY "mystery_boxes_select" ON mystery_boxes FOR SELECT USING (true);
CREATE POLICY "mystery_box_items_select" ON mystery_box_items FOR SELECT USING (true);

CREATE POLICY "student_mystery_purchases_select" ON student_mystery_purchases FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "achievements_select" ON achievements FOR SELECT USING (true);
CREATE POLICY "student_achievements_select" ON student_achievements FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "house_scores_select" ON house_scores FOR SELECT USING (true);
CREATE POLICY "inventory_logs_select" ON inventory_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- Write policies: teachers/admins/vendors
CREATE POLICY "vendor_scan_logs_insert" ON vendor_scan_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM vendors WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "redemption_tokens_update" ON redemption_tokens FOR UPDATE USING (
  EXISTS (SELECT 1 FROM vendors WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);
CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE USING (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "mystery_boxes_insert" ON mystery_boxes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY "achievements_insert" ON achievements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- ════════════════════════════════════════════════════════════════════════════
-- Functions
-- ════════════════════════════════════════════════════════════════════════════

-- Generate redemption token + QR data for a completed redemption
CREATE OR REPLACE FUNCTION generate_redemption_token(
  p_redemption_id UUID,
  p_token TEXT,
  p_qr_data TEXT DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_token_id UUID;
  v_student_id UUID;
  v_reward_name TEXT;
BEGIN
  SELECT r.student_id, rc.name INTO v_student_id, v_reward_name
  FROM redemptions r
  JOIN rewards_config rc ON rc.id = r.reward_id
  WHERE r.id = p_redemption_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Redemption not found');
  END IF;

  INSERT INTO redemption_tokens (redemption_id, token, qr_data, expires_at, status)
  VALUES (p_redemption_id, p_token, p_qr_data, now() + interval '7 days', 'ready')
  RETURNING id INTO v_token_id;

  UPDATE redemptions SET status = 'completed' WHERE id = p_redemption_id;

  RETURN jsonb_build_object(
    'success', true,
    'token_id', v_token_id,
    'token', p_token,
    'student_id', v_student_id,
    'reward_name', v_reward_name
  );
END;
$$;

-- Vendor scan: validate token and mark as redeemed
CREATE OR REPLACE FUNCTION vendor_scan_token(
  p_token TEXT,
  p_vendor_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_rt redemption_tokens%ROWTYPE;
  v_redemption redemptions%ROWTYPE;
  v_student_name TEXT;
  v_reward_name TEXT;
BEGIN
  -- Look up token
  SELECT * INTO v_rt FROM redemption_tokens WHERE token = p_token;
  IF NOT FOUND THEN
    INSERT INTO vendor_scan_logs (vendor_id, action, result, details)
    VALUES (p_vendor_id, 'scan', 'invalid', 'Token not found: ' || p_token);
    RETURN jsonb_build_object('success', false, 'error', 'Invalid token');
  END IF;

  -- Check if already redeemed
  IF v_rt.status = 'redeemed' THEN
    INSERT INTO vendor_scan_logs (vendor_id, redemption_token_id, action, result, details)
    VALUES (p_vendor_id, v_rt.id, 'scan', 'duplicate', 'Token already redeemed at ' || COALESCE(v_rt.scanned_at::text, 'unknown'));
    RETURN jsonb_build_object('success', false, 'error', 'Token already redeemed');
  END IF;

  -- Check if expired
  IF v_rt.status = 'expired' OR v_rt.expires_at < now() THEN
    UPDATE redemption_tokens SET status = 'expired' WHERE id = v_rt.id;
    INSERT INTO vendor_scan_logs (vendor_id, redemption_token_id, action, result, details)
    VALUES (p_vendor_id, v_rt.id, 'scan', 'expired', 'Token expired');
    RETURN jsonb_build_object('success', false, 'error', 'Token expired');
  END IF;

  IF v_rt.status = 'cancelled' THEN
    INSERT INTO vendor_scan_logs (vendor_id, redemption_token_id, action, result, details)
    VALUES (p_vendor_id, v_rt.id, 'scan', 'cancelled', 'Token cancelled');
    RETURN jsonb_build_object('success', false, 'error', 'Token cancelled');
  END IF;

  -- Mark as redeemed (atomic check: only redeem if still ready)
  UPDATE redemption_tokens SET
    status = 'redeemed',
    scanned_at = now(),
    scanned_by = p_vendor_id
  WHERE id = v_rt.id AND status = 'ready';

  IF NOT FOUND THEN
    INSERT INTO vendor_scan_logs (vendor_id, redemption_token_id, action, result, details)
    VALUES (p_vendor_id, v_rt.id, 'scan', 'race_lost', 'Token was already being processed');
    RETURN jsonb_build_object('success', false, 'error', 'Token already redeemed');
  END IF;

  -- Get student and reward names
  SELECT s.display_name INTO v_student_name
  FROM redemptions r
  JOIN students s ON s.id = r.student_id
  WHERE r.id = v_rt.redemption_id;

  SELECT rc.name INTO v_reward_name
  FROM redemptions r
  JOIN rewards_config rc ON rc.id = r.reward_id
  WHERE r.id = v_rt.redemption_id;

  INSERT INTO vendor_scan_logs (vendor_id, redemption_token_id, action, result, details)
  VALUES (p_vendor_id, v_rt.id, 'scan', 'success', 'Redeemed: ' || COALESCE(v_reward_name, 'Unknown'));

  RETURN jsonb_build_object(
    'success', true,
    'student_name', v_student_name,
    'reward_name', v_reward_name,
    'token', p_token
  );
END;
$$;

-- Open a mystery box: deduct coins, pick item, create transaction
CREATE OR REPLACE FUNCTION open_mystery_box(
  p_student_id UUID,
  p_box_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_cost INTEGER;
  v_box_name TEXT;
  v_balance INTEGER;
  v_tx_id UUID;
  v_items RECORD;
  v_rand NUMERIC;
  v_cumulative NUMERIC := 0;
  v_chosen_item TEXT;
  v_chosen_type TEXT;
  v_chosen_desc TEXT;
  v_chosen_value INTEGER := 0;
  v_new_balance INTEGER;
BEGIN
  SELECT cost, name INTO v_cost, v_box_name
  FROM mystery_boxes WHERE id = p_box_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mystery box not found');
  END IF;

  SELECT balance INTO v_balance FROM student_balance WHERE student_id = p_student_id;
  IF v_balance IS NULL OR v_balance < v_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;

  -- Weighted random selection
  SELECT SUM(probability) INTO v_rand FROM mystery_box_items
  WHERE box_id = p_box_id AND is_active = true;

  v_rand := random() * COALESCE(v_rand, 100);

  FOR v_items IN
    SELECT item_name, item_type, item_description, item_value, probability
    FROM mystery_box_items
    WHERE box_id = p_box_id AND is_active = true
    ORDER BY id
  LOOP
    v_cumulative := v_cumulative + v_items.probability;
    IF v_rand <= v_cumulative THEN
      v_chosen_item := v_items.item_name;
      v_chosen_type := v_items.item_type;
      v_chosen_desc := COALESCE(v_items.item_description, '');
      v_chosen_value := v_items.item_value;
      EXIT;
    END IF;
  END LOOP;

  IF v_chosen_item IS NULL THEN
    v_chosen_item := 'Mystery Surprise';
    v_chosen_type := 'coins';
    v_chosen_value := 10;
  END IF;

  -- Deduct coins
  INSERT INTO coin_transactions (student_id, tx_type, amount, direction, description)
  VALUES (p_student_id, 'earn_mystery', v_cost, 'spend', 'Mystery Box: ' || v_box_name)
  RETURNING id INTO v_tx_id;

  UPDATE student_balance SET
    balance = balance - v_cost,
    lifetime_spent = lifetime_spent + v_cost,
    updated_at = now()
  WHERE student_id = p_student_id
  RETURNING balance INTO v_new_balance;

  -- If won coins, add them immediately
  IF v_chosen_type = 'coins' AND v_chosen_value > 0 THEN
    PERFORM earn_coins(p_student_id, v_chosen_value, 'earn_bonus', 'Mystery box prize: ' || v_chosen_item);
    v_new_balance := v_new_balance + v_chosen_value;
  END IF;

  INSERT INTO student_mystery_purchases (student_id, box_id, coin_tx_id, item_won, won_type, won_value)
  VALUES (p_student_id, p_box_id, v_tx_id, v_chosen_item, v_chosen_type, v_chosen_value);

  RETURN jsonb_build_object(
    'success', true,
    'item_won', v_chosen_item,
    'item_type', v_chosen_type,
    'item_description', v_chosen_desc,
    'item_value', v_chosen_value,
    'new_balance', v_new_balance
  );
END;
$$;

-- Award achievement + coins
CREATE OR REPLACE FUNCTION award_achievement(
  p_student_id UUID,
  p_achievement_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_achievement_name TEXT;
  v_coins_reward INTEGER;
  v_current_balance INTEGER;
  v_tx_id UUID;
  v_new_balance INTEGER;
BEGIN
  SELECT name, coins_reward INTO v_achievement_name, v_coins_reward
  FROM achievements WHERE id = p_achievement_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Achievement not found');
  END IF;

  -- Check not already earned
  IF EXISTS (SELECT 1 FROM student_achievements WHERE student_id = p_student_id AND achievement_id = p_achievement_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Achievement already earned');
  END IF;

  -- Award coins if applicable
  IF v_coins_reward > 0 THEN
    INSERT INTO coin_transactions (student_id, tx_type, amount, direction, description)
    VALUES (p_student_id, 'earn_achievement', v_coins_reward, 'earn', 'Achievement: ' || v_achievement_name)
    RETURNING id INTO v_tx_id;

    INSERT INTO student_balance (student_id, balance, lifetime_earned, lifetime_spent)
    VALUES (p_student_id, v_coins_reward, v_coins_reward, 0)
    ON CONFLICT (student_id) DO UPDATE SET
      balance = student_balance.balance + v_coins_reward,
      lifetime_earned = student_balance.lifetime_earned + v_coins_reward,
      updated_at = now()
    RETURNING balance INTO v_new_balance;
  END IF;

  INSERT INTO student_achievements (student_id, achievement_id, coin_tx_id)
  VALUES (p_student_id, p_achievement_id, v_tx_id);

  RETURN jsonb_build_object(
    'success', true,
    'achievement_name', v_achievement_name,
    'coins_reward', v_coins_reward,
    'new_balance', v_new_balance
  );
END;
$$;

-- Update house score
CREATE OR REPLACE FUNCTION update_house_score(
  p_house TEXT,
  p_points INTEGER,
  p_period_type TEXT DEFAULT 'all_time'
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  v_period_start := CASE p_period_type
    WHEN 'weekly' THEN date_trunc('week', current_date)::date
    WHEN 'monthly' THEN date_trunc('month', current_date)::date
    WHEN 'yearly' THEN date_trunc('year', current_date)::date
    ELSE '1970-01-01'::date
  END;

  INSERT INTO house_scores (house, period_type, period_start, score)
  VALUES (p_house, p_period_type, v_period_start, p_points)
  ON CONFLICT (house, period_type, period_start) DO UPDATE SET
    score = house_scores.score + p_points,
    updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Check daily/weekly/monthly limits for a reward
CREATE OR REPLACE FUNCTION check_reward_limits(
  p_reward_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_reward rewards_config%ROWTYPE;
  v_daily_count INTEGER;
  v_weekly_count INTEGER;
  v_monthly_count INTEGER;
BEGIN
  SELECT * INTO v_reward FROM rewards_config WHERE id = p_reward_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('available', false, 'error', 'Reward not found');
  END IF;

  -- Check stock
  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RETURN jsonb_build_object('available', false, 'error', 'Out of stock');
  END IF;

  -- Check inventory status
  IF v_reward.inventory_status = 'out_of_stock' OR v_reward.inventory_status = 'discontinued' THEN
    RETURN jsonb_build_object('available', false, 'error', 'Reward unavailable');
  END IF;

  -- Check daily limit
  IF v_reward.daily_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_daily_count FROM redemptions
    WHERE reward_id = p_reward_id AND status = 'completed' AND redeemed_at::date = current_date;
    IF v_daily_count >= v_reward.daily_limit THEN
      RETURN jsonb_build_object('available', false, 'error', 'Daily limit reached');
    END IF;
  END IF;

  -- Check weekly limit
  IF v_reward.weekly_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_weekly_count FROM redemptions
    WHERE reward_id = p_reward_id AND status = 'completed'
      AND redeemed_at >= date_trunc('week', current_date);
    IF v_weekly_count >= v_reward.weekly_limit THEN
      RETURN jsonb_build_object('available', false, 'error', 'Weekly limit reached');
    END IF;
  END IF;

  -- Check monthly limit
  IF v_reward.monthly_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_monthly_count FROM redemptions
    WHERE reward_id = p_reward_id AND status = 'completed'
      AND redeemed_at >= date_trunc('month', current_date);
    IF v_monthly_count >= v_reward.monthly_limit THEN
      RETURN jsonb_build_object('available', false, 'error', 'Monthly limit reached');
    END IF;
  END IF;

  RETURN jsonb_build_object('available', true);
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- Seed Data
-- ════════════════════════════════════════════════════════════════════════════

-- Facilities
INSERT INTO facilities (id, name, description, category, location, capacity) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'Basketball Court', 'Outdoor basketball court', 'sports', 'Sports Complex', 10),
  ('f1000000-0000-4000-8000-000000000002', 'Football Ground', 'Main football field', 'sports', 'Sports Complex', 22),
  ('f1000000-0000-4000-8000-000000000003', 'Badminton Court', 'Indoor badminton court', 'sports', 'Indoor Stadium', 4),
  ('f1000000-0000-4000-8000-000000000004', 'Library Premium Cabin', 'Private study cabin in library', 'library', 'Library - 2nd Floor', 1),
  ('f1000000-0000-4000-8000-000000000005', 'Music Room', 'Soundproof music practice room', 'music', 'Arts Block', 6),
  ('f1000000-0000-4000-8000-000000000006', 'Art Studio', 'Art and craft studio', 'art', 'Arts Block', 8),
  ('f1000000-0000-4000-8000-000000000007', 'Robotics Lab', 'Robotics and AI laboratory', 'lab', 'Science Block', 4),
  ('f1000000-0000-4000-8000-000000000008', 'Computer Lab', 'Computer science lab', 'lab', 'Academic Block', 20);

-- Facility time slots (weekdays only)
DO $$
DECLARE
  f RECORD;
  d SMALLINT;
BEGIN
  FOR f IN SELECT id FROM facilities LOOP
    FOR d IN 0..4 LOOP
      INSERT INTO facility_slots (facility_id, day_of_week, start_time, end_time, max_bookings)
      VALUES (f.id, d, '14:00', '15:00', 1)
      ON CONFLICT (facility_id, day_of_week, start_time) DO NOTHING;
      INSERT INTO facility_slots (facility_id, day_of_week, start_time, end_time, max_bookings)
      VALUES (f.id, d, '15:00', '16:00', 1)
      ON CONFLICT (facility_id, day_of_week, start_time) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Achievements
INSERT INTO achievements (id, name, description, icon, category, coins_reward) VALUES
  ('71000000-0000-4000-8000-000000000001', 'Perfect Attendance', '100% attendance for one month', '📅', 'attendance', 50),
  ('71000000-0000-4000-8000-000000000002', 'Homework Hero', 'Submitted all homework on time for a month', '📚', 'homework', 40),
  ('71000000-0000-4000-8000-000000000003', 'Sports Champion', 'Won an inter-school sports event', '🏆', 'sports', 100),
  ('71000000-0000-4000-8000-000000000004', 'Star Performer', 'Scored above 90% in exams', '⭐', 'academic', 75),
  ('71000000-0000-4000-8000-000000000005', 'Kindness Ambassador', 'Recognized for positive behaviour', '💛', 'behaviour', 30),
  ('71000000-0000-4000-8000-000000000006', 'Club Star', 'Active participation in school clubs', '🎭', 'club', 25),
  ('71000000-0000-4000-8000-000000000007', 'Bus Safety Champion', 'Consistently safe bus behaviour', '🚌', 'transport', 20),
  ('71000000-0000-4000-8000-000000000008', 'Science Genius', 'Outstanding performance in Science', '🔬', 'academic', 80);

-- Mystery Boxes
INSERT INTO mystery_boxes (id, name, description, cost) VALUES
  ('81000000-0000-4000-8000-000000000001', 'Lucky Snack Box', 'A surprise snack or treat! Cost: 30 coins', 30),
  ('81000000-0000-4000-8000-000000000002', 'Mystery Prize Box', 'Win coins, rewards, or exclusive prizes!', 75),
  ('81000000-0000-4000-8000-000000000003', 'Premium Surprise Box', 'Top-tier prizes including hoodies and VIP passes!', 150);

-- Mystery Box Items (weighted probabilities)
INSERT INTO mystery_box_items (box_id, item_type, item_name, item_description, item_value, probability) VALUES
  -- Lucky Snack Box (30 coins)
  ('81000000-0000-4000-8000-000000000001', 'coupon', 'Free Juice', 'One free juice at the canteen', 25, 35),
  ('81000000-0000-4000-8000-000000000001', 'coupon', 'Free Snack', 'One free snack at the canteen', 15, 30),
  ('81000000-0000-4000-8000-000000000001', 'coupon', 'Free Sandwich', 'One free sandwich at the canteen', 35, 20),
  ('81000000-0000-4000-8000-000000000001', 'coins', 'Bonus Coins', 'Win 10 bonus coins', 10, 10),
  ('81000000-0000-4000-8000-000000000001', 'coins', 'Bonus Coins', 'Win 20 bonus coins', 20, 5),

  -- Mystery Prize Box (75 coins)
  ('81000000-0000-4000-8000-000000000002', 'coins', 'Bonus Coins', 'Win 50 bonus coins', 50, 30),
  ('81000000-0000-4000-8000-000000000002', 'coupon', 'Free Canteen Meal', 'One free full meal at the canteen', 50, 25),
  ('81000000-0000-4000-8000-000000000002', 'coins', 'Bonus Coins', 'Win 100 bonus coins', 100, 15),
  ('81000000-0000-4000-8000-000000000002', 'badge', 'Premium Badge', 'Exclusive premium profile badge', 0, 15),
  ('81000000-0000-4000-8000-000000000002', 'reward', 'School Water Bottle', 'Exclusive school-branded water bottle', 75, 10),
  ('81000000-0000-4000-8000-000000000002', 'ticket', 'Event Pass', 'Free entry to next school event', 80, 5),

  -- Premium Surprise Box (150 coins)
  ('81000000-0000-4000-8000-000000000003', 'reward', 'School T-Shirt', 'Official school T-shirt', 150, 30),
  ('81000000-0000-4000-8000-000000000003', 'ticket', 'VIP Event Pass', 'VIP access to all school events', 200, 20),
  ('81000000-0000-4000-8000-000000000003', 'coins', 'Bonus Coins', 'Win 200 bonus coins', 200, 20),
  ('81000000-0000-4000-8000-000000000003', 'reward', 'School Hoodie', 'Exclusive school hoodie', 250, 15),
  ('81000000-0000-4000-8000-000000000003', 'badge', 'Golden Ticket Badge', 'Rare golden ticket badge (limited edition)', 0, 10),
  ('81000000-0000-4000-8000-000000000003', 'ticket', 'Golden Ticket', 'Golden Ticket - redeem for ANY item in the school store!', 500, 5);

-- Campaigns
INSERT INTO campaigns (id, name, description, bonus_multiplier, start_date, end_date) VALUES
  ('91000000-0000-4000-8000-000000000001', 'Sports Week', 'Double coins for sports activities!', 2.0, '2026-08-01 00:00:00+00', '2026-08-07 23:59:59+00'),
  ('91000000-0000-4000-8000-000000000002', 'Festival Rewards', 'Special festival rewards and bonus coins', 1.5, '2026-10-20 00:00:00+00', '2026-10-25 23:59:59+00'),
  ('91000000-0000-4000-8000-000000000003', 'Double Coins Friday', 'Every Friday - earn double coins!', 2.0, '2026-06-01 00:00:00+00', '2026-12-31 23:59:59+00');

-- Vendors
INSERT INTO vendors (id, name, email, vendor_type) VALUES
  ('a2000000-0000-4000-8000-000000000001', 'Canteen Manager', 'canteen@school.edu', 'canteen'),
  ('a2000000-0000-4000-8000-000000000002', 'Librarian', 'library@school.edu', 'library'),
  ('a2000000-0000-4000-8000-000000000003', 'Sports Coordinator', 'sports@school.edu', 'sports'),
  ('a2000000-0000-4000-8000-000000000004', 'Facility Manager', 'facilities@school.edu', 'facility');

-- Update existing rewards with new columns
UPDATE rewards_config SET
  daily_limit = CASE id
    WHEN 'e1000000-0000-4000-8000-000000000001' THEN 20
    WHEN 'e1000000-0000-4000-8000-000000000002' THEN 30
    WHEN 'e1000000-0000-4000-8000-000000000006' THEN 5
    ELSE NULL
  END,
  inventory_status = CASE
    WHEN stock IS NOT NULL AND stock <= 0 THEN 'out_of_stock'
    WHEN stock IS NOT NULL AND stock <= 5 THEN 'low_stock'
    ELSE 'in_stock'
  END,
  reward_type = CASE id
    WHEN 'e1000000-0000-4000-8000-000000000001' THEN 'coupon'
    WHEN 'e1000000-0000-4000-8000-000000000002' THEN 'coupon'
    WHEN 'e1000000-0000-4000-8000-000000000003' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000004' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000005' THEN 'facility'
    WHEN 'e1000000-0000-4000-8000-000000000006' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000007' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000008' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000009' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000010' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000011' THEN 'item'
    WHEN 'e1000000-0000-4000-8000-000000000012' THEN 'item'
    ELSE 'item'
  END;

-- Link sports facility reward
UPDATE rewards_config SET facility_id = 'f1000000-0000-4000-8000-000000000002'
WHERE id = 'e1000000-0000-4000-8000-000000000005';

-- Add facility-based rewards for other bookable spaces
INSERT INTO rewards_config (id, name, description, category, cost, stock, reward_type, facility_id, inventory_status) VALUES
  ('e1000000-0000-4000-8000-000000000013', 'Basketball Court Booking', 'Reserve the basketball court for 1 hour', 'sports', 50, NULL, 'facility', 'f1000000-0000-4000-8000-000000000001', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000014', 'Badminton Court Booking', 'Reserve the badminton court for 1 hour', 'sports', 40, NULL, 'facility', 'f1000000-0000-4000-8000-000000000003', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000015', 'Library Premium Cabin', 'Reserve the premium study cabin for 1 hour', 'library', 30, NULL, 'facility', 'f1000000-0000-4000-8000-000000000004', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000016', 'Music Room Session', 'Book the music room for practice', 'other', 45, NULL, 'facility', 'f1000000-0000-4000-8000-000000000005', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000017', 'Art Studio Time', 'Book the art studio for creative work', 'other', 35, NULL, 'facility', 'f1000000-0000-4000-8000-000000000006', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000018', 'Robotics Lab Session', 'Access the robotics lab', 'other', 60, NULL, 'facility', 'f1000000-0000-4000-8000-000000000007', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000019', 'Computer Lab Access', 'Extra computer lab time', 'other', 25, NULL, 'facility', 'f1000000-0000-4000-8000-000000000008', 'in_stock');

-- Coupon rewards
INSERT INTO rewards_config (id, name, description, category, cost, stock, reward_type, inventory_status) VALUES
  ('e1000000-0000-4000-8000-000000000020', 'Free Lunch Coupon', 'One free lunch at the canteen', 'canteen', 60, 100, 'coupon', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000021', 'Free Juice Coupon', 'One free juice', 'canteen', 15, 200, 'coupon', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000022', 'Free Sandwich Coupon', 'One free sandwich', 'canteen', 20, 150, 'coupon', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000023', 'Free Printing Pass', '10 pages free printing', 'library', 10, 500, 'coupon', 'in_stock'),
  ('e1000000-0000-4000-8000-000000000024', 'Library Day Pass', 'Extended library access for a day', 'library', 20, NULL, 'coupon', 'in_stock');
