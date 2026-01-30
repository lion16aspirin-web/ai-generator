/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

// Error messages with localization
const errors = {
  invalidEmail: {
    en: 'Invalid email format',
    uk: 'Невірний формат email',
  },
  emailTooShort: {
    en: 'Email must be at least 3 characters',
    uk: 'Email повинен містити мінімум 3 символи',
  },
  emailTooLong: {
    en: 'Email must not exceed 255 characters',
    uk: 'Email не повинен перевищувати 255 символів',
  },
  passwordTooShort: {
    en: 'Password must be at least 6 characters',
    uk: 'Пароль повинен містити мінімум 6 символів',
  },
  passwordTooLong: {
    en: 'Password must not exceed 100 characters',
    uk: 'Пароль не повинен перевищувати 100 символів',
  },
  passwordWeak: {
    en: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    uk: 'Пароль повинен містити мінімум одну велику літеру, одну малу літеру та одну цифру',
  },
  passwordMismatch: {
    en: 'Passwords do not match',
    uk: 'Паролі не співпадають',
  },
  nameTooShort: {
    en: 'Name must be at least 2 characters',
    uk: "Ім'я повинно містити мінімум 2 символи",
  },
  nameTooLong: {
    en: 'Name must not exceed 100 characters',
    uk: "Ім'я не повинно перевищувати 100 символів",
  },
  userExists: {
    en: 'User with this email already exists',
    uk: 'Користувач з таким email вже існує',
  },
  serverError: {
    en: 'Internal server error',
    uk: 'Внутрішня помилка сервера',
  },
  invalidRequest: {
    en: 'Invalid request data',
    uk: 'Невірні дані запиту',
  },
};

// Map Zod error messages to our error keys
function getErrorKey(message: string): keyof typeof errors {
  if (message.includes('Invalid email format')) return 'invalidEmail';
  if (message.includes('Email must be at least')) return 'emailTooShort';
  if (message.includes('Email must not exceed')) return 'emailTooLong';
  if (message.includes('Password must be at least')) return 'passwordTooShort';
  if (message.includes('Password must not exceed')) return 'passwordTooLong';
  if (message.includes('uppercase') || message.includes('lowercase') || message.includes('number')) return 'passwordWeak';
  if (message.includes('Passwords do not match')) return 'passwordMismatch';
  if (message.includes('Name must be at least')) return 'nameTooShort';
  if (message.includes('Name must not exceed')) return 'nameTooLong';
  return 'invalidRequest';
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate data with Zod
    let validatedData;
    try {
      validatedData = registerSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        const errorKey = getErrorKey(firstError.message);
        const field = firstError.path[0] as string;

        return NextResponse.json(
          {
            error: 'Validation Error',
            message: errors[errorKey].en,
            messageUk: errors[errorKey].uk,
            field,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { name, email, password } = validatedData;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User Exists',
          message: errors.userExists.en,
          messageUk: errors.userExists.uk,
          field: 'email',
        },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
        tokens: 100, // Free tokens on registration
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tokens: true,
        createdAt: true,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        messageUk: 'Користувача успішно зареєстровано',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          tokens: user.tokens,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API error:', error);

    return NextResponse.json(
      {
        error: 'Internal Error',
        message: errors.serverError.en,
        messageUk: errors.serverError.uk,
      },
      { status: 500 }
    );
  }
}
