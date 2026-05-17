const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const adminUser = await User.findById(req.user.id).select('role isBlocked');

    if (!adminUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (adminUser.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    if (adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Admin authorization error', error: err.message });
  }
};

module.exports = requireAdmin;

