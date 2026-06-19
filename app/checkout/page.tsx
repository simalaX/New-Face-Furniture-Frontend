'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, Package, Copy, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  county: z.string().min(2, 'Select your county'),
  town: z.string().min(2, 'Enter your town'),
  address: z.string().min(5, 'Enter your delivery address'),
  notes: z.string().optional(),
  payment_method: z.literal('mpesa'),
});

type FormData = z.infer<typeof schema>;

const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Garissa', 'Kitale', 'Malindi', 'Lamu', 'Other'];

// ─── Copy button helper ────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button type="button" onClick={copy}
      className="ml-2 p-1 rounded hover:bg-green-100 transition-colors text-green-600">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

// ─── M-Pesa instructions card ─────────────────────────────────────────────────
function MpesaInstructions({ total }: { total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm"
    >
      <p className="font-semibold text-green-800 mb-3 flex items-center gap-2">
        <span className="text-lg">📱</span> M-Pesa Payment Instructions
      </p>

      <ol className="text-green-700 space-y-1 mb-4 list-decimal list-inside text-xs leading-relaxed">
        <li>Go to M-Pesa on your phone</li>
        <li>Select <strong>Lipa na M-Pesa</strong></li>
        <li>Select <strong>Pay Bill</strong></li>
        <li>Enter Business Number, Account Number and Amount below</li>
        <li>Enter your M-Pesa PIN and confirm</li>
      </ol>

      <div className="bg-white rounded-lg p-3 space-y-2 border border-green-100">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">Business Number (Paybill)</span>
          <div className="flex items-center font-bold text-dark">
            247247
            <CopyButton text="247247" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">Account Number</span>
          <div className="flex items-center font-bold text-dark">
            0115990547
            <CopyButton text="0115990547" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-green-50 pt-2">
          <span className="text-gray-500 text-xs">Amount</span>
          <div className="flex items-center font-bold text-green-700">
            KES {total.toLocaleString()}
            <CopyButton text={String(total)} />
          </div>
        </div>
      </div>

      <p className="text-xs text-green-600 mt-3 text-center">
        After payment, click <strong>Place Order</strong> and confirm via WhatsApp.
      </p>
    </motion.div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'mpesa' },
  });

  if (items.length === 0 && !done) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md bg-white rounded-3xl p-10 shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-dark mb-3">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Thank you for your order.</p>
          <p className="font-mono text-primary-500 font-bold text-lg mb-6">{orderNum}</p>
          <p className="text-sm text-gray-400 mb-8">We'll contact you shortly to confirm your order and arrange delivery.</p>
          <div className="flex flex-col gap-3">
            <a href={`https://wa.me/254115990547?text=${encodeURIComponent(`Hello! I just placed order ${orderNum}. Please confirm.`)}`}
              target="_blank" rel="noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors text-center">
              Confirm via WhatsApp
            </a>
            <Link href="/" className="btn-outline justify-center">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        subtotal: subtotal(),
        delivery_fee: deliveryFee,
        total: total(),
        items: items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
      };
      const res = await ordersApi.create(payload);
      setOrderNum(res.order_number || 'TF-000001');
      clearCart();
      setDone(true);
    } catch {
      toast.error('Order failed. Please try again or contact us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/cart" className="inline-flex items-center gap-2 text-primary-500 text-sm mb-8 hover:text-primary-600 transition-colors">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Contact Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-dark mb-5">Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input {...register('full_name')} className="input" placeholder="John Kamau" />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input {...register('phone')} className="input" placeholder="+254 712 345 678" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Email Address (optional)</label>
                    <input {...register('email')} className="input" placeholder="john@example.com" type="email" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-dark mb-5">Delivery Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">County *</label>
                    <select {...register('county')} className="input">
                      <option value="">Select county</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.county && <p className="text-red-500 text-xs mt-1">{errors.county.message}</p>}
                  </div>
                  <div>
                    <label className="label">Town *</label>
                    <input {...register('town')} className="input" placeholder="Westlands" />
                    {errors.town && <p className="text-red-500 text-xs mt-1">{errors.town.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Delivery Address *</label>
                    <textarea {...register('address')} className="input resize-none" rows={3} placeholder="Street, building, apartment..." />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Additional Notes (optional)</label>
                    <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="Any special instructions..." />
                  </div>
                </div>
              </div>

              {/* Payment — M-Pesa only */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-dark mb-5">Payment Method</h3>
                <input type="hidden" value="mpesa" {...register('payment_method')} />
                <div className="border-2 border-primary-500 bg-primary-50 rounded-xl p-4 inline-flex flex-col">
                  <p className="font-medium text-dark text-sm">M-Pesa</p>
                  <p className="text-gray-400 text-xs mt-1">Pay via M-Pesa</p>
                </div>

                <MpesaInstructions total={total()} />
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="font-serif text-xl font-bold text-dark mb-5">Order Summary</h3>
                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-secondary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">×{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">KES {(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>KES {subtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="text-orange-500">KES {deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-dark pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-primary-500 text-lg">KES {total().toLocaleString()}</span>
                  </div>
                </div>
                <motion.button type="submit" whileTap={{ scale: 0.98 }} disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
                  {loading ? 'Placing Order...' : 'Place Order'}
                </motion.button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}