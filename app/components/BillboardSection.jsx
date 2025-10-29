// /app/components/BillboardSection.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BillboardSection = ({ newArrivalsData }) => {
    return (
        <section id="billboard" className="bg-light pt-24 pb-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading mt-4">New Collections</h1>
                    <p className="md:w-3/4 lg:w-1/2 mx-auto mt-4 text-gray-600 text-sm md:text-base">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe voluptas ut dolorum consequuntur, adipisci repellat! Eveniet commodi voluptatem voluptate.
                    </p>
                </div>
                {/* Billboard Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12">
                    {newArrivalsData && newArrivalsData.map(product => ( // Added check for data
                        <div key={product.id} className="group">
                            <div className="overflow-hidden aspect-[3/4] mb-3">
                                <Link href={`/product/${product.slug}`}>
                                    <Image
                                        src={product.imageUrl} alt={product.name} width={500} height={667}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </Link>
                            </div>
                            <div className="py-2">
                                <h5 className="uppercase text-sm md:text-lg font-heading truncate"><Link href={`/product/${product.slug}`} className="text-xl transition-colors">{product.name}</Link></h5>
                                <p className="text-gray-500 text-xs md:text-sm mt-1">Scelerisque duis aliquam qui lorem ipsum dolor amet.</p>
                                <Link href={`/product/${product.slug}`} className="relative inline-block mt-2 uppercase text-xs md:text-sm font-bold after:content-[''] after:block after:w-0 after:h-[1.5px] after:bg-black after:transition-all after:duration-300 hover:after:w-full">Discover Now</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BillboardSection;