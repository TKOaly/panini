-- CreateTable
CREATE TABLE "Panini" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL UNIQUE,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Panini_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unicafe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,

    CONSTRAINT "Unicafe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paniniId" INTEGER NOT NULL,
    "unicafeId" INTEGER NOT NULL,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_paniniId_fkey" FOREIGN KEY ("paniniId") REFERENCES "Panini"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_unicafeId_fkey" FOREIGN KEY ("unicafeId") REFERENCES "Unicafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
