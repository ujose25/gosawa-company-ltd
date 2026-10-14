import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function EmployerDashboard() {

  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "Internship",
    salary: "",
  });

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {

    if (!token) {
      navigate("/login");
      return;
    }

    loadCompany();

  }, []);

  const loadCompany = async () => {

    try {

      const companyResponse = await axios.get(
        `${API}/employer/me`,
        config
      );

      const jobsResponse = await axios.get(
        `${API}/employer/jobs`,
        config
      );

      setCompany(companyResponse.data.company);
      setJobs(jobsResponse.data.jobs);

    } catch (error) {

      console.error(error);

      if (error.response?.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      }

    } finally {

      setLoading(false);

    }
  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const createJob = async (e) => {

    e.preventDefault();

    setPosting(true);
    setMessage("");

    try {

      const response = await axios.post(
        `${API}/employer/jobs`,
        form,
        config
      );

      setJobs([
        ...jobs,
        response.data.job,
      ]);

      setForm({
        title: "",
        description: "",
        location: "",
        type: "Internship",
        salary: "",
      });

      setMessage(
        "Opportunity published successfully."
      );

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Could not publish opportunity."
      );

    } finally {

      setPosting(false);

    }
  };

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

  };

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600 font-bold">
          Loading company dashboard...
        </p>
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

      <nav className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl">
              G
            </div>

            <div>

              <h1 className="font-black">
                GOSAWA
              </h1>

              <p className="text-xs text-slate-500">
                EMPLOYER DASHBOARD
              </p>

            </div>

          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold"
          >
            Logout
          </button>

        </div>

      </nav>


      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* COMPANY HEADER */}

        <section className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white">

          <p className="text-blue-100">
            Welcome
          </p>

          <h2 className="text-4xl font-black mt-2">
            {company?.company_name}
          </h2>

          <p className="mt-3">
            {company?.sector}
          </p>

          <div className="mt-5">

            <span
              className={`px-4 py-2 rounded-full font-bold ${
                company?.status === "approved"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            >
              Account: {company?.status}
            </span>

          </div>

        </section>


        {/* MESSAGE */}

        {message && (

          <div className="mt-6 bg-blue-100 text-blue-700 p-4 rounded-xl font-semibold">
            {message}
          </div>

        )}


        {/* STATISTICS */}

        <section className="grid md:grid-cols-3 gap-6 mt-8">

          <div className="bg-white border rounded-2xl p-6">

            <p className="text-slate-500">
              Published Opportunities
            </p>

            <h3 className="text-4xl font-black text-blue-600 mt-2">
              {jobs.length}
            </h3>

          </div>

          <div className="bg-white border rounded-2xl p-6">

            <p className="text-slate-500">
              Company Sector
            </p>

            <h3 className="text-xl font-black mt-2">
              {company?.sector}
            </h3>

          </div>

          <div className="bg-white border rounded-2xl p-6">

            <p className="text-slate-500">
              Location
            </p>

            <h3 className="text-xl font-black mt-2">
              {company?.location || "Not provided"}
            </h3>

          </div>

        </section>


        {/* CREATE JOB */}

        <section className="bg-white border rounded-3xl p-8 mt-10">

          <div>

            <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
              Recruitment
            </p>

            <h2 className="text-3xl font-black mt-2">
              Publish Job / Internship
            </h2>

            <p className="text-slate-500 mt-2">
              Publish an opportunity for TVET students and job seekers.
            </p>

          </div>


          <form
            onSubmit={createJob}
            className="mt-7"
          >

            <div className="grid md:grid-cols-2 gap-5">

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Job / Internship title"
                required
                className="border p-3 rounded-xl"
              />

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="border p-3 rounded-xl"
              >

                <option value="Internship">
                  Internship
                </option>

                <option value="Job">
                  Job
                </option>

                <option value="Apprenticeship">
                  Apprenticeship
                </option>

              </select>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
                className="border p-3 rounded-xl"
              />

              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="Salary / Allowance"
                className="border p-3 rounded-xl"
              />

            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the opportunity, requirements and responsibilities..."
              rows="6"
              required
              className="w-full border p-3 rounded-xl mt-5"
            />

            <button
              type="submit"
              disabled={posting}
              className="mt-5 bg-blue-600 text-white px-7 py-3 rounded-xl font-bold hover:bg-blue-700"
            >
              {posting
                ? "Publishing..."
                : "Publish Opportunity →"}
            </button>

          </form>

        </section>


        {/* MY JOBS */}

        <section className="mt-12">

          <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
            Published
          </p>

          <h2 className="text-3xl font-black mt-2">
            My Opportunities
          </h2>


          <div className="grid md:grid-cols-2 gap-6 mt-7">

            {jobs.length === 0 ? (

              <div className="bg-white border rounded-2xl p-8">

                <p className="text-slate-500">
                  You have not published any opportunity yet.
                </p>

              </div>

            ) : (

              jobs.map((job) => (

                <div
                  key={job.id}
                  className="bg-white border rounded-2xl p-6"
                >

                  <div className="flex justify-between gap-4">

                    <h3 className="text-xl font-black">
                      {job.title}
                    </h3>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold h-fit">
                      {job.type}
                    </span>

                  </div>

                  <p className="text-slate-500 mt-4">
                    {job.description}
                  </p>

                  {job.location && (
                    <p className="text-sm text-slate-500 mt-4">
                      📍 {job.location}
                    </p>
                  )}

                  {job.salary && (
                    <p className="text-sm text-slate-500 mt-2">
                      💰 {job.salary}
                    </p>
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