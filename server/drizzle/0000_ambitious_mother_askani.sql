CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`volunteer_id` integer NOT NULL,
	`event_id` integer NOT NULL,
	`shift_id` integer,
	`check_in_time` text,
	`check_out_time` text,
	`total_hours` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'absent' NOT NULL,
	`notes` text,
	FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`location` text,
	`description` text,
	`required_volunteers` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`coordinator` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`recipient_volunteer_id` integer,
	`recipient_event_id` integer,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`sent_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`recipient_volunteer_id`) REFERENCES `volunteers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`recipient_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_name` text DEFAULT 'VolunteerHub' NOT NULL,
	`logo_url` text,
	`volunteer_statuses` text DEFAULT '["active","pending","inactive"]' NOT NULL,
	`event_categories` text DEFAULT '[]' NOT NULL,
	`notifications_enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shift_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shift_id` integer NOT NULL,
	`volunteer_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`required_volunteers` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'volunteer' NOT NULL,
	`volunteer_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `volunteers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`address` text,
	`city` text,
	`state` text,
	`date_of_birth` text,
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`skills` text,
	`interests` text,
	`languages` text,
	`availability` text,
	`preferred_days` text,
	`preferred_times` text,
	`previous_experience` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_hours` real DEFAULT 0 NOT NULL,
	`notes` text,
	`avatar_url` text,
	`document_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `volunteers_email_unique` ON `volunteers` (`email`);