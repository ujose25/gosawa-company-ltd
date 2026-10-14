import { Link } from "react-router-dom";

const companies = [
  {
    name: "Technology & Digital",
    description: "Technology, software and digital employment opportunities.",
    image: "/image/Capturea.PNG",
  },
  {
    name: "TVET & Technical Skills",
    description: "Practical training, internship and technical opportunities.",
    image: "/image/Capture b-Copy.PNG",
  },
  {
    name: "Hospitality & Tourism",
    description: "Hotel, tourism and hospitality opportunities.",
    image: "/image/Capture b.PNG",
  },
  {
    name: "Finance & Business",
    description: "Business, finance and administration opportunities.",
    image: "/image/Capture c.PNG",
  },
];

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
    text: "Upload your CV and apply for opportunities directly through GOSAWA.",
  },
  {
    icon: "🔐",
    title: "Private Accounts",
    text: "Every student has a private account and can only access their own information.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
             <img
                src="/image/project.jpg"
               
              />
            </div>

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
                className="px-7 py-4 rounded-xl bg-blue-500 text-white font-bold shadow-xl hover:bg-green-700 hover:-translate-y-0.5 transition"
              >
                Create Account →
              </Link>

              <a
                href="#companies"
                className="px-7 py-4 rounded-xl bg-white text-blue-600 font-bold border border-blue-200 hover:bg-blue-50 transition"
              >
                Explore Opportunities
              </a>

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

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">

              <img
                src="/image/project.jpg"
                alt="GOSAWA workplace"
                className="w-full h-[520px] object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-8 pt-28">

                <p className="text-cyan-300 font-bold">
                  GOSAWA COMPANY LTD
                </p>

                <h3 className="text-2xl font-bold text-white mt-2">
                  Connecting skills with opportunities
                </h3>

                <p className="text-slate-200 mt-2">
                  Rwanda · TVET · Employment · Internship
                </p>

              </div>

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


          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

            {companies.map((company, index) => (

              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition"
              >

                <div className="relative h-52 overflow-hidden">

                  <img
                    src={company.image}
                    alt={company.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />

                  <h3 className="absolute bottom-4 left-5 right-5 text-white font-black text-xl">
                    {company.name}
                  </h3>

                </div>

                <div className="p-5">

                  <p className="text-slate-500 text-sm leading-6">
                    {company.description}
                  </p>

                  <Link
                    to="/register"
                    className="inline-block mt-4 text-blue-600 font-bold text-sm"
                  >
                    View opportunities →
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
              ["01", "Create account", "Register and provide your TVET or professional information."],
              ["02", "Find opportunity", "Explore jobs, internships and work-learning opportunities."],
              ["03", "Apply", "Upload your CV and submit your application securely."],
              ["04", "Get connected", "Follow your application and placement status."],
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