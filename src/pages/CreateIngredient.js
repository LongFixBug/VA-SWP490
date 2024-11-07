import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateIngredient.css"; // Tạo file CSS để tùy chỉnh giao diện

const CreateIngredient = () => {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [weight, setWeight] = useState("");
  const [fiber, setFiber] = useState("");
  const [vitaminA, setVitaminA] = useState("");
  const [vitaminB, setVitaminB] = useState("");
  const [vitaminC, setVitaminC] = useState("");
  const [vitaminD, setVitaminD] = useState("");
  const [vitaminE, setVitaminE] = useState("");
  const [calcium, setCalcium] = useState("");
  const [iron, setIron] = useState("");
  const [magnesium, setMagnesium] = useState("");
  const [omega3, setOmega3] = useState("");
  const [sugars, setSugars] = useState("");
  const [cholesterol, setCholesterol] = useState("");
  const [sodium, setSodium] = useState("");
  const navigate = useNavigate();

  const handleCreateIngredient = (e) => {
    e.preventDefault();
    // Xử lý logic tạo nguyên liệu ở đây
    console.log({
      name,
      calories,
      protein,
      carbs,
      fat,
      weight,
      fiber,
      vitaminA,
      vitaminB,
      vitaminC,
      vitaminD,
      vitaminE,
      calcium,
      iron,
      magnesium,
      omega3,
      sugars,
      cholesterol,
      sodium,
    });
    navigate("/ingredients"); // Điều hướng sau khi tạo xong
  };

  return (
    <div className="create-ingredient-container">
      <h2>Tạo nguyên liệu mới</h2>
      <form onSubmit={handleCreateIngredient}>
        <div className="ingredient-input-group">
          <label htmlFor="name">Tên nguyên liệu</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên nguyên liệu"
            required
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="calories">Calo (kcal)</label>
          <input
            type="number"
            id="calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Nhập lượng calo"
            required
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="protein">Protein (g)</label>
          <input
            type="number"
            id="protein"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="Nhập lượng protein"
            required
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="carbs">Carbs (g)</label>
          <input
            type="number"
            id="carbs"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="Nhập lượng carbs"
            required
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="fat">Chất béo (g)</label>
          <input
            type="number"
            id="fat"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="Nhập lượng chất béo"
            required
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="weight">Khối lượng (g)</label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Nhập khối lượng"
            required
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="fiber">Chất xơ (g)</label>
          <input
            type="number"
            id="fiber"
            value={fiber}
            onChange={(e) => setFiber(e.target.value)}
            placeholder="Nhập lượng chất xơ"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="vitaminA">Vitamin A (mcg)</label>
          <input
            type="number"
            id="vitaminA"
            value={vitaminA}
            onChange={(e) => setVitaminA(e.target.value)}
            placeholder="Nhập lượng vitamin A"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="vitaminB">Vitamin B (mg)</label>
          <input
            type="number"
            id="vitaminB"
            value={vitaminB}
            onChange={(e) => setVitaminB(e.target.value)}
            placeholder="Nhập lượng vitamin B"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="vitaminC">Vitamin C (mg)</label>
          <input
            type="number"
            id="vitaminC"
            value={vitaminC}
            onChange={(e) => setVitaminC(e.target.value)}
            placeholder="Nhập lượng vitamin C"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="vitaminD">Vitamin D (mcg)</label>
          <input
            type="number"
            id="vitaminD"
            value={vitaminD}
            onChange={(e) => setVitaminD(e.target.value)}
            placeholder="Nhập lượng vitamin D"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="vitaminE">Vitamin E (mg)</label>
          <input
            type="number"
            id="vitaminE"
            value={vitaminE}
            onChange={(e) => setVitaminE(e.target.value)}
            placeholder="Nhập lượng vitamin E"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="calcium">Canxi (mg)</label>
          <input
            type="number"
            id="calcium"
            value={calcium}
            onChange={(e) => setCalcium(e.target.value)}
            placeholder="Nhập lượng canxi"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="iron">Sắt (mg)</label>
          <input
            type="number"
            id="iron"
            value={iron}
            onChange={(e) => setIron(e.target.value)}
            placeholder="Nhập lượng sắt"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="magnesium">Magie (mg)</label>
          <input
            type="number"
            id="magnesium"
            value={magnesium}
            onChange={(e) => setMagnesium(e.target.value)}
            placeholder="Nhập lượng magie"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="omega3">Omega-3 (mg)</label>
          <input
            type="number"
            id="omega3"
            value={omega3}
            onChange={(e) => setOmega3(e.target.value)}
            placeholder="Nhập lượng omega-3"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="sugars">Đường (g)</label>
          <input
            type="number"
            id="sugars"
            value={sugars}
            onChange={(e) => setSugars(e.target.value)}
            placeholder="Nhập lượng đường"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="cholesterol">Cholesterol (mg)</label>
          <input
            type="number"
            id="cholesterol"
            value={cholesterol}
            onChange={(e) => setCholesterol(e.target.value)}
            placeholder="Nhập lượng cholesterol"
          />
        </div>
        <div className="ingredient-input-group">
          <label htmlFor="sodium">Natri (mg)</label>
          <input
            type="number"
            id="sodium"
            value={sodium}
            onChange={(e) => setSodium(e.target.value)}
            placeholder="Nhập lượng natri"
          />
        </div>
        <div className="ingredient-create-button">
          <button type="submit">Tạo nguyên liệu</button>
        </div>
      </form>
    </div>
  );
};

export default CreateIngredient;
