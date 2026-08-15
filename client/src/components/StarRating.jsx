import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onRate = null, readOnly = false, size = 18 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.floor(displayRating);
        const isHalf = !isFilled && star === Math.ceil(displayRating) && displayRating % 1 !== 0;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onRate && onRate(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: readOnly ? 'default' : 'pointer',
              color: isFilled || isHalf ? '#0284c7' : '#cbd5e1',
              transition: 'transform 0.15s ease, color 0.15s ease'
            }}
            title={readOnly ? `${rating} stars` : `Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              fill={isFilled ? '#0284c7' : isHalf ? 'url(#halfStarGradLightBlue)' : 'transparent'}
            />
          </button>
        );
      })}
      
      {readOnly && (
        <span style={{ fontSize: '0.85rem', fontWeight: '600', marginLeft: '4px', color: '#0f172a' }}>
          {rating ? rating.toFixed(1) : 'No ratings'}
        </span>
      )}

      {/* SVG definition for half star gradient */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="halfStarGradLightBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
