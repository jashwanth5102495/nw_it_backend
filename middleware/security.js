const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true
});

// Rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per windowMs for admin routes
  message: {
    success: false,
    message: 'Too many requests to admin endpoints, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Input validation for admin login
const validateAdminLogin = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Username must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username contains invalid characters')
    .escape(), // Escape HTML entities
  
  body('password')
    .isLength({ min: 1, max: 50 })
    .withMessage('Password must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/)
    .withMessage('Password contains invalid characters')
    .trim(),
];

// Input validation for general text fields
const validateTextInput = (fieldName, minLength = 1, maxLength = 100) => [
  body(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
    .escape()
];

// Input validation for email fields
const validateEmail = (fieldName) => [
  body(fieldName)
    .trim()
    .isEmail()
    .withMessage(`${fieldName} must be a valid email address`)
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage(`${fieldName} must be less than 100 characters`)
];

// Input validation for numeric fields
const validateNumeric = (fieldName, min = 0, max = 999999999) => [
  body(fieldName)
    .isNumeric()
    .withMessage(`${fieldName} must be a number`)
    .isFloat({ min, max })
    .withMessage(`${fieldName} must be between ${min} and ${max}`)
];

// Input validation for dates
const validateDate = (fieldName) => [
  body(fieldName)
    .isISO8601()
    .withMessage(`${fieldName} must be a valid date`)
    .toDate()
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// SQL injection prevention middleware
const preventSQLInjection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(\s*\d+\s*\))/gi,
    /(\b(CAST|CONVERT|SUBSTRING|ASCII|CHAR_LENGTH)\s*\()/gi
  ];

  const checkForSQLInjection = (obj, path = '') => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === 'string') {
          for (const pattern of sqlInjectionPatterns) {
            if (pattern.test(value)) {
              console.warn(`Potential SQL injection detected in ${currentPath}: ${value}`);
              return res.status(400).json({
                success: false,
                message: 'Invalid input detected. Please check your data and try again.',
                code: 'INVALID_INPUT'
              });
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          const result = checkForSQLInjection(value, currentPath);
          if (result) return result;
        }
      }
    }
    return null;
  };

  // Check request body
  if (req.body) {
    const result = checkForSQLInjection(req.body);
    if (result) return result;
  }

  // Check query parameters
  if (req.query) {
    const result = checkForSQLInjection(req.query);
    if (result) return result;
  }

  // Check URL parameters
  if (req.params) {
    const result = checkForSQLInjection(req.params);
    if (result) return result;
  }

  next();
};

// XSS prevention middleware
const preventXSS = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi
  ];

  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          console.warn(`Potential XSS detected: ${value}`);
          return res.status(400).json({
            success: false,
            message: 'Invalid input detected. HTML/JavaScript content is not allowed.',
            code: 'XSS_DETECTED'
          });
        }
      }
    }
    return null;
  };

  // Check all input sources
  const checkObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          const result = sanitizeValue(value);
          if (result) return result;
        } else if (typeof value === 'object' && value !== null) {
          const result = checkObject(value);
          if (result) return result;
        }
      }
    }
    return null;
  };

  if (req.body) {
    const result = checkObject(req.body);
    if (result) return result;
  }

  if (req.query) {
    const result = checkObject(req.query);
    if (result) return result;
  }

  next();
};

module.exports = {
  loginLimiter,
  adminLimiter,
  validateAdminLogin,
  validateTextInput,
  validateEmail,
  validateNumeric,
  validateDate,
  handleValidationErrors,
  securityHeaders,
  preventSQLInjection,
  preventXSS
};