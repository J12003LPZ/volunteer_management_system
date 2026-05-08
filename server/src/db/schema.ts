import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'volunteer'] }).notNull().default('volunteer'),
  volunteerId: integer('volunteer_id'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const volunteers = sqliteTable('volunteers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  dateOfBirth: text('date_of_birth'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  skills: text('skills'),
  interests: text('interests'),
  languages: text('languages'),
  availability: text('availability'),
  preferredDays: text('preferred_days'),
  preferredTimes: text('preferred_times'),
  previousExperience: text('previous_experience'),
  status: text('status', { enum: ['active', 'pending', 'inactive'] }).notNull().default('pending'),
  totalHours: real('total_hours').notNull().default(0),
  notes: text('notes'),
  avatarUrl: text('avatar_url'),
  documentUrl: text('document_url'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  location: text('location'),
  description: text('description'),
  requiredVolunteers: integer('required_volunteers').notNull().default(0),
  status: text('status', { enum: ['draft', 'open', 'full', 'completed', 'cancelled'] }).notNull().default('draft'),
  coordinator: text('coordinator'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const shifts = sqliteTable('shifts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  requiredVolunteers: integer('required_volunteers').notNull().default(1),
  status: text('status', { enum: ['open', 'full', 'completed', 'cancelled'] }).notNull().default('open'),
});

export const shiftAssignments = sqliteTable('shift_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shiftId: integer('shift_id').notNull().references(() => shifts.id, { onDelete: 'cascade' }),
  volunteerId: integer('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  volunteerId: integer('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  shiftId: integer('shift_id').references(() => shifts.id, { onDelete: 'set null' }),
  checkInTime: text('check_in_time'),
  checkOutTime: text('check_out_time'),
  totalHours: real('total_hours').notNull().default(0),
  status: text('status', { enum: ['present', 'absent', 'late', 'excused'] }).notNull().default('absent'),
  notes: text('notes'),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scope: text('scope', { enum: ['individual', 'event', 'all'] }).notNull(),
  recipientVolunteerId: integer('recipient_volunteer_id').references(() => volunteers.id, { onDelete: 'set null' }),
  recipientEventId: integer('recipient_event_id').references(() => events.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  sentAt: text('sent_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationName: text('organization_name').notNull().default('VolunteerHub'),
  logoUrl: text('logo_url'),
  volunteerStatuses: text('volunteer_statuses').notNull().default('["active","pending","inactive"]'),
  eventCategories: text('event_categories').notNull().default('[]'),
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
});
