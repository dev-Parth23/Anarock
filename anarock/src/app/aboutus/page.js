"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    Award,
    Building2,
    Globe2,
    Rocket,
    Armchair,
    Mail,
    Link,
} from "lucide-react";
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

// const leaders2 = [
//     {
//         name: "Abbishek Sharma",
//         role: "Executive Director & Head of Operations",
//         image: "/services/leaders/Abbishek.avif",
//         linkedin: "https://in.linkedin.com/in/abbishek-sharma",
//         email: "Abbishek.Sharma@anarock.com",
//     },
//     {
//         name: "Surabhi Gupta",
//         role: "Executive Director, North India",
//         image: "/services/leaders/Surabhi.avif",
//         linkedin: "https://www.linkedin.com/in/surabhi-gupta-93a55212/",
//         email: "Surabhi.Gupta@anarock.com",
//     },
//     {
//         name: "Atul Khedkar",
//         role: "Regional Director, Mumbai",
//         image: "/services/leaders/Atul.avif",
//         linkedin: "https://www.linkedin.com/in/atul-khedkar-ba63658/",
//         email: "Atul.Khedkar@anarock.com",
//     },
//     {
//         name: "Pratik Mehta",
//         role: "Executive Director, Kolkata & Hyderabad",
//         image: "/services/leaders/Pratik.avif",
//         linkedin: "https://www.linkedin.com/in/pratik-mehta-78b76318/",
//         email: "Pratik.Mehta@anarock.com",
//     },
//     {
//         name: "Mazhar Mulani",
//         role: "Regional Director, Bangalore",
//         image: "/services/leaders/Mazhar.avif",
//         linkedin: "https://www.linkedin.com/in/mazharmulani/",
//         email: "Mazhar.Mulani@anarock.com",
//     },
//     {
//         name: "Kanchana Krishnan",
//         role: "Executive Director, Chennai",
//         image: "/services/leaders/Kanchana.avif",
//         linkedin: "https://in.linkedin.com/in/kanchana-krishnan-mrics",
//         email: "Kanchana.Krishnan@anarock.com",
//     },
// ];

const companyStats = [
    { value: "3000+", label: "Employees" },
    {
        value: "$100 B",
        label: "Transacted & Advised since June 2017",
    },
    { value: "30%", label: "YoY Growth" },
    { value: "15", label: "Offices across India" },
];

const partners = [
    { name: "BINSWANGER", IMG: "/services/research/binswanger.png" },
    { name: "HVS", IMG: "/services/research/hvs.png" },
    { name: "BROADENING", IMG: "/services/research/bway.png" },
    { name: "VINDICO", IMG: "/services/research/vindico.png" },
    { name: "myHQ", IMG: "/services/research/myhq.svg" },
    { name: "UPFLEX", IMG: "/services/research/upflex.png" },
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

function Eyebrow({ children }) {
    return (
        <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A054A0]">
            <span className="h-px w-7 bg-[#ad4b9e]" />
            {children}
        </div>
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

export default function AboutUsPage() {
    return (
        <main className="w-full min-w-0 overflow-x-clip text-black">
            {/* Introduction */}
            <Breadcrumbs
                items={[
                    {
                        label: "About us",
                        href: "/aboutus",
                    },
                ]}
            />

            <section className="relative">
                <div className="relative mx-auto grid w-full max-w-[1440px] min-w-0 grid-cols-1 items-center gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:px-12 xl:px-16">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0.12 },
                            },
                        }}
                        className="relative z-10"
                    >
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
                            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                                Our distinction
                            </p>

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
                                src="/services/Campuses.avif"
                                alt="Anarock commercial office workspace"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-cover grayscale-[25%]"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />

                            <div className="absolute left-5 top-5 inline-flex items-center gap-2 bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-black sm:left-7 sm:top-7">
                                <Globe2 size={15} className="text-[#A054A0]" />
                                Anarock
                            </div>

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
            <section
                aria-label="Commercial real estate market statistics"
                className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
            >
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
                                className="flex min-h-[110px] items-center justify-center rounded-sm border border-dashed border-slate-400 bg-white p-5 transition-all duration-300 hover:border-[#cda5c7] hover:shadow-sm sm:min-h-[125px]"
                            >
                                {partner.IMG && (
                                    <img
                                        src={partner.IMG}
                                        alt={partner.name}
                                        loading="lazy"
                                        className="max-h-[70px] max-w-full object-contain sm:max-h-[95px]"
                                    />
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
                                        className={`relative flex h-[220px] w-full items-end justify-center overflow-hidden rounded-xl bg-[#f2eaf2] xs:h-[250px] sm:h-[280px] lg:col-span-5 lg:h-[320px] ${isEven ? "lg:order-1" : "lg:order-2"
                                            }`}
                                    >
                                        <div className="absolute bottom-0 h-[140px] w-[140px] rounded-full bg-[#e4d1e2] transition-transform duration-500 group-hover:scale-110 sm:h-[180px] sm:w-[180px]" />

                                        <Image
                                            src={leader.image}
                                            alt={leader.name}
                                            width={300}
                                            height={300}
                                            sizes="(max-width: 1023px) 100vw, 360px"
                                            className="relative z-10 h-[200px] w-full max-w-[260px] object-contain object-bottom transition-transform duration-500 group-hover:scale-105 sm:h-[240px] lg:h-[290px]"
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


                {/* <div className="mx-auto mt-14 grid w-full max-w-[1280px] grid-cols-1 gap-x-8 gap-y-5 sm:mt-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-3 lg:gap-x-10">
                    {leaders2.map((leader) => (
                        <article
                            key={leader.name}
                            className="group flex min-w-0 items-center gap-4 border-b border-[#EADBEA]/80 px-1 pb-5 transition-colors duration-300 hover:border-[#A054A0]/50 sm:pb-6"
                        >
                            <div className="relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-full border border-[#EADBEA] bg-white p-0.5  duration-300 group-hover:border-[#A054A0]/50 group-hover:scale-105 sm:h-[70px] sm:w-[70px]">
                                <LocalImage
                                    src={leader.image}
                                    alt={leader.name}
                                    className="h-full w-full rounded-full bg-[#F5F0F5]"
                                    sizes="70px"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center justify-between gap-2">
                                    <h3 className="min-w-0 break-words text-sm font-semibold leading-5 tracking-[-0.01em] text-black transition-colors duration-300 group-hover:text-[#A054A0] group-hover:scale-105 sm:text-[18px]">
                                        {leader.name}
                                    </h3>

                                    <div className="flex shrink-0 items-center gap-1">
                                        <a
                                            href={leader.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`${leader.name} LinkedIn`}
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#A054A0] transition-all duration-200 hover:bg-[#F3EAF3] hover:text-[#7D397D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A054A0]"
                                        >
                                            <ArrowUpRight size={16} strokeWidth={1.7} />
                                        </a>

                                        <a
                                            href={`mailto:${leader.email}`}
                                            aria-label={`Email ${leader.name}`}
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#A054A0] transition-all duration-200 hover:bg-[#F3EAF3] hover:text-[#7D397D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A054A0]"
                                        >
                                            <Mail size={15} strokeWidth={1.7} />
                                        </a>
                                    </div>
                                </div>

                                <p className="break-words text-xs leading-5 text-black/80 sm:text-[13px]">
                                    {leader.role}
                                </p>
                            </div>
                        </article>
                    ))}
                </div> */}
            </section>
        </main>
    );
}
