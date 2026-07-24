-- ============================================================================
-- Migration 021: Campus Coins Rewards System
-- Students earn coins for achievements and redeem them for rewards.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Coin transaction type enum
-- ────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE coin_tx_type AS ENUM (
    'earn_attendance',
    'earn_homework',
    'earn_competition',
    'earn_club',
    'earn_sports',
    'earn_behaviour',
    'earn_bonus',
    'redeem_reward',
    'admin_adjust'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Rewards catalogue
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rewards_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('canteen', 'library', 'sports', 'merchandise', 'event_ticket', 'other')),
  cost INTEGER NOT NULL CHECK (cost > 0),
  stock INTEGER DEFAULT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Student coin balance (one row per student, upserted)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_balance (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Coin transaction ledger (immutable: never updated or deleted)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tx_type coin_tx_type NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  direction TEXT NOT NULL CHECK (direction IN ('earn', 'spend')),
  description TEXT NOT NULL,
  reference_id TEXT,
  created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_student ON coin_transactions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_tx_type ON coin_transactions(tx_type);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Reward redemptions (unique constraint per student+reward to prevent dupes)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards_config(id) ON DELETE RESTRICT,
  coin_tx_id UUID NOT NULL REFERENCES coin_transactions(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
  redeemed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (student_id, reward_id, status)
);

CREATE INDEX IF NOT EXISTS idx_redemptions_student ON redemptions(student_id, redeemed_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE rewards_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read rewards catalogue
CREATE POLICY "rewards_config_select" ON rewards_config FOR SELECT USING (true);

-- Students see own balance; teachers/admins see all
CREATE POLICY "student_balance_select" ON student_balance FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- Students see own transactions; teachers/admins see all
CREATE POLICY "coin_transactions_select" ON coin_transactions FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- Students see own redemptions; teachers/admins see all
CREATE POLICY "redemptions_select" ON redemptions FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- Teachers and admins can write
CREATE POLICY "rewards_config_insert" ON rewards_config FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);
CREATE POLICY "rewards_config_update" ON rewards_config FOR UPDATE USING (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- ════════════════════════════════════════════════════════════════════════════
-- Functions
-- ════════════════════════════════════════════════════════════════════════════

-- Atomically earn coins: upsert balance + insert transaction
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

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_new_balance);
END;
$$;

-- Atomically redeem reward: check balance, deduct, insert redemption
CREATE OR REPLACE FUNCTION redeem_reward(
  p_student_id UUID,
  p_reward_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_cost INTEGER;
  v_reward_name TEXT;
  v_current_balance INTEGER;
  v_tx_id UUID;
  v_redemption_id UUID;
  v_new_balance INTEGER;
BEGIN
  -- Get reward cost
  SELECT cost, name INTO v_cost, v_reward_name
  FROM rewards_config WHERE id = p_reward_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or inactive');
  END IF;

  -- Check duplicate redemption
  IF EXISTS (
    SELECT 1 FROM redemptions
    WHERE student_id = p_student_id AND reward_id = p_reward_id AND status = 'completed'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already redeemed this reward');
  END IF;

  -- Check stock
  IF EXISTS (
    SELECT 1 FROM rewards_config
    WHERE id = p_reward_id AND stock IS NOT NULL AND stock <= 0
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward out of stock');
  END IF;

  -- Get current balance
  SELECT balance INTO v_current_balance FROM student_balance WHERE student_id = p_student_id;
  IF v_current_balance IS NULL OR v_current_balance < v_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;

  -- Create spend transaction
  INSERT INTO coin_transactions (student_id, tx_type, amount, direction, description)
  VALUES (p_student_id, 'redeem_reward', v_cost, 'spend', 'Redeemed: ' || v_reward_name)
  RETURNING id INTO v_tx_id;

  -- Deduct balance
  UPDATE student_balance SET
    balance = balance - v_cost,
    lifetime_spent = lifetime_spent + v_cost,
    updated_at = now()
  WHERE student_id = p_student_id
  RETURNING balance INTO v_new_balance;

  -- Decrement stock if applicable
  UPDATE rewards_config SET stock = stock - 1
  WHERE id = p_reward_id AND stock IS NOT NULL;

  -- Create redemption record
  INSERT INTO redemptions (student_id, reward_id, coin_tx_id, status)
  VALUES (p_student_id, p_reward_id, v_tx_id, 'completed')
  RETURNING id INTO v_redemption_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'redemption_id', v_redemption_id,
    'new_balance', v_new_balance
  );
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- Seed Data
-- ════════════════════════════════════════════════════════════════════════════

-- Rewards catalogue
INSERT INTO rewards_config (id, name, description, category, cost, stock, is_active) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'Free Canteen Meal', 'One free meal at the school canteen', 'canteen', 50, 100, true),
  ('e1000000-0000-4000-8000-000000000002', 'Canteen Snack Pack', 'A snack pack of your choice', 'canteen', 25, 200, true),
  ('e1000000-0000-4000-8000-000000000003', 'Extended Library Time', 'Extra 30 minutes in the library', 'library', 30, NULL, true),
  ('e1000000-0000-4000-8000-000000000004', 'Library Book Pick', 'Choose a book for the library in your name', 'library', 100, 10, true),
  ('e1000000-0000-4000-8000-000000000005', 'Sports Field Pass', 'Extended access to sports facilities', 'sports', 40, NULL, true),
  ('e1000000-0000-4000-8000-000000000006', 'Sports Equipment Rental', 'Free rental of sports equipment for a day', 'sports', 35, 50, true),
  ('e1000000-0000-4000-8000-000000000007', 'School T-Shirt', 'Official school T-shirt', 'merchandise', 150, 30, true),
  ('e1000000-0000-4000-8000-000000000008', 'School Water Bottle', 'Exclusive school-branded water bottle', 'merchandise', 75, 50, true),
  ('e1000000-0000-4000-8000-000000000009', 'School Notebook Set', 'Set of 5 school-branded notebooks', 'merchandise', 60, 80, true),
  ('e1000000-0000-4000-8000-000000000010', 'School Event Pass', 'VIP pass for the next school event', 'event_ticket', 120, 20, true),
  ('e1000000-0000-4000-8000-000000000011', 'Science Fair Entry', 'Free entry to the Science Fair', 'event_ticket', 80, 40, true),
  ('e1000000-0000-4000-8000-000000000012', 'Sports Day Pass', 'Special access to Sports Day events', 'event_ticket', 90, 25, true);

-- Initial balances and sample transactions for seeded students
DO $$
DECLARE
  student_uuids UUID[] := ARRAY[
    'b1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000005',
    'b1000000-0000-4000-8000-000000000006',
    'b1000000-0000-4000-8000-000000000007',
    'b1000000-0000-4000-8000-000000000008',
    'b1000000-0000-4000-8000-000000000009',
    'b1000000-0000-4000-8000-000000000010',
    'b1000000-0000-4000-8000-000000000011',
    'b1000000-0000-4000-8000-000000000012',
    'b1000000-0000-4000-8000-000000000013',
    'b1000000-0000-4000-8000-000000000014',
    'b1000000-0000-4000-8000-000000000015'
  ];
  sid UUID;
  initial_coins INTEGER;
BEGIN
  FOREACH sid IN ARRAY student_uuids LOOP
    initial_coins := 50 + floor(random() * 200)::int;

    INSERT INTO student_balance (student_id, balance, lifetime_earned, lifetime_spent)
    VALUES (sid, initial_coins, initial_coins + 20, 0);

    INSERT INTO coin_transactions (student_id, tx_type, amount, direction, description)
    VALUES (sid, 'earn_attendance', floor(random() * 30 + 10)::int, 'earn', 'Perfect attendance week bonus');
  END LOOP;

  INSERT INTO coin_transactions (student_id, tx_type, amount, direction, description)
  VALUES
    ('b1000000-0000-4000-8000-000000000001', 'earn_homework', 15, 'earn', 'All homework submitted on time'),
    ('b1000000-0000-4000-8000-000000000001', 'earn_competition', 50, 'earn', 'First place in Math Olympiad'),
    ('b1000000-0000-4000-8000-000000000002', 'earn_behaviour', 20, 'earn', 'Positive behaviour recognition'),
    ('b1000000-0000-4000-8000-000000000003', 'earn_sports', 30, 'earn', 'Won inter-school football match'),
    ('b1000000-0000-4000-8000-000000000006', 'earn_club', 25, 'earn', 'Active participation in Robotics Club'),
    ('b1000000-0000-4000-8000-000000000010', 'earn_attendance', 40, 'earn', 'Month of perfect attendance'),
    ('b1000000-0000-4000-8000-000000000011', 'earn_competition', 75, 'earn', 'First place in Science Fair'),
    ('b1000000-0000-4000-8000-000000000013', 'earn_behaviour', 30, 'earn', 'Helped organize school event');
END $$;
