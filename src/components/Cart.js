import React from 'react';

const Cart = ({ cartItems, onRemoveFromCart }) => {
  return (
    <div className="cart card p-3 mb-3">
      <h2>Cart</h2>
      <ul className="list-group list-group-flush cart-items">
        {cartItems.map((item) => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            {item.name} - Quantity: {item.quantity}
            <button className="btn btn-danger" onClick={() => onRemoveFromCart(item)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
