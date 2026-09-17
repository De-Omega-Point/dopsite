CREATE TABLE `visibility_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`business_url` text NOT NULL,
	`business_name` text NOT NULL,
	`category` text NOT NULL,
	`location` text NOT NULL,
	`score` integer NOT NULL,
	`created_at` integer NOT NULL
);
