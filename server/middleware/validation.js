// Custom validation functions for exact challenge requirements

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email format';
  }
  return null;
}

export function validateName(name) {
  if (!name || typeof name !== 'string') return 'Name is required';
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  return null;
}

export function validateAddress(address) {
  if (!address || typeof address !== 'string') return 'Address is required';
  const trimmed = address.trim();
  if (trimmed.length === 0) return 'Address cannot be empty';
  if (trimmed.length > 400) {
    return 'Address must not exceed 400 characters';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters';
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return 'Password must include at least one uppercase letter';
  }
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecial) {
    return 'Password must include at least one special character';
  }
  return null;
}

export function validateRating(rating) {
  const parsed = Number(rating);
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return null;
}

export function validateUserRegistration(req, res, next) {
  const { name, email, password, address } = req.body;
  const errors = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  const addrErr = validateAddress(address);
  if (addrErr) errors.address = addrErr;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

export function validateAdminUserCreation(req, res, next) {
  const { name, email, password, address, role } = req.body;
  const errors = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  const addrErr = validateAddress(address);
  if (addrErr) errors.address = addrErr;

  const allowedRoles = ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
  if (!role || !allowedRoles.includes(role)) {
    errors.role = 'Role must be one of ADMIN, NORMAL_USER, or STORE_OWNER';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

export function validateStoreCreation(req, res, next) {
  const { name, email, address } = req.body;
  const errors = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addrErr = validateAddress(address);
  if (addrErr) errors.address = addrErr;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}
