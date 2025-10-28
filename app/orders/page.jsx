// /app/orders/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client'; // Adjust path if needed

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderHistoryPage() {
    const router = useRouter();
    const supabase = createClient();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/'); // Redirect if not logged in
                return;
            }

            const { data, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id,
                    ordered_at,
                    total_amount,
                    status
                `)
                .eq('user_id', user.id)
                .order('ordered_at', { ascending: false }); // Show most recent orders first

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
                setError('Could not load your order history.');
            } else {
                 // Convert price strings to numbers
                data.forEach(order => order.total_amount = parseFloat(order.total_amount));
                setOrders(data);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [router, supabase]);

    if (loading) return <div className="text-center py-20">Loading order history...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="py-12 md:py-20 bg-light">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h1 className="text-3xl md:text-4xl font-heading text-center mb-10">Order History</h1>
                        
                        <div className="bg-white p-6 md:p-8 shadow-md rounded-lg">
                            {orders.length > 0 ? (
                                <div className="space-y-6">
                                    {orders.map(order => (
                                        <div key={order.id} className="border p-4 rounded-md hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                                <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-700">{order.id}</span></p>
                                                <p className="text-sm text-gray-500">Date: <span className="font-medium text-gray-700">{new Date(order.ordered_at).toLocaleDateString()}</span></p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                <p>Total: <span className="font-semibold text-lg text-primary">${order.total_amount.toFixed(2)}</span></p>
                                                <p>Status: <span className="font-medium capitalize px-2 py-1 text-sm rounded bg-gray-200 text-gray-800">{order.status}</span></p>
                                                <Link href={`/order-confirmation/${order.id}`} className="text-primary hover:underline text-sm font-medium mt-2 sm:mt-0">
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 py-10">You haven't placed any orders yet.</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}