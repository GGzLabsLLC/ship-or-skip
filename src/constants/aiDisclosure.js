export const AI_DISCLOSURE_VALUES = [
  "ai_assisted",
  "mixed",
  "no_ai",
  "undisclosed",
];

export const DEFAULT_AI_DISCLOSURE = "undisclosed";

export const AI_DISCLOSURE_OPTIONS = [
  {
    value: "ai_assisted",
    label: "AI-assisted",
    badgeLabel: "AI-assisted",
  },
  {
    value: "mixed",
    label: "Mixed / vibe-coded",
    badgeLabel: "Mixed build",
  },
  {
    value: "no_ai",
    label: "No AI",
    badgeLabel: "No AI",
  },
  {
    value: "undisclosed",
    label: "Prefer not to say",
    badgeLabel: "",
  },
];

export function normalizeAiDisclosure(value) {
  if (!value) return DEFAULT_AI_DISCLOSURE;

  const normalized = String(value).trim().toLowerCase();
  return AI_DISCLOSURE_VALUES.includes(normalized)
    ? normalized
    : DEFAULT_AI_DISCLOSURE;
}

export function getAiDisclosureBadgeLabel(value) {
  const normalized = normalizeAiDisclosure(value);
  const option = AI_DISCLOSURE_OPTIONS.find(
    (candidate) => candidate.value === normalized
  );
  return option?.badgeLabel || "";
}

