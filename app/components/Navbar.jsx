'use client';
import { useState, useEffect, useRef } from 'react'; // Added useEffect and useRef
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Sub-components (Search and Mobile Menu) ---

const SearchPopup = ({ onClose }) => {
    const categories = ["Jackets", "T-shirts", "Handbags", "Accessories", "Cosmetics", "Dresses"];
    return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center animate-fade-in">
            <button onClick={onClose} className="absolute top-8 right-8 text-4xl text-gray-500 hover:text-dark transition-colors">&times;</button>
            <div className="w-full max-w-2xl text-center">
                <form role="search" method="get" action="/search">
                    <input 
                        type="search" 
                        className="w-full text-2xl md:text-4xl text-center p-4 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-dark transition"
                        placeholder="Type and press enter" 
                    />
                </form>
                <h5 className="uppercase text-gray-500 mt-12 mb-4">Browse Categories</h5>
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {categories.map(cat => (
                        <li key={cat}>
                            <Link href={`/category/${cat.toLowerCase()}`} className="text-lg hover:text-primary transition-colors" onClick={onClose}>{cat}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// ✨ --- MOBILE MENU: UPDATED WITH USER LINKS --- ✨
const MobileMenu = ({ navLinks, isOpen, onClose, onSearchClick, cartCount, wishlistCount, isLoggedIn, onLogout }) => (
    <>
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-8 pt-20">
                <button onClick={onClose} className="absolute top-6 right-6 text-2xl">&times;</button>
                <h5 className="font-heading mb-6">Menu</h5>
                <ul className="space-y-4">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link href={link.href} className="text-lg text-dark hover:text-primary transition-colors" onClick={onClose}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <hr className="my-6 border-gray-200" />
                <ul className="space-y-4">
                    <li><button onClick={onSearchClick} className="text-lg text-dark hover:text-primary transition-colors w-full text-left">Search</button></li>
                    <li><Link href="/cart" className="text-lg text-dark hover:text-primary transition-colors" onClick={onClose}>Cart ({cartCount})</Link></li>
                    <li><Link href="/wishlist" className="text-lg text-dark hover:text-primary transition-colors" onClick={onClose}>Wishlist ({wishlistCount})</Link></li>
                </ul>

                {/* --- Added User links for mobile --- */}
                <hr className="my-6 border-gray-200" />
                {isLoggedIn ? (
                    <ul className="space-y-4">
                        <li><Link href="/account" className="text-lg text-dark hover:text-primary transition-colors" onClick={onClose}>My Account</Link></li>
                        <li><Link href="/orders" className="text-lg text-dark hover:text-primary transition-colors" onClick={onClose}>Order History</Link></li>
                        <li><button onClick={onLogout} className="text-lg text-dark hover:text-primary transition-colors w-full text-left">Logout</button></li>
                    </ul>
                ) : (
                     <ul className="space-y-4">
                        <li><Link href="/login" className="text-lg text-dark hover:text-primary transition-colors" onClick={onClose}>Login / Register</Link></li>
                    </ul>
                )}

            </div>
        </div>
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose}></div>}
    </>
);


// --- Main Navbar Component ---

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // State for user dropdown
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated auth state
    const userMenuRef = useRef(null); // Ref for closing dropdown on outside click
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
    ];

    const cartCount = 0;
    const wishlistCount = 0;

    const handleSearchClick = () => {
        setIsMenuOpen(false); 
        setIsSearchOpen(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsUserMenuOpen(false); // Close dropdown on logout
        // Also close the main mobile menu if open
        if (isMenuOpen) setIsMenuOpen(false);
    };

    // Close user dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userMenuRef]);


    return (
        <>
            <header className="fixed top-0 w-full bg-white uppercase text-sm border-b z-40">
                <nav className="container mx-auto max-w-screen-2xl px-4 h-20">
                    <div className="flex justify-between items-center h-full">
                        
                        {/* LEFT SECTION: LOGO */}
                        <div className="flex-1 flex justify-start">
                            <Link href="/">
                                <svg width="140" height="45" viewBox="0 0 140 45" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="35" fontFamily="Marcellus, serif" fontSize="40px" fill="#111" letterSpacing="1" fontWeight="400">PRADII</text>
                                </svg>
                            </Link>
                        </div>

                        {/* CENTER SECTION: NAVIGATION LINKS */}
                        <div className="hidden lg:flex justify-center flex-1">
                            {/* ... (no changes here) ... */}
                            <ul className="flex items-center gap-10">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <li key={link.label}>
                                            <Link 
                                                href={link.href} 
                                                className={`px-4 py-2 rounded-md transition-all duration-300 ${isActive ? 'bg-dark text-black' : 'text-dark hover:bg-dark hover:text-black'}`}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        
                        {/* RIGHT SECTION: ICONS & MOBILE TRIGGERS */}
                        <div className="flex-1 flex justify-end">
                            <div className="flex items-center gap-4">
                                {/* Desktop Icons */}
                                <div className="hidden lg:flex items-center gap-6">
                                    <Link href="/wishlist" className="px-3 py-2 rounded-md text-dark hover:bg-dark hover:text-black transition-colors duration-300">Wishlist ({wishlistCount})</Link>
                                    <Link href="/cart" className="px-3 py-2 rounded-md text-dark hover:bg-dark hover:text-black transition-colors duration-300">Cart ({cartCount})</Link>
                                    <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full text-dark hover:bg-dark hover:text-black transition-colors duration-300"><svg width="24" height="24"><use xlinkHref="#search"></use></svg></button>
                                    
                                    {/* --- USER ICON & DROPDOWN --- */}
                                    <div className="relative" ref={userMenuRef}>
                                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-2 rounded-full text-dark hover:bg-dark hover:text-black transition-colors duration-300">
                                            <svg width="24" height="24"><use xlinkHref="#user"></use></svg>
                                        </button>
                                        {isUserMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 normal-case">
                                                {isLoggedIn ? (
                                                    <>
                                                        <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                                                        <Link href="/orders" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Order History</Link>
                                                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                                                    </>
                                                ) : (
                                                    <Link href="/login" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Mobile Burger Menu Trigger */}
                                <div className="lg:hidden">
                                    <button className="z-50 text-dark p-2" onClick={() => setIsMenuOpen(true)}>
                                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </nav>
            </header>
            
            <MobileMenu 
                navLinks={navLinks} 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)}
                onSearchClick={handleSearchClick}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
            />
            {isSearchOpen && <SearchPopup onClose={() => setIsSearchOpen(false)} />}
        </>
    );
};

export default Navbar;