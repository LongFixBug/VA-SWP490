import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import CreateAccount from "./pages/CreateAccount";
import Dashboards from "./pages/Dashboards";
import UserDetail from "./pages/UserDetail";
import DishesManagement from "./pages/DishesManagement";
import NutritionCriteriaManagement from "./pages/NutritionCriteriaManagement";
import NutritionCriteriaDetail from "./pages/NutritionCriteriaDetail";
import DishDetail from "./pages/DishDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> Đường dẫn đến trang Login
        <Route path="/admin" element={<AdminPage />} />{" "}
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/dashboard" element={<Dashboards />} />
        <Route path="/user/:id" element={<UserDetail />} />{" "}
        <Route path="/dishes-management" element={<DishesManagement />} />
        <Route path="/dish/:id" element={<DishDetail />} />
        <Route path="/nutritionCriteria-management" element={<NutritionCriteriaManagement />} />
        <Route path="/nutritionCriteria-detail/:id" element={<NutritionCriteriaDetail />} />{" "}
      </Routes>
    </Router>
  );
}

export default App;
