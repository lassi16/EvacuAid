-- CreateTable
CREATE TABLE `Incident` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `team` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NULL,
    `floorId` INTEGER NULL,
    `mapLinked` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Incident_status_idx`(`status`),
    INDEX `Incident_severity_idx`(`severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `incidentId` VARCHAR(191) NOT NULL,
    `assignee` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `insertedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Task_incidentId_idx`(`incidentId`),
    INDEX `Task_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `incidentId` VARCHAR(191) NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `opened` BOOLEAN NOT NULL DEFAULT false,
    `ack` BOOLEAN NOT NULL DEFAULT false,
    `escalated` BOOLEAN NOT NULL DEFAULT false,
    `message` VARCHAR(191) NOT NULL,
    `insertedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_incidentId_idx`(`incidentId`),
    INDEX `Notification_ack_idx`(`ack`),
    INDEX `Notification_opened_idx`(`opened`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_incidentId_fkey` FOREIGN KEY (`incidentId`) REFERENCES `Incident`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_incidentId_fkey` FOREIGN KEY (`incidentId`) REFERENCES `Incident`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
