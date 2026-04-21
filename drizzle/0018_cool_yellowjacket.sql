CREATE TABLE `chronotype_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`email` varchar(320),
	`chronotype` varchar(32) NOT NULL,
	`scoreData` text NOT NULL,
	`personalPlan` text,
	`sleepWindow` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chronotype_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_ab_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`variant` varchar(4) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`productKey` varchar(64) NOT NULL,
	`opened` int NOT NULL DEFAULT 0,
	`clicked` int NOT NULL DEFAULT 0,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_ab_tests_id` PRIMARY KEY(`id`)
);
