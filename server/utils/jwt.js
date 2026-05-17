const jwt = require('jsonwebtoken');

const generateToken = ({ id, role }) => {
  return jwt.sign(
    { id, role: role || 'user' },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    {
      expiresIn: '7d',
    }
  );
};


const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
