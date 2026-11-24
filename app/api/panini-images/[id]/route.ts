import minio, { BUCKET_NAME } from "@/services/minio";
import { cachedPaninis } from "@/services/panini";
import { Readable } from "node:stream";

/**
 * Proxies panini images from object storage. The storage backend (Garage)
 * does not support anonymous read access, so the browser can't load the
 * images directly; instead the server fetches them with its credentials.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return new Response("Invalid panini ID", { status: 400 });
  }

  const panini = (await cachedPaninis()).find((p) => p.id === id);
  if (!panini?.image) {
    return new Response("Not found", { status: 404 });
  }

  const objectName = getObjectName(panini.image);

  try {
    const stat = await minio.statObject(BUCKET_NAME, objectName);
    const etag = `"${stat.etag}"`;

    const headers = new Headers({
      ETag: etag,
      "Cache-Control": "public, max-age=3600",
      "Last-Modified": stat.lastModified.toUTCString(),
      "X-Content-Type-Options": "nosniff",
      // Images are uploaded by users; never let them run as a document.
      "Content-Security-Policy": "default-src 'none'; sandbox",
    });

    // Older uploads were stored with the wildcard type "image/*", which is
    // not a valid response content type. Fall back to sniffing the bytes.
    const object = await minio.getObject(BUCKET_NAME, objectName);
    const contentType =
      stat.metaData?.["content-type"] ?? stat.metaData?.["Content-Type"];
    const { type, body } = await resolveContentType(object, contentType);
    headers.set("Content-Type", type);

    if (request.headers.get("if-none-match") === etag) {
      object.destroy();
      return new Response(null, { status: 304, headers });
    }

    headers.set("Content-Length", stat.size.toString());
    return new Response(Readable.toWeb(body) as ReadableStream, { headers });
  } catch (error: any) {
    if (error?.code === "NotFound" || error?.code === "NoSuchKey") {
      return new Response("Not found", { status: 404 });
    }
    console.error("failed to fetch panini image", error);
    return new Response("Failed to fetch image", { status: 502 });
  }
}

/**
 * The database stores the full (presigned) URL of the image. The object name
 * is the last path segment, e.g. https://minio.tko-aly.fi/panini-images/35
 */
function getObjectName(imageUrl: string) {
  const segments = new URL(imageUrl).pathname.split("/").filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1]);
}

const SIGNATURES: [string, (b: Buffer) => boolean][] = [
  [
    "image/png",
    (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  ],
  ["image/jpeg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ["image/gif", (b) => b.subarray(0, 4).toString("ascii") === "GIF8"],
  [
    "image/webp",
    (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  ],
  [
    "image/avif",
    (b) => b.subarray(4, 12).toString("ascii").startsWith("ftypavi"),
  ],
];

async function resolveContentType(
  stream: Readable,
  contentType: string | undefined,
): Promise<{ type: string; body: Readable }> {
  if (
    contentType &&
    contentType.startsWith("image/") &&
    !contentType.includes("*")
  ) {
    return { type: contentType, body: stream };
  }

  // Read the first chunk to detect the type, then put it back in front.
  const iterator = stream[Symbol.asyncIterator]();
  const first = await iterator.next();
  const head: Buffer = first.done ? Buffer.alloc(0) : Buffer.from(first.value);
  const type =
    SIGNATURES.find(([, matches]) => matches(head))?.[0] ??
    "application/octet-stream";

  const body = Readable.from(
    (async function* () {
      if (head.length) yield head;
      for (
        let next = await iterator.next();
        !next.done;
        next = await iterator.next()
      ) {
        yield next.value;
      }
    })(),
  );
  return { type, body };
}
