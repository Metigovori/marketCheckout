
import React from 'react';

const OrderSummary = ({ subtotal, vat, total }) => {
  return (
    <div className="order-summary bg-light p-4 rounded mt-4">
      <h2 className="mb-3">Order Summary</h2>
      <p>
        Subtotal: <strong>${subtotal}</strong>
      </p>
      <p>
        VAT: <strong>${vat}</strong>
      </p>
      <p>
        Total: <strong>${total}</strong>
      </p>
    </div>
  );
};

export default OrderSummary;
