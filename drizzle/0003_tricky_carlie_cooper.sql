CREATE TABLE `ab_test_weights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testName` varchar(100) NOT NULL,
	`variant` varchar(10) NOT NULL,
	`weight` int NOT NULL DEFAULT 50,
	`isWinner` enum('yes','no') NOT NULL DEFAULT 'no',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_test_weights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `optimization_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` text NOT NULL,
	`testName` varchar(100),
	`winner` varchar(10),
	`confidence` int,
	`impact` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `optimization_history_id` PRIMARY KEY(`id`)
);
