import { db } from './src/config/database';
import { generateVendorCode } from './src/utils/generateNumber';

async function fix() {
  const users = await db.user.findMany({
    where: { role: { roleName: 'VENDOR' } }
  });
  
  for (const u of users) {
    const existing = await db.vendor.findUnique({ where: { email: u.email } });
    if (!existing) {
      console.log(`Fixing vendor profile for ${u.email}...`);
      await db.vendor.create({
        data: {
          vendorCode: await generateVendorCode(),
          companyName: `${u.name} Company`,
          contactName: u.name,
          email: u.email,
          phone: '0000000000',
          gstNumber: `GST-${Date.now().toString().slice(-6)}`,
          category: 'General',
          address: 'Pending Address',
        }
      });
      console.log(`Fixed.`);
    }
  }
}
fix().catch(console.error).finally(() => process.exit(0));
