"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Rocket, Armchair } from "lucide-react";
import { useState } from "react";
import MarketStats from "@/components/home/MarketStats";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const leaders = [
    {
        name: "Anuj Puri",
        role: "Chairman",
        image: "/services/leaders/AnujPuri.avif",
        linkedin: "https://www.linkedin.com/in/theanujpuri",
        email: "",
        description: (
            <>
                <b className="font-semibold text-black">
                    Leading real estate industry spokesperson,
                </b>{" "}
                <strong>Chairman and Founder of Anarock</strong>, deep networks and
                strong market influence translate into strategic leverage, driving
                best-in-class outcomes for our clients.
            </>
        ),
    },
    {
        name: "Santhosh Kumar",
        role: "Group Vice Chairman",
        image: "/services/leaders/SanthoshKumar.png",
        linkedin: "https://www.linkedin.com/in/santhosh-kumar-anarock/",
        email: "santhosh.kumar@anarock.com",
        description: (
            <>
                <strong>Head of operations at Anarock</strong>,{" "}
                <b className="font-semibold text-black">deep developer relationships</b>{" "}
                create a distinct advantage, driving superior, benchmark-setting
                outcomes for clients.
            </>
        ),
    },
    {
        name: "Peush Jain",
        role: "MD – Commercial Leasing & Advisory",
        image: "/services/leaders/Peush.avif",
        linkedin: "https://www.linkedin.com/in/peush-jain-62560b5/",
        email: "peush.jain@anarock.com",
        description: (
            <>
                <b className="font-semibold text-black">
                    One of the senior leaders in India&apos;s corporate real estate
                    industry, leading{" "}
                </b>
                <strong>Anarock&apos;s Commercial Leasing &amp; Advisory (CLA)</strong>{" "}
                business with a client-first, advisory-led approach.
            </>
        ),
    },
];
const companyStats = [
    { value: "3000+", label: "Employees" },
    {
        value: "$100 B",
        label: "Transacted & Advised since June 2017",
    },
    { value: "30%", label: "YoY Growth" },
    { value: "15", label: "Offices across India" },
];


const companyJourney = [
    {
        year: "2017",
        detail: (
            <>
                <strong>Inception</strong> of ANAROCK
            </>
        ),
    },
    {
        year: "2018",
        detail: (
            <>
                JV with HVS for Hospitality. <strong>Launch</strong> of
                Investment Banking, Land Services, Retail Leasing,
                Strategic Advisory &amp; Valuations.
            </>
        ),
    },
    {
        year: "2019",
        detail: (
            <>
                Launch of Anarock Open Market. Certified as a
                <strong> Great Place To Work</strong>.
            </>
        ),
    },
    {
        year: "2020",
        detail: (
            <>
                Forayed into Commercial Strata.
            </>
        ),
    },
    {
        year: "2021",
        detail: (
            <>
                <strong>Acquisition</strong> of ANACITY, a community
                management application. <strong>Launched</strong> 'Astra',
                an AI/ML tool to boost sales.
            </>
        ),
    },
    {
        year: "2022",
        detail: (
            <>
                <strong>Significant investment</strong> in myHQ, a
                co-working spaces aggregator. <strong>Started</strong>
                {" "}Retail Strata sales.
            </>
        ),
    },
    {
        year: "2023",
        detail: (
            <>
                Launch of Dubai to Dubai Resi Sales. Astra received
                <strong> Patented status</strong> from GOI.
            </>
        ),
    },
    {
        year: "2024",
        detail: (
            <>
                <strong>Raised</strong> ~INR 200cr funding from 360 ONE
                Asset, the first equity investor.
            </>
        ),
    },
    {
        year: "2025",
        detail: (
            <>
                <strong>Launch of PMES</strong> (Project Management &
                Engineering Services).
            </>
        ),
    },
    {
        year: "2026",
        detail: (
            <>
                Commenced <strong>IPO Journey</strong> for Anarock.
                <strong> Acquired 51% Stake</strong> in DSP Design Associates.
            </>
        ),
    },
];


const partners = [
    { name: "BINSWANGER", IMG: "/services/research/binswanger.png", scale: 2.2 },
    { name: "HVS", IMG: "/services/research/hvs.png", scale: 0.75 },
    { name: "BROADENING", IMG: "/services/research/bway.png", scale: 1.5 },
    { name: "VINDICO", IMG: "/services/research/vindico.png", scale: 2.3 },
    { name: "myHQ", IMG: "/services/research/myhq.svg", scale: 0.75 },
    { name: "UPFLEX", IMG: "/services/research/upflex.png", scale: 2 },
];
const highlights = [
    {
        icon: Rocket,
        emphasis: "Leading",
        text: "Property Consultant in India",
    },
    {
        icon: Award,
        emphasis: "Patented",
        text: "proprietary AI tools",
    },
    {
        icon: Armchair,
        prefix: "India's ",
        emphasis: "Largest",
        text: "Flex Supply Aggregator",
    },
];
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut" },
    },
};

export default function AboutUsPage() {
    return (
        <main className="w-full min-w-0 overflow-x-clip text-black">
            <Breadcrumbs items={[{
                label: "About us", href: "/aboutus",
            }]} />

            <section className="relative">
                <div className="relative mx-auto grid w-full max-w-[1440px] min-w-0 grid-cols-1 items-center gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:px-12 xl:px-16">
                    <motion.div initial="hidden" animate="visible" variants={{
                        hidden: {}, visible: { transition: { staggerChildren: 0.12 }, },
                    }}
                        className="relative z-10">
                        <motion.div variants={fadeUp}></motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-[clamp(2.75rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.05em]"
                        >
                            Who
                            <br />
                            <span className="text-[#A054A0]">we are.</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mt-5 max-w-[510px] text-[15px] leading-7 text-black sm:mt-6 sm:text-lg sm:leading-8"
                        >
                            <span className="font-semibold italic text-[#A054A0]">
                                Anarock
                            </span>{" "}
                            is a leading international property consultant that delivers
                            comprehensive real estate services to a large and diversified
                            client base including developers, corporates, financial
                            institutions, government, and individuals.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="mt-7 border-t border-[#ded9df] pt-6 sm:mt-9 sm:pt-7"
                        >
                            <div className="space-y-5">
                                {highlights.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.emphasis}
                                            className="flex min-w-0 items-center gap-3 sm:gap-4"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5d9e5] bg-white text-[#A054A0] sm:h-11 sm:w-11">
                                                <Icon size={20} strokeWidth={1.6} />
                                            </div>

                                            <p className="min-w-0 text-sm leading-6 text-black sm:text-base">
                                                {item.prefix || ""}
                                                <strong className="font-bold text-[#A054A0]">
                                                    {item.emphasis}
                                                </strong>{" "}
                                                {item.text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75 }}
                        className="relative z-10"
                    >
                        <div className="pointer-events-none absolute -inset-1 border border-white border-t-black/75 border-r-black/75 sm:-inset-3" />

                        <div className="relative min-h-[280px] w-full overflow-hidden sm:min-h-[380px] md:min-h-[460px] lg:min-h-[540px]">
                            <Image
                                src="/services/OfficeMarket.avif"
                                alt="Anarock commercial office workspace"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-cover grayscale-[25%]"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-9">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                                    International property consultant
                                </p>
                                <h2 className="mt-3 max-w-md text-2xl font-medium leading-snug text-white sm:text-4xl">
                                    Comprehensive real estate services.
                                </h2>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Market statistics */}
            <section aria-label="Commercial real estate market statistics" className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="mx-auto w-full max-w-[1600px] min-w-0">
                    <div className="mb-6 px-1 sm:px-2 lg:px-4">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Commercial real estate at a glance
                        </h2>
                    </div>
                    <MarketStats />
                </div>
            </section>

            {/* Company statistics */}
            <section className="border-y border-[#eae6eb] bg-[#f8f7f8] px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-20 xl:px-16">
                <div className="mx-auto w-full max-w-[1280px] min-w-0">
                    <div className="mb-9">
                        <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            Our scale and reach.
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-px overflow-hidden border border-[#e9e4e9] bg-[#e9e4e9] sm:grid-cols-2 lg:grid-cols-4">
                        {companyStats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                variants={fadeUp}
                                className="flex min-h-[130px] min-w-0 flex-col justify-between bg-white p-4 sm:min-h-[160px] sm:p-6 lg:p-7"
                            >
                                <div>
                                    <p className="text-2xl font-semibold tracking-[-0.04em] text-[#A054A0] sm:text-4xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-black sm:text-sm sm:leading-6">
                                        {stat.label}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="relative min-h-[190px] overflow-hidden bg-[#e8e5e8] sm:min-h-[230px]">
                            <Image
                                src="/services/research/seat.webp"
                                alt="Commercial office workspace"
                                fill
                                priority
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover grayscale"
                            />
                        </div>

                        <div className="flex min-h-[190px] min-w-0 flex-col justify-center bg-white p-6 sm:min-h-[230px] sm:p-10">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                                Annual revenue
                            </p>
                            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#A054A0] sm:text-5xl">
                                $110 M
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex min-h-[190px] min-w-0 flex-col justify-center bg-white p-6 sm:min-h-[230px] sm:p-10">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                                Presence in
                            </p>
                            <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#A054A0] sm:text-3xl">
                                India, US, UK,
                                <br />
                                Middle East &amp; Singapore
                            </p>
                        </div>

                        <div className="relative min-h-[190px] overflow-hidden bg-[#e8e5e8] sm:min-h-[230px]">
                            <Image
                                src="/services/research/seat2.jpg"
                                alt="Commercial office workspace"
                                fill
                                priority
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover grayscale"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Company Journey */}
            <section aria-labelledby="company-journey-heading" className="relative isolate overflow-hidden bg-[#faf9fa] px-4 py-12 sm:px-6 sm:py-20 lg:px-10 lg:py-14">
                <div className="relative mx-auto max-w-[1600px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 mb-16 max-w-2xl sm:mb-20 lg:mb-10"
                    >
                        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                            From Foundation to {" "}
                            <span className=" text-[#A054A0]">Future</span>
                        </h2>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-black sm:text-base sm:leading-8">
                            A journey of expansion, innovation and new opportunities
                            shaping ANAROCK&apos;s evolution.
                        </p>
                    </motion.div>
                    <div className="relative hidden xl:block">
                        <div className="pointer-events-none absolute inset-x-[-7vw] bottom-[-75px] -z-10 h-[470px]"
                            style={{
                                backgroundImage: `
                        linear-gradient(to bottom,
                            rgba(250,249,250,0) 0%,
                            rgba(250,249,250,0.05) 25%,
                            rgba(250,249,250,0.35) 65%,
                            rgba(250,249,250,0.82) 100%
                        ),
                        url('/services/TimelineBG.png')
                    `,
                                backgroundSize: "cover",
                                backgroundPosition: "center top",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                        <div className="overflow-x-auto overflow-y-hidden pb-20 scrollbar-thin scrollbar-thumb-[#A054A0]/30 scrollbar-track-transparent">
                            <div className="grid min-w-[1550px] grid-cols-10 items-start">
                                {companyJourney.map((item, index) => {
                                    const lastIndex = companyJourney.length - 1;
                                    return (
                                        <motion.article
                                            key={item.year}
                                            initial={{ opacity: 0, y: 28 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.1 }}
                                            transition={{
                                                duration: 0.65,
                                                delay: index * 0.055,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            style={{
                                                paddingTop: `${(lastIndex - index) * 22}px`,
                                            }}
                                            className="group relative flex min-w-0 flex-col"
                                        >
                                            <div className="relative z-10 flex h-[58px] items-center justify-center overflow-hidden bg-[#A054A0] text-white transition-all duration-500 group-hover:bg-[#843D85] group-hover:shadow-[0_8px_22px_rgba(160,84,160,0.25)]"
                                                style={{
                                                    clipPath:
                                                        index === 0
                                                            ? "polygon(0 0, calc(100% - 17px) 0, 100% 50%, calc(100% - 17px) 100%, 0 100%)"
                                                            : index === lastIndex
                                                                ? "polygon(12px 0, calc(100% - 17px) 0, 100% 50%, calc(100% - 17px) 100%, 12px 100%, 0 50%)"
                                                                : "polygon(12px 0, calc(100% - 17px) 0, 100% 50%, calc(100% - 17px) 100%, 12px 100%, 0 50%)",
                                                    marginLeft: index === 0 ? 0 : "-1px",
                                                }}

                                            >
                                                <span className="relative z-10 text-lg font-semibold tracking-tight transition-transform duration-300 group-hover:scale-95">{item.year}</span>
                                            </div>

                                            <div className="group/card relative isolate flex min-h-[280px] flex-col bg-transparent px-3.5 pb-5 pt-5 transition-all duration-500 ease-out hover:-translate-y-1">
                                                <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-[#dcd5dd]/65 via-[#e5dfe6]/25 to-transparent transition-opacity duration-500 group-hover/card:opacity-70" />
                                                <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-px bg-gradient-to-b from-[#dcd5dd]/65 via-[#e5dfe6]/25 to-transparent transition-opacity duration-500 group-hover/card:opacity-70" />
                                                <p className="text-[12px] font-medium leading-[1.75] tracking-wide text-black">{item.detail}</p>
                                            </div>

                                        </motion.article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden md:block xl:hidden">
                        <div className="pointer-events-none absolute inset-x-[-25px] bottom-[-40px] -z-10 h-[400px] opacity-50" style={{
                            backgroundImage: `linear-gradient(to bottom, transparent, rgba(250,249,250,0.8)),url('/services/TimelineBG.png')`,
                            backgroundPosition: "center bottom",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                        }} />
                        <div className="overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-[#A054A0]/30">
                            <div className="flex min-w-[1050px] items-stretch gap-0">
                                {companyJourney.map((item, index) => (
                                    <motion.article
                                        key={item.year}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.045,
                                        }} className="group flex w-[220px] shrink-0 flex-col">
                                        <div className="relative flex h-[54px] items-center justify-center border-r border-white/20 bg-[#A054A0] text-white transition-colors duration-300 group-hover:bg-[#843D85]">
                                            <span className="text-lg font-semibold">
                                                {item.year}
                                            </span>
                                        </div>
                                        <div className="relative flex min-h-[220px] flex-1 flex-col border border-[#ebe5ec] bg-white/95 p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A054A0]">
                                                {item.heading}
                                            </span>
                                            <p className="mt-3 text-sm font-semibold leading-6 text-[#29242a]">
                                                {item.lead}
                                            </p>
                                            <p className="mt-2 text-xs leading-6 text-[#777078]">
                                                {item.detail}
                                            </p>
                                            <div className="mt-auto pt-4">
                                                <div className="h-px w-8 bg-[#d9c3da] transition-all duration-300 group-hover:w-full group-hover:bg-[#A054A0]" />
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="relative md:hidden">
                        <div className="pointer-events-none absolute inset-x-[-20px] bottom-[-40px] -z-10 h-[360px] opacity-50" style={{
                            backgroundImage: `linear-gradient(to bottom,rgba(250,249,250,0.05), rgba(250,249,250,0.8)),url('/services/TimelineBG.png')`,
                            backgroundPosition: "center bottom",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                        }} />
                        <div className="absolute bottom-5 left-[17px] top-3 w-px bg-gradient-to-b from-[#A054A0] via-[#A054A0]/40 to-transparent" />
                        <div className="space-y-6">
                            {companyJourney.map((item, index) => (
                                <motion.article
                                    key={item.year}
                                    initial={{ opacity: 0, x: -15 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.035,
                                    }} className="group relative flex items-start gap-4">
                                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-[#faf9fa] bg-[#A054A0] shadow-[0_0_0_1px_rgba(160,84,160,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_0_4px_rgba(160,84,160,0.12)]">
                                        <span className="text-[9px] font-bold text-white">{item.year.slice(2)}</span>
                                    </div>
                                    <div className="relative min-w-0 flex-1 border border-[#ebe5ec] border-l-[3px] border-l-[#A054A0] bg-white/95 p-4 shadow-[0_4px_15px_rgba(35,20,35,0.035)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_25px_rgba(35,20,35,0.08)] sm:p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A054A0]">{item.heading}</span>
                                            <span className="text-lg font-semibold tracking-tight text-[#A054A0]">{item.year}</span>
                                        </div>
                                        <div className="mb-3 mt-3 h-px w-8 bg-[#d9c3da] transition-all duration-300 group-hover:w-full group-hover:bg-[#A054A0]" />
                                        <p className="text-sm font-semibold leading-6 text-[#29242a]">{item.lead}</p>
                                        <p className="mt-2 text-xs leading-6 text-[#777078]">{item.detail}</p>
                                    </div>
                                </motion.article>))}
                        </div>
                    </div>
                </div>
            </section>



            {/* Global partners */}
            <section className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-20 xl:px-16">
                <div className="mx-auto grid w-full max-w-[1280px] min-w-0 grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-5 lg:gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                            A connected
                            <span className="block text-[#A054A0]">global network.</span>
                        </h2>
                    </div>
                    <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-3">
                        {partners.map((partner) => (
                            <div
                                key={partner.name}
                                className="flex h-[150px] items-center justify-center overflow-hidden rounded-sm border border-dashed border-slate-400 bg-white p-5 transition-all duration-300 hover:border-[#cda5c7] hover:shadow-sm sm:h-[170px]"
                            >
                                {partner.IMG && (
                                    <div className="flex h-[80px] w-[180px] items-center justify-center">
                                        <img
                                            src={partner.IMG}
                                            alt={partner.name}
                                            loading="lazy"
                                            className="max-h-full max-w-full object-contain"
                                            style={{
                                                transform: `scale(${partner.scale || 1})`,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section className="border-t border-[#eae6eb] bg-[#f8f7f8] px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-20 xl:px-16">
                <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-14 sm:mb-20">
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#A054A0]">
                            Executive Leadership
                        </span>
                        <h2 className="mt-2 text-3xl font-light tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                            The minds driving our vision.
                        </h2>
                    </div>

                    {/* Distinct Offset Rows Stack */}
                    <div className="space-y-12 sm:space-y-16">
                        {leaders.map((leader, index) => {
                            const isEven = index % 2 === 0;

                            return (
                                <motion.article
                                    key={leader.name}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{ duration: 0.5, delay: index * 0.08 }}
                                    className="group relative grid grid-cols-1 items-center overflow-hidden rounded-2xl border border-[#e9e3ea] bg-[#faf8fa]/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#d8c3d8] hover:bg-white hover:shadow-[0_16px_40px_rgba(40,25,43,0.06)] sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10"
                                >
                                    <div
                                        className={`relative flex h-[220px] w-full items-end justify-center overflow-hidden rounded-xl border border-slate-500/20 xs:h-[250px] sm:h-[280px] lg:col-span-5 lg:h-[320px] ${isEven ? "lg:order-1" : "lg:order-2"
                                            }`}
                                    >
                                        <Image
                                            src={leader.image}
                                            alt={leader.name}
                                            width={300}
                                            height={300}
                                            sizes="(max-width: 1023px) 100vw, 360px"
                                            className="relative z-10 h-[200px] w-full max-w-[260px] object-cover object-bottom transition-transform duration-500 group-hover:scale-105 sm:h-[240px] lg:h-[290px]"
                                        />
                                    </div>

                                    {/* Content Container */}
                                    <div
                                        className={`relative z-10 flex flex-col justify-center pt-6 lg:col-span-7 lg:pt-0 ${isEven ? "lg:order-2" : "lg:order-1"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold tracking-wider text-[#A054A0] uppercase">
                                                <a
                                                    href={`mailto:${leader.email}`}
                                                    aria-label={`Email ${leader.name}`}
                                                    className="transition-colors hover:text-[#7D397D]"
                                                >
                                                    {leader.role}
                                                </a>
                                            </span>

                                            <h3 className="text-2xl font-normal tracking-tight text-gray-900 sm:text-3xl">
                                                <a
                                                    href={leader.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`${leader.name} LinkedIn`}
                                                    className="transition-colors duration-200 hover:text-[#A054A0]"
                                                >
                                                    {leader.name}
                                                </a>
                                            </h3>
                                        </div>

                                        <div className="my-5 h-px w-12 bg-[#d8c3d8] transition-all duration-300 group-hover:w-full" />

                                        <p className="text-sm font-light leading-relaxed text-gray-600 sm:text-base sm:leading-7 [&_strong]:font-medium [&_strong]:text-[#A054A0]">
                                            {leader.description}
                                        </p>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>
        </main>
    );
}
