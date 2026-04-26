import { useMemo } from "react";
import {
  ALL_CATEGORY_ID,
  getCategoryLabelById,
} from "../../constants/categories";
import { getAiDisclosureBadgeLabel } from "../../constants/aiDisclosure";
import { getRankedProjects, getShipRate } from "../../lib/leaderboardUtils";

export default function LeaderboardMini({
  projects,
  selectedCategoryId,
  limit = 5,
  kicker = "Standings",
  viewAllHref = "/leaderboard",
  footerHref = "/leaderboard",
  footerLabel = "Open leaderboard",
}) {
  const rankedProjects = useMemo(() => {
    return getRankedProjects(projects).slice(0, limit);
  }, [projects, limit]);

  const title =
    selectedCategoryId === ALL_CATEGORY_ID
      ? "Top builds"
      : `Top builds · ${getCategoryLabelById(selectedCategoryId)}`;

  return (
    <section className="leaders-panel" aria-label="Standings">
      <div className="leaders-panel__head">
        <div className="leaders-panel__headline">
          <p className="leaders-panel__kicker">{kicker}</p>
          <h2 className="leaders-panel__title">{title}</h2>
          <p className="leaders-panel__subline">
            Top {limit} builds right now
          </p>
        </div>

        <a href={viewAllHref} className="leaders-panel__link">
          View all
        </a>
      </div>

      <div className="leaders-cols" aria-hidden="true">
        <span className="leaders-cols__rank">
          <span className="leaders-cols__label leaders-cols__label--long">Rank</span>
          <span className="leaders-cols__label leaders-cols__label--short">Rank</span>
        </span>
        <span className="leaders-cols__project">Project</span>
        <span className="leaders-cols__elo">ELO</span>
        <span className="leaders-cols__ship">
          <span className="leaders-cols__label leaders-cols__label--long">Ship %</span>
          <span className="leaders-cols__label leaders-cols__label--short">Ship</span>
        </span>
        <span className="leaders-cols__votes">Votes</span>
      </div>

      <div className="leaders-list" role="list">
        {rankedProjects.map((project, index) => {
          const rank = index + 1;
          const shipRate = getShipRate(project);
          const wins = project?.wins || 0;
          const losses = project?.losses || 0;
          const votes = project?.votes || 0;
          const aiDisclosureBadge = getAiDisclosureBadgeLabel(project?.aiDisclosure);

          return (
            <div
              key={project.id}
              className={`leaders-item ${
                rank === 1 ? "leaders-item--top" : ""
              }`}
              role="listitem"
            >
              <div className="leaders-item__rank">#{rank}</div>

              <div className="leaders-item__main">
                <div className="leaders-item__name">{project.name}</div>
                <div className="leaders-item__meta">
                  <div className="leaders-item__record">
                    {wins}W - {losses}L
                  </div>
                  {aiDisclosureBadge ? (
                    <span className="pill pill--neutral pill--xs">
                      {aiDisclosureBadge}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="leaders-item__elo">
                {Math.round(project.rating)}
              </div>

              <div className="leaders-item__shiprate">
                {shipRate}%
              </div>

              <div className="leaders-item__votes">
                {votes}
              </div>
            </div>
          );
        })}
      </div>

      <div className="leaders-panel__footer">
        <a href={footerHref} className="btn btn--secondary btn--md btn--full">
          {footerLabel}
        </a>
      </div>
    </section>
  );
}
