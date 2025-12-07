import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart data from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (p, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === p.id);
      if (i >= 0) {
        // Item exists, create a new array with the updated item
        return prev.map((item, index) => {
          if (index === i) {
            // Create a new object for the item being updated
            return { ...item, qty: item.qty + qty };
          }
          return item;
        });
      }
      // Item doesn't exist, add it
      return [...prev, { ...p, qty }];
    });
  };

  // Giảm số lượng của một sản phẩm đi 1
  const removeItem = (id) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 } : item
    ));
  };

  // Xóa hoàn toàn một sản phẩm khỏi giỏ hàng
  const deleteItem = (id) => setItems(prev => prev.filter(x => x.id !== id));

  // Cập nhật số lượng của một sản phẩm thành một giá trị cụ thể
  const updateQty = (id, qty) => setItems(prev => prev.map(x => x.id === id ? { ...x, qty } : x));
  
  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, x) => sum + x.qty, 0);
  const total = items.reduce((sum, x) => sum + x.price * x.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, deleteItem, updateQty, clearCart, cartCount, total }}>
      {children}
    </CartContext.Provider>
  );
}
