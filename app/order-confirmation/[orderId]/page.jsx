// /app/order-confirmation/[orderId]/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '../../../lib/supabase/client'; // Adjust path if needed

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function OrderConfirmationPage() {
    const params = useParams();
    const orderId = params.orderId;
    const router = useRouter();
    const supabase = createClient();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/'); // Redirect if not logged in
            return;
        }

        const { data, error: orderError } = await supabase
            .from('orders')
            .select(`
                id,
                ordered_at,
                total_amount,
                status,
                addresses (*), 
                order_items (
                    id,
                    quantity,
                    price_at_purchase,
                    products ( name, product_images (image_url) )
                )
            `)
            .eq('id', orderId)
            .eq('user_id', user.id) // Ensure user can only fetch their own order
            .single();

        if (orderError || !data) {
            console.error('Error fetching order:', orderError);
            setError('Order not found or access denied.');
        } else {
            // Convert price strings to numbers
            data.total_amount = parseFloat(data.total_amount);
            data.order_items.forEach(item => {
                item.price_at_purchase = parseFloat(item.price_at_purchase);
            });
            setOrder(data);
        }
        setLoading(false);
    }, [orderId, supabase, router]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    if (loading) return <div className="text-center py-20">Loading order details...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!order) return null;

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="py-12 md:py-20 bg-light">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h1 className="text-3xl md:text-4xl font-heading text-center mb-8">Order Confirmation</h1>
                        <div className="bg-white p-6 md:p-8 shadow-md rounded-lg">
                            <div className="mb-6 pb-4 border-b">
                                <h2 className="text-xl font-semibold mb-2">Thank you for your order!</h2>
                                <p className="text-gray-600">Order ID: <span className="font-medium">{order.id}</span></p>
                                <p className="text-gray-600">Date: <span className="font-medium">{new Date(order.ordered_at).toLocaleDateString()}</span></p>
                                <p className="text-gray-600">Status: <span className="font-medium capitalize">{order.status}</span></p>
                                <p className="text-gray-600">Order Total: <span className="font-medium text-lg text-primary">${order.total_amount.toFixed(2)}</span></p>
                            </div>

                            <div className="mb-6 pb-4 border-b">
                                <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                                <p>{order.addresses.full_name}</p>
                                <p>{order.addresses.address_line_1}</p>
                                {order.addresses.address_line_2 && <p>{order.addresses.address_line_2}</p>}
                                <p>{`${order.addresses.city}, ${order.addresses.state} ${order.addresses.zip_code}`}</p>
                                <p>Phone: {order.addresses.phone_number}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                            <Image 
                                                src={item.products.product_images[0]?.image_url || '/images/placeholder.jpg'} 
                                                alt={item.products.name}
                                                width={60}
                                                height={80}
                                                className="rounded object-cover"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-medium">{item.products.name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-8 text-center">
                                <Link href="/shop" className="bg-dark text-white uppercase py-3 px-6 hover:bg-gray-800 transition-colors duration-300">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}