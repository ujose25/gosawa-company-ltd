import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import BrandMark from "./BrandMark";
import { dashboardPath, getSessionUser } from "../lib/session";

const services = [
  {
    icon: "💼",
    title: "Job Placement",
    text: "Connect job seekers with companies looking for qualified employees.",
  },
  {
    icon: "🎓",
    title: "TVET Internship",
    text: "Help TVET students find practical internship and work-learning opportunities.",
  },
  {
    icon: "📄",
    title: "CV & Applications",
    text: "Apply to live opportunities and follow your application status.",
  },
  {
    icon: "🔐",
    title: "Private Accounts",
    text: "Every student has a private account and can only access their own information.",
  },
];

export default function Home() {
  const sessionUser = getSessionUser();
  const [opportunities, setOpportunities] = useState([]);
  const [opportunitiesError, setOpportunitiesError] = useState("");

  useEffect(() => {
    let active = true;

    api.get("/seeker/opportunities")
      .then(({ data }) => {
        if (active) setOpportunities(data.opportunities);
      })
      .catch(() => {
        if (active) setOpportunitiesError("Could not load opportunities right now.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <BrandMark size="sm" />

            <div>
              <h1 className="font-black text-lg text-slate-900">
                GOSAWA
              </h1>

              <p className="text-xs text-slate-500 font-semibold">
                COMPANY LTD
              </p>
            </div>

          </Link>

          {/* MENU */}
          <div className="hidden lg:flex items-center gap-8">

            <a
              href="#home"
              className="font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Home
            </a>

            <a
              href="#services"
              className="font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Services
            </a>

            <a
              href="#companies"
              className="font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Companies
            </a>

            <a
              href="#how"
              className="font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              How it works
            </a>

            <a
              href="#contact"
              className="font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Contact
            </a>

          </div>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {sessionUser ? (
              <Link
                to={dashboardPath(sessionUser.role)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block px-5 py-2.5 rounded-xl font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

        </div>

      </nav>


      {/* HERO */}
      <section
        id="home"
        className="relative overflow-hidden"
      >

        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-14 items-center">

          {/* HERO TEXT */}
          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
              <span>●</span>
              Online Opportunities , Internship , Employment
            </div>

            <h2 className="text-5xl lg:text-7xl font-black leading-tight text-slate-950">

              Find opportunities.

              <span className="block text-blue-600">
                Build your future.
              </span>

            </h2>

            <p className="mt-6 text-lg lg:text-xl text-slate-600 leading-8 max-w-xl">

              GOSAWA COMPANY LTD connects TVET students and job seekers
              with employers, internships, training and employment
              opportunities across Rwanda.

            </p>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/register"
                className="px-7 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-xl hover:bg-blue-700 hover:-translate-y-0.5 transition"
              >
                I am a student
              </Link>
              <Link
                to="/employer-register"
                className="px-7 py-4 rounded-xl bg-white text-blue-600 font-bold border border-blue-200 hover:bg-blue-50 transition"
              >
                I am an employer
              </Link>
            </div>

            {/* TRUST */}
            <div className="flex flex-wrap gap-10 mt-10">

              <div>
                <p className="text-2xl font-black text-slate-900">
                  TVET
                </p>
                <p className="text-sm text-slate-500">
                  Student focused
                </p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-900">
                  Jobs
                </p>
                <p className="text-sm text-slate-500">
                  Employment opportunities
                </p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-900">
                  Internship
                </p>
                <p className="text-sm text-slate-500">
                  Work & learn
                </p>
              </div>

            </div>

          </div>


          {/* HERO IMAGE */}
          <div className="relative">

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-cyan-200 rounded-full blur-3xl opacity-60" />

            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-40" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-900 p-8 min-h-[420px] flex flex-col justify-end">
              <img
                src="/image/Capture%20c.PNG"
                alt="Modern campus building"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <p className="relative text-cyan-300 font-bold">
                Three accounts, one placement system
              </p>
              <h3 className="relative text-2xl font-bold text-white mt-2">
                Student · Employer · GOSAWA Admin
              </h3>
              <p className="relative text-slate-200 mt-2">
                Students apply, employers review, GOSAWA confirms placements.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* SERVICES */}
      <section
        id="services"
        className="py-20 bg-white"
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-3xl mx-auto">

            <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
              Our Services
            </p>

            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3">
              Everything you need to find an opportunity
            </h2>

            <p className="text-slate-500 mt-5 text-lg">
              GOSAWA creates a simple connection between students,
              job seekers and employers.
            </p>

          </div>


          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">

            {services.map((service, index) => (

              <div
                key={index}
                className="group bg-slate-50 border border-slate-200 rounded-2xl p-7 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition"
              >

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl group-hover:bg-blue-600 transition">
                  {service.icon}
                </div>

                <h3 className="text-xl font-black text-slate-900 mt-6">
                  {service.title}
                </h3>

                <p className="text-slate-500 mt-3 leading-7">
                  {service.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
              Three roles
            </p>
            <h2 className="text-4xl font-black text-slate-900 mt-3">
              How the three accounts work together
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src="/image/Capture%20b.PNG"
                alt="School campus"
                className="h-48 w-full object-cover"
              />
              <div className="p-7">
                <p className="text-sm font-black uppercase tracking-widest text-blue-600">1. Student</p>
                <h3 className="mt-3 text-2xl font-black">Register and apply</h3>
                <p className="mt-3 text-slate-600">
                  Create a student account, browse approved opportunities, and send applications.
                </p>
                <Link to="/register" className="mt-5 inline-block font-bold text-blue-700">
                  Create student account →
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src="/image/Capturea.PNG"
                alt="School building with student learning spaces"
                className="h-48 w-full object-cover"
              />
              <div className="p-7">
                <p className="text-sm font-black uppercase tracking-widest text-blue-600">2. Employer</p>
                <h3 className="mt-3 text-2xl font-black">Publish and shortlist</h3>
                <p className="mt-3 text-slate-600">
                  Register your company, wait for GOSAWA approval, post roles, and review applicants.
                </p>
                <Link to="/employer-register" className="mt-5 inline-block font-bold text-blue-700">
                  Register company →
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src="/image/Capture%20d.PNG"
                alt="Modern international business district"
                className="h-48 w-full object-cover"
              />
              <div className="p-7">
                <p className="text-sm font-black uppercase tracking-widest text-blue-600">3. GOSAWA admin</p>
                <h3 className="mt-3 text-2xl font-black">Approve and place</h3>
                <p className="mt-3 text-slate-600">
                  Approve companies, review applications, and confirm student placements.
                </p>
                <Link to="/login" className="mt-5 inline-block font-bold text-blue-700">
                  Admin login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* COMPANIES */}
      <section
        id="companies"
        className="py-20 bg-slate-50"
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

            <div>

              <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
                Opportunities
              </p>

              <h2 className="text-4xl font-black text-slate-900 mt-2">
                Explore career sectors
              </h2>

              <p className="text-slate-500 mt-3">
                Discover sectors where GOSAWA students and job seekers
                can find opportunities.
              </p>

            </div>

            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              Create your account →
            </Link>

          </div>


          {opportunitiesError && (
            <p role="alert" className="mt-6 text-red-700">{opportunitiesError}</p>
          )}

          {!opportunitiesError && opportunities.length === 0 && (
            <p className="mt-6 text-slate-500">No open opportunities are available right now.</p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {opportunities.map((opportunity) => (

              <div
                key={opportunity.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition"
              >

                <div className="p-5">
                  <p className="text-sm font-semibold text-blue-700">
                    {opportunity.company_name}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {opportunity.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600">
                    {opportunity.description || "Details available after you create an account."}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    {opportunity.type} · {opportunity.location || "Location not specified"}
                  </p>

                  <Link
                    to="/login"
                    className="inline-block mt-4 text-blue-600 font-bold text-sm"
                  >
                    Sign in to apply →
                  </Link>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        id="how"
        className="py-20 bg-white"
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-3xl mx-auto">

            <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
              Simple Process
            </p>

            <h2 className="text-4xl font-black text-slate-900 mt-3">
              How GOSAWA works
            </h2>

          </div>


          <div className="grid md:grid-cols-4 gap-6 mt-12">

            {[
              ["01", "Student registers", "The student creates an account with TVET details and applies to live roles."],
              ["02", "Employer is approved", "GOSAWA reviews the company, then the employer can publish opportunities."],
              ["03", "Employer reviews", "The company shortlists or rejects applicants and can message the admin."],
              ["04", "Admin confirms", "GOSAWA updates the application. Accepted students see their placement."],
            ].map((step) => (

              <div
                key={step[0]}
                className="relative p-7 rounded-2xl bg-slate-50 border border-slate-200"
              >

                <div className="text-blue-600 text-4xl font-black">
                  {step[0]}
                </div>

                <h3 className="text-xl font-black mt-5">
                  {step[1]}
                </h3>

                <p className="text-slate-500 mt-3 leading-6">
                  {step[2]}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* CONTACT */}
      <section
        id="contact"
        className="py-20 bg-slate-950 text-white"
      >

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14">

          <div>

            <p className="text-cyan-400 font-black uppercase tracking-widest text-sm">
              Contact GOSAWA
            </p>

            <h2 className="text-4xl lg:text-5xl font-black mt-4">
              Let us connect you with opportunity.
            </h2>

            <p className="text-slate-300 mt-6 text-lg leading-8 max-w-xl">
              GOSAWA COMPANY LTD is focused on connecting students,
              job seekers and employers through online employment
              placement services.
            </p>

            <Link
              to="/register"
              className="inline-block mt-8 px-7 py-4 rounded-xl bg-blue-600 font-bold hover:bg-blue-700 transition"
            >
              Join GOSAWA →
            </Link>

          </div>


          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <h3 className="text-2xl font-black">
              Contact information
            </h3>

            <div className="space-y-5 mt-7">

              <div>
                <p className="text-slate-400 text-sm">
                  Email
                </p>

                <p className="font-bold mt-1">
                  ntamaherezojmv@gmail.com
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm">
                  Phone
                </p>

                <p className="font-bold mt-1">
                  +250 781 043 264
                </p>

                <p className="font-bold">
                  +250 794 483 398
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm">
                  Location
                </p>

                <p className="font-bold mt-1">
                  Burera, Northern Province, Rwanda
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm">
                  P.O. Box
                </p>

                <p className="font-bold mt-1">
                  128 Burera
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/10 py-7">

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-4 text-sm text-slate-400">

          <p>
            © 2026 GOSAWA COMPANY LTD. All rights reserved.
          </p>

          <p>
            Rwanda · Employment · Internship · TVET
          </p>

        </div>

      </footer>

    </div>
  );
}