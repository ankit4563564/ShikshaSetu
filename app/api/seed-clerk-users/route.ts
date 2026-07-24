/**
 * Clerk Demo User Seed API Route
 * 
 * POST /api/seed-clerk-users
 * Creates demo users in Clerk for the ShikshaSetu application.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Demo user definitions
const DEMO_USERS = [
  {
    email: 'teacher@shikshasetu.com',
    firstName: 'Ananya',
    lastName: 'Mehra',
    password: 'ShikshaSetu2026!',
    role: 'teacher',
    publicMetadata: {
      role: 'teacher',
      teacherId: 'a1000000-0000-4000-8000-000000000001',
    },
  },
  {
    email: 'parent@shikshasetu.com',
    firstName: 'Sunita',
    lastName: 'Sharma',
    password: 'ShikshaSetu2026!',
    role: 'parent',
    publicMetadata: {
      role: 'parent',
      guardianId: 'c1000000-0000-4000-8000-000000000001',
    },
  },
  {
    email: 'student@shikshasetu.com',
    firstName: 'Aarav',
    lastName: 'Sharma',
    password: 'ShikshaSetu2026!',
    role: 'student',
    publicMetadata: {
      role: 'student',
      studentId: 'b1000000-0000-4000-8000-000000000001',
    },
  },
  {
    email: 'gate@shikshasetu.com',
    firstName: 'Gate',
    lastName: 'Security',
    password: 'ShikshaSetu2026!',
    role: 'gate',
    publicMetadata: {
      role: 'gate',
    },
  },
  {
    email: 'driver@shikshasetu.com',
    firstName: 'Driver',
    lastName: 'Demo',
    password: 'ShikshaSetu2026!',
    role: 'driver',
    publicMetadata: {
      role: 'driver',
    },
  },
  {
    email: 'vendor@shikshasetu.com',
    firstName: 'Vendor',
    lastName: 'Demo',
    password: 'ShikshaSetu2026!',
    role: 'vendor',
    publicMetadata: {
      role: 'vendor',
    },
  },
  {
    email: 'admin@shikshasetu.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'ShikshaSetu2026!',
    role: 'admin',
    publicMetadata: {
      role: 'admin',
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    console.log('🌱 Starting Clerk user seed...\n');

    const results = [];

    for (const user of DEMO_USERS) {
      try {
        console.log(`Creating user: ${user.email} (${user.role})`);
        
        // Check if user already exists
        try {
          const existingUsers = await clerkClient().users.getUserList({
            emailAddress: [user.email],
          });
          
          if (existingUsers.data.length > 0) {
            console.log(`  ✅ User already exists, skipping\n`);
            results.push({ email: user.email, status: 'exists', userId: existingUsers.data[0].id });
            continue;
          }
        } catch (error) {
          // User doesn't exist, continue with creation
        }

        // Create user
        const newUser = await clerkClient().users.createUser({
          emailAddress: [user.email],
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          publicMetadata: user.publicMetadata,
        });

        console.log(`  ✅ Created user with ID: ${newUser.id}\n`);
        results.push({ email: user.email, status: 'created', userId: newUser.id });
      } catch (error: any) {
        console.error(`  ❌ Error creating user ${user.email}:`, error.message);
        console.log(`     Continuing...\n`);
        results.push({ email: user.email, status: 'error', error: error.message });
      }
    }

    console.log('✨ Clerk user seed complete!');

    return NextResponse.json({
      success: true,
      results,
      message: 'Clerk user seed completed',
    });
  } catch (error: any) {
    console.error('Seed script error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
