CREATE TABLE `ig_ab_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postAId` int NOT NULL,
	`postBId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`status` enum('running','completed','cancelled') NOT NULL DEFAULT 'running',
	`winner` enum('a','b','tie'),
	`engagementA` int,
	`engagementB` int,
	`evaluateAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ig_ab_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ig_hashtag_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hashtag` varchar(128) NOT NULL,
	`timesUsed` int NOT NULL DEFAULT 0,
	`avgReach` int NOT NULL DEFAULT 0,
	`avgEngagementRate` int NOT NULL DEFAULT 0,
	`totalReach` bigint NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ig_hashtag_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `ig_hashtag_stats_hashtag_unique` UNIQUE(`hashtag`)
);
--> statement-breakpoint
CREATE TABLE `ig_repost_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalPostId` int NOT NULL,
	`repostId` int,
	`qualifyingEngagementRate` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('pending','published','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ig_repost_queue_id` PRIMARY KEY(`id`)
);
