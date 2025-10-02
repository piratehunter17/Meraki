import Link from 'next/link';
import ProductCard from './ProductCard';

const BestSellers = ({ products }) => {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-10">
                    <h4 className="uppercase font-heading text-2xl">Best Selling Items</h4>
                    <Link href="/shop" className="relative inline-block mt-3 uppercase text-sm font-bold after:content-[''] after:block after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">
                        View All Products
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BestSellers;