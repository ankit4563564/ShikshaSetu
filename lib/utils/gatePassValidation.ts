/**
 * Gate Pass Time Validation Utilities
 * Ensures pickup times are within school operating hours
 */

export interface SchoolHours {
  openTime: string; // "07:00"
  closeTime: string; // "18:00"
  breakStart?: string; // "12:00"
  breakEnd?: string; // "13:00"
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

// Default school hours
const DEFAULT_SCHOOL_HOURS: SchoolHours = {
  openTime: '07:00',
  closeTime: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
};

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function validatePickupTime(
  pickupTime: string,
  schoolHours: SchoolHours = DEFAULT_SCHOOL_HOURS
): ValidationResult {
  try {
    const pickupMinutes = timeToMinutes(pickupTime);
    const openMinutes = timeToMinutes(schoolHours.openTime);
    const closeMinutes = timeToMinutes(schoolHours.closeTime);

    if (pickupMinutes < openMinutes) {
      return {
        isValid: false,
        error: `Pickup time must be after ${schoolHours.openTime}`,
        suggestion: `Select time between ${schoolHours.openTime} and ${schoolHours.closeTime}`,
      };
    }

    if (pickupMinutes > closeMinutes) {
      return {
        isValid: false,
        error: `Pickup time must be before ${schoolHours.closeTime}`,
        suggestion: `Select time between ${schoolHours.openTime} and ${schoolHours.closeTime}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid time format. Use HH:MM (e.g., 14:30)',
    };
  }
}

export function validateGatePassRequest(
  pickupDate: Date,
  pickupTime: string,
  reason: string,
  schoolHours?: SchoolHours
): ValidationResult {
  // Validate time
  const timeValidation = validatePickupTime(pickupTime, schoolHours);
  if (!timeValidation.isValid) {
    return timeValidation;
  }

  // Validate date not in past
  const now = new Date();
  if (pickupDate < now) {
    return {
      isValid: false,
      error: 'Pickup date cannot be in the past',
    };
  }

  // Validate reason
  if (!reason || reason.trim().length < 3) {
    return {
      isValid: false,
      error: 'Please provide a reason (minimum 3 characters)',
    };
  }

  return { isValid: true };
}
