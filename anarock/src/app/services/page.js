"use client";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Download,
  Share2,
  Mail,
  Linkedin,
} from "lucide-react";

const PURPLE = "#A054A0";

const serviceCategories = [
  {
    title: "Leasing Services",
    description:
      "Our leasing services help occupiers identify the right office space, evaluate alternatives, negotiate favourable commercial terms and execute transactions with confidence across India's leading office markets.",
    items: [
      {
        title: "Market Intelligence & Advisory",
        description:
          "Market insights on rentals, availability, occupier trends, infrastructure developments and micro-market dynamics",
      },
      {
        title: "Property Sourcing & Shortlisting",
        description:
          "Identify office options based on location, size, budget, building quality, scalability and employee accessibility",
      },
      {
        title: "Property Evaluation & Option Analysis",
        description:
          "Evaluate shortlisted properties across commercial, operational, workplace, ESG and infrastructure parameters",
      },
      {
        title: "Commercial Negotiation Strategy",
        description:
          "Support negotiations on rent, escalation, deposits, fit-out terms, lock-ins, exit rights and expansion rights",
      },
      {
        title: "Lease Documentation Support",
        description:
          "Align commercial terms, transaction understanding and key risk considerations with legal documentation",
      },
    ],
  },
  {
    title: "Transaction Management",
    description:
      "Our transaction management services provide structured execution, governance and portfolio visibility across lease renewals, relocations, consolidations and multi-market expansions.",
    items: [
      {
        title: "Business Case Planning",
        description:
          "Develop decision frameworks supporting lease, renewal, relocation, expansion and consolidation strategies",
      },
      {
        title: "Multi-Market Transactions",
        description:
          "Coordinate transactions across multiple cities through standardised processes, reporting and governance",
      },
      {
        title: "Portfolio Analytics",
        description:
          "Analyse lease expiries, rentals, utilisation, benchmarks and future business requirements",
      },
      {
        title: "Portfolio Strategy Roadmap",
        description:
          "Create short, medium and long-term real estate plans aligned with growth and workplace objectives",
      },
      {
        title: "Critical Data Management",
        description:
          "Track lease obligations, critical dates and renewal milestones to improve portfolio governance",
      },
      {
        title: "Transaction Process Compliance",
        description:
          "Ensure leasing transactions follow governance standards and maintain audit-ready documentation",
      },
    ],
  },
  {
    title: "Advisory Services",
    description:
      "Our advisory services combine market intelligence, workplace strategy and portfolio planning to help businesses optimise occupancy costs, improve employee experience and create future-ready office portfolios.",
    items: [
      {
        title: "Portfolio Strategy & Optimisation",
        description:
          "Align real estate portfolios with future business priorities while reducing occupancy costs",
      },
      {
        title: "Metro Planning",
        description:
          "Evaluate emerging business districts, talent corridors and infrastructure developments to support location decisions",
      },
      {
        title: "Market Research & Benchmarking",
        description:
          "Proprietary research on rentals, absorption trends and market performance indicators",
      },
      {
        title: "Location Advisory",
        description:
          "Evaluate talent availability, connectivity, infrastructure quality and total cost of occupation",
      },
      {
        title: "Lease vs Buy Advisory",
        description:
          "Financial and strategic analysis comparing leasing and ownership models",
      },
      {
        title: "Workplace Strategy",
        description:
          "Design workplace frameworks supporting productivity, collaboration and hybrid work models",
      },
      {
        title: "Change Management",
        description:
          "Support organisations through relocations and workplace transitions with minimal disruption",
      },
      {
        title: "Flexible Office Space Advisory",
        description:
          "Evaluate managed offices, coworking solutions and hybrid workplace strategies",
      },
      {
        title: "Data Centre Advisory",
        description:
          "Strategic site selection, infrastructure assessment and compliance support for data centre operations",
      },
      {
        title: "ESG Advisory",
        description:
          "Support sustainability certifications, green leases and ESG-aligned real estate strategies",
      },
    ],
  },
  {
    title: "Enterprise Advisory Solutions",
    description:
      "We deliver strategic workplace, portfolio, and occupancy solutions that support complex business growth and real estate decisions.",
    items: [
      {
        title: "GCC & Shared Service Advisory",
        description:
          "City selection, talent mapping, campus planning and long-term lease structuring for GCCs and shared service centres",
      },
      {
        title: "Built-to-Suit Advisory",
        description:
          "Support bespoke corporate campuses from site identification through commercial structuring and handover",
      },
      {
        title: "Occupancy Planning",
        description:
          "Forecast future space requirements based on growth, utilisation and workplace strategies",
      },
      {
        title: "Stay-vs-Go Analysis",
        description:
          "Evaluate whether organisations should renew, relocate, consolidate or restructure existing office footprints",
      },
      {
        title: "Renewal Strategy",
        description:
          "Structured lease renewal advisory supported by benchmarking and negotiation planning",
      },
      {
        title: "Transaction Governance",
        description:
          "Create transparent decision-making frameworks, approval tracking and commercial comparison tools",
      },
      {
        title: "Workplace Experience Advisory",
        description:
          "Evaluate how workplace location, amenities, flexibility and commute impact employee experience and retention",
      },
    ],
  },
];

const businessSegments = [
  {
    title: "Large Corporations",
    image: "/services/Service2.avif",
    description:
      "End-to-end real estate strategy, portfolio consolidation, relocation and multi-city expansion.",
    href: "/services/large-corporations",
  },
  {
    title: "Start-ups & Small Businesses",
    image: "/services/Startups.avif",
    description:
      "Agile, scalable workspace solutions designed for high-growth businesses and emerging companies.",
    href: "/services/startups",
  },
  {
    title: "Flexible & Managed Office Advisory",
    image: "/services/flexible.avif",
    description:
      "Optimised coworking, managed space acquisition and flexible lease structuring.",
    href: "/services/flexible-offices",
  },
  {
    title: "GCCs & Shared Service Centres",
    image: "/services/gcc.avif",
    description:
      "Specialised advisory for talent hubs, campus planning and long-term enterprise setup.",
    href: "/services/gcc",
  },
  {
    title: "Built-to-Suit Campuses",
    image: "/services/Campuses.avif",
    description:
      "Tailored corporate campus development, site evaluation and commercial structuring.",
    href: "/services/built-to-suit",
  },
  {
    title: "Data Centres",
    image: "/services/datacenter.avif",
    description:
      "Strategic real estate advisory for high-power, secure digital infrastructure.",
    href: "/services/data-centres",
  },
];

const researchItems = [
  {
    title: "India Office Market Update_H1 CY2026",
    date: "Jul'26",
    image: "/services/research/OfficeMarket.avif",
    featured: true,
    href: "/insights",
  },
  {
    title: "Why U.S. Retailers are Turning to India for Next-Generation GCCs",
    date: "Feb'26",
    image: "/services/research/OfficeMarket.avif",
    href: "/insights",
  },
  {
    title: "India Office Market Annual Update CY2025",
    date: "Feb'26",
    image: "/services/research/OfficeMarket.avif",
    href: "/insights",
  },
  {
    title: "Workplaces 2025: India Commercial Real Estate Reimagined",
    date: "Jan'26",
    image: "/services/research/OfficeMarket.avif",
    href: "/insights",
  },
];

const leaders = [
  {
    name: "Peush Jain",
    role: "Managing Director",
    image: "/services/leaders/Peush.avif",
  },
  {
    name: "Surabhi Gupta",
    role: "Regional Head – North",
    image: "/services/leaders/Surabhi.avif",
  },
  {
    name: "Pratik Mehta",
    role: "Head – Business Development, Hyderabad & Kolkata",
    image: "/services/leaders/Pratik.avif",
  },
  {
    name: "Kanchana Krishnan",
    role: "Regional Head – Chennai",
    image: "/services/leaders/Kanchana.avif",
  },
  {
    name: "Abbishek Sharma",
    role: "Head - Enterprise Account and Head of Operations",
    image: "/services/leaders/Abbishek.avif",
  },
  {
    name: "Atul Khedkar",
    role: "Regional Head - Mumbai",
    image: "/services/leaders/Atul.avif",
  },
  {
    name: "Mazhar Mulani",
    role: "Regional Director - Bengaluru",
    image: "/services/leaders/Mazhar.avif",
  },
];

const faqs = [
  {
    question: "What is commercial leasing?",
    answer:
      "Commercial leasing is the process through which businesses secure office or commercial real estate through structured lease agreements. It includes market analysis, property selection, lease negotiations and transaction execution. At Anarock, we help occupiers identify the right workplace solutions through data-driven market intelligence and advisory. Our commercial leasing services enable businesses to secure strategic locations while supporting long-term growth and operational flexibility.",
  },
  {
    question: "How does office leasing work in India?",
    answer:
      "Office leasing in India begins with understanding business requirements, workforce needs and location preferences. The process involves market research, property evaluation, lease negotiations and transaction management. At Anarock, we guide occupiers through every stage of the office leasing lifecycle, helping them make informed decisions. Our advisory-led approach ensures businesses secure office spaces aligned with their operational and growth objectives.",
  },
  {
    question: "What services do commercial leasing companies in India offer?",
    answer:
      "Commercial leasing companies provide market intelligence, tenant representation, property sourcing, workplace strategy, lease negotiations and portfolio optimisation services. These solutions help occupiers make informed real estate decisions while reducing transaction risks. At Anarock, we offer commercial leasing advisory backed by deep market expertise and occupier-focused solutions. Our services are designed to optimise workplace performance and business outcomes.",
  },
  {
    question: "What is the average lease tenure in India?",
    answer:
      "Commercial office lease tenures in India typically range between three and nine years, depending on asset type, location and occupier requirements. Large enterprises often prefer longer tenures for stability and commercial advantages, while flexible workspaces offer shorter commitments. At Anarock, we advise occupiers on selecting lease structures that align with their business strategy and future expansion plans.",
  },
  {
    question:
      "What is the difference between leasing and renting commercial property?",
    answer:
      "Leasing generally involves longer-term agreements with customised commercial terms, while renting is often shorter-term and more standardised. Commercial leases offer greater flexibility around workplace planning, expansion rights and fit-out provisions. At Anarock, we help businesses evaluate leasing versus renting options based on operational requirements, financial goals and long-term growth plans.",
  },
  {
    question:
      "Can you assist start-ups and SMEs with commercial leasing services?",
    answer:
      "Yes. Start-ups and SMEs often require flexible, cost-efficient office solutions that support growth without creating unnecessary financial burden. At Anarock, we help emerging businesses identify suitable office spaces, evaluate flexible workspace options and negotiate favourable lease terms. Our advisory services enable growing companies to scale efficiently while managing occupancy costs.",
  },
  {
    question:
      "What factors should businesses consider when leasing office space?",
    answer:
      "Businesses should evaluate location, accessibility, workforce convenience, rental costs, infrastructure quality and future scalability before selecting office space. Occupancy costs, lease flexibility and employee experience are equally important considerations. At Anarock, we use data-led analysis and workplace strategy insights to help occupiers identify locations that support both immediate needs and long-term business objectives.",
  },
  {
    question:
      "What types of properties do commercial property leasing companies handle?",
    answer:
      "Commercial leasing firms typically manage Grade A office buildings, business parks, IT campuses, coworking spaces, managed offices, built-to-suit facilities and data centres. The right property type depends on business goals, workforce requirements and operational priorities. At Anarock, we help occupiers evaluate and select workplace solutions that align with their growth strategy and portfolio objectives.",
  },
  {
    question:
      "What are the benefits of leasing versus buying commercial property?",
    answer:
      "Leasing requires lower upfront capital investment and provides greater flexibility compared to ownership. It allows businesses to preserve capital, adapt to changing workforce requirements and optimise their real estate portfolios. At Anarock, we help occupiers conduct lease-versus-buy evaluations to determine the most effective solution based on business priorities and long-term financial goals.",
  },
  {
    question:
      "Do you offer commercial property leasing services across multiple cities in India?",
    answer:
      "Yes. Anarock provides commercial leasing and advisory services across India's leading office markets, supporting businesses with expansion, consolidation and relocation requirements. Our teams deliver consistent market intelligence, transaction management and portfolio advisory services across multiple locations. This helps occupiers manage their office portfolios more effectively and efficiently.",
  },
  {
    question: "How do I choose the right office space for my business?",
    answer:
      "The right office space should align with your workforce strategy, budget, operational needs and future growth plans. Businesses should assess accessibility, amenities, scalability and workplace experience before making a decision. At Anarock, we combine market intelligence, workplace strategy and occupier advisory to help clients identify office solutions that drive productivity and business performance.",
  },
  {
    question:
      "How do commercial leasing consultants help with lease negotiations?",
    answer:
      "Commercial leasing consultants benchmark market rentals, analyse lease structures and negotiate favourable commercial terms on behalf of occupiers. They assist with rent escalations, lock-in periods, fit-out contributions, security deposits and exit clauses. At Anarock, our negotiation expertise helps clients secure competitive lease agreements while reducing financial and operational risks.",
  },
  {
    question: "What should I consider before leasing out commercial property?",
    answer:
      "Property owners should evaluate market demand, tenant quality, rental benchmarks, lease tenure and maintenance obligations before leasing out an asset. A well-structured lease agreement helps protect long-term asset value and occupancy stability. At Anarock, we advise landlords on positioning, leasing strategy and transaction structuring to maximise occupancy and returns.",
  },
  {
    question: "What is tenant representation in commercial leasing?",
    answer:
      "Tenant representation ensures occupiers have a dedicated advisor acting solely in their interests during property selection and lease negotiations. This approach helps secure favourable commercial terms and reduce transaction risks. At Anarock, our tenant representation services combine market intelligence, workplace strategy and negotiation expertise to support informed decision-making and better leasing outcomes.",
  },
  {
    question: "What is workplace strategy and why is it important?",
    answer:
      "Workplace strategy aligns office design, occupancy planning and real estate decisions with business objectives. It improves employee experience, space utilisation, productivity and talent retention while supporting hybrid work models. At Anarock, we help organisations develop workplace strategies that optimise real estate investments and create future-ready work environments aligned with long-term business goals.",
  },
];

function SectionHeading({ children, subtitle, className = "" }) {
  return (
    <div
      className={`mx-auto mb-10 max-w-4xl text-center ${className}`}
    >
      <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-7 text-slate-700">{subtitle}</p>
      )}
    </div>
  );
}

function ServicePattern({ children, className = "" }) {
  return (
    <section
      className={`relative overflow-hidden bg-[#F7F7F7] ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(132deg, transparent 0px, transparent 63px, rgba(160,84,160,0.055) 64px, transparent 67px)",
      }}
    >
      {children}
    </section>
  );
}

function LocalImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
}) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasFailed, setHasFailed] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={hasFailed}
        onError={() => {
          if (!hasFailed) {
            setHasFailed(true);
            setImageSrc(fallbackImage);
          }
        }}
        className="object-cover"
      />
    </div>
  );
}

function CommercialLeasingAndAdvisoryPageContent() {
  const searchParams = useSearchParams();

  const serviceSlugToIndex = {
    "leasing-services": 0,
    "transaction-management": 1,
    "advisory-services": 2,
    "enterprise-advisory-solutions": 3,
  };

  const requestedService = searchParams.get("service");

  const [activeService, setActiveService] = useState(
    () => serviceSlugToIndex[requestedService] ?? 0
  );

  useEffect(() => {
    setActiveService(serviceSlugToIndex[requestedService] ?? 0);
  }, [requestedService]);
  const [openFaq, setOpenFaq] = useState(null);
  const [businessOffset, setBusinessOffset] = useState(0);
  const [researchOffset, setResearchOffset] = useState(0);

  const selectedService = serviceCategories[activeService];

  const moveBusiness = (direction) => {
    setBusinessOffset((current) =>
      Math.max(0, Math.min(businessSegments.length - 3, current + direction)),
    );
  };

  const moveResearch = (direction) => {
    setResearchOffset((current) =>
      Math.max(0, Math.min(researchItems.length - 3, current + direction)),
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-black">
      {/* HERO */}
      <section className="relative isolate flex min-h-[320px] w-full items-center overflow-hidden px-6 py-14 text-white sm:min-h-[400px] sm:px-10 md:px-16 lg:min-h-[495px] lg:px-[7.8%]">
        <Image
          src="/services/Service.avif"
          alt="Modern commercial office workspace"
          fill
          priority
          sizes="100vw"
          unoptimized
          onError={(event) => {
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1920&q=85";
          }}
          className="object-cover object-center"
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#2B0A29]/95 via-[#2B0A29]/10 via-[50%] to-transparent" />
        <div className="absolute inset-0 z-10" />

        <div className="relative z-20 mx-auto w-full max-w-[1728px]">
          <div className="max-w-[570px]">
            <h1 className="mb-5 text-3xl font-medium leading-[1.16] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[56px]">
              Commercial Leasing
              <br />
              &amp; Advisory
            </h1>

            <p className="max-w-[550px] text-base leading-7 text-white sm:text-lg">
              Data-led commercial leasing and advisory services helping
              businesses optimise portfolios and workplace decisions
            </p>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1728px] flex-wrap items-center gap-2 px-6 py-6 text-[11px] text-slate-700 sm:px-10 md:px-16 lg:px-[7.8%]">
        <Link href="/" className="hover:text-[#A054A0]">Home</Link>
        <ChevronRight size={12} className="text-[#A054A0]" />
        <Link href="/services" className="hover:text-[#A054A0]">Services</Link>
        <ChevronRight size={12} className="text-[#A054A0]" />
        <span className="text-slate-900">Commercial Leasing And Advisory</span>
      </nav>

      {/* INTRODUCTION AND STATISTICS */}
      <section className="mx-auto max-w-[1150px] px-6 pb-14 pt-12 sm:px-10 lg:pb-20">
        <h2 className="mx-auto max-w-[850px] text-center text-2xl font-normal leading-tight tracking-tight text-black sm:text-3xl">
          Our office real estate specialists deliver strategic workplace
          solutions that optimise performance and support long-term business
          growth.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ["100+", "Corporate Clients"],
            ["3.5mn+ sq ft", "Office Space Advised"],
            ["30+", "Years of Experience"],
          ].map(([value, label]) => (
            <div key={label} className="min-h-[120px] rounded-md bg-[#FFF5F0] p-5 sm:p-6">
              <div className="text-3xl font-medium tracking-tight sm:text-4xl">{value}</div>
              <p className="mt-3 text-sm text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE SERVICES */}
      <ServicePattern className="py-12 sm:py-14 lg:py-12">
        <div className="relative z-10 mx-auto max-w-[1728px] px-5 sm:px-8 lg:px-[7%]">
          <SectionHeading>Our Services</SectionHeading>
          <div className="mb-9 flex flex-wrap justify-center gap-2">
            {serviceCategories.map((service, index) => (
              <button
                key={service.title}
                type="button"
                onClick={() => setActiveService(index)}
                aria-pressed={activeService === index}
                className={`border px-4 py-2 text-xs transition-colors sm:text-sm ${activeService === index
                  ? "border-[#A054A0] bg-[#A054A0] font-semibold text-white"
                  : "border-white bg-white text-slate-900 hover:border-[#A054A0] hover:text-[#A054A0]"
                  }`}
              >
                {service.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.85fr_1.65fr] lg:gap-10">
            <div className="pt-1">
              <h3 className="mb-5 text-3xl font-medium leading-tight text-[#A054A0] sm:text-4xl">{selectedService.title}</h3>
              <p className="max-w-xl text-sm leading-[1.65] text-slate-900 sm:text-base">{selectedService.description}</p>
              <a href="#enquiry" className="mt-8 inline-flex items-center gap-2 border border-[#D5ADD5] px-5 py-3 text-sm font-medium text-[#A054A0] transition-colors hover:bg-[#A054A0] hover:text-white">
                Enquire <ArrowUpRight size={17} />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {selectedService.items.map((item) => (
                <article
                  key={item.title}
                  className="min-h-[100px] bg-white px-5 py-4 shadow-[0_5px_18px_rgba(0,0,0,0.025)]"
                >
                  <h4 className="flex items-start gap-2 text-sm font-semibold leading-5 text-black">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A054A0]" />
                    {item.title}
                  </h4>
                  <p className="ml-4 mt-2 text-sm leading-5 text-[#484848]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </ServicePattern>

      {/* SOLUTIONS FOR EVERY BUSINESS */}
      <section className="py-16 sm:py-20">
        <div className="px-6 sm:px-10">
          <SectionHeading subtitle="Every organisation has unique workplace needs. Our advisory-led approach helps businesses make informed office real estate decisions that support growth, efficiency and long-term success.">
            Solutions for every business
          </SectionHeading>
        </div>

        <div className="mx-auto max-w-[1728px] px-5 sm:px-8 lg:px-[7%]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businessSegments
              .slice(businessOffset, businessOffset + 3)
              .map((segment) => (
                <article
                  key={segment.title}
                  className="flex min-w-0 flex-col border border-slate-100 bg-white"
                >
                  <LocalImage
                    src={segment.image}
                    alt={segment.title}
                    className="h-[220px] w-full sm:h-[245px]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="flex min-h-[130px] flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {segment.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {segment.description}
                    </p>
                    <Link
                      href={segment.href}
                      className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#A054A0] hover:gap-3"
                    >
                      Learn More <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
          </div>

          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              aria-label="Previous business solutions"
              onClick={() => moveBusiness(-1)}
              disabled={businessOffset === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#F3E8F3] hover:text-[#A054A0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next business solutions"
              onClick={() => moveBusiness(1)}
              disabled={businessOffset >= businessSegments.length - 3}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#A054A0] transition hover:bg-[#F3E8F3] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* RESEARCH AND INSIGHTS */}
      <section className="bg-[#FFF6F0] py-14 sm:py-16">
        <div className="mx-auto grid max-w-[1728px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-[0.75fr_2.25fr] lg:items-center lg:gap-10 lg:px-[7%]">
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Research &amp;
              <br />
              Insights
            </h2>
            <p className="mt-6 max-w-sm text-base leading-6 text-slate-800">
              Market intelligence, industry trends and research-led insights
              that support confident real estate decision-making.
            </p>
          </div>

          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {researchItems
                .slice(researchOffset, researchOffset + 3)
                .map((item) => (
                  <article
                    key={item.title}
                    className={`flex min-w-0 flex-col border border-slate-100 bg-white ${item.featured ? "shadow-md" : ""
                      }`}
                  >
                    <LocalImage
                      src={item.image}
                      alt={item.title}
                      className="h-[180px] w-full"
                      sizes="(max-width: 768px) 100vw, 30vw"
                    />

                    {item.featured ? (
                      <div className="flex flex-1 flex-col bg-[#A054A0] p-5 text-white">
                        <span className="mb-4 w-fit bg-white px-2 py-1 text-[10px] uppercase tracking-wider text-[#A054A0]">
                          Commercial
                        </span>
                        <h3 className="text-xl font-semibold leading-snug">
                          {item.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between border-t border-white/30 pt-4">
                          <Link
                            href={item.href}
                            className="inline-flex items-center gap-2 text-sm font-semibold"
                          >
                            View Report <ArrowUpRight size={16} />
                          </Link>
                          <div className="flex gap-3">
                            <a
                              href={item.image}
                              download
                              aria-label="Download report"
                            >
                              <Download size={17} />
                            </a>
                            <button
                              type="button"
                              aria-label="Share report"
                              onClick={() => {
                                if (navigator.share) {
                                  navigator
                                    .share({
                                      title: item.title,
                                      url: window.location.href,
                                    })
                                    .catch(() => { });
                                }
                              }}
                            >
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="bg-slate-50 px-2 py-1 uppercase tracking-wide text-slate-700">
                            Commercial
                          </span>
                          <span>{item.date}</span>
                        </div>
                        <h3 className="mt-3 line-clamp-3 min-h-[72px] text-base font-medium leading-6">
                          {item.title}
                        </h3>
                        <div className="mt-auto border-t border-slate-100 pt-4">
                          <Link
                            href={item.href}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#A054A0]"
                          >
                            View Report <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-label="Previous research reports"
                  onClick={() => moveResearch(-1)}
                  disabled={researchOffset === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Next research reports"
                  onClick={() => moveResearch(1)}
                  disabled={researchOffset >= researchItems.length - 3}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#A054A0] disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 border border-[#D5ADD5] px-6 py-3 text-sm font-medium text-[#A054A0] transition hover:bg-[#A054A0] hover:text-white"
              >
                View all <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MEET THE LEADERS */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1728px] px-5 sm:px-8 lg:px-[7%]">
          <SectionHeading>Meet the Leaders</SectionHeading>

          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((leader) => (
              <article
                key={leader.name}
                className="flex min-w-0 items-start gap-4"
              >
                <LocalImage
                  src={leader.image}
                  alt={leader.name}
                  className="h-[74px] w-[74px] shrink-0 rounded-full bg-slate-100"
                  sizes="74px"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="border-b border-[#EADBEA] pb-2 text-sm font-semibold">
                    {leader.name}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-slate-700">
                    {leader.role}
                  </p>
                  <div className="mt-2 flex gap-2 text-[#A054A0]">
                    <a
                      href="#enquiry"
                      aria-label={`${leader.name} LinkedIn`}
                      className="hover:text-[#7D397D]"
                    >
                      <ArrowUpRight size={15} />{" "}
                    </a>
                    <a
                      href="#enquiry"
                      aria-label={`Email ${leader.name}`}
                      className="hover:text-[#7D397D]"
                    >
                      <Mail size={15} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Contact banner */}
          <div
            id="enquiry"
            className="relative mt-16 grid overflow-hidden bg-[#F3F0FF] p-7 sm:p-10 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8 lg:px-14"
            style={{
              backgroundImage:
                "repeating-linear-gradient(105deg, transparent 0px, transparent 11px, rgba(160,84,160,0.07) 12px, transparent 16px)",
            }}
          >
            <div className="relative z-10">
              <h2 className="max-w-[570px] text-2xl font-semibold leading-tight sm:text-3xl">
                Connect with our experts for tailored real estate solutions
              </h2>
              <Link
                href="/#enquiry"
                className="mt-5 inline-flex items-center gap-2 bg-[#A054A0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#863F86]"
              >
                Enquire <ArrowUpRight size={17} />
              </Link>
            </div>
            <LocalImage
              src="/services/leaders/Connect.avif"
              alt="Connect with our real estate advisory team"
              className="mt-7 h-[185px] w-full lg:mt-0"
              sizes="(max-width: 1024px) 100vw, 300px"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <SectionHeading>Frequently Asked Questions</SectionHeading>

          <div className="divide-y divide-slate-200">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 py-5 text-left"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A054A0]" />
                    <span
                      className={`flex-1 text-sm font-semibold leading-6 sm:text-base ${isOpen ? "text-[#A054A0]" : "text-black"
                        }`}
                    >
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus size={18} className="shrink-0 text-[#A054A0]" />
                    ) : (
                      <Plus size={18} className="shrink-0 text-[#A054A0]" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pb-7 pl-5 pr-2 sm:pl-6">
                      <p className="text-sm leading-6 text-slate-700 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
export default function CommercialLeasingAndAdvisoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CommercialLeasingAndAdvisoryPageContent />
    </Suspense>
  );
}