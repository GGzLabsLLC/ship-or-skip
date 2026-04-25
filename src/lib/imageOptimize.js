function getCanvasEncodingSupport(mimeType) {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL(mimeType);
    return typeof dataUrl === "string" && dataUrl.startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}

function blobFromCanvas(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || null),
      mimeType,
      typeof quality === "number" ? quality : undefined
    );
  });
}

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx) => ctx.drawImage(bitmap, 0, 0),
      cleanup: () => bitmap.close?.(),
    };
  }

  if (typeof document === "undefined") {
    throw new Error("Image optimization requires a browser environment.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.src = objectUrl;
    });

    return {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      draw: (ctx) => ctx.drawImage(image, 0, 0),
      cleanup: () => {},
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getBaseName(name) {
  const value = String(name || "screenshot").trim();
  if (!value) return "screenshot";
  return value.replace(/\.[a-z0-9]+$/i, "");
}

export function getWebpSupport() {
  return getCanvasEncodingSupport("image/webp");
}

export async function optimizeScreenshotForUpload(
  file,
  {
    maxWidth = 1000,
    mimeType = "image/webp",
    quality = 0.82,
    maxBytes = 3 * 1024 * 1024 - 1024,
  } = {}
) {
  if (!file) return { file: null, didOptimize: false, contentType: "" };
  if (typeof document === "undefined") {
    return { file, didOptimize: false, contentType: file.type || "" };
  }

  const supportsWebp = mimeType === "image/webp" ? getWebpSupport() : true;
  if (!supportsWebp) {
    return { file, didOptimize: false, contentType: file.type || "" };
  }

  let decoded;
  try {
    decoded = await decodeImage(file);
  } catch {
    return { file, didOptimize: false, contentType: file.type || "" };
  }

  try {
    const sourceWidth = decoded.width || 0;
    const sourceHeight = decoded.height || 0;

    if (!sourceWidth || !sourceHeight) {
      return { file, didOptimize: false, contentType: file.type || "" };
    }

    const scale = sourceWidth > maxWidth ? maxWidth / sourceWidth : 1;
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return { file, didOptimize: false, contentType: file.type || "" };
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.save();
    ctx.scale(scale, scale);
    decoded.draw(ctx);
    ctx.restore();

    const baseName = getBaseName(file.name);
    const webpName = `${baseName}.webp`;

    const candidateQualities = [quality, 0.8, 0.78];
    let bestBlob = null;

    for (const q of candidateQualities) {
      const blob = await blobFromCanvas(canvas, mimeType, q);
      if (!blob) continue;
      if (blob.size > maxBytes) continue;
      bestBlob = blob;
      break;
    }

    if (!bestBlob) {
      return { file, didOptimize: false, contentType: file.type || "" };
    }

    if (bestBlob.size >= file.size) {
      // If we didn't shrink anything, keep the original (prevents needless recompress).
      // Still resized images will often be smaller; keep those.
      const didResize = scale < 1;
      if (!didResize) {
        return { file, didOptimize: false, contentType: file.type || "" };
      }
    }

    const optimizedFile = new File([bestBlob], webpName, {
      type: mimeType,
      lastModified: Date.now(),
    });

    return { file: optimizedFile, didOptimize: true, contentType: mimeType };
  } finally {
    decoded.cleanup?.();
  }
}
