const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;

    // Privacy/Security: block prevented access to all protected routes
    const authUser = await User.findById(req.user.id).select('isBlocked');
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (authUser.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

module.exports = auth;

