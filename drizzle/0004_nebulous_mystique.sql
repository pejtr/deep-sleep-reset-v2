CREATE TABLE `member_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`contentType` enum('guide','audio','video','report','bonus') NOT NULL,
	`tier` enum('basic','pro','elite') NOT NULL,
	`downloadUrl` text,
	`month` varchar(7) NOT NULL,
	`chronotype` enum('lion','bear','wolf','dolphin'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `member_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`stripeCustomerId` varchar(256),
	`stripeSubscriptionId` varchar(256),
	`tier` enum('basic','pro','elite') NOT NULL,
	`status` enum('active','canceled','past_due','trialing') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`canceledAt` timestamp,
	`chronotype` enum('lion','bear','wolf','dolphin'),
	`source` varchar(50) DEFAULT 'funnel',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
