import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Battle from "./pages/Battle";
import Leaderboard from "./pages/Leaderboard";
import Submit from "./pages/Submit";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Contact from "./pages/Contact";
import { auth } from "./lib/firebase";
import { fetchApprovedProjects } from "./lib/projectsApi";

const Admin = lazy(() => import("./pages/Admin"));
const Moderation = lazy(() => import("./pages/Moderation"));

export default function App() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const tokenResult = await getIdTokenResult(user);
        setIsAdmin(tokenResult?.claims?.admin === true);
      } catch (error) {
        console.error("Failed to resolve admin claims:", error);
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAndSetProjects = useCallback(async () => {
    try {
      const data = await fetchApprovedProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      await fetchAndSetProjects();
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    }
  }, [fetchAndSetProjects]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);

      try {
        await fetchAndSetProjects();
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Avoid refetch loops until auth state is known.
    if (authReady) {
      load();
    }
  }, [authReady, fetchAndSetProjects]);

  const handleResetProjects = () => {
    if (import.meta.env.DEV) {
      console.warn("Reset season is not wired for Firestore yet.");
    }
  };

  return (
    <div className="app-shell">
      <Header onResetProjects={handleResetProjects} isAdmin={isAdmin} />

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/battle" replace />} />

          <Route
            path="/battle"
            element={
              <Battle
                projects={projects}
                isLoading={isLoading}
                onPublicRefresh={refreshProjects}
              />
            }
          />

          <Route
            path="/leaderboard"
            element={<Leaderboard projects={projects} />}
          />

          <Route
            path="/submit"
            element={<Submit refreshProjects={refreshProjects} />}
          />

          <Route
            path="/admin"
            element={
              <Suspense fallback={<section className="empty-state">Loading…</section>}>
                <Admin isAdmin={isAdmin} />
              </Suspense>
            }
          />

          <Route
            path="/moderation"
            element={
              isAdmin ? (
                <Suspense fallback={<section className="empty-state">Loading…</section>}>
                  <Moderation isAdmin={isAdmin} onPublicRefresh={refreshProjects} />
                </Suspense>
              ) : (
                <Navigate to="/admin" replace />
              )
            }
          />

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
