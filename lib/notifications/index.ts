import nodemailer from "nodemailer";

// SMS Gateway
// lib/notifications/index.ts - Correct SMSGatewayHub format
export async function sendSMS(mobile: string, message: string) {
  try {
    // Remove any spaces from mobile number
    const cleanMobile = mobile.replace(/\s/g, "");

    // SMSGatewayHub expects these exact parameter names
    const params = new URLSearchParams({
      APIKey: process.env.SMS_GATEWAY_API_KEY!,
      SenderID: process.env.SMS_GATEWAY_SENDER_ID!,
      EntityID: process.env.SMS_GATEWAY_ENTITY_ID!,
      Route: process.env.SMS_GATEWAY_ROUTE!,
      TemplateID: process.env.SMS_GATEWAY_REGISTER_TEMPLATE_ID!,
      MobileNo: cleanMobile,
      Message: message,
    });

    console.log("SMS Request URL:", `${process.env.SMS_GATEWAY_URL}?${params}`);

    const response = await fetch(`${process.env.SMS_GATEWAY_URL}?${params}`, {
      method: "GET", // Their API might expect GET instead of POST
    });

    const data = await response.json();
    console.log("SMS Response:", data);

    // Check if SMS was sent successfully
    if (data.Message === "Success" || data.ErrorCode === "000") {
      console.log("✅ SMS sent successfully");
    } else {
      console.log("❌ SMS failed:", data.Message);
    }

    return data;
  } catch (error) {
    console.error("SMS error:", error);
    return null;
  }
}

// Email - Temporarily disabled
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT || "587"),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

export async function sendEmail(to: string, subject: string, html: string) {
  console.log("📧 Email service is temporarily disabled");
  console.log(`Would send email to: ${to}`);
  console.log(`Subject: ${subject}`);
  // Uncomment when email credentials are ready
  // try {
  //   await transporter.sendMail({
  //     from: process.env.SMTP_USER,
  //     to,
  //     subject,
  //     html,
  //   });
  //   console.log("Email sent to:", to);
  // } catch (error) {
  //   console.error("Email error:", error);
  //   throw error;
  // }
  return null;
}

// WhatsApp - Temporarily disabled
export async function sendWhatsApp(to: string, message: string) {
  console.log("📱 WhatsApp service is temporarily disabled");
  console.log(`Would send WhatsApp to: ${to}`);
  console.log(`Message: ${message}`);
  // Uncomment when WhatsApp credentials are ready
  // try {
  //   // Format phone number for WhatsApp API
  //   const whatsappNumber = to.startsWith("+") ? to : `+91${to}`;
  //
  //   const response = await fetch(process.env.WHATSAPP_API_URL!, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       messaging_product: "whatsapp",
  //       recipient_type: "individual",
  //       to: whatsappNumber,
  //       type: "text",
  //       text: { body: message },
  //     }),
  //   });
  //
  //   const data = await response.json();
  //   console.log("WhatsApp sent:", data);
  //   return data;
  // } catch (error) {
  //   console.error("WhatsApp error:", error);
  //   // Don't throw - WhatsApp might not be configured
  //   return null;
  // }
  return null;
}
