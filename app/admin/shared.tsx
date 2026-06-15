'use client';
import { useEffect, useState } from 'react';
import { Ruler, Eye, MessageSquare, CheckCircle } from 'lucide-react';
import { customOrdersApi, contactApi } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Custom Orders ────────────────────────────────────────────────────────────
export function AdminCustomOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    customOrdersApi.getAll().then(setOrders).catch(() => { });
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await customOrdersApi.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-dark">Custom Orders</h2>
        <span className="text-sm text-gray-400">{orders.length} requests</span>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-serif font-bold text-lg mb-4">Custom Order #{selected.id}</h3>
            <div className="space-y-2 text-sm mb-4">
              {(
                [
                  ['Customer', selected.customer_name],
                  ['Phone', selected.phone],
                  ['Email', selected.email || '—'],
                  ['Type', selected.furniture_type],
                  ['Dimensions', selected.dimensions || '—'],
                  ['Materials', selected.materials || '—'],
                  ['Budget', selected.budget || '—'],
                ] as [string, string][]
              ).map(([k, v]) => (
                <p key={k}>
                  <span className="text-gray-400">{k}:</span> <strong>{v}</strong>
                </p>
              ))}
              <div>
                <p className="text-gray-400">Description:</p>
                <p className="bg-gray-50 rounded-lg p-3 mt-1 text-xs leading-relaxed">
                  {selected.description}
                </p>
              </div>
              {selected.reference_images?.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-2">Reference Images:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.reference_images.map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status update */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-1">Update Status</label>
              <select
                value={selected.status}
                onChange={e => {
                  updateStatus(selected.id, e.target.value);
                  setSelected({ ...selected, status: e.target.value });
                }}
                className="input w-full text-sm"
              >
                {['pending', 'reviewed', 'in_progress', 'completed', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-4">
              <a
                href={`https://wa.me/${selected.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${selected.customer_name}, thank you for your custom furniture request. We have reviewed your requirements and would like to discuss further.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Contact on WhatsApp
              </a>
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="btn-outline py-2 px-4 text-sm">
                  Send Email
                </a>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="btn-outline w-full justify-center py-2">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Type', 'Budget', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Ruler size={32} className="mx-auto mb-2 text-gray-200" />
                    No custom orders yet
                  </td>
                </tr>
              ) : (
                orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{o.furniture_type}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{o.budget || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full font-medium">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(o)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Contact Messages ─────────────────────────────────────────────────────────
export function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);

  const load = () => contactApi.getAll().then(setMessages).catch(() => { });

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    try {
      await contactApi.markRead(id);
      load();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-dark">Contact Messages</h2>
        <span className="text-sm text-gray-400">
          {messages.filter((m: any) => !m.is_read).length} unread
        </span>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map((m: any) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${m.is_read ? 'border-gray-100' : 'border-primary-500'
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-dark">{m.name}</p>
                    {!m.is_read && (
                      <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    {m.phone} {m.email && `· ${m.email}`}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">{m.message}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a
                    href={`https://wa.me/${m.phone?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                  {!m.is_read && (
                    <button
                      onClick={() => markRead(m.id)}
                      className="border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> Mark Read
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-300 mt-3">{new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}