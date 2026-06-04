import { useAuth } from "../../context/AuthContext";
import { User } from "react-feather";

const Header = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex justify-end items-center">
      
      {user && (
        <div className="flex items-center space-x-2">
          <User className="text-[#757575]" />
          <span className="text-white">
            {user.display_name} ({user.role})
          </span>
        </div>
      )}
    </div>
  );
};

export default Header;