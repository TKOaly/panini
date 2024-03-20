import prisma from "@/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { ALL_PANINI_TAG } from "./panini";

const ALL_OBSERVATIONS_TAG = "all-observations";

export const cachedObservations = unstable_cache(
  async () =>
    await prisma.observation.findMany({
      include: {
        panini: true,
      },
    }),
  ["all-observations"],
  {
    tags: [ALL_OBSERVATIONS_TAG],
  },
);
export const cachedRecentObservations = unstable_cache(
  async () =>
    await prisma.observation.findMany({
      where: {
        time: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      },
      include: {
        panini: true,
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

  const rawPaniniIds = formData.get("paniniIds");
  if (typeof rawPaniniIds !== "string") {
    throw new Error("invalid paninis");
  }

  const paniniIds = rawPaniniIds.split(";");

  // Create observations for all paninis selected
  const time = new Date();
  for (const paniniId of paniniIds) {
    await prisma.observation.create({
      data: {
        paniniId: Number(paniniId),
        time,
      },
    });
  }
  revalidateTag(ALL_OBSERVATIONS_TAG);
  revalidateTag(ALL_PANINI_TAG);
}
