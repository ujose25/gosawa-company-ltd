import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { dashboardPath, saveSession } from "../lib/session";
import BrandMark from "./BrandMark";

const roles = [
  {
    value: "seeker",
    title: "Student / Job seeker",
    text: "Apply to internships and jobs.",
  },
  {
    value: "employer",
    title: "Employer / Company",
    text: "Post opportunities and review applicants.",
  },
  {
    value: "admin",
    title: "GOSAWA admin",
    text: "Approve companies and confirm placements.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "seeker",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const login = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      saveSession(response.data.user);
      navigate(dashboardPath(response.data.user.role));
    } catch (loginError) {
      setError(
        loginError.response?.data?.message ||
          (loginError.request
            ? "Could not reach the server. Make sure the backend is running."
            : "Login failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto w-fit">
            <BrandMark size="lg" />
          </div>
          <h1 className="mt-4 text-3xl font-black">Welcome back</h1>
          <p className="mt-2 text-slate-500">
            Choose your account type, then sign in.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <p className="mb-2 text-sm font-semibold text-slate-700">I am a</p>
        <div className="mb-5 grid gap-2">
          {roles.map((role) => (
            <label
              key={role.value}
              className={`cursor-pointer rounded-xl border p-3 ${
                form.role === role.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={form.role === role.value}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="block font-bold text-slate-900">{role.title}</span>
              <span className="text-sm text-slate-500">{role.text}</span>
            </label>
          ))}
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-xl border p-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-xl border p-3"
        />

        <Link
          to={`/forgot-password?role=${form.role}`}
          className="mb-4 block text-right text-sm font-semibold text-blue-700"
        >
          Forgot password?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-6 text-center text-slate-500">
          <p>
            Student?
            <Link to="/register" className="ml-1 font-bold text-blue-600">
              Create account
            </Link>
          </p>
          <p className="mt-2">
            Company?
            <Link to="/employer-register" className="ml-1 font-bold text-blue-600">
              Register company
            </Link>
          </p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-slate-500">
            Back to home
          </Link>
        </div>
      </form>
    </div>
  );
}
