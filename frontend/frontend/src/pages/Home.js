import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../categories";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      m[p.category_id] = (m[p.category_id] || 0) + 1;
    });
    return m;
  }, [products]);

  const featured = products.slice(0, 8);

  return (
    <div className="container">
      <section className="hero">
        <div>
          <span className="hero-badge">🎓 Made for campus life</span>
          <h1 className="hero-title">
            Simplify Your
            <br />
            Campus Life
          </h1>
          <p className="hero-sub">
            Discover essential books, stationery, tools and gadgets curated for students.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn btn-dark btn-lg px-4">
              Explore Store
            </Link>
            <Link to="/cart" className="btn btn-outline-dark btn-lg px-4">
              View Cart
            </Link>
          </div>
          <div className="stats">
            <div className="stat">
              <b>{products.length || "—"}</b>
              <span>Products</span>
            </div>
            <div className="stat">
              <b>{Object.keys(counts).length || "—"}</b>
              <span>Categories</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
          <div className="fcard f1"><span className="ic">📚</span> Books</div>
          <div className="fcard f2"><span className="ic">🎧</span> Gadgets</div>
          <div className="fcard f3"><span className="ic">🎒</span> Gear</div>
        </div>
      </section>

      <div className="sec-head">
        <h3>Shop by category</h3>
      </div>
      <div className="cat-grid">
        {Object.entries(CATEGORIES).map(([id, c], i) => (
          <Link
            to={`/products?cat=${id}`}
            className="cat-tile"
            key={id}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="cat-ic">{c.icon}</span>
            <span className="cat-name">{c.name}</span>
            <div className="cat-count">{counts[id] || 0} items</div>
          </Link>
        ))}
      </div>

      <div className="sec-head">
        <h3>Featured products</h3>
        <Link to="/products" className="sec-link">View all →</Link>
      </div>
      <div className="pk-grid">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <div className="pk-skel" key={i} />)}
        {!loading &&
          featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>

      <div className="footer">CampusKart · built for students</div>
    </div>
  );
}

export default Home;
