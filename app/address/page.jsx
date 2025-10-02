// You may need to make this a client component ('use client') to handle form state and submissions.
const AddressPage = () => {
    return (
        <section className="py-12 md:py-24 bg-light">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-heading text-center mb-10">Add a New Address</h2>

                <div className="max-w-2xl mx-auto bg-white p-8">
                    <form>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="full-name" id="full-name" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label htmlFor="address-1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                <input type="text" name="address-1" id="address-1" placeholder="Street address, P.O. box, etc." className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Address Line 2 */}
                            <div>
                                <label htmlFor="address-2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                                <input type="text" name="address-2" id="address-2" placeholder="Apartment, suite, unit, building, floor, etc." className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                            </div>

                            {/* City */}
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" name="city" id="city" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                            </div>
                            
                            {/* State / ZIP Code */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                                    <input type="text" name="state" id="state" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                                    <input type="text" name="zip" id="zip" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            
                            {/* Phone Number */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" name="phone" id="phone" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Save Button */}
                            <div className="mt-6">
                                <button type="submit" className="w-full bg-dark text-white uppercase py-3 px-6 hover:bg-gray-800 transition-colors duration-300">
                                    Save Address
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AddressPage;