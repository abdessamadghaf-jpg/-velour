// src/hooks/useCart.js
import { useState, useEffect } from 'react'

export function useCart() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('velour-cart') || '[]')
    } catch { return [] }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('velour-cart', JSON.stringify(items))
  }, [items])

  const totalQuantity = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0)

  function addItem(product, variant = null) {
    const key = `${product.id}-${variant || 'default'}`
    setItems(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, {
        key, id: product.id, name: product.name, brand: product.brand,
        price: product.price, image: product.image, variant, qty: 1
      }]
    })
    setIsOpen(true)
  }

  function removeItem(key) {
    setItems(prev => prev.filter(i => i.key !== key))
  }

  function updateQty(key, qty) {
    if (qty < 1) { removeItem(key); return }
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
  }

  function clearCart() { setItems([]) }

  return { items, totalQuantity, totalPrice, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart }
}
