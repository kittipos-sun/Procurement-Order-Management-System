const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, 'users.json');
const saltRounds = 10;

async function createFirstAdmin() {
  const initialAdmin = {
    userId: 'U001',
    username: 'admin',
    password: await bcrypt.hash('admin', saltRounds),
    display_name: 'Initial Administrator',
    role: 'Admin'
  };

  fs.writeFileSync(usersFilePath, JSON.stringify([initialAdmin], null, 2));
  console.log('Initial admin created successfully!');
}

createFirstAdmin().catch(console.error);