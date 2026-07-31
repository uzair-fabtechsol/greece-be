import transporter from "@src/config/mailer";
import { env } from "@src/config/env";

// FUNCTION
const sendAdminCredentialsEmail = async (
  fullName: string,
  email: string,
  password: string,
): Promise<void> => {
  const html = `
  <div style="background-color:#EEF3F6;padding:32px 16px;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(10,42,64,0.15);">
      <tr>
        <td style="background-color:#0A2A40;padding:28px 32px;text-align:center;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">${env.APP_NAME}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 32px 24px 32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;color:#0A2A40;font-size:22px;">Your admin account is ready</h1>
          <p style="margin:0;color:#4A6274;font-size:14px;line-height:1.6;">
            Hi ${fullName}, an administrator account has been created for you.
            Sign in with the credentials below.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF3F6;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;color:#4A6274;font-size:13px;">Email</td>
              <td style="padding:16px 20px;color:#0A2A40;font-size:13px;font-weight:700;text-align:right;">${email}</td>
            </tr>
            <tr>
              <td style="padding:0 20px 16px 20px;color:#4A6274;font-size:13px;">Password</td>
              <td style="padding:0 20px 16px 20px;color:#0A2A40;font-size:13px;font-weight:700;text-align:right;">${password}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 32px 32px;text-align:center;">
          <p style="margin:0;color:#4A6274;font-size:13px;line-height:1.6;">
            For your security, please
            <strong style="color:#1A5276;">change this password</strong>
            after your first sign in.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color:#EEF3F6;padding:18px 32px;text-align:center;">
          <p style="margin:0;color:#4A6274;font-size:12px;">
            &copy; ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </div>`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Your admin account credentials",
    html,
  });
};

export { sendAdminCredentialsEmail };
