import { AgencyProfile, StoredSignature } from '../types/agency';
import { 
  DiscoveryCallData, 
  ProposalData, 
  QuotationData,
  RateChartData,
  OnboardingData, 
  NdaData, 
  InvoiceData, 
  ReceiptData, 
  OffboardingData 
} from '../types/documents';

export const defaultSubhadipSignature: StoredSignature = {
  id: 'sig-subhadip-jana',
  name: 'Subhadip Jana',
  title: 'Senior Managing Partner',
  email: 'subhadipjana866@gmail.com',
  partnerId: 'usr-subhadip',
  signatureImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M20,50 C32,22 45,12 52,28 C58,40 64,54 70,52 C78,48 84,32 92,30 C100,28 104,44 112,42 C122,38 132,22 144,36 C152,45 160,55 170,48 C180,42 188,28 198,30 C210,32 216,48 230,42 C242,36 252,20 264,38 C272,50 284,54 300,32' fill='none' stroke='%230f172a' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/><path d='M28,62 C85,57 175,52 285,48' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>",
  signatureText: 'Subhadip Jana',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const defaultShayanSignature: StoredSignature = {
  id: 'sig-shayan-das',
  name: 'Shayan Das',
  title: 'Senior Managing Partner',
  email: 'shayandas267@gmail.com',
  partnerId: 'usr-shayan',
  signatureImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M22,38 C34,18 46,14 50,30 C54,46 58,58 68,52 C78,44 82,24 94,22 C106,20 110,48 118,50 C128,52 138,34 148,30 C158,26 168,44 178,46 C190,48 198,28 212,26 C226,24 236,46 250,44 C264,42 278,22 292,36 C298,42 304,46 308,44' fill='none' stroke='%230f172a' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/><path d='M40,66 C105,58 195,54 290,52' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>",
  signatureText: 'Shayan Das',
  isDefault: false,
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const defaultSignatureStore: StoredSignature[] = [
  defaultSubhadipSignature,
  defaultShayanSignature
];

export const defaultAgencyProfile: AgencyProfile = {
  name: 'Aura Studio & Labs',
  tagline: 'High-Impact Design Engineering & Digital Products',
  email: 'hello@aurastudio.agency',
  phone: '+1 (555) 234-8901',
  website: 'https://aurastudio.agency',
  address: '440 Montgomery Street, Suite 900',
  cityStateZip: 'San Francisco, CA 94104',
  country: 'United States',
  taxId: 'US-EIN-94-8271034',
  defaultCurrency: 'USD',
  currencySymbol: '$',
  bankDetails: {
    bankName: 'Silicon Valley Commercial Bank',
    accountHolder: 'Aura Studio & Labs LLC',
    accountNumber: '**** **** 4892',
    routingOrSwift: 'SVCBUS33',
    iban: 'US89SVCB00000048923019',
    notes: 'Wire transfer or ACH preferred. Please include invoice number in payment memo.'
  },
  primarySigner: {
    name: 'Subhadip Jana',
    title: 'Senior Managing Partner',
    email: 'subhadipjana866@gmail.com',
    signatureText: 'Subhadip Jana',
    signatureImage: defaultSubhadipSignature.signatureImage
  },
  signatureStore: defaultSignatureStore
};

export const sampleDiscoveryCall: DiscoveryCallData = {
  clientName: 'Sophia Lin',
  clientCompany: 'AeroSync Technologies',
  clientEmail: 'sophia.lin@aerosync.io',
  clientRole: 'VP of Product',
  callDate: new Date().toISOString().split('T')[0],
  attendees: 'Sophia Lin (VP Product), David Miller (CTO), Julian Vance (Aura Studio)',
  projectTitle: 'Enterprise Fleet Monitoring Web Platform & Design System',
  businessOverview: 'AeroSync is scaling an autonomous IoT sensor fleet. Their current legacy portal struggles with real-time telemetry rendering and poor UX for enterprise aviation clients.',
  primaryGoals: [
    'Revamp customer-facing telemetry portal with sub-second live updates',
    'Design an accessible, enterprise-grade dark/light design system',
    'Shorten customer onboarding time from 3 weeks to under 48 hours'
  ],
  painPoints: [
    'Legacy Angular application is slow and difficult to maintain',
    'Users complain about cluttered dashboards with confusing data hierarchy',
    'Lack of mobile responsiveness prevents field engineers from viewing data on-site'
  ],
  targetAudience: 'Fleet operations directors, aeronautical maintenance engineers, and VP-level asset managers.',
  desiredFeatures: [
    'Real-time WebSocket telemetry charts and anomaly alerts',
    'Multi-tenant role-based access control (RBAC)',
    'Comprehensive audit log and PDF export reports',
    'Mobile-optimized responsive tablet dashboard'
  ],
  techStackPreference: 'React / Next.js, Tailwind CSS, TypeScript, GraphQL or REST API',
  budgetRange: '$35,000 – $50,000 USD',
  targetLaunchDate: 'Q4 2026 (Target Beta: 10 weeks)',
  competitorsOrReferences: 'Samsara, Linear, Palantir Foundry UX',
  immediateNextSteps: [
    { action: 'Deliver comprehensive scope proposal & milestone roadmap', owner: 'Aura Studio (Julian)', dueDate: 'Within 48 hours' },
    { action: 'Provide API documentation & sample telemetry payload', owner: 'AeroSync (David)', dueDate: 'By Friday' },
    { action: 'Schedule proposal alignment and kickoff call', owner: 'Joint', dueDate: 'Next Monday' }
  ],
  additionalNotes: 'High strategic priority for AeroSync’s Series B presentation in November.'
};

export const sampleProposal: ProposalData = {
  clientName: 'Sophia Lin',
  clientCompany: 'AeroSync Technologies',
  clientEmail: 'sophia.lin@aerosync.io',
  clientAddress: '500 Howard Street, Suite 400, San Francisco, CA 94105',
  proposalNumber: 'PROP-2026-042',
  issueDate: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
  projectTitle: 'Enterprise Telemetry Portal & Design System Overhaul',
  executiveSummary: 'Aura Studio proposes an 8-week end-to-end design and frontend engineering partnership to modernize AeroSync’s telemetry portal. We will establish a rock-solid design system, rebuild the core dashboard architecture in Next.js/React, and elevate the user experience to world-class standards.',
  problemStatement: 'AeroSync’s current platform lacks the speed, visual hierarchy, and modularity required to satisfy demanding enterprise fleet operators, directly impacting renewal rates and sales demos.',
  proposedSolution: 'A phased transformation comprising rapid UX discovery, modular design system tokens in Figma, reactive telemetry dashboard engineering, and frictionless client handoff with automated testing.',
  milestones: [
    {
      title: 'Phase 1: Discovery, UX Audit & Design System Tokens',
      duration: 'Weeks 1 – 2',
      deliverables: [
        'User journey maps and revised information architecture',
        'Component design library in Figma (Dark & Light mode)',
        'Clickable prototype for customer validation'
      ],
      price: 9500
    },
    {
      title: 'Phase 2: Core Platform Architecture & Live Telemetry UI',
      duration: 'Weeks 3 – 5',
      deliverables: [
        'Next.js 15 & Tailwind CSS application shell',
        'High-frequency WebSocket data stream components & charts',
        'Role-based permissions & fleet asset inventory views'
      ],
      price: 15500
    },
    {
      title: 'Phase 3: Testing, Enterprise Hardening & Launch',
      duration: 'Weeks 6 – 8',
      deliverables: [
        'Cross-browser and tablet responsive QA testing',
        'End-to-end Playwright tests and Lighthouse performance audit > 95',
        'Production deployment, team training & documentation'
      ],
      price: 11000
    }
  ],
  pricingModel: 'milestone',
  fixedTotal: 36000,
  paymentSchedule: '30% upon project kickoff, 40% upon completion of Phase 2, and 30% upon final acceptance sign-off.',
  agencyAdvantages: [
    'Deep domain expertise in data-dense B2B SaaS and real-time visualization',
    'Direct senior engineer & designer access with no middle-management overhead',
    'Speed to market with pre-built audited component primitives',
    '30-day post-launch warranty with dedicated Slack channel support'
  ],
  termsAndConditions: 'All intellectual property rights developed during the engagement transfer unconditionally to AeroSync upon receipt of final milestone payment. Scope adjustments will be documented via mutual change orders.',
  clientSignerName: 'Sophia Lin',
  clientSignerTitle: 'VP of Product'
};

export const sampleQuotation: QuotationData = {
  quotationNumber: 'QT-2026-0034',
  issueDate: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
  currency: 'USD',
  currencySymbol: '$',
  clientName: 'Sophia Lin',
  clientCompany: 'AeroSync Technologies Inc.',
  clientEmail: 'sophia.lin@aerosync.io',
  clientPhone: '+1 (415) 890-2134',
  clientAddress: '500 Howard Street, Suite 400\nSan Francisco, CA 94105',
  projectTitle: 'Enterprise Telemetry Dashboard & Data Visualizer Suite',
  projectScopeOverview: 'Full-cycle engineering quotation for architecting, designing, and delivering high-density interactive telemetry interfaces, WebSocket alerting mechanisms, and accessible UI component system.',
  lineItems: [
    {
      id: 'item-1',
      title: 'UX Research, Information Architecture & Design Tokens',
      description: 'Discovery synthesis, high-fidelity Figma components, dark/light theme tokens, and responsive layout specifications.',
      quantity: 1,
      unit: 'Sprint',
      unitPrice: 8500,
      taxable: false
    },
    {
      id: 'item-2',
      title: 'Frontend Telemetry Architecture & WebSocket Visualizer Engine',
      description: 'Next.js 15 app router, sub-second canvas/SVG charts, streaming metric feeds, and role-based client portal.',
      quantity: 1,
      unit: 'Milestone',
      unitPrice: 14500,
      taxable: false
    },
    {
      id: 'item-3',
      title: 'Multi-Tenant RBAC & Security Hardening Audit',
      description: 'Granular permissions, token refresh middleware, OWASP audit, and automated Playwright test suites.',
      quantity: 1,
      unit: 'Package',
      unitPrice: 5500,
      taxable: false
    }
  ],
  addonOptions: [
    {
      id: 'addon-1',
      title: 'Priority 24/7 Production SLA & Incident Standby',
      description: 'Guaranteed 1-hour critical response SLA with dedicated on-call engineer for 90 days post-launch.',
      price: 2800,
      selected: true
    },
    {
      id: 'addon-2',
      title: 'Synthetic Real-User Monitoring & APM Setup (Datadog/Sentry)',
      description: 'Full telemetry tracing, frontend session replay, and anomaly alert notification webhooks.',
      price: 1950,
      selected: false
    }
  ],
  discountPercent: 5,
  taxPercent: 0,
  paymentTerms: '50% upfront deposit to initiate sprint scheduling; remaining 50% upon final acceptance sign-off and deployment.',
  timelineEstimate: '6 to 8 calendar weeks from receipt of initial deposit and access to test telemetry streams.',
  termsAndAssumptions: [
    'Quotation is strictly valid for 30 calendar days from date of issuance.',
    'Estimates reflect the defined scope; any additional feature requests or structural pivot will be quoted as separate work orders.',
    'Client will supply API documentation, sample datasets, and staging access within 3 business days of project kickoff.',
    'Includes 30 calendar days of post-handover bug warranty covering all delivered source code.'
  ],
  clientSignerName: 'Sophia Lin',
  clientSignerTitle: 'VP of Product',
  acceptanceNotes: 'Quotation approved and scheduled for Q4 sprint kickoff.'
};

export const sampleOnboarding: OnboardingData = {
  clientName: 'Sophia Lin',
  clientCompany: 'AeroSync Technologies',
  clientEmail: 'sophia.lin@aerosync.io',
  projectTitle: 'Enterprise Telemetry Portal Overhaul',
  startDate: new Date().toISOString().split('T')[0],
  targetCompletionDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
  welcomeMessage: 'Welcome to Aura Studio! We are thrilled to partner with AeroSync to design and build your next-generation telemetry platform. This document outlines everything you need to know about our collaboration, communication channels, working cadence, and immediate kickoff steps.',
  primaryCommunicationChannel: 'Dedicated Shared Slack Channel (#aerosync-aura-ops) and Weekly Video Syncs',
  meetingCadence: 'Weekly 30-min Sprint Review every Tuesday at 10:00 AM PST. Daily async standup notes in Slack.',
  workingHours: 'Monday – Friday, 9:00 AM – 6:00 PM PST. Emergency SLA: 2-hour response for staging-critical blockers.',
  teamMembers: [
    { name: 'Julian Vance', role: 'Lead Director & Account Partner', email: 'julian@aurastudio.agency', slackHandle: '@julian' },
    { name: 'Elena Rostova', role: 'Lead Product Designer', email: 'elena@aurastudio.agency', slackHandle: '@elena.design' },
    { name: 'Marcus Chen', role: 'Staff Frontend Architect', email: 'marcus@aurastudio.agency', slackHandle: '@marcus.dev' }
  ],
  accessChecklist: [
    { task: 'GitHub Organization invite to Aura Studio engineering team', category: 'Credentials', provided: true, notes: 'Write access granted to repo' },
    { task: 'Figma Team invite for collaboration & review', category: 'Credentials', provided: true, notes: 'Editor license provisioned' },
    { task: 'Sample staging API credentials & WebSocket endpoint documentation', category: 'Credentials', provided: false, notes: 'Pending David Miller' },
    { task: 'Brand vectors, high-res SVG logos, and font licensing', category: 'Assets', provided: true, notes: 'Uploaded to shared Google Drive' },
    { task: 'Schedule 60-minute technical architecture kickoff workshop', category: 'Meeting', provided: true, notes: 'Confirmed for Thursday 2 PM' }
  ],
  projectManagementTool: 'Linear for issue tracking, Notion for centralized documentation and asset repository.',
  deliverableReviewProcess: 'Milestone deliverables will be demonstrated during weekly syncs with preview URLs deployed via Vercel staging environments. Client feedback is requested within 3 business days to maintain schedule velocity.',
  firstWeekMilestones: [
    'Kickoff workshop & API architecture verification',
    'Figma design system foundation & dark/light palette sign-off',
    'Vercel staging pipeline configured with CI/CD checks'
  ]
};

export const sampleNda: NdaData = {
  agreementDate: new Date().toISOString().split('T')[0],
  agreementType: 'mutual',
  disclosingPartyName: 'AeroSync Technologies Inc.',
  disclosingPartyAddress: '500 Howard Street, Suite 400, San Francisco, CA 94105',
  disclosingPartyRepresentative: 'Sophia Lin, VP of Product',
  receivingPartyName: 'Aura Studio & Labs LLC',
  receivingPartyAddress: '440 Montgomery Street, Suite 900, San Francisco, CA 94104',
  receivingPartyRepresentative: 'Subhadip Jana, Senior Managing Partner',
  purpose: 'Evaluating and performing technical consulting, UI/UX product design, and software engineering services for proprietary IoT fleet telemetry systems.',
  confidentialInfoScope: 'Includes all non-public technical, product, financial, business, architectural, and source code information disclosed in writing, verbally, or through access to systems.',
  durationYears: 3,
  governingLawState: 'California',
  governingCountry: 'United States',
  remediesClause: 'Both parties acknowledge that unauthorized disclosure or use of Confidential Information will cause irreparable harm for which monetary damages alone would be inadequate, entitling the non-breaching party to seek injunctive relief in addition to any other remedies available at law.',
  nonSolicitationClause: true,
  additionalClauses: 'Standard exclusions apply: information publicly known, previously known without restriction, independently developed, or rightfully obtained from third parties without confidentiality breach.'
};

export const sampleInvoice: InvoiceData = {
  invoiceNumber: 'INV-2026-0189',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
  poNumber: 'PO-AERO-9921',
  currency: 'USD',
  currencySymbol: '$',
  clientName: 'Sophia Lin',
  clientCompany: 'AeroSync Technologies Inc.',
  clientEmail: 'billing@aerosync.io',
  clientAddress: '500 Howard Street, Suite 400\nSan Francisco, CA 94105',
  clientTaxId: 'US-EIN-88-2910482',
  lineItems: [
    {
      id: 'item-1',
      description: 'Phase 1: UX Audit, Fleet Telemetry Wireframes & Figma Design System Library',
      quantity: 1,
      unitPrice: 9500,
      taxable: false
    },
    {
      id: 'item-2',
      description: 'Phase 2 Kickoff Deposit: Real-time Telemetry Dashboard Frontend Architecture (50%)',
      quantity: 1,
      unitPrice: 7750,
      taxable: false
    },
    {
      id: 'item-3',
      description: 'Custom WebSocket Anomaly Notification & Alerting Engine Integration',
      quantity: 1,
      unitPrice: 2400,
      taxable: false
    }
  ],
  discountPercent: 0,
  taxPercent: 0,
  notes: 'Thank you for your business! Payment is due within 15 calendar days from the invoice issue date. Late payments may be subject to a 1.5% monthly charge.',
  paymentInstructions: 'Please wire transfer funds using the bank coordinates on page footer or send ACH to Silicon Valley Commercial Bank (Acct ending 4892).'
};

export const sampleReceipt: ReceiptData = {
  receiptNumber: 'RCT-2026-0094',
  originalInvoiceNumber: 'INV-2026-0189',
  paymentDate: new Date().toISOString().split('T')[0],
  clientName: 'Sophia Lin',
  clientCompany: 'AeroSync Technologies Inc.',
  clientEmail: 'billing@aerosync.io',
  amountPaid: 19650,
  currency: 'USD',
  currencySymbol: '$',
  paymentMethod: 'Wire Transfer',
  transactionReference: 'WIRE-SVCB-20260914-99824',
  balanceRemaining: 0,
  receivedForDescription: 'Payment in full for Phase 1 Design System & Phase 2 Frontend Milestone Kickoff (Invoice #INV-2026-0189)',
  thankYouMessage: 'We have received your wire transfer in full. Your account balance for this milestone is settled. Thank you for partnering with Aura Studio!'
};

export const sampleOffboarding: OffboardingData = {
  clientName: 'Sophia Lin',
  clientCompany: 'AeroSync Technologies Inc.',
  clientEmail: 'sophia.lin@aerosync.io',
  projectTitle: 'Enterprise Telemetry Portal Overhaul',
  projectCompletedDate: new Date().toISOString().split('T')[0],
  executiveSummary: 'Aura Studio has concluded all scheduled milestones for the Enterprise Telemetry Portal. All frontend code, Figma assets, and deployment pipelines have been tested, audited, and successfully transferred to the internal AeroSync engineering team.',
  deliverablesDelivered: [
    'Production Next.js 15 Web Application with responsive tablet and desktop layouts',
    'Comprehensive Figma Design System with 40+ modular components in dark/light modes',
    'WebSocket Telemetry visualizer with sub-second chart rendering and alert engine',
    'Full technical documentation, component Storybook, and developer handover guide',
    '100% test coverage for critical data transformation helpers and CI pipeline'
  ],
  assetsAndCredentialsHandover: [
    { item: 'GitHub Repository Ownership', locationOrUrl: 'github.com/aerosync/telemetry-portal', accessTransferred: true, notes: 'Admin transferred to David Miller' },
    { item: 'Production & Staging Vercel Projects', locationOrUrl: 'vercel.com/aerosync-enterprise', accessTransferred: true, notes: 'Ownership transferred to client team' },
    { item: 'Figma Master Design Files', locationOrUrl: 'figma.com/@aerosync-design-system', accessTransferred: true, notes: 'Master file duplicate delivered' },
    { item: 'Environment Secrets & Encryption Keys', locationOrUrl: '1Password Secure Vault (AeroSync)', accessTransferred: true, notes: 'All dev keys revoked' }
  ],
  warrantyAndSupportPeriod: '30-day post-launch warranty valid through next month for bug fixes and critical security patches covered under initial scope.',
  hostingAndMaintenanceNotes: 'The platform is hosted on AeroSync’s Vercel Enterprise tier connected to AWS backend services. Monthly dependency security audits are recommended.',
  postLaunchRecommendations: [
    'Implement synthetic user journey monitoring using Datadog RUM',
    'Schedule user feedback interviews after 30 days of active fleet customer usage',
    'Consider Phase 2 expansions: native iOS/Android companion app for field technicians'
  ],
  testimonialRequestUrl: 'https://aurastudio.agency/review/aerosync',
  formalSignoffStatement: 'AeroSync Technologies acknowledges that all contracted deliverables have been received, inspected, and approved in satisfactory condition. All outstanding accounts have been reconciled.',
  clientApproverName: 'Sophia Lin',
  clientSignDate: new Date().toISOString().split('T')[0]
};

export const sampleRateChart: RateChartData = {
  chartTitle: 'Engineering & Product Development Rate Card',
  rateChartNumber: 'RC-2026-001',
  effectiveDate: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
  preparedFor: 'Standard Agency Commercial Rates',
  clientCompany: 'All Prospective & Retained Clients',
  currency: 'USD',
  currencySymbol: '$',
  introductoryNotes: 'This document defines our firm’s transparent tiered pricing matrix across software development, mobile engineering, cloud infrastructure, and UI/UX design. Each service is categorized by complexity scale (Simple, Medium, Complex), detailing exact deliverables, structural inclusions, scope limitations, expected delivery timelines, and fixed package investments.',
  services: [
    {
      id: 'srv-1',
      serviceName: 'Full-Stack Web Application / SaaS Platform',
      category: 'Software Engineering',
      description: 'End-to-end responsive web applications built with Next.js, React, Node.js/Python, and scalable database backends.',
      simple: {
        scaleName: 'Simple',
        price: 2500,
        timeline: '1 – 2 Weeks',
        description: 'Lean MVP or single-purpose web portal with core user authentication and simple CRUD workflows.',
        features: [
          'Modern Next.js/React frontend with Tailwind CSS styling',
          'Supabase or Firebase database & authentication setup',
          'Up to 4 responsive primary page views',
          'Standard transactional email integration (Resend/SendGrid)',
          'Automated deployment on Vercel or Netlify'
        ],
        limitations: [
          'No payment gateway or recurring subscription billing',
          'Standard UI component kit without custom illustration',
          'No complex multi-tier role-based access control (RBAC)'
        ]
      },
      medium: {
        scaleName: 'Medium',
        price: 6500,
        timeline: '3 – 5 Weeks',
        description: 'Complete commercial SaaS application with billing, role permissions, automated workflows, and relational database.',
        features: [
          'Custom Figma-to-code responsive web application (up to 12 screens)',
          'Stripe payments & automated subscription customer portal',
          'Multi-tenant workspace organization and RBAC permissions',
          'Interactive analytics dashboard with data visualizations',
          'RESTful/GraphQL API endpoints with JWT authentication',
          'Automated CI/CD deployment pipeline with staging & production environments'
        ],
        limitations: [
          'Maximum 12 unique page layouts (additional views billed separately)',
          'Relies on standard external third-party APIs (no bespoke AI model training)',
          'Third-party cloud infrastructure costs billed directly to client account'
        ]
      },
      complex: {
        scaleName: 'Complex',
        price: 16000,
        timeline: '6 – 10 Weeks',
        description: 'High-concurrency enterprise web platform with real-time WebSockets, AI/LLM integration, microservices, and audit logging.',
        features: [
          'Enterprise multi-tenant architecture with high-concurrency database schema',
          'Real-time WebSocket streaming, live telemetry, and instant notifications',
          'AI / LLM agent pipeline integration with vector search (RAG)',
          'Bespoke design system with custom design tokens and accessibility compliance (WCAG AA)',
          'Background worker queues (BullMQ/Temporal) for long-running asynchronous jobs',
          'SOC2-ready audit logging, data encryption at rest and in transit',
          'Comprehensive end-to-end automated test suites (Playwright/Jest)'
        ],
        limitations: [
          'Client provides cloud infrastructure credentials and external API keys',
          'Hardware-level integrations and specialized legacy mainframe connectivity require separate addendum'
        ]
      }
    },
    {
      id: 'srv-2',
      serviceName: 'Mobile Application Development (iOS & Android)',
      category: 'Mobile Engineering',
      description: 'Native-feel cross-platform mobile apps engineered with React Native / Flutter and offline-first data sync.',
      simple: {
        scaleName: 'Simple',
        price: 3000,
        timeline: '2 – 3 Weeks',
        description: 'Content catalog, brand utility, or lightweight client companion app with offline caching.',
        features: [
          'Cross-platform React Native / Flutter code base for iOS & Android',
          'Up to 6 clean screens with smooth transitions',
          'Push notifications setup (Firebase Cloud Messaging / Expo)',
          'App Store & Google Play submission preparation'
        ],
        limitations: [
          'No in-app purchases or subscription revenue management',
          'No complex background location tracking or Bluetooth peripherals',
          'Standard OS navigation patterns only'
        ]
      },
      medium: {
        scaleName: 'Medium',
        price: 7800,
        timeline: '4 – 6 Weeks',
        description: 'Feature-rich mobile application with secure user auth, in-app purchases, camera integration, and state management.',
        features: [
          'Biometric security (FaceID & Fingerprint authentication)',
          'In-App Purchases (IAP) & subscription handling via RevenueCat / StoreKit',
          'Camera, media library, and cloud asset upload pipeline',
          'Deep-linking, universal links, and dynamic branch links',
          'Up to 16 screens with custom animated gestures',
          'Multi-language localization (i18n) support'
        ],
        limitations: [
          'Custom audio/video DSP encoding algorithms not included',
          'App Store approval timelines depend on Apple/Google review teams'
        ]
      },
      complex: {
        scaleName: 'Complex',
        price: 18500,
        timeline: '8 – 12 Weeks',
        description: 'High-performance mobile ecosystem featuring real-time geofencing, multimedia streaming, and offline peer-to-peer sync.',
        features: [
          'Real-time GPS tracking, geofencing, and interactive vector maps (Mapbox)',
          'Live audio/video streaming or WebRTC peer-to-peer communication',
          'Robust offline-first SQLite database with automated bi-directional conflict resolution',
          'Custom native Swift / Kotlin bridging modules for optimal hardware performance',
          'Automated mobile CI/CD build pipelines (Fastlane / EAS)',
          'Full security hardening: SSL pinning, root/jailbreak detection, and secure enclave storage'
        ],
        limitations: [
          'Proprietary hardware firmware integration or custom IoT BLE dongles require hardware units provided by client'
        ]
      }
    },
    {
      id: 'srv-3',
      serviceName: 'Cloud Architecture, DevOps & API Services',
      category: 'Cloud & Infrastructure',
      description: 'Scalable backend services, Dockerized microservices, Kubernetes orchestration, and robust automated CI/CD pipelines.',
      simple: {
        scaleName: 'Simple',
        price: 1800,
        timeline: '1 Week',
        description: 'Single-server cloud setup, Docker containerization, and basic automated GitHub Actions workflow.',
        features: [
          'Docker containerization for existing application codebase',
          'Automated CI/CD build & test workflow on GitHub Actions',
          'Cloud deployment on AWS Lightsail, DigitalOcean, or Hetzner',
          'SSL certificate automation via Let’s Encrypt and firewall configuration'
        ],
        limitations: [
          'Single region, non-clustered environment (no auto-scaling)',
          'Standard relational database without automated read replicas'
        ]
      },
      medium: {
        scaleName: 'Medium',
        price: 4800,
        timeline: '2 – 4 Weeks',
        description: 'Production-ready cloud architecture with autoscaling, Redis caching, staging environments, and automated backups.',
        features: [
          'Terraform Infrastructure as Code (IaC) configuration',
          'Load-balanced compute instances with automatic autoscaling groups',
          'Managed database cluster (AWS RDS / Supabase) with automated daily snapshots & point-in-time recovery',
          'Redis caching layer for high-speed session management & rate limiting',
          'Separate, isolated Staging and Production deployment environments',
          'Uptime monitoring, centralized error tracking (Sentry), and slack alerting'
        ],
        limitations: [
          'Multi-cloud or hybrid on-premise failover is out of scope',
          'Direct AWS/GCP consumption costs paid directly by client'
        ]
      },
      complex: {
        scaleName: 'Complex',
        price: 12000,
        timeline: '5 – 8 Weeks',
        description: 'Enterprise multi-region distributed cluster, Kubernetes (EKS/GKE), zero-downtime blue/green rollouts, and compliance hardening.',
        features: [
          'Production Kubernetes cluster (AWS EKS or GCP GKE) with Helm chart deployments',
          'Zero-downtime blue/green or canary release deployments',
          'Multi-region active-passive database replication and failover architecture',
          'Cloudflare Enterprise edge configuration (WAF, DDoS mitigation, global edge caching)',
          'Full observability stack with Prometheus, Grafana, and distributed OpenTelemetry tracing',
          'Security posture hardening conforming to SOC2 and ISO 27001 baseline specifications'
        ],
        limitations: [
          'Formal third-party penetration testing and compliance auditor sign-off fees excluded'
        ]
      }
    },
    {
      id: 'srv-4',
      serviceName: 'UI/UX Design System & Product Experience',
      category: 'Product Design',
      description: 'World-class digital product design, user journey mapping, design systems, and developer-ready Figma token libraries.',
      simple: {
        scaleName: 'Simple',
        price: 1400,
        timeline: '1 – 2 Weeks',
        description: 'Brand identity foundation, typography, color palette, and up to 5 core responsive screen designs in Figma.',
        features: [
          'Core visual identity (color palette, typography scale, iconography)',
          'Up to 5 responsive desktop & mobile screens in Figma',
          'Production-ready exportable SVG/PNG asset pack',
          '1 round of structural design revisions'
        ],
        limitations: [
          'No interactive clickable prototype',
          'Bespoke 3D renders or custom character illustrations excluded'
        ]
      },
      medium: {
        scaleName: 'Medium',
        price: 3800,
        timeline: '3 – 4 Weeks',
        description: 'Comprehensive UI/UX design with reusable component library, responsive layouts, and interactive user flow prototype.',
        features: [
          'Modular Figma component library with Auto-Layout and variant properties (40+ components)',
          'Complete user journey flows and information architecture diagrams',
          'Up to 18 responsive application screens (Desktop, Tablet, Mobile)',
          'Clickable interactive Figma prototype for usability testing and stakeholder pitches',
          '3 structured rounds of feedback and revisions',
          'Detailed developer handoff specs with typography, spacing, and CSS variables'
        ],
        limitations: [
          'Animation micro-interactions limited to standard Figma smart-animations',
          'Client supplies all product copywriting and trademark assets'
        ]
      },
      complex: {
        scaleName: 'Complex',
        price: 8500,
        timeline: '5 – 7 Weeks',
        description: 'Enterprise-grade multi-platform design system with code token synchronizers, WCAG 2.1 AA audits, and dark/light modes.',
        features: [
          'Unified design system for Web, iOS, and Android platforms',
          'Design Tokens automated sync to GitHub repository (Tailwind CSS config / SCSS variables)',
          'Comprehensive Dark Mode and Light Mode color palette pairing with contrast ratios',
          'WCAG 2.1 AA Accessibility audit and screen-reader navigation blueprints',
          'Custom micro-interaction motion guidelines (Lottie animations)',
          'Complete design documentation portal and component usage guidelines'
        ],
        limitations: [
          'Bespoke proprietary font typeface creation excluded'
        ]
      }
    }
  ],
  commercialTerms: [
    'Engagement Structure: Projects may be engaged under a fixed-fee milestone schedule (50% mobilization deposit upon kickoff, 50% upon final acceptance) or sprint-based retainer.',
    'Revision Policy: Each scale includes structured review intervals (Simple: 1 round, Medium: 3 rounds, Complex: unlimited within approved milestone scope).',
    'Out-of-Scope Work: Requests exceeding defined scale inclusions are quoted separately or billed at our standard partner rate ($125/hr).',
    'Intellectual Property: 100% of all intellectual property, source code, design files, and proprietary assets transfer to the client upon receipt of final payment in full.',
    'Warranty & Bug-Fix Period: All delivered software includes a complimentary 30-day warranty post-handover covering defects and discrepancies against the agreed scope.'
  ],
  authorizedSignerTitle: 'Senior Managing Partners',
  authorizedSignerName: 'Subhadip Jana & Shayan Das'
};


