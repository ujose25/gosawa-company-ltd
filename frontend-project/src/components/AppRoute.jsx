import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Home.jsx";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import EmployerRegister from "./EmployerRegister.jsx";
import EmployerDashboard from "./EmployerDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

function AppRoute() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/employer-register"
        element={<EmployerRegister />}
      />

      <Route
        path="/employer-dashboard"
        element={<EmployerDashboard />}
      />

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

    </Routes>

  );
}

export default AppRoute;