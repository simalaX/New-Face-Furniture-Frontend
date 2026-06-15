'use client';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { testimonialsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TestimonialsPage() {
  const [ratings, setRatings] = useState<number[]>([]);
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testimonialsApi.getAll()
      .then((d: any[]) => {
        if (d?.length) setRatings(d.map((r: any) => r.rating));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const total = ratings.length;
  const avg = total ? ratings.reduce((a, b) => a + b, 0) / total : 0;

  // Count how many gave each star
  const countFor = (star: number) => ratings.filter(r => r === star).length;
  const pct = (star: number) => total ? Math.round((countFor(star) / total) * 100) : 0;

  async function submitRating(star: number) {
    if (submitted) return;
    setSelected(star);
    try {
      await testimonialsApi.create({
        customer_name: 'Anonymous',
        rating: star,
        review: '⭐',
      });
      setRatings(prev => [...prev, star]);
      setSubmitted(true);
      toast.success('Thanks for your rating!');
    } catch {
      toast.error('Could not submit. Try again.');
      setSelected(0);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl shadow-md p-8 sm:p-12 max-w-lg w-full">

        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-secondary-400 text-xs uppercase tracking-widest mb-2">Customer Love</p>
          <h1 className="font-serif text-3xl font-bold text-dark">Rate Us</h1>
        </div>

        {/* ── Big average + breakdown ─────────────────────────────────── */}
        {!loading && total > 0 && (
          <div className="flex gap-8 items-center mb-10 p-6 bg-cream rounded-2xl">

            {/* Left — big number */}
            <div className="text-center flex-shrink-0">
              <p className="text-6xl font-bold text-dark leading-none">{avg.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={16}
                    fill={n <= Math.round(avg) ? '#D9B382' : 'none'}
                    className={n <= Math.round(avg) ? 'text-secondary-400' : 'text-gray-200'} />
                ))}
              </div>
              <p className="text-gray-400 text-xs">{total} {total === 1 ? 'rating' : 'ratings'}</p>
            </div>

            {/* Right — bar breakdown */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <Star size={11} fill="#D9B382" className="text-secondary-400 flex-shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 bg-secondary-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct(star)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{pct(star)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Star tap widget ─────────────────────────────────────────── */}
        <div className="text-center">
          {submitted ? (
            <>
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={38}
                    fill={n <= selected ? '#D9B382' : 'none'}
                    className={n <= selected ? 'text-secondary-400' : 'text-gray-200'} />
                ))}
              </div>
              <p className="text-gray-500 text-sm">
                You rated us <strong>{selected} star{selected !== 1 ? 's' : ''}</strong>. Thank you!
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-4">Tap a star to rate your experience</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => submitRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-125 active:scale-110"
                  >
                    <Star
                      size={44}
                      fill={(hover || selected) >= n ? '#D9B382' : 'none'}
                      className={(hover || selected) >= n ? 'text-secondary-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}