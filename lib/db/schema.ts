// Drizzle ORM schema for SKILZ — ready for Neon PostgreSQL.
//
// The app currently runs on a client-side mock data layer (lib/data/store).
// When Neon is connected (DATABASE_URL set), these tables back the same domain
// model. Note the deliberate design decision: we store the *evidence* behind
// every skill assessment, not just a score, so SKILZ can always explain
// "why do you think I have this skill?".
//
// This file is intentionally import-light so it can be introspected without a
// live database. Wire it up with `drizzle-orm/neon-http` in lib/db/index.ts.

import {
  pgTable,
  uuid,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique(),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Links a user to an OAuth provider account (Google, etc.).
export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('oauth_accounts_provider_account_idx').on(
      table.provider,
      table.providerAccountId,
    ),
  ],
)

// Tracks free AI tries for anonymous visitors (cookie id → row).
export const guestUsage = pgTable('guest_usage', {
  id: uuid('id').primaryKey(),
  triesUsed: integer('tries_used').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Email OTP codes for passwordless sign-in.
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Server-side sessions (token hash stored; raw token lives in httpOnly cookie).
export const authSessions = pgTable('auth_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  ageRange: text('age_range'),
  education: text('education'),
  interests: jsonb('interests').$type<string[]>().default([]),
  goal: text('goal'),
  interactionPreference: text('interaction_preference').default('text'),
  onboarded: boolean('onboarded').default(false),
})

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Global catalog of skills SKILZ can identify.
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
})

// A user's relationship to a skill — the hypothesis and its lifecycle stage.
export const userSkills = pgTable('user_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  skillSlug: text('skill_slug').notNull(),
  name: text('name').notNull(),
  summary: text('summary'),
  stage: text('stage').notNull().default('discovered'),
  statusLabel: text('status_label'),
  confidence: text('confidence'),
  confidenceScore: doublePrecision('confidence_score'),
  reasoning: text('reasoning'),
  developmentAreas: jsonb('development_areas').$type<string[]>().default([]),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// The evidence trail — the reason we store more than a percentage.
export const skillEvidence = pgTable('skill_evidence', {
  id: uuid('id').defaultRandom().primaryKey(),
  userSkillId: uuid('user_skill_id')
    .references(() => userSkills.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull(),
  source: text('source').notNull(), // conversation | challenge
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const challenges = pgTable('challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  skillSlug: text('skill_slug').notNull(),
  title: text('title').notNull(),
  prompt: text('prompt').notNull(),
  goal: text('goal'),
})

export const challengeAttempts = pgTable('challenge_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  challengeSlug: text('challenge_slug').notNull(),
  skillSlug: text('skill_slug').notNull(),
  response: text('response'),
  mode: text('mode'),
  strengths: jsonb('strengths').$type<string[]>().default([]),
  improvements: jsonb('improvements').$type<string[]>().default([]),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const developmentPlans = pgTable('development_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  focusSkillSlug: text('focus_skill_slug'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const planItems = pgTable('plan_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id')
    .references(() => developmentPlans.id, { onDelete: 'cascade' })
    .notNull(),
  skillSlug: text('skill_slug'),
  skillName: text('skill_name'),
  title: text('title').notNull(),
  detail: text('detail'),
  estimatedTime: text('estimated_time'),
  bucket: text('bucket'),
  status: text('status').default('todo'),
  sortOrder: integer('sort_order').default(0),
})

export const progressEvents = pgTable('progress_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  detail: text('detail'),
  type: text('type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  skillSlug: text('skill_slug'),
  title: text('title').notNull(),
  detail: text('detail'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
