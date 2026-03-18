CREATE TABLE "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"guesses" integer NOT NULL,
	"user_ip" text,
	"created_at" timestamp DEFAULT now()
);
