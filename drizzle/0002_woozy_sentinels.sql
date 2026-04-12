CREATE TABLE `scheduled_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` text,
	`chronotype` varchar(20) NOT NULL,
	`day` int NOT NULL,
	`sendAt` timestamp NOT NULL,
	`sentAt` timestamp,
	`status` enum('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_emails_id` PRIMARY KEY(`id`)
);
