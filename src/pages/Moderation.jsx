import { useEffect, useMemo, useState } from "react";
import {
  approveProject,
  fetchAllProjectsForAdmin,
  rejectProject,
  restoreProjectToPending,
} from "../lib/projectsApi";
import { getSafeExternalUrl } from "../lib/url";
import ProjectImage from "../components/ProjectImage";

function formatSubmissionTime(value) {
  if (!value) return "Unknown";

  if (typeof value?.toDate === "function") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(value.toDate());
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getTimeValue(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortByUpdatedDesc(list) {
  return [...list].sort((a, b) => {
    return getTimeValue(b.statusUpdatedAt) - getTimeValue(a.statusUpdatedAt);
  });
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

export default function Moderation({ isAdmin, onPublicRefresh }) {
  const [busyProjectId, setBusyProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getSafeLink = (project) => getSafeExternalUrl(project?.link || "");

  const refreshAdminProjects = async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await fetchAllProjectsForAdmin();
      setProjects(data);
    } catch (loadError) {
      console.error("Failed to load moderation projects:", loadError);
      setError(loadError?.message || "Failed to load submissions.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const timeoutId = setTimeout(() => {
      void refreshAdminProjects();
    }, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const pendingProjects = useMemo(() => {
    return [...projects]
      .filter((project) => normalizeStatus(project.status) === "pending")
      .sort((a, b) => getTimeValue(b.submittedAt) - getTimeValue(a.submittedAt));
  }, [projects]);

  const approvedProjects = useMemo(() => {
    return sortByUpdatedDesc(
      projects.filter((project) => normalizeStatus(project.status) === "approved")
    ).slice(0, 8);
  }, [projects]);

  const rejectedProjects = useMemo(() => {
    return sortByUpdatedDesc(
      projects.filter((project) => normalizeStatus(project.status) === "rejected")
    ).slice(0, 8);
  }, [projects]);

  const handleApprove = async (projectId) => {
    try {
      setBusyProjectId(projectId);
      await approveProject(projectId);
      await refreshAdminProjects();
      if (typeof onPublicRefresh === "function") {
        await onPublicRefresh();
      }
    } catch (error) {
      console.error("Failed to approve project:", error);
    } finally {
      setBusyProjectId("");
    }
  };

  const handleReject = async (projectId) => {
    try {
      setBusyProjectId(projectId);
      await rejectProject(projectId);
      await refreshAdminProjects();
      if (typeof onPublicRefresh === "function") {
        await onPublicRefresh();
      }
    } catch (error) {
      console.error("Failed to reject project:", error);
    } finally {
      setBusyProjectId("");
    }
  };

  const handleRestoreToPending = async (projectId) => {
    try {
      setBusyProjectId(projectId);
      await restoreProjectToPending(projectId);
      await refreshAdminProjects();
      if (typeof onPublicRefresh === "function") {
        await onPublicRefresh();
      }
    } catch (error) {
      console.error("Failed to restore project:", error);
    } finally {
      setBusyProjectId("");
    }
  };

  const totalApproved = useMemo(() => {
    return projects.filter((project) => normalizeStatus(project.status) === "approved")
      .length;
  }, [projects]);

  const totalRejected = useMemo(() => {
    return projects.filter((project) => normalizeStatus(project.status) === "rejected")
      .length;
  }, [projects]);

  return (
    <section className="moderation-page">
      <div className="hero-block hero-block--tight">
        <p className="hero-block__eyebrow">Submission review</p>
        <h1>Moderation</h1>
        <p className="hero-block__copy">
          Review pending submissions, approve the strongest builds, and keep a visible history of moderation decisions.
        </p>
      </div>

      {isLoading ? (
        <div className="empty-state">Loading moderation…</div>
      ) : null}

      {error ? <div className="form-error">{error}</div> : null}

      <div className="moderation-summary">
        <div className="moderation-summary__card">
          <span className="moderation-summary__label">Pending</span>
          <strong>{pendingProjects.length}</strong>
        </div>

        <div className="moderation-summary__card">
          <span className="moderation-summary__label">Approved</span>
          <strong>{totalApproved}</strong>
        </div>

        <div className="moderation-summary__card">
          <span className="moderation-summary__label">Rejected</span>
          <strong>{totalRejected}</strong>
        </div>
      </div>

      <section className="moderation-section">
        <div className="moderation-section__header">
          <h2>Pending review</h2>
          <span>{pendingProjects.length} waiting</span>
        </div>

        {!pendingProjects.length ? (
          <div className="empty-state">No pending submissions right now.</div>
        ) : (
          <div className="moderation-grid">
            {pendingProjects.map((project) => (
              <article key={project.id} className="moderation-card">
                <div className="moderation-card__image-wrap">
                  <ProjectImage
                    project={project}
                    alt={`${project.name} preview`}
                    className="moderation-card__image"
                    decoding="async"
                    loading="lazy"
                    width={1200}
                    height={750}
                  />
                </div>

                <div className="moderation-card__body">
                  <div className="moderation-card__topline">
                    <span className="pill">{project.category}</span>
                    <span className="moderation-status">Pending</span>
                  </div>

                  <h2 className="moderation-card__title">{project.name}</h2>
                  <p className="moderation-card__tagline">{project.tagline}</p>

                  <div className="moderation-card__meta">
                    <span>Submitted</span>
                    <strong>{formatSubmissionTime(project.submittedAt)}</strong>
                  </div>

                  {getSafeLink(project) ? (
                    <a
                      href={getSafeLink(project)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="moderation-card__link"
                    >
                      Visit project
                    </a>
                  ) : (
                    <span className="moderation-card__link" aria-disabled="true">
                      No live link
                    </span>
                  )}

                  <div className="moderation-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--md btn--full"
                      onClick={() => handleApprove(project.id)}
                      disabled={isLoading || busyProjectId === project.id}
                    >
                      {busyProjectId === project.id ? "Working..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="btn btn--secondary btn--md btn--full"
                      onClick={() => handleReject(project.id)}
                      disabled={isLoading || busyProjectId === project.id}
                    >
                      {busyProjectId === project.id ? "Working..." : "Reject"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="moderation-history-grid">
        <section className="moderation-history-panel">
          <div className="moderation-section__header">
            <h2>Recently approved</h2>
            <span>{approvedProjects.length} shown</span>
          </div>

          {!approvedProjects.length ? (
            <div className="empty-state">No approved projects yet.</div>
          ) : (
            <div className="moderation-history-list">
              {approvedProjects.map((project) => (
                <article key={project.id} className="moderation-history-item">
                  <div className="moderation-history-item__main">
                    <div className="moderation-history-item__name">
                      {project.name}
                    </div>
                    <div className="moderation-history-item__meta">
                      <span>{project.category}</span>
                      <span>
                        Approved {formatSubmissionTime(project.statusUpdatedAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn--secondary btn--md"
                    onClick={() => handleRestoreToPending(project.id)}
                    disabled={isLoading || busyProjectId === project.id}
                  >
                    {busyProjectId === project.id ? "Working..." : "Restore"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="moderation-history-panel">
          <div className="moderation-section__header">
            <h2>Recently rejected</h2>
            <span>{rejectedProjects.length} shown</span>
          </div>

          {!rejectedProjects.length ? (
            <div className="empty-state">No rejected projects yet.</div>
          ) : (
            <div className="moderation-history-list">
              {rejectedProjects.map((project) => (
                <article key={project.id} className="moderation-history-item">
                  <div className="moderation-history-item__main">
                    <div className="moderation-history-item__name">
                      {project.name}
                    </div>
                    <div className="moderation-history-item__meta">
                      <span>{project.category}</span>
                      <span>
                        Rejected {formatSubmissionTime(project.statusUpdatedAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn--secondary btn--md"
                    onClick={() => handleRestoreToPending(project.id)}
                    disabled={isLoading || busyProjectId === project.id}
                  >
                    {busyProjectId === project.id ? "Working..." : "Restore"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
