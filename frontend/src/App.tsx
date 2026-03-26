import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { fetchMe } from "./store/authSlice";

import { HomePage } from "./pages/HomePage";
import { CharityListingPage } from "./pages/CharityListingPage";
import { CharityProfilePage } from "./pages/CharityProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { AuthPage } from "./pages/AuthPage";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchMe() as any);
    }
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/charities" element={<CharityListingPage />} />
          <Route path="/charities/:charityId" element={<CharityProfilePage />} />
          <Route path="/subscription" element={<ProtectedRoute roles={["User", "Admin"]}><SubscriptionPage /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["User", "Admin"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

