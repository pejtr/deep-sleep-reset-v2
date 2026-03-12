CREATE TABLE `email_send_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`dayNumber` int NOT NULL,
	`subject` varchar(500) NOT NULL,
	`success` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`messageId` varchar(255),
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_send_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_sequence_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`orderId` int,
	`stripeSessionId` varchar(255),
	`nextDayToSend` int NOT NULL DEFAULT 1,
	`nextSendAt` timestamp NOT NULL,
	`status` enum('active','completed','unsubscribed','paused') NOT NULL DEFAULT 'active',
	`purchasedUpsell` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_sequence_enrollments_id` PRIMARY KEY(`id`)
);
