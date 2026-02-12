"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Zap, CreditCard, Settings, LogOut, Coins } from "lucide-react"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const handleLogout = () => {
    signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
              <div className="absolute -inset-0.5 rounded-lg bg-primary/20 blur-sm" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              ExtractAI
            </span>
            <span className="hidden rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary sm:inline">
              Agent
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-3 text-sm font-medium text-foreground"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/saved">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Saved Searches
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Billing
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="hidden gap-1.5 rounded-lg border border-border/50 bg-secondary/80 px-2.5 py-1 text-xs font-medium sm:flex"
          >
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span className="text-secondary-foreground">
              {user?.credits.toLocaleString()} credits
            </span>
          </Badge>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 rounded-lg" asChild>
                <Link href="/dashboard/saved">
                  <Settings className="h-4 w-4" />
                  Saved Searches
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 rounded-lg" asChild>
                <Link href="/dashboard/billing">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 rounded-lg text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
