'use client'; // Required for useRouter and event handling

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar'; 

const CartPage = () => {
    const router = useRouter();

    // Dummy data - replace with your actual state
    const cartItems = [
        {
            id: 1,
            name: 'Dark Florish Onepiece',
            price: 95.00,
            quantity: 1,
            image: '/images/product-item-1.jpg',
            slug: 'dark-florish-onepiece',
        },
        {
            id: 2,
            name: 'Cotton Off-White Shirt',
            price: 65.00,
            quantity: 2,
            image: '/images/product-item-3.jpg',
            slug: 'cotton-off-white-shirt',
        },
    ];
    
    // Dummy address data - fetch this from user's account
    const addresses = [
        { id: 1, label: 'Home - 123 Main St, Anytown...' },
        { id: 2, label: 'Work - 456 Business Ave, City...' },
    ];

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal; // Assuming shipping is calculated later

    const handleAddressChange = (event) => {
        if (event.target.value === 'add_new') {
            router.push('/address');
        }
    };

    return (
        <>
            <Navbar /> {/* <-- Navbar Added */}

            <section className="py-12 md:py-24 bg-light">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-heading text-center mb-10">Shopping Cart</h2>
                    
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items Table */}
                        <div className="w-full lg:w-2/3">
                            <div className="overflow-x-auto">
                                <div className="min-w-full">
                                    <div className="hidden md:grid grid-cols-6 gap-4 uppercase text-sm text-gray-500 pb-4 border-b">
                                        <div className="col-span-3">Product</div>
                                        <div className="text-center">Price</div>
                                        <div className="text-center">Quantity</div>
                                        <div className="text-right">Subtotal</div>
                                    </div>
                                    <div>
                                        {cartItems.map(item => (
                                            <div key={item.id} className="grid grid-cols-4 md:grid-cols-6 items-center gap-4 py-6 border-b">
                                                <div className="col-span-4 md:col-span-3 flex items-center gap-4">
                                                    <Link href={`/product/${item.slug}`}>
                                                        <Image src={item.image} alt={item.name} width={90} height={120} className="object-cover" />
                                                    </Link>
                                                    <div>
                                                        <Link href={`/product/${item.slug}`} className="hover:text-primary transition-colors duration-300">{item.name}</Link>
                                                        <button className="text-red-500 text-sm mt-1 block md:hidden">Remove</button>
                                                    </div>
                                                </div>
                                                <div className="hidden md:block text-center">${item.price.toFixed(2)}</div>
                                                <div className="col-span-2 md:col-span-1 flex items-center justify-center border rounded-md">
                                                    <button className="px-3 py-2 text-lg hover:bg-gray-200 transition-colors">-</button>
                                                    <input type="text" value={item.quantity} readOnly className="w-10 text-center border-l border-r" />
                                                    <button className="px-3 py-2 text-lg hover:bg-gray-200 transition-colors">+</button>
                                                </div>
                                                <div className="col-span-2 md:col-span-1 text-right flex flex-col items-end">
                                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                    <button className="hidden md:block text-gray-400 hover:text-red-500 text-xs uppercase mt-1 transition-colors">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cart Totals & Order Placement */}
                        <div className="w-full lg:w-1/3 bg-white p-6 md:p-8 self-start">
                            <h3 className="text-xl font-heading uppercase mb-6 border-b pb-4">Order Summary</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-4">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Address Dropdown */}
                            <div className="mt-8">
                                <label htmlFor="address-select" className="block text-sm font-medium text-gray-700 mb-2 normal-case">Shipping Address</label>
                                <select
                                    id="address-select"
                                    name="address"
                                    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary normal-case"
                                    onChange={handleAddressChange}
                                >
                                    <option>Select an address...</option>
                                    {addresses.map(address => (
                                        <option key={address.id} value={address.id}>{address.label}</option>
                                    ))}
                                    <option value="add_new" className="font-bold text-primary">+ Add New Address</option>
                                </select>
                            </div>
                            
                            <div className="mt-6">
                                <button className="w-full bg-dark text-white uppercase py-3 px-6 hover:bg-gray-800 transition-colors duration-300">
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        
        </>
    );
};

export default CartPage;