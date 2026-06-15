'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ImageItem {
  id?: number;
  public_id: string;
  secure_url: string;
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  dimensions?: string;
  materials?: string;
  is_featured?: boolean;
  in_stock?: boolean;
  category_id?: number;
  slug?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-red-600 text-sm">{error}</p></div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50">
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
  item, categories, backendUrl, cloudName, uploadPreset, onClose, onSaved,
}: {
  item: ImageItem;
  categories: Category[];
  backendUrl: string;
  cloudName: string;
  uploadPreset: string;
  onClose: () => void;
  onSaved: (updated: ImageItem) => void;
}) {
  const [title, setTitle] = useState(item.title || '');
  const [description, setDescription] = useState(item.description || '');
  const [price, setPrice] = useState(String(item.price || ''));
  const [originalPrice, setOriginalPrice] = useState(String(item.original_price || ''));
  const [dimensions, setDimensions] = useState(item.dimensions || '');
  const [materials, setMaterials] = useState(item.materials || '');
  const [isFeatured, setIsFeatured] = useState(item.is_featured || false);
  const [inStock, setInStock] = useState(item.in_stock !== false);
  const [categoryId, setCategoryId] = useState(item.category_id || categories[0]?.id);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setNewImageFile(f);
    setNewImagePreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      let imageUrl = item.secure_url;

      // Upload new image if selected
      if (newImageFile) {
        const fd = new FormData();
        fd.append('file', newImageFile);
        fd.append('upload_preset', uploadPreset);
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
        const cloudData = await cloudRes.json();
        if (cloudData.error) throw new Error(cloudData.error.message);
        imageUrl = cloudData.secure_url;
      }

      const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const res = await fetch(`${backendUrl}/api/v1/products/${item.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: title.trim(),
          slug,
          description: description.trim() || null,
          price: price ? parseFloat(price) : 0,
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          images: [imageUrl],
          dimensions: dimensions.trim() || null,
          materials: materials.trim() || null,
          is_featured: isFeatured,
          in_stock: inStock,
          category_id: categoryId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      const saved = await res.json();
      onSaved({
        ...item,
        secure_url: imageUrl,
        title: saved.name,
        description: saved.description,
        price: saved.price,
        original_price: saved.original_price,
        dimensions: saved.dimensions,
        materials: saved.materials,
        is_featured: saved.is_featured,
        in_stock: saved.in_stock,
        category_id: saved.category_id,
        slug: saved.slug,
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
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-serif text-xl font-bold">Edit Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Image</label>
            <div className="flex gap-4 items-start">
              <img
                src={newImagePreview || item.secure_url}
                alt="product"
                className="w-24 h-24 object-cover rounded-xl border border-gray-200"
              />
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Change Image
                </button>
                {newImageFile && <p className="text-xs text-gray-400 mt-1">{newImageFile.name}</p>}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
          </div>

          {/* Title + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Original Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Price (KES)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Original Price (KES)</label>
              <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                placeholder="Optional — shows discount"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          {/* Dimensions + Materials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Dimensions</label>
              <input value={dimensions} onChange={e => setDimensions(e.target.value)}
                placeholder="e.g. 200cm x 90cm x 85cm"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Materials</label>
              <input value={materials} onChange={e => setMaterials(e.target.value)}
                placeholder="e.g. Solid mahogany, foam"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            {description && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5 mt-1 leading-relaxed">
                {highlightDescription(description)}
              </p>
            )}
          </div>

          {/* Featured + In Stock */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-gray-600">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-gray-600">In Stock</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  item, categories, backendUrl, cloudName, uploadPreset, onDelete, onUpdated,
}: {
  item: ImageItem;
  categories: Category[];
  backendUrl: string;
  cloudName: string;
  uploadPreset: string;
  onDelete: () => void;
  onUpdated: (updated: ImageItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const cat = categories.find(c => c.id === item.category_id);

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      {editing && (
        <EditProductModal
          item={item}
          categories={categories}
          backendUrl={backendUrl}
          cloudName={cloudName}
          uploadPreset={uploadPreset}
          onClose={() => setEditing(false)}
          onSaved={updated => { onUpdated(updated); setEditing(false); }}
        />
      )}
      <img src={item.secure_url} alt={item.title || 'product'} className="w-full h-48 object-cover" />
      <div className="p-4">
        {cat && <p className="text-xs text-primary-500 font-medium uppercase tracking-wide mb-1">{cat.name}</p>}
        <h3 className="font-semibold text-base leading-snug mb-1">{item.title || 'Untitled'}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mb-1 leading-relaxed line-clamp-2">{highlightDescription(item.description)}</p>
        )}
        {item.dimensions && <p className="text-xs text-gray-400 mb-0.5">📐 {item.dimensions}</p>}
        {item.materials && <p className="text-xs text-gray-400 mb-1">🪵 {item.materials}</p>}
        <div className="flex items-center gap-2 mb-3">
          {item.price !== undefined && (
            <p className="text-base font-bold text-primary-600">KES {item.price.toLocaleString()}</p>
          )}
          {item.original_price && (
            <p className="text-sm text-gray-400 line-through">KES {item.original_price.toLocaleString()}</p>
          )}
        </div>
        <div className="flex gap-1 mb-3">
          {item.is_featured && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Featured</span>}
          {item.in_stock === false && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Out of Stock</span>}
          {item.in_stock !== false && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">In Stock</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Edit</button>
          <button onClick={onDelete} className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">Delete</button>
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
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const router = useRouter();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const setupMissing = !cloudName || !uploadPreset;

  const defaultCategories: Category[] = [
    { id: 1, name: 'Sofas', slug: 'sofas' },
    { id: 2, name: 'Beds', slug: 'beds' },
    { id: 3, name: 'Dining Sets', slug: 'dining-sets' },
    { id: 4, name: 'Coffee Tables', slug: 'coffee-tables' },
    { id: 5, name: 'TV Stands', slug: 'tv-stands' },
    { id: 6, name: 'Wardrobes', slug: 'wardrobes' },
    { id: 7, name: 'Office', slug: 'office' },
    { id: 8, name: 'Custom', slug: 'custom' },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/categories/`, { credentials: 'include' });
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
        const res = await fetch(`${backendUrl}/api/v1/products/?limit=100`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setImages(data.map((p: any) => ({
            id: p.id,
            public_id: p.images?.[0] || String(p.id),
            secure_url: p.images?.[0] || '',
            title: p.name,
            description: p.description,
            price: p.price,
            original_price: p.original_price,
            dimensions: p.dimensions,
            materials: p.materials,
            is_featured: p.is_featured,
            in_stock: p.in_stock,
            category_id: p.category_id,
            slug: p.slug,
          })));
        }
      } catch { }
    };
    loadProducts();
  }, []);

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
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error('Select an image first'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!categoryId) { toast.error('Select a category'); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);

    try {
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const cloudData = await cloudRes.json();
      if (cloudData.error) throw new Error(cloudData.error.message || 'Cloudinary upload failed');

      const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const backendRes = await fetch(`${backendUrl}/api/v1/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: title.trim(), slug,
          description: description.trim() || null,
          price: price ? parseFloat(price) : 0,
          original_price: null,
          images: [cloudData.secure_url],
          dimensions: null, materials: null,
          is_featured: false, in_stock: true,
          category_id: categoryId,
        }),
      });

      if (!backendRes.ok) {
        const errData = await backendRes.json().catch(() => ({}));
        throw new Error(errData.detail || `Backend error ${backendRes.status}`);
      }

      const saved = await backendRes.json();
      setImages(prev => [{
        id: saved.id,
        public_id: cloudData.public_id,
        secure_url: cloudData.secure_url,
        title: saved.name,
        description: saved.description,
        price: saved.price,
        original_price: saved.original_price,
        dimensions: saved.dimensions,
        materials: saved.materials,
        is_featured: saved.is_featured,
        in_stock: saved.in_stock,
        category_id: saved.category_id,
        slug: saved.slug,
      }, ...prev]);

      toast.success('Product saved!');
      setTitle(''); setDescription(''); setPrice(''); setFileName('');
      if (fileRef.current) fileRef.current.value = '';

      const cat = categories.find(c => c.id === categoryId);
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
      const res = await fetch(`${backendUrl}/api/v1/products/${target}`, { method: 'DELETE', credentials: 'include' });
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

      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Signed in as <strong>{admin}</strong> &bull; {images.length} item{images.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </button>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl shadow mb-8 space-y-6">
        <h3 className="font-serif text-lg font-bold border-b pb-3">Upload New Product</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Product Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors min-h-[100px]"
              onClick={() => fileRef.current?.click()}>
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400 text-center break-all">{fileName || 'Click to choose file'}</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" required className="hidden"
              onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Title <span className="text-red-500">*</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 6-Seater Dining Set" required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Category</label>
            <select value={categoryId ?? ''} onChange={e => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              {categories.length === 0 && <option value="">No categories</option>}
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Price (KES)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 15000"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="sm:col-span-3 flex flex-col gap-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description <span className="ml-2 font-normal normal-case text-gray-400 text-xs">— key terms highlighted automatically</span>
            </label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Premium solid mahogany 6-seater dining set with glossy finish"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 leading-relaxed">
                {highlightDescription(description)}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <button type="submit" disabled={uploading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading...
              </span>
            ) : 'Upload'}
          </button>
        </div>
      </form>

      {/* Products Grid */}
      <div>
        <h3 className="font-serif text-lg font-bold mb-4">
          Uploaded Items <span className="text-gray-400 font-sans font-normal text-base">({images.length})</span>
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
                key={img.public_id}
                item={img}
                categories={categories}
                backendUrl={backendUrl}
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                onDelete={() => handleDelete(img.public_id, img.id)}
                onUpdated={updated => setImages(prev => prev.map(i => i.id === updated.id ? updated : i))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}