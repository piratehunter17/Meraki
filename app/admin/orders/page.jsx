// /app/admin/orders/page.jsx
'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '../../../lib/supabase/client';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter(); // Keep router

    // Fetch the list of all orders (summary)
    const fetchAllOrders = async () => {
        setError(null);
        // console.log("[AdminOrdersPage] Fetching all orders...");
        const { data, error: fetchError } = await supabase
            .from('orders')
            .select(`id, ordered_at, total_amount, status, user_id, profiles ( full_name )`)
            .order('ordered_at', { ascending: false });

        if (fetchError) {
            console.error("[AdminOrdersPage] Error fetching all orders:", fetchError);
            setError("Failed to load orders: " + fetchError.message); setOrders([]);
        } else if (data) {
             // console.log("[AdminOrdersPage] Orders fetched successfully:", data);
             const processedData = data.map(order => ({
                 ...order,
                 total_amount: parseFloat(order.total_amount) || 0
             }));
             setOrders(processedData);
        } else { setOrders([]); }
    };

    // Check admin status and fetch initial orders list
    useEffect(() => {
        setLoading(true);
        fetchAllOrders().finally(() => setLoading(false));
    }, [supabase]);


    // Function to fetch details for a specific order
    const fetchOrderDetails = async (orderId) => {
        setDetailsLoading(true); setOrderDetails(null); setError(null);
        // console.log(`[AdminOrdersPage] Fetching details for order ID: ${orderId}`);

        const { data, error: detailsError } = await supabase
            .from('orders')
            .select(`id, addresses (*), order_items (id, quantity, price_at_purchase, products ( name, product_images (image_url) ))`)
            .eq('id', orderId)
            .single();

        if (detailsError || !data) {
            console.error("Error fetching order details:", detailsError);
            setError("Failed to load order details.");
        } else {
            data.order_items.forEach(item => {
                item.price_at_purchase = parseFloat(item.price_at_purchase) || 0;
                item.products.imageUrl = item.products?.product_images?.[0]?.image_url || '/images/placeholder.jpg';
            });
            // console.log("[AdminOrdersPage] Order details fetched:", data);
            setOrderDetails(data);
        }
        setDetailsLoading(false);
    };

    // Handle clicking the "View Details" button
    const handleToggleDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null); setOrderDetails(null);
        } else {
            setExpandedOrderId(orderId);
            fetchOrderDetails(orderId);
        }
    };

    // --- Render Logic ---
    if (loading) return <div className="p-4 md:p-8 text-center text-gray-500">Loading orders...</div>;
    // Show main fetch error prominently if it happened during the initial load
    if (error && orders.length === 0) return <div className="p-4 md:p-8 text-center text-red-500">Error: {error}</div>;


    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading mb-6 text-dark">All User Orders</h2>

            {orders.length === 0 && !loading ? (
                <p className="text-gray-500 text-center py-8">No orders found.</p>
            ) : (
                 // REMOVED overflow-x-auto
                <div>
                    {/* REMOVED min-w-[*] */}
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                            <tr>
                                {/* Adjust padding */}
                                <th className="py-3 px-2 font-semibold">ID</th>
                                {/* HIDDEN on small screens */}
                                <th className="py-3 px-2 font-semibold hidden md:table-cell">Date</th>
                                <th className="py-3 px-2 font-semibold hidden sm:table-cell">Customer</th> {/* Show Customer on sm+ */}
                                <th className="py-3 px-2 font-semibold">Total</th>
                                <th className="py-3 px-2 font-semibold">Status</th>
                                <th className="py-3 px-2 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <Fragment key={order.id}>
                                    <tr className="hover:bg-gray-50 align-top">
                                        {/* Allow ID to wrap if absolutely necessary, but keep it short */}
                                        <td className="py-3 px-2 font-medium text-gray-900 text-xs break-words">{order.id}</td>
                                        {/* HIDDEN on small screens */}
                                        <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{new Date(order.ordered_at).toLocaleDateString()}</td>
                                         {/* Show Customer on sm+ */}
                                        <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">
                                            {order.profiles?.full_name || <span className="text-xs italic">{order.user_id}</span>}
                                        </td>
                                        <td className="py-3 px-2 text-gray-600">${order.total_amount.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-gray-600">
                                            <span className={`capitalize px-1.5 py-0.5 text-[0.65rem] rounded font-medium whitespace-nowrap ${ /* Adjusted padding/size */
                                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <button
                                                onClick={() => handleToggleDetails(order.id)}
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-xs whitespace-nowrap"
                                            >
                                                {expandedOrderId === order.id ? 'Hide' : 'Details'}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Details Row (no changes needed here, already responsive) */}
                                    {expandedOrderId === order.id && (
                                        <tr>
                                            <td colSpan={6} className="p-3 sm:p-4 bg-gray-50 border-t">
                                                 {detailsLoading && <p className="text-gray-500 text-xs">Loading details...</p>}
                                                {!detailsLoading && error && expandedOrderId === order.id && <p className="text-red-500 text-xs">{error}</p>}
                                                {orderDetails && !detailsLoading && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-xs">
                                                        {/* Shipping Details */}
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-gray-700 uppercase tracking-wider text-[0.7rem]">Shipping Address</h4>
                                                             {orderDetails.addresses ? (
                                                                <>
                                                                    <p>{orderDetails.addresses.full_name}</p>
                                                                    <p>{orderDetails.addresses.address_line_1}</p>
                                                                    {orderDetails.addresses.address_line_2 && <p>{orderDetails.addresses.address_line_2}</p>}
                                                                    <p>{`${orderDetails.addresses.city}, ${orderDetails.addresses.state} ${orderDetails.addresses.zip_code}`}</p>
                                                                    <p>Phone: {orderDetails.addresses.phone_number || 'N/A'}</p>
                                                                </>
                                                             ) : <p className="text-gray-500 italic">No address found.</p>}
                                                        </div>
                                                        {/* Ordered Items */}
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-gray-700 uppercase tracking-wider text-[0.7rem]">Items Ordered</h4>
                                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                                {orderDetails.order_items.map((item) => (
                                                                    <div key={item.id} className="flex items-center gap-2 border-b pb-2 last:border-b-0 last:pb-0">
                                                                        <Image
                                                                            src={item.products?.imageUrl || '/images/placeholder.jpg'}
                                                                            alt={item.products?.name || 'Product'}
                                                                            width={35} height={47}
                                                                            className="rounded object-cover flex-shrink-0 bg-gray-200"
                                                                        />
                                                                        <div className="flex-grow">
                                                                            <p className="font-medium text-gray-800 leading-tight">{item.products?.name || 'Unknown Product'}</p>
                                                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                                                        </div>
                                                                        <p className="font-medium text-gray-800 whitespace-nowrap">${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;