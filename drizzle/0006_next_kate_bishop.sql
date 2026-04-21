CREATE TABLE `ig_comment_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`igCommentId` varchar(128) NOT NULL,
	`igPostId` varchar(128) NOT NULL,
	`igUserId` varchar(128) NOT NULL,
	`igUsername` varchar(128),
	`commentText` text NOT NULL,
	`keywordMatched` varchar(128),
	`ruleId` int,
	`status` enum('scanned','matched','dm_sent','dm_failed','skipped') NOT NULL DEFAULT 'scanned',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ig_comment_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `ig_comment_events_igCommentId_unique` UNIQUE(`igCommentId`)
);
--> statement-breakpoint
CREATE TABLE `ig_dm_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`commentEventId` int NOT NULL,
	`igUserId` varchar(128) NOT NULL,
	`igUsername` varchar(128),
	`message` text NOT NULL,
	`success` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ig_dm_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ig_dm_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(128) NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`dmTemplate` text NOT NULL,
	`postFilter` text,
	`matchMode` enum('exact','contains') NOT NULL DEFAULT 'contains',
	`triggerCount` int NOT NULL DEFAULT 0,
	`dmsSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ig_dm_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ig_webhook_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metaAppId` varchar(128),
	`metaAppSecret` text,
	`pageAccessToken` text,
	`verifyToken` varchar(255),
	`webhookActive` int NOT NULL DEFAULT 0,
	`lastEventAt` timestamp,
	`totalEventsReceived` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ig_webhook_config_id` PRIMARY KEY(`id`)
);
