import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "seeker",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const login = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      if (response.data.user.role === "seeker") {
        navigate("/dashboard");
      } else if (response.data.user.role === "employer") {
        navigate("/employer-dashboard");
      } else if (response.data.user.role === "admin") {
        navigate("/admin-dashboard");
      }

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <form
        onSubmit={login}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >

        <div className="text-center mb-7">

          <div className="mx-auto w-30 h-30 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl">
               <img
                src="/image/project.jpg"
               
              />
          </div>

          <h2 className="text-3xl font-black mt-4">
            Welcome Back
          </h2>

          <p className="text-slate-500 mt-2">
            Login to your GOSAWA account
          </p>

        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-xl mb-4"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border p-3 rounded-xl mb-5"
        >

          <option value="seeker">
            Student / Job Seeker
          </option>

          <option value="employer">
            Employer / Company
          </option>

          <option value="admin">
            Admin
          </option>

        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-6">

          <p className="text-slate-500">
            Student?

            <Link
              to="/register"
              className="text-blue-600 font-bold ml-1"
            >
              Create account
            </Link>
          </p>

          <p className="text-slate-500 mt-2">
            Company?

            <Link
              to="/employer-register"
              className="text-blue-600 font-bold ml-1"
            >
              Register company
            </Link>
          </p>

        </div>

      </form>

    </div>
  );
}