import { z } from 'zod';

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
  /(\b(OR|AND)\s+['"][\w\s]*['"])/i,
  /(--|\/\*|\*\/)/,
  /('|(\\')|('')|(\-\-)|(\;)|(\|)|(\*)|(\%)|(\,)|(\<)|(\>)|(\()|(\))|(\[)|(\])|(\{)|(\}))/
];

// Script injection patterns
const SCRIPT_INJECTION_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /eval\s*\(/gi,
  /alert\s*\(/gi,
  /confirm\s*\(/gi,
  /prompt\s*\(/gi,
  /document\.cookie/gi,
  /document\.write/gi,
  /window\.location/gi,
  /\.innerHTML/gi,
  /\.outerHTML/gi
];

// HTML injection patterns
const HTML_INJECTION_PATTERNS = [
  /<\/?[^>]+(>|$)/g,
  /&lt;[^&]*&gt;/gi,
  /&#x?[0-9a-f]+;/gi
];

export function validateInput(input: string, fieldName: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmedInput = input.trim();

  // Check for SQL injection
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(trimmedInput)) {
      return `${fieldName} contains potentially harmful SQL patterns`;
    }
  }

  // Check for script injection
  for (const pattern of SCRIPT_INJECTION_PATTERNS) {
    if (pattern.test(trimmedInput)) {
      return `${fieldName} contains potentially harmful script content`;
    }
  }

  // Check for HTML injection (except for specific fields that might allow basic HTML)
  const allowedHtmlFields = ['description', 'instructions', 'message', 'comment'];
  if (!allowedHtmlFields.includes(fieldName.toLowerCase())) {
    for (const pattern of HTML_INJECTION_PATTERNS) {
      if (pattern.test(trimmedInput)) {
        return `${fieldName} contains potentially harmful HTML content`;
      }
    }
  }

  return null;
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/['"]/g, '') // Remove quotes that could be used for injection
    .replace(/[\r\n\t]/g, ' ') // Replace newlines and tabs with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Validation schemas with enhanced security
export const secureUserRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .refine((val) => validateInput(val, 'Name') === null, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .refine((val) => validateInput(val, 'Email') === null, 'Email contains invalid characters'),
  
  mobile: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number')
    .refine((val) => validateInput(val, 'Mobile') === null, 'Mobile contains invalid characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character')
    .refine((val) => validateInput(val, 'Password') === null, 'Password contains invalid characters'),
  
  role: z.enum(['user', 'service_provider'], {
    errorMap: () => ({ message: 'Role must be either user or service_provider' })
  })
});

export const secureServiceSchema = z.object({
  name: z.string()
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name must be less than 100 characters')
    .refine((val) => validateInput(val, 'Service name') === null, 'Service name contains invalid characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .refine((val) => validateInput(val, 'Description') === null, 'Description contains invalid characters'),
  
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number with up to 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0'),
  
  categoryId: z.number()
    .int('Category ID must be an integer')
    .positive('Category ID must be positive'),
  
  duration: z.number()
    .int('Duration must be an integer')
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration must be less than 8 hours'),
  
  providerId: z.number()
    .int('Provider ID must be an integer')
    .positive('Provider ID must be positive')
});

export const secureBookingSchema = z.object({
  serviceId: z.number()
    .int('Service ID must be an integer')
    .positive('Service ID must be positive'),
  
  scheduledDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine((val) => new Date(val) > new Date(), 'Scheduled date must be in the future'),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address must be less than 255 characters')
    .refine((val) => validateInput(val, 'Address') === null, 'Address contains invalid characters'),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .refine((val) => validateInput(val, 'City') === null, 'City contains invalid characters'),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .refine((val) => !val || validateInput(val, 'Notes') === null, 'Notes contain invalid characters')
});



export const secureLoginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .refine((val) => validateInput(val, 'Email') === null, 'Email contains invalid characters'),
  
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters')
    .refine((val) => validateInput(val, 'Password') === null, 'Password contains invalid characters')
});

export const secureContactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .refine((val) => validateInput(val, 'Name') === null, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .refine((val) => validateInput(val, 'Email') === null, 'Email contains invalid characters'),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .refine((val) => !val || validateInput(val, 'Phone') === null, 'Phone contains invalid characters'),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters')
    .refine((val) => validateInput(val, 'Subject') === null, 'Subject contains invalid characters'),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .refine((val) => validateInput(val, 'Message') === null, 'Message contains invalid characters')
});

export const secureAddressSchema = z.object({
  type: z.enum(['home', 'work', 'other'], {
    errorMap: () => ({ message: 'Address type must be home, work, or other' })
  }),
  
  street: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address must be less than 100 characters')
    .refine((val) => validateInput(val, 'Street') === null, 'Street contains invalid characters'),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .refine((val) => validateInput(val, 'City') === null, 'City contains invalid characters'),
  
  area: z.string()
    .min(2, 'Area must be at least 2 characters')
    .max(50, 'Area must be less than 50 characters')
    .refine((val) => validateInput(val, 'Area') === null, 'Area contains invalid characters'),
  
  building: z.string()
    .min(1, 'Building must be at least 1 character')
    .max(50, 'Building must be less than 50 characters')
    .optional()
    .refine((val) => !val || validateInput(val, 'Building') === null, 'Building contains invalid characters'),
  
  floor: z.string()
    .min(1, 'Floor must be at least 1 character')
    .max(10, 'Floor must be less than 10 characters')
    .optional()
    .refine((val) => !val || validateInput(val, 'Floor') === null, 'Floor contains invalid characters'),
  
  apartment: z.string()
    .min(1, 'Apartment must be at least 1 character')
    .max(10, 'Apartment must be less than 10 characters')
    .optional()
    .refine((val) => !val || validateInput(val, 'Apartment') === null, 'Apartment contains invalid characters'),
  
  instructions: z.string()
    .max(200, 'Instructions must be less than 200 characters')
    .optional()
    .refine((val) => !val || validateInput(val, 'Instructions') === null, 'Instructions contains invalid characters'),
  
  isDefault: z.boolean().default(false)
});

export function validateAndSanitizeObject(obj: any, allowedFields: string[]): any {
  const sanitized: any = {};
  
  for (const field of allowedFields) {
    if (obj.hasOwnProperty(field)) {
      const value = obj[field];
      
      if (typeof value === 'string') {
        const validationError = validateInput(value, field);
        if (validationError) {
          throw new Error(validationError);
        }
        sanitized[field] = sanitizeInput(value);
      } else {
        sanitized[field] = value;
      }
    }
  }
  
  return sanitized;
}