import Image from 'next/image';
import Link from 'next/link';

/**
 * A reusable product card component that matches the Kaira template.
 * @param {object} props - The component props.
 * @param {object} props.product - The product object to display.
 * @param {string} props.product.name - The name of the product.
 * @param {string} props.product.price - The price of the product.
 * @param {string} props.product.imageUrl - The URL of the product image.
 * @param {string} props.product.slug - The URL slug for the product page.
 */
const ProductCard = ({ product }) => {
    const { name, price, imageUrl, slug } = product;

    return (
        <div className="text-center group">
            {/* Image Container with Hover Effects */}
            <div className="relative overflow-hidden">
                <Link href={`/product/${slug}`}>
                    <Image 
                        src={imageUrl} 
                        alt={name} 
                        width={500} 
                        height={650} 
                        className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-110" 
                    />
                </Link>
                <button className="absolute top-4 right-4 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-primary">
                    <svg width="24" height="24"><use xlinkHref="#heart"></use></svg>
                </button>
            </div>
            
            {/* Product Content */}
            <div className="mt-4">
                <h5 className="uppercase text-lg font-heading">
                    <Link href={`/product/${slug}`} className="hover:text-primary transition-colors">{name}</Link>
                </h5>

                {/* --- THIS IS THE CORRECTED ANIMATION BLOCK --- */}
                <Link 
                    href={`/product/${slug}`} 
                    className="relative block h-6 mt-1 overflow-hidden text-gray-700"
                >
                    <span className="block transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                        ${price}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0 uppercase text-sm text-primary">
                        See Details
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;