const AddProductPage = () => {
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-heading mb-6 text-dark">Add New Product</h2>
            <form className="space-y-6">
                {/* Product Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" id="productName" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="category" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary/50">
                            <option>Jackets</option>
                            <option>T-shirts</option>
                            <option>Handbags</option>
                            <option>Accessories</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="description" rows="4" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary/50"></textarea>
                </div>

                {/* Pricing and Stock Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="number" id="price" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                        <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">Discount Price ($)</label>
                        <input type="number" id="discountPrice" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" id="quantity" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary/50" />
                    </div>
                </div>

                {/* Image Upload Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Product Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input type="file" className="p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        <input type="file" className="p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        <input type="file" className="p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        <input type="file" className="p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors">
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductPage;