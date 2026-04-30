-- Migration: Add card_expiry and mp_card_token columns to billing_profiles
-- Priority 4: These columns store masked card expiry and the MP card token ID
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- Add card_expiry (masked MM/YY for display only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='billing_profiles' AND column_name='card_expiry'
  ) THEN
    ALTER TABLE public.billing_profiles ADD COLUMN card_expiry TEXT;
    COMMENT ON COLUMN public.billing_profiles.card_expiry IS 'Masked card expiry in MM/YY format for display only';
  END IF;
END $$;

-- Add mp_card_token (MP card ID associated to the MP Customer — NOT a raw card number)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='billing_profiles' AND column_name='mp_card_token'
  ) THEN
    ALTER TABLE public.billing_profiles ADD COLUMN mp_card_token TEXT;
    COMMENT ON COLUMN public.billing_profiles.mp_card_token IS 'MercadoPago card ID from /v1/customers/{id}/cards — NOT a raw card token';
  END IF;
END $$;

-- Add updated_at if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='billing_profiles' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.billing_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'billing_profiles'
ORDER BY ordinal_position;
