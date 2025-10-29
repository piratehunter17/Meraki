// /app/components/FeaturesSection.jsx
import React from 'react';

// --- Reusable Feature Component ---
const Feature = ({ iconId, title, description }) => (
    <div className="text-center py-5">
        <svg width="38" height="38" className="mx-auto text-gray-900 fill-current">
            <use xlinkHref={`#${iconId}`}></use>
        </svg>
        {/* Changed text-lg to text-2xl */}
        <h4 className="font-heading text-xl my-3 uppercase">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

// --- Features Section Component ---
const FeaturesSection = () => {
    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    <Feature iconId="calendar" title="Book An Appointment" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                    <Feature iconId="shopping-bag" title="Pick up in store" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                    <Feature iconId="gift" title="Special packaging" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                    <Feature iconId="arrow-cycle" title="Free global returns" description="At imperdiet dui accumsan sit amet nulla risus est ultricies quis." />
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;