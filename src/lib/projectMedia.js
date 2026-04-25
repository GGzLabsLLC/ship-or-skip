export const FALLBACK_PROJECT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#111827" />
          <stop offset="100%" stop-color="#312e81" />
        </linearGradient>
      </defs>
      <rect width="1200" height="750" fill="url(#bg)" />
      <circle cx="960" cy="120" r="180" fill="rgba(129,140,248,0.16)" />
      <circle cx="220" cy="610" r="220" fill="rgba(168,85,247,0.12)" />
      <text
        x="50%"
        y="48%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#e5e7eb"
        font-family="Arial, sans-serif"
        font-size="40"
        font-weight="700"
      >
        Ship or Skip
      </text>
      <text
        x="50%"
        y="57%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#94a3b8"
        font-family="Arial, sans-serif"
        font-size="22"
      >
        Preview unavailable
      </text>
    </svg>
  `);

export function getProjectImageSrc(project) {
  return (
    project?.imageUrl ||
    project?.screenshotUrl ||
    FALLBACK_PROJECT_IMAGE
  );
}

