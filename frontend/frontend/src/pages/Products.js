import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../categories";

function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(Number(searchParams.get("cat")) || 0);
  const [sort, setSort] = useState("default");

  useEffect(() => {
    API.get("/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    let list = products.filter(
      (p) =>
        (cat === 0 || p.category_id === cat) &&
        (p.name + " " + (p.description || ""))
          .toLowerCase()
          .includes(query.toLowerCase())
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, query, cat, sort]);

  return (
    <div className="container mt-4 pk-wrap">
      <h2 className="fw-bold">Explore the Store</h2>

      <div className="pk-toolbar">
        <input
          className="form-control pk-search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="form-select pk-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sort: Featured</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      <div className="pk-chips">
        <button className={`pk-chip ${cat === 0 ? "on" : ""}`} onClick={() => setCat(0)}>
          All
        </button>
        {Object.entries(CATEGORIES).map(([id, c]) => (
          <button
            key={id}
            className={`pk-chip ${cat === Number(id) ? "on" : ""}`}
            onClick={() => setCat(Number(id))}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="pk-grid">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => <div className="pk-skel" key={i} />)}
        {!loading &&
          visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>

      {!loading && visible.length === 0 && (
        <p className="text-center mt-5" style={{ color: "var(--muted)" }}>
          No products match your search.
        </p>
      )}
    </div>
  );
}

export default Products;
