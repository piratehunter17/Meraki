// /app/components/Navbar.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // <-- Added useRouter
import Image from 'next/image';

// Import Supabase client and Modal components
import { createClient } from '../../lib/supabase/client';
import LoginModal from './auth/LoginModal';
import SignupModal from './auth/SignupModal';

// --- Sub-components (Search, Mobile Menu, UserIcon, UserDropdown) ---

const SearchPopup = ({ onClose }) => {
    // ... (This component is unchanged and correct)
    const categories = ["Jackets", "T-shirts", "Handbags", "Accessories", "Cosmetics", "Dresses"];
    return (
        <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center animate-fade-in">
            <button onClick={onClose} className="absolute top-8 right-8 text-4xl text-gray-500 hover:text-dark transition-colors duration-300">&times;</button>
            <div className="w-full max-w-2xl text-center px-4">
                <form role="search" method="get" action="/search">
                    <input type="search" name="q" className="w-full text-2xl md:text-4xl text-center p-4 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-dark transition duration-300 placeholder-gray-400" placeholder="Type and press enter" autoFocus />
                </form>
                <h5 className="uppercase text-gray-500 mt-12 mb-4">Browse Categories</h5>
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {categories.map(cat => (
                        <li key={cat}>
                            <Link href={`/category/${cat.toLowerCase().replace(' ', '-')}`} className="text-lg hover:text-primary transition-colors duration-300" onClick={onClose}>{cat}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const MobileMenu = ({ navLinks, isOpen, onClose, onSearchClick, cartCount, wishlistCount, session, onLogout, onLoginClick }) => (
    // ... (This component is unchanged and correct)
    <>
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="p-8 pt-20 overflow-y-auto h-full">
                <button onClick={onClose} className="absolute top-6 right-6 text-2xl text-gray-500 hover:text-gray-800 transition-colors duration-300">&times;</button>
                <h5 className="font-heading mb-6">Menu</h5>
                <ul className="space-y-4">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link href={link.href} className="text-lg text-dark hover:text-primary transition-colors duration-300" onClick={onClose}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <hr className="my-6 border-gray-200" />
                <ul className="space-y-4">
                    <li><button onClick={onSearchClick} className="text-lg text-dark hover:text-primary transition-colors duration-300 w-full text-left">Search</button></li>
                    <li><Link href="/cart" className="text-lg text-dark hover:text-primary transition-colors duration-300" onClick={onClose}>Cart ({cartCount})</Link></li>
                    <li><Link href="/wishlist" className="text-lg text-dark hover:text-primary transition-colors duration-300" onClick={onClose}>Wishlist ({wishlistCount})</Link></li>
                </ul>
                <hr className="my-6 border-gray-200" />
                {session ? (
                    <ul className="space-y-4">
                        <li><Link href="/account" className="text-lg text-dark hover:text-primary transition-colors duration-300" onClick={onClose}>My Account</Link></li>
                        <li><Link href="/orders" className="text-lg text-dark hover:text-primary transition-colors duration-300" onClick={onClose}>Order History</Link></li>
                        <li><button onClick={onLogout} className="text-lg text-dark hover:text-primary transition-colors duration-300 w-full text-left">Logout</button></li>
                    </ul>
                ) : (
                     <ul className="space-y-4">
                         <li><button onClick={onLoginClick} className="text-lg text-dark hover:text-primary transition-colors duration-300 w-full text-left">Login / Register</button></li>
                     </ul>
                )}
            </div>
        </div>
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300" onClick={onClose}></div>}
    </>
);

// --- UserIcon Component ---
const UserIcon = ({ session }) => {
    // ... (This component is unchanged and correct)
    const user = session?.user;
    const avatarUrl = user?.user_metadata?.avatar_url;
    if (avatarUrl) {
        return <Image src={avatarUrl} alt="User avatar" width={26} height={26} className="w-[26px] h-[26px] rounded-full" />;
    }
    const name = user?.user_metadata?.name;
    const email = user?.email;
    let initials = name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : 'U';
    return <div className="w-[26px] h-[26px] rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">{initials}</div>;
};

// --- User Dropdown Component (Defined Outside Navbar) ---
const UserDropdown = ({ session, onLogout, onLoginClick, onClose }) => (
    <div
        // Note: No ref needed here as it's passed from Navbar's render
        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 normal-case border border-gray-100 animate-fade-in-down-quick origin-top-right"
    >
        {session ? (
            <>
                <Link href="/account" onClick={onClose} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">My Account</Link>
                <Link href="/orders" onClick={onClose} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Order History</Link>
                {/* Ensure onLogout prop is called */}
                <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Logout</button>
            </>
        ) : (
            // Ensure onLoginClick prop is called
            <button onClick={onLoginClick} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Login</button>
        )}
    </div>
);


// --- Main Navbar Component ---

const Navbar = () => {
    // Modal states
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setSignupModalOpen] = useState(false);

    // UI states
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const pathname = usePathname();
    const router = useRouter(); // <-- Initialize router

    // Real-time states
    const [session, setSession] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    const supabase = createClient();

    // Function to fetch counts
    const fetchCounts = async (userId) => {
        if (!userId) {
            setCartCount(0);
            setWishlistCount(0);
            return;
        }
        const [cartRes, wishlistRes] = await Promise.all([
            supabase.from('cart_items').select('product_id', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('wishlist_items').select('product_id', { count: 'exact', head: true }).eq('user_id', userId)
        ]);
        setCartCount(cartRes.count ?? 0);
        setWishlistCount(wishlistRes.count ?? 0);
    };

    // Listen to auth changes and fetch counts
    useEffect(() => {
        const getInitialSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            fetchCounts(data.session?.user?.id);
        }
        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            fetchCounts(session?.user?.id);
        });

        return () => subscription?.unsubscribe();
    }, [supabase]); // Keep dependency array correct

    // Close user dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickingMobileButton = event.target.closest('button[aria-label="User menu mobile"]');
            const isClickingDesktopButton = event.target.closest('button[aria-label="User menu desktop"]'); // Adjusted label

            if (isClickingMobileButton || isClickingDesktopButton) return; // Don't close if clicking button

            // Use the single ref 'userMenuRef' attached to both dropdown containers
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                 setIsUserMenuOpen(false);
            }
        };
        // Add listener only when menu is open
        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        // Cleanup function
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isUserMenuOpen, userMenuRef]); // Rerun when menu state changes or ref changes


    // Navigation links
    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
    ];

    // --- Handlers ---
    const handleSearchClick = () => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(true);
    };

    // --- UPDATED LOGOUT HANDLER ---
    const handleLogout = async () => {
        setIsUserMenuOpen(false); // Close menu immediately
        if (isMenuOpen) setIsMenuOpen(false);

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error);
            alert("Logout failed: " + error.message);
        } else {
            console.log("Logout successful via Supabase");
            // Redirect to home and refresh
            router.push('/');
            router.refresh(); // <-- Added refresh
        }
    };

    const switchToSignup = () => {
        setLoginModalOpen(false);
        setSignupModalOpen(true);
    };

    const switchToLogin = () => {
        setSignupModalOpen(false);
        setLoginModalOpen(true);
    };

    const openLoginModal = () => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setLoginModalOpen(true);
    };
    // --- End Handlers ---

    return (
        <>
            <header className="fixed top-0 w-full bg-white uppercase text-sm border-b z-40">
                <nav className="container mx-auto max-w-screen-2xl px-4 h-20">

                    {/* --- MOBILE NAVIGATION (lg:hidden) --- */}
                    <div className="flex lg:hidden justify-between items-center h-full">
                        {/* 1. Left: Hamburger */}
                        <div className="flex-1 flex justify-start">
                             <button className="z-50 text-dark p-2 rounded-md hover:bg-gray-100 transition-colors duration-300" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                             </button>
                        </div>
                        {/* 2. Center: Logo */}
                        <div className="flex-1 flex justify-center">
                              <Link href="/">
                                 <svg width="140" height="45" viewBox="0 0 140 45" xmlns="http://www.w3.org/2000/svg">
                                     <text x="0" y="35" fontFamily="Marcellus, serif" fontSize="40px" fill="#111" letterSpacing="1" fontWeight="400">PRADII</text>
                                 </svg>
                             </Link>
                        </div>
                        {/* 3. Right: Cart + User */}
                        <div className="flex-1 flex justify-end items-center gap-3">
                            <Link href="/cart" className="relative p-2 rounded-full text-gray-500 hover:text-black transition-colors duration-300" aria-label="Cart">
                                <svg width="24" height="24"><use xlinkHref="#cart"></use></svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 block min-w-[1.1rem] h-[1.1rem] rounded-full bg-primary text-white text-[0.6rem] leading-none flex items-center justify-center px-1">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            {/* Mobile User Button - Attach single ref to parent div */}
                            <div className="relative" ref={userMenuRef}>
                                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="rounded-full transition-opacity duration-300 hover:opacity-80 flex items-center justify-center w-8 h-8" aria-label="User menu mobile">
                                    {session ? <UserIcon session={session} /> : <svg width="24" height="24" className="text-gray-500 hover:text-black"><use xlinkHref="#user"></use></svg>}
                                </button>
                                {/* Pass handlers and state as props */}
                                {isUserMenuOpen && <UserDropdown session={session} onLogout={handleLogout} onLoginClick={openLoginModal} onClose={() => setIsUserMenuOpen(false)} />}
                            </div>
                        </div>
                    </div>

                    {/* --- DESKTOP NAVIGATION (hidden lg:flex) --- */}
                    <div className="hidden lg:flex justify-between items-center h-full">
                        {/* 1. Left: Logo */}
                        <div className="flex-1 flex justify-start">
                             <Link href="/">
                                 <svg width="140" height="45" viewBox="0 0 140 45" xmlns="http://www.w3.org/2000/svg">
                                     <text x="0" y="35" fontFamily="Marcellus, serif" fontSize="40px" fill="#111" letterSpacing="1" fontWeight="400">PRADII</text>
                                 </svg>
                             </Link>
                        </div>
                        {/* 2. Center: Links */}
                        <div className="hidden lg:flex justify-center flex-1">
                             <ul className="flex items-center gap-10">
                                 {navLinks.map((link) => {
                                     const isActive = pathname === link.href;
                                     return (
                                         <li key={link.label}>
                                             <Link
                                                 href={link.href}
                                                 className={`
                                                     relative inline-block py-2 text-dark hover:text-black transition-colors duration-300
                                                     after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-black 
                                                     after:transition-all after:duration-300 
                                                     ${isActive ? 'after:w-full font-medium' : 'after:w-0 hover:after:w-full'}
                                                 `}
                                             >
                                                 {link.label}
                                             </Link>
                                         </li>
                                     );
                                 })}
                             </ul>
                        </div>
                        {/* 3. Right: Icons */}
                        <div className="flex-1 flex justify-end">
                            <div className="flex items-center gap-5">
                                {/* Wishlist, Cart, Search */}
                                <Link href="/wishlist" className="relative p-2 rounded-full text-gray-500 hover:text-black transition-colors duration-300" aria-label="Wishlist">
                                    <svg width="24" height="24"><use xlinkHref="#heart"></use></svg>
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 block min-w-[1.1rem] h-[1.1rem] rounded-full bg-primary text-white text-[0.6rem] leading-none flex items-center justify-center px-1">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
                                <Link href="/cart" className="relative p-2 rounded-full text-gray-500 hover:text-black transition-colors duration-300" aria-label="Cart">
                                    <svg width="24" height="24"><use xlinkHref="#cart"></use></svg>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 block min-w-[1.1rem] h-[1.1rem] rounded-full bg-primary text-white text-[0.6rem] leading-none flex items-center justify-center px-1">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                <button onClick={handleSearchClick} className="p-2 rounded-full text-gray-500 hover:text-black transition-colors duration-300" aria-label="Search">
                                    <svg width="24" height="24"><use xlinkHref="#search"></use></svg>
                                </button>
                                {/* Desktop User Button - Attach single ref to parent div */}
                                <div className="relative" ref={userMenuRef}>
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="rounded-full transition-opacity duration-300 hover:opacity-80 flex items-center justify-center w-8 h-8" aria-label="User menu desktop">
                                        {session ? <UserIcon session={session} /> : <svg width="24" height="24" className="text-gray-500 hover:text-black"><use xlinkHref="#user"></use></svg>}
                                    </button>
                                    {/* Pass handlers and state as props */}
                                    {isUserMenuOpen && <UserDropdown session={session} onLogout={handleLogout} onLoginClick={openLoginModal} onClose={() => setIsUserMenuOpen(false)} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Modals and Menus */}
            {/* Pass handlers to MobileMenu */}
            <MobileMenu navLinks={navLinks} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onSearchClick={handleSearchClick} cartCount={cartCount} wishlistCount={wishlistCount} session={session} onLogout={handleLogout} onLoginClick={openLoginModal} />
            {isSearchOpen && <SearchPopup onClose={() => setIsSearchOpen(false)} />}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onSwitchToSignup={switchToSignup} />
            <SignupModal isOpen={isSignupModalOpen} onClose={() => setSignupModalOpen(false)} onSwitchToLogin={switchToLogin} />
        </>
    );
};

export default Navbar;