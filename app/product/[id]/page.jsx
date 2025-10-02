'use client'; 

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ProductCard from '@/app/components/ProductCard';

// --- Custom Icons for UI ---
const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
);


// --- Mock Data Fetching ---
const getProductDetails = (id) => {
    const allProducts = [
        { 
            id: 'dark-florish-onepiece', 
            name: 'Dark Florish Onepiece', 
            price: 95.00, 
            shortDescription: 'A stunning one-piece with a dark floral pattern, perfect for any occasion.', 
            description: 'Crafted from a lightweight and breathable fabric, this one-piece features a flattering silhouette and an intricate floral design. The adjustable straps and cinched waist ensure a perfect fit. Ideal for both casual outings and evening events.', 
            details: [
                'Outer: 100% Viscose',
                'Lining: 100% Cotton',
                'Adjustable shoulder straps',
                'Machine wash cold, gentle cycle',
            ],
            images: ['/images/product-item-1.jpg', '/images/single-image-1.jpg', '/images/cat-item2.jpg', '/images/product-item-8.jpg'], 
            category: 'Dresses', 
            sku: 'D-123' 
        },
        { 
            id: 'baggy-shirt', 
            name: 'Baggy Shirt', 
            price: 55.00, 
            shortDescription: 'An oversized, comfortable shirt for a relaxed and stylish look.', 
            description: 'Made from 100% organic cotton, this baggy shirt offers ultimate comfort without compromising on style. Its relaxed fit and classic design make it a versatile addition to any wardrobe.', 
            details: [
                '100% Organic Cotton',
                'Relaxed, oversized fit',
                'Front button closure',
                'Machine washable',
            ],
            images: ['/images/product-item-2.jpg', '/images/cat-item1.jpg', '/images/single-image-2.jpg', '/images/product-item-7.jpg'], 
            category: 'Tops', 
            sku: 'T-456' 
        },
    ];
    return allProducts.find(p => p.id === id) || allProducts[0]; 
};

const relatedProducts = [
    { id: 'handmade-crop-sweater-2', name: 'Handmade Crop Sweater', price: '50.00', imageUrl: '/images/product-item-6.jpg', slug: 'handmade-crop-sweater-2' },
    { id: 'classic-denim', name: 'Classic Denim', price: '110.00', imageUrl: '/images/product-item-7.jpg', slug: 'classic-denim' },
    { id: 'floral-dress', name: 'Floral Dress', price: '120.00', imageUrl: '/images/product-item-8.jpg', slug: 'floral-dress' },
    { id: 'beige-handbag', name: 'Beige Handbag', price: '85.00', imageUrl: '/images/product-item-9.jpg', slug: 'beige-handbag' },
];

// --- Simplified InfoTabs Component ---
const InfoTabs = ({ product }) => {
    const [activeTab, setActiveTab] = useState('description');

    const tabStyles = "py-4 px-6 text-center w-full focus:outline-none transition-colors font-medium";
    const activeTabStyles = "text-dark border-b-2 border-dark";
    const inactiveTabStyles = "text-gray-500 hover:text-dark";

    return (
        <div className="mt-12">
            <div className="border-b">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('description')} className={`${tabStyles} ${activeTab === 'description' ? activeTabStyles : inactiveTabStyles}`}>Description</button>
                    <button onClick={() => setActiveTab('details')} className={`${tabStyles} ${activeTab === 'details' ? activeTabStyles : inactiveTabStyles}`}>Product Details</button>
                </nav>
            </div>
            <div className="py-8 min-h-[150px]">
                {activeTab === 'description' && (
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                )}
                {activeTab === 'details' && (
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        {product.details.map((detail, index) => <li key={index}>{detail}</li>)}
                    </ul>
                )}
            </div>
        </div>
    );
};


export default function ProductDetailPage({ params }) {
    const product = getProductDetails(params.id);
    const [mainImage, setMainImage] = useState(product.images[0]);
    const [quantity, setQuantity] = useState(1);
    
    return (
        <>
            <Navbar />
            
            <main className="pt-20">
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-sm text-gray-500 mb-8">
                            <Link href="/" className="hover:text-primary">Home</Link> / <Link href="/shop" className="hover:text-primary">Shop</Link> / <span>{product.name}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                            
                            {/* Image Gallery - Reverted to your original design */}
                            <div className="lg:col-span-1">
                                <div className="mb-4 border">
                                    <Image src={mainImage} alt={product.name} width={800} height={1000} className="w-full h-auto object-cover" priority />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {product.images.map((img, index) => (
                                        <button key={index} onClick={() => setMainImage(img)} className={`border-2 ${mainImage === img ? 'border-dark' : 'border-transparent'}`}>
                                            <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} width={200} height={250} className="w-full h-auto object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Details & Actions */}
                            <div className="lg:col-span-2">
                                <h1 className="text-3xl md:text-4xl font-heading">{product.name}</h1>
                                <p className="text-3xl text-dark my-4">${product.price.toFixed(2)}</p>
                                <p className="text-gray-600 leading-relaxed max-w-xl">{product.shortDescription}</p>

                                <div className="mt-8 pt-8 border-t">
                                    {/* Redesigned Quantity Selector */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold uppercase mb-3">Quantity</h3>
                                        <div className="flex items-center w-fit border border-gray-300 rounded">
                                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-700 hover:bg-gray-100 transition-colors">
                                                <MinusIcon />
                                            </button>
                                            <input type="text" value={quantity} readOnly className="w-16 h-full text-center text-lg font-semibold border-x focus:outline-none" />
                                            <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-700 hover:bg-gray-100 transition-colors">
                                                <PlusIcon />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button className="w-full bg-dark border-2 border-zinc-800 text-zinc-800 uppercase py-3 px-6 hover:bg-zinc-800 hover:text-white transition-colors duration-300 rounded">
                                           Add to Cart
                                        </button>
                                        <button className="w-full bg-zinc-800 text-white uppercase py-3 px-6 border-2 border-zinc-800 hover:bg-white hover:text-zinc-800 transition-colors duration-300 rounded">
                                            Buy Now
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                                    <p>SKU: <span className="font-medium text-dark">{product.sku}</span></p>
                                    <p className="mt-1">Category: <Link href={`/shop?category=${product.category.toLowerCase()}`} className="font-medium text-dark hover:text-primary">{product.category}</Link></p>
                                </div>
                            </div>
                        </div>

                        {/* Simplified Info Section */}
                        <InfoTabs product={product} />
                    </div>
                </section>

                <section className="py-20 bg-light">
                    <div className="container mx-auto px-4">
                         <div className="flex justify-between items-center mb-10">
                            <h4 className="uppercase font-heading text-2xl">You May Also Like</h4>
                            <Link href="/shop" className="relative inline-block uppercase text-sm font-bold after:content-[''] after:block after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">
                                View All Products
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {relatedProducts.map(prod => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </>
    );
}