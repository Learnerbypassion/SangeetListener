import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();


const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const sendEmail = async ({ to, subject, text, html }) => {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const messageParts = [
    `From: "Sangeet Listener" <${process.env.EMAIL_USER}>`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    html,
  ];

  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
};

async function sendRegistrationEmail(userEmail, userName) {
  const subject = " Welcome to Sangeet Listener!";

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

  await sendEmail({ to: userEmail, subject, text, html });
}
async function sendLoginEmail(userEmail, userName) {
  const loginTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const subject = "Login Alert - Sangeet Listener";

  const text = `Hi ${userName},

You just logged into your Sangeet Listener account 🎶

Login Time: ${loginTime}

If this was you, enjoy the music! 🎧
If you didn’t log in, please reset your password immediately.

Stay safe,
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
                <h1 style="margin:0;font-size:30px;">🔐 Login Alert</h1>
                <p style="margin:10px 0 0;font-size:15px;opacity:0.9;">
                  Sangeet Listener Security Notification
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
                  We detected a successful login to your <strong style="color:#a5b4fc;">Sangeet Listener</strong> account.
                </p>

                <div style="margin:25px 0;padding:20px;border-radius:12px;
                            background:linear-gradient(135deg,#1e293b,#020617);
                            border:1px solid rgba(255,255,255,0.08);
                            text-align:center;">
                  <p style="margin:0;font-size:15px;color:#e2e8f0;">
                    🕒 <strong>Login Time:</strong> ${loginTime}
                  </p>
                </div>

                <p style="font-size:14px;color:#94a3b8;">
                  If this was you, you can safely ignore this email and continue enjoying your music 🎧✨.
                </p>

                <p style="font-size:14px;color:#f87171;">
                  If this wasn't you, please dm me, there is no feature to reset password😭<br/>(ল্যাদ লাগছে to add this feature).
                </p>

                <p style="margin-top:25px;font-size:15px;color:#e2e8f0;">
                  Stay secure,<br/>
                  <strong style="color:#a5b4fc;">Soham, this side 😁 <br/> Sangeet Listener 🎼</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#020617;padding:20px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.05);">
                © ${new Date().getFullYear()} Sangeet Listener. All rights reserved.<br/>
                This login notification was triggered for your account security.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

  await sendEmail({ to: userEmail, subject, text, html });
}

export default { sendRegistrationEmail, sendLoginEmail }