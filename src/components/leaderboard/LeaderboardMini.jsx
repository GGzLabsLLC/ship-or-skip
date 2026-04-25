import { useMemo } from "react";
import {
  ALL_CATEGORY_ID,
  getCategoryLabelById,
} from "../../constants/categories";
import { getRankedProjects, getShipRate } from "../../lib/leaderboardUtils";

export default function LeaderboardMini({
  projects,
  selectedCategoryId,
  limit = 5,
  kicker = "Live leaderboard",
  viewAllHref = "/leaderboard",
  footerHref = "/leaderboard",
  footerLabel = "Open full leaderboard",
}) {
  const rankedProjects = useMemo(() => {
    return getRankedProjects(projects).slice(0, limit);
  }, [projects, limit]);

  const title =
    selectedCategoryId === ALL_CATEGORY_ID
      ? "Market leaders"
      : `Market leaders · ${getCategoryLabelById(selectedCategoryId)}`;

  return (
    <section className="leaders-panel" aria-label="Live leaderboard">
      <div className="leaders-panel__head">
        <div className="leaders-panel__headline">
          <p className="leaders-panel__kicker">{kicker}</p>
          <h2 className="leaders-panel__title">{title}</h2>
          <p className="leaders-panel__subline">
            Top {limit} projects by live ship signal
          </p>
        </div>

        <a href={viewAllHref} className="leaders-panel__link">
          View all
        </a>
      </div>

      <div className="leaders-cols" aria-hidden="true">
        <span className="leaders-cols__rank">Rank</span>
        <span className="leaders-cols__project">Project</span>
        <span className="leaders-cols__elo">ELO</span>
        <span className="leaders-cols__ship">Ship %</span>
        <span className="leaders-cols__votes">Votes</span>
      </div>

      <div className="leaders-list" role="list">
        {rankedProjects.map((project, index) => {
          const rank = index + 1;
          const shipRate = getShipRate(project);
          const wins = project?.wins || 0;
          const losses = project?.losses || 0;
          const votes = project?.votes || 0;

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
                <div className="leaders-item__record">
                  {wins}W - {losses}L
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
        <a href={footerHref} className="btn btn--ship btn--md btn--full">
          {footerLabel}
        </a>
      </div>
    </section>
  );
}
