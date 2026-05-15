CREATE TYPE "public"."participant_status" AS ENUM('pending', 'approved', 'rejected', 'participant', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."staff_type" AS ENUM('teacher', 'tutor');--> statement-breakpoint
CREATE TYPE "public"."workshop_status" AS ENUM('planned', 'in_progress', 'finished', 'cancelled');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"date" date NOT NULL,
	"is_present" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"certificate_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_certificate_code_unique" UNIQUE("certificate_code")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"type" "staff_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"document" text,
	"birth_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "participant_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"theme" text NOT NULL,
	"image_url" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"workload" integer NOT NULL,
	"status" "workshop_status" DEFAULT 'planned' NOT NULL,
	"vacancies" integer,
	"is_public" boolean DEFAULT true NOT NULL,
	"show_participants" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workshops_workload_positive" CHECK ("workshops"."workload" > 0),
	CONSTRAINT "workshops_vacancies_positive" CHECK ("workshops"."vacancies" is null or "workshops"."vacancies" > 0)
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_participants" ADD CONSTRAINT "workshop_participants_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_participants" ADD CONSTRAINT "workshop_participants_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_staff" ADD CONSTRAINT "workshop_staff_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_staff" ADD CONSTRAINT "workshop_staff_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_unique_idx" ON "attendance" USING btree ("workshop_id","student_id","date");--> statement-breakpoint
CREATE INDEX "attendance_workshop_id_idx" ON "attendance" USING btree ("workshop_id");--> statement-breakpoint
CREATE INDEX "attendance_student_id_idx" ON "attendance" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_workshop_student_unique_idx" ON "certificates" USING btree ("workshop_id","student_id");--> statement-breakpoint
CREATE INDEX "certificates_workshop_id_idx" ON "certificates" USING btree ("workshop_id");--> statement-breakpoint
CREATE INDEX "certificates_student_id_idx" ON "certificates" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "staff_admin_id_idx" ON "staff" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "staff_admin_type_idx" ON "staff" USING btree ("admin_id","type");--> statement-breakpoint
CREATE INDEX "students_admin_id_idx" ON "students" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "students_admin_email_idx" ON "students" USING btree ("admin_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "workshop_participants_unique_idx" ON "workshop_participants" USING btree ("workshop_id","student_id");--> statement-breakpoint
CREATE INDEX "workshop_participants_workshop_status_idx" ON "workshop_participants" USING btree ("workshop_id","status");--> statement-breakpoint
CREATE INDEX "workshop_participants_student_id_idx" ON "workshop_participants" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workshop_staff_unique_idx" ON "workshop_staff" USING btree ("workshop_id","staff_id");--> statement-breakpoint
CREATE INDEX "workshop_staff_workshop_id_idx" ON "workshop_staff" USING btree ("workshop_id");--> statement-breakpoint
CREATE INDEX "workshop_staff_staff_id_idx" ON "workshop_staff" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "workshops_admin_id_idx" ON "workshops" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "workshops_public_status_idx" ON "workshops" USING btree ("is_public","status");