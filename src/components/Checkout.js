import React, { useState } from 'react';
import Product from './Product';
import Cart from './Cart';
import OrderSummary from './OrderSummary';
import Invoice from './Invoice';
import productsData from '../data/products.json';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoices, setInvoices] = useState([]); 

  const MAX_PRODUCT_QUANTITY = 50;
  

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

 

const createInvoice = () => {
  return {
      products: [],
      subtotal: 0,
      vat: 0,
      total: 0,
  };
};

const splitItemsWithinInvoice = (invoice, maxInvoiceTotal) => {
    const newInvoices = [];
    let tempInvoice = createInvoice();

    for (const product of invoice.products) {
        if (tempInvoice.total + product.total > maxInvoiceTotal) {
            newInvoices.push(tempInvoice);
            tempInvoice = createInvoice();
        }

        tempInvoice.products.push(product);
        tempInvoice.subtotal += product.total;
        tempInvoice.vat += (product.price * product.vatRate) / 100 * product.quantity;
        tempInvoice.total += product.total;
    }

    if (tempInvoice.products.length > 0) {
        newInvoices.push(tempInvoice);
    }

    return newInvoices;
};


 
const handleCreateInvoice = () => {
  const MAX_INVOICE_TOTAL = 500;
  const MAX_PRODUCT_QUANTITY = 50;
  const MAX_PRODUCT_PRICE = 500;
  const newInvoices = [];
  let currentInvoice = null;
  let splitInvoice = null;
  const exceededProducts = [];

  for (const product of cartItems) {
      const productTotal = calculateProductTotal(product);
      let remainingQuantity = product.quantity;

      if (product.price > MAX_PRODUCT_PRICE) {
          console.log(`Produkti "${product.name}" e ka kalu maksimumin e qmimit .`);
          exceededProducts.push(product);
          continue;
      }

      while (remainingQuantity > 0) {
        const quantityToAdd = Math.min(MAX_PRODUCT_QUANTITY, remainingQuantity);
        let adjustedQuantity = quantityToAdd;

        if (!currentInvoice || currentInvoice.total + productTotal > MAX_INVOICE_TOTAL) {
            if (currentInvoice) {
                if (splitInvoice) {
                    newInvoices.push(splitInvoice);
                    splitInvoice = null;
                }
                newInvoices.push(currentInvoice);
            }
            currentInvoice = createInvoice();
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

        if (existingProduct.quantity + adjustedQuantity > MAX_PRODUCT_QUANTITY) {
            if (!splitInvoice) {
                splitInvoice = createInvoice();
            }

            const quantityToSplit = existingProduct.quantity + adjustedQuantity - MAX_PRODUCT_QUANTITY;

            existingProduct.quantity -= quantityToSplit;
            existingProduct.total -= productTotal * quantityToSplit;
            currentInvoice.subtotal -= productTotal * quantityToSplit;
            currentInvoice.vat -= (product.price * product.vatRate) / 100 * quantityToSplit;
            currentInvoice.total -= productTotal * quantityToSplit;

            const splitProductTotal = calculateProductTotal(product) * quantityToSplit;
            const splitProductVAT = (product.price * product.vatRate) / 100 * quantityToSplit;

            splitInvoice.products.push({
                description: product.name,
                quantity: adjustedQuantity,
                price: product.price,
                discount: product.discount,
                vatRate: product.vatRate,
                total: splitProductTotal,
            });
            splitInvoice.subtotal += splitProductTotal;
            splitInvoice.vat += splitProductVAT;
            splitInvoice.total += splitProductTotal + splitProductVAT;

            remainingQuantity -= quantityToSplit - adjustedQuantity;
            existingProduct.quantity += adjustedQuantity;
            existingProduct.total += productTotal * adjustedQuantity;
            currentInvoice.subtotal += productTotal * adjustedQuantity;
            currentInvoice.vat += (product.price * product.vatRate) / 100 * adjustedQuantity;
            currentInvoice.total += productTotal * adjustedQuantity;

            remainingQuantity -= adjustedQuantity;

            if (splitInvoice.total + productTotal * adjustedQuantity > MAX_INVOICE_TOTAL) {
                newInvoices.push(splitInvoice);
                splitInvoice = null;
            }
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

  if (splitInvoice && splitInvoice.products.length > 0) {
    const newSplitInvoices = splitItemsWithinInvoice(splitInvoice, MAX_INVOICE_TOTAL);
    newInvoices.push(...newSplitInvoices);
}


  if (exceededProducts.length > 0) {
    const exceededProductsInvoice = {
        products: exceededProducts.map(product => ({
            description: product.name,
            quantity: product.quantity,
            price: product.price,
            discount: product.discount,
            vatRate: product.vatRate,
            total: calculateProductTotal(product),
        })),
        subtotal: exceededProducts.reduce((acc, product) => acc + calculateProductTotal(product), 0),
        vat: exceededProducts.reduce((acc, product) => acc + (product.price * product.vatRate) / 100 * product.quantity, 0),
        total: exceededProducts.reduce((acc, product) => acc + calculateProductTotal(product) + (product.price * product.vatRate) / 100 * product.quantity, 0),
    };
    newInvoices.push(exceededProductsInvoice);
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
