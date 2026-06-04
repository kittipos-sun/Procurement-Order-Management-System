import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Frown } from "react-feather";

const NotFound = () => {
  const { user } = useAuth();

  const redirectUser = (role) => {
    switch (role) {
      case "Purchasing":
        return "/purchasing/dashboard";
      case "Accounting":
        return "/accounting/dashboard";
      case "Administrative":
        return "/administrative/dashboard";
      case "Admin":
        return "/admin/users";
      default:
        return "/";
    }
  };

  const dashboardPath = user ? redirectUser(user.role) : "/";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gradient-to-br from-[#424242] to-[#616161]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center text-[#757575]">
          <Frown size={48} />
        </div>
        
        <h1 className="text-4xl font-bold text-[#424242]">404</h1>
        <h2 className="text-2xl text-[#424242]">Page Not Found</h2>
        
        <p className="text-[#757575]">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="pt-4">
          <Link
            to={dashboardPath}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#424242] hover:bg-[#757575] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#424242] transition-colors"
          >
            <Home className="mr-2" size={16} />
            {user ? "Return to Dashboard" : "Return to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;