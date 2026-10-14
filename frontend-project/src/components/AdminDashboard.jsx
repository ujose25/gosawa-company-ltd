import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");


  const config = {
    headers: {
      Authorization:
        `Bearer ${token}`
    }
  };


  const [admin, setAdmin] =
    useState(null);

  const [requests, setRequests] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [employers, setEmployers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  const [placementForm, setPlacementForm] =
    useState({
      companyName: "",
      companyLocation: "",
      opportunity: "",
      contact: "",
      notes: ""
    });


  const [selectedRequest, setSelectedRequest] =
    useState(null);


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
          adminResponse,
          requestsResponse,
          studentsResponse,
          employersResponse
        ] = await Promise.all([

          axios.get(
            `${API}/admin/me`,
            config
          ),

          axios.get(
            `${API}/admin/requests`,
            config
          ),

          axios.get(
            `${API}/admin/seekers`,
            config
          ),

          axios.get(
            `${API}/admin/employers`,
            config
          )

        ]);


        setAdmin(
          adminResponse.data.admin
        );


        setRequests(
          requestsResponse.data.requests
        );


        setStudents(
          studentsResponse.data.seekers
        );


        setEmployers(
          employersResponse.data.employers
        );

      } catch (error) {

        console.error(error);

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
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


  const changeStatus =
    async (
      seekerId,
      requestId,
      status
    ) => {

      try {

        await axios.put(
          `${API}/admin/requests/${seekerId}/${requestId}/status`,
          { status },
          config
        );


        setMessage(
          "Request status updated successfully."
        );


        loadDashboard();

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Could not update status."
        );
      }
    };


  const openPlacement =
    (request) => {

      setSelectedRequest(
        request
      );

      setPlacementForm({
        companyName: "",
        companyLocation: "",
        opportunity: "",
        contact: "",
        notes: ""
      });
    };


  const handlePlacementChange =
    (e) => {

      setPlacementForm({
        ...placementForm,

        [e.target.name]:
          e.target.value
      });
    };


  const assignCompany =
    async (e) => {

      e.preventDefault();

      if (!selectedRequest)
        return;


      try {

        await axios.put(

          `${API}/admin/requests/${selectedRequest.studentId}/${selectedRequest.id}/assign`,

          placementForm,

          config
        );


        setMessage(
          "External company assigned successfully."
        );


        setSelectedRequest(null);

        loadDashboard();

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Could not assign company."
        );
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


  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p className="text-blue-600 font-bold text-xl">
          Loading GOSAWA Admin...
        </p>

      </div>

    );
  }


  const pending =
    requests.filter(
      (r) =>
        r.status === "pending"
    ).length;


  const inProgress =
    requests.filter(
      (r) =>
        r.status === "in_progress"
    ).length;


  const placed =
    requests.filter(
      (r) =>
        r.status === "placed"
    ).length;


  return (

    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

      <nav className="bg-white border-b">

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
                ADMIN DASHBOARD
              </p>

            </div>

          </div>


          <div className="flex items-center gap-4">

            <span className="font-semibold hidden md:block">
              {admin?.full_name}
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>


      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}

        <section className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white">

          <p className="text-blue-100">
            GOSAWA COMPANY LTD
          </p>

          <h2 className="text-4xl font-black mt-2">
            Admin Dashboard
          </h2>

          <p className="mt-3">
            Manage student requests and external placements.
          </p>

        </section>


        {message && (

          <div className="mt-6 bg-blue-100 text-blue-700 p-4 rounded-xl font-semibold">
            {message}
          </div>

        )}


        {/* STATISTICS */}

        <section className="grid md:grid-cols-4 gap-6 mt-8">

          <div className="bg-white border rounded-2xl p-6">

            <p className="text-slate-500">
              Students
            </p>

            <h3 className="text-4xl font-black text-blue-600 mt-2">
              {students.length}
            </h3>

          </div>


          <div className="bg-white border rounded-2xl p-6">

            <p className="text-slate-500">
              Pending Requests
            </p>

            <h3 className="text-4xl font-black text-yellow-600 mt-2">
              {pending}
            </h3>

          </div>


          <div className="bg-white border rounded-2xl p-6">

            <p className="text-slate-500">
              In Progress
            </p>

            <h3 className="text-4xl font-black text-blue-600 mt-2">
              {inProgress}
            </h3>

          </div>


          <div className="bg-white border rounded-2xl p-6">

            <p className="text-slate-500">
              Placed
            </p>

            <h3 className="text-4xl font-black text-green-600 mt-2">
              {placed}
            </h3>

          </div>

        </section>


        {/* STUDENT REQUESTS */}

        <section className="mt-12">

          <p className="text-blue-600 font-black uppercase tracking-widest text-sm">
            Requests
          </p>

          <h2 className="text-3xl font-black mt-2">
            Student Requests
          </h2>


          <div className="space-y-5 mt-7">

            {requests.length === 0 ? (

              <div className="bg-white border rounded-2xl p-8">

                <p className="text-slate-500">
                  No student requests yet.
                </p>

              </div>

            ) : (

              requests.map((request) => (

                <div
                  key={`${request.studentId}-${request.id}`}
                  className="bg-white border rounded-2xl p-6"
                >

                  <div className="flex flex-col lg:flex-row justify-between gap-5">

                    <div>

                      <h3 className="text-xl font-black">
                        {request.studentName}
                      </h3>

                      <p className="text-blue-600 font-semibold">
                        {request.studentEmail}
                      </p>

                      <p className="text-sm text-slate-500 mt-2">
                        Qualification:{" "}
                        <strong>
                          {request.qualification}
                        </strong>
                      </p>

                      <p className="text-sm text-slate-500">
                        TVET School:{" "}
                        {request.tvetSchool}
                      </p>

                      <p className="text-sm text-slate-500">
                        Location:{" "}
                        {request.studentLocation}
                      </p>

                    </div>


                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          changeStatus(
                            request.studentId,
                            request.id,
                            "in_progress"
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold"
                      >
                        Search Company
                      </button>


                      <button
                        onClick={() =>
                          changeStatus(
                            request.studentId,
                            request.id,
                            "rejected"
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold"
                      >
                        Reject
                      </button>


                      <button
                        onClick={() =>
                          openPlacement(
                            request
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold"
                      >
                        Assign Company
                      </button>

                    </div>

                  </div>


                  <div className="border-t mt-5 pt-5">

                    <p className="text-sm text-slate-500">
                      Request
                    </p>

                    <p className="font-semibold mt-1">
                      {request.type}
                    </p>


                    <p className="text-sm text-slate-500 mt-3">
                      Preferred Location
                    </p>

                    <p className="font-semibold">
                      {request.preferredLocation}
                    </p>


                    <p className="text-sm text-slate-500 mt-3">
                      Description
                    </p>

                    <p className="text-slate-700 mt-1">
                      {request.description}
                    </p>

                  </div>


                  <div className="mt-5 flex items-center justify-between">

                    <span
                      className={`px-4 py-2 rounded-full font-bold text-sm ${
                        request.status === "placed"
                          ? "bg-green-100 text-green-700"
                          : request.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : request.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {request.status}
                    </span>


                    {request.placement && (

                      <div className="text-sm text-green-700 font-semibold">
                        Assigned:{" "}
                        {request.placement.companyName}
                      </div>

                    )}

                  </div>

                </div>

              ))

            )}

          </div>

        </section>


        {/* REGISTERED EMPLOYERS */}

        <section className="mt-12">

          <h2 className="text-3xl font-black">
            Registered Companies
          </h2>

          <p className="text-slate-500 mt-2">
            These are companies that have accounts in GOSAWA.
            External companies can also be assigned manually.
          </p>


          <div className="grid md:grid-cols-2 gap-5 mt-6">

            {employers.map((employer) => (

              <div
                key={employer.id}
                className="bg-white border rounded-2xl p-6"
              >

                <h3 className="text-xl font-black">
                  {employer.company_name}
                </h3>

                <p className="text-blue-600 font-semibold mt-1">
                  {employer.sector}
                </p>

                <p className="text-slate-500 mt-2">
                  {employer.location}
                </p>

                <span className="inline-block mt-4 px-3 py-1 rounded-full bg-slate-100 font-bold text-sm">
                  {employer.status}
                </span>

              </div>

            ))}

          </div>

        </section>

      </main>


      {/* ASSIGN COMPANY MODAL */}

      {selectedRequest && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-black">
                  Assign External Company
                </h2>

                <p className="text-slate-500 mt-1">
                  Student:{" "}
                  {selectedRequest.studentName}
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="text-2xl font-bold"
              >
                ×
              </button>

            </div>


            <form
              onSubmit={assignCompany}
              className="mt-6 space-y-4"
            >

              <input
                name="companyName"
                value={
                  placementForm.companyName
                }
                onChange={
                  handlePlacementChange
                }
                placeholder="External Company Name"
                required
                className="w-full border p-3 rounded-xl"
              />


              <input
                name="companyLocation"
                value={
                  placementForm.companyLocation
                }
                onChange={
                  handlePlacementChange
                }
                placeholder="Company Location"
                required
                className="w-full border p-3 rounded-xl"
              />


              <input
                name="opportunity"
                value={
                  placementForm.opportunity
                }
                onChange={
                  handlePlacementChange
                }
                placeholder="Opportunity"
                required
                className="w-full border p-3 rounded-xl"
              />


              <input
                name="contact"
                value={
                  placementForm.contact
                }
                onChange={
                  handlePlacementChange
                }
                placeholder="Company Contact"
                className="w-full border p-3 rounded-xl"
              />


              <textarea
                name="notes"
                value={
                  placementForm.notes
                }
                onChange={
                  handlePlacementChange
                }
                placeholder="Additional instructions"
                rows="4"
                className="w-full border p-3 rounded-xl"
              />


              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
              >
                Assign Company to Student
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}