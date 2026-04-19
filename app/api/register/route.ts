// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Registration } from "@/lib/models/Registration";
import { sendSMS, sendEmail, sendWhatsApp } from "@/lib/notifications";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, email, city, mobile } = await req.json();

    // Generate unique registration code
    const lastReg = await Registration.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastReg && lastReg.regCode) {
      const match = lastReg.regCode.match(/\d+/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }
    const regCode = `TCT-${String(nextNumber).padStart(3, "0")}`;

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(regCode);
    const badgeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/badge/${regCode}`;

    const registration = await Registration.create({
      regCode,
      name,
      email,
      city,
      mobile,
      badgeUrl,
      qrCodeData: qrCodeDataUrl,
    });

    // Send SMS with link
    const smsMessage = `Dear ${name}, your TCT registration is successful! Registration ID: ${regCode}. View & download your badge: ${badgeUrl}`;
    await sendSMS(mobile, smsMessage);

    // Send Email
    // await sendEmail(
    //   email,
    //   "TCT Registration Successful",
    //   generateEmailTemplate(name, regCode, badgeUrl),
    // );

    // Send WhatsApp message
    // await sendWhatsApp(
    //   mobile,
    //   `🎉 Registration Successful! 🎉\n\nName: ${name}\nRegistration ID: ${regCode}\n\nClick here to view your badge: ${badgeUrl}`,
    // );

    return NextResponse.json({
      success: true,
      regCode,
      badgeUrl,
      message: "Registration successful! Check your SMS, Email, and WhatsApp.",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 },
    );
  }
}

function generateEmailTemplate(
  name: string,
  regCode: string,
  badgeUrl: string,
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>TCT Registration Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Your registration for TCT event has been successfully completed!</p>
          <p><strong>Registration ID:</strong> ${regCode}</p>
          <p>Click the button below to view and download your badge:</p>
          <p style="text-align: center;">
            <a href="${badgeUrl}" class="button">View Your Badge</a>
          </p>
          <p>You can also scan the QR code at the event entry.</p>
          <p>Thank you for registering!</p>
        </div>
        <div class="footer">
          <p>© 2024 TCT Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
