-- Migration 026: Community counter helper functions for atomic increments/decrements
-- These wrap the read-then-update pattern into atomic database functions.

CREATE OR REPLACE FUNCTION increment(row_id UUID, table_name TEXT, column_name TEXT, amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
BEGIN
  EXECUTE format('SELECT COALESCE(%I, 0) FROM %I WHERE id = $1', column_name, table_name)
    INTO current_val USING row_id;
  new_val := current_val + amount;
  EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, column_name)
    USING new_val, row_id;
  RETURN new_val;
END;
$$;

CREATE OR REPLACE FUNCTION decrement(row_id UUID, table_name TEXT, column_name TEXT, amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
BEGIN
  EXECUTE format('SELECT COALESCE(%I, 0) FROM %I WHERE id = $1', column_name, table_name)
    INTO current_val USING row_id;
  new_val := GREATEST(0, current_val - amount);
  EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, column_name)
    USING new_val, row_id;
  RETURN new_val;
END;
$$;
