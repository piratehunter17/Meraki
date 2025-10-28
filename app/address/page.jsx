// /app/address/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client'; // Correct path

const AddressPage = () => {
    const router = useRouter();
    const supabase = createClient();

    // NEW: State for all form fields
    const [fullName, setFullName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // NEW: State for loading and feedback messages
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // NEW: Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage('Error: You must be logged in to save an address.');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('addresses')
            .insert({
                user_id: user.id,
                full_name: fullName,
                address_line_1: addressLine1,
                address_line_2: addressLine2,
                city: city,
                state: state,
                zip_code: zipCode,
                phone_number: phoneNumber,
            });

        if (error) {
            setMessage(`Error saving address: ${error.message}`);
        } else {
            setMessage('Address saved successfully!');
            // After a short delay, redirect the user back to the previous page (likely the cart)
            setTimeout(() => {
                router.back();
            }, 1500);
        }

        setLoading(false);
    };

    return (
        <section className="py-12 md:py-24 bg-light">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-heading text-center mb-10">Add a New Address</h2>

                <div className="max-w-2xl mx-auto bg-white p-8">
                    {/* UPDATED: Added onSubmit handler */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input 
                                    type="text" 
                                    name="full-name" 
                                    id="full-name" 
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md" 
                                />
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label htmlFor="address-1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                <input 
                                    type="text" 
                                    name="address-1" 
                                    id="address-1" 
                                    required
                                    placeholder="Street address, P.O. box, etc." 
                                    value={addressLine1}
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md" 
                                />
                            </div>

                            {/* Address Line 2 */}
                            <div>
                                <label htmlFor="address-2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                                <input 
                                    type="text" 
                                    name="address-2" 
                                    id="address-2" 
                                    placeholder="Apartment, suite, unit, etc." 
                                    value={addressLine2}
                                    onChange={(e) => setAddressLine2(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md" 
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input 
                                    type="text" 
                                    name="city" 
                                    id="city" 
                                    required
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md" 
                                />
                            </div>
                            
                            {/* State / ZIP Code */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                                    <input 
                                        type="text" 
                                        name="state" 
                                        id="state" 
                                        required
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="mt-1 block w-full p-3 border rounded-md" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                                    <input 
                                        type="text" 
                                        name="zip" 
                                        id="zip" 
                                        required
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        className="mt-1 block w-full p-3 border rounded-md" 
                                    />
                                </div>
                            </div>
                            
                            {/* Phone Number */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    id="phone" 
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md" 
                                />
                            </div>

                            {/* Save Button */}
                            <div className="mt-6">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-dark text-white uppercase py-3 px-6 hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                            
                            {/* Feedback Message */}
                            {message && <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AddressPage;