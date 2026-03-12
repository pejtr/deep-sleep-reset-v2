CREATE TABLE `ig_autopilot_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`postTimeUtc` varchar(5) NOT NULL DEFAULT '09:00',
	`storyTimeUtc` varchar(5) NOT NULL DEFAULT '17:00',
	`contentTone` enum('educational','emotional','promotional','mixed') NOT NULL DEFAULT 'mixed',
	`topicRotation` text,
	`autoPublish` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ig_autopilot_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ig_post_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduledPostId` int NOT NULL,
	`igPostId` varchar(128) NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`comments` int NOT NULL DEFAULT 0,
	`reach` int NOT NULL DEFAULT 0,
	`impressions` int NOT NULL DEFAULT 0,
	`saves` int NOT NULL DEFAULT 0,
	`shares` int NOT NULL DEFAULT 0,
	`profileVisits` int NOT NULL DEFAULT 0,
	`websiteClicks` int NOT NULL DEFAULT 0,
	`engagementRate` int NOT NULL DEFAULT 0,
	`topic` varchar(255),
	`postType` enum('post','story') NOT NULL,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ig_post_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ig_scheduled_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('post','story') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`caption` text,
	`imagePrompt` text,
	`imageUrl` text,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('pending','published','failed','cancelled') NOT NULL DEFAULT 'pending',
	`igPostId` varchar(128),
	`igPermalink` text,
	`errorMessage` text,
	`performanceScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ig_scheduled_posts_id` PRIMARY KEY(`id`)
);
