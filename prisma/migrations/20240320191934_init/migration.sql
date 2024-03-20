-- CreateTable
CREATE TABLE "Panini" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,

    CONSTRAINT "Panini_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paniniId" INTEGER NOT NULL,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Panini_name_key" ON "Panini"("name");

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_paniniId_fkey" FOREIGN KEY ("paniniId") REFERENCES "Panini"("id") ON DELETE CASCADE ON UPDATE CASCADE;
