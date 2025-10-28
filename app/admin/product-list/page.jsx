// /app/admin/product-list/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '../../../lib/supabase/client'; // Adjust path if needed

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const supabase = createClient();

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('products')
                .select(`id, name, price, discount_price, stock_quantity, categories ( name ), product_images ( image_url )`)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching products:', fetchError);
                setError(fetchError.message);
                setProducts([]);
            } else if (data) {
                const formattedProducts = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.categories ? p.categories.name : 'N/A',
                    price: parseFloat(p.price),
                    discount_price: p.discount_price ? parseFloat(p.discount_price) : null,
                    quantity: p.stock_quantity,
                    imageUrl: p.product_images?.length > 0 ? p.product_images[0].image_url : '/images/placeholder.jpg',
                }));
                setProducts(formattedProducts);
            } else {
                 setProducts([]);
            }
            setLoading(false);
        };

        fetchProducts();
    }, [supabase]);

    // Handle product deletion
    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product? This may affect existing orders.')) {
            try {
                 const { error: imgError } = await supabase
                    .from('product_images')
                    .delete()
                    .eq('product_id', productId);
                 if (imgError) console.warn(`Could not delete product images: ${imgError.message}`);

                 const { error: prodError } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId);
                if (prodError) throw prodError;

                setProducts(products.filter(p => p.id !== productId));
                alert('Product deleted successfully.');

            } catch (err) {
                 alert(`Error deleting product: ${err.message}`);
                 console.error("Deletion error:", err);
            }
        }
    };

    // Handle navigation to the edit page
    const handleEdit = (productId) => {
        router.push(`/admin/edit-product/${productId}`);
    };

    if (loading) return <p className="p-4 md:p-8 text-center text-gray-500">Loading products...</p>;
    if (error) return <p className="p-4 md:p-8 text-center text-red-500">Error: {error}</p>;

    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading mb-6 text-dark">Product List</h2>
            {/* REMOVED overflow-x-auto */}
            <div>
                {products.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No products found. Add a product to get started.</p>
                ) : (
                    // REMOVED min-w-[*]
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-gray-100 text-[0.65rem] sm:text-xs uppercase text-gray-700">
                            <tr>
                                {/* Adjust padding */}
                                <th className="py-3 px-2 font-semibold">Image</th>
                                <th className="py-3 px-2 font-semibold">Name</th>
                                {/* HIDDEN Category on small screens */}
                                <th className="py-3 px-2 font-semibold hidden md:table-cell">Category</th>
                                <th className="py-3 px-2 font-semibold">Price</th>
                                {/* HIDDEN Stock on small screens */}
                                <th className="py-3 px-2 font-semibold hidden sm:table-cell">Stock</th>
                                <th className="py-3 px-2 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 align-top">
                                    <td className="py-2 px-2">
                                        <Image src={product.imageUrl} alt={product.name} width={40} height={53} className="rounded object-cover aspect-[3/4]" />
                                    </td>
                                    {/* Allow wrapping */}
                                    <td className="py-2 px-2 font-medium text-gray-900 break-words max-w-[120px] sm:max-w-xs">{product.name}</td>
                                    {/* HIDDEN Category */}
                                    <td className="py-2 px-2 text-gray-600 hidden md:table-cell">{product.category}</td>
                                    <td className="py-2 px-2 text-gray-600">
                                        {product.discount_price && product.discount_price < product.price ? (
                                            <div className="flex flex-col"> {/* Always stack */}
                                                <span className="font-semibold text-red-600">${product.discount_price.toFixed(2)}</span>
                                                <span className="line-through text-gray-400 text-[0.65rem]">${product.price.toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <span className="font-semibold">${product.price.toFixed(2)}</span>
                                        )}
                                    </td>
                                     {/* HIDDEN Stock */}
                                    <td className="py-2 px-2 text-gray-600 hidden sm:table-cell">{product.quantity}</td>
                                    <td className="py-2 px-2 text-center">
                                         {/* Stack actions vertically on small screens */}
                                        <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(product.id)} className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-[0.7rem] sm:text-xs">Edit</button>
                                            <button onClick={() => handleDelete(product.id)} className="font-medium text-red-600 hover:text-red-800 hover:underline text-[0.7rem] sm:text-xs">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductListPage;