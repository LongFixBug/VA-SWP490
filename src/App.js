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
import OrdersManagement from "./pages/OrdersManagement";
import OrderDetail from "./pages/OrderDetail";
import IngredientManagement from "./pages/IngredientManagement";
import IngredientDetail from "./pages/IngredientDetail";
import ArticlesManagement from "./pages/ArticlesManagement";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleModerateManagement from "./pages/ArticleModerateManagement";
import ModeratedArticles from "./pages/ModeratedArticles";
import CreateArticle from "./pages/CreateArticle";
import CreateDish from "./pages/CreateDish";
import CreateIngredient from "./pages/CreateIngredient";
import CreateNutritionCriteria from "./pages/CreateNutritionCriteria";
// import CreateOrder from "./pages/CreateOrder";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/admin" element={<AdminPage />} />{" "}
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/dashboard" element={<Dashboards />} />
        <Route path="/user/:id" element={<UserDetail />} />{" "}
        <Route path="/dishes-management" element={<DishesManagement />} />
        <Route path="/dish/:id" element={<DishDetail />} />
        <Route path="/nutritionCriteria-management" element={<NutritionCriteriaManagement />} />
        <Route path="/nutritionCriteria-detail/:id" element={<NutritionCriteriaDetail />} />{" "}
        <Route path="/orders-management" element={<OrdersManagement />} />
        <Route path="/order-detail/:id" element={<OrderDetail />} />{" "}
        <Route path="/Ingredient-management" element={<IngredientManagement />} />
        <Route path="/Ingredient-detail/:id" element={<IngredientDetail />} />{" "}
        <Route path="/orders-management" element={<OrdersManagement />} />
        <Route path="/articles-management" element={<ArticlesManagement />} />
        <Route path="/article-detail/:id" element={<ArticleDetail />} />{" "}
        <Route  path="/articleModerate-management" element={<ArticleModerateManagement />} />
        <Route path="/moderated-articles" element={<ModeratedArticles />} />
        <Route path="/create-article" element={<CreateArticle />} />
        <Route path="/create-dish" element={<CreateDish />} />
        <Route path="/create-ingredient" element={<CreateIngredient />} />
        <Route path="/create-nutritionCriteria" element={<CreateNutritionCriteria />} />
      </Routes>
    </Router>
  );
}

export default App;
