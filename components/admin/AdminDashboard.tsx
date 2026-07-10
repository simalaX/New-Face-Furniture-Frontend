'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ImageItem {
  id?: number;
  public_id: string;
  secure_url: string;
  images?: string[];
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  dimensions?: string;
  materials?: string;
  category_id?: number;
  slug?: string;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const OTHER_CATEGORY_VALUE = '__other__';

// ─── Real Discount Calculator ────────────────────────────────────────────────
function calculateDiscount(salePrice: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// ─── Date helpers ──────────────────────────────────────────────────────────────
function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Auth helper ──────────────────────────────────────────────────────────────
function authHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Slug helper ───────────────────────────────────────────────────────────────
function slugify(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Resolve-or-create category helper ─────────────────────────────────────────
async function resolveCategoryId(
  newCategoryName: string,
  categories: Category[],
  backendUrl: string,
): Promise<{ id: number; category?: Category }> {
  const trimmed = newCategoryName.trim();
  if (!trimmed) throw new Error('Category name is required');

  const existing = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return { id: existing.id };

  const slug = slugify(trimmed);
  const res = await fetch(`${backendUrl}/api/v1/categories/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name: trimmed, slug }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to create category (${res.status})`);
  }

  const created = await res.json();
  return { id: created.id, category: created };
}

// ─── Category Select ───────────────────────────────────────────────────────────
function CategorySelect({
  categories, categoryId, onCategoryIdChange, newCategoryName, onNewCategoryNameChange,
}: {
  categories: Category[];
  categoryId: number | null;
  onCategoryIdChange: (id: number | null) => void;
  newCategoryName: string;
  onNewCategoryNameChange: (name: string) => void;
}) {
  const isOther = categoryId === null;

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === OTHER_CATEGORY_VALUE) {
      onCategoryIdChange(null);
    } else {
      onCategoryIdChange(Number(val));
      onNewCategoryNameChange('');
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={isOther ? OTHER_CATEGORY_VALUE : (categoryId ?? '')}
        onChange={handleSelectChange}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value={OTHER_CATEGORY_VALUE}>Other (add new)</option>
      </select>
      {isOther && (
        <>
          <input
            value={newCategoryName}
            onChange={e => onNewCategoryNameChange(e.target.value)}
            placeholder="New category name"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
          />
          <p className="text-xs text-gray-400 mt-1">
            This will create a new category when you save.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Highlight helper ─────────────────────────────────────────────────────────
const HIGHLIGHT_PATTERNS: RegExp[] = [
  /\b(\d+[-\s]?(seater|seat|door|drawer|piece|tier|shelf|shelves|person|pc|pcs)s?)\b/gi,
  /\b(\d+(?:\.\d+)?\s?(cm|mm|m|ft|inch|inches|kg|lbs)?)\b/gi,
  /\b(premium|luxury|handcrafted|handmade|custom|bespoke|artisan|quality|durable|heavy[- ]duty|high[- ]grade|reinforced|imported)\b/gi,
  /\b(matte|gloss|glossy|lacquered|polished|stained|painted|varnished|waxed|oiled)\b/gi,
  /\b(black|white|brown|grey|gray|beige|cream|walnut|ebony|cherry|natural|charcoal|ivory|tan|oak)\b/gi,
];

function highlightDescription(text: string): React.ReactNode[] {
  if (!text) return [];
  const combined = new RegExp(HIGHLIGHT_PATTERNS.map(p => p.source).join('|'), 'gi');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index} className="font-semibold text-gray-900">{match[0]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// ─── Password Change Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ backendUrl, onClose }: { backendUrl: string; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) { setError('All fields are required'); return; }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/auth/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to change password');
      }
      toast.success('Password changed successfully');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold">Change Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-red-600 text-sm">{error}</p></div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-colors font-medium text-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Product Modal ───────────────────────────────────────────────────────
function EditProductModal({
  item, categories, backendUrl, cloudName, uploadPreset, onClose, onSaved, onCategoryCreated,
}: {
  item: ImageItem;
  categories: Category[];
  backendUrl: string;
  cloudName: string;
  uploadPreset: string;
  onClose: () => void;
  onSaved: (updated: ImageItem) => void;
  onCategoryCreated: (category: Category) => void;
}) {
  const [title, setTitle] = useState(item.title || '');
  const [description, setDescription] = useState(item.description || '');
  const [price, setPrice] = useState(String(item.price || ''));
  const [originalPrice, setOriginalPrice] = useState(String(item.original_price || ''));
  const [dimensions, setDimensions] = useState(item.dimensions || '');
  const [materials, setMaterials] = useState(item.materials || '');
  const [categoryId, setCategoryId] = useState<number | null>(item.category_id ?? categories[0]?.id ?? null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [dateAdded, setDateAdded] = useState(item.created_at ? item.created_at.slice(0, 10) : todayISODate());
  const [existingImages, setExistingImages] = useState<string[]>(item.images && item.images.length ? item.images : (item.secure_url ? [item.secure_url] : []));
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const discountPercent = price && originalPrice ? calculateDiscount(parseFloat(price), parseFloat(originalPrice)) : 0;
  const discountAmount = price && originalPrice ? parseFloat(originalPrice) - parseFloat(price) : 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImageFiles(files);
    setNewImagePreviews(files.map(f => URL.createObjectURL(f)));
  }

  function removeExistingImage(url: string) {
    setExistingImages(prev => prev.filter(u => u !== url));
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (categoryId === null && !newCategoryName.trim()) { toast.error('Enter a category name'); return; }
    if (!dateAdded) { toast.error('Date is required'); return; }
    if (existingImages.length === 0 && newImageFiles.length === 0) { toast.error('At least one image is required'); return; }
    setSaving(true);
    try {
      let uploadedUrls: string[] = [];
      if (newImageFiles.length) {
        for (const f of newImageFiles) {
          const fd = new FormData();
          fd.append('file', f);
          fd.append('upload_preset', uploadPreset);
          const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
          const cloudData = await cloudRes.json();
          if (cloudData.error) throw new Error(cloudData.error.message);
          uploadedUrls.push(cloudData.secure_url);
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      let resolvedCategoryId = categoryId;
      if (resolvedCategoryId === null) {
        const { id, category } = await resolveCategoryId(newCategoryName, categories, backendUrl);
        resolvedCategoryId = id;
        if (category) onCategoryCreated(category);
      }

      const slug = slugify(title);

      const res = await fetch(`${backendUrl}/api/v1/products/${item.id}/`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          name: title.trim(), slug,
          description: description.trim() || null,
          price: price ? parseFloat(price) : 0,
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          images: finalImages,
          dimensions: dimensions.trim() || null,
          materials: materials.trim() || null,
          category_id: resolvedCategoryId,
          created_at: new Date(dateAdded).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      const saved = await res.json();
      onSaved({
        ...item,
        secure_url: finalImages[0] || '',
        images: finalImages,
        title: saved.name,
        description: saved.description,
        price: saved.price,
        original_price: saved.original_price,
        dimensions: saved.dimensions,
        materials: saved.materials,
        category_id: saved.category_id,
        slug: saved.slug,
        created_at: saved.created_at || item.created_at,
      });
      toast.success('Product updated!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-50 to-yellow-50">
          <h3 className="font-serif text-xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">Edit Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Images</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {existingImages.map(url => (
                <div key={url} className="relative">
                  <img src={url} alt="product" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                  <button type="button" onClick={() => removeExistingImage(url)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
                    ×
                  </button>
                </div>
              ))}
              {newImagePreviews.map((url, i) => (
                <img key={i} src={url} alt="new" className="w-20 h-20 object-cover rounded-xl border border-amber-300" />
              ))}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-amber-50 transition-colors">
              Add Images
            </button>
            {newImageFiles.length > 0 && <p className="text-xs text-gray-400 mt-1">{newImageFiles.length} new file(s) selected</p>}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Category</label>
              <CategorySelect
                categories={categories}
                categoryId={categoryId}
                onCategoryIdChange={setCategoryId}
                newCategoryName={newCategoryName}
                onNewCategoryNameChange={setNewCategoryName}
              />
            </div>
          </div>

          {/* Luxury Price Section with Live Discount Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Sale Price (KES)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Original Price (KES)</label>
              <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                placeholder="Set for discount"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            {/* Live Discount Preview */}
            {discountPercent > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Discount Preview</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  -{discountPercent}%
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  Save KES {discountAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Date Added <span className="text-red-500">*</span>
            </label>
            <input type="date" required value={dateAdded} onChange={e => setDateAdded(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Dimensions</label>
              <input value={dimensions} onChange={e => setDimensions(e.target.value)}
                placeholder="e.g. 200cm x 90cm x 85cm"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Materials</label>
              <input value={materials} onChange={e => setMaterials(e.target.value)}
                placeholder="e.g. Solid mahogany, foam"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            {description && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5 mt-1 leading-relaxed">
                {highlightDescription(description)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-colors font-medium text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card for Admin ────────────────────────────────────────────────────
function ProductCard({
  item, categories, backendUrl, cloudName, uploadPreset, onDelete, onUpdated, onCategoryCreated,
}: {
  item: ImageItem;
  categories: Category[];
  backendUrl: string;
  cloudName: string;
  uploadPreset: string;
  onDelete: () => void;
  onUpdated: (updated: ImageItem) => void;
  onCategoryCreated: (category: Category) => void;
}) {
  const [editing, setEditing] = useState(false);
  const cat = categories.find(c => c.id === item.category_id);
  const imageCount = item.images?.length || (item.secure_url ? 1 : 0);
  const discount = item.original_price && item.price
    ? calculateDiscount(item.price, item.original_price)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition-shadow">
      {editing && (
        <EditProductModal
          item={item} categories={categories} backendUrl={backendUrl}
          cloudName={cloudName} uploadPreset={uploadPreset}
          onClose={() => setEditing(false)}
          onSaved={updated => { onUpdated(updated); setEditing(false); }}
          onCategoryCreated={onCategoryCreated}
        />
      )}
      <div className="relative">
        <img src={item.secure_url} alt={item.title || 'product'} className="w-full h-48 object-cover" />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {imageCount > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {imageCount} photos
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          {cat && <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">{cat.name}</p>}
          <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
        </div>
        <h3 className="font-semibold text-base leading-snug mb-1">{item.title || 'Untitled'}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mb-1 leading-relaxed line-clamp-2">{highlightDescription(item.description)}</p>
        )}
        {item.dimensions && <p className="text-xs text-gray-400 mb-0.5">📐 {item.dimensions}</p>}
        {item.materials && <p className="text-xs text-gray-400 mb-1">🪵 {item.materials}</p>}
        <div className="flex items-center gap-2 mb-3">
          {item.price !== undefined && (
            <p className="text-base font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              KES {item.price.toLocaleString()}
            </p>
          )}
          {item.original_price && (
            <p className="text-sm text-gray-400 line-through">KES {item.original_price.toLocaleString()}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)}
            className="flex-1 px-3 py-2 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium text-amber-700">
            Edit
          </button>
          <button onClick={onDelete}
            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard({ admin }: { admin: string }) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dateAdded, setDateAdded] = useState(todayISODate());
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://new-face-backend-ba3q.onrender.com';
  const setupMissing = !cloudName || !uploadPreset;

  const defaultCategories: Category[] = [
    { id: 1, name: 'Sofas & Seating', slug: 'sofas-seating' },
    { id: 2, name: 'Beds & Bedroom', slug: 'beds-bedroom' },
    { id: 3, name: 'Dining Sets', slug: 'dining-sets' },
    { id: 4, name: 'Coffee Tables', slug: 'coffee-tables' },
    { id: 5, name: 'TV Stands', slug: 'tv-stands' },
    { id: 6, name: 'Wardrobes', slug: 'wardrobes' },
    { id: 7, name: 'Office Furniture', slug: 'office-furniture' },
    { id: 8, name: 'Accent Chairs', slug: 'accent-chairs' },
    { id: 9, name: 'Outdoor Furniture', slug: 'outdoor-furniture' },
    { id: 10, name: 'Storage Solutions', slug: 'storage-solutions' },
    { id: 11, name: 'Hotel & Restaurant', slug: 'hotel-restaurant' },
    { id: 12, name: 'Airbnb Furnishing', slug: 'airbnb-furnishing' },
    { id: 13, name: 'Lounges', slug: 'lounges' },
    { id: 14, name: 'Bar Stools', slug: 'bar-stools' },
    { id: 15, name: 'Custom', slug: 'custom' },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/categories/`);
        const cats: Category[] = await res.json();
        if (cats && cats.length) { setCategories(cats); setCategoryId(cats[0].id); }
        else { setCategories(defaultCategories); setCategoryId(defaultCategories[0].id); }
      } catch {
        setCategories(defaultCategories); setCategoryId(defaultCategories[0].id);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/products/?limit=100`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setImages(data.map((p: any) => ({
            id: p.id,
            public_id: p.images?.[0] || String(p.id),
            secure_url: p.images?.[0] || '',
            images: p.images || [],
            title: p.name,
            description: p.description,
            price: p.price,
            original_price: p.original_price,
            dimensions: p.dimensions,
            materials: p.materials,
            category_id: p.category_id,
            slug: p.slug,
            created_at: p.created_at,
          })));
        }
      } catch { }
    };
    loadProducts();
  }, []);

  function handleCategoryCreated(category: Category) {
    setCategories(prev => (prev.some(c => c.id === category.id) ? prev : [...prev, category]));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles(prev => [...prev, ...files]);
    setSelectedPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeSelectedFile(index: number) {
    URL.revokeObjectURL(selectedPreviews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setSelectedPreviews(prev => prev.filter((_, i) => i !== index));
  }

  if (setupMissing) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl">
        <h2 className="font-serif text-2xl font-bold text-red-800 mb-3">Setup Required</h2>
        <p className="text-red-700 mb-4">Add these to your <code className="bg-red-100 px-2 py-1 rounded">.env.local</code> file:</p>
        <pre className="bg-red-100 text-red-900 p-4 rounded overflow-auto text-sm mb-4">
          {`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name\nNEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset`}
        </pre>
        <p className="text-red-600 text-sm">Get these from your Cloudinary dashboard, then restart the dev server.</p>
      </div>
    );
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFiles.length) { toast.error('Select at least one image'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!dateAdded) { toast.error('Date is required'); return; }
    if (categoryId === null && !newCategoryName.trim()) { toast.error('Select or enter a category'); return; }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      let firstPublicId = '';

      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', uploadPreset);
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
        const cloudData = await cloudRes.json();
        if (cloudData.error) throw new Error(cloudData.error.message || 'Cloudinary upload failed');
        uploadedUrls.push(cloudData.secure_url);
        if (!firstPublicId) firstPublicId = cloudData.public_id;
      }

      let resolvedCategoryId = categoryId;
      if (resolvedCategoryId === null) {
        const { id, category } = await resolveCategoryId(newCategoryName, categories, backendUrl);
        resolvedCategoryId = id;
        if (category) handleCategoryCreated(category);
      }

      const slug = slugify(title);

      const backendRes = await fetch(`${backendUrl}/api/v1/products/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: title.trim(), slug,
          description: description.trim() || null,
          price: price ? parseFloat(price) : 0,
          original_price: null,
          images: uploadedUrls,
          dimensions: null, materials: null,
          category_id: resolvedCategoryId,
          created_at: new Date(dateAdded).toISOString(),
        }),
      });

      if (!backendRes.ok) {
        const errData = await backendRes.json().catch(() => ({}));
        throw new Error(errData.detail || `Backend error ${backendRes.status}`);
      }

      const saved = await backendRes.json();
      setImages(prev => [{
        id: saved.id,
        public_id: firstPublicId,
        secure_url: uploadedUrls[0] || '',
        images: uploadedUrls,
        title: saved.name,
        description: saved.description,
        price: saved.price,
        original_price: saved.original_price,
        dimensions: saved.dimensions,
        materials: saved.materials,
        category_id: saved.category_id,
        slug: saved.slug,
        created_at: saved.created_at || new Date(dateAdded).toISOString(),
      }, ...prev]);

      toast.success(`Product saved with ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''}!`);
      setTitle(''); setDescription(''); setPrice(''); setNewCategoryName('');
      setDateAdded(todayISODate());
      setSelectedFiles([]);
      setSelectedPreviews([]);
      if (fileRef.current) fileRef.current.value = '';

      const cat = categories.find(c => c.id === resolvedCategoryId);
      if (cat?.slug) router.push(`/products?category=${encodeURIComponent(cat.slug)}`);
    } catch (err: any) {
      toast.error('Error: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(public_id: string, id?: number) {
    if (!confirm('Delete this item permanently?')) return;
    try {
      const target = id ?? encodeURIComponent(public_id);
      const res = await fetch(`${backendUrl}/api/v1/products/${target}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) toast.error('Backend delete failed');
      else toast.success('Item deleted');
    } catch { toast.error('Could not reach backend'); }
    setImages(prev => prev.filter(i => i.public_id !== public_id));
  }

  return (
    <div>
      {showPasswordModal && (
        <ChangePasswordModal backendUrl={backendUrl} onClose={() => setShowPasswordModal(false)} />
      )}

      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Signed in as <strong>{admin}</strong> &bull; {images.length} item{images.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </button>
        </div>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl shadow mb-8 space-y-6">
        <h3 className="font-serif text-lg font-bold border-b-2 border-amber-200 pb-3 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Upload New Product</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Product Images <span className="text-red-500">*</span>
              <span className="ml-1 font-normal normal-case text-gray-400">(select multiple)</span>
            </label>

            {selectedPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedPreviews.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-amber-200" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <div
                className="border-2 border-dashed border-amber-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400 transition-colors min-h-[80px]"
              >
                <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-400 text-center">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected — click to add more`
                    : 'Click to choose files'}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <p className="text-xs text-amber-600 font-medium">{selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} ready to upload</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Title <span className="text-red-500">*</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 6-Seater Dining Set" required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Category</label>
            <CategorySelect
              categories={categories}
              categoryId={categoryId}
              onCategoryIdChange={setCategoryId}
              newCategoryName={newCategoryName}
              onNewCategoryNameChange={setNewCategoryName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 sm:col-span-3">
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Price (KES)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 15000"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date Added <span className="text-red-500">*</span>
              </label>
              <input type="date" required value={dateAdded} onChange={e => setDateAdded(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Description <span className="ml-2 font-normal normal-case text-gray-400 text-xs">— key terms highlighted automatically</span>
              </label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Premium solid mahogany 6-seater dining set with glossy finish"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
              {description && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 leading-relaxed">
                  {highlightDescription(description)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={uploading}
            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-colors font-medium disabled:opacity-50">
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading {selectedFiles.length > 1 ? `${selectedFiles.length} images` : 'image'}...
              </span>
            ) : 'Upload'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-serif text-lg font-bold mb-4 bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">
          Uploaded Items <span className="text-gray-400 font-sans font-normal text-base">{images.length > 0 && `(${images.length})`}</span>
        </h3>
        {images.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm">No items yet. Use the form above to add your first product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map(img => (
              <ProductCard
                key={img.public_id} item={img} categories={categories}
                backendUrl={backendUrl} cloudName={cloudName} uploadPreset={uploadPreset}
                onDelete={() => handleDelete(img.public_id, img.id)}
                onUpdated={updated => setImages(prev => prev.map(i => i.id === updated.id ? updated : i))}
                onCategoryCreated={handleCategoryCreated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}