// /app/admin/layout.jsx
'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';

export default function AdminLayout({ children }) {
    const supabase = createClient();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

    useEffect(() => {
        const checkAdminStatus = async () => {
            console.log("[AdminLayout] Checking user status...");
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log("[AdminLayout] No user found, redirecting to /");
                router.replace('/'); 
                return; 
            }

            console.log("[AdminLayout] User found, checking profile role...");
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignore "No rows found"
                console.error("[AdminLayout] Error fetching profile:", error);
                router.replace('/'); 
                return;
            }

            if (profile?.role === 'admin') {
                console.log("[AdminLayout] User is admin. Allowing access.");
                setIsAdmin(true);
            } else {
                console.log(`[AdminLayout] User role is "${profile?.role}". Redirecting non-admin to /`);
                router.replace('/'); 
            }
            setIsLoading(false); 
        };

        checkAdminStatus();
    }, [supabase, router]);

    // Show a loading state while checking
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <p>Checking permissions...</p>
            </div>
        );
    }

    // Only render the admin layout if the user is confirmed as admin
    if (isAdmin) {
        return (
            // FIX 1: Changed h-screen to min-h-screen
            <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar - Conditionally positioned */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                 {/* Overlay for mobile when sidebar is open */}
                 {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    ></div>
                 )}

                {/* FIX 2: Removed overflow-hidden from this div */}
                <div className="flex-1 flex flex-col">
                    {/* Header receives toggle function */}
                    <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                    
                    {/* FIX 3: Removed flex-1, overflow-*, and self-start. */}
                    {/* This is the main content area that now scrolls with the page. */}
                    <main className="bg-gray-100 p-4 md:p-6 w-full"> 
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Important: Return null if not admin and not loading
    return null; 
}