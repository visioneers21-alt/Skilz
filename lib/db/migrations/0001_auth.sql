-- Auth tables for SKILZ (run against Neon PostgreSQL)
-- Usage: psql $DATABASE_URL -f lib/db/migrations/0001_auth.sql

ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_email_unique" UNIQUE ("email");

CREATE TABLE IF NOT EXISTS "guest_usage" (
  "id" uuid PRIMARY KEY NOT NULL,
  "tries_used" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "otp_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "code_hash" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "otp_codes_email_idx" ON "otp_codes" ("email");
