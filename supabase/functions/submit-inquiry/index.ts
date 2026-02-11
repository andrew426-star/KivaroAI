import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface FormPayload {
  name: string;
  email: string;
  company?: string;
  role?: string;
  inquiryType: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: FormPayload = await req.json();
    console.log("Form submission received:", JSON.stringify({ name: body.name, email: body.email, inquiryType: body.inquiryType }));

    // Validate required fields
    if (!body.name || !body.email || !body.inquiryType || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, inquiryType, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store in database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error: dbError } = await supabaseAdmin
      .from("form_submissions")
      .insert({
        name: body.name,
        email: body.email,
        company: body.company || null,
        role: body.role || null,
        inquiry_type: body.inquiryType,
        message: body.message,
        source: "kivaro-ai-website",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError.message);
      return new Response(
        JSON.stringify({ error: "Failed to store submission" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Submission stored with ID:", data.id);

    // Forward to n8n webhook if configured
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (n8nWebhookUrl) {
      try {
        console.log("Forwarding to n8n webhook...");
        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.id,
            name: body.name,
            email: body.email,
            company: body.company,
            role: body.role,
            inquiry_type: body.inquiryType,
            message: body.message,
            submitted_at: data.submitted_at,
            source: "kivaro-ai-website",
          }),
        });

        if (webhookResponse.ok) {
          console.log("n8n webhook forwarded successfully");
          await supabaseAdmin
            .from("form_submissions")
            .update({ exported: true })
            .eq("id", data.id);
        } else {
          console.error("n8n webhook failed:", webhookResponse.status, await webhookResponse.text());
        }
      } catch (webhookErr) {
        console.error("n8n webhook error:", webhookErr);
      }
    } else {
      console.log("No N8N_WEBHOOK_URL configured, skipping webhook forwarding");
    }

    // Send email notification via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        console.log("Sending email notification via Resend...");
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Kivaro AI <notifications@kivaroai.com>",
            to: ["andrew.thomas@kivaroai.com"],
            subject: `New Inquiry: ${body.inquiryType} — ${body.name}`,
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border: 1px solid #1a3a2a; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #064e3b, #0d9488); padding: 24px 32px;">
                  <h1 style="margin: 0; font-size: 20px; color: #ffffff;">New Form Submission</h1>
                  <p style="margin: 4px 0 0; font-size: 13px; color: #a7f3d0;">Kivaro AI Website Inquiry</p>
                </div>
                <div style="padding: 24px 32px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6ee7b7; font-size: 13px; width: 120px;">Name</td><td style="padding: 8px 0; color: #f0fdf4;">${body.name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6ee7b7; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #f0fdf4;"><a href="mailto:${body.email}" style="color: #34d399;">${body.email}</a></td></tr>
                    ${body.company ? `<tr><td style="padding: 8px 0; color: #6ee7b7; font-size: 13px;">Company</td><td style="padding: 8px 0; color: #f0fdf4;">${body.company}</td></tr>` : ""}
                    ${body.role ? `<tr><td style="padding: 8px 0; color: #6ee7b7; font-size: 13px;">Role</td><td style="padding: 8px 0; color: #f0fdf4;">${body.role}</td></tr>` : ""}
                    <tr><td style="padding: 8px 0; color: #6ee7b7; font-size: 13px;">Inquiry Type</td><td style="padding: 8px 0; color: #f0fdf4;">${body.inquiryType}</td></tr>
                  </table>
                  <div style="margin-top: 16px; padding: 16px; background: #111; border: 1px solid #1a3a2a; border-radius: 6px;">
                    <p style="margin: 0 0 6px; color: #6ee7b7; font-size: 13px;">Message</p>
                    <p style="margin: 0; color: #f0fdf4; line-height: 1.6; white-space: pre-wrap;">${body.message}</p>
                  </div>
                  <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Submission ID: ${data.id} · ${new Date(data.submitted_at).toLocaleString("en-US", { timeZone: "America/Chicago" })}</p>
                </div>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log("Email notification sent successfully");
        } else {
          const errText = await emailResponse.text();
          console.error("Resend email failed:", emailResponse.status, errText);
        }
      } catch (emailErr) {
        console.error("Resend email error:", emailErr);
      }
    } else {
      console.log("No RESEND_API_KEY configured, skipping email notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        message: "Inquiry received successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
