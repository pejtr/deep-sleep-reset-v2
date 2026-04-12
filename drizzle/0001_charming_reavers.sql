CREATE TABLE `ab_test_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testName` varchar(100) NOT NULL,
	`variant` varchar(10) NOT NULL,
	`eventType` enum('impression','click','conversion') NOT NULL,
	`sessionId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_test_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`chronotype` enum('lion','bear','wolf','dolphin'),
	`source` varchar(50) DEFAULT 'quiz_result',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeSessionId` varchar(256),
	`stripePaymentIntentId` varchar(256),
	`product` enum('tripwire','oto1','oto2','oto3') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'usd',
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`chronotype` enum('lion','bear','wolf','dolphin'),
	`email` varchar(320),
	`sessionId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128),
	`chronotype` enum('lion','bear','wolf','dolphin') NOT NULL,
	`answers` text,
	`email` varchar(320),
	`source` varchar(50) DEFAULT 'organic',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_results_id` PRIMARY KEY(`id`)
);
