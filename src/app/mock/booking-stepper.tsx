"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { addDays, format } from "date-fns"
import { ro } from "date-fns/locale"
import {
  CheckCircle2,
  CheckSquare,
  Circle,
  ChevronRight,
  Square,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import {
  frizerieFlow,
  specialistCatalog,
  type FlowOption,
  type FlowSelectionType,
} from "./data/frizerie-flow"
import {
  buildFlowOptionIndex,
  calculateBookingSummary,
  collectDescendantStepIds,
  deriveNextStepIds,
  type SelectedOptionsMap,
} from "./lib/flow-utils"

const SPECIALIST_STEP_ID = "specialist-selection"
const APPOINTMENT_STEP_ID = "appointment-scheduling"
const CUSTOMER_DETAILS_STEP_ID = "customer-details"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RECURRENCE_OPTIONS = [
  { value: "weekly", label: "În fiecare săptămână" },
  { value: "biweekly", label: "La 2 săptămâni" },
  { value: "monthly", label: "În fiecare lună" },
  { value: "bimonthly", label: "La 2 luni" },
]

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours && mins) {
    return `${hours}h ${mins}m`
  }

  if (hours) {
    return `${hours}h`
  }

  return `${mins}m`
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 0,
  }).format(value)

interface OptionCardProps {
  option: FlowOption
  selectionType: FlowSelectionType
  isSelected: boolean
  onSelect: () => void
}

const OptionCard = ({ option, selectionType, isSelected, onSelect }: OptionCardProps) => {
  const IndicatorIcon = selectionType === "single"
    ? isSelected
      ? CheckCircle2
      : Circle
    : isSelected
      ? CheckSquare
      : Square

  const role = selectionType === "single" ? "radio" : "checkbox"

  return (
    <div
      role={role}
      aria-checked={isSelected}
      aria-disabled={option.isDisabled ?? false}
      tabIndex={option.isDisabled ? -1 : 0}
      onClick={option.isDisabled ? undefined : onSelect}
      onKeyDown={(event) => {
        if (option.isDisabled) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        option.isDisabled && "cursor-not-allowed opacity-60",
        !option.isDisabled &&
          (isSelected
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted")
      )}
    >
      <IndicatorIcon className="mt-1 size-5 text-primary" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <p className="font-medium">{option.label}</p>
          {option.hasChildren && <ChevronRight className="size-4 text-muted-foreground" />}
        </div>
        {option.description && (
          <p className="text-muted-foreground text-sm">{option.description}</p>
        )}
        {!option.hasChildren && (
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs font-medium">
            {typeof option.durationMinutes === "number" && (
              <span>Durată: {formatDuration(option.durationMinutes)}</span>
            )}
            {typeof option.price === "number" && <span>{formatPrice(option.price)}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingStepper() {
  const optionIndex = useMemo(() => buildFlowOptionIndex(frizerieFlow), [])
  const [stepGroups, setStepGroups] = useState<string[][]>([[frizerieFlow.rootStepId]])
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsMap>({})
  const [selectedSpecialists, setSelectedSpecialists] = useState<Record<string, string>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [isPrimaryButtonInView, setPrimaryButtonInView] = useState(true)
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null)
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>()
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState(RECURRENCE_OPTIONS[0]?.value ?? "weekly")
  const [isWaitlistEnabled, setIsWaitlistEnabled] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerTouched, setCustomerTouched] = useState({
    name: false,
    phone: false,
    email: false,
  })

  const timeSlots = useMemo(() => {
    return Array.from({ length: 11 }, (_, index) => {
      const hour = index + 10
      return `${hour.toString().padStart(2, "0")}:00`
    })
  }, [])

  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const bookedDates = useMemo(() => {
    return [2, 4, 7].map((offset) => {
      const date = addDays(today, offset)
      date.setHours(0, 0, 0, 0)
      return date
    })
  }, [today])

  const disabledDates = useMemo(
    () => [{ before: today }, ...bookedDates],
    [bookedDates, today]
  )

  const initialCalendarMonth = useMemo(() => {
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    return base
  }, [])

  const currentGroup = useMemo(
    () => stepGroups[currentGroupIndex] ?? [],
    [stepGroups, currentGroupIndex]
  )
  const isSpecialistGroup = currentGroup.includes(SPECIALIST_STEP_ID)
  const isAppointmentGroup = currentGroup.includes(APPOINTMENT_STEP_ID)
  const isCustomerDetailsGroup = currentGroup.includes(CUSTOMER_DETAILS_STEP_ID)
  const isFinalGroup = isCustomerDetailsGroup
  const summary = useMemo(
    () => calculateBookingSummary(selectedOptions, frizerieFlow, optionIndex),
    [selectedOptions, optionIndex]
  )

  const specialistCategoryIds = useMemo(() => {
    const seen = new Set<string>()
    const ids: string[] = []

    Object.values(selectedOptions).forEach((optionIds) => {
      optionIds.forEach((optionId) => {
        const entry = optionIndex[optionId]
        if (!entry) return
        const categoryId = entry.option.specialistCategoryId
        if (!categoryId || seen.has(categoryId)) return
        seen.add(categoryId)
        ids.push(categoryId)
      })
    })

    return ids
  }, [selectedOptions, optionIndex])

  const canContinue = useMemo(() => {
    if (isCustomerDetailsGroup) {
      const trimmedEmail = customerEmail.trim()
      const hasEmailError = trimmedEmail.length > 0 && !EMAIL_REGEX.test(trimmedEmail)
      return (
        Boolean(customerName.trim()) &&
        Boolean(customerPhone.trim()) &&
        !hasEmailError
      )
    }

    if (isAppointmentGroup) {
      if (!(appointmentDate && appointmentTime)) {
        return false
      }

      if (isRecurring && !recurrenceFrequency) {
        return false
      }

      return true
    }

    if (isSpecialistGroup) {
      if (summary.services.length === 0) {
        return false
      }

      if (specialistCategoryIds.length === 0) {
        return true
      }

      return specialistCategoryIds.every((categoryId) =>
        Boolean(selectedSpecialists[categoryId])
      )
    }

    if (currentGroup.length === 0) return false

    return currentGroup.every((stepId) => {
      if (stepId === SPECIALIST_STEP_ID || stepId === APPOINTMENT_STEP_ID) {
        return true
      }
      const step = frizerieFlow.steps[stepId]
      if (!step) return false
      const selected = selectedOptions[stepId] ?? []
      if (step.selectionType === "single") {
        return selected.length === 1
      }
      return selected.length > 0
    })
  }, [
    appointmentDate,
    appointmentTime,
    currentGroup,
    customerName,
    customerEmail,
    customerPhone,
    isAppointmentGroup,
    isCustomerDetailsGroup,
    isSpecialistGroup,
    isRecurring,
    recurrenceFrequency,
    specialistCategoryIds,
    selectedOptions,
    selectedSpecialists,
    summary.services.length,
  ])

  useEffect(() => {
    setSelectedSpecialists((prev) => {
      const next: Record<string, string> = {}

      specialistCategoryIds.forEach((categoryId) => {
        if (prev[categoryId]) {
          next[categoryId] = prev[categoryId]
        }
      })

      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(next)
      const sameLength = prevKeys.length === nextKeys.length
      const sameValues = sameLength
        ? nextKeys.every((key) => prev[key] === next[key])
        : false

      if (sameLength && sameValues) {
        return prev
      }

      return next
    })
  }, [specialistCategoryIds])

  useEffect(() => {
    const updateViewportMatch = () => {
      if (typeof window === "undefined") return
      setIsMobile(window.innerWidth <= 767)
    }

    updateViewportMatch()
    if (typeof window === "undefined") {
      return
    }

    window.addEventListener("resize", updateViewportMatch)
    return () => window.removeEventListener("resize", updateViewportMatch)
  }, [])

  useEffect(() => {
    const button = primaryButtonRef.current
    if (!button) return

    const observer = new IntersectionObserver(
      ([entry]) => setPrimaryButtonInView(entry.isIntersecting),
      { threshold: 0.1 }
    )

    observer.observe(button)

    return () => {
      observer.unobserve(button)
      observer.disconnect()
    }
  }, [currentGroupIndex])

  useEffect(() => {
    const hasAppointmentStep = stepGroups.some((group) =>
      group.includes(APPOINTMENT_STEP_ID)
    )

    if (!hasAppointmentStep && (appointmentDate || appointmentTime || isRecurring || isWaitlistEnabled)) {
      setAppointmentDate(undefined)
      setAppointmentTime(null)
      setIsRecurring(false)
      setIsWaitlistEnabled(false)
      setRecurrenceFrequency(RECURRENCE_OPTIONS[0]?.value ?? "weekly")
    }
  }, [
    appointmentDate,
    appointmentTime,
    isRecurring,
    isWaitlistEnabled,
    stepGroups,
  ])

  useEffect(() => {
    if (!appointmentDate || !appointmentTime) {
      if (isRecurring) {
        setIsRecurring(false)
        setRecurrenceFrequency(RECURRENCE_OPTIONS[0]?.value ?? "weekly")
      }
      if (isWaitlistEnabled) {
        setIsWaitlistEnabled(false)
      }
    }
  }, [appointmentDate, appointmentTime, isRecurring, isWaitlistEnabled])

  const showFloatingAction = isMobile && canContinue && !isPrimaryButtonInView

  const ensureGroupsTrimmed = () => {
    setStepGroups((prev) => {
      if (currentGroupIndex === prev.length - 1) {
        return prev
      }
      return prev.slice(0, currentGroupIndex + 1)
    })
  }

  const updateSelection = (stepId: string, optionId: string) => {
    const step = frizerieFlow.steps[stepId]
    if (!step) return

    ensureGroupsTrimmed()

    if (stepId !== SPECIALIST_STEP_ID) {
      setSelectedSpecialists({})
    }

    setSelectedOptions((prev) => {
      const prevSelected = prev[stepId] ?? []
      let nextSelected = prevSelected

      if (step.selectionType === "single") {
        const alreadySelected = prevSelected[0] === optionId
        nextSelected = alreadySelected ? [] : [optionId]
      } else {
        const exists = prevSelected.includes(optionId)
        nextSelected = exists
          ? prevSelected.filter((id) => id !== optionId)
          : [...prevSelected, optionId]
      }

      const removedOptionIds = prevSelected.filter((id) => !nextSelected.includes(id))

      const draft: SelectedOptionsMap = { ...prev, [stepId]: nextSelected }
      if (nextSelected.length === 0) {
        delete draft[stepId]
      }

      if (removedOptionIds.length > 0) {
        removedOptionIds.forEach((removedId) => {
          const entry = optionIndex[removedId]
          if (!entry) return
          const descendantIds = collectDescendantStepIds(
            entry.option.nextStepId,
            frizerieFlow
          )
          descendantIds.forEach((descendantStepId) => {
            delete draft[descendantStepId]
          })
        })
      }

      return draft
    })
  }

  const goBack = () => {
    if (currentGroupIndex === 0) return
    setCurrentGroupIndex((prev) => Math.max(prev - 1, 0))
  }

  const goForward = () => {
    if (isFinalGroup) {
      console.info("Appointment confirmed", {
        services: summary.services,
        totalDuration: summary.totalDurationMinutes,
        totalPrice: summary.totalPrice,
        specialists: selectedSpecialists,
        appointment: {
          date: appointmentDate?.toISOString(),
          time: appointmentTime,
          recurrence: isRecurring ? recurrenceFrequency : null,
          recurrenceLabel: isRecurring
            ? RECURRENCE_OPTIONS.find((option) => option.value === recurrenceFrequency)?.label ?? null
            : null,
          waitlistEnabled: isWaitlistEnabled,
        },
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || null,
        },
      })
      return
    }

    const trimmedGroups = stepGroups.slice(0, currentGroupIndex + 1)

    if (isSpecialistGroup) {
      if (!trimmedGroups.some((group) => group.includes(APPOINTMENT_STEP_ID))) {
        setStepGroups([...trimmedGroups, [APPOINTMENT_STEP_ID]])
      } else {
        setStepGroups(trimmedGroups)
      }
      setCurrentGroupIndex((prev) => prev + 1)
      return
    }

    if (isAppointmentGroup) {
      if (!trimmedGroups.some((group) => group.includes(CUSTOMER_DETAILS_STEP_ID))) {
        setStepGroups([...trimmedGroups, [CUSTOMER_DETAILS_STEP_ID]])
      } else {
        setStepGroups(trimmedGroups)
      }
      setCurrentGroupIndex((prev) => prev + 1)
      return
    }

    const nextStepIds = deriveNextStepIds(currentGroup, selectedOptions, optionIndex)

    if (nextStepIds.length > 0) {
      setStepGroups([...trimmedGroups, nextStepIds])
      setCurrentGroupIndex((prev) => prev + 1)
      return
    }

    if (!trimmedGroups.some((group) => group.includes(SPECIALIST_STEP_ID))) {
      setStepGroups([...trimmedGroups, [SPECIALIST_STEP_ID]])
    } else {
      setStepGroups(trimmedGroups)
    }
    setCurrentGroupIndex((prev) => prev + 1)
  }

  const renderStep = (stepId: string) => {
    const step = frizerieFlow.steps[stepId]
    if (!step) return null

    const selected = selectedOptions[stepId] ?? []
    const isSingle = step.selectionType === "single"

    return (
      <section key={step.id} className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">{step.title}</h2>
          {step.subtitle && (
            <p className="text-muted-foreground text-sm">{step.subtitle}</p>
          )}
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {isSingle ? "Single choice" : "Multiple choice"}
          </p>
        </header>

        <div className={cn("grid gap-3", isSingle ? "grid-cols-1" : "md:grid-cols-2")}>
          {step.options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selectionType={step.selectionType}
              isSelected={selected.includes(option.id)}
              onSelect={() => updateSelection(stepId, option.id)}
            />
          ))}
        </div>
      </section>
    )
  }

  const renderSpecialistStep = () => {
    const hasCategories = specialistCategoryIds.length > 0

    return (
      <section key={SPECIALIST_STEP_ID} className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Alege specialistul</h2>
          <p className="text-muted-foreground text-sm">
            Selectează persoana preferată pentru fiecare categorie sau lasă-ne pe noi să alegem.
          </p>
        </header>
        {hasCategories ? (
          <div className="space-y-6">
            {specialistCategoryIds.map((categoryId) => {
              const catalogEntry = specialistCatalog[categoryId]
              const label = catalogEntry?.label ?? categoryId
              const specialists = catalogEntry?.options ?? []

              if (specialists.length === 0) {
                return (
                  <div key={categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">{label}</h3>
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">
                        Single choice
                      </span>
                    </div>
                    <Card className="border-dashed">
                      <CardContent className="text-muted-foreground py-6 text-sm">
                        Nu sunt specialiști disponibili momentan pentru această categorie.
                      </CardContent>
                    </Card>
                  </div>
                )
              }

              return (
                <div key={categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{label}</h3>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">
                      Single choice
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {specialists.map((specialist) => {
                      const dateLabel = format(
                        new Date(specialist.firstAvailableDate),
                        "d MMM yyyy",
                        {
                          locale: ro,
                        }
                      )

                      const indicatorLabel =
                        specialist.rating > 0
                          ? `${specialist.rating.toFixed(1)}★`
                          : "—"

                      const isSelected = selectedSpecialists[categoryId] === specialist.id
                      const Indicator = isSelected ? CheckCircle2 : Circle

                      const toggleSpecialist = () => {
                        setSelectedSpecialists((prev) => {
                          const next = { ...prev }
                          if (prev[categoryId] === specialist.id) {
                            delete next[categoryId]
                            return next
                          }
                          next[categoryId] = specialist.id
                          return next
                        })
                      }

                      return (
                        <div
                          key={specialist.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={toggleSpecialist}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              toggleSpecialist()
                            }
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Indicator className="mt-1 size-5 text-primary" aria-hidden="true" />
                              <p className="text-base font-semibold">{specialist.name}</p>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              Prima dată disponibilă: {dateLabel}
                            </p>
                          </div>
                          <span className="text-muted-foreground text-sm font-medium">
                            {indicatorLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="text-muted-foreground py-6 text-sm">
              Selectează cel puțin un serviciu pentru a alege un specialist.
            </CardContent>
          </Card>
        )}
      </section>
    )
  }

  const renderAppointmentStep = () => {
    const formattedSelection = appointmentDate
      ? format(appointmentDate, "EEEE, d MMMM yyyy", { locale: ro })
      : null
    const recurrenceSummaryLabel = RECURRENCE_OPTIONS.find(
      (option) => option.value === recurrenceFrequency
    )?.label

    const toggleTimeSlot = (slot: string) => {
      setAppointmentTime((prev) => (prev === slot ? null : slot))
    }

    return (
      <section key={APPOINTMENT_STEP_ID} className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Stabilește data și ora</h2>
          <p className="text-muted-foreground text-sm">
            Alege o zi disponibilă și un interval de timp care ți se potrivește.
          </p>
        </header>

        <Card className="border shadow-sm py-0 gap-0">
          <CardContent className="grid gap-0 p-0 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)] md:min-h-[26rem]">
            <div className="border-b p-6 md:border-b-0 md:border-r md:h-full">
              <Calendar
                mode="single"
                selected={appointmentDate}
                onSelect={setAppointmentDate}
                defaultMonth={appointmentDate ?? initialCalendarMonth}
                disabled={disabledDates}
                showOutsideDays={false}
                modifiers={{
                  booked: bookedDates,
                }}
                modifiersClassNames={{
                  booked: "[&>button]:line-through opacity-40",
                }}
                className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
                formatters={{
                  formatWeekdayName: (date) =>
                    date.toLocaleDateString("ro-RO", {
                      weekday: "short",
                    }),
                }}
              />
            </div>
            <div className="max-h-72 overflow-y-auto border-t p-6 md:h-full md:max-h-[26rem] md:border-t-0">
              <div className="flex flex-col gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = appointmentTime === slot
                  return (
                    <Button
                      key={slot}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleTimeSlot(slot)}
                      disabled={!appointmentDate}
                      className="w-full justify-center shadow-none"
                    >
                      {slot}
                    </Button>
                  )
                })}
              </div>
              {!appointmentDate && (
                <p className="text-muted-foreground mt-4 text-xs">
                  Selectează mai întâi o zi pentru a activa intervalele orare.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t px-6 py-5 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              {formattedSelection && appointmentTime ? (
                <span>
                  Programarea este setată pentru <span className="font-medium">{formattedSelection}</span> la
                  <span className="font-medium"> {appointmentTime}</span>.
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Selectează o zi și un interval orar pentru a continua.
                </span>
              )}
              {formattedSelection && appointmentTime && isRecurring && recurrenceSummaryLabel && (
                <span className="text-muted-foreground text-xs">
                  Repetare: {recurrenceSummaryLabel.toLowerCase()}.
                </span>
              )}
              {formattedSelection && appointmentTime && isWaitlistEnabled && (
                <span className="text-muted-foreground text-xs">
                  Lista de așteptare este activă pentru această programare.
                </span>
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              Datele marcate sunt deja rezervate.
            </div>
          </CardFooter>
        </Card>

        <Card className="border border-dashed bg-muted/20">
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="font-medium">Repetă rezervarea</p>
                <p className="text-muted-foreground text-xs">
                  Setează o frecvență pentru ședințe recurente.
                </p>
              </div>
              <Switch
                id="appointment-repeat"
                checked={isRecurring}
                onCheckedChange={(checked) => {
                  setIsRecurring(checked)
                  if (!checked) {
                    setRecurrenceFrequency(RECURRENCE_OPTIONS[0]?.value ?? "weekly")
                  }
                }}
                disabled={!appointmentDate || !appointmentTime}
              />
            </div>
            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="appointment-repeat-frequency" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Frecvență
                </Label>
                <Select
                  value={recurrenceFrequency}
                  onValueChange={setRecurrenceFrequency}
                >
                  <SelectTrigger id="appointment-repeat-frequency" className="h-9 text-sm">
                    <SelectValue placeholder="Alege frecvența" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Programarea se repetă {RECURRENCE_OPTIONS.find((option) => option.value === recurrenceFrequency)?.label?.toLowerCase()}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-dashed bg-muted/20">
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="font-medium">Listă de așteptare</p>
                <p className="text-muted-foreground text-xs">
                  Primești notificare dacă apare un loc mai devreme.
                </p>
              </div>
              <Switch
                id="appointment-waitlist"
                checked={isWaitlistEnabled}
                onCheckedChange={(checked) => setIsWaitlistEnabled(checked)}
                disabled={!appointmentDate || !appointmentTime}
              />
            </div>
            {isWaitlistEnabled && (
              <div className="rounded-lg border border-dashed bg-background/60 p-3 text-xs text-muted-foreground">
                Te vom anunța dacă se eliberează un interval mai devreme pentru serviciile selectate.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    )
  }

  const renderCustomerDetailsStep = () => {
    const trimmedEmail = customerEmail.trim()
    const nameError = customerTouched.name && customerName.trim() === ""
      ? "Numele este obligatoriu."
      : null
    const phoneError = customerTouched.phone && customerPhone.trim() === ""
      ? "Numărul de telefon este obligatoriu."
      : null
    const emailError =
      customerTouched.email && trimmedEmail !== "" && !EMAIL_REGEX.test(trimmedEmail)
        ? "Introdu o adresă de email validă."
        : null

    const markTouched = (field: "name" | "phone" | "email") => {
      setCustomerTouched((prev) => ({ ...prev, [field]: true }))
    }

    return (
      <section key={CUSTOMER_DETAILS_STEP_ID} className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Detalii client</h2>
          <p className="text-muted-foreground text-sm">
            Completează datele de contact pentru a finaliza programarea. Câmpurile marcate cu * sunt obligatorii.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="customer-name" className="text-sm font-medium">
              Nume complet <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              onBlur={() => markTouched("name")}
              placeholder="Ex: Ana Popescu"
              aria-required="true"
              aria-invalid={Boolean(nameError)}
              autoComplete="name"
              required
            />
            {nameError && <p className="text-destructive text-xs">{nameError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone" className="text-sm font-medium">
              Telefon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              onBlur={() => markTouched("phone")}
              placeholder="Ex: 0712 345 678"
              aria-required="true"
              aria-invalid={Boolean(phoneError)}
              autoComplete="tel"
              required
            />
            {phoneError && <p className="text-destructive text-xs">{phoneError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email" className="text-sm font-medium">
              Email
              <span className="text-muted-foreground text-xs font-normal"> (opțional)</span>
            </Label>
            <Input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              onBlur={() => markTouched("email")}
              placeholder="Ex: ana@example.com"
              aria-invalid={Boolean(emailError)}
              autoComplete="email"
            />
            {emailError && <p className="text-destructive text-xs">{emailError}</p>}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <div className="space-y-6 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-start md:gap-6 md:space-y-0">
        <Card className="shadow-lg">
          <CardContent className="space-y-10">
            {currentGroup.map((stepId) =>
              stepId === SPECIALIST_STEP_ID
                ? renderSpecialistStep()
                : stepId === APPOINTMENT_STEP_ID
                  ? renderAppointmentStep()
                  : stepId === CUSTOMER_DETAILS_STEP_ID
                    ? renderCustomerDetailsStep()
                    : renderStep(stepId)
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap justify-between gap-3">
            <Button variant="ghost" onClick={goBack} disabled={currentGroupIndex === 0}>
              Înapoi
            </Button>
            <Button
              ref={primaryButtonRef}
              onClick={goForward}
              disabled={!canContinue}
              className="min-w-48"
            >
              {isFinalGroup ? "Confirmă programarea" : "Continuă"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-dashed md:self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Rezumatul tău</CardTitle>
            <CardDescription>
              Serviciile finale se adaugă automat pe măsură ce le selectezi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.services.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Selectează servicii pentru a vedea detaliile aici.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                  {summary.services.map((item) => (
                    <div
                      key={item.optionId}
                      className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
                    >
                      <p className="text-sm font-medium">{item.optionLabel}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDuration(item.durationMinutes)} • {formatPrice(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t" />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Durată totală</span>
                    <span className="font-semibold">
                      {formatDuration(summary.totalDurationMinutes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cost total</span>
                    <span className="font-semibold">{formatPrice(summary.totalPrice)}</span>
                  </div>
                  {appointmentDate && appointmentTime && (
                    <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
                      <span className="font-medium uppercase tracking-wide text-[0.7rem] text-foreground">
                        Programare
                      </span>
                      <span className="text-sm text-foreground">
                        {format(appointmentDate, "d MMM yyyy", { locale: ro })} • {appointmentTime}
                      </span>
                    </div>
                  )}
                  {(customerName.trim() || customerPhone.trim() || customerEmail.trim()) && (
                    <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
                      <span className="font-medium uppercase tracking-wide text-[0.7rem] text-foreground">
                        Client
                      </span>
                      {customerName.trim() && (
                        <span className="text-sm text-foreground">{customerName.trim()}</span>
                      )}
                      {customerPhone.trim() && <span>{customerPhone.trim()}</span>}
                      {customerEmail.trim() && <span>{customerEmail.trim()}</span>}
                    </div>
                  )}
                  {Object.keys(selectedSpecialists).length > 0 && (
                    <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
                      {specialistCategoryIds
                        .filter((categoryId) => selectedSpecialists[categoryId])
                        .map((categoryId) => {
                          const entry = specialistCatalog[categoryId]
                          const label = entry?.label ?? categoryId
                          const specialistName = entry?.options.find(
                            (item) => item.id === selectedSpecialists[categoryId]
                          )?.name ?? "—"

                          return (
                            <div
                              key={categoryId}
                              className="flex items-center justify-between"
                            >
                              <span>{label}</span>
                              <span>{specialistName}</span>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {showFloatingAction && (
        <Button
          className="fixed bottom-5 right-5 z-40 rounded-full px-6 py-5 shadow-lg md:hidden"
          onClick={goForward}
          aria-label={isFinalGroup ? "Confirmă programarea" : "Continuă"}
        >
          {isFinalGroup ? "Confirmă" : "Continuă"}
        </Button>
      )}
    </>
  )
}
