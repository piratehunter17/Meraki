'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    return (
        // CHANGED: bg-dark is now bg-gray-800 for reliability
        <aside className="w-64 flex-shrink-0 bg-gray-800 text-white p-6">
            <div className="mb-10">
                <Link href="/" className="text-2xl font-heading">
                    Kaira <span className="text-primary">Admin</span>
                </Link>
            </div>
            <nav>
                <ul className="space-y-4">
                    <li>
                        <Link
                            href="/admin"
                            className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                                isActive('/admin') ? 'bg-primary' : 'hover:bg-gray-700'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span>Add Product</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/product-list"
                            className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                                isActive('/admin/product-list') ? 'bg-primary' : 'hover:bg-gray-700'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            <span>Product List</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;