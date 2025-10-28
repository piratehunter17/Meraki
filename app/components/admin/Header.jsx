// /app/components/admin/Header.jsx
'use client'; // Needed if it uses client-side interactions like onClick

// Pass onToggleSidebar function as a prop
const Header = ({ onToggleSidebar }) => {
    return (
        // UPDATED: Removed lg:justify-end to keep justify-between on all screens
        <header className="bg-white shadow-sm p-4 border-b flex items-center justify-between"> 
            
            {/* Wrapper for left-side items */}
            <div className="flex items-center gap-4">
                {/* Hamburger button - visible only on smaller screens */}
                <button 
                    onClick={onToggleSidebar} 
                    className="text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden" // Hidden on lg screens and up
                    aria-label="Toggle sidebar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>

                {/* NEW: Title added */}
                <h1 className="text-3xl font-heading font-medium text-gray-800">
                    Admin <span className="text-primary">Dashboard</span>
                </h1>
            </div>

            {/* Existing content can go here, like user profile, notifications etc. */}
             {/* This div will be pushed to the right by justify-between */}
             <div className="flex items-center gap-4">
                 {/* Example: User Profile Dropdown Trigger */}
                 {/* <button className="p-2 rounded-full hover:bg-gray-100">
                     <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> ... </svg>
                 </button> */}
             </div>
        </header>
    );
};

export default Header;