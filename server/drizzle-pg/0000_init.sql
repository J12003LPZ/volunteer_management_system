CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "role" text NOT NULL DEFAULT 'volunteer',
  "volunteer_id" integer,
  "created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "volunteers" (
  "id" serial PRIMARY KEY,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "phone" text,
  "address" text,
  "city" text,
  "state" text,
  "date_of_birth" text,
  "emergency_contact_name" text,
  "emergency_contact_phone" text,
  "skills" text,
  "interests" text,
  "languages" text,
  "availability" text,
  "preferred_days" text,
  "preferred_times" text,
  "previous_experience" text,
  "status" text NOT NULL DEFAULT 'pending',
  "total_hours" real NOT NULL DEFAULT 0,
  "notes" text,
  "avatar_url" text,
  "document_url" text,
  "created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "date" text NOT NULL,
  "start_time" text NOT NULL,
  "end_time" text NOT NULL,
  "location" text,
  "description" text,
  "required_volunteers" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'draft',
  "coordinator" text,
  "notes" text,
  "created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "shifts" (
  "id" serial PRIMARY KEY,
  "event_id" integer NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "date" text NOT NULL,
  "start_time" text NOT NULL,
  "end_time" text NOT NULL,
  "required_volunteers" integer NOT NULL DEFAULT 1,
  "status" text NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS "shift_assignments" (
  "id" serial PRIMARY KEY,
  "shift_id" integer NOT NULL REFERENCES "shifts"("id") ON DELETE CASCADE,
  "volunteer_id" integer NOT NULL REFERENCES "volunteers"("id") ON DELETE CASCADE,
  "created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "attendance" (
  "id" serial PRIMARY KEY,
  "volunteer_id" integer NOT NULL REFERENCES "volunteers"("id") ON DELETE CASCADE,
  "event_id" integer NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "shift_id" integer REFERENCES "shifts"("id") ON DELETE SET NULL,
  "check_in_time" text,
  "check_out_time" text,
  "total_hours" real NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'absent',
  "notes" text
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY,
  "scope" text NOT NULL,
  "recipient_volunteer_id" integer REFERENCES "volunteers"("id") ON DELETE SET NULL,
  "recipient_event_id" integer REFERENCES "events"("id") ON DELETE SET NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "sent_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "settings" (
  "id" serial PRIMARY KEY,
  "organization_name" text NOT NULL DEFAULT 'VolunteerHub',
  "logo_url" text,
  "volunteer_statuses" text NOT NULL DEFAULT '["active","pending","inactive"]',
  "event_categories" text NOT NULL DEFAULT '[]',
  "notifications_enabled" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
  "id" serial PRIMARY KEY,
  "hash" text NOT NULL,
  "created_at" bigint
);
