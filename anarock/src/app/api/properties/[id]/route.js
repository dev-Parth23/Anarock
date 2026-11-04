import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getPropertyById,
  getPropertiesCacheInfo,
} from "@/lib/propertiesCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_BASE_URL = "https://property-images.zohostratus.in";

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "bmp",
  "tif",
  "tiff",
  "svg",
];

const IMAGE_FILES = [
  { key: "project", name: "Project Picture 1", baseName: "Project_Picture_1" },
  { key: "floor-plan", name: "Floor Plan 1", baseName: "Floor_Plan_1" },
  ...Array.from({ length: 10 }, (_, index) => ({
    key: `property-${index + 1}`,
    name: `Property Photo ${index + 1}`,
    baseName: `Property_Photo_${index + 1}`,
  })),
];

async function checkImageUrl(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "force-cache",
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) return true;
    if ([403, 405, 501].includes(response.status)) {
      const getResponse = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        cache: "force-cache",
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      });

      const exists = getResponse.ok;
      await getResponse.body?.cancel().catch(() => { });
      return exists;
    }

    return false;
  } catch {
    return false;
  }
}

async function resolvePropertyImages(property) {
  const folder = String(property?.ImageFolderPath || "")
    .replace(/^\/+|\/+$/g, "");

  if (!folder) return [];

  const folderParts = folder.split("/").filter(Boolean);

  if (
    folderParts.some(
      (part) =>
        part === "." ||
        part === ".." ||
        !/^[a-zA-Z0-9 _().-]+$/.test(part)
    )
  ) {
    return [];
  }

  const encodedFolder = folderParts
    .map(encodeURIComponent)
    .join("/");

  const resolved = await Promise.all(
    IMAGE_FILES.map(async (image) => {
      for (const extension of IMAGE_EXTENSIONS) {
        const url =
          `${IMAGE_BASE_URL}/${encodedFolder}/` +
          `${encodeURIComponent(image.baseName)}.${extension}`;

        if (await checkImageUrl(url)) {
          return {
            key: image.key,
            name: image.name,
            url,
          };
        }
      }

      return null;
    })
  );

  return resolved.filter(Boolean);
}

export async function GET(request, context) {
  const requestId = randomUUID();
  const requestStartedAt = Date.now();

  try {
    const params =
      context?.params instanceof Promise
        ? await context.params
        : context?.params;

    const id = String(params?.id ?? "").trim();

    if (!id || id.length > 100 || /[\r\n]/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid property ID is required.",
        },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const property = await getPropertyById(id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
          id,
        },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }
    const galleryImages = await resolvePropertyImages(property);
    const cacheInfo = getPropertiesCacheInfo();
    console.info("[Property Detail API]", {
      requestId,
      durationMs: Date.now() - requestStartedAt,
      cacheCount: cacheInfo.count,
      cacheFresh: cacheInfo.isFresh,
      cacheStale: cacheInfo.isStale,
      refreshInProgress: cacheInfo.refreshInProgress,
      galleryImageCount: galleryImages.length,
    });
    return NextResponse.json(
      {
        success: true,
        data: property,
        property,
        galleryImages,
        cachedAt: cacheInfo.cachedAt,
        cache: {
          count: cacheInfo.count,
          isFresh: cacheInfo.isFresh,
          isStale: cacheInfo.isStale,
          refreshInProgress: cacheInfo.refreshInProgress,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Property-Cache": cacheInfo.isFresh
            ? "fresh"
            : cacheInfo.isStale
              ? "stale"
              : "cold",
        },
      }
    );
  } catch (error) {
    console.error("[Property Detail API] Failed:", {
      requestId,
      name: error?.name || "Error",
      code: error?.code || null,
      status: error?.status || null,
      message: error?.message || "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch property. Please try again.",
        requestId,
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
