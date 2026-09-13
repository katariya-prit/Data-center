import { Route, Routes } from "react-router-dom";

import Login from "../Auth/Login";
import ProtectedRoute from "./ProtectedRoute";

import Layout from "../section/layout/Layout";

import DashboardPage from "../pages/dashboard/Dashboard";

export default function Router() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>}
      >
        <Route index element={<DashboardPage />}/>
      </Route>

    </Routes>
  );
}