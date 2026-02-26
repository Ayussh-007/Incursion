import nodemailer from 'nodemailer';

/**
 * Email transport — uses SMTP credentials from env vars.
 * Falls back to console logging in dev if no credentials are set.
 */
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

/**
 * Send a 6-digit OTP to the given email.
 * If no email credentials are configured, logs the OTP to console (dev mode).
 */
export async function sendOtpEmail(email, otp) {
    if (!transporter) {
        console.log(`\n╔══════════════════════════════════════════╗`);
        console.log(`║  DEV MODE — OTP for ${email}`);
        console.log(`║  OTP: ${otp}`);
        console.log(`╚══════════════════════════════════════════╝\n`);
        return;
    }

    const mailOptions = {
        from: `"INCURSION — Project AEGIS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 INCURSION — Verification Code',
        html: `
            <div style="background:#0a0e17;color:#c0e8ff;padding:40px;font-family:'Courier New',monospace;border:1px solid #1a3a5c;">
                <div style="border-bottom:1px solid #1a3a5c;padding-bottom:16px;margin-bottom:24px;">
                    <h1 style="color:#00e5ff;margin:0;font-size:24px;letter-spacing:4px;">INCURSION</h1>
                    <p style="color:#4a6a8a;margin:4px 0 0;font-size:12px;letter-spacing:2px;">PROJECT AEGIS // CLASSIFIED</p>
                </div>
                <p style="color:#8ab4d4;font-size:14px;">OPERATIVE VERIFICATION REQUIRED</p>
                <div style="background:#0d1520;border:1px solid #00e5ff33;padding:24px;text-align:center;margin:20px 0;">
                    <p style="color:#4a6a8a;font-size:12px;margin:0 0 8px;letter-spacing:2px;">YOUR ACCESS CODE</p>
                    <h2 style="color:#00e5ff;font-size:36px;letter-spacing:12px;margin:0;">${otp}</h2>
                </div>
                <p style="color:#4a6a8a;font-size:12px;">This code expires in <span style="color:#ff4444;">5 minutes</span>.</p>
                <p style="color:#4a6a8a;font-size:12px;">Enter this code in the terminal using: <span style="color:#00e5ff;">/verify ${otp}</span></p>
                <div style="border-top:1px solid #1a3a5c;padding-top:16px;margin-top:24px;">
                    <p style="color:#2a4a6a;font-size:10px;letter-spacing:1px;">SERN.GOV.SECURE // GAMMA-7 CLEARANCE</p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

/**
 * Generate a cryptographically random 6-digit OTP.
 */
export function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
