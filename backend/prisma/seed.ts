import 'dotenv/config';
import { PrismaClient, SystemRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
});

const adapter = new PrismaPg(pool);

const db = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Seeding roles...');

  for (const roleName of ['ADMIN', 'OFFICER', 'VENDOR', 'MANAGER'] as SystemRole[]) {
    await db.role.upsert({
      where: { roleName },
      update: {},
      create: { roleName },
    });
  }

  console.log('Seeding default users...');

  const hash = await bcrypt.hash('password123', 12);

  const usersData = [
    { name: 'Admin User', email: 'admin@vendorbridge.com', role: 'ADMIN' as SystemRole },
    { name: 'Procurement Officer', email: 'officer@vendorbridge.com', role: 'OFFICER' as SystemRole },
    { name: 'Manager User', email: 'manager@vendorbridge.com', role: 'MANAGER' as SystemRole },
    { name: 'Vendor User', email: 'vendor@infra-supplies.com', role: 'VENDOR' as SystemRole },
  ];

  for (const u of usersData) {
    const role = await db.role.findUniqueOrThrow({ where: { roleName: u.role } });
    await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash: hash, roleId: role.id },
    });
  }

  console.log('Seeding sample vendors...');

  const vendors = [
    {
      vendorCode: 'VND-001',
      companyName: 'TechCore Supplies',
      contactName: 'Rahul Mehta',
      email: 'vendor@infra-supplies.com',
      phone: '+919876543210',
      gstNumber: '27AAACA1234A1Z1',
      category: 'IT',
      status: 'Active' as const,
      rating: 4.5,
      address: '101 Industrial Area, Pune',
    },
    {
      vendorCode: 'VND-002',
      companyName: 'OfficeWorld Ltd',
      contactName: 'Priya Shah',
      email: 'priya@officeworld.in',
      phone: '+912234567890',
      gstNumber: '27AABCW5678B2Z2',
      category: 'Furniture',
      status: 'Active' as const,
      rating: 4.2,
      address: '202 Business Park, Mumbai',
    },
  ];

  for (const v of vendors) {
    await db.vendor.upsert({ where: { vendorCode: v.vendorCode }, update: {}, create: v });
  }

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
