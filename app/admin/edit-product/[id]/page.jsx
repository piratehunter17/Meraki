// /app/admin/edit-product/[id]/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '../../../../lib/supabase/client';
import ManageCategoriesModal from '../../../components/admin/ManageCategoriesModal';

const EditProductPage = () => {
    const params = useParams();
    const productId = params.id;
    const router = useRouter();

    // Form fields
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [slug, setSlug] = useState('');

    // Image management
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    // Categories
    const [categories, setCategories] = useState([]);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    const supabase = createClient();

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        const { data, error } = await supabase.from('categories').select('id, name').order('name');
        if (!error && data) setCategories(data);
        else if (error) console.error("Error fetching categories:", error);
    }, [supabase]);

    // Fetch the specific product's data
    const fetchProductData = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(*), product_images(id, image_url, cloudinary_public_id)')
            .eq('id', productId)
            .single();

        if (error || !data) {
            setMessage('Error: Could not fetch product data.');
            console.error(error);
        } else {
            setName(data.name);
            setCategoryId(data.category_id);
            setDescription(data.description || '');
            setPrice(data.price);
            setDiscountPrice(data.discount_price || '');
            setQuantity(data.stock_quantity);
            setSlug(data.slug);
            setExistingImages(data.product_images || []);
            setMessage('');
        }
        setLoading(false);
    }, [productId, supabase]);

    // Initial data fetch
    useEffect(() => {
        fetchCategories();
        fetchProductData();
    }, [fetchCategories, fetchProductData]);
    
    // Effect to manage new image preview URLs and cleanup
    useEffect(() => {
        if (newImageFiles.length === 0) {
            setNewImagePreviews([]);
            return;
        }
        const objectUrls = newImageFiles.map(file => URL.createObjectURL(file));
        setNewImagePreviews(objectUrls);

        // Cleanup function
        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newImageFiles]);

    // --- Category Management Functions (Completed) ---
    
    const handleAddCategory = async (categoryName) => {
        const { data, error } = await supabase
            .from('categories')
            .insert({ name: categoryName })
            .select()
            .single();
        if (error) {
            console.error("Error adding category:", error);
            return false;
        }
        if (data) {
            fetchCategories();
            return true;
        }
        return false;
     };

    const handleDeleteCategory = async (idToDelete) => {
         const { error } = await supabase.from('categories').delete().eq('id', idToDelete);
         if (error) {
             console.error("Error deleting category:", error);
             alert("Error deleting category. It might be in use by products.");
             return false;
         }
         fetchCategories();
         if (categoryId === idToDelete.toString()) {
             setCategoryId('');
         }
         return true;
     };

    // --- Image Handlers ---

    const handleFileChange = (e) => setNewImageFiles(Array.from(e.target.files));
    
    const markImageForDeletion = (dbId, cloudinaryPublicId) => {
        setImagesToDelete([...imagesToDelete, { db_id: dbId, cloudinary_public_id: cloudinaryPublicId }]);
        setExistingImages(existingImages.filter(img => img.id !== dbId));
    };

    // --- Main Form Submission ---
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            let newUploadedImageDetails = [];
            
            // 1. If there are new files, upload them
            if (newImageFiles.length > 0) {
                const formData = new FormData();
                newImageFiles.forEach(file => formData.append('images', file));

                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    setMessage(`New image upload failed: ${uploadData.error || 'Unknown error'}`);
                    setLoading(false);
                    return;
                }
                newUploadedImageDetails = uploadData.images;
            }

            // 2. Delete images marked for deletion
            const deletePromises = imagesToDelete.map(async (imgToDelete) => {
                try {
                    if (imgToDelete.cloudinary_public_id) {
                        await fetch('/api/upload', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ publicId: imgToDelete.cloudinary_public_id }),
                        });
                    }
                } catch (e) {
                    console.error("Failed to delete from Cloudinary:", e);
                }
                return supabase.from('product_images').delete().eq('id', imgToDelete.db_id);
            });
            
            await Promise.all(deletePromises);
            
            // 3. Update product data
            const { error: productError } = await supabase
                .from('products')
                .update({ 
                    name, 
                    category_id: categoryId, 
                    description, 
                    price, 
                    discount_price: discountPrice || null, 
                    stock_quantity: quantity 
                })
                .eq('id', productId);

            if (productError) {
                setMessage(`Error updating product details: ${productError.message}`);
                setLoading(false);
                return;
            }
            
            // 4. Insert new image URLs
            if (newUploadedImageDetails.length > 0) {
                const newImageObjects = newUploadedImageDetails.map(imgDetail => ({ 
                    product_id: productId, 
                    image_url: imgDetail.secure_url,
                    cloudinary_public_id: imgDetail.public_id
                }));
                
                const { error: newImagesError } = await supabase.from('product_images').insert(newImageObjects);
                if (newImagesError) {
                    setMessage('Product details updated, but failed to save new images.');
                    setLoading(false);
                    return;
                }
            }

            setMessage('Product updated successfully!');
            setNewImageFiles([]);
            setImagesToDelete([]);
            
            setTimeout(() => {
                router.push('/admin/product-list'); 
            }, 1500);

        } catch (e) {
            setMessage('A critical error occurred. Check the console.');
            console.error('CRITICAL ERROR in EditProductPage handleSubmit:', e);
        } finally {
            setLoading(false); 
        }
    };

    if (loading && !name) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-lg text-gray-500">Loading product details...</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
                <h2 className="text-2xl md:text-3xl font-heading mb-6 text-dark">Edit Product</h2>
                <p className="mb-4 text-sm text-gray-500">Editing: <strong className="text-gray-700">{name}</strong> (Slug: {slug})</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
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
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Existing Images</h3>
                        {existingImages.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {existingImages.map(img => (
                                    <div key={img.id} className="relative aspect-square border border-gray-200 rounded-md overflow-hidden">
                                        <Image 
                                            src={img.image_url} 
                                            alt="Existing product image" 
                                            fill 
                                            className="object-cover"
                                            sizes="(max-width: 640px) 30vw, (max-width: 768px) 22vw, 18vw"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => markImageForDeletion(img.id, img.cloudinary_public_id)} 
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-transform hover:scale-110"
                                            aria-label="Delete image"
                                        >&times;</button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">No existing images.</p>}
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Add New Images</h3>
                        <label htmlFor="productImages" className="block w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                            <span className="block text-sm font-medium text-gray-600">
                                {newImageFiles.length === 0 ? 'Click to upload new images' : `${newImageFiles.length} new image(s) selected`}
                            </span>
                            <input id="productImages" name="productImages" type="file" multiple onChange={handleFileChange} accept="image/*" className="sr-only" />
                        </label>
                        
                        {newImagePreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {newImagePreviews.map((src, index) => (
                                    <div key={index} className="relative aspect-square border rounded-md overflow-hidden">
                                        <Image
                                            src={src}
                                            alt={`New preview ${index + 1}`}
                                            fill
                                            className="object-cover rounded"
                                       />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t">
                        {message && <p className={`text-sm ${message.includes('Error') || message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Saving...' : 'Save Changes'}
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

export default EditProductPage;