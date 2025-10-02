import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

// --- Mock Data for the Shop Page ---
const shopProducts = [
    { id: 1, name: 'Dark Florish Onepiece', price: '95.00', imageUrl: '/images/product-item-1.jpg', slug: 'dark-florish-onepiece' },
    { id: 2, name: 'Baggy Shirt', price: '55.00', imageUrl: '/images/product-item-2.jpg', slug: 'baggy-shirt' },
    { id: 3, name: 'Cotton Off-white Shirt', price: '65.00', imageUrl: '/images/product-item-3.jpg', slug: 'cotton-off-white-shirt' },
    { id: 4, name: 'Crop Sweater', price: '50.00', imageUrl: '/images/product-item-4.jpg', slug: 'crop-sweater' },
    { id: 5, name: 'Handmade Crop Sweater', price: '70.00', imageUrl: '/images/product-item-10.jpg', slug: 'handmade-crop-sweater' },
    { id: 6, name: 'Another Sweater', price: '75.00', imageUrl: '/images/product-item-6.jpg', slug: 'another-sweater' },
    { id: 7, name: 'Classic Denim', price: '110.00', imageUrl: '/images/product-item-7.jpg', slug: 'classic-denim' },
    { id: 8, name: 'Floral Dress', price: '120.00', imageUrl: '/images/product-item-8.jpg', slug: 'floral-dress' },
    { id: 9, name: 'Beige Handbag', price: '85.00', imageUrl: '/images/product-item-9.jpg', slug: 'beige-handbag' },
];

// --- Sub-components for the Sidebar ---
const FilterGroup = ({ title, children }) => (
    <div className="py-6 border-b">
        <h3 className="font-heading uppercase mb-4">{title}</h3>
        {children}
    </div>
);

const CategoryFilter = () => (
    <ul className="space-y-2">
        <li><Link href="#" className="hover:text-primary transition-colors">Dresses</Link></li>
        <li><Link href="#" className="hover:text-primary transition-colors">Jackets</Link></li>
        <li><Link href="#" className="hover:text-primary transition-colors">Handbags</Link></li>
        <li><Link href="#" className="hover:text-primary transition-colors">Accessories</Link></li>
        <li><Link href="#" className="hover:text-primary transition-colors">T-shirts</Link></li>
    </ul>
);

const PriceFilter = () => (
    <div className="flex items-center space-x-2">
        <input type="number" placeholder="$ Min" className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary" />
        <span>-</span>
        <input type="number" placeholder="$ Max" className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary" />
    </div>
);

const SizeFilter = () => (
    <div className="flex flex-wrap gap-2">
        {['S', 'M', 'L', 'XL'].map(size => (
            <button key={size} className="w-10 h-10 border rounded-md hover:border-dark focus:border-dark focus:ring-1 focus:ring-dark transition-colors">{size}</button>
        ))}
    </div>
);

// --- Main Shop Page Component ---
const ShopPage = () => {
    return (
        <>
            <Navbar />

            {/* Main content wrapper with padding-top to offset the fixed navbar */}
            <main className="pt-10"> 
        

                {/* Shop Content */}
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            
                            {/* Sidebar */}
                            <aside className="lg:col-span-1">
                                <FilterGroup title="Product Categories">
                                    <CategoryFilter />
                                </FilterGroup>
                                <FilterGroup title="Filter by Price">
                                    <PriceFilter />
                                </FilterGroup>
                                <FilterGroup title="Filter by Size">
                                    <SizeFilter />
                                </FilterGroup>
                            </aside>

                            {/* Main Product Grid */}
                            <div className="lg:col-span-3">
                                {/* Toolbar */}
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                                    <p className="text-gray-600 mb-4 sm:mb-0">Showing 1–9 of {shopProducts.length} results</p>
                                    <select className="border p-2 rounded-md focus:ring-primary focus:border-primary">
                                        <option>Default sorting</option>
                                        <option>Sort by popularity</option>
                                        <option>Sort by price: low to high</option>
                                        <option>Sort by price: high to low</option>
                                    </select>
                                </div>

                                {/* Product Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    {shopProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-center mt-12">
                                    <nav className="flex items-center space-x-2">
                                        <span className="px-4 py-2 border rounded-md bg-dark text-white">1</span>
                                        <Link href="#" className="px-4 py-2 border rounded-md hover:bg-light transition-colors">2</Link>
                                        <Link href="#" className="px-4 py-2 border rounded-md hover:bg-light transition-colors">3</Link>
                                        <Link href="#" className="px-4 py-2 border rounded-md hover:bg-light transition-colors">→ </Link>
                                    </nav>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default ShopPage;