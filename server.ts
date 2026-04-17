import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email Transporter Setup
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER || 'placeholder@ethereal.email',
      pass: process.env.SMTP_PASS || 'placeholder',
    },
  });

  // API Route: Send Booking Confirmation
  app.post('/api/bookings/confirm-email', async (req, res) => {
    const { userEmail, roomName, checkIn, checkOut, totalPrice, status, bookingId } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const isConfirmed = status === 'confirmed';
    const subject = isConfirmed ? `Stay Confirmed: ${roomName} at Lumiere` : `Booking Received: ${roomName}`;
    
    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; color: #2D3748; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #E2E8F0; rounded-lg: 12px;">
        <h2 style="color: #1A365D; border-bottom: 2px solid #C0A080; padding-bottom: 10px;">Lumiere Resort & Suites</h2>
        <p>Dear Valued Guest,</p>
        <p>${isConfirmed ? 'Your reservation is now fully confirmed!' : 'We have received your reservation request and it is currently being processed.'}</p>
        
        <div style="background-color: #F8F9FA; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1A365D;">Booking Summary</h3>
          <p><strong>Suite:</strong> ${roomName}</p>
          <p><strong>Reservation ID:</strong> ${bookingId}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Total Amount:</strong> $${totalPrice}</p>
          <p><strong>Status:</strong> <span style="color: ${isConfirmed ? '#10B981' : '#F59E0B'}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
        </div>

        <p>We look forward to welcoming you to Lumiere. If you have any questions, please reply to this email or visit your dashboard.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 12px; color: #718096;">
          <p>Lumiere Resort & Suites • Excellence in Every Detail</p>
          <p>This is an automated confirmation email. Please do not reply directly to this message for Support.</p>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Lumiere Resort & Suites" <noreply@lumiere.com>',
        to: userEmail,
        subject: subject,
        html: htmlContent,
      });

      console.log('Message sent: %s', info.messageId);
      // If using Ethereal, log the preview URL
      if (info.messageId && !process.env.SMTP_HOST) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!process.env.SMTP_HOST) {
      console.log('NOTE: No SMTP config found. Using Ethereal Email for testing.');
    }
  });
}

startServer();
