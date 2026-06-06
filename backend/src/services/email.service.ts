import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInvoiceEmail(opts: {
  to: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
}): Promise<void> {
  await transporter.sendMail({
    from: `"VendorBridge" <${process.env.SMTP_USER}>`,
    to: opts.to,
    subject: `Invoice ${opts.invoiceNumber} from VendorBridge`,
    text: `Please find attached your invoice ${opts.invoiceNumber}.`,
    attachments: [
      {
        filename: `${opts.invoiceNumber}.pdf`,
        content: opts.pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}
