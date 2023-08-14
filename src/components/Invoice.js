import React from 'react';

const Invoice = ({ invoice, onDeleteInvoice }) => {
  return (
    <div className="invoice card p-3 mb-3">
      <h2>Invoice</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>VAT</th>
            <th>Discount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.products.map((product, index) => (
            <tr key={index}>
              <td>{product.description}</td>
              <td>{product.quantity}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>${((product.price * product.vatRate) / 100).toFixed(2)}</td>
              <td>${product.discount.toFixed(2)}</td>
              <td>${product.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="invoice-summary">
        <p>Subtotal: ${invoice.subtotal.toFixed(2)}</p>
        <p>VAT: ${invoice.vat.toFixed(2)}</p>
        <p>Total: ${invoice.total.toFixed(2)}</p>
        <button className="btn btn-danger" onClick={() => onDeleteInvoice(invoice.id)}>
          Delete Invoice
        </button>
      </div>
    </div>
  );
};

export default Invoice;
