import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import BattleCard from "../components/battle/BattleCard";
import LeaderboardMini from "../components/leaderboard/LeaderboardMini";
import CategorySelector from "../components/filters/CategorySelector";
import Hero from "../components/layout/hero";
import {
  ALL_CATEGORY_ID,
  getApprovedCategoryCounts,
  getCategoryLabelById,
  getSelectedCategoryId,
} from "../constants/categories";
import {
  getApprovedProjects,
  getEligibleProjects,
  getRankByProjectId,
  getRankedProjects,
  getShipRate,
} from "../lib/leaderboardUtils";
import { updateVote } from "../lib/projectsApi";

function BattleSkeleton({ selectedCategoryId, onSelectCategory, countsById }) {
  const placeholderProject = {
    id: "placeholder",
    name: "Loading…",
    tagline: "Fetching the next duel.",
    link: "",
    imageUrl: "",
    screenshotUrl: "",
    category: selectedCategoryId === ALL_CATEGORY_ID ? "AI" : selectedCategoryId,
    rating: 1200,
    wins: 0,
    losses: 0,
    votes: 0,
    status: "approved",
  };

  return (
    <section className="battle-page battle-page--arena">
      <Hero
        variant="battle"
        eyebrow="Duel arena"
        title="Which project would you ship?"
        copy="Pick the build you would actually ship today."
      />

      <div className="arena-body" aria-busy="true" aria-live="polite">
        <aside className="arena-filter" aria-label="Category filters">
          <CategorySelector
            selectedCategoryId={selectedCategoryId}
            onSelect={onSelectCategory}
            countsById={countsById}
          />
        </aside>

        <div className="arena-duel">
          <div className="battle-grid is-loading">
            <div className="duel-card duel-card--left">
              <BattleCard
                project={placeholderProject}
                overallRank={null}
                tone="ship"
                actionLabel="Loading…"
                onPick={() => {}}
                imageFetchPriority="high"
              />
            </div>

            <div className="battle-versus-wrap" aria-hidden="true">
              <div className="battle-versus">VS</div>
              <div className="battle-versus__hint">Loading matchup</div>
            </div>

            <div className="duel-card duel-card--right">
              <BattleCard
                project={placeholderProject}
                overallRank={null}
                tone="skip"
                actionLabel="Loading…"
                onPick={() => {}}
              />
            </div>
          </div>

          <div className="duel-signal" aria-label="Matchup signal">
            <div className="duel-signal__row">
              <span className="duel-signal__name duel-signal__name--left">
                Loading…
              </span>
              <span className="duel-signal__label">Vibe odds</span>
              <span className="duel-signal__name duel-signal__name--right">
                Loading…
              </span>
            </div>

            <div className="duel-signal__bar" role="progressbar" aria-valuenow={50}>
              <div className="duel-signal__bar-ship" style={{ width: "50%" }} />
            </div>

            <div className="duel-signal__row duel-signal__row--numbers">
              <span className="duel-signal__pct duel-signal__pct--left">50%</span>
              <span className="duel-signal__meta">Loading projects…</span>
              <span className="duel-signal__pct duel-signal__pct--right">50%</span>
            </div>
          </div>

          <div className="arena-footer">
            <button type="button" className="btn btn--danger btn--md" disabled>
              Skip both
            </button>

            <div className="arena-footer__hint">Tip: screenshots matter most.</div>
          </div>
        </div>

        <aside className="arena-rail" aria-label="Live leaderboard">
          <section className="leaders-panel" aria-hidden="true">
            <div className="leaders-panel__head">
              <div className="leaders-panel__headline">
                <p className="leaders-panel__kicker">Live leaderboard</p>
                <h2 className="leaders-panel__title">Loading…</h2>
                <p className="leaders-panel__subline">
                  Top projects by live ship signal
                </p>
              </div>
            </div>

            <div className="leaders-cols" aria-hidden="true">
              <span className="leaders-cols__rank">Rank</span>
              <span className="leaders-cols__project">Project</span>
              <span className="leaders-cols__elo">ELO</span>
              <span className="leaders-cols__ship">Ship %</span>
              <span className="leaders-cols__votes">Votes</span>
            </div>

            <div className="leaders-list" role="list">
              <div className="leaders-item leaders-item--skeleton" role="listitem" />
              <div className="leaders-item leaders-item--skeleton" role="listitem" />
              <div className="leaders-item leaders-item--skeleton" role="listitem" />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getSeededPair(list, seed) {
  if (list.length < 2) return [];

  const rand = mulberry32(seed);
  const firstIndex = Math.floor(rand() * list.length);
  let secondIndex = Math.floor(rand() * (list.length - 1));

  if (secondIndex >= firstIndex) {
    secondIndex += 1;
  }

  return [list[firstIndex], list[secondIndex]];
}

function getEloWinProbability(ratingA, ratingB) {
  const exponent = (ratingB - ratingA) / 400;
  return 1 / (1 + 10 ** exponent);
}

function normalizeProject(project) {
  return {
    ...project,
    name: project.name || "",
    tagline: project.tagline || "",
    link: project.link || "",
    imageUrl: project.imageUrl || "",
    screenshotUrl: project.screenshotUrl || "",
    category: project.category || "Other",
    rating: Number(project.rating || 0),
    wins: Number(project.wins || 0),
    losses: Number(project.losses || 0),
    votes: Number(project.votes || 0),
    status: String(project.status || "").trim().toLowerCase(),
  };
}

export default function Battle({ projects, isLoading, onPublicRefresh }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [matchupSeed, setMatchupSeed] = useState(() => {
    return Math.floor(Math.random() * 0x7fffffff);
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const voteInFlightRef = useRef(false);

  const selectedCategoryId = getSelectedCategoryId(searchParams.get("category"));

  const handleSelectCategory = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (categoryId === ALL_CATEGORY_ID) {
      nextParams.delete("category");
    } else {
      nextParams.set("category", categoryId);
    }

    setSearchParams(nextParams);
    setMatchupSeed((current) => current + 1);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    const suffix =
      selectedCategoryId === ALL_CATEGORY_ID
        ? "Battle"
        : `Battle · ${getCategoryLabelById(selectedCategoryId)}`;

    document.title = `Ship or Skip – ${suffix}`;
  }, [selectedCategoryId]);

  const normalizedProjects = useMemo(() => {
    return projects.map(normalizeProject);
  }, [projects]);

  const approvedProjects = useMemo(() => {
    return getApprovedProjects(normalizedProjects);
  }, [normalizedProjects]);

  const approvedCategoryCounts = useMemo(() => {
    return getApprovedCategoryCounts(approvedProjects);
  }, [approvedProjects]);

  const eligibleApprovedProjects = useMemo(() => {
    return getEligibleProjects(normalizedProjects, selectedCategoryId);
  }, [normalizedProjects, selectedCategoryId]);

  const pair = useMemo(() => {
    return getSeededPair(eligibleApprovedProjects, matchupSeed);
  }, [eligibleApprovedProjects, matchupSeed]);

  const totalVotes = useMemo(
    () =>
      eligibleApprovedProjects.reduce(
        (sum, project) => sum + (project.votes || 0),
        0
      ),
    [eligibleApprovedProjects]
  );

  const rankedProjects = useMemo(() => {
    return getRankedProjects(eligibleApprovedProjects);
  }, [eligibleApprovedProjects]);

  const rankByProjectId = useMemo(() => {
    return getRankByProjectId(rankedProjects);
  }, [rankedProjects]);

  const handleVote = async (winnerId) => {
    if (pair.length < 2 || isTransitioning || voteInFlightRef.current) return;

    const winner = pair.find((project) => project.id === winnerId);
    const loser = pair.find((project) => project.id !== winnerId);

    if (!winner || !loser) return;

    try {
      voteInFlightRef.current = true;
      setIsTransitioning(true);

      console.warn("[vote]", { winnerId: winner.id, loserId: loser.id });

      await updateVote(winner.id, loser.id);

      if (typeof onPublicRefresh === "function") {
        await onPublicRefresh();
      }

      setMatchupSeed((current) => current + 1);
    } catch (error) {
      console.error("Failed to persist vote:", error);
    } finally {
      voteInFlightRef.current = false;
      setIsTransitioning(false);
    }
  };

  const handleSkipMatchup = () => {
    if (isTransitioning || eligibleApprovedProjects.length < 2) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setMatchupSeed((current) => current + 1);
      setIsTransitioning(false);
    }, 150);
  };

  if (isLoading) {
    return (
      <BattleSkeleton
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        countsById={approvedCategoryCounts}
      />
    );
  }

  if (eligibleApprovedProjects.length < 2) {
    const submitHref =
      selectedCategoryId === ALL_CATEGORY_ID
        ? "/submit"
        : `/submit?category=${selectedCategoryId}`;

    const submitLabel =
      selectedCategoryId === ALL_CATEGORY_ID
        ? "Submit a project"
        : `Submit a ${getCategoryLabelById(selectedCategoryId)} project`;

    return (
      <section className="battle-page">
        <CategorySelector
          selectedCategoryId={selectedCategoryId}
          onSelect={handleSelectCategory}
          countsById={approvedCategoryCounts}
        />

        <div className="empty-state">
          {selectedCategoryId === ALL_CATEGORY_ID ? (
            <p>
              Not enough approved projects yet. Add or approve more projects to
              start battles.
            </p>
          ) : eligibleApprovedProjects.length === 0 ? (
            <p>No approved projects in this category yet.</p>
          ) : (
            <p>Only 1 approved project in this category. Need 2 to battle.</p>
          )}

          <div className="empty-state__actions">
            <a href={submitHref} className="btn btn--primary btn--md">
              {submitLabel}
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
        </div>
      </section>
    );
  }

  if (pair.length < 2) {
    return (
      <section className="battle-page">
        <CategorySelector
          selectedCategoryId={selectedCategoryId}
          onSelect={handleSelectCategory}
          countsById={approvedCategoryCounts}
        />
        <div className="empty-state">Loading matchup...</div>
      </section>
    );
  }

  const leftProject = pair[0];
  const rightProject = pair[1];

  const leftOdds = Math.max(
    0,
    Math.min(1, getEloWinProbability(leftProject.rating, rightProject.rating))
  );

  return (
    <section className="battle-page battle-page--arena">
      <Hero
  variant="battle"
  eyebrow="Duel arena"
  title="Which project would you ship?"
  copy="Pick the build you would actually ship today. These are real vibe-coded projects & your votes decide what gets shipped. If neither is ready, skip both."
/>

      <div className="arena-body">
        <aside className="arena-filter" aria-label="Category filters">
          <CategorySelector
            selectedCategoryId={selectedCategoryId}
            onSelect={handleSelectCategory}
            countsById={approvedCategoryCounts}
          />
        </aside>

        <div className="arena-duel">
          <div
            className={`battle-grid ${
              isTransitioning ? "is-transitioning" : ""
            }`}
          >
            <div className="duel-card duel-card--left">
              <BattleCard
                project={leftProject}
                overallRank={rankByProjectId.get(leftProject.id) || null}
                tone="ship"
                actionLabel="Ship this"
                onPick={() => handleVote(leftProject.id)}
                imageFetchPriority="high"
                disabled={isTransitioning}
              />
            </div>

            <div className="battle-versus-wrap" aria-hidden="true">
              <div className="battle-versus">VS</div>
              <div className="battle-versus__hint">Choose a winner</div>
            </div>

            <div className="duel-card duel-card--right">
              <BattleCard
                project={rightProject}
                overallRank={rankByProjectId.get(rightProject.id) || null}
                tone="skip"
                actionLabel="Ship this"
                onPick={() => handleVote(rightProject.id)}
                disabled={isTransitioning}
              />
            </div>
          </div>

          <div className="duel-signal" aria-label="Matchup signal">
            <div className="duel-signal__row">
              <span className="duel-signal__name duel-signal__name--left">
                {leftProject.name}
              </span>
              <span className="duel-signal__label">Vibe odds</span>
              <span className="duel-signal__name duel-signal__name--right">
                {rightProject.name}
              </span>
            </div>

            <div className="duel-signal__row duel-signal__row--stats">
              <span className="duel-signal__stat duel-signal__stat--left">
                ELO {leftProject.rating}
                {" \u00B7 "}
                Ship {getShipRate(leftProject)}%
              </span>
              <span className="duel-signal__label">Signal</span>
              <span className="duel-signal__stat duel-signal__stat--right">
                Ship {getShipRate(rightProject)}%
                {" \u00B7 "}
                ELO {rightProject.rating}
              </span>
            </div>

            <div
              className="duel-signal__bar"
              role="progressbar"
              aria-valuenow={Math.round(leftOdds * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Estimated odds for left project"
            >
              <div
                className="duel-signal__bar-ship"
                style={{ width: `${leftOdds * 100}%` }}
              />
            </div>

            <div className="duel-signal__row duel-signal__row--numbers">
              <span className="duel-signal__pct duel-signal__pct--left">
                {Math.round(leftOdds * 100)}%
              </span>
              <span className="duel-signal__meta">
                {eligibleApprovedProjects.length} approved{" \u00B7 "}
                {totalVotes} ship votes
              </span>
              <span className="duel-signal__pct duel-signal__pct--right">
                {Math.round((1 - leftOdds) * 100)}%
              </span>
            </div>
          </div>

          <div className="arena-footer">
            <button
              type="button"
              className="btn btn--danger btn--md"
              onClick={handleSkipMatchup}
              disabled={isTransitioning}
            >
              Skip both
            </button>

            <div className="arena-footer__hint">
              Tip: screenshots + titles matter most.
            </div>
          </div>
        </div>

        <aside className="arena-rail" aria-label="Live leaderboard">
          <LeaderboardMini
            projects={eligibleApprovedProjects}
            selectedCategoryId={selectedCategoryId}
            limit={5}
          />
        </aside>
      </div>
    </section>
  );
}
