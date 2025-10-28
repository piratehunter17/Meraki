// /app/admin/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { createClient } from '../../lib/supabase/client';
import ManageCategoriesModal from '../components/admin/ManageCategoriesModal';

const AddProductPage = () => {
    // State for all form fields
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [imageFiles, setImageFiles] = useState([]);

    // State for categories fetched from DB
    const [categories, setCategories] = useState([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    const supabase = createClient();

    // Reusable function to fetch categories
    const fetchCategories = useCallback(async () => { // Wrapped in useCallback
        const { data, error } = await supabase.from('categories').select('id, name').order('name');
        if (!error && data) {
            setCategories(data);
        } else if(error) {
             console.error("Error fetching categories:", error);
             // Optionally set an error message for the user
        }
    }, [supabase]); // Dependency added

    // Fetch categories on initial load
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]); // Use useCallback dependency


    // Functions to manage categories
    const handleAddCategory = async (categoryName) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .insert({ name: categoryName })
            .select()
            .single();
        setLoading(false);
        if (error) {
            console.error("Error adding category:", error);
            return false; // Indicate failure
        }
        if (data) {
            fetchCategories(); // Refresh categories list
            return true; // Indicate success
        }
        return false;
     };

    const handleDeleteCategory = async (idToDelete) => {
         setLoading(true);
         const { error } = await supabase.from('categories').delete().eq('id', idToDelete);
         setLoading(false);
         if (error) {
             console.error("Error deleting category:", error);
             alert("Error deleting category. It might be in use by products.");
             return false; // Indicate failure
         }
         fetchCategories(); // Refresh list
         if (categoryId === idToDelete.toString()) { // Check if deleted category was selected
            setCategoryId(''); // Reset selected category if it was deleted
         }
         return true; // Indicate success
    };

    // Helper function to create a base URL-friendly slug
    const createSlug = (text) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Handler for file input changes
    const handleFileChange = (e) => setImageFiles(Array.from(e.target.files));

    // Smart function to ensure the slug is unique
    const generateUniqueSlug = async (baseSlug) => {
        let uniqueSlug = baseSlug;
        let counter = 2;
        let exists = true;

        while (exists) {
            const { data, error } = await supabase.from('products').select('slug').eq('slug', uniqueSlug).maybeSingle(); // Use maybeSingle

            if (error && error.code !== 'PGRST116') { // Ignore "No rows found"
                console.error("Error checking slug uniqueness:", error);
                throw error; // Rethrow unexpected errors
            }

            if (data) { // Slug exists, try the next one
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            } else { // Slug doesn't exist, we found a unique one
                exists = false;
            }
        }
        return uniqueSlug;
    };


    // Handle the main form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (imageFiles.length === 0) {
            setMessage('Please select at least one image.');
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            // Step 1: Upload images
            const formData = new FormData();
            imageFiles.forEach(file => { formData.append('images', file); });
            const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error(uploadData.error || 'Image upload failed');
            }
            const uploadedImageDetails = uploadData.images;

            // Step 2: Generate a unique slug
            const baseSlug = createSlug(name);
            const finalSlug = await generateUniqueSlug(baseSlug);

            // Step 3: Insert product data
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert({ name, category_id: categoryId, description, price, discount_price: discountPrice || null, stock_quantity: quantity, slug: finalSlug })
                .select()
                .single();

            if (productError) throw productError;


            // Step 4: Insert image data
            if (productData) {
                const imageObjects = uploadedImageDetails.map(imgDetail => ({
                    product_id: productData.id,
                    image_url: imgDetail.secure_url,
                    cloudinary_public_id: imgDetail.public_id
                }));
                const { error: imageError } = await supabase.from('product_images').insert(imageObjects);
                if (imageError) {
                    // Log error but consider product partially created
                    console.error(`Product created (ID: ${productData.id}), but failed to add images: ${imageError.message}`);
                    setMessage(`Product created, but failed to add images: ${imageError.message}`);
                } else {
                    setMessage('Product added successfully!');
                    // Reset form fields
                    e.target.reset(); // More reliable form reset
                    setName(''); setCategoryId(''); setDescription(''); setPrice('');
                    setDiscountPrice(''); setQuantity(''); setImageFiles([]);
                     // Clear file input visually (requires manipulation or a key change on the input)
                     const fileInput = e.target.querySelector('input[type="file"]');
                     if (fileInput) fileInput.value = '';
                }
            } else {
                 throw new Error("Product data insertion returned no data."); // Should not happen with .single() unless error
            }
        } catch (err) {
            setMessage(`An error occurred: ${err.message}`);
            console.error('Error in handleSubmit:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Added max-w-full lg:max-w-4xl for responsiveness */}
            <div className="max-w-full lg:max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
                <h2 className="text-2xl md:text-3xl font-heading mb-6 text-dark">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Grid stacks on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input type="text" id="productName" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <button type="button" onClick={() => setCategoryModalOpen(true)} className="text-sm text-primary hover:underline focus:outline-none">Manage</button>
                            </div>
                            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                                <option value="" disabled>Select a category...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"></textarea>
                    </div>
                    {/* Grid stacks on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">Discount Price ($) <span className="text-gray-400">(Optional)</span></label>
                            <input type="number" id="discountPrice" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} min="0" step="0.01" className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="0" step="1" className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Product Images</h3>
                        <p className="text-sm text-gray-500 mb-2">Select one or more images. The first image will be the main display image.</p>
                        {/* Improved file input styling */}
                        <label htmlFor="productImages" className="block w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                            <span className="block text-sm font-medium text-gray-600">
                                {imageFiles.length === 0 ? 'Click to upload images' : `${imageFiles.length} image(s) selected`}
                            </span>
                            <input id="productImages" name="productImages" type="file" multiple onChange={handleFileChange} accept="image/*" className="sr-only" />
                        </label>
                        {/* Image Preview (Optional but helpful) */}
                        {imageFiles.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {imageFiles.map((file, index) => (
                                    <div key={index} className="relative aspect-square border rounded">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            className="object-cover rounded"
                                            onLoad={() => URL.revokeObjectURL(file)} // Clean up object URLs
                                         />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t"> {/* Stack button/message on small screens */}
                        {message && <p className={`text-sm ${message.includes('Error') || message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Adding...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
            <ManageCategoriesModal
                isOpen={isCategoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
             />
        </>
    );
};

export default AddProductPage;