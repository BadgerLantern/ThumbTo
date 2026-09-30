import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';

export const creators = pgTable('creators', {
  id: uuid('id').defaultRandom().primaryKey(),
  handle: text('handle').notNull().unique(), // e.g. "alex" -> thumb.to/@alex
  displayName: text('display_name').notNull(),
  bio: text('bio').default(''),
  avatarUrl: text('avatar_url').default(''),
  accentColor: text('accent_color').default('#FF4B4B'),
  stripeAccountId: text('stripe_account_id'),
  isLive: boolean('is_live').default(false).notNull(),
  activePollId: uuid('active_poll_id'),
  hypeScore: integer('hype_score').default(0).notNull(),
  overlayToken: text('overlay_token').notNull().unique(), // Secret token for OBS browser source
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const creatorLinks = pgTable('creator_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => creators.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  icon: text('icon').default('link').notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const polls = pgTable('polls', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => creators.id, { onDelete: 'cascade' }).notNull(),
  question: text('question').notNull(),
  // Array of options: [{ id: 0, text: "Pizza", votes: 42 }, { id: 1, text: "Tacos", votes: 38 }]
  options: jsonb('options').$type<Array<{ id: number; text: string; votes: number }>>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  totalVotes: integer('total_votes').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  pollId: uuid('poll_id').references(() => polls.id, { onDelete: 'cascade' }).notNull(),
  optionId: integer('option_id').notNull(),
  voterSessionId: text('voter_session_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tips = pgTable('tips', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => creators.id, { onDelete: 'cascade' }).notNull(),
  amountCents: integer('amount_cents').notNull(), // e.g. 500 = $5.00
  currency: text('currency').default('usd').notNull(),
  supporterName: text('supporter_name').default('Anonymous').notNull(),
  message: text('message').default(''),
  isSuperThumb: boolean('is_super_thumb').default(false).notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  status: text('status').default('pending').notNull(), // pending, completed, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
