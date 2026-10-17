import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { isStrongPassword, PASSWORD_HINT } from "../lib/password";
import BrandMark from "./BrandMark";

const initialForm = {
  companyName: "",
  email: "",
  password: "",
  confirmPassword: "",
  sector: "",
  description: "",
  location: "",
  logoUrl: "",
};

export default function EmployerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const registerCompany = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isStrongPassword(form.password)) {
      setError(PASSWORD_HINT);
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/employer/register", {
        companyName: form.companyName,
        email: form.email,
        password: form.password,
        sector: form.sector,
        description: form.description,
        location: form.location,
        logoUrl: form.logoUrl,
      });
      setMessage(
        data.message ||
          "Company registered. Wait for GOSAWA admin approval, then log in as Employer."
      );
      window.setTimeout(() => navigate("/login"), 1600);
    } catch (registerError) {
      setError(
        registerError.response?.data?.message || "Company registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form
        onSubmit={registerCompany}
        className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto w-fit">
            <BrandMark size="lg" />
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Register your company
          </h1>
          <p className="mt-2 text-slate-500">
            GOSAWA will review your account. After approval you can publish
            internships and jobs for TVET students.
          </p>
        </div>

        {message && (
          <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-green-800">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <input
            name="companyName"
            placeholder="Company name"
            value={form.companyName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border p-3"
          />
          <input
            name="email"
            type="email"
            placeholder="Company email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border p-3"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-xl border p-3"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full rounded-xl border p-3"
          />
          <input
            name="sector"
            placeholder="Sector e.g. Technology"
            value={form.sector}
            onChange={handleChange}
            required
            className="w-full rounded-xl border p-3"
          />
          <input
            name="location"
            placeholder="Company location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">{PASSWORD_HINT}</p>

        <textarea
          name="description"
          placeholder="Describe your company..."
          value={form.description}
          onChange={handleChange}
          rows="5"
          className="mt-5 w-full rounded-xl border p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register company"}
        </button>

        <p className="mt-5 text-center text-slate-500">
          Already have a company account?{" "}
          <Link to="/login" className="font-bold text-blue-600">
            Login as Employer
          </Link>
        </p>
        <Link to="/" className="mt-3 block text-center text-sm font-semibold text-slate-500">
          Back to home
        </Link>
      </form>
    </div>
  );
}
