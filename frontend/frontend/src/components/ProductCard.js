import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { CATEGORIES } from "../categories";

const LABELS = {
  idle: "Add to Cart",
  adding: "Adding...",
  done: "Added ✓",
  err: "Login required",
};

function ProductCard({ product, index = 0 }) {
  const [state, setState] = useState("idle");
  const navigate = useNavigate();
  const c = CATEGORIES[product.category_id] || { name: "General", icon: "🛍️" };

  const handleAdd = async () => {
    setState("adding");
    try {
      await API.post("/api/cart", { product_id: product.id, quantity: 1 });
      setState("done");
      setTimeout(() => setState("idle"), 1500);
    } catch (err) {
      console.log(err);
      setState("err");
      setTimeout(() => navigate("/login"), 900);
    }
  };

  return (
    <div className="pk-card" style={{ animationDelay: `${index * 40}ms` }}>
      <div className="pk-thumb">{c.icon}</div>
      <div className="pk-body">
        <span className="pk-cat">{c.name}</span>
        <h6 className="pk-name">{product.name}</h6>
        <p className="pk-desc">{product.description}</p>
        <div className="pk-price">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </div>
        <button
          className={`pk-add ${state === "done" ? "done" : ""} ${
            state === "err" ? "err" : ""
          }`}
          onClick={handleAdd}
        >
          {LABELS[state]}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
