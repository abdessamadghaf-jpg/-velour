import { useEffect, useState } from 'react';

export function useCart() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('velour-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('velour-cart', JSON.stringify(items));
  }, [items]);

  const totalQuantity = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addItem = (product, variant = 'Default') => {
    const key = `${product.id}-${variant}`;
    setItems((current) => {
      const match = current.find((item) => item.key === key);
      if (match) {
        return current.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...current,
        {
          key,
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: Number(product.price),
          image: product.image,
          variant,
          qty: 1
        }
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const updateQty = (key, nextQty) => {
    setItems((current) => {
      if (nextQty <= 0) {
        return current.filter((item) => item.key !== key);
      }
      return current.map((item) =>
        item.key === key ? { ...item, qty: nextQty } : item
      );
    });
  };

  const clearCart = () => setItems([]);

  return {
    items,
    totalPrice,
    totalQuantity,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQty,
    clearCart
  };
}
