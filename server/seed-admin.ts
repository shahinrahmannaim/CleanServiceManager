import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
  try {
    // Admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@panaroma.qa';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';
    
    // Super admin user
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@panaroma.qa';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!@#';

    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.insert(users).values({
        email: adminEmail,
        mobile: '+97444445555',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        name: 'Admin User',
        accountType: 'individual'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Check if super admin already exists
    const existingSuperAdmin = await db.select().from(users).where(eq(users.email, superAdminEmail));
    if (existingSuperAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      await db.insert(users).values({
        email: superAdminEmail,
        mobile: '+97444445556',
        password: hashedPassword,
        role: 'superadmin',
        isVerified: true,
        name: 'Super Admin',
        accountType: 'individual'
      });
      console.log('Super admin user created successfully');
    } else {
      console.log('Super admin user already exists');
    }

    console.log('Admin seeding completed!');
    console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
    console.log(`Super Admin login: ${superAdminEmail} / ${superAdminPassword}`);
    
  } catch (error) {
    console.error('Error seeding admin users:', error);
  }
}

// Run the seed function
seedAdmin().finally(() => {
  process.exit(0);
});