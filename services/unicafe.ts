import prisma from "@/db";
import { revalidateTag, unstable_cache } from "next/cache";

const ALL_UNICAFE_TAG = "unicafes";

export const cachedUnicafes = unstable_cache(
  async () => await prisma.unicafe.findMany(),
  ["all-unicafes"],
  {
    tags: [ALL_UNICAFE_TAG],
  },
);

export async function createUnicafe(formData: FormData) {
  "use server";

  const name = formData.get("name");
  if (typeof name !== "string" || name.length < 3) {
    throw new Error("invalid name");
  }

  const description = formData.get("description");
  if (typeof description !== "string" || description.length < 3) {
    throw new Error("invalid description");
  }

  await prisma.unicafe.create({
    data: {
      name,
      description,
    },
  });
  revalidateTag(ALL_UNICAFE_TAG);
}

export async function destroyUnicafe(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  if (!id || Number.isNaN(id)) {
    throw new Error("invalid unicafe ID");
  }

  await prisma.unicafe.delete({
    where: {
      id,
    },
  });
  revalidateTag(ALL_UNICAFE_TAG);
}
