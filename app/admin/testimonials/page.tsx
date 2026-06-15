'use client';
import { useEffect, useState } from 'react';
import { Star, CheckCircle, Trash2 } from 'lucide-react';
import { testimonialsApi } from '@/lib/api';
import { Testimonial } from '@/types';
import toast from 'react-hot-toast';

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const load = () => testimonialsApi.getAll().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  const approve = async (id: number) => { try { await testimonialsApi.approve(id); toast.success('Approved'); load(); } catch { toast.error('Failed'); } };
  const del = async (id: number) => { if (!confirm('Delete?')) return; try { await testimonialsApi.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-dark mb-6">Testimonials</h2>
      <div className="space-y-4">
        {items.map(t => (
          <div key={t.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${t.is_approved ? 'border-green-400' : 'border-yellow-400'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-dark">{t.customer_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.is_approved ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{t.is_approved ? 'Approved' : 'Pending'}</span>
                </div>
                <div className="flex mb-2">{[...Array(5)].map((_,i) => <Star key={i} size={14} fill={i<t.rating?'#D9B382':'none'} className={i<t.rating?'text-secondary-400':'text-gray-200'} />)}</div>
                <p className="text-gray-600 text-sm italic">"{t.review}"</p>
                {t.location && <p className="text-xs text-gray-400 mt-1">{t.location}</p>}
              </div>
              <div className="flex gap-2">
                {!t.is_approved && <button onClick={() => approve(t.id)} className="p-2 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-500 transition-colors"><CheckCircle size={16} /></button>}
                <button onClick={() => del(t.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="bg-white rounded-2xl p-12 text-center text-gray-400">No testimonials yet</div>}
      </div>
    </div>
  );
}
