'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MapPin, Phone, Instagram, Clock, Send, CheckCircle } from 'lucide-react';
import { contactApi } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(10, 'Write at least 10 characters'),
});
type FormData = z.infer<typeof schema>;

const BUSINESS_EMAIL = 'infonewfacefurniture@gmail.com';
const WHATSAPP_NUMBER = '254115990547';

// 'form' → fill in details
// 'choose' → pick WA or Email (message NOT yet sent)
// 'sent' → they clicked WA or Email (message actually sent)
type Step = 'form' | 'choose' | 'sent';

export default function ContactPage() {
  const [step, setStep] = useState<Step>('form');
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  function buildWaMessage(data: FormData) {
    const lines = [
      `👋 *New Message from Website*`,
      ``,
      `👤 *Name:* ${data.name}`,
      `📞 *Phone:* ${data.phone}`,
      data.email ? `📧 *Email:* ${data.email}` : '',
      ``,
      `💬 *Message:*`,
      data.message,
    ].filter(Boolean).join('\n');
    return encodeURIComponent(lines);
  }

  function buildEmail(data: FormData) {
    const subject = encodeURIComponent(`Website Enquiry — ${data.name}`);
    const body = encodeURIComponent([
      `New Message from Website`,
      ``,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      data.email ? `Email: ${data.email}` : '',
      ``,
      `Message:`,
      data.message,
    ].filter(Boolean).join('\n'));
    return `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  }

  const onSubmit = async (data: FormData) => {
    try {
      await contactApi.send(data);
    } catch {
      // non-blocking — still show send options
    }
    setSubmittedData(data);
    setStep('choose');
    reset();
  };

  function handleReset() {
    setStep('form');
    setSubmittedData(null);
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-secondary-400 text-sm uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-400">We'd love to hear from you. Reach out and we'll respond within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-dark mb-8">Find Us</h2>
            <div className="space-y-6 mb-10">
              {[
                { icon: MapPin, title: 'Location', content: 'Desai Road, Ngara, Nairobi, Kenya', link: null },
                { icon: Phone, title: 'Phone', content: '+254 115 990 547', link: 'tel:+254115990547' },
                { icon: Instagram, title: 'Instagram', content: '@new_face_furniture', link: 'https://instagram.com/new_face_furniture' },
                { icon: Clock, title: 'Business Hours', content: 'Mon–Sat: 8AM–7PM', link: null },
              ].map(({ icon: Icon, title, content, link }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{title}</p>
                    {link ? (
                      <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                        className="text-dark hover:text-primary-500 transition-colors font-medium">{content}</a>
                    ) : (
                      <p className="text-dark font-medium">{content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/254115990547" target="_blank" rel="noreferrer"
              className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-5 hover:bg-green-100 transition-colors group">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.545 5.876L.057 23.272a.75.75 0 00.92.92l5.396-1.488A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.5-5.207-1.377l-.374-.217-3.876 1.069 1.069-3.876-.217-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-dark group-hover:text-green-700">Chat on WhatsApp</p>
                <p className="text-sm text-gray-500">Fastest way to reach us</p>
              </div>
            </a>

            {/* Map */}
            <div className="mt-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.818!2d36.826!3d-1.279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d0ee1b6b0b%3A0x0!2sDesai%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1620000000000"
                width="100%" height="260" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="New Face Furniture Map"
              />
            </div>
          </div>

          {/* Right panel */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-dark mb-6">Send Us a Message</h2>

            {/* STEP: form */}
            {step === 'form' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Your Name *</label>
                  <input {...register('name')} className="input" placeholder="John Kamau" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input {...register('phone')} className="input" placeholder="+254 712 345 678" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="label">Email (optional)</label>
                  <input {...register('email')} type="email" className="input" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea {...register('message')} className="input resize-none" rows={5} placeholder="How can we help you?" />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <motion.button type="submit" whileTap={{ scale: 0.98 }} disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-4 disabled:opacity-60">
                  <Send size={18} /> {isSubmitting ? 'Preparing...' : 'Continue to Send'}
                </motion.button>
              </form>
            )}

            {/* STEP: choose channel — message NOT yet sent */}
            {step === 'choose' && submittedData && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="py-4">
                <p className="text-gray-700 font-semibold text-lg mb-1">Almost there!</p>
                <p className="text-gray-500 text-sm mb-6">
                  Choose how to send your message — your details will be pre-filled.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWaMessage(submittedData)}`}
                    target="_blank" rel="noreferrer"
                    onClick={() => setStep('sent')}
                    className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3.5 rounded-xl font-medium transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.545 5.876L.057 23.272a.75.75 0 00.92.92l5.396-1.488A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.5-5.207-1.377l-.374-.217-3.876 1.069 1.069-3.876-.217-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Send via WhatsApp
                  </a>
                  <a
                    href={buildEmail(submittedData)}
                    onClick={() => setStep('sent')}
                    className="flex items-center justify-center gap-3 bg-[#8B5E3C] hover:bg-[#734E31] text-white px-6 py-3.5 rounded-xl font-medium transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send via Email
                  </a>
                  <button onClick={handleReset}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1">
                    ← Go back and edit
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: sent — only shown after they clicked WA or Email */}
            {step === 'sent' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <p className="font-serif font-bold text-dark text-2xl mb-2">Message Sent!</p>
                <p className="text-gray-500 text-sm mb-8">We'll get back to you within 24 hours.</p>
                <button onClick={handleReset}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  ← Send another message
                </button>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}