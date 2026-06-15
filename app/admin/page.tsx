'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// Auth is handled entirely by AdminLayout. This page must NOT do its own auth
// check or render a LoginScreen — that caused a race condition bypass.
// Layout guards the route; this page just renders the add-product form.
// ─────────────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Sofas', slug: 'sofas' },
  { id: 2, name: 'Beds', slug: 'beds' },
  { id: 3, name: 'Dining Sets', slug: 'dining-sets' },
  { id: 4, name: 'Coffee Tables', slug: 'coffee-tables' },
  { id: 5, name: 'TV Stands', slug: 'tv-stands' },
  { id: 6, name: 'Wardrobes', slug: 'wardrobes' },
  { id: 7, name: 'Office', slug: 'office' },
  { id: 8, name: 'Custom', slug: 'custom' },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

// ─── Add Product Form ─────────────────────────────────────────────────────────
function AddProductForm() {
  const router = useRouter();

  const [categories, setCategoryList] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [categoryId, setCategoryId] = useState<number>(DEFAULT_CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [materials, setMaterials] = useState('');
  const [featured, setFeatured] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [admin, setAdmin] = useState('Admin');

  // Fetch username for display
  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.username) setAdmin(d.username); })
      .catch(() => { });
  }, []);

  // Load categories from backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/categories/`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((cats: Category[] | null) => {
        if (cats && cats.length > 0) {
          setCategoryList(cats);
          setCategoryId(cats[0].id);
        }
      })
      .catch(() => { });
  }, []);

  // Generate previews when files change
  useEffect(() => {
    if (!files || files.length === 0) { setPreviews([]); return; }
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [files]);

  function resetForm() {
    setTitle(''); setDescription(''); setPrice(''); setOriginalPrice('');
    setDimensions(''); setMaterials('');
    setFeatured(false); setInStock(true); setFiles(null); setPreviews([]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) { toast.error('Please select at least one image'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!categoryId) { toast.error('Please select a category'); return; }
    if (!CLOUD_NAME || !UPLOAD_PRESET) { toast.error('Cloudinary not configured — check env vars'); return; }

    setSaving(true);
    try {
      // 1. Upload all images to Cloudinary
      const images: Array<{ public_id: string; secure_url: string }> = [];
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('file', files[i]);
        fd.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: fd },
        );
        if (!res.ok) throw new Error(`Image upload failed (${res.status})`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || 'Cloudinary error');
        images.push({ public_id: data.public_id, secure_url: data.secure_url });
      }

      // 2. Derive slug from title
      const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // 3. Save to backend
      const res = await fetch(`${BACKEND_URL}/api/v1/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: title.trim(),
          slug,
          description: description.trim() || null,
          price: price ? parseFloat(price) : 0,
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          images,
          dimensions: dimensions.trim() || null,
          materials: materials.trim() || null,
          is_featured: featured,
          in_stock: inStock,
          category_id: categoryId,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(
          errBody?.detail
            ? Array.isArray(errBody.detail)
              ? errBody.detail.map((d: any) => d.msg).join(', ')
              : errBody.detail
            : `Backend error ${res.status}`,
        );
      }

      toast.success('Product saved successfully!');
      resetForm();
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-dark">Add New Product</h2>
          <p className="text-sm text-gray-400 mt-1">Fill in the details and upload images for the product.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Signed in as <strong className="text-gray-600">{admin}</strong>
          </span>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow p-6 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="e.g. L-Shaped Sofa Set"
            className="input w-full"
          />
        </div>

        {/* Category + Price + Original Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(Number(e.target.value))}
              required
              className="input w-full"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Price (KES)
            </label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 45000"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Original Price (KES)
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={e => setOriginalPrice(e.target.value)}
              placeholder="Optional — shows discount"
              className="input w-full"
            />
          </div>
        </div>

        {/* Dimensions + Materials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Dimensions
            </label>
            <input
              value={dimensions}
              onChange={e => setDimensions(e.target.value)}
              placeholder="e.g. 200cm x 90cm x 85cm"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Materials
            </label>
            <input
              value={materials}
              onChange={e => setMaterials(e.target.value)}
              placeholder="e.g. Solid mahogany, foam cushions"
              className="input w-full"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the product — material, finish, use case..."
            rows={4}
            className="input w-full resize-none"
          />
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Product Images <span className="text-red-500">*</span>
          </label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
            onClick={() => document.getElementById('product-images')?.click()}
          >
            {previews.length > 0 ? (
              <div>
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`preview-${i}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">{files!.length} file(s) selected — click to change</p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">Click to upload images</p>
                <p className="text-xs text-gray-300 mt-1">You can select multiple images</p>
              </>
            )}
          </div>
          <input
            id="product-images"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => setFiles(e.target.files)}
          />
        </div>

        {/* Featured + In Stock */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-primary-500"
            />
            <span className="text-sm text-gray-600">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStock}
              onChange={e => setInStock(e.target.checked)}
              className="w-4 h-4 accent-primary-500"
            />
            <span className="text-sm text-gray-600">In Stock</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-2.5 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </>
            ) : 'Save Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="btn-outline px-6 py-2.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  return <AddProductForm />;
}