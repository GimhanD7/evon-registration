/**
 * Comprehensive Validation Utility for Evon Aravinda Commerce LMS
 * Validates WhatsApp mobile numbers and all user input fields.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface PhoneValidationResult extends ValidationResult {
  normalized: string;
}

/**
 * Normalizes a phone string by stripping spaces, dashes, parentheses.
 * Converts Sri Lankan country codes (+94 / 94) to local 07... format.
 */
export function normalizePhoneNumber(raw: string): string {
  let cleaned = (raw || "").trim().replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+94")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("94") && cleaned.length === 11) {
    cleaned = "0" + cleaned.slice(2);
  } else if (cleaned.startsWith("0094")) {
    cleaned = "0" + cleaned.slice(4);
  }
  return cleaned;
}

/**
 * Validates a WhatsApp mobile phone number.
 * Validates standard Sri Lankan 10-digit mobile numbers (070, 071, 072, 074, 075, 076, 077, 078)
 * as well as international formats.
 */
export function validateWhatsAppPhone(phone: string): PhoneValidationResult {
  const raw = (phone || "").trim();
  if (!raw) {
    return {
      valid: false,
      error: "WhatsApp phone number is required.",
      normalized: "",
    };
  }

  const normalized = normalizePhoneNumber(raw);
  const digitsOnly = normalized.replace(/\D/g, "");

  // Sri Lankan 10-digit mobile prefix check
  // Networks: 070, 071 (Mobitel), 072, 078 (Hutch), 074, 076, 077 (Dialog), 075 (Airtel)
  const slMobileRegex = /^07[01245678]\d{7}$/;
  if (slMobileRegex.test(normalized)) {
    return { valid: true, normalized };
  }

  // Length check
  if (digitsOnly.length < 9) {
    return {
      valid: false,
      error: "WhatsApp number is too short (must be 10 digits, e.g. 0771234567).",
      normalized,
    };
  }

  if (digitsOnly.length > 12) {
    return {
      valid: false,
      error: "WhatsApp number is too long. Please enter a 10-digit mobile number.",
      normalized,
    };
  }

  // If 10 digits but invalid prefix
  if (digitsOnly.length === 10) {
    if (!digitsOnly.startsWith("07")) {
      return {
        valid: false,
        error: "Sri Lankan mobile numbers must start with '07' (e.g. 077, 071, 076, 074, 078).",
        normalized,
      };
    }
    if (!slMobileRegex.test(digitsOnly)) {
      return {
        valid: false,
        error: "Invalid Sri Lankan mobile network prefix. Use a valid WhatsApp number.",
        normalized,
      };
    }
    return { valid: true, normalized: digitsOnly };
  }

  // International format check (starting with +)
  if (raw.startsWith("+") && /^\+\d{9,15}$/.test(raw.replace(/[\s\-]/g, ""))) {
    return { valid: true, normalized: raw.replace(/[\s\-]/g, "") };
  }

  return {
    valid: false,
    error: "Please enter a valid 10-digit WhatsApp number (e.g. 0771234567).",
    normalized,
  };
}

/**
 * Validates student full name.
 * Requires at least 3 characters and must contain alphabetical characters.
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { valid: false, error: "Student's full name is required." };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: "Full name must be at least 3 characters long." };
  }
  if (!/[a-zA-Z\u0D80-\u0DFF]/.test(trimmed)) {
    return { valid: false, error: "Full name must contain letters." };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: "Full name cannot exceed 100 characters." };
  }
  return { valid: true };
}

/**
 * Validates LMS password.
 * Must be at least 4 characters long.
 */
export function validatePassword(password: string): ValidationResult {
  const trimmed = (password || "").trim();
  if (!trimmed) {
    return { valid: false, error: "Password is required." };
  }
  if (trimmed.length < 4) {
    return { valid: false, error: "Password must be at least 4 characters long." };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "Password cannot exceed 50 characters." };
  }
  return { valid: true };
}

/**
 * Validates school name.
 */
export function validateSchool(school: string, required: boolean = true): ValidationResult {
  const trimmed = (school || "").trim();
  if (!trimmed) {
    if (required) {
      return { valid: false, error: "School name is required." };
    }
    return { valid: true };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: "School name must be at least 2 characters." };
  }
  return { valid: true };
}

/**
 * Validates Commerce batch selection.
 */
export function validateBatch(batch: string): ValidationResult {
  const trimmed = (batch || "").trim();
  if (!trimmed) {
    return { valid: false, error: "Please select an enrolled Commerce batch." };
  }
  return { valid: true };
}

/**
 * Validates parent contact phone number (optional or valid 10 digits).
 */
export function validateParentPhone(phone: string): PhoneValidationResult {
  const raw = (phone || "").trim();
  if (!raw) {
    return { valid: true, normalized: "" };
  }
  return validateWhatsAppPhone(raw);
}
