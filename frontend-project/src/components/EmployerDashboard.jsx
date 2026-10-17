import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearSession } from "../lib/session";
import { statusClass, statusLabel } from "../lib/status";
import BrandMark from "./BrandMark";

const emptyJob = {
  title: "",
  description: "",
  location: "",
  type: "Internship",
  salary: "",
};

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [sendingAdminMessage, setSendingAdminMessage] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
  const [form, setForm] = useState(emptyJob);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadCompany = useCallback(async () => {
    try {
      const [companyResponse, jobsResponse, applicationsResponse] =
        await Promise.all([
          api.get("/employer/me"),
          api.get("/employer/opportunities"),
          api.get("/employer/applications"),
        ]);

      setCompany(companyResponse.data.employer);
      setJobs(jobsResponse.data.opportunities);
      setApplications(applicationsResponse.data.applications);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not load the employer dashboard. Please try again."
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
    void loadCompany();
  }, [loadCompany]);

  const createJob = async (event) => {
    event.preventDefault();
    setPosting(true);
    setMessage("");
    setErrorMessage("");

    try {
      await api.post("/employer/opportunities", form);
      setForm(emptyJob);
      setMessage("Opportunity published. Students can now apply.");
      await loadCompany();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not publish opportunity."
      );
    } finally {
      setPosting(false);
    }
  };

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplicationIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : [...current, applicationId]
    );
  };

  const updateApplicationStatus = async (applicationId, status) => {
    setUpdatingApplicationId(applicationId);
    setErrorMessage("");
    setMessage("");

    try {
      const response = await api.patch(
        `/employer/applications/${applicationId}/status`,
        { status }
      );
      setMessage(response.data.message);
      await loadCompany();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not update application status."
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const sendAdminMessage = async (event) => {
    event.preventDefault();
    setSendingAdminMessage(true);
    setErrorMessage("");
    setMessage("");

    try {
      const response = await api.post("/employer/admin-messages", {
        applicationIds: selectedApplicationIds,
        message: adminMessage,
      });
      setMessage(response.data.message);
      setAdminMessage("");
      setSelectedApplicationIds([]);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not send your message to the admin."
      );
    } finally {
      setSendingAdminMessage(false);
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
        <p className="font-bold text-blue-600">Loading company dashboard...</p>
      </div>
    );
  }

  const approved = company?.status === "approved";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div>
              <h1 className="font-black">GOSAWA</h1>
              <p className="text-xs text-slate-500">Employer dashboard</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">
          <p className="text-blue-100">Welcome</p>
          <h2 className="mt-2 text-4xl font-black">{company?.company_name}</h2>
          <p className="mt-3">{company?.sector}</p>
          <p className="mt-4 max-w-2xl text-blue-50">
            After GOSAWA approves your company, publish opportunities, review
            applicants, update their status, and message the admin about selected
            students.
          </p>
          <div className="mt-5">
            <span
              className={`rounded-full px-4 py-2 font-bold ${
                approved ? "bg-green-500" : "bg-yellow-500"
              }`}
            >
              Account: {statusLabel(company?.status)}
            </span>
          </div>
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

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-slate-500">Published opportunities</p>
            <h3 className="mt-2 text-4xl font-black text-blue-600">{jobs.length}</h3>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-slate-500">Applicants</p>
            <h3 className="mt-2 text-4xl font-black text-blue-600">
              {applications.length}
            </h3>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-slate-500">Location</p>
            <h3 className="mt-2 text-xl font-black">
              {company?.location || "Not provided"}
            </h3>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border bg-white p-8">
          <h2 className="text-3xl font-black">Publish job / internship</h2>
          <p className="mt-2 text-slate-500">
            {approved
              ? "Students will see this opportunity and can apply from their dashboard."
              : "Your company must be approved by a GOSAWA admin before you can publish."}
          </p>

          <form onSubmit={createJob} className="mt-7">
            <div className="grid gap-5 md:grid-cols-2">
              <input
                name="title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="Job / internship title"
                required
                className="rounded-xl border p-3"
              />
              <select
                name="type"
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
                className="rounded-xl border p-3"
              >
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
                <option value="Training">Training</option>
              </select>
              <input
                name="location"
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
                placeholder="Location"
                className="rounded-xl border p-3"
              />
              <input
                name="salary"
                value={form.salary}
                onChange={(event) =>
                  setForm({ ...form, salary: event.target.value })
                }
                placeholder="Salary / allowance"
                className="rounded-xl border p-3"
              />
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Describe the opportunity, requirements and responsibilities..."
              rows="6"
              required
              className="mt-5 w-full rounded-xl border p-3"
            />
            <button
              type="submit"
              disabled={posting || !approved}
              className="mt-5 rounded-xl bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {posting ? "Publishing..." : "Publish opportunity"}
            </button>
          </form>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">My opportunities</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {jobs.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8">
                <p className="text-slate-500">
                  You have not published any opportunity yet.
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border bg-white p-6">
                  <div className="flex justify-between gap-4">
                    <h3 className="text-xl font-black">{job.title}</h3>
                    <span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                      {job.type}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-500">{job.description}</p>
                  {job.location && (
                    <p className="mt-4 text-sm text-slate-500">{job.location}</p>
                  )}
                  {job.salary && (
                    <p className="mt-2 text-sm text-slate-500">{job.salary}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Applicants</h2>
          <p className="mt-2 text-slate-500">
            Shortlist or reject candidates, then message GOSAWA admin about the
            students you want placed.
          </p>
          <form onSubmit={sendAdminMessage} className="mt-5 rounded-xl border bg-white p-5">
            <label htmlFor="adminMessage" className="mb-2 block font-semibold">
              Message the admin about selected applicants
            </label>
            <textarea
              id="adminMessage"
              value={adminMessage}
              onChange={(event) => setAdminMessage(event.target.value)}
              maxLength={2000}
              required
              rows={4}
              placeholder="Write your message for the admin"
              className="w-full rounded-lg border p-3"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-slate-600">
                {selectedApplicationIds.length} applicant(s) selected
              </span>
              <button
                type="submit"
                disabled={sendingAdminMessage || selectedApplicationIds.length === 0}
                className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {sendingAdminMessage ? "Sending..." : "Send to admin"}
              </button>
            </div>
          </form>
          <div className="mt-6 space-y-4">
            {applications.length === 0 ? (
              <p className="text-slate-500">No applications have been received yet.</p>
            ) : (
              applications.map((application) => (
                <article key={application.id} className="rounded-xl border bg-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{application.full_name}</h3>
                      <a className="text-blue-700" href={`mailto:${application.email}`}>
                        {application.email}
                      </a>
                      {application.telephone && (
                        <p className="text-sm text-slate-500">{application.telephone}</p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(application.status)}`}
                    >
                      {statusLabel(application.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {application.title} · {application.qualification}
                    {application.tvet_school ? ` · ${application.tvet_school}` : ""}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-slate-700">
                    {application.cover_letter || "No cover letter provided."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updatingApplicationId === application.id}
                      onClick={() => updateApplicationStatus(application.id, "reviewing")}
                      className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-700 disabled:opacity-50"
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      disabled={updatingApplicationId === application.id}
                      onClick={() => updateApplicationStatus(application.id, "accepted")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={updatingApplicationId === application.id}
                      onClick={() => updateApplicationStatus(application.id, "rejected")}
                      className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                  <label className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedApplicationIds.includes(application.id)}
                      onChange={() => toggleApplicationSelection(application.id)}
                    />
                    Include this applicant in the admin message
                  </label>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
