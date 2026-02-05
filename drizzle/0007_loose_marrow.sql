ALTER TABLE `rsvps` MODIFY COLUMN `attending` enum('yes','no','yes_plus_one','yes_with_spouse') NOT NULL;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `guestCount` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `dietaryRestrictions` text;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `needsParking` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `needsTransfer` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `weddings` ADD `mapUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `weddings` ADD `mapProvider` varchar(50);--> statement-breakpoint
ALTER TABLE `weddings` ADD `hideHeartIcon` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `weddings` ADD `templateId` varchar(50) DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `weddings` ADD `timelineData` text;--> statement-breakpoint
ALTER TABLE `weddings` ADD `menuData` text;--> statement-breakpoint
ALTER TABLE `weddings` ADD `dressCode` text;--> statement-breakpoint
ALTER TABLE `weddings` ADD `dressCodeKz` text;--> statement-breakpoint
ALTER TABLE `weddings` ADD `coordinatorName` varchar(200);--> statement-breakpoint
ALTER TABLE `weddings` ADD `coordinatorPhone` varchar(50);--> statement-breakpoint
ALTER TABLE `weddings` ADD `coordinatorEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `weddings` ADD `qrCodeData` varchar(500);--> statement-breakpoint
ALTER TABLE `weddings` ADD `locationDetails` text;--> statement-breakpoint
ALTER TABLE `weddings` ADD `locationDetailsKz` text;--> statement-breakpoint
ALTER TABLE `weddings` ADD `showTimeline` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `weddings` ADD `showMenu` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `weddings` ADD `showDressCode` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `weddings` ADD `showQrCode` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `weddings` ADD `showCoordinator` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `weddings` ADD `showLocationDetails` boolean DEFAULT false;