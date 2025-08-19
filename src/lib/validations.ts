// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}

export function validateDni(dni: string): boolean {
  // Validar que el DNI tenga al menos 7 caracteres y solo contenga números y letras
  const dniRegex = /^[A-Za-z0-9]{7,}$/;
  return dniRegex.test(dni.trim());
}

export interface RegisterFormData {
  name: string;
  email: string;
  dni: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export function validateRegisterForm(data: RegisterFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!validateName(data.name)) {
    errors.name = "El nombre debe tener al menos 2 caracteres";
  }

  if (!validateDni(data.dni)) {
    errors.dni = "El DNI debe tener al menos 7 caracteres y contener solo números y letras";
  }

  if (!validateEmail(data.email)) {
    errors.email = "Por favor ingresa un email válido";
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginForm(data: LoginFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!validateEmail(data.email)) {
    errors.email = "Por favor ingresa un email válido";
  }

  if (!data.password) {
    errors.password = "Por favor ingresa tu contraseña";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
