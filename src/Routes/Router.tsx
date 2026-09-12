import { Route, Routes } from "react-router-dom";
import Login from "../Auth/Login";
import ProtectedRoute from "./ProtectedRoute";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <h1>hii</h1>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}