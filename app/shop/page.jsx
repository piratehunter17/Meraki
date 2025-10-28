// /app/shop/page.jsx
'use client';

import { useState, useEffect, useCallback, Fragment } from 'react'; // Added Fragment
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Listbox, Transition } from '@headlessui/react'; // <-- IMPORTED
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'; // <-- IMPORTED

// --- Filter components (Unchanged) ---
const FilterGroup = ({ title, children }) => (
    <div className="py-6 border-b">
        <h3 className="font-heading uppercase mb-4">{title}</h3>
        {children}
    </div>
);

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => (
    <ul className="space-y-2">
        <li>
            <button onClick={() => onSelectCategory(null)} className={`hover:text-primary transition-colors w-full text-left ${!selectedCategory ? 'font-bold text-primary' : ''}`}>
                All Categories
            </button>
        </li>
        {categories.map(cat => (
            <li key={cat.id}>
                <button onClick={() => onSelectCategory(cat.id)} className={`hover:text-primary transition-colors w-full text-left ${selectedCategory === cat.id ? 'font-bold text-primary' : ''}`}>
                    {cat.name}
                </button>
            </li>
        ))}
    </ul>
);

const PriceFilter = ({ minPrice, setMinPrice, maxPrice, setMaxPrice, onApply }) => (
    <div className="space-y-4">
        <div className="flex items-center space-x-2">
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$ Min" className="w-full p-2 border rounded-md" />
            <span>-</span>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="$ Max" className="w-full p-2 border rounded-md" />
        </div>
        {/* Changed button color to match cart page */}
        <button onClick={onApply} className="w-full bg-zinc-800 text-white py-2 rounded-md hover:bg-zinc-700 transition-colors">Apply</button>
    </div>
);

const PAGE_SIZE = 9; // Number of products per page

// --- Sorting Options ---
const sortOptions = [
    { value: 'created_at.desc', label: 'Sort by latest' },
    { value: 'price.asc', label: 'Sort by price: low to high' },
    { value: 'price.desc', label: 'Sort by price: high to low' },
];


// --- Main Shop Page Component ---
const ShopPage = () => {
    // Data states
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productCount, setProductCount] = useState(0);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    // --- STATE CHANGE --- Use the object for Listbox state
    const [sortBy, setSortBy] = useState(sortOptions[0]); // Default to first option object
    const [currentPage, setCurrentPage] = useState(1);

    const supabase = createClient();

    // Fetch categories
    useEffect(() => {
        const getCategories = async () => {
             const { data } = await supabase.from('categories').select('id, name');
             if (data) setCategories(data);
        };
        getCategories();
    }, [supabase]); // Added supabase dependency


    // --- UPDATED: Fetch Products Logic ---
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous errors

        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
            .from('products')
            // --- FIX: Removed comment from select string ---
            .select(`
                id, name, price, discount_price, slug,
                stock_quantity,
                product_images ( image_url )
            `, { count: 'exact' });

        // Apply filters
        if (selectedCategory) query = query.eq('category_id', selectedCategory);
        // Ensure price filters handle potential empty strings or invalid numbers
        const minP = parseFloat(minPrice);
        const maxP = parseFloat(maxPrice);
        if (!isNaN(minP)) query = query.gte('price', minP);
        if (!isNaN(maxP)) query = query.lte('price', maxP);

        // Apply sorting --- LOGIC CHANGE: Get value from sortBy object ---
        const [sortField, sortOrder] = sortBy.value.split('.');
        if (sortField) {
            query = query.order(sortField, { ascending: sortOrder === 'asc' });
        }

        query = query.range(from, to);

        const { data, error: queryError, count } = await query;

        if (queryError) {
            console.error('Error fetching products:', queryError);
            setError(queryError.message);
            setProducts([]); // Clear products on error
            setProductCount(0);
        } else {
            const formattedProducts = data.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                discount_price: p.discount_price,
                slug: p.slug,
                stock_quantity: p.stock_quantity, // <-- stock_quantity mapping
                imageUrl: p.product_images?.length > 0 ? p.product_images[0].image_url : '/images/placeholder.jpg', // Added optional chaining
            }));
            setProducts(formattedProducts);
            setProductCount(count ?? 0); // Handle potential null count
        }
        setLoading(false);
    // Include supabase in dependency array
    }, [currentPage, selectedCategory, minPrice, maxPrice, sortBy, supabase]);

    // Trigger fetch when dependencies change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, minPrice, maxPrice, sortBy]);


    const totalPages = Math.ceil(productCount / PAGE_SIZE);

    // --- Handler for category filter ---
    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        // fetchProducts will be triggered by useEffect
    };

    // --- Handler for price filter apply ---
    // (This is called directly by the PriceFilter button's onClick)
    // No specific handler needed here as fetchProducts is passed directly

    return (
        <>
            <Navbar />
            {/* Added top padding like other pages */}
            <main className="pt-24 md:pt-20"> {/* Increased mobile padding */}
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                            <aside className="lg:col-span-1">
                                <FilterGroup title="Product Categories">
                                    <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
                                </FilterGroup>
                                <FilterGroup title="Filter by Price">
                                     {/* Pass fetchProducts directly as onApply */}
                                    <PriceFilter minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} onApply={fetchProducts} />
                                </FilterGroup>
                            </aside>

                            <div className="lg:col-span-3">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                                    <p className="text-gray-600 text-sm sm:text-base">Showing {products.length} of {productCount} results</p>

                                    {/* --- SORTING LISTBOX --- */}
                                    <div className="w-full sm:w-64 z-10"> {/* Added z-index */}
                                        <Listbox value={sortBy} onChange={setSortBy}>
                                            <div className="relative">
                                                <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white p-2.5 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                                    <span className="block truncate">{sortBy.label}</span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                    </span>
                                                </Listbox.Button>
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {sortOptions.map((option) => (
                                                            <Listbox.Option
                                                                key={option.value}
                                                                className={({ active }) =>
                                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active ? 'bg-gray-100 text-primary' : 'text-gray-900' // Use same hover as cart
                                                                    }`
                                                                }
                                                                value={option}
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? 'font-medium text-primary' : 'font-normal'}`}>
                                                                            {option.label}
                                                                        </span>
                                                                        {selected ? (
                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                    </div>
                                </div>

                                {/* --- Product Grid --- */}
                                {loading ? <p className="text-center py-10">Loading products...</p> : (
                                    error ? <p className="text-center py-10 text-red-500">Error: {error}</p> : (
                                        products.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                                                {products.map(product => (
                                                    // Pass the full product object including stock_quantity
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                            </div>
                                        ) : (
                                             <p className="text-center py-10 text-gray-500">No products found matching your criteria.</p>
                                        )
                                    )
                                )}


                                {/* --- Pagination --- */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-12">
                                        <nav className="flex items-center space-x-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    disabled={loading} // Disable while loading
                                                    className={`px-4 py-2 border rounded-md transition-colors ${currentPage === page ? 'bg-zinc-800 text-white' : 'hover:bg-gray-100 disabled:opacity-50'}`} // Style disabled state
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                )}
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