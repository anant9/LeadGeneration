"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Search,
  BarChart3,
  MapPin,
  Shield,
  ArrowRight,
  Star,
  Globe,
  Sparkles,
  Phone,
  Clock,
  Tag,
  Navigation,
  CheckCircle2,
  FileSpreadsheet,
  Bot,
  BrainCircuit,
  Workflow,
  Cpu,
  ScanSearch,
  Database,
  CircuitBoard,
  Map,
  Link2,
  Check,
  Mail,
} from "lucide-react"

/* ---- Google icon ---- */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/* ---- Animated AI Agent Orb ---- */
function AIAgentOrb({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="pulse-ring absolute inset-0 rounded-full border-2 border-primary/30" />
      <div className="pulse-ring absolute inset-0 rounded-full border-2 border-primary/20" style={{ animationDelay: "0.6s" }} />
      <div className="pulse-ring absolute inset-0 rounded-full border-2 border-primary/10" style={{ animationDelay: "1.2s" }} />
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
        <div className="glow-pulse absolute inset-1 rounded-full bg-primary/30 blur-md" />
        <BrainCircuit className="relative h-1/2 w-1/2 text-primary" />
      </div>
    </div>
  )
}

/* ---- Floating sparkles ---- */
function SparkleField() {
  const sparks = [
    { top: "10%", left: "15%", delay: "0s", size: "h-1 w-1" },
    { top: "20%", left: "80%", delay: "0.5s", size: "h-1.5 w-1.5" },
    { top: "60%", left: "10%", delay: "1s", size: "h-1 w-1" },
    { top: "70%", left: "90%", delay: "1.5s", size: "h-1.5 w-1.5" },
    { top: "40%", left: "50%", delay: "0.8s", size: "h-1 w-1" },
    { top: "85%", left: "30%", delay: "0.3s", size: "h-1 w-1" },
    { top: "15%", left: "60%", delay: "1.2s", size: "h-1.5 w-1.5" },
    { top: "50%", left: "75%", delay: "0.7s", size: "h-1 w-1" },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {sparks.map((s, i) => (
        <div
          key={`spark-${i}`}
          className={`sparkle absolute rounded-full bg-primary/60 ${s.size}`}
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
    </div>
  )
}

/* ---- AI Demo Terminal ---- */
function AIDemoTerminal() {
  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5">
      <div className="gradient-border h-[2px]" />
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bot className="h-3 w-3 text-primary" />
          <span className="font-mono">extractai-agent</span>
        </div>
      </div>
      <div className="space-y-4 p-5 font-mono text-sm">
        <div className="flex gap-3">
          <span className="mt-0.5 shrink-0 text-primary">{">"}</span>
          <span className="text-foreground">{"Find top 200 restaurants in Manhattan with 4+ stars and 100+ reviews"}</span>
        </div>
        <div className="space-y-1.5 border-l-2 border-primary/30 pl-4">
          <div className="flex items-center gap-2 text-primary/80">
            <Cpu className="h-3.5 w-3.5" />
            <span className="text-xs">AI Agent parsing natural language...</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {[
              { delay: "0s", text: 'searchQuery: "restaurants"' },
              { delay: "0.2s", text: 'locationQuery: "Manhattan, New York"' },
              { delay: "0.4s", text: "maxResults: 200" },
              { delay: "0.6s", text: "scrapeEmails: true, scrapeSocial: true" },
            ].map((item) => (
              <div key={item.text} className="data-stream flex items-center gap-2" style={{ animationDelay: item.delay }}>
                <CheckCircle2 className="h-3 w-3 text-primary/60" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary/60" />
            <span>{"Splitting Manhattan into 8 geo-zones for full coverage..."}</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{"Extracted 200 results with 34 data fields each -- $2.00 total"}</span>
            <span className="cursor-blink ml-1 inline-block h-4 w-0.5 bg-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Agent Workflow diagram ---- */
function AgentWorkflow() {
  const nodes = [
    { icon: ScanSearch, label: "Natural Language\nQuery", sub: "You describe, AI understands" },
    { icon: BrainCircuit, label: "AI Agent\nParses", sub: "Converts intent to parameters" },
    { icon: Database, label: "Unlimited\nExtraction", sub: "No result caps, full coverage" },
    { icon: BarChart3, label: "Enriched\nResults", sub: "30+ fields, map view & CRM" },
  ]
  return (
    <div className="relative flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-0">
      {nodes.map((node, i) => (
        <div key={node.label} className="flex items-center gap-0">
          <div className="group relative flex flex-col items-center gap-3">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:shadow-lg group-hover:shadow-primary/10">
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              <node.icon className="relative h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="whitespace-pre-line text-xs font-semibold leading-tight text-foreground">{node.label}</span>
              <span className="max-w-[120px] text-[10px] leading-tight text-muted-foreground">{node.sub}</span>
            </div>
          </div>
          {i < nodes.length - 1 && (
            <div className="hidden items-center px-3 sm:flex">
              <div className="h-px w-8 bg-primary/20" />
              <div className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-primary/30" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---- Map preview with plotted pins ---- */
function MapPreview() {
  const pins = [
    { x: 38, y: 25, label: "Joe's Pizza", score: "hot", rating: "4.5" },
    { x: 52, y: 18, label: "Tatiana", score: "warm", rating: "4.7" },
    { x: 35, y: 55, label: "Katz's Deli", score: "hot", rating: "4.6" },
    { x: 48, y: 32, label: "Le Bernardin", score: "warm", rating: "4.7" },
    { x: 50, y: 35, label: "Halal Guys", score: "warm", rating: "4.3" },
    { x: 28, y: 70, label: "Peter Luger", score: "hot", rating: "4.4" },
    { x: 42, y: 42, label: "Los Tacos No.1", score: "warm", rating: "4.6" },
    { x: 34, y: 58, label: "Russ & Daughters", score: "cold", rating: "4.5" },
    { x: 60, y: 22, label: "Levain Bakery", score: "cold", rating: "4.4" },
    { x: 45, y: 12, label: "Shake Shack UWS", score: "warm", rating: "4.2" },
    { x: 55, y: 48, label: "Di Fara Pizza", score: "hot", rating: "4.3" },
    { x: 30, y: 38, label: "Artichoke Pizza", score: "cold", rating: "4.1" },
    { x: 62, y: 40, label: "Emmy Squared", score: "warm", rating: "4.5" },
    { x: 22, y: 50, label: "Lucali", score: "hot", rating: "4.7" },
    { x: 68, y: 30, label: "Juliana's Pizza", score: "warm", rating: "4.6" },
  ]
  const dotColor = (s: string) => s === "hot" ? "bg-red-500" : s === "warm" ? "bg-amber-500" : "bg-sky-500"
  const ringColor = (s: string) => s === "hot" ? "bg-red-500/30" : s === "warm" ? "bg-amber-500/30" : "bg-sky-500/30"

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5">
      <div className="gradient-border h-[2px]" />
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-0.5">
            <span className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground">Table</span>
            <span className="flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
              <Map className="h-3 w-3" /> Map
            </span>
          </div>
          <Badge variant="secondary" className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">200 places</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg bg-transparent px-2 text-[10px]">
            <FileSpreadsheet className="h-3 w-3" /> Export
          </Button>
          <Button size="sm" className="h-7 gap-1 rounded-lg px-2 text-[10px]">
            <Link2 className="h-3 w-3" /> Push to CRM
          </Button>
        </div>
      </div>

      {/* Map area */}
      <div className="relative h-[340px] bg-[#1a1f1d] sm:h-[400px]">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "linear-gradient(hsl(160 84% 39% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39% / 0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Faux road lines */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="20" y1="0" x2="20" y2="100" stroke="hsl(160 5% 25%)" strokeWidth="0.3" />
          <line x1="40" y1="0" x2="40" y2="100" stroke="hsl(160 5% 25%)" strokeWidth="0.2" />
          <line x1="65" y1="0" x2="65" y2="100" stroke="hsl(160 5% 25%)" strokeWidth="0.3" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="hsl(160 5% 25%)" strokeWidth="0.2" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="hsl(160 5% 25%)" strokeWidth="0.3" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="hsl(160 5% 25%)" strokeWidth="0.2" />
          {/* Diagonal avenues */}
          <line x1="15" y1="0" x2="55" y2="100" stroke="hsl(160 5% 22%)" strokeWidth="0.4" />
          <line x1="70" y1="0" x2="30" y2="100" stroke="hsl(160 5% 22%)" strokeWidth="0.3" />
        </svg>

        {/* Pins */}
        {pins.map((pin, i) => (
          <div
            key={`pin-${i}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            {/* Pulse ring on hot */}
            {pin.score === "hot" && (
              <div className={`pulse-ring absolute -inset-2 rounded-full ${ringColor(pin.score)}`} />
            )}
            <div className={`relative h-3 w-3 rounded-full border-2 border-background shadow-lg ${dotColor(pin.score)} transition-transform group-hover:scale-150`} />
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/50 bg-card px-2.5 py-1.5 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-foreground">{pin.label}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                  <Star className="h-2.5 w-2.5 fill-amber-400" />
                  {pin.rating}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Location label */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-border/50 bg-card/90 px-3 py-2 backdrop-blur-sm">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Manhattan, New York</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-border/50 bg-card/90 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Hot Lead</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Warm</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-muted-foreground">Cold</span>
          </div>
        </div>

        {/* Scan beam animation */}
        <div className="beam-scan pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
    </div>
  )
}

/* ---- CRM connector logos row ---- */
const crmConnectors = [
  { name: "Salesforce", abbr: "SF", color: "bg-sky-500/15 text-sky-500 border-sky-500/30" },
  { name: "HubSpot", abbr: "HS", color: "bg-orange-500/15 text-orange-500 border-orange-500/30" },
  { name: "Zoho CRM", abbr: "ZO", color: "bg-red-500/15 text-red-500 border-red-500/30" },
  { name: "Pipedrive", abbr: "PD", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  { name: "Close", abbr: "CL", color: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30" },
]

/* ---- Static data ---- */
const dataPoints = [
  { icon: Tag, label: "Place Name & URL" },
  { icon: MapPin, label: "Full Address & GPS" },
  { icon: Phone, label: "Phone & Emails" },
  { icon: Globe, label: "Website & Socials" },
  { icon: Star, label: "Rating & Reviews" },
  { icon: Clock, label: "Opening Hours" },
  { icon: Navigation, label: "Lat/Lng Coordinates" },
  { icon: FileSpreadsheet, label: "Category & Price" },
]

const features = [
  {
    icon: BrainCircuit,
    title: "AI Agent Understands Plain English",
    description: "No query syntax needed. Our AI agent interprets your natural language and converts it into precise extraction parameters automatically.",
  },
  {
    icon: Map,
    title: "Interactive Map Visualization",
    description: "See every extracted business plotted on a live map with color-coded lead scoring. Click any pin to see full details, ratings, and contact info.",
  },
  {
    icon: Workflow,
    title: "Autonomous Extraction Pipeline",
    description: "The AI agent orchestrates the entire workflow: parse query, configure extraction, fetch data, enrich fields, score leads, and deliver structured results.",
  },
  {
    icon: CircuitBoard,
    title: "30+ Enriched Data Fields",
    description: "Every place is enriched with emails, social profiles, opening hours, review distribution, photos, price level, accessibility info, and more.",
  },
  {
    icon: Link2,
    title: "Direct CRM Integration",
    description: "Push extracted leads straight to Salesforce, HubSpot, Zoho, Pipedrive, or Close CRM with one click. No manual import, no CSV juggling.",
  },
  {
    icon: Shield,
    title: "Transparent $10 / 1,000 Results",
    description: "Only pay for what you extract at $10 per 1,000 results. See exact costs upfront before every run. No hidden fees, no per-query charges.",
  },
]

const steps = [
  {
    step: "01",
    title: "Tell the AI agent what you need",
    description: "Type a natural language query like \"Find 500 restaurants in NYC with 4+ stars\". The AI agent interprets your intent, location, filters, and result size.",
    icon: ScanSearch,
  },
  {
    step: "02",
    title: "AI configures & runs extraction",
    description: "The agent converts your query into structured parameters and shows you a preview. Adjust anything before running. Results are fetched with all 30+ data fields.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Visualize, filter & push to CRM",
    description: "View results in a data table or interactive map. Filter by lead score, rating, or location. Export to CSV/JSON or push directly to your CRM.",
    icon: Sparkles,
  },
]

const stats = [
  { value: "70K+", label: "Users worldwide" },
  { value: "30+", label: "Data fields per place" },
  { value: "$10", label: "Per 1,000 results" },
  { value: "<3s", label: "AI query parsing" },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For testing and small projects",
    results: "250 results/month",
    features: ["CSV & JSON export", "30+ data fields", "Email scraping", "Community support"],
  },
  {
    name: "Growth",
    price: "$49",
    period: "/mo",
    description: "For growing teams and agencies",
    results: "5,000 results/month",
    popular: true,
    features: ["All export formats", "Email + Social scraping", "Review detail scraping", "2 CRM connectors", "Saved searches", "Priority support"],
  },
  {
    name: "Business",
    price: "$149",
    period: "/mo",
    description: "For high-volume lead generation",
    results: "20,000 results/month",
    features: ["Full data enrichment", "All 5 CRM connectors", "Review scraping (50/place)", "API access", "Dedicated support", "Custom field mapping"],
  },
  {
    name: "Enterprise",
    price: "$399",
    period: "/mo",
    description: "For large-scale operations",
    results: "100,000 results/month",
    features: ["White-label exports", "Custom CRM integrations", "Bulk extraction queue", "SLA guarantee", "Dedicated account manager", "Webhook notifications"],
  },
]

export default function HomePage() {
  const { signIn } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    signIn()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
              <div className="absolute -inset-0.5 rounded-lg bg-primary/20 blur-sm" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">ExtractAI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="h-8 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={handleGetStarted}>
              Sign in
            </Button>
            <Button size="sm" className="h-8 gap-1.5 rounded-lg px-4 text-sm font-medium" onClick={handleGetStarted}>
              <Sparkles className="h-3.5 w-3.5" /> Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <section className="ai-grid relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="orb-float absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-primary/[0.06] blur-[100px]" />
          <div className="orb-float-delayed absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-[80px]" />
        </div>
        <SparkleField />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-20 lg:px-6 lg:pb-16 lg:pt-28">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </div>
              AI-Powered Extraction Agent
            </div>

            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your AI agent for{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Google Maps data</span>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-primary/30" />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Google Maps was never built for bulk extraction. Our AI agent goes beyond native limits
              -- extract <span className="font-semibold text-foreground">unlimited results</span> with
              30+ enriched data fields, visualize on a live map, and push leads directly to your CRM.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 gap-2.5 rounded-xl px-6 text-sm font-medium shadow-lg shadow-primary/20" onClick={handleGetStarted}>
                <Bot className="h-4 w-4" />
                Launch AI Agent
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 gap-2.5 rounded-xl border-border/70 bg-transparent px-6 text-sm font-medium hover:bg-accent" onClick={handleGetStarted}>
                <GoogleIcon className="h-4 w-4" />
                Continue with Google
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required. Free credits on signup.</p>
          </div>

          {/* Live AI demo terminal */}
          <div className="mt-16">
            <AIDemoTerminal />
          </div>
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:grid-cols-4 lg:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 py-8 lg:py-10">
              <span className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{stat.value}</span>
              <span className="text-xs text-muted-foreground lg:text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ====== WHY NOT GOOGLE MAPS -- CLEAN COMPARISON ====== */}
      <section className="relative overflow-hidden border-b border-border/50 py-20 lg:py-28" id="why-extractai">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              Why teams switch to ExtractAI
            </div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Go beyond native Google Maps limits
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
              Google Maps was built for consumers, not data teams. Here{"'"}s what changes with an AI-powered approach.
            </p>
          </div>

          {/* Comparison table */}
          <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-border/50 bg-card">
            {/* Table header */}
            <div className="grid grid-cols-3 border-b border-border/50 bg-muted/30 px-5 py-3.5">
              <span className="text-xs font-medium text-muted-foreground">Feature</span>
              <span className="text-center text-xs font-medium text-muted-foreground">Google Maps</span>
              <span className="text-center text-xs font-medium text-primary">ExtractAI</span>
            </div>
            {/* Table rows */}
            {[
              { feature: "Results per search", google: "60 (API) / 120 (UI)", ours: "Unlimited", highlight: true },
              { feature: "Data fields", google: "~8 basic fields", ours: "30+ enriched fields", highlight: false },
              { feature: "Email & social scraping", google: "Not available", ours: "Included", highlight: false },
              { feature: "Cost for 1K results", google: "~$350 (API fees)", ours: "$10 flat", highlight: true },
              { feature: "Geo-zone splitting", google: "Manual only", ours: "Auto (AI agent)", highlight: false },
              { feature: "CRM integration", google: "None", ours: "5 connectors", highlight: false },
              { feature: "Export formats", google: "Copy-paste", ours: "CSV, Excel, JSON", highlight: false },
              { feature: "Map visualization", google: "120 pins max", ours: "Unlimited pins", highlight: false },
            ].map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 items-center px-5 py-3.5 ${i % 2 === 0 ? "bg-muted/10" : ""} ${i < 7 ? "border-b border-border/30" : ""}`}
              >
                <span className="text-sm font-medium text-foreground">{row.feature}</span>
                <span className="text-center text-sm text-muted-foreground">{row.google}</span>
                <span className={`text-center text-sm font-medium ${row.highlight ? "text-primary" : "text-foreground"}`}>{row.ours}</span>
              </div>
            ))}
          </div>

          {/* Compact callout */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-primary/15 bg-primary/[0.03] px-6 py-5 text-center sm:flex-row sm:text-left">
            <div className="flex shrink-0 items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">The bottom line</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              One natural language query. All matching results with 30+ fields.
              <span className="font-semibold text-primary"> 35x cheaper</span> than the Google Maps API with
              <span className="font-semibold text-primary"> 5x more data</span> per result.
            </p>
          </div>
        </div>
      </section>

      {/* ====== MAP VISUALIZATION SECTION ====== */}
      <section className="ai-grid relative overflow-hidden border-b border-border/50 py-20 lg:py-28">
        <SparkleField />
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              <Map className="h-3 w-3" />
              Interactive Map View
            </div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              See every lead plotted on a live map
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Every extracted business is plotted on an interactive map with color-coded lead scoring.
              Click any pin to reveal ratings, contact info, and a direct link to Google Maps.
            </p>
          </div>
          <div className="mt-14">
            <MapPreview />
          </div>
        </div>
      </section>

      {/* ====== AGENT WORKFLOW ====== */}
      <section className="relative border-b border-border/50 py-20 lg:py-28">
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              <Workflow className="h-3 w-3" />
              Agentic AI Pipeline
            </div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              An autonomous AI agent, not just a scraper
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              ExtractAI runs an intelligent pipeline that understands your intent,
              configures the right parameters, and delivers enriched, lead-scored results.
            </p>
          </div>
          <div className="mt-14">
            <AgentWorkflow />
          </div>
        </div>
      </section>

      {/* ====== DATA FIELDS ====== */}
      <section className="border-b border-border/50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              30+ data fields extracted per place
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              The AI agent extracts everything Google Maps shows and enriches it further -- emails, social profiles, review insights, and operational status.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dataPoints.map((dp) => (
              <div
                key={dp.label}
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <dp.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{dp.label}</span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
            {[
              "Place ID", "Postal Code", "State / Region", "Neighborhood",
              "Claim Status", "Closed Status", "Photos Count", "Review Tags",
              "Gas Prices", "Accessibility", "People Also Search", "Google Food URL",
              "Review Distribution", "Social Profiles", "Email Addresses", "Plus Code",
            ].map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-primary/60" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Built for AI-powered lead generation at scale
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Let the AI agent handle extraction complexity. You focus on closing deals.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute -top-12 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-primary/0 blur-2xl transition-all group-hover:bg-primary/5" />
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="relative flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CRM INTEGRATIONS ====== */}
      <section className="border-y border-border/50 bg-card/30 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              <Link2 className="h-3 w-3" />
              CRM Connectors
            </div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Push leads directly to your CRM
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              No CSV exports. No manual imports. One click sends every extracted lead -- with
              phone, email, socials, and lead score -- straight into your sales pipeline.
            </p>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            {crmConnectors.map((crm) => (
              <div
                key={crm.name}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card px-8 py-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl border text-lg font-bold ${crm.color} transition-transform group-hover:scale-110`}>
                  {crm.abbr}
                </div>
                <span className="text-sm font-medium text-foreground">{crm.name}</span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-primary/60" /> Emails mapped</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-primary/60" /> Phone synced</span>
              <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-primary/60" /> Website & socials</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary/60" /> Rating & score</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary/60" /> Full address</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="ai-grid relative py-20 lg:py-28">
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              <Bot className="h-3 w-3" />
              How the Agent Works
            </div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Three steps. Zero configuration.
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              No API keys. No parameters to memorize. Just chat with the AI agent
              and get structured, enriched place data.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.step}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-mono text-2xl font-bold text-primary/20">{step.step}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section className="border-y border-border/50 bg-card/30 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Pay only for results you extract. $10 per 1,000 results. No hidden fees.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg ${
                  plan.popular
                    ? "border-primary/40 shadow-lg shadow-primary/10"
                    : "border-border/50 hover:border-primary/20 hover:shadow-primary/5"
                }`}
              >
                {plan.popular && (
                  <div className="gradient-border absolute inset-x-0 top-0 h-[2px]" />
                )}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                    {plan.popular && (
                      <Badge className="rounded-md bg-primary/15 px-1.5 py-0 text-[9px] font-semibold text-primary">Popular</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mt-4 flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold tracking-tight text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="mt-1 text-xs font-medium text-primary">{plan.results}</p>
                <div className="mt-6 flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  size="sm"
                  className={`mt-6 w-full rounded-xl text-xs ${!plan.popular ? "bg-transparent" : ""}`}
                  onClick={handleGetStarted}
                >
                  {plan.price === "Free" ? "Get Started Free" : "Start Free Trial"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIAL ====== */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={`star-${i + 1}`} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-balance text-lg font-medium leading-relaxed text-foreground sm:text-xl">
              {"\"ExtractAI's AI agent completely replaced our manual workflow. We just describe what leads we need and it delivers thousands of enriched contacts with emails, socials, and lead scores. The map view is a game changer for territory planning.\""}
            </blockquote>
            <div className="mt-6 flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-foreground">Priya Sharma</span>
              <span className="text-xs text-muted-foreground">Head of Growth, ScaleUp Digital</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="ai-grid relative border-t border-border/50 bg-card/30 py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="glow-pulse absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <AIAgentOrb className="mb-8 h-20 w-20" />
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ready to deploy your AI extraction agent?
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Start extracting Google Maps data in seconds. Visualize on map, filter by lead score, push to CRM.
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 gap-2.5 rounded-xl px-8 text-sm font-medium shadow-lg shadow-primary/20"
              onClick={handleGetStarted}
            >
              <Bot className="h-4 w-4" />
              Launch AI Agent
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">ExtractAI</span>
          </div>
          <p className="text-xs text-muted-foreground">2026 ExtractAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
