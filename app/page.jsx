import Image from 'next/image';
import Link from 'next/link';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NewArrivals from './components/NewArrivals';
import BestSellers from './components/BestSellers';
import InstagramSection from './components/InstagramSection'; // <-- IMPORT THE NEW COMPONENT

// --- Mock Data ---
const newArrivalsData = [
    { id: 1, name: 'Dark Florish Onepiece', price: '95.00', imageUrl: '/images/product-item-1.jpg', slug: 'dark-florish-onepiece' },
    { id: 2, name: 'Baggy Shirt', price: '55.00', imageUrl: '/images/product-item-2.jpg', slug: 'baggy-shirt' },
    { id: 3, name: 'Cotton Off-white Shirt', price: '65.00', imageUrl: '/images/product-item-3.jpg', slug: 'cotton-off-white-shirt' },
    { id: 4, name: 'Crop Sweater', price: '50.00', imageUrl: '/images/product-item-4.jpg', slug: 'crop-sweater' },
];

const bestSellersData = [
    { id: 6, name: 'Handmade Crop Sweater', price: '50.00', imageUrl: '/images/product-item-6.jpg', slug: 'handmade-crop-sweater-2' },
    { id: 7, name: 'Dark Florish Onepiece', price: '95.00', imageUrl: '/images/product-item-4.jpg', slug: 'dark-florish-onepiece-2' },
    { id: 8, name: 'Baggy Shirt', price: '55.00', imageUrl: '/images/product-item-3.jpg', slug: 'baggy-shirt-2' },
    { id: 9, name: 'Cotton Off-white Shirt', price: '65.00', imageUrl: '/images/product-item-5.jpg', slug: 'cotton-off-white-shirt-2' },
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

// --- Reusable Feature Component ---
const Feature = ({ iconId, title, description }) => (
    <div className="text-center py-5">
        <svg width="38" height="38" className="mx-auto"><use xlinkHref={`#${iconId}`}></use></svg>
        <h4 className="font-heading text-lg my-3 uppercase">{title}</h4>
        <p className="text-gray-600">{description}</p>
    </div>
);

// --- Main HomePage Component ---
export default function HomePage() {
    return (
        <>
            <Navbar />

            {/* Billboard Section */}
            <section id="billboard" className="bg-light py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-heading mt-4">New Collections</h1>
                        <p className="md:w-1/2 mx-auto mt-4 text-gray-600">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe voluptas ut dolorum consequuntur, adipisci repellat! Eveniet commodi voluptatem voluptate.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                        {newArrivalsData.map(product => (
                            <div key={product.id} className="group">
                                <div className="overflow-hidden">
                                    <Link href={`/product/${product.slug}`}>
                                        <Image src={product.imageUrl} alt={product.name} width={500} height={600} className="w-full h-auto transition-transform duration-500 group-hover:scale-105" />
                                    </Link>
                                </div>
                                <div className="py-4">
                                    <h5 className="uppercase font-heading"><Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">{product.name}</Link></h5>
                                    <p className="text-gray-500 text-sm mt-2">Scelerisque duis aliquam qui lorem ipsum dolor amet, consectetur adipiscing elit.</p>
                                    <Link href={`/product/${product.slug}`} className="relative inline-block mt-3 uppercase text-sm font-bold after:content-[''] after:block after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">Discover Now</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <Feature iconId="calendar" title="Book An Appointment" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                        <Feature iconId="shopping-bag" title="Pick up in store" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                        <Feature iconId="gift" title="Special packaging" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                        <Feature iconId="arrow-cycle" title="Free global returns" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[['men', '/images/cat-item1.jpg'], ['women', '/images/cat-item2.jpg'], ['accessories', '/images/cat-item3.jpg']].map(([category, image]) => (
                        <div key={category} className="relative group overflow-hidden">
                            <Image src={image} alt={`${category}'s Fashion`} width={600} height={800} className="w-full h-auto transform transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Link href={`/shop/${category}`} className="bg-white text-black uppercase font-bold py-3 px-8 hover:bg-dark hover:text-white transition-colors">Shop for {category}</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* USE THE NEW COMPONENTS */}
            <NewArrivals products={newArrivalsData} />
            <BestSellers products={bestSellersData} />

            {/* Collection Section */}
            <section className="bg-light relative py-20 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row bg-white shadow-lg">
                        <div className="md:w-1/2">
                            <Image src="/images/single-image-2.jpg" alt="collection" width={800} height={1000} className="w-full h-full object-cover" />
                        </div>
                        <div className="md:w-1/2 flex items-center">
                            <div className="p-8 md:p-16">
                                <h3 className="font-heading text-3xl uppercase">Classic winter collection</h3>
                                <p className="my-4 text-gray-600">Dignissim lacus, turpis ut suspendisse vel tellus. Turpis purus, gravida orci, fringilla a. Ac sed eu fringilla odio mi. Consequat pharetra at magna imperdiet cursus ac faucibus sit libero.</p>
                                <Link href="/shop/collection" className="bg-dark text-white uppercase py-3 px-8 inline-block hover:bg-gray-800 transition-colors">Shop Collection</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 text-gray-200 font-heading text-[12rem] leading-none select-none z-0 whitespace-nowrap">Collection</div>
            </section>

            {/* Blog Posts Section */}
            <section className="py-20 bg-light">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="uppercase font-heading text-2xl">Read Blog Posts</h4>
                        <Link href="/blog" className="relative inline-block mt-3 uppercase text-sm font-bold after:content-[''] after:block after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {blogPosts.map(post => (
                            <div key={post.id}>
                                <div className="overflow-hidden mb-4">
                                    <Link href={`/blog/${post.id}`}>
                                        <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full h-auto transform transition-transform duration-500 hover:scale-110" />
                                    </Link>
                                </div>
                                <div className="text-sm text-gray-500 uppercase">
                                    <span>{post.category} / </span>
                                    <span>{post.date}</span>
                                </div>
                                <h5 className="uppercase text-lg font-heading mt-2">
                                    <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">{post.title}</Link>
                                </h5>
                                <p className="text-gray-600 mt-2">{post.excerpt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Instagram Section */}
            <InstagramSection instagramImages={instagramImages} /> {/* <-- USE THE NEW COMPONENT */}

            <Footer />
        </>
    );
}