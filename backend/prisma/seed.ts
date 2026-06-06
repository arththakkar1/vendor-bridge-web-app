import 'dotenv/config';
import { SystemRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { db } from '../src/config/database';

async function main() {
  console.log('Seeding roles...');

  for (const roleName of ['ADMIN', 'OFFICER', 'VENDOR', 'MANAGER'] as SystemRole[]) {
    await db.role.upsert({
      where: { roleName },
      update: {},
      create: { roleName },
    });
  }

  console.log('Appending new dummy data (without deleting to respect immutable activity_logs)...');

  console.log('Seeding default test users...');
  const hash = await bcrypt.hash('password123', 12);

  const defaultUsersData = [
    { name: 'Admin User', email: 'admin@vendorbridge.com', role: 'ADMIN' as SystemRole },
    { name: 'Procurement Officer', email: 'officer@vendorbridge.com', role: 'OFFICER' as SystemRole },
    { name: 'Manager User', email: 'manager@vendorbridge.com', role: 'MANAGER' as SystemRole },
    { name: 'Vendor User', email: 'vendor@infra-supplies.com', role: 'VENDOR' as SystemRole },
  ];

  for (const u of defaultUsersData) {
    const role = await db.role.findUniqueOrThrow({ where: { roleName: u.role } });
    await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash: hash, roleId: role.id },
    });
  }

  const officer = await db.user.findUniqueOrThrow({ where: { email: 'officer@vendorbridge.com' } });
  const manager = await db.user.findUniqueOrThrow({ where: { email: 'manager@vendorbridge.com' } });

  console.log('Seeding multiple random vendors and vendor users...');
  const vendorRole = await db.role.findUniqueOrThrow({ where: { roleName: 'VENDOR' } });

  const categories = ['IT Hardware', 'Furniture', 'Stationery', 'Software', 'Services', 'Logistics', 'Marketing', 'Consulting'];
  const cities = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

  const vendorRecords = [];
  const ts = Date.now();
  for (let i = 1; i <= 15; i++) {
    const isApproved = i % 4 !== 0; // 75% active, 25% pending/blocked
    const v = await db.vendor.create({
      data: {
        vendorCode: `VND-${ts}-${i}`,
        companyName: `Global Supplier ${ts}-${i} Pvt Ltd`,
        contactName: `Contact Person ${ts}-${i}`,
        email: `contact_${ts}_${i}@globalsupplier.com`,
        phone: `+9198${String(i).padStart(8, '0')}`,
        gstNumber: `27AABCW${String(i).padStart(4, '0')}Z${(ts % 9) + 1}`,
        category: categories[i % categories.length],
        status: isApproved ? 'Active' : (i % 8 === 0 ? 'Blocked' : 'Pending'),
        rating: 3 + (i % 3) * 0.5,
        address: `${i}0${i} Business Hub, ${cities[i % cities.length]}`,
      }
    });
    vendorRecords.push(v);

    // Create user account for the vendor
    await db.user.create({
      data: {
        name: v.contactName,
        email: v.email,
        passwordHash: hash,
        roleId: vendorRole.id,
      }
    });
  }

  // Also create vendor profile for the default vendor user if not exists
  let defaultVendorProfile = await db.vendor.findUnique({ where: { vendorCode: 'VND-000' } });
  if (!defaultVendorProfile) {
    defaultVendorProfile = await db.vendor.create({
      data: {
        vendorCode: `VND-000`,
        companyName: `Infra Supplies Co`,
        contactName: `Vendor User`,
        email: `vendor@infra-supplies.com`,
        phone: `+919999999999`,
        gstNumber: `27AABCW0000Z00`,
        category: 'IT Hardware',
        status: 'Active',
        rating: 4.8,
        address: `100 Tech Park, Pune`,
      }
    });
  }
  vendorRecords.push(defaultVendorProfile);


  console.log('Seeding multiple RFQs...');
  const rfqs = [];
  const statuses = ['Published', 'Published', 'Published', 'Closed', 'Closed', 'Draft', 'Cancelled'];

  for (let i = 1; i <= 20; i++) {
    const status: any = statuses[i % statuses.length];
    
    // Some random dates around today
    const now = Date.now();
    const daysOffset = (i % 15) - 7; // -7 to +7 days
    const deadline = new Date(now + daysOffset * 24 * 60 * 60 * 1000);

    const rfq = await db.rfq.create({
      data: {
        rfqNumber: `RFQ-${ts}-${String(i).padStart(4, '0')}`,
        title: `Procurement of ${categories[i % categories.length]} items (Batch ${i})`,
        description: `We require a bulk supply of ${categories[i % categories.length]} items for our upcoming quarter expansion. Please quote your best rates.`,
        category: categories[i % categories.length],
        status: status,
        createdBy: officer.id,
        deadline,
        items: {
          create: [
            { description: `Item Type A (${categories[i % categories.length]})`, quantity: 10 + i * 5, unit: 'units' },
            { description: `Item Type B (${categories[i % categories.length]})`, quantity: 5 + i * 2, unit: 'boxes' },
          ]
        }
      }
    });
    rfqs.push(rfq);
  }

  console.log('Seeding Quotations, Approvals, POs, and Invoices...');
  let quoteCounter = 1;
  let poCounter = 1;
  let invCounter = 1;

  for (const rfq of rfqs) {
    if (rfq.status === 'Draft' || rfq.status === 'Cancelled') continue;

    // Pick 2-3 random vendors from the same category or just random
    const eligibleVendors = vendorRecords.filter(v => v.category === rfq.category && v.status === 'Active');
    const vendorsToQuote = eligibleVendors.slice(0, 3); // up to 3 quotes

    let hasAcceptedQuote = false;

    for (let j = 0; j < vendorsToQuote.length; j++) {
      const vendor = vendorsToQuote[j];
      const baseAmount = 100000 + (j * 15000); // 1L, 1.15L, etc.
      
      let quoteStatus: any = 'Submitted';
      
      // If RFQ is closed, make one quote Accepted and the rest Rejected
      if (rfq.status === 'Closed') {
        if (!hasAcceptedQuote && j === 0) { // lowest bidder wins
          quoteStatus = 'Accepted';
          hasAcceptedQuote = true;
        } else {
          quoteStatus = 'Rejected';
        }
      } else {
         // If Published, they are mostly 'Submitted' or 'Under_Review'
         quoteStatus = j % 2 === 0 ? 'Under_Review' : 'Submitted';
      }

      const quotation = await db.quotation.create({
        data: {
          quotationNumber: `QT-${ts}-${String(quoteCounter++).padStart(4, '0')}`,
          rfqId: rfq.id,
          vendorId: vendor.id,
          amount: baseAmount,
          deliveryTime: 7 + j * 2,
          remarks: `Includes standard 1-year warranty and free delivery.`,
          status: quoteStatus,
        }
      });

      if (quoteStatus === 'Accepted') {
        // Create full workflow (Approval -> PO -> Invoice)
        const approval = await db.approval.create({
          data: {
            quotationId: quotation.id,
            approverId: manager.id,
            status: 'Approved',
            remarks: 'Best value for money. Approved.',
          }
        });

        await db.approvalHistory.create({
           data: {
             approvalId: approval.id,
             actorId: manager.id,
             fromStatus: 'Pending',
             toStatus: 'Approved',
             remarks: 'Best value for money. Approved.'
           }
        });

        const po = await db.purchaseOrder.create({
          data: {
             poNumber: `PO-${ts}-${String(poCounter++).padStart(4, '0')}`,
             quotationId: quotation.id,
             vendorId: vendor.id,
             totalAmount: quotation.amount,
             status: j % 2 === 0 ? 'Completed' : 'Issued', // some completed, some issued
          }
        });

        await db.invoice.create({
          data: {
            invoiceNumber: `INV-${ts}-${String(invCounter++).padStart(4, '0')}`,
            poId: po.id,
            taxAmount: Number(quotation.amount) * 0.18,
            totalAmount: Number(quotation.amount) * 1.18,
            status: po.status === 'Completed' ? 'Paid' : 'Generated'
          }
        });
      }
    }
  }

  console.log('Database successfully seeded with large volume of test data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
