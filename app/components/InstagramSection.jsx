import Image from 'next/image';
import Link from 'next/link';

const InstagramSection = ({ instagramImages }) => {
    return (
        <section className="relative overflow-hidden group">

            {/* The image grid - shows 3 on mobile, 6 on desktop */}
            <div className="grid grid-cols-3 md:grid-cols-6 transition-transform duration-500 ease-in-out group-hover:scale-105">
                {instagramImages.map((src, index) => (
                    <div key={index} className={index >= 3 ? 'hidden md:block' : ''}>
                        <Image
                            src={src}
                            alt={`Instagram post ${index + 1}`}
                            width={400}
                            height={400}
                            className="w-full h-auto"
                        />
                    </div>
                ))}
            </div>

            {/* Single overlay for the entire section with a centered logo */}
            {/* ✨ Modified alignment to items-start and added pt-16 for vertical positioning ✨ */}
            <div className="absolute inset-0 bg-zinc-900 bg-opacity-50 flex items-start justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pt-16">
                <svg
                    className="w-16 h-16 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            </div>

            {/* The button on top */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full text-center">
                <Link
                    href="#"
                    className="bg-zinc-800 text-white uppercase py-3 px-8 hover:bg-gray-700 transition-colors inline-block w-11/12 max-w-xs md:w-auto"
                >
                    Follow us on Instagram
                </Link>
            </div>

        </section>
    );
};

export default InstagramSection;