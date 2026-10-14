import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function EmployerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    sector: "",
    description: "",
    location: "",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const registerCompany = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/employer/register",
        form
      );

      alert(
        "Company registered successfully. Please wait for admin approval."
      );

      navigate("/login");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Company registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">

      <form
        onSubmit={registerCompany}
        className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-xl"
      >
        <div className="text-center mb-7">

          <div className="mx-auto w-30 h-30 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl">
               <img
                src="/image/project.jpg"
               
              />
          </div>
          </div>

        <h1 className="text-3xl font-black text-slate-900 text-center mb-7">
          Register Your Company
        </h1>

        <p className="text-slate-500 mt-2 mb-8 text-center mb-7">
          Join GOSAWA and connect with qualified TVET students.
        </p>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            name="companyName"
            placeholder="Company name"
            value={form.companyName}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="email"
            type="email"
            placeholder="Company email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="sector"
            placeholder="Sector e.g. Technology"
            value={form.sector}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="location"
            placeholder="Company location"
            value={form.location}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="logoUrl"
            placeholder="Logo URL (optional)"
            value={form.logoUrl}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

        </div>

        <textarea
          name="description"
          placeholder="Describe your company..."
          value={form.description}
          onChange={handleChange}
          rows="5"
          className="w-full border p-3 rounded-xl mt-5"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-6 hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register Company"}
        </button>

        <p className="text-center text-slate-500 mt-5">
          Already have a company account?{" "}

          <Link
            to="/login"
            className="text-blue-600 font-bold"
          >
            Login
          </Link>
        </p>

      </form>

    </div>
  );
}