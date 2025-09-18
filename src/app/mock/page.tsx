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

import { Sparkles } from "lucide-react"

const navItems = [
  { href: "#services", label: "Services" },
  { href: "#stylists", label: "Stylists" },
  { href: "#offers", label: "Offers" },
  { href: "#contact", label: "Contact" },
]

export default function MockBookingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Silk speed={5} scale={1.2} color="#6D28D9" noiseIntensity={0.8} rotation={0.15} />
      </div>
      <div className="relative z-10">
        <header className="bg-background/40 text-white backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-background/30">
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
            <div className="flex justify-end md:flex-1">
              <ModeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center text-white">
            <h1 className="text-5xl font-bold tracking-tight">Glow &amp; Co. Salon</h1>
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

        <footer className="bg-background/40 py-10 text-white backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-background/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-white">
            <p>Glow &amp; Co. Salon • 123 Radiance Lane, Suite 200 • (555) 012-3456</p>
            <p>&copy; {new Date().getFullYear()} Glow &amp; Co. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
