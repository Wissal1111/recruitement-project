const validateUpdateUser = (req, res, next) => {
  const { firstname, lastname } = req.body;

  const errors = [];

  if (!firstname || typeof firstname !== 'string') {
    errors.push('Firstname is required and must be a string');
  } else if (firstname.trim().length === 0) {
    errors.push('Firstname cannot be empty');
  } else if (firstname.trim().length > 50) {
    errors.push('Firstname must be 50 characters or less');
  }

  if (!lastname || typeof lastname !== 'string') {
    errors.push('Lastname is required and must be a string');
  } else if (lastname.trim().length === 0) {
    errors.push('Lastname cannot be empty');
  } else if (lastname.trim().length > 50) {
    errors.push('Lastname must be 50 characters or less');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Trim and sanitize
  req.body.firstname = firstname.trim();
  req.body.lastname = lastname.trim();

  next();
};

module.exports = validateUpdateUser;