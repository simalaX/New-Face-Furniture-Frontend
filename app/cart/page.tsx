'use client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, deliveryFee, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-secondary-400" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-dark mb-3">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Browse our collection and add some beautiful furniture to your cart.</p>
          <Link href="/products" className="btn-primary">Browse Products <ArrowRight size={18} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold">Your Cart</h1>
          <p className="text-gray-400 mt-2">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/products" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item.product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={28} className="text-secondary-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div>
                          {item.product.category && (
                            <p className="text-xs text-secondary-500 font-medium mb-0.5">{item.product.category.name}</p>
                          )}
                          <h3 className="font-serif font-semibold text-dark truncate">{item.product.name}</h3>
                          {item.product.dimensions && (
                            <p className="text-xs text-gray-400 mt-0.5">{item.product.dimensions}</p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item.product.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-bold text-primary-500">KES {(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-500 transition-colors mt-2 flex items-center gap-1">
              <Trash2 size={14} /> Clear cart
            </button>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-xl font-bold text-dark mb-5">Order Summary</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium">KES {subtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium text-orange-500">KES {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-dark">Total</span>
                  <span className="font-bold text-primary-500 text-lg">KES {total().toLocaleString()}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full justify-center py-4">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-gray-400 text-center mt-4">Delivery fee may vary by location</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
