import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import EmailTemplate from '@/app/util/email-template';


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    const data = await resend.emails.send({
      from: `屯門前鋒會及幼鋒會 <${process.env.CONTACT_EMAIL_FROM}>`,
      to: [email],
      bcc: [process.env.CONTACT_EMAIL_BCC!],
      subject: `感謝您對屯門前鋒會及幼鋒會的查詢 - ${name}`,
      replyTo: [process.env.CONTACT_EMAIL_BCC!],
      react: EmailTemplate({ name, message }),
    });

    return NextResponse.json(
      { message: 'Email sent successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}