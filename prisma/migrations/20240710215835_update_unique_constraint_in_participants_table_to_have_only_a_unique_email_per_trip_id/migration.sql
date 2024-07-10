/*
  Warnings:

  - A unique constraint covering the columns `[email,tripId]` on the table `participants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "participants_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_tripId_key" ON "participants"("email", "tripId");
