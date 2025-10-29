// /app/components/admin/ManageCategoriesModal.jsx
'use client';

import { useState } from 'react';
import Modal from '../Modal'; // Adjust path if needed

export default function ManageCategoriesModal({ 
    isOpen, 
    onClose, 
    categories, 
    onAddCategory, 
    onDeleteCategory 
}) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAdd = async () => {
        if (!newCategoryName.trim()) return;
        setLoading(true);
        setError('');
        const success = await onAddCategory(newCategoryName);
        if (success) {
            setNewCategoryName(''); // Clear input on success
        } else {
            setError('Failed to add category. It might already exist.');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This cannot be undone.')) { // Stronger confirmation
            setLoading(true);
            const success = await onDeleteCategory(id); // Assume onDeleteCategory returns boolean success
             if (!success) {
                 setError('Failed to delete category. Check if products are using it.'); // Provide more context on failure
             }
            setLoading(false);
        }
    };

    // Close modal and reset state
    const handleClose = () => {
        setNewCategoryName('');
        setError('');
        setLoading(false);
        onClose();
    }

    return (
        // Assuming your base Modal component handles centering and overlay
        <Modal isOpen={isOpen} onClose={handleClose}> 
             {/* Added responsive width and padding to the modal content */}
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto"> 
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold font-heading text-gray-800">Manage Categories</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {/* List of Existing Categories with max height */}
                <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-6 pr-2 border rounded p-3 bg-gray-50"> {/* Added max-height, border, padding */}
                     {categories.length > 0 ? categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                            <span className="text-gray-700">{cat.name}</span>
                            <button 
                                onClick={() => handleDelete(cat.id)}
                                disabled={loading}
                                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 font-medium flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete
                            </button>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500 text-center py-4">No categories added yet.</p>
                    )}
                </div>

                {/* Form to Add New Category */}
                <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Add New Category</h3>
                    <div className="flex flex-col sm:flex-row gap-2"> {/* Stack on small screens */}
                        <input 
                            type="text" 
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name..."
                            className="flex-grow p-2 border rounded-md focus:ring-primary focus:border-primary" // Added focus styles
                        />
                        <button 
                            onClick={handleAdd}
                            disabled={loading || !newCategoryName.trim()} // Disable if empty
                            className="bg-zinc-800 text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" // Added disabled cursor
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                 {/* Optional: Close button at the bottom */}
                 <div className="mt-6 text-right">
                      <button 
                          onClick={handleClose} 
                          className="text-gray-600 hover:text-zinc-800 font-medium py-2 px-4 rounded"
                      >
                         Close
                      </button>
                 </div>
            </div>
        </Modal>
    );
}

// NOTE: Ensure your base Modal component (/app/components/Modal.jsx) is also responsive. 
// It should typically include classes like:
// `fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4` on the outer div
// And handle the background overlay.