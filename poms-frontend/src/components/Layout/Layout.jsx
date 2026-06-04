import { Outlet } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navbar (Fixed on the left) */}
      <div className="w-64 fixed h-screen bg-[#424242] shadow-lg">
        <Navbar />
      </div>

      {/* Main Content (Offset by Navbar width) */}
      <div className="flex flex-col flex-grow ml-64">
        {/* Header */}
        <header className="bg-[#424242] p-4 text-white shadow-md">
          <Header />
        </header>

        {/* Main Content */}
        <main className="flex-grow p-2 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="bg-white rounded-lg shadow-lg p-2 min-h-[calc(100vh-140px)]">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#424242] p-4 text-white text-center text-sm">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Layout;