export const ALL_CATEGORY_ID = "all";

export const CATEGORIES = [
  { id: "ai", label: "AI" },
  { id: "saas", label: "SaaS" },
  { id: "dev-tools", label: "Dev Tools" },
  { id: "gaming", label: "Gaming" },
  { id: "productivity", label: "Productivity" },
  { id: "social", label: "Social" },
  { id: "marketplace", label: "Marketplace" },
];

const CATEGORY_ID_SET = new Set(CATEGORIES.map((category) => category.id));
const CATEGORY_ID_TO_LABEL = new Map(
  CATEGORIES.map((category) => [category.id, category.label])
);

export function getSelectedCategoryId(value) {
  if (!value) return ALL_CATEGORY_ID;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === ALL_CATEGORY_ID) return ALL_CATEGORY_ID;
  if (CATEGORY_ID_SET.has(normalized)) return normalized;

  return ALL_CATEGORY_ID;
}

function normalizeLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

const CATEGORY_LABEL_TO_ID = new Map(
  CATEGORIES.flatMap((category) => [
    [normalizeLabel(category.label), category.id],
    [normalizeLabel(category.id), category.id],
  ])
);

export function getProjectCategoryId(value) {
  const normalized = normalizeLabel(value);
  if (!normalized) return null;
  return CATEGORY_LABEL_TO_ID.get(normalized) ?? null;
}

export function getCategoryLabelById(value) {
  if (!value) return "";
  return CATEGORY_ID_TO_LABEL.get(String(value)) ?? "";
}

export function getApprovedCategoryCounts(approvedProjects) {
  const counts = { [ALL_CATEGORY_ID]: approvedProjects?.length ?? 0 };

  for (const category of CATEGORIES) {
    counts[category.id] = 0;
  }

  for (const project of approvedProjects || []) {
    const categoryId = getProjectCategoryId(project?.category);
    if (!categoryId) continue;
    if (!(categoryId in counts)) continue;
    counts[categoryId] += 1;
  }

  return counts;
}
