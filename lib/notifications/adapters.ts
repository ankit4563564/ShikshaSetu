import type { ChannelAdapter } from './types';

const PUSH_ADAPTER: ChannelAdapter = {
  async send(payload) {
    const apiKey = process.env.FIREBASE_SERVER_KEY;
    if (!apiKey) {
      return { success: false, error: 'Firebase server key not configured' };
    }

    try {
      const token = payload.metadata.fcmToken as string | undefined;
      if (!token) {
        return { success: false, error: 'No FCM token for recipient' };
      }

      const res = await fetch('https://fcm.googleapis.com/v1/messages:send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.metadata,
            webpush: {
              notification: {
                title: payload.title,
                body: payload.body,
                icon: '/icons/notification.png',
                badge: '/icons/badge.png',
              },
            },
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `FCM error: ${err}` };
      }

      const data = await res.json();
      return { success: true, providerId: data.name };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};

const EMAIL_ADAPTER: ChannelAdapter = {
  async send(payload) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.NOTIFICATION_EMAIL_FROM || 'notifications@edusync.app';

    if (!apiKey) {
      return { success: false, error: 'Resend API key not configured' };
    }

    try {
      const toEmail = payload.metadata.email as string | undefined;
      if (!toEmail) {
        return { success: false, error: 'No email address for recipient' };
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: payload.title,
          html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#1F4E5F;">${payload.title}</h2>
            <p style="color:#555;line-height:1.6;">${payload.body}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
            <p style="color:#999;font-size:11px;">ShikshaSetu Notification</p>
          </div>`,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `Resend error: ${err}` };
      }

      const data = await res.json();
      return { success: true, providerId: data.id };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};

const SMS_ADAPTER: ChannelAdapter = {
  async send(payload) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    try {
      const phone = payload.metadata.phone as string | undefined;
      if (!phone) {
        return { success: false, error: 'No phone number for recipient' };
      }

      const body = `${payload.title}\n\n${payload.body}`;
      const params = new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: body.substring(0, 1600),
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `Twilio error: ${err}` };
      }

      const data = await res.json();
      return { success: true, providerId: data.sid };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};

const WHATSAPP_ADAPTER: ChannelAdapter = {
  async send(payload) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: 'Twilio WhatsApp not configured' };
    }

    try {
      const phone = payload.metadata.phone as string | undefined;
      if (!phone) {
        return { success: false, error: 'No phone number for recipient' };
      }

      const body = `*${payload.title}*\n\n${payload.body}`;
      const params = new URLSearchParams({
        To: `whatsapp:${phone}`,
        From: `whatsapp:${fromNumber}`,
        Body: body.substring(0, 1600),
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `Twilio WhatsApp error: ${err}` };
      }

      const data = await res.json();
      return { success: true, providerId: data.sid };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};

export const adapters: Record<string, ChannelAdapter> = {
  push: PUSH_ADAPTER,
  email: EMAIL_ADAPTER,
  sms: SMS_ADAPTER,
  whatsapp: WHATSAPP_ADAPTER,
};

export function getAdapter(channel: string): ChannelAdapter | null {
  return adapters[channel] || null;
}
