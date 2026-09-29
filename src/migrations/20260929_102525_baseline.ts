import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_generator_expenses_expense_type" AS ENUM('oil-change', 'filters', 'parts', 'labor', 'other');
  CREATE TYPE "public"."enum_invoices_line_items_kind" AS ENUM('fixed', 'adhoc');
  CREATE TYPE "public"."enum_invoices_status" AS ENUM('draft', 'generated');
  CREATE TABLE "expenses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer NOT NULL,
  	"description" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"amount" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "diesel_expenses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"price_per_thousand_liters" numeric NOT NULL,
  	"liters" numeric NOT NULL,
  	"price_per_liter" numeric,
  	"date" timestamp(3) with time zone NOT NULL,
  	"total_amount" numeric,
  	"amount_paid" numeric DEFAULT 0,
  	"is_paid" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "generator_expenses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"expense_type" "enum_generator_expenses_expense_type" NOT NULL,
  	"hours" numeric,
  	"amount" numeric NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "generator_hours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"meter_reading" numeric NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"hours_run" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "expense_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "buildings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"address" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone_number" varchar,
  	"building_id" integer NOT NULL,
  	"monthly_fee" numeric NOT NULL,
  	"active" boolean DEFAULT true,
  	"amps_taken" numeric NOT NULL,
  	"building_fee" numeric,
  	"price_per_amp" numeric,
  	"building_floor" numeric NOT NULL,
  	"past_due_balance" numeric DEFAULT 0,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "invoices_line_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"kind" "enum_invoices_line_items_kind" DEFAULT 'adhoc'
  );
  
  CREATE TABLE "invoices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"building_id" integer,
  	"period_month" numeric NOT NULL,
  	"period_year" numeric NOT NULL,
  	"due_date" timestamp(3) with time zone,
  	"total_amount" numeric,
  	"amount_paid" numeric DEFAULT 0,
  	"is_paid" boolean DEFAULT false,
  	"status" "enum_invoices_status" DEFAULT 'draft',
  	"pdf_file_id" integer,
  	"receipt_file_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "invoice_pdfs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT '.',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "receipt_pdfs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT '.',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expenses_id" integer,
  	"diesel_expenses_id" integer,
  	"generator_expenses_id" integer,
  	"generator_hours_id" integer,
  	"payments_id" integer,
  	"expense_categories_id" integer,
  	"buildings_id" integer,
  	"tenants_id" integer,
  	"invoices_id" integer,
  	"invoice_pdfs_id" integer,
  	"receipt_pdfs_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invoices_line_items" ADD CONSTRAINT "invoices_line_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_pdf_file_id_invoice_pdfs_id_fk" FOREIGN KEY ("pdf_file_id") REFERENCES "public"."invoice_pdfs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_receipt_file_id_receipt_pdfs_id_fk" FOREIGN KEY ("receipt_file_id") REFERENCES "public"."receipt_pdfs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expenses_fk" FOREIGN KEY ("expenses_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diesel_expenses_fk" FOREIGN KEY ("diesel_expenses_id") REFERENCES "public"."diesel_expenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_generator_expenses_fk" FOREIGN KEY ("generator_expenses_id") REFERENCES "public"."generator_expenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_generator_hours_fk" FOREIGN KEY ("generator_hours_id") REFERENCES "public"."generator_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expense_categories_fk" FOREIGN KEY ("expense_categories_id") REFERENCES "public"."expense_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buildings_fk" FOREIGN KEY ("buildings_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY ("invoices_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoice_pdfs_fk" FOREIGN KEY ("invoice_pdfs_id") REFERENCES "public"."invoice_pdfs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_receipt_pdfs_fk" FOREIGN KEY ("receipt_pdfs_id") REFERENCES "public"."receipt_pdfs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category_id");
  CREATE INDEX "expenses_updated_at_idx" ON "expenses" USING btree ("updated_at");
  CREATE INDEX "expenses_created_at_idx" ON "expenses" USING btree ("created_at");
  CREATE INDEX "diesel_expenses_updated_at_idx" ON "diesel_expenses" USING btree ("updated_at");
  CREATE INDEX "diesel_expenses_created_at_idx" ON "diesel_expenses" USING btree ("created_at");
  CREATE INDEX "generator_expenses_updated_at_idx" ON "generator_expenses" USING btree ("updated_at");
  CREATE INDEX "generator_expenses_created_at_idx" ON "generator_expenses" USING btree ("created_at");
  CREATE INDEX "generator_hours_updated_at_idx" ON "generator_hours" USING btree ("updated_at");
  CREATE INDEX "generator_hours_created_at_idx" ON "generator_hours" USING btree ("created_at");
  CREATE INDEX "payments_tenant_idx" ON "payments" USING btree ("tenant_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE UNIQUE INDEX "expense_categories_name_idx" ON "expense_categories" USING btree ("name");
  CREATE INDEX "expense_categories_updated_at_idx" ON "expense_categories" USING btree ("updated_at");
  CREATE INDEX "expense_categories_created_at_idx" ON "expense_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "buildings_name_idx" ON "buildings" USING btree ("name");
  CREATE INDEX "buildings_updated_at_idx" ON "buildings" USING btree ("updated_at");
  CREATE INDEX "buildings_created_at_idx" ON "buildings" USING btree ("created_at");
  CREATE INDEX "tenants_building_idx" ON "tenants" USING btree ("building_id");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE INDEX "invoices_line_items_order_idx" ON "invoices_line_items" USING btree ("_order");
  CREATE INDEX "invoices_line_items_parent_id_idx" ON "invoices_line_items" USING btree ("_parent_id");
  CREATE INDEX "invoices_tenant_idx" ON "invoices" USING btree ("tenant_id");
  CREATE INDEX "invoices_building_idx" ON "invoices" USING btree ("building_id");
  CREATE INDEX "invoices_pdf_file_idx" ON "invoices" USING btree ("pdf_file_id");
  CREATE INDEX "invoices_receipt_file_idx" ON "invoices" USING btree ("receipt_file_id");
  CREATE INDEX "invoices_updated_at_idx" ON "invoices" USING btree ("updated_at");
  CREATE INDEX "invoices_created_at_idx" ON "invoices" USING btree ("created_at");
  CREATE INDEX "invoice_pdfs_updated_at_idx" ON "invoice_pdfs" USING btree ("updated_at");
  CREATE INDEX "invoice_pdfs_created_at_idx" ON "invoice_pdfs" USING btree ("created_at");
  CREATE UNIQUE INDEX "invoice_pdfs_filename_idx" ON "invoice_pdfs" USING btree ("filename");
  CREATE INDEX "receipt_pdfs_updated_at_idx" ON "receipt_pdfs" USING btree ("updated_at");
  CREATE INDEX "receipt_pdfs_created_at_idx" ON "receipt_pdfs" USING btree ("created_at");
  CREATE UNIQUE INDEX "receipt_pdfs_filename_idx" ON "receipt_pdfs" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_expenses_id_idx" ON "payload_locked_documents_rels" USING btree ("expenses_id");
  CREATE INDEX "payload_locked_documents_rels_diesel_expenses_id_idx" ON "payload_locked_documents_rels" USING btree ("diesel_expenses_id");
  CREATE INDEX "payload_locked_documents_rels_generator_expenses_id_idx" ON "payload_locked_documents_rels" USING btree ("generator_expenses_id");
  CREATE INDEX "payload_locked_documents_rels_generator_hours_id_idx" ON "payload_locked_documents_rels" USING btree ("generator_hours_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_expense_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("expense_categories_id");
  CREATE INDEX "payload_locked_documents_rels_buildings_id_idx" ON "payload_locked_documents_rels" USING btree ("buildings_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_invoices_id_idx" ON "payload_locked_documents_rels" USING btree ("invoices_id");
  CREATE INDEX "payload_locked_documents_rels_invoice_pdfs_id_idx" ON "payload_locked_documents_rels" USING btree ("invoice_pdfs_id");
  CREATE INDEX "payload_locked_documents_rels_receipt_pdfs_id_idx" ON "payload_locked_documents_rels" USING btree ("receipt_pdfs_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "expenses" CASCADE;
  DROP TABLE "diesel_expenses" CASCADE;
  DROP TABLE "generator_expenses" CASCADE;
  DROP TABLE "generator_hours" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "expense_categories" CASCADE;
  DROP TABLE "buildings" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "invoices_line_items" CASCADE;
  DROP TABLE "invoices" CASCADE;
  DROP TABLE "invoice_pdfs" CASCADE;
  DROP TABLE "receipt_pdfs" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_generator_expenses_expense_type";
  DROP TYPE "public"."enum_invoices_line_items_kind";
  DROP TYPE "public"."enum_invoices_status";`)
}
