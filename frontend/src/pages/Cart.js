import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/api/cart");
      setCartItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await API.delete(`/api/cart/${id}`);
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await API.post("/api/orders");
      alert("Order placed successfully");
      navigate("/orders");
    } catch (err) {
      alert("Could not place order");
      console.log(err);
    }
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container mt-4">
      <h2>My Cart</h2>

      {cartItems.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          <table className="table mt-3">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>₹ {item.price}</td>
                  <td>{item.quantity}</td>
                  <td>₹ {item.price * item.quantity}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="text-end">Total: ₹ {totalAmount}</h4>

          <div className="text-end mt-3">
            <button className="btn btn-dark" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;