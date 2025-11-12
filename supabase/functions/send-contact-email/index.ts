import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema for contact form
const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().max(200, "Subject must be less than 200 characters").optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  recipientEmail: z.string().trim().email("Invalid recipient email").max(255),
});

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate input with zod schema
    const validationResult = ContactSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: validationResult.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { name, email, subject, message, recipientEmail } = validationResult.data;

    // Send email using Resend with escaped HTML
    const emailResponse = await resend.emails.send({
      from: "Tokenomy Contact Form <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject ? `[Tokenomy] ${escapeHtml(subject)}` : "[Tokenomy] New Contact Form Submission",
      reply_to: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject) || "No subject"}</p>
        <hr />
        <h3>Message:</h3>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation email to the user with escaped HTML
    await resend.emails.send({
      from: "Tokenomy <onboarding@resend.dev>",
      to: [email],
      subject: "We've received your message",
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hello ${escapeHtml(name)},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject) || "No subject"}</p>
        <hr />
        <h3>Your message:</h3>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
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
