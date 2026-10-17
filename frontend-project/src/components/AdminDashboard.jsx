import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearSession } from "../lib/session";
import { statusClass, statusLabel } from "../lib/status";
import BrandMark from "./BrandMark";

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

      setAdmin(JSON.parse(localStorage.getItem("user") || "{}"));
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
    void loadDashboard();
  }, [loadDashboard]);

  const changeStatus = async (applicationId, status) => {
    try {
      await api.patch(`/admin/applications/${applicationId}/status`, { status });
      setMessage("Application status updated.");
      setErrorMessage("");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not update application status."
      );
      setMessage("");
    }
  };

  const updateEmployerStatus = async (employerId, status) => {
    setUpdatingEmployerId(employerId);
    setErrorMessage("");

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-bold text-blue-600">Loading GOSAWA Admin...</p>
      </div>
    );
  }

  const pending = requests.filter((request) => request.status === "pending").length;
  const inProgress = requests.filter((request) => request.status === "reviewing").length;
  const placed = requests.filter((request) => request.status === "accepted").length;
  const pendingCompanies = employers.filter((employer) => employer.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div>
              <h1 className="font-black">GOSAWA</h1>
              <p className="text-xs text-slate-500">Admin dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-semibold md:block">{admin?.email}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">
          <p className="text-blue-100">GOSAWA COMPANY LTD</p>
          <h2 className="mt-2 text-4xl font-black">Admin dashboard</h2>
          <p className="mt-3 max-w-2xl">
            You sit between students and employers: approve companies, review
            applications, confirm placements, and read employer messages.
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

        <section className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-slate-500">Students</p>
            <h3 className="mt-2 text-4xl font-black text-blue-600">{students.length}</h3>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-slate-500">Companies waiting</p>
            <h3 className="mt-2 text-4xl font-black text-yellow-600">{pendingCompanies}</h3>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-slate-500">Applications in review</p>
            <h3 className="mt-2 text-4xl font-black text-blue-600">
              {pending + inProgress}
            </h3>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-slate-500">Placed</p>
            <h3 className="mt-2 text-4xl font-black text-green-600">{placed}</h3>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Student applications</h2>
          <p className="mt-2 text-slate-500">
            Accepting an application marks the student as placed at that company.
          </p>
          <div className="mt-7 space-y-5">
            {requests.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8">
                <p className="text-slate-500">No student applications yet.</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="rounded-2xl border bg-white p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div>
                      <h3 className="text-xl font-black">{request.full_name}</h3>
                      <p className="font-semibold text-blue-600">{request.email}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Qualification: <strong>{request.qualification}</strong>
                      </p>
                      <p className="text-sm text-slate-500">
                        TVET school: {request.tvet_school}
                      </p>
                      <p className="text-sm text-slate-500">
                        Student location: {request.student_location}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => changeStatus(request.id, "reviewing")}
                        className="rounded-lg bg-blue-100 px-4 py-2 font-bold text-blue-700"
                      >
                        Mark under review
                      </button>
                      <button
                        onClick={() => changeStatus(request.id, "rejected")}
                        className="rounded-lg bg-red-100 px-4 py-2 font-bold text-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => changeStatus(request.id, "accepted")}
                        className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white"
                      >
                        Confirm placement
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 border-t pt-5">
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="mt-1 font-semibold">{request.company_name}</p>
                    <p className="mt-3 text-sm text-slate-500">Opportunity</p>
                    <p className="font-semibold">{request.title}</p>
                    <p className="mt-3 text-sm text-slate-500">Opportunity location</p>
                    <p className="font-semibold">
                      {request.location || "Not specified"}
                    </p>
                    <p className="mt-3 text-sm text-slate-500">Cover letter</p>
                    <p className="mt-1 text-slate-700">
                      {request.cover_letter || "No cover letter was included."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-bold ${statusClass(request.status)}`}
                    >
                      {statusLabel(request.status)}
                    </span>
                    {request.placement && (
                      <div className="text-sm font-semibold text-green-700">
                        Placed at {request.placement.companyName}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Registered companies</h2>
          <p className="mt-2 text-slate-500">
            Approve a company before it can publish opportunities that students see.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {employers.length === 0 ? (
              <p className="text-slate-500">No companies have registered yet.</p>
            ) : (
              employers.map((employer) => (
                <div key={employer.id} className="rounded-2xl border bg-white p-6">
                  <h3 className="text-xl font-black">{employer.company_name}</h3>
                  <p className="mt-1 font-semibold text-blue-600">{employer.sector}</p>
                  <p className="mt-2 text-slate-500">{employer.location}</p>
                  <p className="mt-1 text-sm text-slate-500">{employer.email}</p>
                  <span
                    className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-bold ${statusClass(employer.status)}`}
                  >
                    {statusLabel(employer.status)}
                  </span>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {employer.status !== "approved" && (
                      <button
                        type="button"
                        disabled={updatingEmployerId === employer.id}
                        onClick={() => updateEmployerStatus(employer.id, "approved")}
                        className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {employer.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={updatingEmployerId === employer.id}
                        onClick={() => updateEmployerStatus(employer.id, "rejected")}
                        className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    {employer.status === "rejected" && (
                      <button
                        type="button"
                        disabled={updatingEmployerId === employer.id}
                        onClick={() => updateEmployerStatus(employer.id, "pending")}
                        className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
                      >
                        Move back to pending
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Registered students</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {students.length === 0 ? (
              <p className="text-slate-500">No students have registered yet.</p>
            ) : (
              students.map((student) => (
                <div key={student.id} className="rounded-2xl border bg-white p-6">
                  <h3 className="text-lg font-black">{student.full_name}</h3>
                  <p className="text-blue-700">{student.email}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {student.qualification} · {student.tvet_school}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {[student.district, student.province].filter(Boolean).join(", ")}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Employer messages</h2>
          <div className="mt-6 space-y-4">
            {employerMessages.length === 0 ? (
              <p className="text-slate-500">No employer messages have been received.</p>
            ) : (
              employerMessages.map((employerMessage) => (
                <article key={employerMessage.id} className="rounded-xl border bg-white p-6">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{employerMessage.company_name}</h3>
                      <a
                        className="text-blue-700"
                        href={`mailto:${employerMessage.employer_email}`}
                      >
                        {employerMessage.employer_email}
                      </a>
                    </div>
                    <time className="text-sm text-slate-500">
                      {new Date(employerMessage.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-slate-800">
                    {employerMessage.message}
                  </p>
                  <h4 className="mt-5 font-semibold">Selected applicants</h4>
                  <ul className="mt-2 space-y-2">
                    {employerMessage.students.map((student) => (
                      <li key={student.applicationId} className="text-sm text-slate-700">
                        {student.fullName} · {student.opportunityTitle} · {student.email}
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
