import { useMemo, useState } from "react";
import { FALLBACK_PROJECT_IMAGE, getProjectImageSrc } from "../lib/projectMedia";

export default function ProjectImage({
  project,
  alt = "Project preview",
  className = "",
  loading = "lazy",
  decoding = "async",
  fetchPriority = "auto",
  width = 1200,
  height = 750,
}) {
  const [hasError, setHasError] = useState(false);

  const src = useMemo(() => {
    if (hasError) return FALLBACK_PROJECT_IMAGE;
    return getProjectImageSrc(project);
  }, [hasError, project]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      onError={(event) => {
        // Prevent infinite loops if the fallback ever errors.
        event.currentTarget.onerror = null;
        setHasError(true);
      }}
    />
  );
}

