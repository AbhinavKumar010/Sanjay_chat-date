const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const { name, email, password, age, gender, preferenceGender } = req.body;

    // Validate required fields
    if (!name || !email || !password || !age || !gender || !preferenceGender) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    let profilePhotoPath = '';
    if (req.file) {
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      profilePhotoPath = `${hostUrl}/uploads/${req.file.filename}`;
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      age,
      gender,
      preferenceGender,
      profilePhoto: profilePhotoPath,
    });

    await user.save();
    const token = generateToken({ id: user._id, role: user.role });


    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }


    const token = generateToken({ id: user._id, role: user.role });


    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('likes', 'name profilePhoto age')
      .populate('matches', 'name profilePhoto age');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user.toObject?.() ?? user,
      role: user.role,
      isBlocked: user.isBlocked,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, interests, location, preferenceGender } = req.body;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) currentUser.name = name;
    if (bio) currentUser.bio = bio;
    if (preferenceGender) currentUser.preferenceGender = preferenceGender;

    if (typeof interests === 'string') {
      currentUser.interests = interests
        .split(',')
        .map((interest) => interest.trim())
        .filter(Boolean);
    } else if (Array.isArray(interests)) {
      currentUser.interests = interests;
    }

    if (location) {
      currentUser.location = typeof location === 'string' ? { city: location } : location;
    }

    if (req.file) {
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      currentUser.profilePhoto = `${hostUrl}/uploads/${req.file.filename}`;
    }

    await currentUser.save();

    res.json({ message: 'Profile updated successfully', user: currentUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
