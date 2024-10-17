import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login"; // Import trang Login
import AdminPage from "./pages/AdminPage"; // Import trang Admin
import CreateAccount from "./pages/CreateAccount";
import Dashboards from "./pages/Dashboards";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> Đường dẫn đến trang Login
        <Route path="/admin" element={<AdminPage />} />{" "}
        {/* Đường dẫn đến trang Admin */}
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/dashboard" element={<Dashboards />} />
      </Routes>
    </Router>
  );
}

export default App;
