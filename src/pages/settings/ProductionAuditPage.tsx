import { useState } from "react";
import {
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, ChevronDown, ChevronUp,
  Database, Cloud, Lock, Users, Zap, RefreshCw, Globe, Server,
  DollarSign, FileText, Calendar, Camera, Brain, Truck, ClipboardCheck,
  Receipt, Scale, BarChart3, Key, Wifi, HardDrive, Shield,
  ExternalLink, Info, Star, TrendingUp, Package,
} from "lucide-react";
import { Badge } from "../../components/ui";

/* ─────────────────────────────────────────────────────── */
/*  Types                                                  */
/* ─────────────────────────────────────────────────────── */

type ReadinessLevel = "ready" | "partial" | "mock" | "missing";
type Priority = "critical" | "high" | "medium" | "low";

interface ModuleAudit {
  name: string;
  icon: React.ElementType;
  status: ReadinessLevel;
  score: number; // 0-100
  currentState: string;
  missing: string[];
  requiredAPIs: string[];
  requiredData: string[];
}

interface ApiRequirement {
  name: string;
  category: string;
  priority: Priority;
  purpose: string;
  provider: string;
  estimatedCost: string;
}

interface OrgRequirement {
  title: string;
  description: string;
  priority: Priority;
  effort: string;
}

/* ─────────────────────────────────────────────────────── */
/*  Data                                                   */
/* ─────────────────────────────────────────────────────── */

const modules: ModuleAudit[] = [
  {
    name: "Authentication & Multi-User",
    icon: Lock,
    status: "missing",
    score: 0,
    currentState: "No authentication layer exists. All pages are publicly accessible. There is no concept of users, roles, or organisations.",
    missing: [
      "User registration / login flows",
      "JWT or session-based auth",
      "Role-based access control (Admin, Manager, Field Tech, Sub, Client)",
      "Organisation (tenant) isolation",
      "Password reset, 2FA, SSO",
    ],
    requiredAPIs: ["Auth0 / Supabase Auth / Firebase Auth", "Internal REST /auth endpoints"],
    requiredData: ["users table", "roles table", "organisations table", "sessions table"],
  },
  {
    name: "Database & Backend API",
    icon: Database,
    status: "missing",
    score: 0,
    currentState: "All state lives in Zustand in-memory stores populated from hard-coded mock files. Data resets on every page refresh. There is no backend service.",
    missing: [
      "REST or GraphQL API server (Node/Express, Fastify, or serverless)",
      "PostgreSQL / Supabase / PlanetScale database",
      "ORM layer (Prisma, Drizzle)",
      "Data persistence and migrations",
      "File/blob storage (S3, Cloudflare R2)",
    ],
    requiredAPIs: ["Internal REST API", "Supabase / PlanetScale / RDS"],
    requiredData: ["All entities: projects, estimates, crews, contracts, invoices, inspections, leads, users"],
  },
  {
    name: "CRM – Projects & Leads",
    icon: Users,
    status: "mock",
    score: 25,
    currentState: "UI is complete with pipeline stages, contact management, and project detail views. All data is mocked.",
    missing: [
      "Persistent CRUD operations wired to real API",
      "Real-time updates (WebSocket / SSE)",
      "Email/SMS contact integration",
      "Activity log & audit trail",
      "File attachments per project",
    ],
    requiredAPIs: ["Twilio (SMS)", "SendGrid / Postmark (email)", "Google Maps API (address autocomplete)"],
    requiredData: ["projects", "leads", "contacts", "activities", "attachments"],
  },
  {
    name: "Estimates & Xactimate",
    icon: FileText,
    status: "mock",
    score: 30,
    currentState: "Full line-item editor, price list, supplements flow, and PDF export stubs are present. Pricing data is static. No real Xactimate API calls.",
    missing: [
      "Live Xactimate API / XactAnalysis credentials & OAuth flow",
      "Real-time Xactimate regional pricing sync",
      "PDF generation (Puppeteer / pdf-lib) with company letterhead",
      "Digital signature capture",
      "Estimate version history stored in DB",
    ],
    requiredAPIs: ["Xactimate API (Verisk)", "XactAnalysis API", "DocuSign / HelloSign for e-signatures"],
    requiredData: ["estimates", "estimate_lines", "price_items", "supplements", "estimate_versions"],
  },
  {
    name: "Scheduling & Crews",
    icon: Calendar,
    status: "mock",
    score: 20,
    currentState: "Calendar UI with drag-and-drop stubs and crew roster views exist. No calendar persistence or crew communication.",
    missing: [
      "Real calendar backend with conflict detection",
      "Push notifications to crew mobile devices",
      "Google Calendar / Outlook sync",
      "GPS location tracking for crews (optional)",
      "Route optimisation",
    ],
    requiredAPIs: ["Google Calendar API", "Firebase Cloud Messaging (push notifications)", "Twilio (SMS reminders)"],
    requiredData: ["jobs", "job_assignments", "crews", "crew_members", "availability_blocks"],
  },
  {
    name: "Financial & Invoices",
    icon: Receipt,
    status: "mock",
    score: 20,
    currentState: "Invoice list, job expenses, and financial reports are UI-only with mock figures.",
    missing: [
      "Real invoice generation and PDF delivery",
      "Payment processing (Stripe / Square)",
      "Recurring invoice automation",
      "Expense receipt OCR / upload",
      "Profit & loss calculation from live data",
    ],
    requiredAPIs: ["Stripe / Square Payments", "Plaid (bank feeds)", "QuickBooks Online API"],
    requiredData: ["invoices", "invoice_line_items", "payments", "expenses", "expense_receipts"],
  },
  {
    name: "QuickBooks Integration",
    icon: DollarSign,
    status: "mock",
    score: 15,
    currentState: "QuickBooks sync, 1099, mileage, and tax report pages exist as UI shells referencing no real QB data.",
    missing: [
      "QuickBooks Online OAuth 2.0 connection",
      "Real-time customer, invoice, payment sync",
      "Webhook listener for QB events",
      "Mileage rate sync from IRS/QB",
      "1099 contractor data pull",
    ],
    requiredAPIs: ["QuickBooks Online API (Intuit OAuth 2.0)", "IRS mileage rate feed"],
    requiredData: ["qb_customers", "qb_invoices", "qb_payments", "mileage_logs", "contractor_1099"],
  },
  {
    name: "Contracts & E-Signatures",
    icon: Scale,
    status: "mock",
    score: 25,
    currentState: "Contract list, templates, and AI legal monitor pages exist. No real document generation or signing flow.",
    missing: [
      "PDF contract generation from templates",
      "DocuSign / HelloSign e-signature workflow",
      "Signed document storage in blob storage",
      "Contract version control",
      "AI legal review connected to real LLM API",
    ],
    requiredAPIs: ["DocuSign API / HelloSign API", "OpenAI API (contract review)", "AWS S3 / Cloudflare R2 (storage)"],
    requiredData: ["contracts", "contract_templates", "signatures", "signed_documents"],
  },
  {
    name: "AI Tools",
    icon: Brain,
    status: "mock",
    score: 10,
    currentState: "All AI features (photo estimator, insurance claims assistant, scope generator, voice recorder) are simulated with static responses and timeouts.",
    missing: [
      "OpenAI / Anthropic API key & backend proxy",
      "Real computer vision API for roof photo analysis",
      "Speech-to-text for voice recorder (Whisper API)",
      "Vector DB for semantic search (Pinecone / pgvector)",
      "Rate limiting and cost management layer",
    ],
    requiredAPIs: [
      "OpenAI API (GPT-4o / GPT-4 Vision)",
      "Anthropic Claude API (optional)",
      "OpenAI Whisper (speech-to-text)",
      "EagleView / Nearmap (aerial roof measurements)",
    ],
    requiredData: ["ai_sessions", "ai_analysis_results", "voice_transcripts"],
  },
  {
    name: "Inspections & Drone",
    icon: Camera,
    status: "mock",
    score: 20,
    currentState: "Inspection list and detail pages exist with photo upload simulation. No real drone API or image processing.",
    missing: [
      "Drone telemetry integration (DJI SDK or SkyWatch API)",
      "Image upload pipeline with cloud storage",
      "AI damage detection model (real CV inference)",
      "Inspection report PDF generation",
      "GPS coordinates stored per photo",
    ],
    requiredAPIs: ["DJI Cloud API / SkyWatch", "AWS Rekognition / Google Vision (damage detection)", "Google Maps / Mapbox"],
    requiredData: ["inspections", "inspection_photos", "drone_flights", "damage_assessments"],
  },
  {
    name: "Storm Intelligence",
    icon: Zap,
    status: "mock",
    score: 15,
    currentState: "Storm dashboard and history pages exist with static storm event data.",
    missing: [
      "Real weather data API (NOAA, IBM Weather)",
      "Hail & wind damage scoring by address",
      "Automated lead generation from storm events",
      "Push alerts to sales team",
      "Historical storm event database",
    ],
    requiredAPIs: ["NOAA API / IBM Weather Company", "HailTrace / Verisk Storm Reports", "Google Maps Geocoding"],
    requiredData: ["storm_events", "storm_affected_addresses", "storm_leads"],
  },
  {
    name: "Client Portal",
    icon: Globe,
    status: "partial",
    score: 35,
    currentState: "Full client-facing portal UI with project overview, photos, documents, invoices, and schedule exists. Uses hard-coded token auth simulation.",
    missing: [
      "Real token-based portal authentication (unique per project)",
      "Photo upload from homeowner side",
      "Real-time progress updates from admin",
      "Invoice payment via Stripe embedded",
      "Document e-sign from portal",
    ],
    requiredAPIs: ["Stripe Embedded Payment (client portal)", "SendGrid (portal invite email)", "Twilio (portal SMS link)"],
    requiredData: ["portal_tokens", "portal_access_logs", "portal_messages"],
  },
  {
    name: "Subcontractor Portal",
    icon: Truck,
    status: "partial",
    score: 30,
    currentState: "Sub portal UI with login, dashboard, job assignments, timesheets, and payments is built out but uses mocked credentials and data.",
    missing: [
      "Real sub auth (separate credentials from admin users)",
      "Timesheet approval workflow with admin sign-off",
      "ACH / check payment integration",
      "W-9 / lien waiver digital upload",
      "Sub rating after job completion",
    ],
    requiredAPIs: ["Stripe Connect / Gusto (sub payments)", "DocuSign (lien waivers)", "Twilio (job notifications)"],
    requiredData: ["subcontractors", "timesheets", "sub_payments", "lien_waivers"],
  },
  {
    name: "Compliance & Safety",
    icon: Shield,
    status: "mock",
    score: 20,
    currentState: "Compliance dashboard, safety checklists, incident reports, and employee ratings pages exist with mock data.",
    missing: [
      "Real compliance document storage and expiry tracking",
      "OSHA incident report submission workflow",
      "Insurance certificate verification (COI)",
      "Drug test scheduling integration",
      "Automated expiry notifications",
    ],
    requiredAPIs: ["OSHA API (incident reporting)", "Sendgrid (expiry alerts)", "Docusign (compliance docs)"],
    requiredData: ["compliance_docs", "safety_incidents", "safety_checklists", "employee_certs"],
  },
  {
    name: "Registration & Hiring",
    icon: ClipboardCheck,
    status: "partial",
    score: 40,
    currentState: "Subcontractor registration form with document upload simulation, admin review, and hiring dashboard are well-developed. Document status tracking is in place.",
    missing: [
      "Real file upload pipeline to cloud storage",
      "Background check API integration",
      "DocuSign onboarding packets",
      "Automated status email notifications",
      "Integration with payroll / HR system",
    ],
    requiredAPIs: ["Checkr / Sterling (background checks)", "AWS S3 (document storage)", "SendGrid (status emails)"],
    requiredData: ["registrants", "registrant_documents", "background_checks", "onboarding_packets"],
  },
  {
    name: "Backup & Data Export",
    icon: HardDrive,
    status: "mock",
    score: 5,
    currentState: "Backup page UI exists but has no real backup mechanism. Data is not persisted anywhere.",
    missing: [
      "Scheduled DB backups (pg_dump / Supabase point-in-time)",
      "CSV/Excel export from all data tables",
      "Audit log retention",
      "GDPR / data deletion workflow",
    ],
    requiredAPIs: ["AWS S3 / GCS (backup storage)", "Supabase PITR or RDS automated snapshots"],
    requiredData: ["backup_manifests", "audit_logs", "data_export_jobs"],
  },
];

const apiRequirements: ApiRequirement[] = [
  { name: "Authentication Provider", category: "Infrastructure", priority: "critical", purpose: "User login, JWT tokens, role management, SSO", provider: "Auth0 / Supabase Auth / Clerk", estimatedCost: "$0–$240/mo" },
  { name: "PostgreSQL Database", category: "Infrastructure", priority: "critical", purpose: "Persistent storage for all platform entities", provider: "Supabase / PlanetScale / AWS RDS", estimatedCost: "$25–$200/mo" },
  { name: "File / Blob Storage", category: "Infrastructure", priority: "critical", purpose: "Photos, PDFs, contracts, inspection images", provider: "AWS S3 / Cloudflare R2", estimatedCost: "$5–$50/mo" },
  { name: "Xactimate API", category: "Insurance", priority: "critical", purpose: "Estimate import/export, real pricing data sync", provider: "Verisk / Xactware", estimatedCost: "Enterprise contract" },
  { name: "QuickBooks Online API", category: "Accounting", priority: "critical", purpose: "Invoice sync, customer sync, 1099, mileage", provider: "Intuit Developer Platform", estimatedCost: "Free (QB subscription required)" },
  { name: "Stripe Payments", category: "Payments", priority: "critical", purpose: "Invoice payments, sub contractor payouts (Stripe Connect)", provider: "Stripe", estimatedCost: "2.9% + $0.30 per txn" },
  { name: "OpenAI API", category: "AI", priority: "high", purpose: "AI estimator, scope writer, legal review, chatbot", provider: "OpenAI (GPT-4o / Vision)", estimatedCost: "$50–$500/mo" },
  { name: "DocuSign / HelloSign", category: "Documents", priority: "high", purpose: "E-signatures for contracts, lien waivers, onboarding", provider: "DocuSign / Dropbox Sign", estimatedCost: "$25–$150/mo" },
  { name: "SendGrid / Postmark", category: "Notifications", priority: "high", purpose: "Transactional emails: invoices, portal invites, alerts", provider: "SendGrid / Postmark", estimatedCost: "$0–$90/mo" },
  { name: "Twilio", category: "Notifications", priority: "high", purpose: "SMS alerts, crew notifications, portal links", provider: "Twilio", estimatedCost: "$0.0079/SMS" },
  { name: "Google Maps / Mapbox", category: "Mapping", priority: "high", purpose: "Address autocomplete, crew routing, storm mapping", provider: "Google Cloud / Mapbox", estimatedCost: "$5–$100/mo" },
  { name: "OpenAI Whisper", category: "AI", priority: "medium", purpose: "Voice-to-text for voice recorder AI tool", provider: "OpenAI Whisper API", estimatedCost: "$0.006/min" },
  { name: "EagleView / Nearmap", category: "Aerial Imagery", priority: "medium", purpose: "Aerial roof measurements, damage assessment", provider: "EagleView / Nearmap", estimatedCost: "$15–$40/report" },
  { name: "NOAA / IBM Weather", category: "Weather", priority: "medium", purpose: "Storm event data, hail reports, weather alerts", provider: "NOAA API / IBM Weather Company", estimatedCost: "$0–$500/mo" },
  { name: "Checkr / Sterling", category: "HR / Compliance", priority: "medium", purpose: "Background checks for new hires and subcontractors", provider: "Checkr / Sterling", estimatedCost: "$25–$75/check" },
  { name: "Firebase Cloud Messaging", category: "Notifications", priority: "medium", purpose: "Push notifications to crew mobile PWA / app", provider: "Google Firebase", estimatedCost: "Free tier" },
  { name: "HailTrace / Verisk Storm", category: "Insurance", priority: "medium", purpose: "Hail size, wind speed, storm history by address", provider: "HailTrace / Verisk", estimatedCost: "$0.05–$0.50/lookup" },
  { name: "Plaid", category: "Banking", priority: "low", purpose: "Bank feed for expense matching and reconciliation", provider: "Plaid", estimatedCost: "$500/mo minimum" },
  { name: "DJI Cloud API", category: "Drone", priority: "low", purpose: "Drone flight management, telemetry, media sync", provider: "DJI Developer", estimatedCost: "Free SDK" },
];

const orgRequirements: OrgRequirement[] = [
  {
    title: "Multi-Tenant Architecture",
    description: "Every database record must carry an organisation_id foreign key. All queries must be scoped to the caller's organisation. A single super-admin can create and manage organisations (for SaaS deployment).",
    priority: "critical",
    effort: "2–4 weeks backend",
  },
  {
    title: "Role-Based Access Control (RBAC)",
    description: "Minimum roles needed: Super Admin, Company Admin, Project Manager, Field Technician, Sub Contractor, Client (read-only portal). Each role maps to a permission set enforced on both the API and the UI.",
    priority: "critical",
    effort: "1–2 weeks",
  },
  {
    title: "User Invitation & Onboarding",
    description: "Company Admin can invite team members by email. Invited users receive a magic-link to set their password and are automatically scoped to that organisation.",
    priority: "critical",
    effort: "1 week",
  },
  {
    title: "Organisation Settings",
    description: "Each organisation needs: company name, logo, license numbers, insurance cert, service area (zip codes), default trade rates, QuickBooks connection, and Xactimate credentials.",
    priority: "high",
    effort: "1 week",
  },
  {
    title: "Audit Log",
    description: "All create/update/delete actions must be logged with: user_id, organisation_id, entity type, before/after state, IP address, and timestamp. Required for compliance and dispute resolution.",
    priority: "high",
    effort: "1 week backend",
  },
  {
    title: "Data Isolation & Security",
    description: "Row-Level Security (RLS) must be enforced at the database level (Supabase RLS or Postgres policies). API must validate JWT on every request and verify organisation membership.",
    priority: "critical",
    effort: "1 week",
  },
  {
    title: "Mobile-Responsive / PWA",
    description: "Field techs access the platform from phones on job sites. The app should work offline for basic inspection checklists and sync when reconnected. Consider adding a mobile manifest.",
    priority: "high",
    effort: "1–2 weeks",
  },
  {
    title: "Billing & Subscription (SaaS)",
    description: "If the platform will be offered to multiple construction companies: Stripe Billing with per-seat or per-project pricing, trial periods, upgrade/downgrade flows, and invoice history.",
    priority: "medium",
    effort: "2–3 weeks",
  },
  {
    title: "White-Label / Branding",
    description: "Each organisation uploads their own logo, sets brand colours, and uses a custom domain (e.g., portal.theircompany.com). Required for reselling the platform.",
    priority: "low",
    effort: "1–2 weeks",
  },
];

/* ─────────────────────────────────────────────────────── */
/*  Helper components                                      */
/* ─────────────────────────────────────────────────────── */

function statusColor(s: ReadinessLevel) {
  return s === "ready" ? "#10b981" : s === "partial" ? "#f59e0b" : s === "mock" ? "#3b82f6" : "#ef4444";
}

function statusLabel(s: ReadinessLevel) {
  return s === "ready" ? "Ready" : s === "partial" ? "Partial" : s === "mock" ? "Mock Data" : "Missing";
}

function priorityColor(p: Priority) {
  return p === "critical" ? "#ef4444" : p === "high" ? "#f97316" : p === "medium" ? "#f59e0b" : "#6b7280";
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}%</span>
    </div>
  );
}

function ModuleCard({ mod }: { mod: ModuleAudit }) {
  const [open, setOpen] = useState(false);
  const Icon = mod.icon;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
      >
        <div className="p-1.5 rounded-lg bg-gray-100">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">{mod.name}</span>
            <Badge color={statusColor(mod.status)}>{statusLabel(mod.status)}</Badge>
          </div>
          <ScoreBar score={mod.score} />
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-600">{mod.currentState}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs font-semibold text-red-600 mb-1.5 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Missing / Blocked
              </div>
              <ul className="space-y-1">
                {mod.missing.map((m, i) => (
                  <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span>{m}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 mb-1.5 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> Required APIs
              </div>
              <ul className="space-y-1">
                {mod.requiredAPIs.map((a, i) => (
                  <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span>{a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-600 mb-1.5 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Required Data / Tables
              </div>
              <ul className="space-y-1">
                {mod.requiredData.map((d, i) => (
                  <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                    <span className="text-purple-400 mt-0.5">•</span>{d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Main page                                              */
/* ─────────────────────────────────────────────────────── */

export default function ProductionAuditPage() {
  const overallScore = Math.round(modules.reduce((a, m) => a + m.score, 0) / modules.length);
  const criticalAPIs = apiRequirements.filter((a) => a.priority === "critical");
  const highAPIs = apiRequirements.filter((a) => a.priority === "high");
  const otherAPIs = apiRequirements.filter((a) => a.priority !== "critical" && a.priority !== "high");

  const readyCounts = {
    missing: modules.filter((m) => m.status === "missing").length,
    mock: modules.filter((m) => m.status === "mock").length,
    partial: modules.filter((m) => m.status === "partial").length,
    ready: modules.filter((m) => m.status === "ready").length,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-500" /> Production Readiness Audit
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Full end-to-end assessment of the SmartConstruction platform — what works today, what is mocked, and
          exactly what is needed to go live as a multi-user organisation.
        </p>
      </div>

      {/* ── Overall score banner ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-500 mb-1">Overall Production Readiness</div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-red-500">{overallScore}%</span>
              <span className="text-sm text-gray-500 mb-1.5">— NOT production-ready</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${overallScore}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {(["missing", "mock", "partial", "ready"] as const).map((s) => (
              <div key={s} className="rounded-lg px-3 py-2" style={{ background: statusColor(s) + "15" }}>
                <div className="text-2xl font-black" style={{ color: statusColor(s) }}>{readyCounts[s]}</div>
                <div className="text-xs font-medium text-gray-600">{statusLabel(s)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Verdict box ── */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-900 mb-1">Verdict: UI Prototype — Not Production-Ready</h3>
            <p className="text-xs text-red-700 leading-relaxed">
              This platform is a high-fidelity UI prototype. The front-end is feature-rich and well-structured
              (React 19, TypeScript, Zustand, Tailwind). However, <strong>there is no backend, no database,
              no real authentication, and no API connections</strong>. Every data point shown in the app is
              hard-coded mock data that resets on refresh. Before this can serve a single real customer, a
              complete backend stack must be built and all third-party integrations must be wired in.
            </p>
          </div>
        </div>
      </div>

      {/* ── Module-by-module audit ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-500" /> Module-by-Module Audit
          <span className="text-xs font-normal text-gray-500 ml-1">(click a module to expand)</span>
        </h2>
        <div className="space-y-2">
          {modules.map((mod) => (
            <ModuleCard key={mod.name} mod={mod} />
          ))}
        </div>
      </div>

      {/* ── Required APIs ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-blue-500" /> Required API Integrations
        </h2>

        {/* Critical */}
        <div className="mb-4">
          <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Critical — Platform cannot launch without these
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {criticalAPIs.map((api) => (
              <div key={api.name} className="bg-white rounded-lg border border-red-200 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{api.name}</span>
                  <Badge color={priorityColor(api.priority)}>{api.priority}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">{api.purpose}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Provider: <span className="text-gray-700 font-medium">{api.provider}</span></span>
                  <span className="text-gray-400">Cost: <span className="text-gray-700 font-medium">{api.estimatedCost}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High */}
        <div className="mb-4">
          <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> High Priority — Required for core workflows
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {highAPIs.map((api) => (
              <div key={api.name} className="bg-white rounded-lg border border-orange-200 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{api.name}</span>
                  <Badge color={priorityColor(api.priority)}>{api.priority}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">{api.purpose}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Provider: <span className="text-gray-700 font-medium">{api.provider}</span></span>
                  <span className="text-gray-400">Cost: <span className="text-gray-700 font-medium">{api.estimatedCost}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medium / Low */}
        <div>
          <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Medium / Low — Required for full feature set
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {otherAPIs.map((api) => (
              <div key={api.name} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{api.name}</span>
                  <Badge color={priorityColor(api.priority)}>{api.priority}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">{api.purpose}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Provider: <span className="text-gray-700 font-medium">{api.provider}</span></span>
                  <span className="text-gray-400">Cost: <span className="text-gray-700 font-medium">{api.estimatedCost}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Multi-user org requirements ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" /> Multi-User Organisation Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {orgRequirements.map((req) => (
            <div key={req.title} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-bold text-gray-900">{req.title}</span>
                <Badge color={priorityColor(req.priority)}>{req.priority}</Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">{req.description}</p>
              <div className="text-xs text-gray-500">
                Estimated effort: <span className="font-semibold text-gray-700">{req.effort}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommended tech stack ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-500" /> Recommended Production Tech Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { layer: "Frontend (keep)", stack: "React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand", icon: Globe, note: "Already built. Needs routing guards and API service layer." },
            { layer: "Backend API", stack: "Node.js + Fastify (or Next.js API routes) + Zod validation", icon: Server, note: "REST endpoints for all entities. JWT auth middleware." },
            { layer: "Database", stack: "PostgreSQL via Supabase (includes auth, storage, RLS, realtime)", icon: Database, note: "Supabase gives auth + DB + storage + realtime in one hosted service." },
            { layer: "Authentication", stack: "Supabase Auth (or Clerk) — JWT, magic links, OAuth, SSO", icon: Lock, note: "Plug-and-play with Row Level Security for multi-tenant isolation." },
            { layer: "File Storage", stack: "Supabase Storage or AWS S3 / Cloudflare R2", icon: HardDrive, note: "For photos, PDFs, contracts, inspection images." },
            { layer: "Email", stack: "Resend or SendGrid — transactional email service", icon: RefreshCw, note: "For invoices, portal invites, alerts, onboarding emails." },
            { layer: "SMS / Push", stack: "Twilio (SMS) + Firebase Cloud Messaging (push)", icon: Wifi, note: "Crew notifications, client reminders, storm alerts." },
            { layer: "Payments", stack: "Stripe (invoices, Connect for subs, billing for SaaS)", icon: DollarSign, note: "One platform handles client payments and sub payouts." },
            { layer: "AI / LLM", stack: "OpenAI API (GPT-4o + Vision + Whisper) via backend proxy", icon: Brain, note: "Never expose API keys to the browser — route through your backend." },
            { layer: "Deployment", stack: "Vercel (frontend) + Railway / Render (backend) + Supabase (DB)", icon: Cloud, note: "Fast to deploy, scales automatically, ~$50–150/mo to start." },
            { layer: "Monitoring", stack: "Sentry (errors) + PostHog (analytics) + Uptime Robot", icon: BarChart3, note: "Essential for production visibility and debugging." },
            { layer: "CI/CD", stack: "GitHub Actions — build, test, lint, deploy on merge to main", icon: TrendingUp, note: "Automate deployments and catch regressions early." },
          ].map(({ layer, stack, icon: Icon, note }) => (
            <div key={layer} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{layer}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{stack}</div>
              <div className="text-xs text-gray-500">{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Priority roadmap ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> Priority Roadmap to Production (MVP)
        </h2>
        <div className="space-y-2">
          {[
            {
              phase: "Phase 1 — Foundation (Weeks 1–4)",
              color: "#ef4444",
              items: [
                "Set up Supabase project (DB + Auth + Storage)",
                "Build backend API (Fastify or Next.js API routes)",
                "Implement multi-tenant auth: login, register, JWT, RBAC",
                "Create DB schema with organisation_id on all tables",
                "Replace all Zustand mock data with real API calls",
                "Wire environment variables for all secrets (never hardcoded)",
              ],
            },
            {
              phase: "Phase 2 — Core Business Logic (Weeks 5–8)",
              color: "#f97316",
              items: [
                "Xactimate API integration (real pricing, estimate sync)",
                "QuickBooks Online OAuth + invoice/customer/payment sync",
                "Stripe Payments for client invoice payments",
                "Real file upload: photos, PDFs, contracts → S3/Supabase Storage",
                "DocuSign integration for contracts and lien waivers",
                "Transactional emails via Resend/SendGrid",
              ],
            },
            {
              phase: "Phase 3 — Portals & Communication (Weeks 9–11)",
              color: "#f59e0b",
              items: [
                "Client portal: real token auth, live project data, Stripe payment",
                "Subcontractor portal: real auth, timesheet approval, ACH payouts",
                "Twilio SMS for crew/client notifications",
                "Registration: real file uploads + background check API (Checkr)",
                "AI Tools: wire OpenAI API through backend proxy",
              ],
            },
            {
              phase: "Phase 4 — Advanced Features (Weeks 12–16)",
              color: "#10b981",
              items: [
                "Storm intel: NOAA/HailTrace real data + auto lead generation",
                "Drone inspection: DJI SDK or SkyWatch integration",
                "EagleView/Nearmap aerial measurements",
                "Compliance doc tracking with expiry alerts",
                "Audit log, data export (CSV/PDF), and backup automation",
                "Performance optimisation, CI/CD pipeline, error monitoring (Sentry)",
              ],
            },
          ].map(({ phase, color, items }) => (
            <div key={phase} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-sm font-bold text-gray-900">{phase}</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cost estimate ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-2">Estimated Monthly Infrastructure Cost (at launch)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                ["Supabase (Pro)", "$25/mo"],
                ["Vercel (Pro)", "$20/mo"],
                ["Railway / Render (backend)", "$25/mo"],
                ["SendGrid / Resend", "$20/mo"],
                ["Twilio (SMS)", "~$10–50/mo"],
                ["Stripe", "2.9% + $0.30/txn"],
                ["OpenAI API", "~$50–200/mo"],
                ["Total infra baseline", "~$150–350/mo"],
              ].map(([label, cost]) => (
                <div key={label} className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                  <div className="text-gray-500">{label}</div>
                  <div className="font-bold text-blue-800">{cost}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              <strong>Note:</strong> Xactimate API and EagleView/Nearmap require enterprise contracts — contact
              Verisk directly for pricing. QuickBooks Online subscription is required for QB integration.
            </p>
          </div>
        </div>
      </div>

      {/* ── Security checklist ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-500" /> Security Checklist Before Go-Live
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[
            ["Never expose API keys in the browser or client-side code — proxy all external API calls through your backend", "critical"],
            ["Enforce HTTPS everywhere (TLS 1.2+) — use Cloudflare or your hosting provider's SSL", "critical"],
            ["Enable Row-Level Security (RLS) in Supabase on every table", "critical"],
            ["Validate all user input server-side with Zod or similar schema validation", "critical"],
            ["Implement rate limiting on auth endpoints to prevent brute-force attacks", "critical"],
            ["Store passwords with bcrypt/argon2 — never plain text (Supabase Auth handles this automatically)", "critical"],
            ["Add Content Security Policy (CSP) headers to prevent XSS", "high"],
            ["Enable 2FA for admin and finance roles", "high"],
            ["Perform dependency audit: npm audit — resolve any high/critical CVEs", "high"],
            ["Set up Sentry or similar for real-time error and exception monitoring", "high"],
            ["Create a data backup and disaster recovery plan before handling customer data", "high"],
            ["Review and comply with applicable data regulations (GDPR, CCPA, SOC 2 if targeting enterprise)", "medium"],
          ].map(([item, priority]) => (
            <div key={item as string} className="px-4 py-2.5 flex items-start gap-3">
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: priorityColor(priority as Priority) }} />
              <span className="text-xs text-gray-700 flex-1">{item as string}</span>
              <Badge color={priorityColor(priority as Priority)}>{priority as string}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Bottom line:</strong> The SmartConstruction front-end is a well-designed, comprehensive construction
          management UI that covers all the right workflows for a modern roofing/remodeling CRM. The UI quality and
          feature breadth are genuinely impressive. With the backend, database, authentication, and key API
          integrations listed above, this platform can become a competitive production SaaS product. Estimated
          time to production MVP: <strong>12–16 weeks</strong> with a small dedicated team (2–3 developers).
        </p>
      </div>
    </div>
  );
}
