import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "";
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        role,
        token,
        password,
      });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <form onSubmit={resetPassword} className="w-full max-w-md space-y-4 rounded-xl bg-white p-7 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Create a new password</h1>
        <p className="text-sm text-slate-600">
          Use at least 10 characters, including uppercase and lowercase letters, a number, and a symbol.
        </p>

        {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-green-800">{message}</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}

        <label className="block text-sm font-semibold" htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="new-password"
          className="w-full rounded-lg border p-3"
        />

        <label className="block text-sm font-semibold" htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          autoComplete="new-password"
          className="w-full rounded-lg border p-3"
        />

        <button disabled={loading || !token} className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">
          {loading ? "Updating..." : "Reset password"}
        </button>
        <Link to="/login" className="block text-center font-semibold text-blue-700">Back to login</Link>
      </form>
    </main>
  );
}