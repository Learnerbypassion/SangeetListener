import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer"



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // force IPv4
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});


// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sangeet Listner" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, userName) {
    const subject = "🎧 Welcome to Sangeet Listener!";

    const text = `Hi ${userName},

Welcome to Sangeet Listener! 🎶

Your account has been successfully created. Get ready to explore and enjoy amazing music tailored just for you.

Stay tuned for fresh beats and new releases!

Cheers,
Team Sangeet Listener`;

    const html = `
  <div style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="620" cellspacing="0" cellpadding="0" style="background:#020617;border-radius:16px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.6);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#6366f1,#ec4899,#22c55e);padding:40px 30px;text-align:center;color:#fff;">
                <h1 style="margin:0;font-size:30px;letter-spacing:1px;">🎶 Sangeet Listener</h1>
                <p style="margin:10px 0 0;font-size:15px;opacity:0.9;">
                  Feel the Rhythm. Live the Music.
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:35px 40px;color:#e2e8f0;">
                <h2 style="margin-top:0;font-size:22px;color:#f1f5f9;">
                  Hey ${userName}! 👋
                </h2>

                <p style="line-height:1.7;font-size:15px;color:#cbd5f5;">
                  Welcome to <strong style="color:#a5b4fc;">Sangeet Listener</strong> — your new home for discovering, streaming, and vibing to the best music. 🎧✨
                </p>

                <p style="line-height:1.7;font-size:15px;color:#cbd5f5;">
                  Your journey into endless melodies and powerful beats starts now. Explore new tracks, enjoy your favorite artists, and let music match your mood anytime, anywhere.
                </p>

                <div style="margin:30px 0;padding:20px;border-radius:12px;
                            background:linear-gradient(135deg,#1e293b,#020617);
                            border:1px solid rgba(255,255,255,0.08);
                            text-align:center;">
                  <span style="font-size:26px;">🎵 🎧 🎶</span>
                  <p style="margin:10px 0 0;font-size:14px;color:#94a3b8;">
                    Plug in. Play loud. Repeat.
                  </p>
                </div>

                <p style="font-size:14px;color:#94a3b8;">
                  Stay tuned for fresh releases, personalized playlists, and an unforgettable listening experience.
                </p>

                <p style="margin-top:25px;font-size:15px;color:#e2e8f0;">
                  With love,<br/>
                  <strong style="color:#a5b4fc;">Team Sangeet Listener 🎼</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#020617;padding:20px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.05);">
                © ${new Date().getFullYear()} Sangeet Listener. All rights reserved.<br/>
                You’re receiving this email because you signed up on Sangeet Listener, Hehehe😅.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

    await sendEmail(userEmail, subject, text, html);
}

export default {sendRegistrationEmail}