"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Clock, HeartHandshake, Scissors } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const services = [
  {
    value: "signature-cut",
    label: "Signature Cut",
    description: "Precision haircut tailored to your lifestyle",
    icon: Scissors,
    duration: "45 mins",
    price: "$85",
  },
  {
    value: "balayage",
    label: "Radiant Balayage",
    description: "Seamless color melt with custom tones",
    icon: HeartHandshake,
    duration: "2 hrs",
    price: "$210",
  },
  {
    value: "scalp-ritual",
    label: "Scalp Revival Ritual",
    description: "Detoxifying cleanse, treat, and massage",
    icon: Clock,
    duration: "60 mins",
    price: "$120",
  },
]

const stylists = [
  { value: "maya", label: "Maya Park", specialty: "Color Expert" },
  { value: "leo", label: "Leo Martinez", specialty: "Precision Cutting" },
  { value: "nina", label: "Nina Foster", specialty: "Texture Specialist" },
  { value: "no-preference", label: "No preference", specialty: "Match me automatically" },
]

const timeSlots = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "01:30 PM",
  "03:00 PM",
  "04:30 PM",
]

const steps = [
  {
    title: "Choose Service",
    description: "Pick the treatment you’re craving",
  },
  {
    title: "Pick Stylist",
    description: "Select your preferred stylist",
  },
  {
    title: "Date & Time",
    description: "Reserve the perfect slot",
  },
  {
    title: "Confirm",
    description: "Review the appointment details",
  },
]

export default function BookingStepper() {
  const [currentStep, setCurrentStep] = useState(0)
  const [service, setService] = useState(services[0]!.value)
  const [stylist, setStylist] = useState(stylists[0]!.value)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState(timeSlots[2]!)
  const [notes, setNotes] = useState("")

  const selectedService = useMemo(
    () => services.find((item) => item.value === service) ?? services[0]!,
    [service]
  )

  const selectedStylist = useMemo(
    () => stylists.find((item) => item.value === stylist) ?? stylists[0]!,
    [stylist]
  )

  const appointmentDate = date ? format(date, "EEEE, MMM d") : "Choose a date"

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const isFinalStep = currentStep === steps.length - 1

  const nextLabel = isFinalStep
    ? "Confirm Booking"
    : `Continue to ${steps[currentStep + 1]!.title}`

  return (
    <Card className="shadow-lg">
      <CardHeader className="gap-4">
        <CardTitle className="text-2xl font-semibold">Plan your visit</CardTitle>
        <CardDescription>
          Follow four quick steps to secure your salon experience.
        </CardDescription>
        <div className="overflow-x-auto pb-2">
          <Stepper
            value={currentStep}
            onValueChange={setCurrentStep}
            className="min-w-[560px] items-start gap-4"
          >
            {steps.map((step, index) => (
              <StepperItem
                key={step.title}
                step={index}
                className="flex-1 max-md:items-start"
              >
                <StepperTrigger className="w-full justify-start gap-4 rounded-full px-4 py-2 text-left transition hover:bg-accent max-md:flex-col max-md:items-start">
                  <StepperIndicator className="size-8" />
                  <div className="flex flex-col gap-0.5">
                    <StepperTitle className="text-sm font-semibold">
                      {step.title}
                    </StepperTitle>
                    <StepperDescription className="max-sm:hidden">
                      {step.description}
                    </StepperDescription>
                  </div>
                </StepperTrigger>
                {index < steps.length - 1 && (
                  <StepperSeparator className="hidden flex-1 md:block" />
                )}
              </StepperItem>
            ))}
          </Stepper>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {currentStep === 0 && (
          <div className="grid gap-6">
            <p className="text-muted-foreground text-sm">
              Choose the service that aligns with your goals today. Pricing and visit length update as you explore options.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {services.map((item) => {
                const Icon = item.icon
                const isActive = service === item.value
                return (
                  <button
                    key={item.value}
                    onClick={() => setService(item.value)}
                    className={`rounded-2xl border p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted"}`}
                  >
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                      {item.label}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs font-medium">
                      <span>{item.duration}</span>
                      <span>{item.price}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="grid gap-6">
            <p className="text-muted-foreground text-sm">
              Have someone in mind? Let us know. Otherwise choose “No preference” and we’ll pair you with the best fit.
            </p>
            <div className="max-w-sm">
              <Select value={stylist} onValueChange={setStylist}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a stylist" />
                </SelectTrigger>
                <SelectContent>
                  {stylists.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{person.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {person.specialty}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 text-sm">
              <h3 className="font-semibold">Stylist highlight</h3>
              <div className="rounded-xl border p-4 shadow-sm">
                <p className="text-base font-medium">
                  {selectedStylist.label}
                </p>
                <p className="text-muted-foreground text-sm">
                  {selectedStylist.specialty}
                </p>
                <p className="text-muted-foreground mt-3 text-sm">
                  Clients love {selectedStylist.label.split(" ")[0]} for their attention to detail and signature Glow finish.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid gap-6">
            <p className="text-muted-foreground text-sm">
              Pick the day and time that works best. Slots update live based on stylist availability.
            </p>
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
              <div className="rounded-xl border p-4 shadow-sm">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="mx-auto"
                  captionLayout="buttons"
                />
              </div>
              <div className="grid gap-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Available time slots
                </h3>
                <RadioGroup
                  value={time}
                  onValueChange={setTime}
                  className="grid grid-cols-2 gap-2"
                >
                  {timeSlots.map((slot) => {
                    const slotId = `time-${slot.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
                    const isActive = time === slot
                    return (
                      <div
                        key={slot}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition ${isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      >
                        <RadioGroupItem value={slot} id={slotId} />
                        <Label htmlFor={slotId} className="flex-1 cursor-pointer">
                          {slot}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid gap-6">
            <div className="rounded-2xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Appointment summary</h3>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="font-medium">{selectedService.label}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Stylist</dt>
                  <dd className="font-medium">{selectedStylist.label}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">When</dt>
                  <dd className="font-medium">
                    {appointmentDate} at {time}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Investment</dt>
                  <dd className="font-medium">{selectedService.price}</dd>
                </div>
              </dl>
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes for your stylist (optional)
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Share inspiration, preferences, or sensitivities."
                className="h-24"
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={goBack} disabled={currentStep === 0}>
          Back
        </Button>
        <div className="flex gap-3">
          {!isFinalStep && (
            <Button variant="outline" onClick={goNext}>
              Save &amp; continue later
            </Button>
          )}
          <Button onClick={goNext} className="min-w-44" disabled={isFinalStep && !date}>
            {nextLabel}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
