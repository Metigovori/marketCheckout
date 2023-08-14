import React, { useState } from 'react';
import Product from './Product';
import Cart from './Cart';
import OrderSummary from './OrderSummary';
import Invoice from './Invoice';
import productsData from '../data/products.json';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoices, setInvoices] = useState([]); 

  const handleDeleteInvoice = (invoiceId) => {
    setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== invoiceId));
  };

  const handleAddToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const handleRemoveFromCart = (itemToRemove) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemToRemove.id)
    );
  };

  const calculateProductTotal = (product) => {
    const productCost = product.price;
    const productVat = (productCost * product.vatRate) / 100;
    return productCost + productVat - product.discount;
  };

 
  const handleCreateInvoice = () => {
    const MAX_INVOICE_TOTAL = 500;
    const MAX_PRODUCT_QUANTITY = 50;
    const MAX_PRODUCT_PRICE = 500;
    const newInvoices = [];
    let currentInvoice = null;
  
    for (const product of cartItems) {
      const productTotal = calculateProductTotal(product);
      let remainingQuantity = product.quantity;
  
      while (remainingQuantity > 0) {
        const quantityToAdd = Math.min(MAX_PRODUCT_QUANTITY, remainingQuantity);
        let adjustedQuantity = quantityToAdd;
        if (product.price > MAX_PRODUCT_PRICE || 
          (currentInvoice && currentInvoice.total + productTotal > MAX_INVOICE_TOTAL)) {
          if (currentInvoice && currentInvoice.products.length > 0) {
            newInvoices.push(currentInvoice);
          }
          currentInvoice = {
            products: [],
            subtotal: 0,
            vat: 0,
            total: 0,
          };
        }
  
        if (!currentInvoice) {
          currentInvoice = {
            products: [],
            subtotal: 0,
            vat: 0,
            total: 0,
          };
        }
  
        if (!currentInvoice.products.some(p => p.description === product.name)) {
          currentInvoice.products.push({
            description: product.name,
            quantity: 0,
            price: product.price,
            discount: product.discount,
            vatRate: product.vatRate,
            total: 0,
          });
        }
  
        const existingProduct = currentInvoice.products.find(p => p.description === product.name);
  
        if (!existingProduct) {
          continue;
        }
  
        if (product.price > MAX_PRODUCT_PRICE) {
          console.log(`Produkti "${product.name}" e ka kalu qmimin maksimal.`);
          
          const adjustedTotal = productTotal * remainingQuantity; 
          const adjustedVat = (product.price * product.vatRate) / 100 * remainingQuantity;
          
          existingProduct.total += adjustedTotal;
          existingProduct.quantity += remainingQuantity; 
          currentInvoice.subtotal += adjustedTotal;
          currentInvoice.vat += adjustedVat;
          currentInvoice.total += adjustedTotal + adjustedVat;
          
          remainingQuantity = 0;
        } else if (existingProduct.quantity + adjustedQuantity > MAX_PRODUCT_QUANTITY) {
          const newInvoice = {
            products: [
              {
                description: product.name,
                quantity: MAX_PRODUCT_QUANTITY - existingProduct.quantity,
                price: product.price,
                discount: product.discount,
                vatRate: product.vatRate,
                total: productTotal * (MAX_PRODUCT_QUANTITY - existingProduct.quantity),
              },
            ],
            subtotal: productTotal * (MAX_PRODUCT_QUANTITY - existingProduct.quantity),
            vat: (product.price * product.vatRate) / 100 * (MAX_PRODUCT_QUANTITY - existingProduct.quantity),
            total: productTotal * (MAX_PRODUCT_QUANTITY - existingProduct.quantity),
          };
  
          newInvoices.push(currentInvoice);
          currentInvoice = newInvoice;
  
          remainingQuantity -= MAX_PRODUCT_QUANTITY - existingProduct.quantity;
        } else {
          if (currentInvoice.total + productTotal * adjustedQuantity > MAX_INVOICE_TOTAL) {
            const remainingInvoiceTotal = MAX_INVOICE_TOTAL - currentInvoice.total;
            const maxQuantityToAdd = Math.floor(remainingInvoiceTotal / productTotal);
            adjustedQuantity = Math.min(adjustedQuantity, maxQuantityToAdd);
          }
  
          existingProduct.quantity += adjustedQuantity;
          existingProduct.total += productTotal * adjustedQuantity;
          currentInvoice.subtotal += productTotal * adjustedQuantity;
          currentInvoice.vat += (product.price * product.vatRate) / 100 * adjustedQuantity;
          currentInvoice.total += productTotal * adjustedQuantity;
  
          remainingQuantity -= adjustedQuantity;
        }
      }
    }
  
    if (currentInvoice && currentInvoice.products.length > 0) {
      newInvoices.push(currentInvoice);
    }
  
    setInvoices(newInvoices);
    setCartItems([]);
  };
  


  
  return (
    <div className="checkout container mt-5">
      <div className="row">
        <div className="col-md-8">
          <div className="product-list">
            {productsData.map((product, index) => (
              <Product key={index} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
        <div className="col-md-4">
          <div className="cart-and-summary">
            <Cart cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} />
            <OrderSummary cartItems={cartItems} />
            <button className="btn btn-success mt-3" onClick={handleCreateInvoice}>
              Create Invoice
            </button>
          </div>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col">
          <div className="invoices">
            {invoices.map((invoice, index) => (
              <Invoice key={index} invoice={invoice} onDeleteInvoice={handleDeleteInvoice} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
