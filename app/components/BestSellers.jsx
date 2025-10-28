// /app/components/BestSellers.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { createClient } from '../../lib/supabase/client';

const BestSellers = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFallback, setIsFallback] = useState(false);
    const supabase = createClient();

    // --- STATE FOR SWIPING & AUTO-SCROLL ---
    const [isMobile, setIsMobile] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const touchStartX = useRef(0);
    const autoScrollTimerRef = useRef(null);
    const resumeScrollTimerRef = useRef(null);
    const transitionEndTimeoutRef = useRef(null);
    const transitionDuration = 400; // 400ms slide time

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchBestSellerProducts = async () => {
            setLoading(true); setError(null); setProducts([]); setIsFallback(false);
            let productIds = []; let fetchFailed = false;
            try {
                const { data: allWishlistItems, error: fetchError } = await supabase.from('wishlist_items').select('product_id');
                let topWishlistedIds = [];
                if (fetchError) { setIsFallback(true); console.error("Wishlist fetch error:", fetchError); }
                else if (allWishlistItems && allWishlistItems.length > 0) {
                    const counts = allWishlistItems.reduce((acc, item) => { acc[item.product_id] = (acc[item.product_id] || 0) + 1; return acc; }, {});
                    topWishlistedIds = Object.entries(counts).map(([pid, count]) => ({ pid: parseInt(pid, 10), count })).sort((a, b) => b.count - a.count).slice(0, 10).map(item => item.pid);
                    if (topWishlistedIds.length < 1) setIsFallback(true); else productIds = topWishlistedIds;
                } else { setIsFallback(true); }
                if (isFallback) {
                    const { data: recent, error: recentError } = await supabase.from('products').select('id').order('created_at', { ascending: false }).limit(10);
                    if (recentError || !recent) { setError(recentError?.message || "Fallback failed."); fetchFailed = true; console.error("Fallback fetch error:", recentError); }
                    else if (recent.length > 0) { productIds = recent.map(item => item.id); }
                    else { fetchFailed = true; /* Handle case where fallback also yields no products */}
                }
                if (!fetchFailed && productIds.length > 0) {
                    const { data: pData, error: pError } = await supabase.from('products').select(`id, name, price, discount_price, slug, product_images ( image_url )`).in('id', productIds);
                    if (pError) { setError(pError.message || "Failed load details."); console.error("Product details fetch error:", pError); }
                    else if (pData) {
                        const fProds = pData.map(p => ({ id: p.id, name: p.name, price: p.price, discount_price: p.discount_price, slug: p.slug, imageUrl: p.product_images.length > 0 ? p.product_images[0].image_url : '/images/placeholder.jpg' }));
                        const sProds = productIds.map(id => fProds.find(p => p.id === id)).filter(Boolean);
                        setProducts(sProds);
                    } else {
                         setProducts([]); // Ensure products is empty array if pData is null/empty
                    }
                } else if (!fetchFailed) {
                     setProducts([]); // Ensure products is empty array if no IDs found
                }
            } catch (err) { setError(err.message || "An error occurred."); console.error("General fetch error:", err); }
            finally { setLoading(false); }
        };
        fetchBestSellerProducts();
    }, []); // Removed supabase dependency

    // --- MOBILE DETECTION ---
     useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile(); // Check on initial render
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // --- AUTO-SCROLL LOGIC (for mobile) ---
     useEffect(() => {
        if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
        if (resumeScrollTimerRef.current) clearTimeout(resumeScrollTimerRef.current);
        if (isMobile && !isInteracting && products.length > 0) {
            autoScrollTimerRef.current = setInterval(() => setCurrentIndex(prev => prev + 1), 5000);
        }
        return () => { if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current); };
    }, [isMobile, isInteracting, products.length]);

    // --- SEAMLESS LOOP LOGIC (for mobile) ---
    useEffect(() => {
        if (!isMobile || products.length === 0) return;
        if (currentIndex !== products.length && currentIndex !== -1) {
            if (!isTransitioning) setIsTransitioning(true); return;
        }
        const handleLoop = () => {
            if (currentIndex === products.length) { setIsTransitioning(false); setCurrentIndex(0); }
            else if (currentIndex === -1) { setIsTransitioning(false); setCurrentIndex(products.length - 1); }
        };
         requestAnimationFrame(() => {
             transitionEndTimeoutRef.current = setTimeout(handleLoop, transitionDuration);
        });
        return () => { if (transitionEndTimeoutRef.current) clearTimeout(transitionEndTimeoutRef.current); };
    }, [currentIndex, isMobile, products.length, isTransitioning]);

    // --- TOUCH HANDLERS (for mobile) ---
    const handleTouchStart = (e) => {
        if (!isMobile) return;
        setIsInteracting(true);
        if (resumeScrollTimerRef.current) clearTimeout(resumeScrollTimerRef.current);
        if (transitionEndTimeoutRef.current) clearTimeout(transitionEndTimeoutRef.current);
        if (currentIndex === products.length) { setIsTransitioning(false); setCurrentIndex(0); }
        else if (currentIndex === -1) { setIsTransitioning(false); setCurrentIndex(products.length - 1); }
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        if (!isMobile) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchDiff = touchStartX.current - touchEndX;
        const swipeThreshold = 50;
        if (touchDiff > swipeThreshold) { setCurrentIndex(prev => prev + 1); }
        else if (touchDiff < -swipeThreshold) { setCurrentIndex(prev => prev - 1); }
        touchStartX.current = 0;
        resumeScrollTimerRef.current = setTimeout(() => setIsInteracting(false), 3000);
    };

    // --- LOADING/ERROR STATES ---
    if (loading) {
         return (
             <section className="py-20">
                 <div className="container mx-auto px-4 text-center">
                     <p className="text-gray-500">Loading best sellers...</p>
                 </div>
             </section>
         );
    }
    if (error) {
         return (
             <section className="py-20">
                 <div className="container mx-auto px-4 text-center">
                     <p className="text-red-500">Error loading products: {error}</p>
                 </div>
             </section>
         );
    }
    if (!products || products.length === 0) {
     return (
         <section className="py-20">
             <div className="container mx-auto px-4 text-center">
                 <p className="text-gray-500">No best selling products found.</p>
             </div>
         </section>
      );
   }


    // --- RENDER FUNCTION ---
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-10">
                    <h4 className="uppercase font-heading text-2xl">Best Selling Items</h4>
                    <Link href="/shop" className="relative inline-block mt-3 uppercase text-sm font-bold after:content-[''] after:block after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">
                        View All Products
                    </Link>
                </div>
                <div
                    className="scroll-container overflow-hidden whitespace-nowrap"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="scroll-track"
                        style={{
                            transform: isMobile ? `translateX(calc(-${(currentIndex + 1) * 50}%))` : 'unset',
                            transition: isMobile && isTransitioning ? `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none'
                        }}
                    >
                        {!isMobile ? (
                            <>
                                {products.map(product => (<div key={product.id} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={product} /></div>))}
                                {products.map(product => (<div key={`${product.id}-clone`} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={product} /></div>))}
                            </>
                        ) : (
                            <>
                                {products.length > 0 && (<div key={`${products[products.length - 1].id}-clone-start`} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={products[products.length - 1]} /></div>)}
                                {products.map(product => (<div key={product.id} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={product} /></div>))}
                                {products.length > 0 && (<div key={`${products[0].id}-clone-end`} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={products[0]} /></div>)}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- IN-FILE STYLES (Fixed) --- */}
            <style jsx>{`
                .scroll-container { touch-action: pan-y; overscroll-behavior-x: none; }
                .scroll-track { display: flex; }
                @media (min-width: 768px) {
                    .scroll-track {
                        animation: scroll-desktop 50s linear infinite;
                        transition: none !important; /* Keep this */
                        /* transform: unset !important; */ /* REMOVED THIS LINE */
                    }
                    .scroll-container:hover .scroll-track { animation-play-state: paused; }
                }
                @keyframes scroll-desktop {
                    0%   { transform: translateX(0%); } 9%   { transform: translateX(0%); } 10%  { transform: translateX(-25%); }
                    19%  { transform: translateX(-25%); } 20%  { transform: translateX(-50%); }
                    29%  { transform: translateX(-50%); } 30%  { transform: translateX(-75%); }
                    39%  { transform: translateX(-75%); } 40%  { transform: translateX(-100%); }
                    49%  { transform: translateX(-100%); } 50%  { transform: translateX(-125%); }
                    59%  { transform: translateX(-125%); } 60%  { transform: translateX(-150%); }
                    69%  { transform: translateX(-150%); } 70%  { transform: translateX(-175%); }
                    79%  { transform: translateX(-175%); } 80%  { transform: translateX(-200%); }
                    89%  { transform: translateX(-200%); } 90%  { transform: translateX(-225%); }
                    99%  { transform: translateX(-225%); } 100% { transform: translateX(-250%); }
                }
            `}</style>
        </section>
    );
};
export default BestSellers;