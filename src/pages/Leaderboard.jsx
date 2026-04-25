import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CategorySelector from "../components/filters/CategorySelector";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import {
  ALL_CATEGORY_ID,
  getApprovedCategoryCounts,
  getCategoryLabelById,
  getSelectedCategoryId,
} from "../constants/categories";
import {
  getApprovedProjects,
  getEligibleProjects,
  getRankedProjects,
} from "../lib/leaderboardUtils";

export default function Leaderboard({ projects }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = getSelectedCategoryId(searchParams.get("category"));

  const handleSelectCategory = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (categoryId === ALL_CATEGORY_ID) {
      nextParams.delete("category");
    } else {
      nextParams.set("category", categoryId);
    }

    setSearchParams(nextParams);
  };

  const approvedProjects = useMemo(() => {
    return getApprovedProjects(projects);
  }, [projects]);

  const approvedCategoryCounts = useMemo(() => {
    return getApprovedCategoryCounts(approvedProjects);
  }, [approvedProjects]);

  const eligibleApprovedProjects = useMemo(() => {
    return getEligibleProjects(projects, selectedCategoryId);
  }, [projects, selectedCategoryId]);

  const rankedProjects = useMemo(() => {
    return getRankedProjects(eligibleApprovedProjects);
  }, [eligibleApprovedProjects]);

  return (
    <section className="leaderboard-page">
      <div className="hero-block hero-block--tight">
        <p className="hero-block__eyebrow">Scoreboard</p>
        <h1>Leaderboard</h1>
        <p className="hero-block__copy">
          Live rankings update as Ship votes come in for approved projects.
        </p>
      </div>

      <CategorySelector
        selectedCategoryId={selectedCategoryId}
        onSelect={handleSelectCategory}
        countsById={approvedCategoryCounts}
      />

      {!rankedProjects.length ? (
        <section className="empty-state">
          <p>
            {selectedCategoryId === ALL_CATEGORY_ID
              ? "No approved projects yet."
              : "No approved projects in this category yet."}
          </p>

          <div className="empty-state__actions">
            <a
              href={
                selectedCategoryId === ALL_CATEGORY_ID
                  ? "/submit"
                  : `/submit?category=${selectedCategoryId}`
              }
              className="btn btn--primary btn--md"
            >
              {selectedCategoryId === ALL_CATEGORY_ID
                ? "Submit a project"
                : `Submit a ${getCategoryLabelById(selectedCategoryId)} project`}
            </a>

            {selectedCategoryId !== ALL_CATEGORY_ID ? (
              <button
                type="button"
                className="btn btn--secondary btn--md"
                onClick={() => handleSelectCategory(ALL_CATEGORY_ID)}
              >
                Show all categories
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <LeaderboardTable rankedProjects={rankedProjects} />
      )}
    </section>
  );
}
