import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const toNumber = process.env.TWILIO_WHATSAPP_TO ?? "whatsapp:+40737309751"
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886"

  if (!accountSid || !authToken) {
    console.error("Twilio credentials are not configured")
    return NextResponse.json(
      { error: "Twilio credentials are missing. Define TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN." },
      { status: 500 }
    )
  }

  let payload: { message?: unknown }
  try {
    payload = await request.json()
  } catch (error) {
    console.error("Invalid JSON payload for WhatsApp request", error)
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : ""

  if (!message) {
    return NextResponse.json({ error: "Message content is required." }, { status: 400 })
  }

  const body = new URLSearchParams()
  body.append("To", toNumber)
  body.append("From", fromNumber)
  body.append("Body", message)

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  try {
    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage = data?.message ?? "Twilio API request failed."
      console.error("Twilio API error", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status || 502 })
    }

    return NextResponse.json({ sid: data?.sid ?? null })
  } catch (error) {
    console.error("Unexpected Twilio API failure", error)
    return NextResponse.json(
      { error: "Nu am putut contacta serviciul Twilio." },
      { status: 502 }
    )
  }
}
