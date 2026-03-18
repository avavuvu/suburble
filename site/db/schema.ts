import { pgTable, serial, date, integer, text, timestamp } from "drizzle-orm/pg-core";

export const scores = pgTable("scores", {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    guesses: integer("guesses").notNull(),
    userIp: text("user_ip"),
    createdAt: timestamp("created_at").defaultNow(),
});