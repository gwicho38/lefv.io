import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';

// Create an enum for migration direction
export const MigrationDirection = {
    Up: 'up',
    Down: 'down',
} as const;

export type MigrationType = typeof MigrationDirection[keyof typeof MigrationDirection];

// Schema definitions
export const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull()
});

export const postTags = pgTable('post_tags', {
    postId: uuid('post_id').references(() => posts.id).notNull(),
    tagId: uuid('tag_id').references(() => tags.id).notNull()
}, (table) => ({
    pk: primaryKey(table.postId, table.tagId)
}));

// Migration functions
export async function up(db: any) {
    // Add unique constraint to posts.title
    await db.execute(
        sql`ALTER TABLE posts ADD CONSTRAINT unique_post_title UNIQUE(title)`
    );

    // Add unique constraint to tags.name
    await db.execute(
        sql`ALTER TABLE tags ADD CONSTRAINT unique_tag_name UNIQUE(name)`
    );

    // Create indexes for better performance
    await db.execute(
        sql`CREATE INDEX idx_posts_created_at ON posts(created_at)`
    );

    await db.execute(
        sql`CREATE INDEX idx_posts_updated_at ON posts(updated_at)`
    );

    await db.execute(
        sql`CREATE INDEX idx_post_tags_post_id ON post_tags(post_id)`
    );

    await db.execute(
        sql`CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id)`
    );
}

export async function down(db: any) {
    // Remove indexes
    await db.execute(sql`DROP INDEX IF EXISTS idx_post_tags_tag_id`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_post_tags_post_id`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_posts_updated_at`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_posts_created_at`);

    // Remove unique constraints
    await db.execute(
        sql`ALTER TABLE tags DROP CONSTRAINT IF EXISTS unique_tag_name`
    );

    await db.execute(
        sql`ALTER TABLE posts DROP CONSTRAINT IF EXISTS unique_post_title`
    );
}

// Migration metadata
export const meta = {
    name: '001_add_constraints_and_indexes',
    created: new Date('2025-02-10'),
    hash: '7a8b9c0d1e2f3g4h', // You should generate a unique hash
    description: 'Adds unique constraints and performance indexes to blog schema'
} as const;