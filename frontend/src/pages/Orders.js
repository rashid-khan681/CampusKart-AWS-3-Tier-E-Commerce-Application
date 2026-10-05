import React, { useEffect, useState } from "react";
import API from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/api/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.log(err));
  }, []);

  const grouped = orders.reduce((acc, row) => {
    (acc[row.order_id] = acc[row.order_id] || []).push(row);
    return acc;
  }, {});

  const orderIds = Object.keys(grouped);

  return (
    <div className="container mt-4">
      <h2>My Orders</h2>

      {orderIds.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orderIds.map((id) => {
          const items = grouped[id];
          const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

          return (
            <div className="card mt-3" key={id}>
              <div className="card-header fw-bold">Order #{id}</div>
              <div className="card-body">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>₹ {item.price}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h6 className="text-end mt-2">Total: ₹ {total}</h6>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Orders;