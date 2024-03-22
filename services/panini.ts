import prisma from "@/db";
import { Panini } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import minio from "./minio";

export const ALL_PANINI_TAG = "paninis";
const BUCKET_NAME = "panini-images";

export const cachedPaninis = unstable_cache(
  async () => await prisma.panini.findMany(),
  ["all-paninis"],
  {
    tags: [ALL_PANINI_TAG],
    revalidate: 30,
  },
);

/**
 * Function to get a new date that is midnight of the current day.
 */
export function getMidnightDate(date: Date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export const cachedRecentlySeenPaninis = unstable_cache(
  async () =>
    await prisma.panini.findMany({
      where: {
        observations: {
          some: {
            time: {
              gte: getMidnightDate(),
            },
          },
        },
      },
      include: {
        observations: {
          orderBy: {
            time: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            observations: {
              where: {
                time: {
                  gte: getMidnightDate(),
                },
              },
            },
          },
        },
      },
    }),
  ["recent-paninis"],
  {
    tags: [ALL_PANINI_TAG],
    revalidate: 30,
  },
);

export async function createPanini(
  prevState: any,
  formData: FormData,
): Promise<{
  error?: string;
  message?: string;
}> {
  "use server";

  const name = formData.get("name");
  if (typeof name !== "string" || name.length < 3) {
    return { error: "Invalid name" };
  }

  const description = formData.get("description");
  if (typeof description !== "string" && description !== null) {
    return { error: "Invalid description" };
  }

  let panini: Panini;
  try {
    panini = await prisma.panini.create({
      data: {
        name,
        description,
      },
    });
  } catch (e) {
    console.error("failed to create panini", e);
    return { error: "Failed to create panini. Does it have a unique name?" };
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    revalidateTag(ALL_PANINI_TAG);
    return { message: "Panini created with placeholder image" };
  }

  const logoUploadUrl = await getLogoUploadUrl(panini);
  try {
    await fetch(logoUploadUrl.server, {
      method: "PUT",
      body: image,
      headers: {
        "Content-Type": "image/*",
      },
    });

    await prisma.panini.update({
      where: {
        id: panini.id,
      },
      data: {
        image: logoUploadUrl.client,
      },
    });
  } catch (error) {
    console.error("failed to upload image", error);
    await prisma.panini.delete({
      where: {
        id: panini.id,
      },
    });
    return { error: "Failed to upload image" };
  }
  revalidateTag(ALL_PANINI_TAG);

  return { message: "Panini created" };
}
export type CreatePaniniAction = typeof createPanini;

export async function destroyPanini(
  prevState: any,
  formData: FormData,
): Promise<{
  error?: string;
  message?: string;
}> {
  "use server";

  const id = Number(formData.get("id"));
  if (!id || Number.isNaN(id)) {
    return { error: "Invalid panini ID" };
  }

  await prisma.panini.delete({
    where: {
      id,
    },
  });
  revalidateTag(ALL_PANINI_TAG);

  return { message: "Panini deleted" };
}
export type DestroyPaniniAction = typeof destroyPanini;

async function getLogoUploadUrl(panini: Panini): Promise<{
  server: string;
  client: string;
}> {
  if (!(await minio.bucketExists(BUCKET_NAME))) {
    await minio.makeBucket(BUCKET_NAME);
  }

  const serverUrl = new URL(
    await minio.presignedPutObject(BUCKET_NAME, panini.id.toString(), 60 * 30),
  );

  const publicUrl = new URL(
    await minio.presignedGetObject(BUCKET_NAME, panini.id.toString()),
  );
  if (process.env.MINIO_PUBLIC_URL) {
    const actualPublicUrl = new URL(process.env.MINIO_PUBLIC_URL);

    publicUrl.host = actualPublicUrl.host;
    publicUrl.protocol = actualPublicUrl.protocol;
    publicUrl.port = actualPublicUrl.port;
  }

  return {
    server: serverUrl.toString(),
    client: publicUrl.toString(),
  };
}
