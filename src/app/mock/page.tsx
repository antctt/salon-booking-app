import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
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
    <div className="bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="size-6 text-primary" aria-hidden="true" />
            Glow &amp; Co.
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink href={item.href} className="px-4 py-2">
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <Button variant="outline" size="sm">
            Switch Mode
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight">Glow &amp; Co. Salon</h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="sm" className="px-6 text-sm font-semibold">
              Book Now
            </Button>
            <Link href="#gallery" className="text-sm font-medium text-primary">
              View gallery &rarr;
            </Link>
          </div>
        </section>

        <BookingStepper />
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-muted-foreground">
          <p>Glow &amp; Co. Salon • 123 Radiance Lane, Suite 200 • (555) 012-3456</p>
          <p>&copy; {new Date().getFullYear()} Glow &amp; Co. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
