CREATE TABLE `ab_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`variant` enum('quiz','chatbot','social') NOT NULL,
	`eventType` enum('impression','conversion') NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_events_id` PRIMARY KEY(`id`)
);
