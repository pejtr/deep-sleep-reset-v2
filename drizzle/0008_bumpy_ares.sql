CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`enrollmentId` int,
	`rating` int,
	`body` text,
	`nightsToResult` int,
	`consentToPublish` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`featured` int NOT NULL DEFAULT 0,
	`adminNote` text,
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`),
	CONSTRAINT `testimonials_token_unique` UNIQUE(`token`)
);
