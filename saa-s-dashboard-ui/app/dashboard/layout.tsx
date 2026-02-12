"use client"

import React from "react"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardProvider } from "@/lib/dashboard-context"
import { Navbar } from "@/components/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, signIn } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      signIn()
    }
  }, [isAuthenticated, signIn])

  return (
    <DashboardProvider>
      <div className="flex h-screen flex-col bg-background">
        <Navbar />
        <main className="flex min-h-0 flex-1">{children}</main>
      </div>
    </DashboardProvider>
  )
}
