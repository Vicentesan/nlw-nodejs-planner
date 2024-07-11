/*
  Warnings:

  - A unique constraint covering the columns `[title,occursAt,tripId]` on the table `activities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activities_title_occursAt_tripId_key" ON "activities"("title", "occursAt", "tripId");
