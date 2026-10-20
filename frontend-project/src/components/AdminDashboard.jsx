import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearSession, getSessionUser } from "../lib/session";
import { statusClass, statusLabel } from "../lib/status";
import BrandMark from "./BrandMark";

const navigation = [
  { href: "#overview", label: "Overview", icon: "grid" },
  { href: "#applications", label: "Applications", icon: "document" },
  { href: "#companies", label: "Companies", icon: "building" },
  { href: "#students", label: "Students", icon: "users" },
  { href: "#messages", label: "Employer messages", icon: "chat" },
];

function NavIcon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    building: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 21V9h6v12M7 7h.01M12 7h.01M17 7h.01M7 11h.01M17 11h.01" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [employerMessages, setEmployerMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingEmployerId, setUpdatingEmployerId] = useState(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [
        applicationsResponse,
        studentsResponse,
        employersResponse,
        messagesResponse,
      ] = await Promise.all([
        api.get("/admin/applications"),
        api.get("/admin/students"),
        api.get("/admin/employers"),
        api.get("/admin/employer-messages"),
      ]);

      setAdmin(getSessionUser());
      setRequests(applicationsResponse.data.applications);
      setStudents(studentsResponse.data.students);
      setEmployers(employersResponse.data.employers);
      setEmployerMessages(messagesResponse.data.messages);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not load admin data. Please try again."
      );

      if (error.response?.status === 401 || error.response?.status === 403) {
        clearSession();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Load remote dashboard data when the page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
  }, [loadDashboard]);

  const changeStatus = async (applicationId, status) => {
    setUpdatingApplicationId(applicationId);
    setErrorMessage("");
    setMessage("");

    try {
      await api.patch(`/admin/applications/${applicationId}/status`, { status });
      setMessage("Application status updated.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not update application status."
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const updateEmployerStatus = async (employerId, status) => {
    setUpdatingEmployerId(employerId);
    setErrorMessage("");
    setMessage("");

    try {
      await api.patch(`/admin/employers/${employerId}/status`, { status });
      setMessage("Company status updated.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not update company status."
      );
    } finally {
      setUpdatingEmployerId(null);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    clearSession();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
          <p className="text-sm font-semibold text-slate-700">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  const pending = requests.filter((request) => request.status === "pending").length;
  const inProgress = requests.filter((request) => request.status === "reviewing").length;
  const placed = requests.filter((request) => request.status === "accepted").length;
  const pendingCompanies = employers.filter((employer) => employer.status === "pending").length;

  const metrics = [
    {
      label: "Registered students",
      value: students.length,
      detail: "Student accounts",
      color: "bg-blue-50 text-blue-700",
      icon: "users",
    },
    {
      label: "Companies to review",
      value: pendingCompanies,
      detail: "Awaiting approval",
      color: "bg-amber-50 text-amber-700",
      icon: "building",
    },
    {
      label: "Applications in review",
      value: pending + inProgress,
      detail: `${pending} awaiting review`,
      color: "bg-indigo-50 text-indigo-700",
      icon: "document",
    },
    {
      label: "Successful placements",
      value: placed,
      detail: "Confirmed placements",
      color: "bg-emerald-50 text-emerald-700",
      icon: "grid",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <BrandMark size="sm" />
            <div>
              <p className="text-sm font-black tracking-wide text-slate-950">
                GOSAWA
              </p>
              <p className="text-xs font-medium text-slate-500">
                Administration
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {admin?.email || "Administrator"}
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800 sm:flex">
              {(admin?.email?.[0] || "A").toUpperCase()}
            </div>
            <span className="hidden h-8 w-px bg-slate-200 sm:block" />
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-9">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>
            <nav aria-label="Admin dashboard sections" className="mt-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    item.href === "#overview"
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-sm font-bold text-slate-900">GOSAWA LTD</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Connecting talent with opportunity across Rwanda.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <section id="overview" className="scroll-mt-24">
            <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  GOSAWA COMPANY LTD
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Admin dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Manage applications, verify employers, and track placement
                  progress from one workspace.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-800">
                  System operational
                </span>
              </div>
            </div>

            {message && (
              <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <span className="font-bold">Success</span>
                <span>{message}</span>
              </div>
            )}
            {errorMessage && (
              <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <span className="font-bold">Action needed</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                        {metric.value}
                      </p>
                    </div>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.color}`}>
                      <NavIcon name={metric.icon} />
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {metric.detail}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="applications" className="mt-12 scroll-mt-24">
            <SectionHeading
              eyebrow="Talent pipeline"
              title="Student applications"
              description="Review candidate profiles and update each application as it progresses."
            />
            <div className="space-y-4">
              {requests.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="New student applications will appear here."
                />
              ) : (
                requests.map((request) => (
                  <article
                    key={request.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
                  >
                    <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-950">
                            {request.full_name}
                          </h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(request.status)}`}>
                            {statusLabel(request.status)}
                          </span>
                        </div>
                        <a
                          href={`mailto:${request.email}`}
                          className="mt-1 inline-block text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          {request.email}
                        </a>
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span>
                            <strong className="font-semibold text-slate-700">Qualification:</strong>{" "}
                            {request.qualification || "Not provided"}
                          </span>
                          <span>
                            <strong className="font-semibold text-slate-700">TVET school:</strong>{" "}
                            {request.tvet_school || "Not provided"}
                          </span>
                          <span>
                            <strong className="font-semibold text-slate-700">Location:</strong>{" "}
                            {request.student_location || "Not provided"}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={updatingApplicationId !== null}
                          onClick={() => changeStatus(request.id, "reviewing")}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingApplicationId === request.id ? "Updating..." : "Under review"}
                        </button>
                        <button
                          type="button"
                          disabled={updatingApplicationId !== null}
                          onClick={() => changeStatus(request.id, "rejected")}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={updatingApplicationId !== null}
                          onClick={() => changeStatus(request.id, "accepted")}
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirm placement
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Company
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {request.company_name || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Opportunity
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {request.title || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Opportunity location
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {request.location || "Not specified"}
                        </p>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Cover letter
                        </p>
                        <p className="mt-1 whitespace-pre-wrap leading-6 text-slate-700">
                          {request.cover_letter || "No cover letter was included."}
                        </p>
                      </div>
                    </div>
                    {request.placement && (
                      <div className="border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 sm:px-6">
                        Placement confirmed at {request.placement.companyName}
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>

          <section id="companies" className="mt-12 scroll-mt-24">
            <SectionHeading
              eyebrow="Organization management"
              title="Registered companies"
              description="Review company details and approve eligible employers before they publish opportunities."
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {employers.length === 0 ? (
                <div className="xl:col-span-2">
                  <EmptyState
                    title="No companies registered"
                    description="Company registrations will appear here for review."
                  />
                </div>
              ) : (
                employers.map((employer) => (
                  <article
                    key={employer.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <NavIcon name="building" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-950">
                            {employer.company_name}
                          </h3>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {employer.sector || "Sector not provided"}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(employer.status)}`}>
                        {statusLabel(employer.status)}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                      <p className="truncate text-slate-600">{employer.email}</p>
                      <p className="text-slate-600">{employer.location || "Location not provided"}</p>
                    </div>
                    {employer.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                        {employer.description}
                      </p>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {employer.status !== "approved" && (
                        <button
                          type="button"
                          disabled={updatingEmployerId !== null}
                          onClick={() => updateEmployerStatus(employer.id, "approved")}
                          className="rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingEmployerId === employer.id ? "Updating..." : "Approve company"}
                        </button>
                      )}
                      {employer.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={updatingEmployerId !== null}
                          onClick={() => updateEmployerStatus(employer.id, "rejected")}
                          className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      {employer.status === "rejected" && (
                        <button
                          type="button"
                          disabled={updatingEmployerId !== null}
                          onClick={() => updateEmployerStatus(employer.id, "pending")}
                          className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Return to pending
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section id="students" className="mt-12 scroll-mt-24">
            <SectionHeading
              eyebrow="Community"
              title="Registered students"
              description="Browse student profiles and education details."
            />
            {students.length === 0 ? (
              <EmptyState
                title="No students registered"
                description="New student profiles will appear here."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
                <div className="hidden grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(160px,1fr)_minmax(140px,0.8fr)] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
                  <span>Student</span>
                  <span>Qualification</span>
                  <span>TVET school</span>
                  <span>Location</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <article
                      key={student.id}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(160px,1fr)_minmax(140px,0.8fr)] md:items-center md:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-800">
                          {(student.full_name?.[0] || "S").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900">
                            {student.full_name}
                          </h3>
                          <a
                            href={`mailto:${student.email}`}
                            className="block truncate text-xs text-blue-700 hover:underline"
                          >
                            {student.email}
                          </a>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          Qualification
                        </p>
                        <p className="text-sm text-slate-700">
                          {student.qualification || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          TVET school
                        </p>
                        <p className="text-sm text-slate-700">
                          {student.tvet_school || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                          Location
                        </p>
                        <p className="text-sm text-slate-600">
                          {[student.district, student.province].filter(Boolean).join(", ") || "Not provided"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section id="messages" className="mt-12 scroll-mt-24">
            <SectionHeading
              eyebrow="Communications"
              title="Employer messages"
              description="Messages from employers about applicants they have selected for further consideration."
            />
            <div className="space-y-4">
              {employerMessages.length === 0 ? (
                <EmptyState
                  title="No employer messages"
                  description="Messages sent by companies will appear here."
                />
              ) : (
                employerMessages.map((employerMessage) => (
                  <article
                    key={employerMessage.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {employerMessage.company_name}
                        </h3>
                        <a
                          className="mt-0.5 inline-block text-sm font-medium text-blue-700 hover:underline"
                          href={`mailto:${employerMessage.employer_email}`}
                        >
                          {employerMessage.employer_email}
                        </a>
                      </div>
                      <time className="text-xs font-medium text-slate-500">
                        {new Date(employerMessage.created_at).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                      {employerMessage.message}
                    </p>
                    <div className="mt-5">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Selected applicants
                      </h4>
                      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                        {employerMessage.students.map((student) => (
                          <li
                            key={student.applicationId}
                            className="rounded-xl border border-slate-200 px-3.5 py-3"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {student.fullName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {student.opportunityTitle}
                            </p>
                            <a
                              href={`mailto:${student.email}`}
                              className="mt-1 inline-block text-xs text-blue-700 hover:underline"
                            >
                              {student.email}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            GOSAWA LTD · Administration workspace
          </footer>
        </main>
      </div>
    </div>
  );
}
