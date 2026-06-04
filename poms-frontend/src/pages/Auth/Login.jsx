import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const HandleLoginError = (e) => {
    Swal.fire({
      icon: "error",
      title: "Login failed",
      text: e,
      confirmButtonColor: "#424242",
    });
  };

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { username, password }
      );

      if (response.data.token) {
        login(response.data.token, response.data.role, response.data.display_name);
        // Use either the original requested path or role-based default
        const redirectPath = from !== "/" ? from : redirectUser(response.data.role);
        navigate(redirectPath, { replace: true });
      } else {
        HandleLoginError();
      }
    } catch (err) {
      setError("Invalid username or password");
      HandleLoginError(error);
      document.getElementById("password").value = "";
      document.getElementById("password").focus();
    }
  };

  return (
    <div className="login-background min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        {/* Logo/Header Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#424242]">POMS</h2>
          <p className="mt-2 text-[#757575]">
            Purchase Order Management System
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#424242]"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-[#707070] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#424242] focus:border-[#424242]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#424242]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-[#707070] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#424242] focus:border-[#424242]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#424242] hover:bg-[#757575] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#424242] transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[#757575]">
          <p>© {new Date().getFullYear()} CSI204-Group03</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
