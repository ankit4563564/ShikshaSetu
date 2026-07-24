/**
 * Clerk Demo User Seed Script
 * 
 * This script creates demo users in Clerk for the ShikshaSetu application.
 * Run with: npx ts-node scripts/seed-clerk-users.ts
 */

import { createClerkClient } from '@clerk/clerk-sdk-node';

// Clerk configuration
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_VoTOk2PF0C61UnI5Y9WF4QdgKRPT6d9wm0dPgLvnum',
});

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

async function seedClerkUsers() {
  console.log('🌱 Starting Clerk user seed...\n');

  for (const user of DEMO_USERS) {
    try {
      console.log(`Creating user: ${user.email} (${user.role})`);
      
      // Check if user already exists
      try {
        const existingUser = await clerk.users.getUserList({
          emailAddress: [user.email],
        });
        
        const existingList = Array.isArray(existingUser) ? existingUser : (existingUser as any).data || [];
        if (existingList.length > 0) {
          console.log(`  ✅ User already exists, skipping\n`);
          continue;
        }
      } catch (error) {
        // User doesn't exist, continue with creation
      }

      // Create user
      const newUser = await clerk.users.createUser({
        emailAddress: [user.email],
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        publicMetadata: user.publicMetadata,
      });

      console.log(`  ✅ Created user with ID: ${newUser.id}\n`);
    } catch (error: any) {
      console.error(`  ❌ Error creating user ${user.email}:`, error.message);
      console.log(`     Continuing...\n`);
    }
  }

  console.log('✨ Clerk user seed complete!');
}

// Run the seed
seedClerkUsers().catch(console.error);
