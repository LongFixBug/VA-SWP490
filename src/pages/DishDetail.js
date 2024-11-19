import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/DishDetail.css";
import editIcon from "../assets/icons/edit-icon.png";

const DishDetail = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [nutrition, setNutrition] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [allIngredients, setAllIngredients] = useState([]); // Danh sách tất cả nguyên liệu
  const [selectedIngredient, setSelectedIngredient] = useState(null); // Nguyên liệu được chọn
  const [ingredientWeight, setIngredientWeight] = useState(""); // Khối lượng nguyên liệu
  const [isAddingIngredient, setIsAddingIngredient] = useState(false); // Trạng thái đang thêm nguyên liệu

  useEffect(() => {
    const fetchDishDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");

        // Fetch dish details
        const dishResponse = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDish(dishResponse.data);

        // Fetch nutrition details
        await fetchNutritionDetails();

        // Fetch ingredients
        const ingredientResponse = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch detailed ingredient information
        const ingredientDetails = await Promise.all(
          ingredientResponse.data.map(async (item) => {
            const ingredientDetailResponse = await axios.get(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${item.ingredientId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return {
              ...ingredientDetailResponse.data,
              weight: item.weight, // Add weight from the response
            };
          })
        );
        setIngredients(ingredientDetails);
      } catch (error) {
        console.error("Error fetching dish or nutrition details:", error);
        alert("Failed to load details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishDetails();
  }, [id, navigate]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/updateDishDetailByDishId`,
        dish,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Dish updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating dish:", error);
      alert("Failed to update dish. Please try again.");
    }
  };

  useEffect(() => {
    const fetchAllIngredients = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/allIngredient",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllIngredients(response.data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchAllIngredients();
  }, []);

  const fetchNutritionDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const nutritionResponse = await axios.get(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNutrition(nutritionResponse.data);
    } catch (error) {
      console.error("Error fetching nutrition details:", error);
      alert("Failed to fetch nutrition details.");
    }
  };

  const handleAddIngredient = async () => {
    if (!selectedIngredient || ingredientWeight <= 0) {
      alert("Please select an ingredient and enter a valid weight.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        dishId: id, // ID món ăn từ useParams
        ingredientId: selectedIngredient,
        weight: parseFloat(ingredientWeight),
      };

      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/addIngredient",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const selectedIngredientData = allIngredients.find(
          (ingredient) =>
            ingredient.ingredientId === parseInt(selectedIngredient)
        );

        alert("Ingredient added successfully!");
        setIngredients((prev) => [
          ...prev,
          {
            ingredientId: selectedIngredient,
            name: selectedIngredientData?.name || "Unknown Ingredient",
            weight: ingredientWeight,
          },
        ]);

        // Gọi lại API để load lại thông tin dinh dưỡng
        await fetchNutritionDetails();
        setIsAddingIngredient(false);
        setSelectedIngredient(null);
        setIngredientWeight("");
      } else {
        alert(response.data.message || "Failed to add ingredient.");
      }
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert("Failed to add ingredient. Please try again.");
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/removeIngredient/${id}/${ingredientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Ingredient removed successfully!");
        setIngredients((prev) =>
          prev.filter((ingredient) => ingredient.ingredientId !== ingredientId)
        );

        // Gọi lại API để load lại thông tin dinh dưỡng
        await fetchNutritionDetails();
      } else {
        alert(response.data.message || "Failed to remove ingredient.");
      }
    } catch (error) {
      console.error("Error removing ingredient:", error);
      alert("Failed to remove ingredient. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDish((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <p>Loading dish details...</p>;
  }

  if (!dish) {
    return <p>No dish details available.</p>;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="dish-detail-container">
          <h2>Dish Details</h2>

          <div className="top-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Go Back
            </button>

            <div
              className="edit-icon"
              onClick={() => setIsEditing((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >
              <img src={editIcon} alt="Edit" width="40" height="40" />
            </div>
          </div>

          <div className="dish-info">
            <div>
              <label>Dish Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={dish.name}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.name}</p>
              )}
            </div>

            <div>
              <label>Dish Type:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="dishType"
                  value={dish.dishType}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.dishType}</p>
              )}
            </div>

            <div>
              <label>Price:</label>
              {isEditing ? (
                <input
                  type="number"
                  name="price"
                  value={dish.price}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.price} VNĐ</p>
              )}
            </div>

            <div>
              <label>Description:</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={dish.description}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.description}</p>
              )}
            </div>

            <div>
              <label>Image:</label>
              <div>
                <img src={dish.imageUrl} alt={dish.name} width="100" />
              </div>
            </div>

            <div>
              <table className="nutrition-table">
                <thead>
                  <tr>
                    <th>Khối lượng</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Fat</th>
                    <th>Carbs</th>
                    <th>Fiber</th>
                    <th>Sodium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{nutrition.totalWeights?.toFixed(2)} g</td>
                    <td>{nutrition.totalCalories?.toFixed(2)} kcal</td>
                    <td>{nutrition.totalProtein?.toFixed(2)} g</td>
                    <td>{nutrition.totalFat?.toFixed(2)} g</td>
                    <td>{nutrition.totalCarbs?.toFixed(2)} g</td>
                    <td>{nutrition.totalFiber?.toFixed(2)} g</td>
                    <td>{nutrition.totalSodium?.toFixed(2)} mg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <label>Ingredients:</label>
              <ul>
                {ingredients.map((ingredient) => (
                  <li key={ingredient.ingredientId} className="ingredient-item">
                    {ingredient.name} ({ingredient.weight} g)
                    <button
                      onClick={() =>
                        handleDeleteIngredient(ingredient.ingredientId)
                      }
                      style={{
                        marginLeft: "10px",
                        padding: "5px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="add-ingredient-button"
                onClick={() => setIsAddingIngredient(true)}
              >
                Add New Ingredient
              </button>
            </div>

            {/* Form thêm nguyên liệu */}
            {isAddingIngredient && (
              <div className="add-ingredient-form">
                <h3>Add New Ingredient</h3>
                <select
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  value={selectedIngredient || ""}
                >
                  <option value="">--Select Ingredient--</option>
                  {allIngredients.map((ingredient) => (
                    <option
                      key={ingredient.ingredientId}
                      value={ingredient.ingredientId}
                    >
                      {ingredient.name}
                    </option>
                  ))}
                </select>

                <label>
                  Weight (g):
                  <input
                    type="number"
                    value={ingredientWeight}
                    onChange={(e) => setIngredientWeight(e.target.value)}
                  />
                </label>

                <div>
                  <button onClick={handleAddIngredient}>Add</button>
                  <button onClick={() => setIsAddingIngredient(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <button className="edit-button" onClick={handleUpdate}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear JWT on logout
    localStorage.removeItem("roleId"); // Clear roleId
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => navigate("/dishes-management")}
      >
        Quản lý món ăn
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/nutritionCriteria-management")}
      >
        Quản lí thể trạng
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/ingredient-management")}
      >
        Quản lí nguyên liệu
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/articles-management")}
      >
        Quản lí bài viết
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default DishDetail;
