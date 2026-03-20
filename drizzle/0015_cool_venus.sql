CREATE TABLE `abandoned_checkouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`productKey` varchar(64) NOT NULL DEFAULT 'frontEnd',
	`recoverySent` int NOT NULL DEFAULT 0,
	`recovered` int NOT NULL DEFAULT 0,
	`recoverySentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abandoned_checkouts_id` PRIMARY KEY(`id`)
);
