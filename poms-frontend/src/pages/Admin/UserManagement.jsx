import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { User, Edit, Trash2, Plus, Lock } from 'react-feather';

const AdminUserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
    role: 'Purchasing'
  });

  const roles = ['Purchasing', 'Accounting', 'Administrative', 'Admin'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      Swal.fire('Error!', 'Failed to fetch users', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/users', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      Swal.fire('Success!', 'User created successfully', 'success');
      setShowAddForm(false);
      setFormData({
        username: '',
        password: '',
        display_name: '',
        role: 'Purchasing'
      });
      fetchUsers();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.error || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/users/${editingUser.userId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      Swal.fire('Success!', 'User updated successfully', 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleForcePasswordReset = async (userId) => {
    try {
      await axios.put(`http://localhost:3000/api/users/${userId}`, {
        password: userId,
        force_password_reset: true
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      Swal.fire('Success!', 'Password reset initiated', 'success');
      fetchUsers();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.error || 'Failed to reset password', 'error');
    }
  };

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#424242',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          fetchUsers();
        } catch (error) {
          Swal.fire('Error!', error.response?.data?.error || 'Failed to delete user', 'error');
        }
      }
    });
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      display_name: user.display_name,
      role: user.role
    });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-[#424242]">Please log in to access this page</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#424242]"></div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#424242]">User Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-[#424242] text-white px-4 py-2 rounded-md hover:bg-[#757575] transition-colors"
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          <form onSubmit={handleAddUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md"
                  required
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-[#707070] rounded-md text-[#424242] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#424242] text-white rounded-md hover:bg-[#757575]"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit User</h2>
          <form onSubmit={handleUpdateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424242] mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#707070] rounded-md"
                  required
                  disabled={user?.userId === editingUser.userId}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-[#707070] rounded-md text-[#424242] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#424242] text-white rounded-md hover:bg-[#757575]"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#424242]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Display Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((userItem) => (
              <tr key={userItem.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#424242]">{userItem.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#424242]">{userItem.display_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#424242]">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    userItem.role === 'Admin' ? 'bg-gray-200 text-black' :
                    userItem.role === 'Purchasing' ? 'bg-red-100 text-red-800' :
                    userItem.role === 'Accounting' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userItem.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => startEditing(userItem)}
                      className="text-[#424242] hover:text-[#757575] p-1"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleForcePasswordReset(userItem.userId)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Force Password Reset"
                    >
                      <Lock size={18} />
                    </button>
                    {userItem.userId !== user?.userId && (
                      <button
                        onClick={() => handleDeleteUser(userItem.userId)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;