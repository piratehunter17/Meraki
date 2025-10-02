import Link from 'next/link';

const Footer = () => {
    return (
        <footer id="footer" className="mt-5">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap py-12">

                    {/* --- LEFT COLUMN: ABOUT --- */}
                    <div className="w-full lg:w-1/3 mb-8 lg:mb-0 text-center sm:text-left">
                        <div className="footer-menu pr-8">
                            <Link href="/" className="mb-4 inline-block">
                                <svg width="140" height="45" viewBox="0 0 140 45" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="35" fontFamily="Marcellus, serif" fontSize="40px" fill="#111" letterSpacing="1" fontWeight="400">PRADII</text>
                                </svg>
                            </Link>
                            <p className="text-sm">Gravida massa volutpat aenean odio. Amet, turpis erat nullam fringilla elementum diam in. Nisi, purus vitae, ultrices nunc. Sit ac sit suscipit hendrerit.</p>
                            <div className="flex gap-3 mt-4 justify-center sm:justify-start">
                                <a href="#" className="text-secondary"><svg width="24" height="24"><use xlinkHref="#facebook"></use></svg></a>
                                <a href="#" className="text-secondary"><svg width="24" height="24"><use xlinkHref="#twitter"></use></svg></a>
                                <a href="#" className="text-secondary"><svg width="24" height="24"><use xlinkHref="#instagram"></use></svg></a>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: REMAINING LINKS --- */}
                    <div className="w-full lg:w-2/3">
                        {/* ✨ This container now pushes the two columns to the right on desktop */}
                        <div className="flex flex-wrap lg:justify-end gap-x-16 gap-y-8">
                            
                            {/* Column 1: Help & Info */}
                            <div className="w-full sm:w-1/2 lg:w-auto text-center sm:text-left">
                                <h5 className="uppercase mb-4 font-heading">Help & Info</h5>
                                <ul className="list-none text-uppercase text-sm">
                                    <li className="mb-2"><a href="#" className="item-anchor">Track Your Order</a></li>
                                    <li className="mb-2"><a href="#" className="item-anchor">Returns + Exchanges</a></li>
                                    <li className="mb-2"><a href="#" className="item-anchor">Shipping + Delivery</a></li>
                                    <li className="mb-2"><a href="#" className="item-anchor">Contact Us</a></li>
                                    <li className="mb-2"><a href="#" className="item-anchor">Faqs</a></li>
                                </ul>
                            </div>

                            {/* Column 2: Contact Us */}
                            <div className="w-full sm:w-1/2 lg:w-auto text-center sm:text-left">
                                <h5 className="uppercase mb-4 font-heading">Contact Us</h5>
                                <p className="text-sm">Do you have any questions or suggestions? <a href="mailto:contact@yourcompany.com" className="item-anchor block">contact@yourcompany.com</a></p>
                                <p className="text-sm mt-2">Do you need support? Give us a call. <a href="tel:+43720115278" className="item-anchor block">+43 720 11 52 78</a></p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* --- Bottom Bar --- */}
            <div className="border-t py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="w-full md:w-1/2"></div>
                        <div className="w-full md:w-1/2 text-center md:text-right">
                            <p className="text-sm">© Copyright 2025 Pradii. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;