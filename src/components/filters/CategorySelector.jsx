import { ALL_CATEGORY_ID, CATEGORIES } from "../../constants/categories";

function getCategoryButtonClass(isActive) {
  return `btn btn--md ${isActive ? "btn--ship" : "btn--ghost"}`;
}

export default function CategorySelector({
  selectedCategoryId,
  onSelect,
  countsById,
}) {
  const allCount = countsById?.[ALL_CATEGORY_ID] ?? 0;

  return (
    <section className="category-block" aria-labelledby="category-filter-title">
      <div className="category-block__head">
        <div className="category-block__title-row">
          <span className="category-block__icon" aria-hidden="true">
            ⚙
          </span>

          <h2 id="category-filter-title" className="category-block__title">
            Categories
          </h2>
        </div>

        <span className="category-block__hint">Swipe to browse</span>
      </div>

      <div
        className="category-scroll category-selector"
        role="group"
        aria-label="Category filter"
      >
        <button
          type="button"
          className={getCategoryButtonClass(
            selectedCategoryId === ALL_CATEGORY_ID
          )}
          onClick={() => onSelect(ALL_CATEGORY_ID)}
          aria-pressed={selectedCategoryId === ALL_CATEGORY_ID}
        >
          All ({allCount})
        </button>

        {CATEGORIES.map((category) => {
          const isActive = selectedCategoryId === category.id;
          const count = countsById?.[category.id] ?? 0;

          return (
            <button
              key={category.id}
              type="button"
              className={getCategoryButtonClass(isActive)}
              onClick={() => onSelect(category.id)}
              aria-pressed={isActive}
            >
              {category.label} ({count})
            </button>
          );
        })}
      </div>
    </section>
  );
}
