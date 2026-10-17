export const ROLE_PATHS = {
  seeker: "/dashboard",
  employer: "/employer-dashboard",
  admin: "/admin-dashboard",
};

export function getSessionUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.id || !user?.role || !ROLE_PATHS[user.role]) return null;
    return user;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("user");
}

export function dashboardPath(role) {
  return ROLE_PATHS[role] || "/login";
}
