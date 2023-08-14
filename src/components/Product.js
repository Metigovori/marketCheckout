import React, { useState } from 'react';

const Product = ({ product, onAddToCart }) => {
  const { name, price, vatRate, discount } = product;
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (event) => {
    setQuantity(parseInt(event.target.value, 10));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="product bg-light p-4 rounded mb-4">
      <h3 className="mb-2">{name}</h3>
      <p>Price: ${price.toFixed(2)}</p>
      <p>VAT Rate: {vatRate}%</p>
      {discount > 0 && <p>Discount: ${discount.toFixed(2)}</p>}
      <div className="quantity-input mb-2">
        <label htmlFor={`quantity-${product.id}`}>Quantity: </label>
        <input
          type="number"
          id={`quantity-${product.id}`}
          value={quantity}
          onChange={handleQuantityChange}
          min="1"
        />
      </div>
      <button className="btn btn-primary" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default Product;
