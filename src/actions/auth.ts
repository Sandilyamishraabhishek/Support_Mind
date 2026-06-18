'use server';

import { signIn, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

export async function logoutUser() {
  await signOut({ redirectTo: '/login' });
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const isAdmin = formData.get('isAdmin') === 'on';

  if (!name || !email || !password) {
    return { error: 'Missing required fields' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    });

    return { success: 'User created successfully. Please log in.' };
  } catch (error) {
    return { error: 'Failed to create user' };
  }
}

export async function loginUser(formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    throw error;
  }
}
