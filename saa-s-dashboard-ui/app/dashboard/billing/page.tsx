"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { billingPlans, mockInvoices } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Coins,
  Zap,
  Download,
  TrendingUp,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function BillingPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState("growth")

  const currentPlan = billingPlans.find((p) => p.id === selectedPlan)

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId)
    const plan = billingPlans.find((p) => p.id === planId)
    toast.success("Plan updated", {
      description: `You are now on the ${plan?.name} plan.`,
    })
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success("Downloading invoice", {
      description: `Invoice ${invoiceId} download started.`,
    })
  }

  const totalSpent = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalResults = mockInvoices.reduce((sum, inv) => sum + inv.resultsUsed, 0)

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-foreground">Billing & Plans</h1>
            <p className="text-sm text-muted-foreground">
              Manage your subscription, view usage, and download invoices.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">

          {/* Usage Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground">{currentPlan?.name}</span>
                  <span className="text-xs text-muted-foreground">Current Plan</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground">{user?.credits.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Credits Remaining</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground">{totalResults.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Results This Quarter</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground">${totalSpent.toFixed(0)}</span>
                  <span className="text-xs text-muted-foreground">Total Spent</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Plans */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-foreground">Plans</h2>
              <p className="text-sm text-muted-foreground">
                All plans include 30+ data fields per result. Pricing at $10 per 1,000 results baseline.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {billingPlans.map((plan) => {
                const isSelected = plan.id === selectedPlan
                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative border-border/50 transition-all",
                      isSelected && "border-primary/50 shadow-lg shadow-primary/5",
                      plan.popular && "ring-1 ring-primary/20"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <Badge className="rounded-full bg-primary px-3 text-[10px] font-medium text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="flex flex-col gap-4 p-5 pt-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-foreground">
                            ${plan.price}
                          </span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {plan.resultsPerMonth.toLocaleString()} results/month
                        </span>
                      </div>

                      <div className="h-px bg-border" />

                      <ul className="flex flex-col gap-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "mt-auto w-full rounded-xl",
                          !isSelected && "bg-transparent"
                        )}
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isSelected}
                      >
                        {isSelected ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Invoice History */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-foreground">Invoice History</h2>
                <p className="text-sm text-muted-foreground">
                  Your billing history and downloadable invoices.
                </p>
              </div>
              <Badge variant="secondary" className="gap-1.5 rounded-lg bg-muted px-3 py-1 text-xs">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                {mockInvoices.length} invoices
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</TableHead>
                    <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Date</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Results Used</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-border/30 transition-colors hover:bg-muted/40">
                      <TableCell>
                        <span className="font-mono text-sm font-medium text-foreground">{invoice.id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{invoice.description}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {invoice.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm text-muted-foreground">{invoice.resultsUsed.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm font-medium text-foreground">${invoice.amount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.status === "paid" ? (
                          <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400">
                            Paid
                          </Badge>
                        ) : invoice.status === "pending" ? (
                          <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="rounded-md text-[11px]">
                            Overdue
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          title="Download invoice"
                        >
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Payment method */}
          <Card className="border-border/50">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">Visa ending in 4242</span>
                  <span className="text-xs text-muted-foreground">Expires 08/2027</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                Update
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
