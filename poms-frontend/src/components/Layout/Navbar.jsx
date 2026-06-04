import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Home, ShoppingCart, BookOpen, 
  FileText, Users, Settings, 
  Activity, LogOut 
} from "react-feather";
import Swal from "sweetalert2";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of the system",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#424242',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: `
        rgba(66, 66, 66, 0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          confirmButtonColor: '#424242',
          background: '#fff'
        });
      }
    });
  };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="p-4 h-full flex flex-col">
      <div className="mb-8 p-4 border-b border-[#757575]">
        <h2 className="text-white text-xl font-bold">POMS</h2>
        <p className="text-[#757575] text-sm">Management System</p>
      </div>

      <div className="flex flex-col space-y-2 flex-grow">
        {(user.role === "Purchasing" || user.role === "Admin") && (
          <>
            <NavLink to="/purchasing/dashboard" icon={<Home size={18} />} active={isActive('/purchasing/dashboard')}>
              {user.role === "Purchasing" ? "Dashboard" : "PR Dashboard"}
            </NavLink>
            <NavLink to="/purchasing/inventory" icon={<ShoppingCart size={18} />} active={isActive('/purchasing/inventory')}>
              PR List
            </NavLink>
            <NavLink to="/purchasing/history" icon={<BookOpen size={18} />} active={isActive('/purchasing/history')}>
              PR History
            </NavLink>
          </>
        )}

        {(user.role === "Accounting" || user.role === "Admin") && (
          <>
            <NavLink to="/accounting/dashboard" icon={<Home size={18} />} active={isActive('/accounting/dashboard')}>
              {user.role === "Accounting" ? "Dashboard" : "ACC Dashboard"}
            </NavLink>
            <NavLink to="/accounting/history" icon={<FileText size={18} />} active={isActive('/accounting/history')}>
              ACC History
            </NavLink>
          </>
        )}

        {(user.role === "Administrative" || user.role === "Admin") && (
          <>
            <NavLink to="/administrative/dashboard" icon={<Home size={18} />} active={isActive('/administrative/dashboard')}>
              {user.role === "Administrative" ? "Dashboard" : "Administrative"}
            </NavLink>
            <NavLink to="/administrative/order-tracking" icon={<ShoppingCart size={18} />} active={isActive('/administrative/order-tracking')}>
              Orders Tracking
            </NavLink>
            <NavLink to="/administrative/inventory" icon={<FileText size={18} />} active={isActive('/administrative/inventory')}>
              Inventory
            </NavLink>
            <NavLink to="/administrative/history" icon={<BookOpen size={18} />} active={isActive('/administrative/history')}>
              Order History
            </NavLink>
          </>
        )}

        {user.role === "Admin" && (
          <>
            <NavLink to="/admin/users" icon={<Users size={18} />} active={isActive('/admin/users')}>
              Users
            </NavLink>
            <NavLink to="/admin/activity-log" icon={<Activity size={18} />} active={isActive('/admin/activity-log')}>
              Activity
            </NavLink>
            <NavLink to="/admin/settings" icon={<Settings size={18} />} active={isActive('/admin/settings')}>
              Settings
            </NavLink>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center space-x-2 text-white hover:bg-[#757575] p-2 rounded transition-colors cursor-pointer"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </nav>
  );
};

const NavLink = ({ to, icon, children, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 p-2 rounded transition-colors ${
      active ? 'bg-[#757575] text-white' : 'text-[#757575] hover:bg-[#757575] hover:text-white'
    }`}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;