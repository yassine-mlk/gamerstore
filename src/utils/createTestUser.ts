import { supabase } from '@/lib/supabase';

/**
 * WARNING: THIS IS FOR DEVELOPMENT USE ONLY.
 * 
 * This utility is for quickly creating test users during development.
 * In a production environment, you should use proper user management through the Supabase dashboard
 * or implement a secure user registration process.
 * 
 * NEVER include this file in production builds.
 */
export const createTestUser = async (
  email: string,
  password: string,
  role: 'super' | 'admin' | 'team' = 'admin',
  fullName: string = ''
) => {
  try {
    // Create user with email and password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Error creating test user:', error.message);
      return { success: false, error: error.message };
    }

    console.log('Test user created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error during test user creation:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

/**
 * Example usage:
 * 
 * // Create a super admin user
 * createTestUser('super@example.com', 'platform123', 'super', 'Super Admin');
 * 
 * // Create a store owner
 * createTestUser('owner@example.com', 'commerce123', 'admin', 'Store Owner');
 * 
 * // Create a team member
 * createTestUser('team@example.com', 'team123', 'team', 'Team Member');
 */ 