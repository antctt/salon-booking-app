import type { FlowDefinition, FlowOption, FlowStep } from "../data/frizerie-flow"

export type SelectedOptionsMap = Record<string, string[]>

export interface FlowOptionIndexEntry {
  stepId: string
  option: FlowOption
}

export const buildFlowOptionIndex = (
  definition: FlowDefinition
): Record<string, FlowOptionIndexEntry> => {
  const index: Record<string, FlowOptionIndexEntry> = {}

  Object.values(definition.steps).forEach((step) => {
    step.options.forEach((option) => {
      index[option.id] = {
        stepId: step.id,
        option,
      }
    })
  })

  return index
}

const collectDescendantsFromStep = (
  step: FlowStep | undefined,
  definition: FlowDefinition,
  acc: Set<string>
) => {
  if (!step) return

  acc.add(step.id)

  step.options.forEach((option) => {
    if (option.hasChildren && option.nextStepId) {
      const next = definition.steps[option.nextStepId]
      collectDescendantsFromStep(next, definition, acc)
    }
  })
}

export const collectDescendantStepIds = (
  startStepId: string | undefined,
  definition: FlowDefinition
): string[] => {
  if (!startStepId) return []

  const acc = new Set<string>()
  const start = definition.steps[startStepId]
  collectDescendantsFromStep(start, definition, acc)
  return Array.from(acc)
}

export interface SelectedServiceSummary {
  optionId: string
  optionLabel: string
  stepId: string
  stepTitle: string
  price: number
  durationMinutes: number
}

export interface BookingSummary {
  services: SelectedServiceSummary[]
  totalPrice: number
  totalDurationMinutes: number
}

export const calculateBookingSummary = (
  selectedOptions: SelectedOptionsMap,
  definition: FlowDefinition,
  optionIndex: Record<string, FlowOptionIndexEntry>
): BookingSummary => {
  const services: SelectedServiceSummary[] = []

  Object.entries(selectedOptions).forEach(([stepId, optionIds]) => {
    const step = definition.steps[stepId]
    if (!step) return

    optionIds.forEach((optionId) => {
      const entry = optionIndex[optionId]
      if (!entry) return

      const { option } = entry
      if (option.hasChildren) return

      services.push({
        optionId,
        optionLabel: option.label,
        stepId,
        stepTitle: step.title,
        price: option.price ?? 0,
        durationMinutes: option.durationMinutes ?? 0,
      })
    })
  })

  const totalPrice = services.reduce((total, item) => total + item.price, 0)
  const totalDurationMinutes = services.reduce(
    (total, item) => total + item.durationMinutes,
    0
  )

  return {
    services,
    totalPrice,
    totalDurationMinutes,
  }
}

export const deriveNextStepIds = (
  currentStepIds: string[],
  selectedOptions: SelectedOptionsMap,
  optionIndex: Record<string, FlowOptionIndexEntry>
): string[] => {
  const nextStepIds = new Set<string>()

  currentStepIds.forEach((stepId) => {
    const selected = selectedOptions[stepId] ?? []
    selected.forEach((optionId) => {
      const entry = optionIndex[optionId]
      if (!entry) return
      const next = entry.option.nextStepId
      if (entry.option.hasChildren && next) {
        nextStepIds.add(next)
      }
    })
  })

  return Array.from(nextStepIds)
}
