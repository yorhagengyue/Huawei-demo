-- AlterTable
ALTER TABLE "User" ADD COLUMN     "residentialStatus" TEXT,
ADD COLUMN     "singaporePostalCode" TEXT;

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "storageType" TEXT NOT NULL DEFAULT 'local',
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT,
    "checksum" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "scanStatus" TEXT,
    "scanResult" TEXT,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "metadata" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadLog" (
    "id" TEXT NOT NULL,
    "fileId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "containsPII" BOOLEAN NOT NULL DEFAULT false,
    "dataConsent" BOOLEAN NOT NULL DEFAULT false,
    "requestId" TEXT,
    "processingTime" INTEGER,
    "sourceSystem" TEXT,
    "destinationSystem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UploadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileScanResult" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "scanProvider" TEXT NOT NULL,
    "scanDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "threatDetails" JSONB,
    "quarantined" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAccessLog" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "accessTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geoLocation" TEXT,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FileAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadLog_fileId_key" ON "UploadLog"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileScanResult_fileId_key" ON "FileScanResult"("fileId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLog" ADD CONSTRAINT "UploadLog_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLog" ADD CONSTRAINT "UploadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
