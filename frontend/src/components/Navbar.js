import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
 
const linkClass = ({ isActive }) => "ck-link" + (isActive ? " active" : "");
 
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [cartCount, setCartCount] = useState(0);
  const [q, setQ] = useState("");
 
  useEffect(() => {
    const load = () => {
      if (!localStorage.getItem("token")) {
        setCartCount(0);
        return;
      }
      API.get("/api/cart")
        .then((res) => setCartCount(res.data.length))
        .catch(() => {});
    };
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, [token, location.pathname]);
 
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
  };
 
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
 
  return (
    <nav className="ck-nav">
      <div className="container ck-nav-inner">
        <Link to="/" className="ck-logo">
          <span className="ck-mark">CK</span>
          <span className="ck-word">
            Campus<b>Kart</b>
          </span>
        </Link>
 
        <form className="ck-search" onSubmit={handleSearch}>
          <input
            placeholder="Search for books, stationery, gadgets..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
 
        <div className="ck-links">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/products" className={linkClass}>Products</NavLink>
          {token && <NavLink to="/orders" className={linkClass}>Orders</NavLink>}
          <NavLink to="/cart" className={linkClass}>
            🛒 Cart
            {cartCount > 0 && <span className="ck-badge">{cartCount}</span>}
          </NavLink>
          {token ? (
            <button className="ck-link" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
 
export default Navbar;
