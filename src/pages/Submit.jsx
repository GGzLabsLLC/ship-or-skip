import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ALL_CATEGORY_ID,
  getCategoryLabelById,
  getSelectedCategoryId,
} from "../constants/categories";
import { createProject } from "../lib/projectsApi";

const CATEGORY_OPTIONS = [
  "AI",
  "SaaS",
  "Dev Tools",
  "Gaming",
  "Productivity",
  "Social",
  "Marketplace",
];

const initialForm = {
  name: "",
  tagline: "",
  link: "",
  category: "AI",
};

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE_MB = 3;

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function CategoryDropdown({ value, onChange }) {
  const detailsRef = useRef(null);

  const handlePick = (nextValue) => {
    onChange(nextValue);

    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details ref={detailsRef} className="select-pop">
      <summary className="select-pop__trigger">
        <span className="select-pop__value">{value}</span>
        <span className="select-pop__chevron" aria-hidden="true">
          ▼
        </span>
      </summary>

      <div className="select-pop__menu" role="listbox" aria-label="Category">
        {CATEGORY_OPTIONS.map((option) => {
          const isSelected = option === value;

          return (
            <button
              key={option}
              type="button"
              className={`select-pop__option ${isSelected ? "is-selected" : ""}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => handlePick(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </details>
  );
}

export default function Submit({ refreshProjects }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const seededCategoryId = getSelectedCategoryId(searchParams.get("category"));
  const seededCategoryLabel =
    seededCategoryId === ALL_CATEGORY_ID
      ? ""
      : getCategoryLabelById(seededCategoryId);

  const [form, setForm] = useState(() => ({
    ...initialForm,
    category: seededCategoryLabel || initialForm.category,
  }));
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewUrl = useMemo(() => {
    if (!screenshotFile) return "";
    return URL.createObjectURL(screenshotFile);
  }, [screenshotFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setScreenshotFile(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP screenshot.");
      event.target.value = "";
      setScreenshotFile(null);
      return;
    }

    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Screenshot must be ${MAX_FILE_SIZE_MB}MB or smaller.`);
      event.target.value = "";
      setScreenshotFile(null);
      return;
    }

    setError("");
    setScreenshotFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedTagline = form.tagline.trim();
    const trimmedLink = form.link.trim();

    setSuccess("");

    if (!trimmedName || !trimmedTagline || !trimmedLink || !screenshotFile) {
      setError("Please fill out all fields and upload a homepage screenshot.");
      return;
    }

    if (!isValidUrl(trimmedLink)) {
      setError("Please enter a valid http(s) project URL.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createProject({
        name: trimmedName,
        tagline: trimmedTagline,
        link: trimmedLink,
        category: form.category,
        screenshotFile,
      });

      if (refreshProjects) {
        await refreshProjects();
      }

      setForm(initialForm);
      setScreenshotFile(null);
      setSuccess("Submitted! Your project is now pending moderation review.");
      navigate("/submit", { replace: true });
    } catch (submitError) {
      console.error("Failed to submit project:", submitError);
      setError(
        submitError.message ||
          "Something went wrong while submitting. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="submit-page">
      <div className="submit-layout">
        <div className="submit-main">
          <div className="hero-block hero-block--tight">
            <p className="hero-block__eyebrow">Submit a build</p>
            <h1>Get your project reviewed</h1>
            <p className="hero-block__copy">
              Add your project to Ship or Skip. New submissions enter review
              first before they go live in battles and rankings.
            </p>
          </div>

          <form className="submit-form" onSubmit={handleSubmit}>
            <div className="submit-form__section">
              <div className="submit-form__section-head">
                <h2>Project details</h2>
                <p>
                  Drop the basics so builders can understand what they&apos;re
                  voting on.
                </p>
              </div>

              <label className="form-field">
                <span>Project name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="ZeroDays"
                  value={form.name}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Tagline</span>
                <input
                  type="text"
                  name="tagline"
                  placeholder="Train smarter. Ship ready."
                  value={form.tagline}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Project URL</span>
                <input
                  type="url"
                  name="link"
                  placeholder="https://yourproject.com"
                  value={form.link}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="submit-form__section">
              <div className="submit-form__section-head">
                <h2>Visual preview</h2>
                <p>
                  Your homepage screenshot will appear in battle cards and
                  rankings.
                </p>
              </div>

              <div className="form-field">
                <span>Homepage screenshot</span>

                <label className="upload-shell">
                  <input
                    className="upload-shell__input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                  />

                  <span className="upload-shell__icon" aria-hidden="true">
                    ↑
                  </span>

                  <span className="upload-shell__text">
                    <strong>
                      {screenshotFile
                        ? screenshotFile.name
                        : "Choose a screenshot"}
                    </strong>
                    <small>PNG, JPG, or WEBP up to {MAX_FILE_SIZE_MB}MB</small>
                  </span>

                  <span className="upload-shell__button">
                    {screenshotFile ? "Replace file" : "Browse"}
                  </span>
                </label>
              </div>

              {previewUrl ? (
                <div className="form-preview">
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="form-preview__image"
                    decoding="async"
                    width="1200"
                    height="750"
                  />
                </div>
              ) : null}

              <label className="form-field">
                <span>Category</span>
                <CategoryDropdown
                  value={form.category}
                  onChange={(nextCategory) => {
                    setForm((prev) => ({
                      ...prev,
                      category: nextCategory,
                    }));
                  }}
                />
              </label>
            </div>

            {error ? <div className="form-error">{error}</div> : null}
            {success ? <div className="form-success">{success}</div> : null}

            <div className="submit-form__actions">
              <button
                type="submit"
                className="btn btn--primary btn--lg btn--full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit build"}
              </button>

              <p className="submit-form__note">
                Submissions are reviewed before they go live in battles.
              </p>
            </div>
          </form>
        </div>

        <aside className="submit-sidecard">
          <div className="submit-sidecard__eyebrow">What happens next</div>
          <h3>Built for real project feedback</h3>

          <div className="submit-sidecard__steps">
            <div className="submit-step">
              <span className="submit-step__num">1</span>
              <div>
                <strong>You submit your build</strong>
                <p>Project details and screenshot get sent in for review.</p>
              </div>
            </div>

            <div className="submit-step">
              <span className="submit-step__num">2</span>
              <div>
                <strong>It gets approved</strong>
                <p>
                  Approved builds enter the live battle rotation and
                  leaderboard.
                </p>
              </div>
            </div>

            <div className="submit-step">
              <span className="submit-step__num">3</span>
              <div>
                <strong>Builders vote</strong>
                <p>Each Ship vote helps push standout projects upward.</p>
              </div>
            </div>
          </div>

          <div className="submit-sidecard__tip">
            <strong>Best results:</strong>
            <span>
              use a clean homepage screenshot with your main hero section
              visible.
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
