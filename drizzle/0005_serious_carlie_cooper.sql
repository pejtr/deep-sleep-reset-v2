CREATE TABLE `content_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('reel_script','email','instagram','facebook','tiktok','blog','ad_copy') NOT NULL,
	`prompt` text NOT NULL,
	`content` text NOT NULL,
	`chronotype` enum('lion','bear','wolf','dolphin'),
	`generatedBy` enum('manual','cron') NOT NULL DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_history_id` PRIMARY KEY(`id`)
);
