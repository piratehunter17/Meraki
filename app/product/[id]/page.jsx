// /app/product/[id]/page.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

// --- Icon and InfoTabs components (Unchanged from your code) ---
const MinusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg> );
const InfoTabs = ({ product }) => {
    const [activeTab, setActiveTab] = useState('description');
    const tabStyles = "py-4 px-6 text-center w-full focus:outline-none transition-colors duration-300 font-medium";
    const activeTabStyles = "text-dark border-b-2 border-dark";
    const inactiveTabStyles = "text-gray-500 hover:text-dark";
    if (!product) return null;
    return (
        <div className="mt-12">
            <div className="border-b"><nav className="flex space-x-4"><button onClick={() => setActiveTab('description')} className={`${tabStyles} ${activeTab === 'description' ? activeTabStyles : inactiveTabStyles}`}>Description</button><button onClick={() => setActiveTab('info')} className={`${tabStyles} ${activeTab === 'info' ? activeTabStyles : inactiveTabStyles}`}>Additional Information</button></nav></div>
            <div className="py-8 min-h-[150px]">{activeTab === 'description' && (<p className="text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>)}{activeTab === 'info' && (<ul className="list-disc list-inside text-gray-600 space-y-2"><li>SKU: {product.sku || 'N/A'}</li><li>Category: {product.categories?.name || 'N/A'}</li></ul>)}</div>
        </div>
    );
};

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.id;

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);
    // **NEW STATE for out of stock status**
    const [isOutOfStock, setIsOutOfStock] = useState(false);

    // --- (Slider state remains unchanged from your code) ---
    const [isMobile, setIsMobile] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const touchStartX = useRef(0);
    const autoScrollTimerRef = useRef(null);
    const resumeScrollTimerRef = useRef(null);
    const transitionEndTimeoutRef = useRef(null);
    const transitionDuration = 400; // 400ms slide time

    const supabase = createClient();

    // --- DATA FETCHING ---
    const fetchProductData = useCallback(async () => {
        if (!slug) return;
        setLoading(true); setError(null);

        try {
            // **1. Fetch stock_quantity**
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select(`
                    id, name, description, price, discount_price, sku, category_id,
                    stock_quantity,
                    categories ( name ),
                    product_images ( image_url )
                `)
                .eq('slug', slug)
                .single();

            if (productError || !productData) {
                throw new Error(productError?.message || 'Product not found.');
            }

            setProduct(productData);
            setMainImage(productData.product_images?.[0]?.image_url || '/images/placeholder.jpg');
            // **2. Set isOutOfStock state**
            setIsOutOfStock(productData.stock_quantity !== undefined && productData.stock_quantity <= 0);
            setQuantity(1); // Reset quantity

            // Fetch wishlist status (Unchanged from your code)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: wishlistItem, error: wishlistError } = await supabase
                    .from('wishlist_items')
                    .select('product_id')
                    .match({ user_id: user.id, product_id: productData.id })
                    .maybeSingle();
                if (wishlistError && wishlistError.code !== 'PGRST116') { console.warn("Error checking wishlist:", wishlistError); }
                setIsInWishlist(!!wishlistItem);
            } else {
                setIsInWishlist(false);
            }

            // Fetch related products (including stock_quantity)
             const { data: relatedData, error: relatedError } = await supabase
                .from('products')
                // **7. Fetch stock_quantity for related products**
                .select(`id, name, price, discount_price, slug, stock_quantity, product_images ( image_url )`)
                .eq('category_id', productData.category_id)
                .not('id', 'eq', productData.id)
                .limit(10);

            if (relatedError) { console.warn("Error fetching related products:", relatedError); }

            if (relatedData) {
                const formattedRelated = relatedData.map(p => ({
                    id: p.id, name: p.name, price: p.price, discount_price: p.discount_price, slug: p.slug,
                    stock_quantity: p.stock_quantity, // Pass stock to related ProductCards
                    imageUrl: p.product_images?.length > 0 ? p.product_images[0].image_url : '/images/placeholder.jpg'
                }));
                setRelatedProducts(formattedRelated);
            } else {
                 setRelatedProducts([]);
            }

        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [slug, supabase]);

    useEffect(() => {
        fetchProductData();
    }, [fetchProductData]);

    // --- (Slider logic hooks remain unchanged from your original code) ---
     useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile(); window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

     useEffect(() => {
        if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
        if (resumeScrollTimerRef.current) clearTimeout(resumeScrollTimerRef.current);
        if (isMobile && !isInteracting && relatedProducts.length > 0) {
            autoScrollTimerRef.current = setInterval(() => setCurrentIndex(prev => prev + 1), 5000);
        }
        return () => { if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current); };
    }, [isMobile, isInteracting, relatedProducts.length]);

    useEffect(() => {
        if (!isMobile || relatedProducts.length === 0) return;
        if (currentIndex !== relatedProducts.length && currentIndex !== -1) {
            if (!isTransitioning) setIsTransitioning(true); return;
        }
        const handleLoop = () => {
            if (currentIndex === relatedProducts.length) { setIsTransitioning(false); setCurrentIndex(0); }
            else if (currentIndex === -1) { setIsTransitioning(false); setCurrentIndex(relatedProducts.length - 1); }
        };
         requestAnimationFrame(() => {
             transitionEndTimeoutRef.current = setTimeout(handleLoop, transitionDuration);
        });
        return () => { if (transitionEndTimeoutRef.current) clearTimeout(transitionEndTimeoutRef.current); };
    }, [currentIndex, isMobile, relatedProducts.length, isTransitioning]);

    const handleTouchStart = (e) => {
        if (!isMobile || relatedProducts.length === 0) return;
        setIsInteracting(true);
        if (resumeScrollTimerRef.current) clearTimeout(resumeScrollTimerRef.current);
        if (transitionEndTimeoutRef.current) clearTimeout(transitionEndTimeoutRef.current);
        if (currentIndex === relatedProducts.length) { setIsTransitioning(false); setCurrentIndex(0); }
        else if (currentIndex === -1) { setIsTransitioning(false); setCurrentIndex(relatedProducts.length - 1); }
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        if (!isMobile || relatedProducts.length === 0) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchDiff = touchStartX.current - touchEndX;
        const swipeThreshold = 50;
        if (touchDiff > swipeThreshold) { setCurrentIndex(prev => prev + 1); }
        else if (touchDiff < -swipeThreshold) { setCurrentIndex(prev => prev - 1); }
        touchStartX.current = 0;
        resumeScrollTimerRef.current = setTimeout(() => setIsInteracting(false), 3000);
    };
    // --- END SLIDER LOGIC HOOKS ---

    // --- ACTION HANDLERS ---
    const handleAddToCart = async () => {
        // **4. Prevent adding if out of stock**
        if (isOutOfStock) {
            alert("This item is currently out of stock.");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert('Please log in to add items to your cart.'); return; }
        if (!product || !product.id) { console.error("Product ID missing"); return; }
        try {
            const { data: existingItem } = await supabase.from('cart_items').select('*').eq('user_id', user.id).eq('product_id', product.id).maybeSingle();
            if (existingItem) {
                // **Check available stock before updating quantity**
                const totalQuantityNeeded = existingItem.quantity + quantity;
                 if (product.stock_quantity < totalQuantityNeeded) {
                      alert(`Cannot add ${quantity} item(s). Only ${product.stock_quantity - existingItem.quantity} more available in stock. Your cart already has ${existingItem.quantity}.`);
                      return;
                 }
                const { error: updateError } = await supabase.from('cart_items').update({ quantity: totalQuantityNeeded }).match({ user_id: user.id, product_id: product.id });
                if (updateError) throw updateError; alert('Cart updated successfully!');
            } else {
                 // **Check available stock before adding new item**
                 if (product.stock_quantity < quantity) {
                      alert(`Cannot add ${quantity} item(s). Only ${product.stock_quantity} available in stock.`);
                      return;
                 }
                const { error: insertError } = await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity: quantity });
                if (insertError) throw insertError; alert('Added to cart!');
            }
        } catch (err) { alert('Error handling cart: ' + err.message); }
    };

    const handleAddToWishlist = async () => {
        // Wishlist works even if out of stock
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert('Please log in to manage your wishlist.'); return; }
        if (!product || !product.id) { console.error("Product ID missing"); return; }
        try {
            if (isInWishlist) {
                const { error } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
                if (error) throw error; /* alert('Removed from wishlist!'); */ setIsInWishlist(false); // Removed alert
            } else {
                const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
                if (error) throw error; /* alert('Added to wishlist!'); */ setIsInWishlist(true); // Removed alert
            }
        } catch (err) { alert('Error updating wishlist: ' + err.message); }
    };
    // --- END ACTION HANDLERS ---

    // --- RENDER LOGIC ---
    if (loading) return <div className="flex justify-center items-center h-screen"><p>Loading product...</p></div>;
    if (error) return (
         <>
         <Navbar />
          <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] pt-20 text-center px-4">
              <p className="text-red-500 text-xl mb-4">{error}</p>
              <Link href="/shop">
                   <button className="bg-black text-white uppercase text-sm font-bold py-3 px-8 hover:bg-gray-800 transition-colors duration-300 rounded-sm">
                        Go to Shop
                   </button>
              </Link>
         </div>
          <Footer />
          </>
    );
    if (!product) return null;

    return (
        <>
            <Navbar />
            <main className="pt-20"> {/* Reverted padding */}
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4">
                        {/* Breadcrumbs (Unchanged) */}
                        <div className="text-sm text-gray-500 mb-8">
                           <Link href="/" className="hover:text-primary transition-colors duration-300">Home</Link> / <Link href="/shop" className="hover:text-primary transition-colors duration-300">Shop</Link> / <span>{product.name}</span>
                        </div>
                        {/* Product Details Grid (Unchanged structure) */}
                        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
                            {/* Image Gallery (Unchanged structure) */}
                            <div className="w-full lg:w-5/12 xl:w-1/3">
                                <div className="mb-4 border aspect-[3/4] relative bg-gray-100">
                                    {mainImage ? (
                                        <Image
                                            src={mainImage} alt={product.name} fill
                                            className={`object-cover ${isOutOfStock ? 'opacity-80' : ''}`} // Apply opacity if out of stock
                                            priority sizes="(max-width: 1024px) 100vw, 40vw"
                                        />
                                    ) : ( <div className="flex items-center justify-center h-full text-gray-400">No Image</div> )}
                                    {/* Add Out of Stock Badge */}
                                    {isOutOfStock && (
                                        <div className="absolute bottom-2 right-2 bg-red-800 text-white text-xs font-bold uppercase py-1 px-3 rounded-sm z-10 pointer-events-none">
                                            Out of Stock
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 gap-2 md:gap-4">
                                     {product.product_images?.map((img, index) => (
                                         <button
                                             key={index}
                                             onClick={() => setMainImage(img.image_url)}
                                             className={`border-2 aspect-[3/4] relative transition-colors duration-200 ${mainImage === img.image_url ? 'border-dark' : 'border-transparent hover:border-gray-300'}`}
                                         >
                                             <Image src={img.image_url} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" sizes="25vw"/>
                                         </button>
                                     ))}
                                </div>
                            </div>
                            {/* Product Info (Unchanged structure) */}
                            <div className="w-full lg:w-7/12 xl:w-2/3">
                                <h1 className="text-3xl md:text-4xl font-heading mb-3">{product.name}</h1>
                                <p className="text-2xl md:text-3xl text-dark my-4">
                                     {product.discount_price && parseFloat(product.discount_price) > 0 && parseFloat(product.discount_price) < parseFloat(product.price) ? (
                                         <><span className="font-medium text-zinc-800">${parseFloat(product.discount_price).toFixed(2)}</span><span className="ml-3 line-through text-gray-400 text-xl">${parseFloat(product.price).toFixed(2)}</span></>
                                     ) : (
                                         <span className="font-semibold">${parseFloat(product.price).toFixed(2)}</span>
                                     )}
                                </p>
                                {/* **6. Show stock status** */}
                                <p className={`text-sm mb-4 ${isOutOfStock ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                </p>
                                <p className="text-gray-600 leading-relaxed max-w-xl mb-6">
                                     {product.description || 'No detailed description available.'}
                                </p>
                                <div className="mt-8 pt-8 border-t">
                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                        {/* **5. Adjust Quantity Selector** */}
                                        <div className={`flex items-center w-fit border border-gray-300 rounded ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={isOutOfStock}
                                                className="p-3 text-gray-700 hover:bg-gray-100 transition-colors duration-300 rounded-l disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                            ><MinusIcon /></button>
                                            <input
                                                type="text" value={quantity} readOnly disabled={isOutOfStock}
                                                className="w-12 text-center text-lg font-semibold border-y-0 border-x focus:ring-0 bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
                                            />
                                            <button
                                                onClick={() => setQuantity(q => q + 1)}
                                                disabled={isOutOfStock || quantity >= (product?.stock_quantity ?? 0)} // Also disable if quantity meets/exceeds stock
                                                className="p-3 text-gray-700 hover:bg-gray-100 transition-colors duration-300 rounded-r disabled:hover:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
                                            ><PlusIcon /></button>
                                        </div>

                                        {/* **3. Conditionally Disable Action Buttons** */}
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[250px]">
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isOutOfStock}
                                                className="w-full bg-zinc-800 text-white uppercase py-3 px-6 border border-zinc-800 hover:bg-zinc-700 hover:border-zinc-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-800"
                                            >Add to Cart</button>
                                            <button
                                                disabled={isOutOfStock}
                                                className="w-full bg-transparent text-zinc-800 uppercase py-3 px-6 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-800/50 disabled:border-zinc-800/50"
                                            >Buy Now</button>
                                        </div>
                                    </div>
                                    {/* Wishlist Button (Always enabled) */}
                                    <div>
                                        <button onClick={handleAddToWishlist} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-300">
                                            {isInWishlist ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                            )}
                                            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                        </button>
                                    </div>
                                </div>
                                {/* Meta Info (Unchanged) */}
                                <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                                     <p>SKU: <span className="font-medium text-dark">{product.sku || 'N/A'}</span></p>
                                     <p className="mt-1">Category: <Link href={`/shop?category=${product.categories?.name?.toLowerCase()}`} className="font-medium text-dark hover:text-primary transition-colors duration-300">{product.categories?.name || 'N/A'}</Link></p>
                                </div>
                            </div>
                        </div>
                         {/* Info Tabs (Unchanged) */}
                        <InfoTabs product={product} />
                    </div>
                </section>

                {/* --- RELATED PRODUCTS SECTION (Original Slider Logic) --- */}
                {relatedProducts && relatedProducts.length > 0 && (
                     <section className="bg-light py-16 md:py-20"> {/* Original padding */}
                        <div className="container mx-auto px-4 overflow-hidden"> {/* Original overflow */}
                            <div className="flex justify-between items-center mb-10">
                                <h4 className="uppercase font-heading text-2xl">You May Also Like</h4>
                                <Link href="/shop" className="relative inline-block uppercase text-sm font-bold after:content-[''] after:block after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">
                                    View All Products
                                </Link>
                            </div>
                            <div
                                className="scroll-container overflow-hidden whitespace-nowrap" // Original classes
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div
                                    className="scroll-track" // Original class
                                    style={{ // Original inline style logic
                                        transform: isMobile ? `translateX(calc(-${(currentIndex + 1) * 50}%))` : 'unset', // Reverted calc for gap
                                        transition: isMobile && isTransitioning ? `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none'
                                    }}
                                >
                                    {/* Original rendering logic */}
                                    {!isMobile ? (
                                        <>
                                            {relatedProducts.slice(0, 10).map(prod => (<div key={prod.id} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={prod} /></div>))}
                                            {relatedProducts.slice(0, 10).map(prod => (<div key={`${prod.id}-clone`} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={prod} /></div>))}
                                        </>
                                    ) : (
                                        <>
                                            {relatedProducts.length > 0 && (<div key={`${relatedProducts[relatedProducts.length - 1].id}-clone-start`} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={relatedProducts[relatedProducts.length - 1]} /></div>)}
                                            {relatedProducts.map(prod => (<div key={prod.id} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={prod} /></div>))}
                                            {relatedProducts.length > 0 && (<div key={`${relatedProducts[0].id}-clone-end`} className="w-1/2 md:w-1/4 flex-shrink-0 px-4"><ProductCard product={relatedProducts[0]} /></div>)}
                                        </>
                                    )}
                                </div>
                            </div>
                             {/* --- SLIDER STYLES (Original Logic) --- */}
                             <style jsx>{`
                                .scroll-container { touch-action: pan-y; overscroll-behavior-x: none; }
                                .scroll-track { display: flex; }
                                @media (min-width: 768px) {
                                    .scroll-track {
                                        animation: scroll-related 50s linear infinite;
                                        transition: none !important;
                                        /* Removed transform: unset !important */ /* Already removed in your original code */
                                    }
                                    .scroll-container:hover .scroll-track { animation-play-state: paused; }
                                }
                                @keyframes scroll-related {
                                    /* Original Keyframes */
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
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
}