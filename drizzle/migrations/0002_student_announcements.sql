CREATE TABLE IF NOT EXISTS "student_announcements" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE restrict,
  "school_id" text,
  "class_id" text,
  "origin" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "author_name" text NOT NULL,
  "priority" text DEFAULT 'media' NOT NULL,
  "requires_confirmation" boolean DEFAULT false NOT NULL,
  "published_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp,
  "created_by" text REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "student_announcement_reads" (
  "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE restrict,
  "announcement_id" text NOT NULL REFERENCES "student_announcements"("id") ON DELETE cascade,
  "student_id" text NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "read_at" timestamp DEFAULT now() NOT NULL,
  "confirmed_at" timestamp,
  CONSTRAINT "student_announcement_reads_announcement_id_student_id_pk" PRIMARY KEY("announcement_id","student_id")
);

CREATE INDEX IF NOT EXISTS "student_announcements_tenant_idx"
  ON "student_announcements" ("tenant_id");

CREATE INDEX IF NOT EXISTS "student_announcements_scope_idx"
  ON "student_announcements" ("tenant_id", "school_id", "class_id");

CREATE INDEX IF NOT EXISTS "student_announcements_published_idx"
  ON "student_announcements" ("published_at");

CREATE INDEX IF NOT EXISTS "student_announcement_reads_tenant_idx"
  ON "student_announcement_reads" ("tenant_id");

CREATE INDEX IF NOT EXISTS "student_announcement_reads_student_idx"
  ON "student_announcement_reads" ("student_id");
