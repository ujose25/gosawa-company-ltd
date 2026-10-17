import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import BrandMark from "./BrandMark";
import { isStrongPassword, PASSWORD_HINT } from "../lib/password";

const initialForm = {
  nationalId: "",
  fullName: "",
  email: "",
  telephone: "",
  password: "",
  confirmPassword: "",
  fatherName: "",
  motherName: "",
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
  tvetSchool: "",
  qualification: "",
  opportunityInterest: "internship",
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const change = (e) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const continueToPassword = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setStep(2);
  };

  const continueToProfile = (e) => {
    e.preventDefault();
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

    setStep(3);
    setMessage("Password accepted. Complete your student profile.");
  };

  const completeRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/auth/register", {
        nationalId: form.nationalId.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        telephone: form.telephone.trim(),
        location: `${form.province}, ${form.district}`,
        fatherName: form.fatherName.trim(),
        motherName: form.motherName.trim(),
        province: form.province,
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        village: form.village,
        tvetSchool: form.tvetSchool.trim(),
        qualification: form.qualification.trim(),
        opportunityInterest: form.opportunityInterest,
        password: form.password,
      });

      setMessage(
        data.message ||
          "Registration successful! You can now log in."
      );
      setStep(4);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1 block text-sm font-semibold text-slate-700";

  const buttonClass =
    "w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50";

  const field = (
    name,
    label,
    placeholder,
    type = "text",
    required = true
  ) => (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={change}
        placeholder={placeholder}
        required={required}
        className={inputClass}
        autoComplete={
          name === "password" || name === "confirmPassword"
            ? "new-password"
            : "off"
        }
      />
    </div>
  );

  const backButton = (targetStep) => (
    <button
      type="button"
      className="w-full rounded-lg border border-slate-300 p-3 font-semibold text-slate-700 hover:bg-slate-50"
      onClick={() => {
        setError("");
        setMessage("");
        setStep(targetStep);
      }}
    >
      Back
    </button>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4 py-8">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 w-fit">
            <BrandMark size="lg" />
          </div>

          <h1 className="text-3xl font-black tracking-wide text-blue-800">
            GOSAWA
          </h1>

          <p className="text-sm font-semibold text-slate-600">
            COMPANY LTD
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Find opportunities. Build your future.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold sm:text-sm">
          {[
            { number: 1, label: "Details" },
            { number: 2, label: "Password" },
            { number: 3, label: "Profile" },
          ].map((item) => (
            <div
              key={item.number}
              className={`rounded-lg p-2 ${
                step === item.number
                  ? "bg-blue-700 text-white"
                  : step > item.number
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <div>{item.number}</div>
              <div>{item.label}</div>
            </div>
          ))}
        </div>

        {message && (
          <div
            role="status"
            className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={continueToPassword} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Create your student account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                This form is for students and job seekers. Companies should
                register from the employer page.
              </p>
            </div>

            {field(
              "nationalId",
              "National ID Number",
              "Enter your National ID"
            )}

            {field(
              "fullName",
              "Full name",
              "Names as shown on your ID"
            )}

            {field(
              "email",
              "Email address",
              "you@example.com",
              "email"
            )}

            {field(
              "telephone",
              "Telephone number",
              "+250...",
              "tel"
            )}

            <button className={buttonClass} disabled={loading}>
              Continue to password
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={continueToProfile} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              Create a strong password
            </h2>

            {field(
              "password",
              "Password",
              "Create a strong password",
              "password"
            )}

            {field(
              "confirmPassword",
              "Confirm password",
              "Enter password again",
              "password"
            )}

            <p className="text-xs leading-5 text-slate-500">
              {PASSWORD_HINT}
            </p>

            <button className={buttonClass}>
              Continue to profile
            </button>

            {backButton(1)}
          </form>
        )}

        {step === 3 && (
          <form onSubmit={completeRegistration} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Complete your student profile
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Provide your location and TVET education details.
              </p>
            </div>

            {field(
              "fatherName",
              "Father's name (optional)",
              "Enter father's name",
              "text",
              false
            )}

            {field(
              "motherName",
              "Mother's name (optional)",
              "Enter mother's name",
              "text",
              false
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {field(
                "province",
                "Province / City",
                "e.g. Northern Province"
              )}

              {field(
                "district",
                "District",
                "Enter district"
              )}

              {field("sector", "Sector", "Enter sector")}

              {field("cell", "Cell", "Enter cell")}
            </div>

            {field(
              "village",
              "Village (optional)",
              "Enter village",
              "text",
              false
            )}

            {field(
              "tvetSchool",
              "TVET school",
              "Enter your TVET school"
            )}

            {field(
              "qualification",
              "What did you study?",
              "e.g. Software Development"
            )}

            <div>
              <label
                className={labelClass}
                htmlFor="opportunityInterest"
              >
                What opportunity are you looking for?
              </label>

              <select
                id="opportunityInterest"
                name="opportunityInterest"
                value={form.opportunityInterest}
                onChange={change}
                className={inputClass}
                required
              >
                <option value="internship">Internship</option>
                <option value="job">Job</option>
                <option value="training">Training</option>
              </select>
            </div>

            <button className={buttonClass} disabled={loading}>
              {loading ? "Creating account..." : "Submit registration"}
            </button>

            {backButton(2)}
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">
              ✓
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Registration successful!
            </h2>

            <p className="text-slate-600">
              Your GOSAWA account has been created. You can now log in.
            </p>

            <button
              type="button"
              className={buttonClass}
              onClick={() => navigate("/login")}
            >
              Go to login
            </button>
          </div>
        )}

        {step !== 4 && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              className="font-bold text-blue-700 hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>
        )}

        <p className="mt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} GOSAWA COMPANY LTD
        </p>
      </section>
    </main>
  );
}
