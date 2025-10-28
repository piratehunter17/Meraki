// /app/components/ReviewSection.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Mock Review Data ---
const generateMockReviews = (count = 10) => {
    const names = ["Alex R.", "Sam K.", "Jordan P.", "Taylor M.", "Chris D.", "Morgan L.", "Jamie S.", "Riley B.", "Casey J.", "Devon T."];
    const comments = [
        "Absolutely love the quality and fit!",
        "Great design, very comfortable material.",
        "Fast shipping and excellent customer service.",
        "Exactly as described, exceeded expectations.",
        "Will definitely buy again from this store.",
        "Good value for the price. Happy with my purchase.",
        "Unique style, stands out from the crowd.",
        "Perfect fit, true to size.",
        "Material feels premium. Highly recommend.",
        "Fantastic product and smooth transaction."
    ];
    const ratings = [5, 4.5, 4, 3.5, 5, 4.5, 4, 5, 4.5, 4];
    const reviews = [];

    for (let i = 0; i < count; i++) {
        reviews.push({
            id: i + 1,
            name: names[i % names.length],
            stars: ratings[i % ratings.length],
            comment: comments[i % comments.length] + (Math.random() > 0.3 ? "" : " Really impressed!")
        });
    }
    return reviews;
};

// --- Star Rating Component ---
const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex text-yellow-400 mb-2">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            ))}
            {halfStar && (
                 <svg key="half" className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0v15z"/></svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                 <svg key={`empty-${i}`} className="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            ))}
        </div>
    );
};

// --- Review Card Component ---
const ReviewCard = ({ review }) => {
    const { name, stars, comment } = review;
    return (
        <div className="h-full flex flex-col justify-between bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
             <div>
                <StarRating rating={stars} />
                {/* --- FIX: Added whitespace-normal --- */}
                <p className="text-gray-600 italic text-sm mb-3 leading-snug whitespace-normal">
                    "{comment}"
                </p>
                {/* --- END FIX --- */}
             </div>
             <p className="text-right text-xs font-semibold text-gray-700 mt-2">- {name}</p>
        </div>
    );
};

// --- Main Review Section Component ---
const ReviewSection = () => {
    const [reviews] = useState(() => generateMockReviews(10));

    // --- STATE FOR SWIPING & AUTO-SCROLL ---
    const [isMobile, setIsMobile] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);

    const touchStartX = useRef(0);
    const autoScrollTimerRef = useRef(null);
    const resumeScrollTimerRef = useRef(null);
    const transitionEndTimeoutRef = useRef(null);
    const transitionDuration = 400; // ms

    // --- HOOKS ---
    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile(); window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    useEffect(() => { // Auto-scroll logic
        if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
        if (resumeScrollTimerRef.current) clearTimeout(resumeScrollTimerRef.current);
        if (isMobile && !isInteracting && reviews.length > 0) {
            autoScrollTimerRef.current = setInterval(() => setCurrentIndex(prev => prev + 1), 5000);
        } else if (!isMobile && !isInteracting && reviews.length > 0) {
            // Desktop auto-scroll handled by CSS, no interval needed here
        }
        return () => { if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current); };
    }, [isMobile, isInteracting, reviews.length]);

    useEffect(() => { // Seamless loop logic for mobile
        if (!isMobile || reviews.length === 0) return;
        if (currentIndex >= 0 && currentIndex < reviews.length) {
            if (!isTransitioning) setIsTransitioning(true);
            return;
        }
        const handleLoop = () => {
            if (currentIndex === reviews.length) { setIsTransitioning(false); setCurrentIndex(0); }
            else if (currentIndex === -1) { setIsTransitioning(false); setCurrentIndex(reviews.length - 1); }
        };
         requestAnimationFrame(() => {
             transitionEndTimeoutRef.current = setTimeout(handleLoop, transitionDuration);
        });
        return () => { if (transitionEndTimeoutRef.current) clearTimeout(transitionEndTimeoutRef.current); };
    }, [currentIndex, isMobile, reviews.length, isTransitioning]);

    // Touch handlers for mobile
    const handleTouchStart = (e) => {
        if (!isMobile || reviews.length === 0) return;
        setIsInteracting(true);
        if (resumeScrollTimerRef.current) clearTimeout(resumeScrollTimerRef.current);
        if (transitionEndTimeoutRef.current) clearTimeout(transitionEndTimeoutRef.current);
        if (currentIndex === reviews.length) { setIsTransitioning(false); setCurrentIndex(0); }
        else if (currentIndex === -1) { setIsTransitioning(false); setCurrentIndex(reviews.length - 1); }
         requestAnimationFrame(() => { touchStartX.current = e.touches[0].clientX; });
    };
    const handleTouchEnd = (e) => {
        if (!isMobile || reviews.length === 0) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchDiff = touchStartX.current - touchEndX;
        const swipeThreshold = 50;
        if (touchDiff > swipeThreshold) { setCurrentIndex(prev => prev + 1); }
        else if (touchDiff < -swipeThreshold) { setCurrentIndex(prev => prev - 1); }
        touchStartX.current = 0;
        resumeScrollTimerRef.current = setTimeout(() => setIsInteracting(false), 3000);
    };
    // Desktop hover handlers
     const handleMouseEnter = () => { if (!isMobile) setIsInteracting(true); }
     const handleMouseLeave = () => { if (!isMobile) setIsInteracting(false); }

    // --- RENDER ---
    if (!reviews || reviews.length === 0) return null;

    return (
        <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 text-center sm:text-left">
                    <h4 className="uppercase font-heading text-2xl mb-2 sm:mb-0">Customer Reviews</h4>
                </div>
                <div
                    className="scroll-container overflow-hidden whitespace-nowrap" // whitespace-nowrap is needed here for the slider items
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className={`scroll-track ${isInteracting && !isMobile ? 'paused' : ''}`}
                        style={{
                            transform: isMobile ? `translateX(calc(-${(currentIndex + 1) * 100}%))` : 'unset',
                            transition: isMobile && isTransitioning ? `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none'
                        }}
                    >
                        {!isMobile ? (
                            <>
                                {/* Desktop Render */}
                                {reviews.map(review => (
                                    <div key={review.id} className="w-full md:w-1/3 flex-shrink-0 px-2">
                                        <ReviewCard review={review} />
                                    </div>
                                ))}
                                {reviews.map(review => (
                                    <div key={`${review.id}-clone`} className="w-full md:w-1/3 flex-shrink-0 px-2">
                                        <ReviewCard review={review} />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {/* Mobile Render */}
                                {reviews.length > 0 && (
                                    <div key={`${reviews[reviews.length - 1].id}-clone-start`} className="w-full flex-shrink-0 px-2">
                                        <ReviewCard review={reviews[reviews.length - 1]} />
                                    </div>
                                )}
                                {reviews.map(review => (
                                    <div key={review.id} className="w-full flex-shrink-0 px-2">
                                        <ReviewCard review={review} />
                                    </div>
                                ))}
                                {reviews.length > 0 && (
                                    <div key={`${reviews[0].id}-clone-end`} className="w-full flex-shrink-0 px-2">
                                        <ReviewCard review={reviews[0]} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- IN-FILE STYLES --- */}
            <style jsx>{`
                .scroll-container { touch-action: pan-y; overscroll-behavior-x: none; cursor: grab; }
                .scroll-container:active { cursor: grabbing; }
                .scroll-track { display: flex; }

                @media (min-width: 768px) {
                    .scroll-track {
                        animation: scroll-reviews 60s linear infinite;
                        transition: none !important;
                    }
                    .scroll-track.paused { animation-play-state: paused; }
                }

                @keyframes scroll-reviews {
                    0%   { transform: translateX(0%); }
                    9%   { transform: translateX(0%); } 10%  { transform: translateX(-33.333%); }
                    19%  { transform: translateX(-33.333%); } 20%  { transform: translateX(-66.666%); }
                    29%  { transform: translateX(-66.666%); } 30%  { transform: translateX(-100%); }
                    39%  { transform: translateX(-100%); } 40%  { transform: translateX(-133.333%); }
                    49%  { transform: translateX(-133.333%); } 50%  { transform: translateX(-166.666%); }
                    59%  { transform: translateX(-166.666%); } 60%  { transform: translateX(-200%); }
                    69%  { transform: translateX(-200%); } 70%  { transform: translateX(-233.333%); }
                    79%  { transform: translateX(-233.333%); } 80%  { transform: translateX(-266.666%); }
                    89%  { transform: translateX(-266.666%); } 90%  { transform: translateX(-300%); }
                    99%  { transform: translateX(-300%); } 100% { transform: translateX(-333.333%); }
                }
            `}</style>
        </section>
    );
};

export default ReviewSection;