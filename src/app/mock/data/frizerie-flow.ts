export type FlowSelectionType = "single" | "multi"

export interface FlowOption {
  id: string
  label: string
  description?: string
  hasChildren: boolean
  nextStepId?: string
  price?: number
  durationMinutes?: number
  isDisabled?: boolean
}

export interface FlowStep {
  id: string
  title: string
  subtitle?: string
  selectionType: FlowSelectionType
  options: FlowOption[]
}

export interface FlowDefinition {
  rootStepId: string
  steps: Record<string, FlowStep>
}

export interface SpecialistOption {
  id: string
  name: string
  rating: number
  firstAvailableDate: string
}

export const frizerieFlow: FlowDefinition = {
  rootStepId: "root",
  steps: {
    root: {
      id: "root",
      title: "Alege serviciile dorite",
      subtitle: "Poți selecta una sau mai multe categorii",
      selectionType: "multi",
      options: [
        {
          id: "frizerie",
          label: "Frizerie",
          description: "Tuns, barbă, colorări profesionale",
          hasChildren: true,
          nextStepId: "frizerie-main",
        },
        {
          id: "coafor",
          label: "Coafor",
          description: "Disponibil în curând",
          hasChildren: false,
          isDisabled: true,
        },
        {
          id: "manichiura-pedichiura",
          label: "Manichiură & Pedichiură",
          description: "Disponibil în curând",
          hasChildren: false,
          isDisabled: true,
        },
        {
          id: "gene",
          label: "Gene",
          description: "Disponibil în curând",
          hasChildren: false,
          isDisabled: true,
        },
        {
          id: "machiaj",
          label: "Machiaj",
          description: "Disponibil în curând",
          hasChildren: false,
          isDisabled: true,
        },
        {
          id: "cosmetica",
          label: "Cosmetică",
          description: "Disponibil în curând",
          hasChildren: false,
          isDisabled: true,
        },
        {
          id: "permanent-makeup",
          label: "Permanent Make-up",
          description: "Disponibil în curând",
          hasChildren: false,
          isDisabled: true,
        },
      ],
    },
    "frizerie-main": {
      id: "frizerie-main",
      title: "Frizerie",
      subtitle: "Alege categoriile de servicii dorite",
      selectionType: "multi",
      options: [
        {
          id: "frizerie-tuns",
          label: "Tuns",
          description: "Servicii de tuns și styling",
          hasChildren: true,
          nextStepId: "frizerie-tuns",
        },
        {
          id: "frizerie-barba",
          label: "Barbă",
          description: "Aranjare și contur",
          hasChildren: true,
          nextStepId: "frizerie-barba",
        },
        {
          id: "frizerie-vopsit",
          label: "Vopsit",
          description: "Opțiuni de colorare",
          hasChildren: true,
          nextStepId: "frizerie-vopsit",
        },
      ],
    },
    "frizerie-tuns": {
      id: "frizerie-tuns",
      title: "Tuns (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "tuns-simplu",
          label: "Tuns simplu",
          price: 70,
          durationMinutes: 30,
          hasChildren: false,
        },
        {
          id: "tuns-styling",
          label: "Tuns + styling",
          price: 100,
          durationMinutes: 45,
          hasChildren: false,
        },
        {
          id: "tuns-spalat-styling",
          label: "Tuns + spălat + styling",
          price: 130,
          durationMinutes: 60,
          hasChildren: false,
        },
      ],
    },
    "frizerie-barba": {
      id: "frizerie-barba",
      title: "Barbă (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "barba-simpla",
          label: "Barbă simplă",
          price: 50,
          durationMinutes: 20,
          hasChildren: false,
        },
        {
          id: "barba-contur",
          label: "Barbă + contur",
          price: 70,
          durationMinutes: 30,
          hasChildren: false,
        },
      ],
    },
    "frizerie-vopsit": {
      id: "frizerie-vopsit",
      title: "Vopsit (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "vopsit-par",
          label: "Vopsit păr",
          price: 180,
          durationMinutes: 60,
          hasChildren: false,
        },
        {
          id: "vopsit-barba",
          label: "Vopsit barbă",
          price: 90,
          durationMinutes: 30,
          hasChildren: false,
        },
        {
          id: "vopsit-par-barba",
          label: "Vopsit păr + barbă",
          price: 260,
          durationMinutes: 90,
          hasChildren: false,
        },
      ],
    },
  },
}

export const frizerieSpecialists: SpecialistOption[] = [
  {
    id: "specialist-1",
    name: "Specialist 1",
    rating: 4.9,
    firstAvailableDate: "2025-09-24",
  },
  {
    id: "specialist-2",
    name: "Specialist 2",
    rating: 4.7,
    firstAvailableDate: "2025-09-26",
  },
  {
    id: "specialist-3",
    name: "Specialist 3",
    rating: 4.6,
    firstAvailableDate: "2025-09-28",
  },
  {
    id: "specialist-any",
    name: "Oricare",
    rating: 0,
    firstAvailableDate: "2025-09-24",
  },
]
