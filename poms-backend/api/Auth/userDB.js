const fs = require('../../db/mysqlStore');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, 'users.json');

// Helper function to read users
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper function to write users
const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

// Generate a new user ID
const generateUserId = () => {
  const users = readUsers();
  if (users.length === 0) return 'U001';
  const lastId = users[users.length - 1].userId;
  const num = parseInt(lastId.substring(1)) + 1;
  return 'U' + num.toString().padStart(3, '0');
};

// Create a new user
const createUser = async (userData) => {
  const users = readUsers();
  const existingUser = users.find(u => u.username === userData.username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUser = {
    userId: generateUserId(),
    username: userData.username,
    password: hashedPassword,
    display_name: userData.display_name,
    role: userData.role
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
};

// Get all users (for admin)
const getAllUsers = () => {
  return readUsers().map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Get user by ID
const getUserById = (userId) => {
  const users = readUsers();
  const user = users.find(u => u.userId === userId);
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Update user
const updateUser = async (userId, updateData) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.userId === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Don't allow changing username
  if (updateData.username && updateData.username !== users[userIndex].username) {
    throw new Error('Username cannot be changed');
  }

  // Hash new password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = {
    ...users[userIndex],
    ...updateData
  };

  users[userIndex] = updatedUser;
  writeUsers(users);

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// Delete user
const deleteUser = (userId) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.userId === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const deletedUser = users.splice(userIndex, 1)[0];
  writeUsers(users);

  const { password, ...userWithoutPassword } = deletedUser;
  return userWithoutPassword;
};

// Authenticate user
const authenticateUser = async (username, password) => {
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  authenticateUser
};
