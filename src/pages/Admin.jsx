import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Admin({ isAdmin }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setError("");

      if (!nextUser) {
        setClaims(null);
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(nextUser);
        setClaims(tokenResult?.claims || null);
      } catch (tokenError) {
        console.error("Failed to read token claims:", tokenError);
        setClaims(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsBusy(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (signInError) {
      console.error("Admin sign-in failed:", signInError);
      setError(signInError?.message || "Sign-in failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignOut = async () => {
    setIsBusy(true);
    setError("");

    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error("Sign-out failed:", signOutError);
      setError(signOutError?.message || "Sign-out failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleRefreshClaims = async () => {
    if (!auth.currentUser) return;

    setIsBusy(true);
    setError("");

    try {
      await auth.currentUser.getIdToken(true);
      const tokenResult = await getIdTokenResult(auth.currentUser);
      setClaims(tokenResult?.claims || null);
    } catch (refreshError) {
      console.error("Failed to refresh claims:", refreshError);
      setError(refreshError?.message || "Failed to refresh claims.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="legal-page">
      <div className="hero-block hero-block--tight">
        <p className="hero-block__eyebrow">Admin access</p>
        <h1>Moderation sign-in</h1>
        <p className="hero-block__copy">
          Moderation is protected by Firebase Auth custom claims. You must sign
          in with an account that has the <code>admin: true</code> claim.
        </p>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="empty-state" style={{ paddingTop: 20 }}>
        {!user ? (
          <>
            <p>Sign in to check admin status.</p>
            <button
              type="button"
              className="btn btn--primary btn--md"
              onClick={handleSignIn}
              disabled={isBusy}
            >
              {isBusy ? "Signing in..." : "Sign in with Google"}
            </button>
          </>
        ) : (
          <>
            <p>
              Signed in as <strong>{user.email || user.uid}</strong>
            </p>
            <p>
              Admin claim: <strong>{isAdmin ? "true" : "false"}</strong>
            </p>

            <div className="empty-state__actions">
              <button
                type="button"
                className="btn btn--secondary btn--md"
                onClick={handleRefreshClaims}
                disabled={isBusy}
              >
                {isBusy ? "Refreshing..." : "Refresh claims"}
              </button>

              <button
                type="button"
                className="btn btn--secondary btn--md"
                onClick={handleSignOut}
                disabled={isBusy}
              >
                Sign out
              </button>
            </div>

            <details style={{ marginTop: 18 }}>
              <summary>Token claims (debug)</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(claims, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </section>
  );
}

