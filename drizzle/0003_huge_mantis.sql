CREATE TABLE `chat_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`email` varchar(320),
	`sleepIssue` varchar(128),
	`objection` varchar(255),
	`intentLevel` enum('low','medium','high') NOT NULL DEFAULT 'low',
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`email` varchar(320),
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_surveys_id` PRIMARY KEY(`id`)
);
