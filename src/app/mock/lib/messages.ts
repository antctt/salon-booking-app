import { format } from "date-fns"
import { ro } from "date-fns/locale"

export type MessageKind = "confirmation" | "reminder" | "thank-you"

export interface WhatsAppMessageContext {
  customerName?: string | null
  appointmentDate?: Date | null
  appointmentTime?: string | null
  appointmentConfirmationLabel?: string | null
  serviceSummary?: string | null
  specialistSummary?: string | null
  totalDurationLabel: string
  totalPriceLabel: string
  recurrenceLabel?: string | null
  isWaitlistEnabled?: boolean
}

const formatGreeting = (name?: string | null) => {
  const trimmed = name?.trim()
  return `Salut${trimmed ? `, ${trimmed}` : ""}!`
}

const formatReminderDate = (appointmentDate?: Date | null) => {
  if (!appointmentDate) return null
  return format(appointmentDate, "d MMMM", { locale: ro })
}

const buildConfirmationMessage = (context: WhatsAppMessageContext) => {
  const {
    customerName,
    appointmentConfirmationLabel,
    serviceSummary,
    specialistSummary,
    totalDurationLabel,
    totalPriceLabel,
    recurrenceLabel,
    isWaitlistEnabled,
  } = context

  const greeting = `${formatGreeting(customerName)} 🌟 Confirmăm cu drag programarea ta.`

  const messageLines = [
    greeting,
    appointmentConfirmationLabel ? `\n📅 Te așteptăm ${appointmentConfirmationLabel}` : null,
    serviceSummary ? `\n✂️ Serviciu: ${serviceSummary}.` : null,
    specialistSummary ? `👤 Specialist: ${specialistSummary}.` : null,
    `🕒 Durata totală: ${totalDurationLabel}`,
    `📃 Cost: ${totalPriceLabel}`,
    recurrenceLabel ? `🔁 Program recurent: ${recurrenceLabel.toLowerCase()}` : null,
    isWaitlistEnabled
      ? "\nȚinem lista de așteptare pornită pentru o posibilă reprogramare mai rapidă. ⚡"
      : null,
    "\nTe rugăm să ne scrii dacă ai nevoie de orice ajustare. 🤝",
    "\n✅ Poți modifica sau anula rezervarea prin: [Modifica] / [Anulează].",
  ].filter((line): line is string => Boolean(line))

  return messageLines.join("\n")
}

const buildReminderMessage = (context: WhatsAppMessageContext) => {
  const {
    customerName,
    appointmentDate,
    appointmentTime,
    serviceSummary,
    specialistSummary,
    totalDurationLabel,
  } = context

  const reminderDateLabel = formatReminderDate(appointmentDate)

  const timeSuffix = appointmentTime ? `, la ${appointmentTime}` : ""
  const greeting = `${formatGreeting(customerName)} 🌟 Îți reamintim programarea de mâine${
    reminderDateLabel ? `, ${reminderDateLabel}` : ""
  }${timeSuffix}.`

  const messageLines = [
    greeting,
    "",
    serviceSummary ? `✂️ Serviciu: ${serviceSummary}.` : null,
    specialistSummary ? `👤 Specialist: ${specialistSummary}.` : null,
    `🕒 Durată totală: ${totalDurationLabel}.`,
    "",
    "✅ Te rugăm să confirmi rezervarea: [Confirmă] / [Anulează].",
  ].filter((line): line is string => line !== null)

  return messageLines.join("\n")
}

const buildThankYouMessage = (context: WhatsAppMessageContext) => {
  const { customerName } = context

  const greeting = `${formatGreeting(customerName)} A fost o plăcere să te avem la salon. ❤️`

  const messageLines = [
    greeting,
    "",
    "✅ Poți face următoarea rezervare direct de aici, prin:",
    "[Rezervă din nou] / [Rezervările mele].",
  ]

  return messageLines.join("\n")
}

export const buildWhatsAppMessage = (
  kind: MessageKind,
  context: WhatsAppMessageContext
) => {
  switch (kind) {
    case "confirmation":
      return buildConfirmationMessage(context)
    case "reminder":
      return buildReminderMessage(context)
    case "thank-you":
      return buildThankYouMessage(context)
    default: {
      const exhaustiveCheck: never = kind
      return exhaustiveCheck
    }
  }
}
