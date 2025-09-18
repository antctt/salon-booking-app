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
  specialistCategoryId?: string
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
          description: "Coafat, extensii, tratamente profesionale",
          hasChildren: true,
          nextStepId: "coafor-main",
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
          specialistCategoryId: "frizerie-tuns",
        },
        {
          id: "frizerie-barba",
          label: "Barbă",
          description: "Aranjare și contur",
          hasChildren: true,
          nextStepId: "frizerie-barba",
          specialistCategoryId: "frizerie-barba",
        },
        {
          id: "frizerie-vopsit",
          label: "Vopsit",
          description: "Opțiuni de colorare",
          hasChildren: true,
          nextStepId: "frizerie-vopsit",
          specialistCategoryId: "frizerie-vopsit",
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
          specialistCategoryId: "frizerie-tuns",
        },
        {
          id: "tuns-styling",
          label: "Tuns + styling",
          price: 100,
          durationMinutes: 45,
          hasChildren: false,
          specialistCategoryId: "frizerie-tuns",
        },
        {
          id: "tuns-spalat-styling",
          label: "Tuns + spălat + styling",
          price: 130,
          durationMinutes: 60,
          hasChildren: false,
          specialistCategoryId: "frizerie-tuns",
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
          specialistCategoryId: "frizerie-barba",
        },
        {
          id: "barba-contur",
          label: "Barbă + contur",
          price: 70,
          durationMinutes: 30,
          hasChildren: false,
          specialistCategoryId: "frizerie-barba",
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
          specialistCategoryId: "frizerie-vopsit",
        },
        {
          id: "vopsit-barba",
          label: "Vopsit barbă",
          price: 90,
          durationMinutes: 30,
          hasChildren: false,
          specialistCategoryId: "frizerie-vopsit",
        },
        {
          id: "vopsit-par-barba",
          label: "Vopsit păr + barbă",
          price: 260,
          durationMinutes: 90,
          hasChildren: false,
          specialistCategoryId: "frizerie-vopsit",
        },
      ],
    },
    "coafor-main": {
      id: "coafor-main",
      title: "Coafor",
      subtitle: "Selectează una sau mai multe categorii",
      selectionType: "multi",
      options: [
        {
          id: "coafor-coafat",
          label: "Coafat",
          description: "Servicii de styling pentru orice ocazie",
          hasChildren: true,
          nextStepId: "coafor-coafat",
          specialistCategoryId: "coafor-coafat",
        },
        {
          id: "coafor-extensii",
          label: "Extensii",
          description: "Montaj, întreținere și îndepărtare",
          hasChildren: true,
          nextStepId: "coafor-extensii",
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "coafor-tratamente",
          label: "Tratamente",
          description: "Terapie intensivă pentru păr",
          hasChildren: true,
          nextStepId: "coafor-tratamente",
          specialistCategoryId: "coafor-tratamente",
        },
        {
          id: "coafor-tuns",
          label: "Tuns",
          description: "Întreținere și redefinire",
          hasChildren: true,
          nextStepId: "coafor-tuns",
          specialistCategoryId: "coafor-tuns",
        },
      ],
    },
    "coafor-coafat": {
      id: "coafor-coafat",
      title: "Coafat (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "coafat-par-scurt",
          label: "Spălat + coafat păr scurt (până la bărbie)",
          price: 190,
          durationMinutes: 60,
          hasChildren: false,
          specialistCategoryId: "coafor-coafat",
        },
        {
          id: "coafat-par-mediu",
          label: "Spălat + coafat păr mediu (până la umeri)",
          price: 250,
          durationMinutes: 75,
          hasChildren: false,
          specialistCategoryId: "coafor-coafat",
        },
        {
          id: "coafat-par-lung",
          label: "Spălat + coafat păr lung (sub umeri)",
          price: 320,
          durationMinutes: 90,
          hasChildren: false,
          specialistCategoryId: "coafor-coafat",
        },
        {
          id: "coafat-ocazie",
          label: "Coafat ocazie",
          price: 380,
          durationMinutes: 110,
          hasChildren: false,
          specialistCategoryId: "coafor-coafat",
        },
        {
          id: "coafat-mireasa",
          label: "Coafat mireasă",
          price: 520,
          durationMinutes: 150,
          hasChildren: false,
          specialistCategoryId: "coafor-coafat",
        },
      ],
    },
    "coafor-extensii": {
      id: "coafor-extensii",
      title: "Extensii (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "coafor-extensii-montat",
          label: "Montat extensii",
          description: "Alege tipul de montaj",
          hasChildren: true,
          nextStepId: "coafor-extensii-montat",
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "coafor-extensii-intretinere",
          label: "Întreținere extensii",
          description: "Service periodic pentru extensii",
          hasChildren: true,
          nextStepId: "coafor-extensii-intretinere",
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "coafor-extensii-indepartare",
          label: "Îndepărtare extensii",
          description: "Demontare sigură",
          hasChildren: true,
          nextStepId: "coafor-extensii-indepartare",
          specialistCategoryId: "coafor-extensii",
        },
      ],
    },
    "coafor-extensii-montat": {
      id: "coafor-extensii-montat",
      title: "Montat extensii (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "montat-tape-on",
          label: "Tape-on (bandă adezivă)",
          price: 700,
          durationMinutes: 180,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "montat-microring",
          label: "Microring / Keratină",
          price: 900,
          durationMinutes: 210,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "montat-extensii-proprii",
          label: "Extensii proprii",
          price: 600,
          durationMinutes: 150,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
      ],
    },
    "coafor-extensii-intretinere": {
      id: "coafor-extensii-intretinere",
      title: "Întreținere extensii (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "intretinere-1-pachet",
          label: "1 pachet (volum ușor)",
          price: 250,
          durationMinutes: 90,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "intretinere-2-pachete",
          label: "2 pachete (volum + lungime medie)",
          price: 400,
          durationMinutes: 120,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "intretinere-3-plus-pachete",
          label: "3+ pachete (păr foarte lung sau des)",
          price: 550,
          durationMinutes: 150,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
      ],
    },
    "coafor-extensii-indepartare": {
      id: "coafor-extensii-indepartare",
      title: "Îndepărtare extensii (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "indepartare-tape-on",
          label: "Tape-on",
          price: 200,
          durationMinutes: 60,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
        {
          id: "indepartare-microring",
          label: "Microring / Keratină",
          price: 300,
          durationMinutes: 90,
          hasChildren: false,
          specialistCategoryId: "coafor-extensii",
        },
      ],
    },
    "coafor-tratamente": {
      id: "coafor-tratamente",
      title: "Tratamente (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "tratament-911-quinoa",
          label: "911 Quinoa Revival",
          price: 220,
          durationMinutes: 60,
          hasChildren: false,
          specialistCategoryId: "coafor-tratamente",
        },
        {
          id: "tratament-kerastase-booster",
          label: "Kérastase Booster",
          price: 250,
          durationMinutes: 45,
          hasChildren: false,
          specialistCategoryId: "coafor-tratamente",
        },
        {
          id: "tratament-tahe-botox",
          label: "Tahe Botox",
          price: 320,
          durationMinutes: 75,
          hasChildren: false,
          specialistCategoryId: "coafor-tratamente",
        },
        {
          id: "tratament-joico-kpak",
          label: "Joico K-Pak (4 pași)",
          price: 350,
          durationMinutes: 90,
          hasChildren: false,
          specialistCategoryId: "coafor-tratamente",
        },
        {
          id: "tratament-wellaplex",
          label: "Wellaplex",
          price: 280,
          durationMinutes: 60,
          hasChildren: false,
          specialistCategoryId: "coafor-tratamente",
        },
      ],
    },
    "coafor-tuns": {
      id: "coafor-tuns",
      title: "Tuns (alege una dintre opțiuni)",
      selectionType: "single",
      options: [
        {
          id: "coafor-tuns-varfuri",
          label: "Tuns vârfuri",
          price: 120,
          durationMinutes: 45,
          hasChildren: false,
          specialistCategoryId: "coafor-tuns",
        },
        {
          id: "coafor-tuns-forma",
          label: "Tuns formă",
          price: 180,
          durationMinutes: 60,
          hasChildren: false,
          specialistCategoryId: "coafor-tuns",
        },
      ],
    },
  },
}

export interface SpecialistCatalogEntry {
  label: string
  options: SpecialistOption[]
}

export const specialistCatalog: Record<string, SpecialistCatalogEntry> = {
  "frizerie-tuns": {
    label: "Tuns",
    options: [
      {
        id: "frizerie-tuns-1",
        name: "Andrei Popescu",
        rating: 4.9,
        firstAvailableDate: "2025-09-24",
      },
      {
        id: "frizerie-tuns-2",
        name: "Mihai Dinu",
        rating: 4.7,
        firstAvailableDate: "2025-09-25",
      },
      {
        id: "frizerie-tuns-any",
        name: "Oricare",
        rating: 0,
        firstAvailableDate: "2025-09-24",
      },
    ],
  },
  "frizerie-barba": {
    label: "Barbă",
    options: [
      {
        id: "frizerie-barba-1",
        name: "Alex Marinescu",
        rating: 4.8,
        firstAvailableDate: "2025-09-26",
      },
      {
        id: "frizerie-barba-2",
        name: "Radu Călinescu",
        rating: 4.6,
        firstAvailableDate: "2025-09-27",
      },
      {
        id: "frizerie-barba-any",
        name: "Oricare",
        rating: 0,
        firstAvailableDate: "2025-09-26",
      },
    ],
  },
  "frizerie-vopsit": {
    label: "Vopsit",
    options: [
      {
        id: "frizerie-vopsit-1",
        name: "Ioana Dumitrescu",
        rating: 4.9,
        firstAvailableDate: "2025-09-28",
      },
      {
        id: "frizerie-vopsit-2",
        name: "Ana Marinescu",
        rating: 4.7,
        firstAvailableDate: "2025-09-29",
      },
      {
        id: "frizerie-vopsit-any",
        name: "Oricare",
        rating: 0,
        firstAvailableDate: "2025-09-28",
      },
    ],
  },
  "coafor-coafat": {
    label: "Coafat",
    options: [
      {
        id: "coafor-coafat-1",
        name: "Irina Tudor",
        rating: 4.9,
        firstAvailableDate: "2025-09-25",
      },
      {
        id: "coafor-coafat-2",
        name: "Simona Ilie",
        rating: 4.8,
        firstAvailableDate: "2025-09-26",
      },
      {
        id: "coafor-coafat-any",
        name: "Oricare",
        rating: 0,
        firstAvailableDate: "2025-09-25",
      },
    ],
  },
  "coafor-extensii": {
    label: "Extensii",
    options: [
      {
        id: "coafor-extensii-1",
        name: "Bianca Ionescu",
        rating: 4.9,
        firstAvailableDate: "2025-09-27",
      },
      {
        id: "coafor-extensii-2",
        name: "Teodora Luca",
        rating: 4.7,
        firstAvailableDate: "2025-09-28",
      },
      {
        id: "coafor-extensii-any",
        name: "Oricare",
        rating: 0,
        firstAvailableDate: "2025-09-27",
      },
    ],
  },
  "coafor-tratamente": {
    label: "Tratamente",
    options: [
      {
        id: "coafor-tratamente-1",
        name: "Carla Enache",
        rating: 4.9,
        firstAvailableDate: "2025-09-24",
      },
      {
        id: "coafor-tratamente-2",
        name: "Daria Anton",
        rating: 4.8,
        firstAvailableDate: "2025-09-25",
      },
      {
        id: "coafor-tratamente-any",
        name: "Oricare",
        rating: 0,
        firstAvailableDate: "2025-09-24",
      },
    ],
  },
  "coafor-tuns": {
    label: "Tuns",
    options: [
      {
        id: "coafor-tuns-1",
        name: "Cristina Radu",
        rating: 4.8,
        firstAvailableDate: "2025-09-23",
      },
      {
        id: "coafor-tuns-2",
        name: "Laura Mitroi",
        rating: 4.7,
        firstAvailableDate: "2025-09-24",
      },
      {
        id: "coafor-tuns-any",
        name: "Oricare",
        rating: 0,
        firstAvailableDate: "2025-09-23",
      },
    ],
  },
}
