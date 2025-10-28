// /app/cart/page.jsx
'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import Navbar from '../components/Navbar';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const CartPage = () => {
    const router = useRouter();
    const supabase = createClient();

    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderPlacing, setOrderPlacing] = useState(false);

    useEffect(() => {
        const fetchCartData = async () => {
            setLoading(true);
            setError(null); // Reset error on fetch
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Consider showing a message instead of immediate redirect
                setError("Please log in to view your cart.");
                setLoading(false);
                // router.push('/'); // Redirecting immediately might be jarring
                return;
            }

            try { // Wrap fetches in try/catch for better error handling
                const [cartRes, addressesRes] = await Promise.all([
                    supabase.from('cart_items').select(`
                        quantity,
                        products (id, name, price, discount_price, slug, stock_quantity, product_images (image_url)) 
                    `).eq('user_id', user.id),
                    supabase.from('addresses').select('*').eq('user_id', user.id)
                ]);

                // Check for specific cart items error
                if (cartRes.error) {
                    console.error("Cart Fetch Error:", cartRes.error);
                    throw new Error('Failed to fetch cart items. Please try again.');
                }
                // Check for specific addresses error
                if (addressesRes.error) {
                    console.error("Address Fetch Error:", addressesRes.error);
                    throw new Error('Failed to fetch addresses. Please try again.');
                }

                // Process cart items only if products exist
                const formattedCartItems = cartRes.data
                    .filter(item => item.products) // Ensure product exists
                    .map(item => ({
                        id: item.products.id,
                        name: item.products.name,
                        price: parseFloat(item.products.discount_price || item.products.price),
                        quantity: item.quantity,
                        stock: item.products.stock_quantity, // Include stock info
                        image: item.products.product_images?.[0]?.image_url || '/images/placeholder.jpg',
                        slug: item.products.slug,
                    }));
                setCartItems(formattedCartItems);

                // Process addresses
                setAddresses(addressesRes.data);
                if (addressesRes.data.length > 0 && !selectedAddress) {
                    setSelectedAddress(addressesRes.data[0]);
                } else if (addressesRes.data.length === 0) {
                    setSelectedAddress(null);
                }

            } catch (err) { // Catch errors from Promise.all or processing
                 setError(err.message || 'Failed to fetch your data. Please try again.');
                 setCartItems([]);
                 setAddresses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCartData();
    // Only re-run if supabase instance changes (effectively runs once)
    }, [supabase, router]); 

    // Cart item handlers
    const handleQuantityChange = async (productId, newQuantity) => {
        // Find the item to check stock (optional but good UX)
        const item = cartItems.find(i => i.id === productId);
        // Prevent increasing quantity beyond stock if stock info is available
        if (item && item.stock !== undefined && newQuantity > item.stock) {
             alert(`Sorry, only ${item.stock} available.`);
             return;
        }
        if (newQuantity < 1) return; // Prevent less than 1

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic UI update
        const previousCartItems = cartItems;
        setCartItems(cartItems.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));

        // Update in Supabase
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .match({ user_id: user.id, product_id: productId });

        if (error) {
            alert('Error updating quantity: ' + error.message);
            setCartItems(previousCartItems); // Rollback UI on error
        }
    };

    const handleRemoveItem = async (productId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic UI update
        const previousCartItems = cartItems;
        setCartItems(cartItems.filter(item => item.id !== productId));

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .match({ user_id: user.id, product_id: productId });
        
        if (error) {
            alert('Error removing item: ' + error.message);
            setCartItems(previousCartItems); // Rollback UI on error
        }
    };
    
    // Address selection handler
    const handleAddressChange = (value) => {
        if (value === 'add_new') {
            router.push('/address');
        } else {
            setSelectedAddress(value);
        }
    };

    // Place order handler (with stock decrement)
    const handlePlaceOrder = async () => {
        if (!selectedAddress) { alert("Please select a shipping address."); return; }
        if (cartItems.length === 0) { alert("Your cart is empty."); return; }

        setOrderPlacing(true);
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setOrderPlacing(false); return; }

        // Optional: Check stock before placing order (client-side check)
        for (const item of cartItems) {
            if (item.stock !== undefined && item.quantity > item.stock) {
                alert(`Cannot place order: Item "${item.name}" only has ${item.stock} in stock, but you have ${item.quantity} in your cart.`);
                setOrderPlacing(false);
                return;
            }
        }

        try {
            // 1. Create Order Header
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    shipping_address_id: selectedAddress.id,
                    total_amount: total,
                    status: 'processing', // Use 'processing' or a similar status
                })
                .select()
                .single();
            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = cartItems.map(item => ({
                order_id: newOrder.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price,
            }));
            const { error: orderItemsError } = await supabase.from('order_items').insert(orderItems);
            if (orderItemsError) throw orderItemsError;

            // --- DECREMENT STOCK ---
            // 3. Prepare data and call the database function
            const stockUpdateItems = cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
            }));
            console.log("[CartPage] Calling decrement_product_stock with:", stockUpdateItems);
            const { error: stockError } = await supabase.rpc('decrement_product_stock', { items: stockUpdateItems });
            if (stockError) {
                console.error("!!! Critical Warning: Failed to decrement stock:", stockError);
                // Decide on handling: Log, alert, flag order?
            } else {
                 console.log("[CartPage] Stock decremented successfully.");
            }
            // --- END DECREMENT STOCK ---

            // 4. Clear the user's cart
            console.log("[CartPage] Clearing cart for user:", user.id);
            const { error: clearCartError } = await supabase.from('cart_items').delete().eq('user_id', user.id);
            if (clearCartError) {
                 console.warn("Failed to clear cart after order:", clearCartError);
            }
            
            // 5. Redirect to confirmation
            alert('Order placed successfully!');
            setCartItems([]); // Clear local cart state immediately
            router.push(`/order-confirmation/${newOrder.id}`);

        } catch (error) {
            console.error("Failed to place order:", error);
            setError(`Failed to place order: ${error.message || 'Unknown error'}`);
        } finally {
            setOrderPlacing(false);
        }
    };

    // Calculations
    const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
    const total = subtotal;

    // --- Render Logic ---
    if (loading) return (
        <>
            <Navbar />
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Loading your cart...</p>
            </div>
            {/* Footer might be pushed down by min-h-screen, consider layout */}
        </>
    );

    return (
        <>
            <Navbar />
            <section className="pt-24 pb-12 md:py-24 bg-light min-h-screen">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-heading text-center mb-10">Shopping Cart</h2>
                    {error && <p className="text-center text-red-500 mb-6">{error}</p>}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items Section */}
                        <div className="w-full lg:w-2/3">
                             <div className="bg-white p-4 sm:p-6 md:p-8 shadow-sm rounded-lg">
                                <div className="overflow-x-auto">
                                    <div className="min-w-[600px] md:min-w-full"> {/* Ensure table content doesn't wrap too early */}
                                        <div className="hidden md:grid grid-cols-6 gap-4 uppercase text-sm text-gray-500 pb-4 border-b">
                                            <div className="col-span-3">Product</div>
                                            <div className="text-center">Price</div>
                                            <div className="text-center">Quantity</div>
                                            <div className="text-right">Subtotal</div>
                                        </div>
                                        <div>
                                            {cartItems.length > 0 ? cartItems.map(item => (
                                                <div key={item.id} className="grid grid-cols-4 md:grid-cols-6 items-center gap-4 py-6 border-b">
                                                    {/* Product Info */}
                                                    <div className="col-span-4 md:col-span-3 flex items-center gap-4">
                                                        <Link href={`/product/${item.slug}`}>
                                                            <Image src={item.image} alt={item.name} width={60} height={80} className="object-cover rounded flex-shrink-0" />
                                                        </Link>
                                                        <div className="flex-grow">
                                                            <Link href={`/product/${item.slug}`} className="hover:text-primary font-medium text-sm sm:text-base">{item.name}</Link>
                                                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 text-xs mt-1 block md:hidden">Remove</button>
                                                        </div>
                                                    </div>
                                                    {/* Price */}
                                                    <div className="hidden md:block text-center text-gray-600">${item.price.toFixed(2)}</div>
                                                    {/* Quantity */}
                                                    <div className="col-span-2 md:col-span-1 flex items-center justify-center border rounded-md text-sm">
                                                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="px-2 py-1 sm:px-3 sm:py-2 text-lg text-gray-600 hover:bg-gray-100 transition-colors">-</button>
                                                        <input type="text" value={item.quantity} readOnly className="w-8 sm:w-10 text-center border-l border-r focus:outline-none" />
                                                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="px-2 py-1 sm:px-3 sm:py-2 text-lg text-gray-600 hover:bg-gray-100 transition-colors">+</button>
                                                    </div>
                                                    {/* Subtotal & Remove */}
                                                    <div className="col-span-2 md:col-span-1 text-right flex flex-col items-end">
                                                        <span className="font-medium text-sm sm:text-base">${(item.price * item.quantity).toFixed(2)}</span>
                                                        <button onClick={() => handleRemoveItem(item.id)} className="hidden md:block text-gray-400 hover:text-red-500 text-xs uppercase mt-1 transition-colors">
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : <p className="py-8 text-center text-gray-500">Your cart is empty.</p>}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Order Summary Section */}
                        <div className="w-full lg:w-1/3">
                             <div className="bg-white p-6 md:p-8 shadow-sm rounded-lg self-start">
                                <h3 className="text-xl font-heading uppercase mb-6 border-b pb-4">Order Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-4">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Address Dropdown */}
                                <div className="mt-8">
                                    <Listbox value={selectedAddress} onChange={handleAddressChange}>
                                        {({ open }) => (
                                             <>
                                                <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</Listbox.Label>
                                                <div className="relative">
                                                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 px-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-light sm:text-sm">
                                                        <span className="block truncate">
                                                            {selectedAddress ? `${selectedAddress.address_line_1}, ${selectedAddress.city}` : "Select an address..."}
                                                        </span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                                                            {addresses.map((address) => (
                                                                <Listbox.Option key={address.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-primary-light text-primary-dark' : 'text-gray-900' }`} value={address}>
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>
                                                                                {`${address.address_line_1}, ${address.city}`}
                                                                            </span>
                                                                            {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span>) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                            <Listbox.Option className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active ? 'bg-gray-100' : 'text-gray-900' }`} value="add_new">
                                                                <span className="block truncate font-bold text-primary">+ Add New Address</span>
                                                            </Listbox.Option>
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </>
                                        )}
                                    </Listbox>
                                </div>

                                <div className="mt-6">
                                    <button onClick={handlePlaceOrder} disabled={orderPlacing || cartItems.length === 0 || !selectedAddress} className="w-full bg-zinc-800 text-white uppercase py-3 px-6 hover:bg-zinc-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded">
                                        {orderPlacing ? 'Placing Order...' : 'Place Order'}
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CartPage;