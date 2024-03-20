import prisma from "@/db";
import { revalidateTag, unstable_cache } from "next/cache";

const ALL_PANINI_TAG = "paninis";

export const cachedPaninis = unstable_cache(
  async () => await prisma.panini.findMany(),
  ["all-paninis"],
  {
    tags: [ALL_PANINI_TAG],
  },
);

export async function createPanini(formData: FormData) {
  "use server";

  const name = formData.get("name");
  if (typeof name !== "string" || name.length < 3) {
    throw new Error("invalid name");
  }

  const description = formData.get("description");
  if (typeof description !== "string" || description.length < 3) {
    throw new Error("invalid description");
  }

  await prisma.panini.create({
    data: {
      name,
      description,
      image: "https://via.placeholder.com/150",
    },
  });
  revalidateTag(ALL_PANINI_TAG);
}

export async function destroyPanini(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  if (!id || Number.isNaN(id)) {
    throw new Error("invalid panini ID");
  }

  await prisma.panini.delete({
    where: {
      id,
    },
  });
  revalidateTag(ALL_PANINI_TAG);
}
