CREATE TABLE `contentHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentItemId` int NOT NULL,
	`progressPercent` int NOT NULL DEFAULT 0,
	`completed` int NOT NULL DEFAULT 0,
	`lastViewedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(160) NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`contentType` enum('tip','audio','video','checkin') NOT NULL,
	`mediaUrl` varchar(1024),
	`dayNumber` int NOT NULL DEFAULT 1,
	`isPremium` int NOT NULL DEFAULT 1,
	`isPublished` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentItems_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `emailJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`eventType` enum('signup','purchase','funnel','checkin') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`status` enum('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
	`retryCount` int NOT NULL DEFAULT 0,
	`nextAttemptAt` timestamp NOT NULL DEFAULT (now()),
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnelEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320),
	`eventType` enum('landing_view','checkout_started','checkout_completed','signup','login','content_view','checkin') NOT NULL,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnelEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `programProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('locked','active','completed') NOT NULL DEFAULT 'locked',
	`currentDay` int NOT NULL DEFAULT 1,
	`completedDays` int NOT NULL DEFAULT 0,
	`streakDays` int NOT NULL DEFAULT 0,
	`lastCheckInAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `programProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productKey` varchar(64) NOT NULL,
	`purchaseType` enum('one_time','subscription') NOT NULL DEFAULT 'subscription',
	`status` enum('pending','paid','active','canceled','refunded') NOT NULL DEFAULT 'pending',
	`stripeCheckoutSessionId` varchar(128),
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`stripePaymentIntentId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchases_stripeCheckoutSessionId_unique` UNIQUE(`stripeCheckoutSessionId`),
	CONSTRAINT `purchases_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`),
	CONSTRAINT `purchases_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `qaChecklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` enum('pending','pass','fail') NOT NULL DEFAULT 'pending',
	`notes` text,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qaChecklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(128);