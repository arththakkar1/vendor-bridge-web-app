import request from 'supertest';
import app from '../src/app';

const TIMESTAMP = Date.now();
const testData = {
  officer: { name: 'Test Officer', email: `officer-${TIMESTAMP}@example.com`, password: 'password123', role: 'OFFICER' },
  vendor: { name: 'Test Vendor', email: `vendor-${TIMESTAMP}@example.com`, password: 'password123', role: 'VENDOR' },
  manager: { name: 'Test Manager', email: `manager-${TIMESTAMP}@example.com`, password: 'password123', role: 'MANAGER' }
};

let officerToken: string;
let vendorToken: string;
let managerToken: string;
let vendorId: string;
let rfqId: string;
let quotationId: string;
let poId: string;

describe('Complete VendorBridge E2E Workflow', () => {
  jest.setTimeout(30000);

  it('1. Register users', async () => {
    const res1 = await request(app).post('/api/v1/auth/register').send(testData.officer);
    expect(res1.status).toBe(201);
    const res2 = await request(app).post('/api/v1/auth/register').send(testData.vendor);
    expect(res2.status).toBe(201);
    const res3 = await request(app).post('/api/v1/auth/register').send(testData.manager);
    expect(res3.status).toBe(201);
  });

  it('2. Login to acquire JWTs', async () => {
    const offRes = await request(app).post('/api/v1/auth/login').send({ email: testData.officer.email, password: testData.officer.password }).expect(200);
    officerToken = offRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const venRes = await request(app).post('/api/v1/auth/login').send({ email: testData.vendor.email, password: testData.vendor.password }).expect(200);
    vendorToken = venRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const manRes = await request(app).post('/api/v1/auth/login').send({ email: testData.manager.email, password: testData.manager.password }).expect(200);
    managerToken = manRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
  });

  it('3. Fetch Vendor Profile ID', async () => {
    // Get vendor profile from /api/v1/vendors (Assuming an endpoint exists, or we use auth/me)
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', `token=${vendorToken}`).expect(200);
    expect(res.body.user).toBeDefined();
    
    // We actually need the Vendor table ID for inviting, let's list vendors as Officer
    const vendorsRes = await request(app).get('/api/v1/vendors').set('Cookie', `token=${officerToken}`).expect(200);
    const matchedVendor = vendorsRes.body.vendors.find((v: any) => v.email === testData.vendor.email);
    expect(matchedVendor).toBeDefined();
    vendorId = matchedVendor.id;
  });

  it('4. Officer creates and publishes an RFQ', async () => {
    const createRes = await request(app)
      .post('/api/v1/rfqs')
      .set('Cookie', `token=${officerToken}`)
      .send({
        title: 'Test Servers',
        description: 'Need new server hardware',
        category: 'Hardware',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: 'Published',
        invitedVendorIds: [vendorId],
        items: [{ description: 'Dell R740', quantity: 5, unit: 'units' }]
      })
      .expect(201);
    
    rfqId = createRes.body.rfq.id;
    expect(rfqId).toBeDefined();
    expect(createRes.body.rfq.status).toBe('Published');
  });

  it('5. Vendor fetches RFQs and submits Quotation', async () => {
    const rfqsRes = await request(app).get('/api/v1/rfqs').set('Cookie', `token=${vendorToken}`).expect(200);
    expect(rfqsRes.body.rfqs.some((r: any) => r.id === rfqId)).toBe(true);

    const quoteRes = await request(app)
      .post('/api/v1/quotations')
      .set('Cookie', `token=${vendorToken}`)
      .send({
        rfqId,
        amount: 25000,
        deliveryTime: 14,
        remarks: 'Standard delivery terms apply'
      })
      .expect(201);
    
    quotationId = quoteRes.body.quotation.id;
    expect(quotationId).toBeDefined();
  });

  it('6. Officer selects Quotation', async () => {
    const selectRes = await request(app)
      .post('/api/v1/quotations/select')
      .set('Cookie', `token=${officerToken}`)
      .send({ quotationId })
      .expect(200);
    
    expect(selectRes.body.success).toBe(true);
  });

  it('7. Manager approves Quotation, generating PO', async () => {
    const pendingRes = await request(app).get('/api/v1/approvals').set('Cookie', `token=${managerToken}`).expect(200);
    const approval = pendingRes.body.approvals.find((a: any) => a.quotationId === quotationId);
    expect(approval).toBeDefined();

    const approveRes = await request(app)
      .post(`/api/v1/approvals/${approval.id}/action`)
      .set('Cookie', `token=${managerToken}`)
      .send({ action: 'Approved', remarks: 'Looks good' })
      .expect(200);
    
    expect(approveRes.body.status).toBe('Approved');
  });

  it('8. Vendor fetches auto-generated Invoice', async () => {
    const posRes = await request(app).get('/api/v1/purchase-orders').set('Cookie', `token=${vendorToken}`).expect(200);
    const po = posRes.body.purchaseOrders.find((p: any) => p.quotationId === quotationId);
    expect(po).toBeDefined();
    poId = po.id;

    const invRes = await request(app).get('/api/v1/invoices').set('Cookie', `token=${vendorToken}`).expect(200);
    const invoice = invRes.body.invoices.find((i: any) => i.poId === poId);
    expect(invoice).toBeDefined();
    expect(invoice.status).toBe('Generated');
  });
});
