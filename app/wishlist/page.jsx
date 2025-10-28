// /app/wishlist/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '../../lib/supabase/client'; // Correct path

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// --- WishlistProductCard Component (Reverted Design + AddToCart Hover Button) ---
const WishlistProductCard = ({ item, onRemove, onAddToCart }) => {
    const { id, name, price, discount_price, image, slug } = item;
    const supabase = createClient(); // Keep if needed for potential future card logic

    const handleRemoveClick = (e) => {
        e.preventDefault();
        onRemove(id);
    };

    const handleAddToCartClick = (e) => {
        e.preventDefault(); // Prevent link navigation if clicking button over image link
        onAddToCart(id);
    }

    return (
        <div className="text-center group"> {/* Group for hover effects */}
            {/* Image Container using aspect-ratio */}
            <div className="relative overflow-hidden w-full aspect-[3/4] group"> {/* Inner group for targeting */}
                <Link href={`/product/${slug}`} className="block w-full h-full">
                    <Image
                        src={image || '/images/placeholder.jpg'}
                        alt={name}
                        fill // Fill the container
                        className="object-cover transform transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" // Example sizes
                    />
                </Link>

                {/* Remove button (X Icon - Changed from Heart) */}
                <button
                    onClick={handleRemoveClick}
                    aria-label="Remove from wishlist"
                    className={`absolute top-2 right-2 bg-white p-2 rounded-full transition-colors duration-300 z-10 text-gray-500 hover:text-red-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100`} // Make visible on hover
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                {/* Add to Cart Button (Appears on Hover) */}
                 <button
                    onClick={handleAddToCartClick} // Use the correct handler
                    aria-label="Add to cart"
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white uppercase text-xs font-bold py-2 px-6 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-800 z-10 whitespace-nowrap"
                 >
                    Add to Cart
                 </button>
            </div>

            {/* Product Content (Matches ProductCard structure) */}
            <div className="mt-4">
                {/* Truncate ensures name doesn't wrap awkwardly */}
                <h5 className="uppercase text-xl font-heading truncate">
                    <Link href={`/product/${slug}`} className="hover:text-primary transition-colors duration-300">{name}</Link>
                </h5>

                {/* Price/See Details Animation Block */}
                <Link
                    href={`/product/${slug}`}
                    className="relative block h-6 mt-1 overflow-hidden text-gray-700"
                >
                    <span className="block transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                        {/* Price Display Logic */}
                        {discount_price && parseFloat(discount_price) > 0 && parseFloat(discount_price) < parseFloat(price) ? (
                            <>
                                <span className=" text-zinc-800">${parseFloat(discount_price).toFixed(2)}</span>
                                <span className="ml-2 line-through text-gray-400">${parseFloat(price).toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="font-normal">${parseFloat(price).toFixed(2)}</span>
                        )}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0 uppercase text-sm text-primary">
                        See Details
                    </span>
                </Link>
                {/* No explicit Add to Cart button needed here */}
            </div>
        </div>
    );
};

// --- WishlistPage Component ---
const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchWishlist = async () => {
            setLoading(true);
            setError(null);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setWishlistItems([]);
                setLoading(false);
                setError("Please log in to view your wishlist.");
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('wishlist_items')
                .select(`
                    products (
                        id, name, price, discount_price, slug,
                        product_images (image_url)
                    )
                `)
                .eq('user_id', user.id);

            if (fetchError) {
                setError('Failed to load your wishlist.');
                console.error("Wishlist fetch error:", fetchError);
            } else if (data) {
                const validItems = data.filter(item => item.products); // Ensure product wasn't deleted
                const formattedItems = validItems.map(item => ({
                    id: item.products.id,
                    name: item.products.name,
                    price: item.products.price, // Keep original price
                    discount_price: item.products.discount_price, // Keep discount price
                    slug: item.products.slug,
                    image: Array.isArray(item.products.product_images) && item.products.product_images.length > 0
                           ? item.products.product_images[0].image_url
                           : '/images/placeholder.jpg',
                }));
                setWishlistItems(formattedItems);
            } else {
                 setWishlistItems([]);
            }
            setLoading(false);
        };
        fetchWishlist();
    }, [supabase]); // Dependency on supabase client instance

    const handleRemoveFromWishlist = async (productId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const previousItems = wishlistItems;
        setWishlistItems(wishlistItems.filter(item => item.id !== productId)); // Optimistic UI update

        const { error: deleteError } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: productId });

        if (deleteError) {
            alert('Error removing item: ' + deleteError.message);
            setWishlistItems(previousItems); // Rollback on error
        }
    };

    // This function handles adding the item to the cart
    const handleAddToCart = async (productId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to add items to your cart.');
            return;
        }
        try {
            const { data: existingItem, error: checkError } = await supabase
                .from('cart_items')
                .select('quantity')
                .eq('user_id', user.id)
                .eq('product_id', productId)
                .maybeSingle(); // Use maybeSingle to handle null gracefully

            if (checkError) throw checkError;

            if (existingItem) {
                const newQuantity = existingItem.quantity + 1;
                const { error: updateError } = await supabase
                    .from('cart_items')
                    .update({ quantity: newQuantity }) // Removed updated_at, let DB handle default
                    .match({ user_id: user.id, product_id: productId });
                if (updateError) throw updateError;
                alert('Item quantity updated in cart!');
            } else {
                const { error: insertError } = await supabase
                    .from('cart_items')
                    .insert({ user_id: user.id, product_id: productId, quantity: 1 });
                if (insertError) throw insertError;
                alert('Item added to cart!');
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            alert('Error adding item to cart: ' + error.message);
        }
    };

    // --- Render Logic ---
    if (loading) return (
        <>
            <Navbar />
            <p className="text-center py-20 text-gray-500">Loading your wishlist...</p>
            <Footer />
        </>
    );

    const showEmptyState = error || wishlistItems.length === 0;

    return (
        <>
            <Navbar />
            <section className="pt-24 pb-16 md:py-24 bg-gray-50 min-h-[calc(100vh-160px)]"> {/* Adjust min-height if needed */}
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-heading text-center mb-12">My Wishlist</h2>

                    {showEmptyState ? (
                         <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg bg-white max-w-2xl mx-auto">
                             <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                             <p className="text-lg text-gray-500 mb-6">{error ? error : "Your wishlist is currently empty."}</p>
                             <Link href="/shop">
                                 <button className="bg-black text-white uppercase text-sm font-bold py-3 px-8 hover:bg-gray-800 transition-colors duration-300 rounded-sm">
                                     Continue Shopping
                                 </button>
                             </Link>
                         </div>
                    ) : (
                         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {wishlistItems.map((item) => (
                                <WishlistProductCard
                                    key={item.id}
                                    item={item}
                                    onRemove={handleRemoveFromWishlist}
                                    onAddToCart={handleAddToCart} // Pass the handler down
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default WishlistPage;