CREATE TABLE `galleryImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`caption` varchar(200),
	`captionKz` varchar(200),
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `galleryImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`attending` enum('yes','no','maybe') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rsvps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weddings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleKz` varchar(200),
	`date` timestamp NOT NULL,
	`location` varchar(300) NOT NULL,
	`locationKz` varchar(300),
	`description` text,
	`descriptionKz` text,
	`backgroundImage` varchar(500),
	`isPaid` boolean NOT NULL DEFAULT false,
	`customFont` varchar(100),
	`customColor` varchar(50),
	`musicUrl` varchar(500),
	`videoUrl` varchar(500),
	`loveStory` text,
	`loveStoryKz` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weddings_id` PRIMARY KEY(`id`),
	CONSTRAINT `weddings_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`guestName` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameKz` varchar(200),
	`description` text,
	`descriptionKz` text,
	`link` varchar(500) NOT NULL,
	`isReserved` boolean NOT NULL DEFAULT false,
	`reservedBy` varchar(200),
	`reservedEmail` varchar(320),
	`reservedPhone` varchar(50),
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wishlistItems_id` PRIMARY KEY(`id`)
);
