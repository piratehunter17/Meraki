// /app/components/Modal.jsx
'use client';

// A simple, reusable modal component
export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        // Main overlay
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={onClose} // Close modal if overlay is clicked
        >
            {/* Modal Content */}
            <div 
                className="bg-white p-8 rounded-md shadow-lg max-w-md w-full"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
}