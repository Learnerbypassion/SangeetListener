import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppLayout from "./components/Layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import MyLibrary from "./pages/MyLibrary";
import ArtistProfile from "./pages/ArtistProfile";
import Settings from "./pages/Settings";
import ArtistDashboard from "./pages/ArtistDashboard";
import ArtistUpload from "./pages/ArtistUpload";
import ArtistAnalytics from "./pages/ArtistAnalytics";
import NotFound from "./pages/NotFound";
import PlaylistDetail from "./pages/PlaylistDetail";
import CategoryPage from "./pages/CategoryPage";

// Auth guard — reads from context, NEVER refetches
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
          refresh
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// Artist guard — redirect home if not an artist
function ArtistGuard() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== "Artist") return <Navigate to="/" replace />;
  return <Outlet />;
}

// Guest guard — redirect to home if already logged in
function GuestGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
          refresh
        </span>
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <ToastProvider>
          <AuthProvider>
            <PlayerProvider>
              <Routes>
                {/* Public routes (redirect to home if logged in) */}
                <Route element={<GuestGuard />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-otp" element={<OtpVerification />} />
                </Route>

                {/* Protected routes (require auth) */}
                <Route element={<AuthGuard />}>
                  <Route element={<AppLayout />}>
                    {/* Unified home — same for ALL roles */}
                    <Route index element={<Home />} />
                    <Route path="home" element={<Home />} />
                    <Route path="explore" element={<Explore />} />
                    <Route path="explore/:category" element={<CategoryPage />} />
                    <Route path="search" element={<Search />} />
                    <Route path="library" element={<MyLibrary />} />
                    <Route path="playlist/:id" element={<PlaylistDetail />} />
                    <Route path="artist/:id" element={<ArtistProfile />} />
                    <Route path="settings" element={<Settings />} />

                    {/* Artist Studio — additive routes for artists only */}
                    <Route element={<ArtistGuard />}>
                      <Route path="studio" element={<ArtistDashboard />} />
                      <Route path="studio/upload" element={<ArtistUpload />} />
                      <Route path="studio/analytics" element={<ArtistAnalytics />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </PlayerProvider>
          </AuthProvider>
        </ToastProvider>
      </NotificationProvider>
    </Router>
  );
}
