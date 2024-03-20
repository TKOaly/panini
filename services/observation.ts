import prisma from "@/db";
import { revalidateTag, unstable_cache } from "next/cache";

const ALL_OBSERVATIONS_TAG = "all-observations";

export const cachedObservations = unstable_cache(
  async () => await prisma.observation.findMany(),
  ["all-observations"],
  {
    tags: [ALL_OBSERVATIONS_TAG],
  },
);
export const cachedRecentObesrvations = unstable_cache(
  async () =>
    await prisma.observation.findMany({
      where: {
        time: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      },
    }),
  ["recent-observations"],
  {
    tags: [ALL_OBSERVATIONS_TAG],
    revalidate: 30,
  },
);

export async function createObservation(formData: FormData) {
  "use server";

  const paniniId = Number(formData.get("paniniId"));
  if (!paniniId || Number.isNaN(paniniId)) {
    throw new Error("invalid panini ID");
  }
  const panini = await prisma.panini.findUnique({
    where: {
      id: paniniId,
    },
  });
  if (panini === null) {
    throw new Error("panini not found");
  }

  const unicafeId = Number(formData.get("unicafeId"));
  if (!unicafeId || Number.isNaN(unicafeId)) {
    throw new Error("invalid unicafe ID");
  }
  const unicafe = await prisma.unicafe.findUnique({
    where: {
      id: unicafeId,
    },
  });
  if (unicafe === null) {
    throw new Error("unicafe not found");
  }

  await prisma.observation.create({
    data: {
      paniniId: panini.id,
      unicafeId: unicafe.id,
      time: new Date(),
    },
  });
  revalidateTag(ALL_OBSERVATIONS_TAG);
}
