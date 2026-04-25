import { formatDisplayUrl, getShipRate } from "../../lib/leaderboardUtils";
import { getSafeExternalUrl } from "../../lib/url";
import ProjectImage from "../ProjectImage";

export default function LeaderboardTable({ rankedProjects }) {
  return (
    <div className="leaderboard-table-wrap">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Project</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Ship rate</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          {rankedProjects.map((project, index) => {
            const displayUrl = formatDisplayUrl(project.link || "");
            const safeLink = getSafeExternalUrl(project.link);
            const rank = index + 1;
            const shipRate = getShipRate(project);

            return (
              <tr
                key={project.id}
                className={
                  rank <= 3
                    ? "leaderboard-row leaderboard-row--top"
                    : "leaderboard-row"
                }
              >
                <td>
                  <span className="leaderboard-rank">#{rank}</span>
                </td>
                <td>
                  <div className="leaderboard-project">
                    <ProjectImage
                      project={project}
                      alt={`${project.name} preview`}
                      className="leaderboard-project__image"
                      loading="lazy"
                      decoding="async"
                      width={1200}
                      height={750}
                    />

                    <div className="leaderboard-project__content">
                      <div className="leaderboard-project__name">
                        {project.name}
                      </div>

                      {displayUrl ? (
                        <div
                          className="leaderboard-project__url"
                          title={project.link}
                        >
                          {displayUrl}
                        </div>
                      ) : null}

                      {safeLink ? (
                        <a
                          href={safeLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="btn btn--secondary btn--md leaderboard-project__action"
                        >
                          Visit
                        </a>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td>{project.category}</td>
                <td>{project.rating}</td>
                <td>
                  <div
                    className="leaderboard-shiprate"
                    style={{ "--shiprate": shipRate }}
                    aria-label={`Ship rate ${shipRate}%`}
                  >
                    <span className="leaderboard-shiprate__label">
                      {shipRate}%
                    </span>
                    <span
                      className="leaderboard-shiprate__bar"
                      aria-hidden="true"
                    >
                      <span className="leaderboard-shiprate__fill" />
                    </span>
                  </div>
                </td>
                <td>
                  {(project.wins || 0)}-{(project.losses || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
