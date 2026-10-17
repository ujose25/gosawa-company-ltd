import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(searchParams.get("role") || "seeker");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
        role,
      });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not request a password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <form onSubmit={requestReset} className="w-full max-w-md space-y-4 rounded-xl bg-white p-7 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
        <p className="text-sm text-slate-600">
          Enter your account email. If it matches, we will send a one-time reset link.
        </p>

        {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-green-800">{message}</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}

        <label className="block text-sm font-semibold" htmlFor="reset-role">Account type</label>
        <select
          id="reset-role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option value="seeker">Student / Job Seeker</option>
          <option value="employer">Employer / Company</option>
          <option value="admin">Admin</option>
        </select>

        <label className="block text-sm font-semibold" htmlFor="reset-email">Email</label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-lg border p-3"
        />

        <button disabled={loading} className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <Link to="/login" className="block text-center font-semibold text-blue-700">Back to login</Link>
      </form>
    </main>
  );
}