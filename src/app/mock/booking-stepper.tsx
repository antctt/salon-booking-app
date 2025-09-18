"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
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

  const currentGroup = useMemo(
    () => stepGroups[currentGroupIndex] ?? [],
    [stepGroups, currentGroupIndex]
  )
  const isFinalGroup = currentGroup.includes(SPECIALIST_STEP_ID)
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
    if (isFinalGroup) {
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
      if (stepId === SPECIALIST_STEP_ID) return true
      const step = frizerieFlow.steps[stepId]
      if (!step) return false
      const selected = selectedOptions[stepId] ?? []
      if (step.selectionType === "single") {
        return selected.length === 1
      }
      return selected.length > 0
    })
  }, [
    currentGroup,
    isFinalGroup,
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
      })
      return
    }

    const nextStepIds = deriveNextStepIds(currentGroup, selectedOptions, optionIndex)
    const trimmedGroups = stepGroups.slice(0, currentGroupIndex + 1)

    if (nextStepIds.length > 0) {
      setStepGroups([...trimmedGroups, nextStepIds])
      setCurrentGroupIndex((prev) => prev + 1)
      return
    }

    if (!trimmedGroups.some((group) => group.includes(SPECIALIST_STEP_ID))) {
      setStepGroups([...trimmedGroups, [SPECIALIST_STEP_ID]])
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

  return (
    <>
      <div className="space-y-6 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-start md:gap-6 md:space-y-0">
        <Card className="shadow-lg">
          <CardHeader className="gap-2">
            <CardTitle className="text-2xl font-semibold">Planifică vizita</CardTitle>
            <CardDescription>
              Navighează pașii de rezervare pentru a selecta serviciile dorite și specialistul potrivit.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-10">
            {currentGroup.map((stepId) =>
              stepId === SPECIALIST_STEP_ID ? renderSpecialistStep() : renderStep(stepId)
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
