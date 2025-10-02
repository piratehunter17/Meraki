import Image from 'next/image';

// Mock data - replace this with data from Supabase later
const mockProducts = [
    { id: 1, name: 'Soft Leather Jacket', category: 'Jackets', price: 95.00, quantity: 20, imageUrl: '/images/product-item-1.jpg' },
    { id: 2, name: 'Baggy Shirt', category: 'T-shirts', price: 55.00, quantity: 50, imageUrl: '/images/product-item-2.jpg' },
    { id: 3, name: 'Crop Sweater', category: 'Sweaters', price: 70.00, quantity: 35, imageUrl: '/images/product-item-4.jpg' },
];

const ProductListPage = () => {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-heading mb-6 text-dark">Product List</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 font-semibold">Image</th>
                            <th className="p-4 font-semibold">Product Name</th>
                            <th className="p-4 font-semibold">Category</th>
                            <th className="p-4 font-semibold">Price</th>
                            <th className="p-4 font-semibold">Quantity</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {mockProducts.map((product) => (
                            <tr key={product.id}>
                                <td className="p-4">
                                    <Image src={product.imageUrl} alt={product.name} width={60} height={80} className="rounded-md object-cover" />
                                </td>
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4 text-gray-600">{product.category}</td>
                                <td className="p-4 text-gray-600">${product.price.toFixed(2)}</td>
                                <td className="p-4 text-gray-600">{product.quantity}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                        <button className="text-red-600 hover:text-red-800">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductListPage;