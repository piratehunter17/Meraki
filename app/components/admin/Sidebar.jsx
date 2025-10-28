// /app/components/admin/Sidebar.jsx
'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Receive isOpen and onClose props
const Sidebar = ({ isOpen, onClose }) => {
    const pathname = usePathname();

    const isActive = (path) => pathname === path || (path !== '/admin' && pathname.startsWith(path)); // More robust active check

    // Function to handle link clicks - closes sidebar on mobile
    const handleLinkClick = () => {
        if (window.innerWidth < 1024) { // Only close on mobile (lg breakpoint)
            onClose();
        }
    };

    const linkClasses = (path) => `
        flex items-center gap-3 p-3 rounded-md transition-colors duration-200 text-gray-200 
        ${isActive(path) ? 'bg-primary text-white' : 'hover:bg-gray-700 hover:text-white'}
    `;

    return (
        // Apply conditional classes for mobile positioning and transitions
        <aside className={`
            w-64 flex-shrink-0 bg-gray-800 text-white p-4 
            h-screen overflow-y-auto 
            fixed top-0 left-0 z-30 
            lg:relative lg:translate-x-0 lg:h-auto 
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        `}>
            <div className="mb-8 mt-4 flex justify-between items-center"> {/* Added mt-4 */}
                
                {/* UPDATED: Changed "Pradii Admin" to "Dashboard" */}
                <Link href="/" className="text-3xl font-heading text-white">
                    PRADII
                </Link>

                 {/* Close button for mobile */}
                 <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white" aria-label="Close sidebar">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
            </div>
            <nav>
                <ul className="space-y-3">
                    <li>
                        <Link href="/admin" className={linkClasses('/admin')} onClick={handleLinkClick}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span>Add Product</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/product-list" className={linkClasses('/admin/product-list')} onClick={handleLinkClick}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            <span>Product List</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/orders" className={linkClasses('/admin/orders')} onClick={handleLinkClick}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            <span>Orders</span>
                        </Link>
                    </li>
                    {/* Add more admin links here */}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;