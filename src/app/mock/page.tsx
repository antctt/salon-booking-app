"use client"

import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react"

import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import Silk from "@/components/Silk"
import BookingStepper from "./booking-stepper"

import { Pencil, Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "#services", label: "Services" },
  { href: "#stylists", label: "Stylists" },
  { href: "#offers", label: "Offers" },
  { href: "#contact", label: "Contact" },
]

const DEFAULT_TITLE = "Glow & Co. Salon"
const DEFAULT_DESCRIPTION =
  "Experience refined self-care rooted in craft. From precision cuts and luminous color to restorative treatments and tailored styling, our artists blend technique with creativity to help you look—and feel— unmistakably you."

const EditableHint = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute -right-5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white opacity-80 shadow-sm ring-1 ring-inset ring-white/30 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
  >
    <Pencil className="size-3" />
  </span>
)

export default function MockBookingPage() {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [heroTitle, setHeroTitle] = useState(DEFAULT_TITLE)
  const [heroDescription, setHeroDescription] = useState(DEFAULT_DESCRIPTION)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  const sanitizeContent = (value: string, fallback: string) => {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : fallback
  }

  const persistHeroCopy = () => {
    const nextTitle = sanitizeContent(titleRef.current?.textContent ?? "", DEFAULT_TITLE)
    const nextDescription = sanitizeContent(
      descriptionRef.current?.textContent ?? "",
      DEFAULT_DESCRIPTION,
    )

    setHeroTitle(nextTitle)
    setHeroDescription(nextDescription)
  }

  const handleEditableBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget === titleRef.current) {
      const updatedTitle = sanitizeContent(event.currentTarget.textContent ?? "", DEFAULT_TITLE)
      setHeroTitle(updatedTitle)
      return
    }

    if (event.currentTarget === descriptionRef.current) {
      const updatedDescription = sanitizeContent(event.currentTarget.textContent ?? "", DEFAULT_DESCRIPTION)
      setHeroDescription(updatedDescription)
    }
  }

  const handleHeadingKeyDown = (event: KeyboardEvent<HTMLHeadingElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  const handleAdminToggle = (checked: boolean) => {
    if (!checked) {
      persistHeroCopy()
    }
    setIsAdminMode(checked)
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Silk speed={5} scale={1.2} color="#6D28D9" noiseIntensity={0.8} rotation={0.15} />
      </div>
      <div className="relative z-10 flex flex-1 flex-col">
        <header className="bg-background/40 text-white backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-background/10">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
            <div className="flex items-center md:flex-1">
              <Link href="#" className="flex items-center gap-2 text-lg font-semibold text-white hover:text-white/80">
                <Sparkles className="size-6 text-white" aria-hidden="true" />
                Glow &amp; Co.
              </Link>
            </div>
            <NavigationMenu className="hidden text-white md:flex md:flex-1 md:justify-center">
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink href={item.href} className="px-4 py-2 text-white hover:text-white/80">
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center justify-end gap-4 md:flex-1">
              <div className="flex items-center gap-2 text-white">
                <Switch id="admin-mode-toggle" checked={isAdminMode} onCheckedChange={handleAdminToggle} />
                <Label htmlFor="admin-mode-toggle" className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-white">
                  Admin
                </Label>
              </div>
              <ModeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-12">
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center text-white">
            <div className={cn("relative mx-auto", isAdminMode && "group -mx-3 -my-2")}>
              {isAdminMode && <EditableHint />}
              <h1
                ref={titleRef}
                className={cn(
                  "text-5xl font-bold tracking-tight",
                  isAdminMode &&
                    "cursor-text rounded-md px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-3 focus-visible:ring-offset-background",
                )}
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={handleEditableBlur}
                onKeyDown={handleHeadingKeyDown}
              >
                {heroTitle}
              </h1>
            </div>
            <div className={cn("relative mx-auto", isAdminMode && "group -mx-3 -my-2")}>
              {isAdminMode && <EditableHint />}
              <p
                ref={descriptionRef}
                className={cn(
                  "max-w-2xl text-balance text-lg font-medium leading-relaxed text-white/90",
                  isAdminMode &&
                    "cursor-text rounded-md px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-3 focus-visible:ring-offset-background",
                )}
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={handleEditableBlur}
              >
                {heroDescription}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="sm"
                className="px-6 text-sm font-semibold border border-border bg-card text-card-foreground hover:bg-card/90"
              >
                Book Now
              </Button>
              <Link href="#gallery" className="text-sm font-medium text-white hover:text-white/80">
                View gallery &rarr;
              </Link>
            </div>
          </section>

          <BookingStepper />
        </main>

        <footer className="bg-background/40 py-10 text-white backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-background/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-white">
            <p>Glow &amp; Co. Salon • 123 Radiance Lane, Suite 200 • (555) 012-3456</p>
            <p>&copy; {new Date().getFullYear()} Glow &amp; Co. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
