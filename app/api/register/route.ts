import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Registration } from "@/lib/models/Registration";
import { sendEmail, sendRegisterSMS } from "@/lib/notifications";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, email, city, mobile } = await req.json();

    // Check if email already exists
    const existingEmail = await Registration.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        {
          error: "This email is already registered",
          existingRegCode: existingEmail.regCode,
        },
        { status: 409 },
      );
    }

    // Check if mobile already exists
    const existingMobile = await Registration.findOne({ mobile });
    if (existingMobile) {
      return NextResponse.json(
        {
          error: "This mobile number is already registered",
          existingRegCode: existingMobile.regCode,
        },
        { status: 409 },
      );
    }

    // Generate unique registration code
    const lastReg = await Registration.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastReg && lastReg.regCode) {
      const match = lastReg.regCode.match(/\d+/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }
    const regCode = `TCT-${String(nextNumber).padStart(3, "0")}`;

    // Generate QR Code and Badge URL
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

    // Send SMS
    try {
      const safeQrLink = `${process.env.NEXT_PUBLIC_APP_URL}/badge/${regCode}`;
      await sendRegisterSMS({
        mobile: registration.mobile,
        name: registration.name,
        regNum: registration.regCode,
        safeQrLink: safeQrLink,
      });
    } catch (error) {
      console.error("❌ SMS failed but registration saved:", error);
    }

    // Send Email
    try {
      const emailHtml = generateEmailTemplate(name, regCode, badgeUrl);
      await sendEmail(email, "TCT Registration Confirmed", emailHtml, name);
    } catch (error) {
      console.error("❌ Email failed but registration saved:", error);
    }

    return NextResponse.json({
      success: true,
      regCode,
      badgeUrl,
      message: "Registration successful! Check your SMS and Email.",
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          error: `This ${field} is already registered. Please use a different ${field}.`,
          field: field,
        },
        { status: 409 },
      );
    }

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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TCT Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .reg-code { background: #e0e7ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .reg-code strong { font-size: 24px; color: #4F46E5; font-family: monospace; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
          <p>TCT Event Pass</p>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your registration for TCT event has been successfully completed!</p>
          
          <div class="reg-code">
            <p style="margin: 0 0 5px 0;">Your Registration ID:</p>
            <strong>${regCode}</strong>
          </div>
          
          <p style="text-align: center;">
            <a href="${badgeUrl}" class="button">✨ View Your Badge ✨</a>
          </p>
          
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Save your registration ID: <strong>${regCode}</strong></li>
            <li>Show your badge at the event entry (digital or printed)</li>
            <li>Scan the QR code at the venue for quick check-in</li>
          </ul>
          
          <p>Best regards,<br><strong>TCT Events Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 TCT Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
