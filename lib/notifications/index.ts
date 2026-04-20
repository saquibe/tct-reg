import axios from "axios";

// ============================================
// SMS - EXACT MATCH with working code
// ============================================

export async function sendRegisterSMS({
  mobile,
  name,
  regNum,
  safeQrLink,
}: {
  mobile: string;
  name: string;
  regNum: string;
  safeQrLink: string;
}) {
  try {
    const cleanName = name.replace(/^(Mr|Mrs|Ms|Dr|Er)\.\s*/i, "").trim();
    // IMPORTANT: Use EXACT event name that matches your template
    const eventName = "6th Edition of Times Property Expo";
    const message = `Dear ${cleanName}, registration id for ${eventName} is ${regNum} and QR Links is ${safeQrLink} Do not share this info to anyone for security reasons. - SaaScraft Studio`;

    const payload = {
      APIKey: process.env.SMS_GATEWAY_API_KEY,
      senderid: process.env.SMS_GATEWAY_SENDER_ID,
      channel: "2",
      DCS: "0",
      flashsms: "0",
      number: mobile,
      text: message,
      route: process.env.SMS_GATEWAY_ROUTE,
      EntityId: process.env.SMS_GATEWAY_ENTITY_ID,
      dlttemplateid: process.env.SMS_GATEWAY_REGISTER_TEMPLATE_ID,
    };

    const response = await axios.get(process.env.SMS_GATEWAY_URL!, {
      params: {
        APIKey: process.env.SMS_GATEWAY_API_KEY,
        senderid: process.env.SMS_GATEWAY_SENDER_ID,
        channel: "2",
        DCS: "0",
        flashsms: "0",
        number: mobile,
        text: message,
        route: process.env.SMS_GATEWAY_ROUTE,
        EntityId: process.env.SMS_GATEWAY_ENTITY_ID,
        dlttemplateid: process.env.SMS_GATEWAY_REGISTER_TEMPLATE_ID,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ SMS ERROR:", error.response?.data || error.message);
    throw error;
  }
}

// Keep the original sendSMS for backward compatibility
export async function sendSMS(
  mobile: string,
  name: string,
  regCode: string,
  badgeUrl: string,
) {
  return sendRegisterSMS({
    mobile,
    name,
    regNum: regCode,
    safeQrLink: badgeUrl,
  });
}

// ============================================
// EMAIL - Using ZeptoMail API
// ============================================

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  name?: string,
) {
  try {
    const apiKey = process.env.ZEPTOMAIL_API_KEY;
    const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS;
    const agentAlias = process.env.ZEPTOMAIL_AGENT_ALIAS;
    const templateAlias = process.env.ZEPTOMAIL_TEMPLATE_ALIAS;

    if (!apiKey) {
      console.error("❌ ZeptoMail API key not configured");
      return null;
    }

    if (!fromAddress) {
      console.error("❌ ZeptoMail from address not configured");
      return null;
    }

    // Extract data for template variables
    const nameMatch = html.match(/Dear <strong>(.*?)<\/strong>/);
    const userName = nameMatch ? nameMatch[1] : name || "Valued Customer";

    const badgeUrlMatch = html.match(/href="([^"]*)"/);
    const badgeUrl = badgeUrlMatch ? badgeUrlMatch[1] : "";

    const regCodeMatch = badgeUrl.match(/\/badge\/(.+)$/);
    const regCode = regCodeMatch ? regCodeMatch[1] : "";

    // Use the correct endpoint with agent alias
    const url = `https://${process.env.ZEPTOMAIL_HOST}/v1.1/email/template`;

    const payload = {
      from: {
        address: fromAddress,
        name: process.env.ZEPTOMAIL_FROM_NAME || "TCT Events",
      },
      to: [
        {
          email_address: {
            address: to,
            name: userName,
          },
        },
      ],
      subject: subject,
      template_key: templateAlias, // Use template_key instead of template_alias
      merge_info: {
        name: userName,
        product_name: "TCT Events",
        team: "TCT Events Team",
        regCode: regCode,
        badgeUrl: badgeUrl,
        OTP: regCode,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Zoho-enczapikey ${apiKey}`,
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ Email error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
    return null;
  }
}

// ============================================
// WHATSAPP - Disabled
// ============================================

export async function sendWhatsApp(to: string, message: string) {
  // console.log("📱 WhatsApp service is temporarily disabled");
  return null;
}
