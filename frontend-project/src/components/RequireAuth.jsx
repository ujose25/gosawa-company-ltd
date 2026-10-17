import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../lib/api";
import { clearSession, dashboardPath, saveSession } from "../lib/session";

function useSessionUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let active = true;

    api.get("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        saveSession(data.user);
        setUser(data.user);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return user;
}

function SessionLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="font-bold text-blue-600">Checking your session...</p>
    </div>
  );
}

export default function RequireAuth({ roles, children }) {
  const user = useSessionUser();

  if (user === undefined) return <SessionLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }
  return children;
}

export function GuestOnly({ children }) {
  const user = useSessionUser();

  if (user === undefined) return <SessionLoading />;
  if (user) return <Navigate to={dashboardPath(user.role)} replace />;
  return children;
}
