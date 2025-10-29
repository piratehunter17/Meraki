// /app/page.jsx

import Image from 'next/image';
import Link from 'next/link';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NewArrivals from './components/NewArrivals';
import BestSellers from './components/BestSellers';
import InstagramSection from './components/InstagramSection';
import ReviewSection from './components/ReviewSection';
import FeaturesSection from './components/FeaturesSection';
import BillboardSection from './components/BillboardSection'; // <-- 1. IMPORT

// --- Mock Data (Unchanged) ---
const newArrivalsData = [
    { id: 1, name: 'Dark Florish Onepiece', price: '95.00', imageUrl: '/images/product-item-1.jpg', slug: 'dark-florish-onepiece' },
    { id: 2, name: 'Baggy Shirt', price: '55.00', imageUrl: '/images/product-item-2.jpg', slug: 'baggy-shirt' },
    { id: 3, name: 'Cotton Off-white Shirt', price: '65.00', imageUrl: '/images/product-item-3.jpg', slug: 'cotton-off-white-shirt' },
    { id: 4, name: 'Crop Sweater', price: '50.00', imageUrl: '/images/product-item-4.jpg', slug: 'crop-sweater' },
];
const blogPosts = [
    { id: 1, category: 'Fashion', date: 'Jul 11, 2022', title: 'How to look outstanding in pastel', excerpt: 'Dignissim lacus,turpis ut suspendisse vel tellus.Turpis purus,gravida orci,fringilla...', imageUrl: '/images/post-image1.jpg' },
    { id: 2, category: 'Fashion', date: 'Jul 11, 2022', title: 'Top 10 fashion trend for summer', excerpt: 'Turpis purus, gravida orci, fringilla dignissim lacus, turpis ut suspendisse vel tellus...', imageUrl: '/images/post-image2.jpg' },
    { id: 3, category: 'Fashion', date: 'Jul 11, 2022', title: 'Crazy fashion with unique moment', excerpt: 'Turpis purus, gravida orci, fringilla dignissim lacus, turpis ut suspendisse vel tellus...', imageUrl: '/images/post-image3.jpg' },
];
const instagramImages = [
    '/images/insta-item1.jpg', '/images/insta-item2.jpg', '/images/insta-item3.jpg',
    '/images/insta-item4.jpg', '/images/insta-item5.jpg', '/images/insta-item6.jpg'
];

// --- Main HomePage Component ---
export default function HomePage() {
    return (
        <>
            <Navbar />

            {/* --- 2. USE the new BillboardSection component --- */}
            <BillboardSection newArrivalsData={newArrivalsData} />

            {/* --- Features Section --- */}
            <FeaturesSection />

            {/* Categories Section (Unchanged) */}
            <section className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {[['men', '/images/cat-item1.jpg'], ['women', '/images/cat-item2.jpg'], ['accessories', '/images/cat-item3.jpg']].map(([category, image]) => (
                        <div key={category} className="relative group overflow-hidden aspect-[3/4]">
                             <Image src={image} alt={`${category}'s Fashion`} fill className="object-cover transform transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw"/>
                            <div className="absolute inset-0 flex items-end justify-center p-6 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Link href={`/shop/${category}`} className="bg-white text-black uppercase text-sm font-bold py-2.5 px-6 hover:bg-gray-800 hover:text-white transition-colors duration-300 rounded-sm mb-4">Shop {category}</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- NEW ARRIVALS & BEST SELLERS (Unchanged) --- */}
            <NewArrivals />
            <BestSellers />

            {/* --- COLLECTION SECTION (Unchanged) --- */}
            <section className="bg-light relative py-16 md:py-24 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row bg-white shadow-lg overflow-hidden">
                        <div className="md:w-1/2 aspect-[4/5] md:aspect-auto">
                            <Image src="/images/single-image-2.jpg" alt="collection" width={800} height={1000} className="w-full h-full object-cover" />
                        </div>
                        <div className="md:w-1/2 flex items-center">
                            <div className="p-6 md:p-12 lg:p-16">
                                <h3 className="font-heading text-2xl md:text-3xl uppercase">Classic winter collection</h3>
                                <p className="my-4 text-gray-600 text-sm md:text-base leading-relaxed">Dignissim lacus, turpis ut suspendisse vel tellus. Turpis purus, gravida orci, fringilla a. Ac sed eu fringilla odio mi.</p>
                                <Link href="/shop/collection" className="bg-dark text-white uppercase text-sm py-2.5 px-6 inline-block hover:bg-gray-800 transition-colors duration-300 rounded-sm mt-2">Shop Collection</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 text-gray-100 font-heading text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none select-none z-0 whitespace-nowrap opacity-50">Collection</div>
            </section>

            {/* --- REVIEW SECTION (Unchanged) --- */}
            <ReviewSection blogPosts={blogPosts} />

            {/* Instagram Section (Unchanged) */}
            <InstagramSection instagramImages={instagramImages} />

            <Footer />
        </>
    );
}