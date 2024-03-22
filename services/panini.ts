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

export const cachedRecentlySeenPaninis = unstable_cache(
  async () =>
    await prisma.panini.findMany({
      where: {
        observations: {
          some: {
            time: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
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
                  gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
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

export async function createPanini(formData: FormData) {
  "use server";

  const name = formData.get("name");
  if (typeof name !== "string" || name.length < 3) {
    throw new Error("invalid name");
  }

  const description = formData.get("description");
  if (typeof description !== "string" && description !== null) {
    throw new Error("invalid description");
  }

  const panini = await prisma.panini.create({
    data: {
      name,
      description,
    },
  });

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return revalidateTag(ALL_PANINI_TAG);
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
    throw new Error("failed to upload image");
  }
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
