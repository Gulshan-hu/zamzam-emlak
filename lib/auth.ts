import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export type AuthUser = User

export type SignInCredentials = {
  email: string
  password: string
}

export type SignUpData = {
  email: string
  password: string
  name: string
  phone: string
}

export type AuthError = {
  message: string
  code?: string
}

export type AuthResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: AuthError }

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse<AuthUser>> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: { message: 'Login failed. Please try again.' },
      }
    }

    return { success: true, data: data.user }
  } catch (err) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred. Please try again.' },
    }
  }
}

/**
 * Sign up with email, password, and user metadata
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  phone: string
): Promise<AuthResponse<AuthUser>> {
  try {
    // Validate password requirements
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: { message: passwordValidation.errors[0] || 'Invalid password' },
      }
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: { message: 'Registration failed. Please try again.' },
      }
    }

    return { success: true, data: data.user }
  } catch (err) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred. Please try again.' },
    }
  }
}

/**
 * Sign in with OAuth provider (Google)
 */
export async function signInWithOAuth(provider: 'google'): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      }
    }

    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred. Please try again.' },
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      }
    }

    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred. Please try again.' },
    }
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  } catch (err) {
    return null
  }
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      }
    }

    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred. Please try again.' },
    }
  }
}

/**
 * Update user password (for reset password flow)
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  try {
    // Validate password requirements
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: { message: passwordValidation.errors[0] || 'Invalid password' },
      }
    }

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      }
    }

    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred. Please try again.' },
    }
  }
}

/**
 * Validate password against requirements
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
    // Has special char or length > 12
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password) || password.length > 12) {
      strength = 'strong'
    } else {
      strength = 'medium'
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  }
}

/**
 * Format phone number to Azerbaijan format (+994XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // If starts with 994, add +
  if (cleaned.startsWith('994')) {
    return `+${cleaned}`
  }

  // If starts with 0, replace with +994
  if (cleaned.startsWith('0')) {
    return `+994${cleaned.slice(1)}`
  }

  // Otherwise, add +994
  return `+994${cleaned}`
}

/**
 * Validate Azerbaijan phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  // Azerbaijan numbers: +994 XX XXX XX XX (10 digits after country code)
  return /^\+994\d{9}$/.test(formatted)
}
