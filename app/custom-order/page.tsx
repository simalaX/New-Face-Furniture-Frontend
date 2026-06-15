'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { customOrdersApi } from '@/lib/api';

const schema = z.object({
  customer_name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  furniture_type: z.string().min(2, 'Specify furniture type'),
  dimensions: z.string().optional(),
  description: z.string().min(10, 'Please describe your requirements in detail'),
  budget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const materialOptions = ['Mahogany', 'Oak', 'Pine', 'MDF', 'Plywood', 'Metal', 'Glass', 'Leather', 'Fabric', 'Rattan', 'Other'];
const furnitureTypes = ['Sofa / Couch', 'Bed / Headboard', 'Dining Table', 'Coffee Table', 'Wardrobe', 'TV Stand', 'Office Desk', 'Bookshelf', 'Kitchen Cabinet', 'Other'];

const BUSINESS_EMAIL = 'newfacefurniture@gmail.com';
const WHATSAPP_NUMBER = '254115990547';

// 'form' → fill in details
// 'choose' → pick WA or Email (request NOT yet sent)
// 'sent' → they clicked WA or Email (request actually sent)
type Step = 'form' | 'choose' | 'sent';

export default function CustomOrderPage() {
  const [step, setStep] = useState<Step>('form');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [otherMaterial, setOtherMaterial] = useState('');
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [furnitureType, setFurnitureType] = useState('');
  const [otherFurniture, setOtherFurniture] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const toggleMaterial = (m: string) =>
    setSelectedMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  function handleFurnitureChange(val: string) {
    setFurnitureType(val);
    if (val !== 'Other') {
      setValue('furniture_type', val, { shouldValidate: true });
    } else {
      setValue('furniture_type', '', { shouldValidate: false });
    }
  }

  function handleOtherType(val: string) {
    setOtherFurniture(val);
    setValue('furniture_type', val, { shouldValidate: true });
  }

  function getMaterials() {
    return selectedMaterials
      .map(m => (m === 'Other' && otherMaterial ? otherMaterial : m))
      .join(', ');
  }

  function buildWaMessage(data: FormData) {
    const lines = [
      `🛋️ *Custom Furniture Request*`,
      ``,
      `👤 *Name:* ${data.customer_name}`,
      `📞 *Phone:* ${data.phone}`,
      data.email ? `📧 *Email:* ${data.email}` : '',
      ``,
      `🪑 *Furniture Type:* ${data.furniture_type}`,
      data.dimensions ? `📐 *Dimensions:* ${data.dimensions}` : '',
      selectedMaterials.length ? `🪵 *Materials:* ${getMaterials()}` : '',
      data.budget ? `💰 *Budget:* ${data.budget}` : '',
      ``,
      `📝 *Description:*`,
      data.description,
      ``,
      `_(Reference images attached separately)_`,
    ].filter(Boolean).join('\n');
    return encodeURIComponent(lines);
  }

  function buildEmail(data: FormData) {
    const subject = encodeURIComponent(`Custom Furniture Request — ${data.furniture_type}`);
    const body = encodeURIComponent([
      `Custom Furniture Request`,
      ``,
      `Name: ${data.customer_name}`,
      `Phone: ${data.phone}`,
      data.email ? `Email: ${data.email}` : '',
      ``,
      `Furniture Type: ${data.furniture_type}`,
      data.dimensions ? `Dimensions: ${data.dimensions}` : '',
      selectedMaterials.length ? `Materials: ${getMaterials()}` : '',
      data.budget ? `Budget: ${data.budget}` : '',
      ``,
      `Description:`,
      data.description,
      ``,
      `(Please attach reference images to this email)`,
    ].filter(Boolean).join('\n'));
    return `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  }

  const onSubmit = async (data: FormData) => {
    await customOrdersApi.create({
      ...data,
      reference_images: [],
      materials: getMaterials(),
    }).catch(() => { });
    setSubmittedData(data);
    setStep('choose');
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-secondary-400 text-sm uppercase tracking-widest mb-2">Bespoke Furniture</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold">Custom Order</h1>
          <p className="text-gray-400 mt-3">Tell us what you need and we'll craft it just for you.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-500 text-sm mb-8 hover:text-primary-600 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* STEP: form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-dark mb-5">Your Contact Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input {...register('customer_name')} className="input" placeholder="Jane Wanjiru" />
                  {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input {...register('phone')} className="input" placeholder="+254 712 345 678" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Email (optional)</label>
                  <input {...register('email')} className="input" type="email" placeholder="jane@example.com" />
                </div>
              </div>
            </div>

            {/* Furniture Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-dark mb-5">Furniture Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">

                <div>
                  <label className="label">Furniture Type *</label>
                  <select
                    value={furnitureType}
                    onChange={e => handleFurnitureChange(e.target.value)}
                    className="input"
                  >
                    <option value="">Select type</option>
                    {furnitureTypes.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {furnitureType === 'Other' && (
                    <input
                      value={otherFurniture}
                      onChange={e => handleOtherType(e.target.value)}
                      className="input mt-2"
                      placeholder="Describe the furniture type..."
                      autoFocus
                    />
                  )}
                  {errors.furniture_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.furniture_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Budget Range (optional)</label>
                  <select {...register('budget')} className="input">
                    <option value="">Select budget</option>
                    <option>Under KES 20,000</option>
                    <option>KES 20,000 – 50,000</option>
                    <option>KES 50,000 – 100,000</option>
                    <option>KES 100,000 – 200,000</option>
                    <option>Above KES 200,000</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Dimensions (optional)</label>
                  <input {...register('dimensions')} className="input" placeholder="e.g. L: 200cm × W: 90cm × H: 75cm" />
                </div>
              </div>

              {/* Materials */}
              <div className="mb-4">
                <label className="label">Preferred Materials (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {materialOptions.map(m => (
                    <button key={m} type="button" onClick={() => toggleMaterial(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedMaterials.includes(m)
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}>
                      {m}
                    </button>
                  ))}
                </div>
                {selectedMaterials.includes('Other') && (
                  <input
                    value={otherMaterial}
                    onChange={e => setOtherMaterial(e.target.value)}
                    className="input mt-3"
                    placeholder="Describe the other material..."
                    autoFocus
                  />
                )}
              </div>

              <div>
                <label className="label">Describe Your Requirements *</label>
                <textarea {...register('description')} className="input resize-none" rows={5}
                  placeholder="Describe the furniture you want — design style, color, purpose, quantity, any special features..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Images tip */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3 items-start">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Reference Images</p>
                <p className="text-sm text-blue-600">
                  After submitting, you'll send via WhatsApp or Email — attach your reference images there directly.
                </p>
              </div>
            </div>

            <motion.button type="submit" whileTap={{ scale: 0.98 }} disabled={isSubmitting}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
              {isSubmitting ? 'Preparing...' : 'Continue to Send'}
            </motion.button>
          </form>
        )}

        {/* STEP: choose channel — request NOT yet sent */}
        {step === 'choose' && submittedData && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-lg text-center">
            <p className="font-serif font-bold text-dark text-2xl mb-2">Almost there!</p>
            <p className="text-gray-500 text-sm mb-1">
              Choose how to send your request — your details will be pre-filled.
            </p>
            <p className="text-gray-400 text-xs mb-8">Attach reference images in WhatsApp or Email.</p>
            <div className="flex flex-col gap-3">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWaMessage(submittedData)}`}
                target="_blank" rel="noreferrer"
                onClick={() => setStep('sent')}
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3.5 rounded-xl font-medium transition-colors">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.545 5.876L.057 23.272a.75.75 0 00.92.92l5.396-1.488A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.5-5.207-1.377l-.374-.217-3.876 1.069 1.069-3.876-.217-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Send via WhatsApp
              </a>
              <a href={buildEmail(submittedData)}
                onClick={() => setStep('sent')}
                className="flex items-center justify-center gap-3 bg-[#8B5E3C] hover:bg-[#734E31] text-white px-6 py-3.5 rounded-xl font-medium transition-colors">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send via Email
              </a>
              <p className="text-xs text-gray-400 mt-1">💡 Attach reference images in WhatsApp or Email</p>
              <button
                onClick={() => setStep('form')}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1">
                ← Go back and edit
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP: sent — only shown after they clicked WA or Email */}
        {step === 'sent' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center bg-white rounded-3xl p-10 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-dark mb-3">Request Sent!</h2>
            <p className="text-gray-500 text-sm mb-2">We'll reply within 24 hours with a quote.</p>
            <p className="text-gray-400 text-xs mb-8">Don't forget to attach your reference images if you haven't already.</p>
            <Link href="/" className="btn-outline justify-center">Back to Home</Link>
          </motion.div>
        )}

      </div>
    </div>
  );
}