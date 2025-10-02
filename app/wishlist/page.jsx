import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar'; // Import Navbar
import Footer from '../components/Footer';   // Import Footer

// A reusable card component specifically for the Wishlist page
const WishlistProductCard = ({ item }) => {
    return (
        <div className="product-item group relative text-center">
            <div className="image-holder overflow-hidden">
                <Link href={`/product/${item.slug}`}>
                    <Image
                        src={item.image}
                        alt={item.name}
                        width={300}
                        height={400}
                        className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                </Link>
                {/* Remove Button for Wishlist */}
                <button className="absolute top-3 right-3 bg-white p-2 rounded-full text-gray-500 hover:text-red-500 transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div className="product-content py-4">
                <h5 className="text-lg font-heading uppercase">
                    <Link href={`/product/${item.slug}`} className="hover:text-primary transition-colors">{item.name}</Link>
                </h5>
                <p className="text-gray-500 mt-1">${item.price.toFixed(2)}</p>
                <div className="mt-4">
                    <button className="bg-dark text-white uppercase py-2 px-6 hover:bg-black hover:text-white transition-all duration-300">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const WishlistPage = () => {
    // Dummy data - replace with your actual wishlist state
    const wishlistItems = [
        {
            id: 1,
            name: 'Handmade Crop Sweater',
            price: 50.00,
            image: '/images/product-item-6.jpg',
            slug: 'handmade-crop-sweater',
        },
        {
            id: 2,
            name: 'Baggy Shirt',
            price: 55.00,
            image: '/images/product-item-2.jpg',
            slug: 'baggy-shirt',
        },
        {
            id: 3,
            name: 'Dark Florish Onepiece',
            price: 95.00,
            image: '/images/product-item-1.jpg',
            slug: 'dark-florish-onepiece',
        },
    ];

    return (
        <>
            <Navbar />
            
            <section className="py-12 md:py-24 bg-light">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-heading text-center mb-10">My Wishlist</h2>
                    
                    {wishlistItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {/* Use the new reusable component */}
                            {wishlistItems.map((item) => (
                                <WishlistProductCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-lg text-gray-600 mb-4">Your wishlist is currently empty.</p>
                            <Link href="/shop">
                                <button className="bg-primary text-white uppercase font-bold py-3 px-8 hover:bg-opacity-90 transition-colors">
                                    Continue Shopping
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
            
            <Footer />
        </>
    );
};

export default WishlistPage;