/*
  Warnings:

  - A unique constraint covering the columns `[url,tripId]` on the table `links` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "links_url_tripId_key" ON "links"("url", "tripId");
