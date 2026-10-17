import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearSession } from "../lib/session";
import { statusClass, statusLabel } from "../lib/status";
import BrandMark from "./BrandMark";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    opportunityId: "",
    coverLetter: "",
  });

  const loadDashboard = useCallback(async () => {
    try {
      const [profileResponse, applicationsResponse, opportunitiesResponse] =
        await Promise.all([
          api.get("/seeker/me"),
          api.get("/seeker/applications"),
          api.get("/seeker/opportunities"),
        ]);

      setUser(profileResponse.data.user);
      setRequests(applicationsResponse.data.applications);
      setOpportunities(opportunitiesResponse.data.opportunities);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not load your dashboard. Please try again."
      );

      if (error.response?.status === 401) {
        clearSession();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const submitRequest = async (event) => {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await api.post("/seeker/applications", {
        opportunityId: Number(form.opportunityId),
        coverLetter: form.coverLetter,
      });
      const applicationsResponse = await api.get("/seeker/applications");
      setRequests(applicationsResponse.data.applications);
      setForm({ opportunityId: "", coverLetter: "" });
      setMessage(response.data.message || "Application submitted successfully.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not submit your application."
      );
    } finally {
      setSending(false);
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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-bold text-blue-600">Loading student dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div>
              <h1 className="font-black text-slate-900">GOSAWA</h1>
              <p className="text-xs text-slate-500">Student dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden font-semibold text-slate-700 md:block">
              {user?.full_name}
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">
          <p className="font-semibold text-blue-100">Welcome back</p>
          <h2 className="mt-2 text-4xl font-black">{user?.full_name}</h2>
          <p className="mt-3">{user?.qualification}</p>
          <p className="mt-4 max-w-2xl text-blue-50">
            Apply to opportunities posted by approved companies. GOSAWA and the
            employer review your application and update the status here.
          </p>
        </section>

        {message && (
          <div className="mt-6 rounded-xl bg-blue-100 p-4 font-semibold text-blue-700">
            {message}
          </div>
        )}
        {errorMessage && (
          <div role="alert" className="mt-4 rounded-lg bg-red-100 p-4 text-red-800">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 rounded-2xl border bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">My profile</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Full name</p>
              <p className="mt-1 font-bold">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 font-bold">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="mt-1 font-bold">{user?.location}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">TVET school</p>
              <p className="mt-1 font-bold">{user?.tvet_school}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Qualification</p>
              <p className="mt-1 font-bold text-blue-600">{user?.qualification}</p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            Apply
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Apply to an opportunity
          </h2>
          <p className="mt-2 text-slate-500">
            Choose a live job, internship, or training posted by an approved employer.
          </p>

          <form onSubmit={submitRequest} className="mt-7">
            <select
              name="opportunityId"
              value={form.opportunityId}
              onChange={(event) =>
                setForm({ ...form, opportunityId: event.target.value })
              }
              required
              className="w-full rounded-xl border p-3 md:max-w-xl"
            >
              <option value="">Select an opportunity</option>
              {opportunities.map((opportunity) => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.title} — {opportunity.company_name}
                </option>
              ))}
            </select>

            {opportunities.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                No open opportunities yet. Check back after companies are approved
                and publish roles.
              </p>
            )}

            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={(event) =>
                setForm({ ...form, coverLetter: event.target.value })
              }
              placeholder="Cover letter (optional)"
              rows="6"
              className="mt-5 w-full rounded-xl border p-3"
            />

            <button
              type="submit"
              disabled={sending || opportunities.length === 0}
              className="mt-5 rounded-xl bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send application"}
            </button>
          </form>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black text-slate-900">My applications</h2>
          <div className="mt-6 space-y-5">
            {requests.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8">
                <p className="text-slate-500">You have not sent any application yet.</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="rounded-2xl border bg-white p-6">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black">{request.title}</h3>
                      <p className="mt-1 font-bold text-blue-600">
                        {request.company_name}
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-4 py-2 text-sm font-bold ${statusClass(request.status)}`}
                    >
                      {statusLabel(request.status)}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-500">
                    {request.cover_letter || "No cover letter was included."}
                  </p>
                  <p className="mt-4 text-sm text-slate-500">
                    {request.location || "Location not specified"}
                  </p>
                  {request.placement && (
                    <div className="mt-6 border-t pt-6">
                      <h4 className="text-lg font-black text-green-700">
                        Placement
                      </h4>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-slate-500">Company</p>
                          <p className="font-bold">{request.placement.companyName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Location</p>
                          <p className="font-bold">
                            {request.placement.companyLocation || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Opportunity</p>
                          <p className="font-bold">{request.placement.opportunity}</p>
                        </div>
                        {request.placement.contact && (
                          <div>
                            <p className="text-sm text-slate-500">Contact</p>
                            <p className="font-bold">{request.placement.contact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
