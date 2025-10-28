// /app/account/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AccountPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form state - Changed website to age
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState(''); // State for age
    const [message, setMessage] = useState('');

    const getProfile = useCallback(async (userId) => {
        setMessage('');
        console.log("[AccountPage] Fetching profile for user:", userId);
        // UPDATED: Fetch 'age' instead of 'website'
        const { data, error } = await supabase
            .from('profiles')
            .select(`username, full_name, age`) // Changed 'website' to 'age'
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('[AccountPage] Error fetching profile:', error);
            setMessage('Error: Could not load profile data.');
            setProfile(null);
        } else if (data) {
            console.log("[AccountPage] Profile data found:", data);
            setProfile(data);
            setUsername(data.username || '');
            setFullName(data.full_name || '');
            setAge(data.age === null || data.age === undefined ? '' : String(data.age)); // Set age state, handle null/undefined
        } else {
            console.log("[AccountPage] No profile found for user.");
            setProfile({});
            setUsername('');
            setFullName('');
            setAge(''); // Initialize age state
        }
    }, [supabase]);

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            setLoading(true);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                 console.error("[AccountPage] Session Error:", sessionError);
                 setMessage("Error fetching session.");
                 setLoading(false);
                 return;
            }
            if (!session?.user) {
                console.log("[AccountPage] No active session, redirecting.");
                router.push('/');
            } else {
                console.log("[AccountPage] User session found:", session.user);
                setUser(session.user);
                await getProfile(session.user.id);
            }
            setLoading(false);
        };
        fetchUserAndProfile();
    }, [supabase, router, getProfile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // UPDATED: Include 'age' instead of 'website'
        const updates = {
            id: user.id,
            username,
            full_name: fullName,
            // Convert age back to a number, or null if empty
            age: age === '' ? null : parseInt(age, 10), 
            updated_at: new Date(),
        };
        console.log("[AccountPage] Attempting to upsert profile:", updates);

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
            console.error("[AccountPage] Error upserting profile:", error);
            setMessage('Error updating profile: ' + error.message);
        } else {
            console.log("[AccountPage] Profile upsert successful.");
            setMessage('Profile updated successfully!');
            // Update local state, converting age back to string for input consistency
            setProfile({ username, full_name: fullName, age: updates.age }); 
            setIsEditing(false);
        }
        setLoading(false);
    };

    const handleLogout = async () => { /* ... (no changes needed) ... */ };
    const handleDeleteAccount = async () => { /* ... (no changes needed) ... */ };

    // --- (Loading and user check logic remains the same) ---
    if (loading && user === null) { /* ... loading JSX ... */ }
    if (loading && user !== null) { /* ... loading JSX ... */ }
    if (!user) { /* ... redirect JSX / message ... */ }

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="py-12 md:py-20 bg-light">
                    <div className="container mx-auto px-4 max-w-lg">
                        <h1 className="text-3xl md:text-4xl font-heading text-center mb-10">My Account</h1>
                        <div className="bg-white p-6 md:p-8 shadow-md rounded-lg space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Profile Details</h2>
                                    {!isEditing && profile !== null && (
                                        <button onClick={() => setIsEditing(true)} className="text-sm text-primary hover:underline" disabled={loading}>
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {/* Display Mode */}
                                {!isEditing && profile !== null && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Email</label>
                                            <p className="mt-1 text-gray-800 break-words">{user.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Username</label>
                                            <p className="mt-1 text-gray-800 break-words">{profile?.username || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                            <p className="mt-1 text-gray-800 break-words">{profile?.full_name || '-'}</p>
                                        </div>
                                        {/* UPDATED: Display Age */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Age</label>
                                            <p className="mt-1 text-gray-800">{profile?.age === null || profile?.age === undefined ? '-' : profile.age}</p>
                                        </div>
                                    </div>
                                )}
                                {profile === null && !loading && (
                                    <p className="text-red-500">Could not load profile data.</p>
                                )}

                                {/* Edit Mode Form */}
                                {isEditing && (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                            <input type="email" id="email" value={user.email} disabled className="mt-1 block w-full p-3 border rounded-md bg-gray-100 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full p-3 border rounded-md" />
                                        </div>
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                            <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full p-3 border rounded-md" />
                                        </div>
                                        {/* UPDATED: Age Input */}
                                        <div>
                                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                                            <input 
                                                type="number" 
                                                id="age" 
                                                value={age} 
                                                onChange={(e) => setAge(e.target.value)} 
                                                min="0" // Prevent negative ages
                                                className="mt-1 block w-full p-3 border rounded-md" 
                                            />
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button type="submit" disabled={loading} className="flex-1 bg-dark text-white uppercase py-2 px-4 hover:bg-gray-800 disabled:opacity-50">
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button type="button" onClick={() => { setIsEditing(false); setMessage(''); }} disabled={loading} className="flex-1 bg-gray-200 text-gray-700 uppercase py-2 px-4 hover:bg-gray-300 disabled:opacity-50">
                                                Cancel
                                            </button>
                                        </div>
                                        {message && <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
                                    </form>
                                )}
                            </div>

                            {/* --- Other Account Actions --- */}
                            {!isEditing && profile !== null && (
                                <>
                                    <hr />
                                    <div>
                                        <button onClick={handleLogout} disabled={loading} className="w-full bg-gray-200 text-gray-700 uppercase py-3 px-6 hover:bg-gray-300 disabled:opacity-50">
                                            Logout
                                        </button>
                                    </div>
                                    <hr />
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2 text-red-600">Danger Zone</h2>
                                        <p className="text-sm text-gray-600 mb-4">Deleting your account is permanent and cannot be undone.</p>
                                        <button onClick={handleDeleteAccount} disabled={loading} className="w-full bg-red-600 text-white uppercase py-3 px-6 hover:bg-red-700 disabled:opacity-50">
                                            {loading ? 'Processing...' : 'Delete My Account'}
                                        </button>
                                        {message && message.includes('delete') && <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-yellow-600'}`}>{message}</p>}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}