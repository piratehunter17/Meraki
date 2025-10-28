// /app/components/ProductCard.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

const ProductCard = ({ product }) => {
    const { id, name, price, discount_price, imageUrl, slug, stock_quantity } = product;
    const supabase = createClient();
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!id) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsWishlisted(false);
                return;
            }
            const { data, error } = await supabase
                .from('wishlist_items')
                .select('product_id')
                .eq('user_id', user.id)
                .eq('product_id', id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking wishlist status:', error.message);
            }
            setIsWishlisted(!!data);
        };
        checkWishlistStatus();
    }, [id, supabase]);

    const isOutOfStock = stock_quantity !== undefined && stock_quantity <= 0;

    const handleAddToWishlist = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to add items to your wishlist.');
            return;
        }

        // Out-of-stock items can still be wishlisted, no early return here.

        if (isWishlisted) {
            const { error } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: id });
            if (error) {
                alert('Error removing from wishlist: ' + error.message);
            } else {
                setIsWishlisted(false);
            }
        } else {
            const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: id });
            if (error) {
                alert('Error adding to wishlist: ' + error.message);
            } else {
                setIsWishlisted(true);
            }
        }
    };

    return (
        <div className="text-center group">
            <div className="relative overflow-hidden w-full aspect-[3/4]">
                <Link href={`/product/${slug}`} className="block w-full h-full">
                    <Image
                        src={imageUrl || '/images/placeholder.jpg'}
                        alt={name}
                        fill
                        // **FIX: Apply opacity-80 directly to the Image component**
                        className={`object-cover transform transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-70' : ''}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* **FIX: Removed the conditional overlay div** */}
                </Link>

                {/* "Out of Stock" Badge with Dark Red Background */}
                {isOutOfStock && (
                    <div className="absolute bottom-2 right-2 bg-red-800 text-white text-xs font-bold uppercase py-1 px-3 rounded-xl z-20 pointer-events-none">
                        Out of Stock
                    </div>
                )}

                {/* Wishlist button (not disabled for out-of-stock) */}
                <button
                    onClick={handleAddToWishlist}
                    className={`absolute top-2 right-2 bg-white p-2 rounded-full transition-colors duration-300 z-20
                        ${isWishlisted ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                    aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>

            {/* Product Content */}
            <div className="mt-4">
                <h5 className="uppercase text-xl font-heading truncate">
                    <Link href={`/product/${slug}`} className="hover:text-primary transition-colors">{name}</Link>
                </h5>

                <Link
                    href={`/product/${slug}`}
                    className="relative block h-6 mt-1 overflow-hidden text-gray-700"
                >
                    <span className="block transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                        {discount_price && parseFloat(discount_price) > 0 && parseFloat(discount_price) < parseFloat(price) ? (
                            <>
                                <span className="text-zinc-800">${parseFloat(discount_price).toFixed(2)}</span>
                                <span className="ml-2 line-through text-gray-400">${parseFloat(price).toFixed(2)}</span>
                            </>
                        ) : (
                            <span>${parseFloat(price).toFixed(2)}</span>
                        )}
                    </span>
                    {/* Hover text always "See Details" */}
                    <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0 uppercase text-sm text-primary`}>
                        See Details
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;