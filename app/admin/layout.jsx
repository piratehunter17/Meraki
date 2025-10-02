import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen bg-light">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}