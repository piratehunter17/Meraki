// /app/page.jsx

import Image from 'next/image';
import Link from 'next/link';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NewArrivals from './components/NewArrivals';
import BestSellers from './components/BestSellers';
import InstagramSection from './components/InstagramSection';
import ReviewSection from './components/ReviewSection'; // Changed import name

// --- Mock Data ---
// Billboard section data
const newArrivalsData = [
    { id: 1, name: 'Dark Florish Onepiece', price: '95.00', imageUrl: '/images/product-item-1.jpg', slug: 'dark-florish-onepiece' },
    { id: 2, name: 'Baggy Shirt', price: '55.00', imageUrl: '/images/product-item-2.jpg', slug: 'baggy-shirt' },
    { id: 3, name: 'Cotton Off-white Shirt', price: '65.00', imageUrl: '/images/product-item-3.jpg', slug: 'cotton-off-white-shirt' },
    { id: 4, name: 'Crop Sweater', price: '50.00', imageUrl: '/images/product-item-4.jpg', slug: 'crop-sweater' },
];

// Data for the review section (still named blogPosts, adjust if needed)
const blogPosts = [
    { id: 1, category: 'Fashion', date: 'Jul 11, 2022', title: 'How to look outstanding in pastel', excerpt: 'Dignissim lacus,turpis ut suspendisse vel tellus.Turpis purus,gravida orci,fringilla...', imageUrl: '/images/post-image1.jpg' },
    { id: 2, category: 'Fashion', date: 'Jul 11, 2022', title: 'Top 10 fashion trend for summer', excerpt: 'Turpis purus, gravida orci, fringilla dignissim lacus, turpis ut suspendisse vel tellus...', imageUrl: '/images/post-image2.jpg' },
    { id: 3, category: 'Fashion', date: 'Jul 11, 2022', title: 'Crazy fashion with unique moment', excerpt: 'Turpis purus, gravida orci, fringilla dignissim lacus, turpis ut suspendisse vel tellus...', imageUrl: '/images/post-image3.jpg' },
];

// Instagram images data
const instagramImages = [
    '/images/insta-item1.jpg', '/images/insta-item2.jpg', '/images/insta-item3.jpg',
    '/images/insta-item4.jpg', '/images/insta-item5.jpg', '/images/insta-item6.jpg'
];

// --- Reusable Feature Component ---
const Feature = ({ iconId, title, description }) => (
    <div className="text-center py-5">
        <svg width="38" height="38" className="mx-auto text-gray-900 fill-current">
            <use xlinkHref={`#${iconId}`}></use>
        </svg>
        <h4 className="font-heading text-lg my-3 uppercase">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p> {/* Slightly smaller text */}
    </div>
);

// --- Main HomePage Component ---
export default function HomePage() {
    return (
        <>
            <Navbar />

            {/* Billboard Section */}
            {/* FIX: Increased pt-12 (3rem) to pt-24 (6rem) to prevent
              the fixed navbar from overlapping this section on mobile.
            */}
            <section id="billboard" className="bg-light pt-24 pb-16 md:py-20"> {/* Increased mobile top padding */}
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading mt-4">New Collections</h1> {/* Responsive font size */}
                        <p className="md:w-3/4 lg:w-1/2 mx-auto mt-4 text-gray-600 text-sm md:text-base"> {/* Responsive width/text size */}
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe voluptas ut dolorum consequuntur, adipisci repellat! Eveniet commodi voluptatem voluptate.
                        </p>
                    </div>
                    {/* Billboard Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12"> {/* Adjusted gap */}
                        {newArrivalsData.map(product => (
                            <div key={product.id} className="group">
                                <div className="overflow-hidden aspect-[3/4] mb-3"> {/* Added aspect ratio & margin */}
                                    <Link href={`/product/${product.slug}`}>
                                        <Image
                                          src={product.imageUrl}
                                          alt={product.name}
                                          width={500}
                                          height={667} // Match 3:4 ratio
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </Link>
                                </div>
                                <div className="py-2"> {/* Reduced padding */}
                                    <h5 className="uppercase text-sm md:text-base font-heading truncate"><Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">{product.name}</Link></h5>
                                    <p className="text-gray-500 text-xs md:text-sm mt-1">Scelerisque duis aliquam qui lorem ipsum dolor amet.</p> {/* Shortened text */}
                                    <Link href={`/product/${product.slug}`} className="relative inline-block mt-2 uppercase text-xs md:text-sm font-bold after:content-[''] after:block after:w-0 after:h-[1.5px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">Discover Now</Link> {/* Adjusted size/underline */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 md:py-16"> {/* Added padding */}
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"> {/* Adjusted gap */}
                        <Feature iconId="calendar" title="Book An Appointment" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                        <Feature iconId="shopping-bag" title="Pick up in store" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                        <Feature iconId="gift" title="Special packaging" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                        <Feature iconId="arrow-cycle" title="Free global returns" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="container mx-auto px-4 py-12 md:py-16"> {/* Added padding */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"> {/* Adjusted gap */}
                    {[['men', '/images/cat-item1.jpg'], ['women', '/images/cat-item2.jpg'], ['accessories', '/images/cat-item3.jpg']].map(([category, image]) => (
                        <div key={category} className="relative group overflow-hidden aspect-[3/4]"> {/* Added aspect ratio */}
                             <Image src={image} alt={`${category}'s Fashion`} fill className="object-cover transform transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw"/>
                            <div className="absolute inset-0 flex items-end justify-center p-6 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"> {/* Changed overlay */}
                                <Link href={`/shop/${category}`} className="bg-white text-black uppercase text-sm font-bold py-2.5 px-6 hover:bg-gray-800 hover:text-white transition-colors duration-300 rounded-sm mb-4">Shop {category}</Link> {/* Adjusted button */}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- NEW ARRIVALS & BEST SELLERS --- */}
            <NewArrivals />
            <BestSellers />

            {/* --- COLLECTION SECTION --- */}
            <section className="bg-light relative py-16 md:py-24 overflow-hidden"> {/* Adjusted padding */}
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row bg-white shadow-lg overflow-hidden"> {/* Added overflow */}
                        <div className="md:w-1/2 aspect-[4/5] md:aspect-auto"> {/* Added aspect ratio for mobile */}
                            <Image src="/images/single-image-2.jpg" alt="collection" width={800} height={1000} className="w-full h-full object-cover" />
                        </div>
                        <div className="md:w-1/2 flex items-center"> {/* Corrected md:w-1Two to md:w-1/2 */}
                            <div className="p-6 md:p-12 lg:p-16"> {/* Responsive padding */}
                                <h3 className="font-heading text-2xl md:text-3xl uppercase">Classic winter collection</h3>
                                <p className="my-4 text-gray-600 text-sm md:text-base leading-relaxed">Dignissim lacus, turpis ut suspendisse vel tellus. Turpis purus, gravida orci, fringilla a. Ac sed eu fringilla odio mi.</p> {/* Shortened text */}
                                <Link href="/shop/collection" className="bg-dark text-white uppercase text-sm py-2.5 px-6 inline-block hover:bg-gray-800 transition-colors duration-300 rounded-sm mt-2">Shop Collection</Link> {/* Adjusted button */}
                            </div>
                        </div>
                    </div>
                </div>
                 {/* Made background text smaller */}
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 text-gray-100 font-heading text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none select-none z-0 whitespace-nowrap opacity-50">Collection</div>
            </section>

            {/* --- REVIEW SECTION --- */}
            <ReviewSection blogPosts={blogPosts} />

            {/* Instagram Section */}
            <InstagramSection instagramImages={instagramImages} />

            <Footer />
        </>
    );
}