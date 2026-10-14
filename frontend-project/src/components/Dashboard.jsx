import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function Dashboard() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [message, setMessage] = useState("");

  const [language, setLanguage] =
    useState(
      localStorage.getItem("language") || "en"
    );


  const [form, setForm] = useState({
    type: "internship",
    preferredLocation: "",
    description: ""
  });


  const token =
    localStorage.getItem("token");


  const config = {
    headers: {
      Authorization:
        `Bearer ${token}`
    }
  };


  const translations = {

    en: {
      dashboard: "STUDENT DASHBOARD",
      welcome: "Welcome back",
      profile: "My Profile",
      email: "Email",
      location: "Location",
      school: "TVET School",
      qualification: "Qualification",
      request: "Request Internship / Job",
      type: "Opportunity Type",
      internship: "Internship",
      job: "Job",
      preferredLocation:
        "Preferred Location",
      description:
        "Describe the opportunity you need",
      submit:
        "Send Request to GOSAWA",
      requests:
        "My Requests",
      placement:
        "Placement",
      pending:
        "Pending",
      inProgress:
        "In Progress",
      placed:
        "Placed",
      rejected:
        "Rejected",
      logout: "Logout",
      noRequests:
        "You have not sent any request yet."
    },


    rw: {
      dashboard: "UMUNYESHURI",
      welcome: "Murakaza neza",
      profile: "Umwirondoro Wanjye",
      email: "Email",
      location: "Aho utuye",
      school: "Ishuri rya TVET",
      qualification: "Icyo Nize",
      request:
        "Saba Internship / Akazi",
      type: "Ubwoko bw'amahirwe",
      internship: "Internship",
      job: "Akazi",
      preferredLocation:
        "Aho wifuza gukorera",
      description:
        "Sobanura amahirwe ukeneye",
      submit:
        "Ohereza Request kuri GOSAWA",
      requests:
        "Requests Zanjye",
      placement:
        "Aho GOSAWA Yagushyize",
      pending: "Biracyategerejwe",
      inProgress: "Birimo gushakirwa",
      placed: "Washyizwe mu kigo",
      rejected: "Byanzwe",
      logout: "Sohoka",
      noRequests:
        "Nta request uratanga."
    },


    fr: {
      dashboard:
        "TABLEAU DE BORD ÉTUDIANT",
      welcome:
        "Bienvenue",
      profile:
        "Mon Profil",
      email: "Email",
      location: "Localisation",
      school:
        "École TVET",
      qualification:
        "Qualification",
      request:
        "Demander un stage / emploi",
      type:
        "Type d'opportunité",
      internship:
        "Stage",
      job:
        "Emploi",
      preferredLocation:
        "Lieu préféré",
      description:
        "Décrivez l'opportunité recherchée",
      submit:
        "Envoyer la demande à GOSAWA",
      requests:
        "Mes demandes",
      placement:
        "Placement",
      pending:
        "En attente",
      inProgress:
        "En recherche",
      placed:
        "Placé",
      rejected:
        "Refusé",
      logout:
        "Déconnexion",
      noRequests:
        "Vous n'avez envoyé aucune demande."
    }

  };


  const t =
    translations[language];


  useEffect(() => {

    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard();

  }, []);


  const loadDashboard =
    async () => {

      try {

        const [
          profileResponse,
          requestsResponse
        ] = await Promise.all([

          axios.get(
            `${API}/seeker/me`,
            config
          ),

          axios.get(
            `${API}/seeker/requests`,
            config
          )

        ]);


        setUser(
          profileResponse.data.user
        );


        setRequests(
          requestsResponse.data.requests
        );

      } catch (error) {

        console.error(error);

        if (
          error.response?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login");
        }

      } finally {

        setLoading(false);

      }
    };


  const handleChange = (e) => {

    setForm({
      ...form,

      [e.target.name]:
        e.target.value
    });

  };


  const submitRequest =
    async (e) => {

      e.preventDefault();

      setSending(true);

      setMessage("");

      try {

        const response =
          await axios.post(
            `${API}/seeker/requests`,
            form,
            config
          );


        setRequests([
          response.data.request,
          ...requests
        ]);


        setForm({
          type: "internship",
          preferredLocation: "",
          description: ""
        });


        setMessage(
          language === "rw"
            ? "Request yawe yoherejwe neza kuri GOSAWA."
            : language === "fr"
            ? "Votre demande a été envoyée à GOSAWA."
            : "Your request has been sent to GOSAWA."
        );

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Could not send request."
        );

      } finally {

        setSending(false);
      }
    };


  const changeLanguage =
    async (e) => {

      const value =
        e.target.value;

      setLanguage(value);

      localStorage.setItem(
        "language",
        value
      );


      try {

        await axios.put(
          `${API}/seeker/me`,
          {
            fullName:
              user.full_name,

            email:
              user.email,

            location:
              user.location,

            tvetSchool:
              user.tvet_school,

            qualification:
              user.qualification,

            language:
              value
          },
          config
        );

        setUser({
          ...user,
          language: value
        });

      } catch (error) {

        console.error(error);
      }
    };


  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };


  const statusLabel =
    (status) => {

      if (status === "pending")
        return t.pending;

      if (status === "in_progress")
        return t.inProgress;

      if (status === "placed")
        return t.placed;

      if (status === "rejected")
        return t.rejected;

      return status;
    };


  const statusClass =
    (status) => {

      if (status === "placed")
        return "bg-green-100 text-green-700";

      if (status === "rejected")
        return "bg-red-100 text-red-700";

      if (status === "in_progress")
        return "bg-blue-100 text-blue-700";

      return "bg-yellow-100 text-yellow-700";
    };


  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">

        <p className="text-blue-600 font-bold text-xl">
          Loading GOSAWA Dashboard...
        </p>

      </div>
    );
  }


  return (

    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl">
              G
            </div>

            <div>

              <h1 className="font-black text-slate-900">
                GOSAWA
              </h1>

              <p className="text-xs text-slate-500">
                {t.dashboard}
              </p>

            </div>

          </Link>


          <div className="flex items-center gap-3">

            <select
              value={language}
              onChange={changeLanguage}
              className="border rounded-lg px-3 py-2 font-semibold"
            >

              <option value="rw">
                Kinyarwanda
              </option>

              <option value="en">
                English
              </option>

              <option value="fr">
                Français
              </option>

            </select>


            <span className="hidden md:block font-semibold text-slate-700">
              {user?.full_name}
            </span>


            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
            >
              {t.logout}
            </button>

          </div>

        </div>

      </nav>


      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* WELCOME */}

        <section className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white">

          <p className="text-blue-100 font-semibold">
            {t.welcome}
          </p>

          <h2 className="text-4xl font-black mt-2">
            {user?.full_name}
          </h2>

          <p className="mt-3">
            {user?.qualification}
          </p>

        </section>


        {/* MESSAGE */}

        {message && (

          <div className="mt-6 p-4 rounded-xl bg-blue-100 text-blue-700 font-semibold">
            {message}
          </div>

        )}


        {/* PROFILE */}

        <section className="bg-white rounded-2xl border shadow-sm p-7 mt-8">

          <h2 className="text-2xl font-black text-slate-900">
            {t.profile}
          </h2>


          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>

              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="font-bold mt-1">
                {user?.full_name}
              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">
                {t.email}
              </p>

              <p className="font-bold mt-1">
                {user?.email}
              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">
                {t.location}
              </p>

              <p className="font-bold mt-1">
                {user?.location}
              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">
                {t.school}
              </p>

              <p className="font-bold mt-1">
                {user?.tvet_school}
              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">
                {t.qualification}
              </p>

              <p className="font-bold mt-1 text-blue-600">
                {user?.qualification}
              </p>

            </div>

          </div>

        </section>


        {/* REQUEST FORM */}

        <section className="bg-white rounded-3xl border shadow-sm p-8 mt-10">

          <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
            GOSAWA
          </p>

          <h2 className="text-3xl font-black text-slate-900 mt-2">
            {t.request}
          </h2>

          <p className="text-slate-500 mt-2">
            GOSAWA izagushakira company hanze ya system.
          </p>


          <form
            onSubmit={submitRequest}
            className="mt-7"
          >

            <div className="grid md:grid-cols-2 gap-5">

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="border p-3 rounded-xl"
              >

                <option value="internship">
                  {t.internship}
                </option>

                <option value="job">
                  {t.job}
                </option>

              </select>


              <input
                name="preferredLocation"
                value={
                  form.preferredLocation
                }
                onChange={handleChange}
                placeholder={
                  t.preferredLocation
                }
                required
                className="border p-3 rounded-xl"
              />

            </div>


            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t.description}
              rows="6"
              required
              className="w-full border p-3 rounded-xl mt-5"
            />


            <button
              type="submit"
              disabled={sending}
              className="mt-5 bg-blue-600 text-white px-7 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >

              {sending
                ? "Sending..."
                : t.submit}

            </button>

          </form>

        </section>


        {/* MY REQUESTS */}

        <section className="mt-12">

          <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
            GOSAWA
          </p>

          <h2 className="text-3xl font-black text-slate-900 mt-2">
            {t.requests}
          </h2>


          <div className="mt-6 space-y-5">

            {requests.length === 0 ? (

              <div className="bg-white border rounded-2xl p-8">

                <p className="text-slate-500">
                  {t.noRequests}
                </p>

              </div>

            ) : (

              requests.map((request) => (

                <div
                  key={request.id}
                  className="bg-white border rounded-2xl p-6"
                >

                  <div className="flex justify-between gap-4">

                    <div>

                      <h3 className="text-xl font-black">
                        {request.type ===
                        "internship"
                          ? t.internship
                          : t.job}
                      </h3>

                      <p className="text-blue-600 font-bold mt-1">
                        {request.qualification}
                      </p>

                    </div>


                    <span
                      className={`h-fit px-4 py-2 rounded-full font-bold text-sm ${statusClass(
                        request.status
                      )}`}
                    >
                      {statusLabel(
                        request.status
                      )}
                    </span>

                  </div>


                  <p className="text-slate-500 mt-4">
                    {request.description}
                  </p>


                  <p className="text-sm text-slate-500 mt-4">
                    📍{" "}
                    {request.preferredLocation}
                  </p>


                  {/* PLACEMENT */}

                  {request.placement && (

                    <div className="mt-6 border-t pt-6">

                      <h4 className="text-lg font-black text-green-700">
                        {t.placement}
                      </h4>


                      <div className="grid md:grid-cols-2 gap-4 mt-4">

                        <div>

                          <p className="text-sm text-slate-500">
                            Company
                          </p>

                          <p className="font-bold">
                            {
                              request
                                .placement
                                .companyName
                            }
                          </p>

                        </div>


                        <div>

                          <p className="text-sm text-slate-500">
                            Location
                          </p>

                          <p className="font-bold">
                            {
                              request
                                .placement
                                .companyLocation
                            }
                          </p>

                        </div>


                        <div>

                          <p className="text-sm text-slate-500">
                            Opportunity
                          </p>

                          <p className="font-bold">
                            {
                              request
                                .placement
                                .opportunity
                            }
                          </p>

                        </div>


                        {request.placement.contact && (

                          <div>

                            <p className="text-sm text-slate-500">
                              Contact
                            </p>

                            <p className="font-bold">
                              {
                                request
                                  .placement
                                  .contact
                              }
                            </p>

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