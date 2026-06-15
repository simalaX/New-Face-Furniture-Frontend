'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, Eye, Trash2 } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-600',
  confirmed: 'bg-blue-100 text-blue-600',
  production: 'bg-purple-100 text-purple-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-500',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = () => ordersApi.getAll().then(setOrders).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try { await ordersApi.updateStatus(id, status); toast.success('Status updated'); load(); }
    catch { toast.error('Failed to update'); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this order?')) return;
    try { await ordersApi.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-dark">Orders</h2>
        <span className="text-sm text-gray-400">{orders.length} total orders</span>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold text-lg mb-4">Order {selected.order_number}</h3>
            <div className="space-y-2 text-sm mb-4">
              <p><span className="text-gray-400">Customer:</span> <strong>{selected.full_name}</strong></p>
              <p><span className="text-gray-400">Phone:</span> {selected.phone}</p>
              <p><span className="text-gray-400">Location:</span> {selected.town}, {selected.county}</p>
              <p><span className="text-gray-400">Address:</span> {selected.address}</p>
              <p><span className="text-gray-400">Payment:</span> {selected.payment_method}</p>
              <p><span className="text-gray-400">Total:</span> <strong className="text-primary-500">KES {selected.total.toLocaleString()}</strong></p>
            </div>
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'production', 'delivered', 'cancelled'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${selected.status === s ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-outline w-full justify-center py-2">Close</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Order #', 'Customer', 'Location', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-4 font-medium text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <ShoppingBag size={32} className="mx-auto mb-2 text-gray-200" />No orders yet
                </td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-medium text-primary-500">{o.order_number}</td>
                  <td className="px-6 py-4"><p className="font-medium text-dark">{o.full_name}</p><p className="text-gray-400 text-xs">{o.phone}</p></td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{o.town}, {o.county}</td>
                  <td className="px-6 py-4 font-bold text-dark">KES {o.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{o.payment_method}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-500'}`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(o)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"><Eye size={15} /></button>
                      <button onClick={() => del(o.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
