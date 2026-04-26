import { useState } from "react";
import { formatDisplayUrl, getShipRate } from "../../lib/leaderboardUtils";
import { getSafeExternalUrl } from "../../lib/url";
import { getAiDisclosureBadgeLabel } from "../../constants/aiDisclosure";
import ProjectImage from "../ProjectImage";

export default function BattleCard({
  project,
  onPick,
  tone = "",
  actionLabel = "Ship this",
  overallRank = null,
  imageFetchPriority = "auto",
  disabled = false,
}) {
  const shipRate = getShipRate(project);

  const whyBuilt = String(project?.whyBuilt || "").trim();
  const [isWhyBuiltOpen, setIsWhyBuiltOpen] = useState(false);

  const safeLink = getSafeExternalUrl(project.link);
  const hasLink = Boolean(safeLink);
  const displayUrl = formatDisplayUrl(safeLink || "");

  const showRankBadge = Number.isInteger(overallRank) && overallRank >= 1 && overallRank <= 10;
  const badgeTone =
    overallRank === 1 ? "is-top-1" : overallRank === 2 || overallRank === 3 ? "is-top-3" : "";
  const aiDisclosureBadge = getAiDisclosureBadgeLabel(project?.aiDisclosure);

  return (
    <article className={`battle-card ${tone ? `battle-card--${tone}` : ""}`}>
      <div className="battle-card__image-wrap">
        <ProjectImage
          project={project}
          alt={`${project.name} preview`}
          className="battle-card__image"
          decoding="async"
          loading="eager"
          fetchPriority={imageFetchPriority}
          width={1200}
          height={750}
        />

        {showRankBadge ? (
          <div className={`battle-card__rank-badge ${badgeTone}`}>
            #{overallRank} Overall
          </div>
        ) : null}
      </div>

      <div className="battle-card__body">
        <div className="battle-card__meta-row">
          <div className="battle-card__pills">
            <span className="pill">{project.category}</span>
            {aiDisclosureBadge ? (
              <span className="pill pill--neutral">{aiDisclosureBadge}</span>
            ) : null}
          </div>
          <span className="battle-card__rating">ELO {project.rating}</span>
        </div>

        <div className="battle-card__content">
          <h2 className="battle-card__title">{project.name}</h2>
          <p className="battle-card__tagline">{project.tagline}</p>
          {whyBuilt ? (
            <div
              className="battle-card__why"
              data-open={isWhyBuiltOpen ? "true" : "false"}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="battle-card__why-toggle"
                aria-expanded={isWhyBuiltOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsWhyBuiltOpen((current) => !current);
                }}
              >
                <span className="battle-card__why-label">Why I built this</span>
                <span className="battle-card__why-icon" aria-hidden="true">
                  ›
                </span>
              </button>

              {isWhyBuiltOpen ? (
                <p className="battle-card__why-text">{whyBuilt}</p>
              ) : null}
            </div>
          ) : null}

          <div className="battle-card__url-row">
            <span className="battle-card__url-label">Live at</span>
            <span
              className={`battle-card__url ${
                !hasLink ? "battle-card__url--muted" : ""
              }`}
              title={hasLink ? project.link : "No public URL"}
            >
              {hasLink ? displayUrl : "No public URL"}
            </span>
          </div>

          <div className="battle-card__stats">
            <span>Shipped: {project.wins || 0}</span>
            <span>Skipped: {project.losses || 0}</span>
            <span>Ship rate: {shipRate}%</span>
          </div>
        </div>

        <div className="battle-card__actions">
          {hasLink ? (
            <a
              href={safeLink}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn--secondary btn--md btn--full"
              onClick={(event) => event.stopPropagation()}
            >
              Visit project
            </a>
          ) : (
            <span
              className="btn btn--secondary btn--md btn--full"
              aria-disabled="true"
            >
              No live link
            </span>
          )}

          <button
            type="button"
            className="btn btn--ship btn--md btn--full"
            onClick={onPick}
            disabled={disabled}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

