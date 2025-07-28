import { pgTable, serial, text, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user']);
//this is the schema for the chats table
// it contains the id, pdfName and pdfUrl
export const chats = pgTable('chats',{
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: varchar('user_id', { length: 256 }).notNull(),
    fileKey: text('file_key').notNull(),
})

export type DrizzleChat = typeof chats.$inferSelect;

export const message = pgTable('message', {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').references(() => chats.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    role: userSystemEnum('role').notNull(),
})