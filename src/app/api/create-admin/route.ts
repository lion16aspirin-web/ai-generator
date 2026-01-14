import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Temporary endpoint to create admin user with correct password hash
// DELETE THIS FILE AFTER USE!
export async function GET() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete old admin if exists
    await prisma.user.deleteMany({
      where: { email: 'admin@example.com' },
    });

    // Create new admin with correct hash
    const user = await prisma.user.create({
      data: {
        id: 'admin-new-001',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'ADMIN',
        tokens: 1000000,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      login: {
        email: 'admin@example.com',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}


