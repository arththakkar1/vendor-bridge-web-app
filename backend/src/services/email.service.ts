import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(opts: {
  to: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
}): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const recipient =
    process.env.NODE_ENV === "development"
      ? "mine.shubhamsingh@gmail.com"
      : opts.to;

  console.log(`[EMAIL] ${opts.to} -> ${recipient} (${process.env.NODE_ENV})`);

  const { error } = await resend.emails.send({
    from: `VendorBridge <${fromEmail}>`,
    to: recipient,
    subject: `Invoice ${opts.invoiceNumber} from VendorBridge`,
    text: `Please find attached your invoice ${opts.invoiceNumber}.`,
    attachments: [
      {
        filename: `${opts.invoiceNumber}.pdf`,
        content: opts.pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send email via Resend: ${error.message}`);
  }
}
