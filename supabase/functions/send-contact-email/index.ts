
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  recipientEmail: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, recipientEmail }: ContactRequest = await req.json();
    
    if (!name || !email || !message || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Tokenomy Contact Form <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject ? `[Tokenomy] ${subject}` : "[Tokenomy] New Contact Form Submission",
      reply_to: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject || "No subject"}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation email to the user
    await resend.emails.send({
      from: "Tokenomy <onboarding@resend.dev>",
      to: [email],
      subject: "We've received your message",
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hello ${name},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p><strong>Subject:</strong> ${subject || "No subject"}</p>
        <hr />
        <h3>Your message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <br />
        <p>Best regards,<br />The Tokenomy Team</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
