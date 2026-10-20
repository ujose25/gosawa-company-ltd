import { Routes, Route, Link } from "react-router-dom";

import Home from "./Home.jsx";
import Register from "./Register.jsx";
import Login from "./login.jsx";
import Dashboard from "./Dashboard.jsx";
import EmployerRegister from "./EmployerRegister.jsx";
import EmployerDashboard from "./EmployerDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";
import RequireAuth, { GuestOnly } from "./RequireAuth.jsx";

function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={(
          <RequireAuth roles={["seeker"]}>
            <Dashboard />
          </RequireAuth>
        )}
      />
      <Route path="/employer-register" element={<GuestOnly><EmployerRegister /></GuestOnly>} />
      <Route
        path="/employer-dashboard"
        element={(
          <RequireAuth roles={["employer"]}>
            <EmployerDashboard />
          </RequireAuth>
        )}
      />
      <Route
        path="/admin-dashboard"
        element={(
          <RequireAuth roles={["admin"]}>
            <AdminDashboard />
          </RequireAuth>
        )}
      />
      <Route
        path="*"
        element={(
          <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
            <h1 className="text-3xl font-black text-slate-900">Page not found</h1>
            <p className="text-slate-600">The page you requested does not exist.</p>
            <Link to="/" className="font-bold text-blue-700 hover:underline">
              Return to home
            </Link>
          </main>
        )}
      />
    </Routes>
  );
}

export default AppRoute;
