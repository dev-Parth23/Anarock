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
const leaders2 = [
    {
        name: "Abbishek Sharma",
        role: "Executive Director & Head of Operations",
        image: "/services/leaders/Abbishek.avif",
        linkedin: "https://in.linkedin.com/in/abbishek-sharma",
        email: "Abbishek.Sharma@anarock.com",
    },
    {
        name: "Surabhi Gupta",
        role: "Executive Director, North India",
        image: "/services/leaders/Surabhi.avif",
        linkedin: "https://www.linkedin.com/in/surabhi-gupta-93a55212/",
        email: "Surabhi.Gupta@anarock.com",
    },
    {
        name: "Atul Khedkar",
        role: "Regional Director, Mumbai",
        image: "/services/leaders/Atul.avif",
        linkedin: "https://www.linkedin.com/in/atul-khedkar-ba63658/",
        email: "Atul.Khedkar@anarock.com",
    },
    {
        name: "Pratik Mehta",
        role: "Executive Director, Kolkata & Hyderabad",
        image: "/services/leaders/Pratik.avif",
        linkedin: "https://www.linkedin.com/in/pratik-mehta-78b76318/",
        email: "Pratik.Mehta@anarock.com",
    },
    {
        name: "Mazhar Mulani",
        role: "Regional Director, Bangalore",
        image: "/services/leaders/Mazhar.avif",
        linkedin: "https://www.linkedin.com/in/mazharmulani/",
        email: "Mazhar.Mulani@anarock.com",
    },
    {
        name: "Kanchana Krishnan",
        role: "Executive Director, Chennai",
        image: "/services/leaders/Kanchana.avif",
        linkedin: "https://in.linkedin.com/in/kanchana-krishnan-mrics",
        email: "Kanchana.Krishnan@anarock.com",
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
        <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ad4b9e]">
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
        <main className="overflow-hidden bg-white text-[#202027]">
            {/* Introduction */}
            <section className="relative border-b border-[#eae7eb] bg-[#f8f7f8]">
                <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[#f0edf1] lg:block" />

                <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-16 lg:py-24">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.12 } },
                        }}
                        className="relative z-10"
                    >
                        <motion.div variants={fadeUp}>
                            <Eyebrow>About Anarock</Eyebrow>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-[72px]"
                        >
                            Who
                            <br />
                            <span className="text-[#ad4b9e]">we are.</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mt-7 max-w-[510px] text-base leading-8 text-[#6f6b72] sm:text-lg"
                        >
                            <span className="font-semibold italic text-[#ad4b9e]">
                                Anarock
                            </span>{" "}
                            is a leading international property consultant that delivers
                            comprehensive real estate services to a large and diversified
                            client base including developers, corporates, financial
                            institutions, government, and individuals.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="mt-9 border-t border-[#ded9df] pt-7"
                        >
                            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b848d]">
                                Our distinction
                            </p>

                            <div className="space-y-5">
                                {highlights.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.emphasis}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e5d9e5] bg-white text-[#974597]">
                                                <Icon size={20} strokeWidth={1.6} />
                                            </div>

                                            <p className="text-sm leading-6 text-black sm:text-base">
                                                {item.prefix || ""}
                                                <strong className="font-bold text-[#974597]">
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
                        <div className="absolute -inset-3 border border-white" />

                        <div className="relative min-h-[320px] overflow-hidden bg-[#e9e5e922] sm:min-h-[460px] lg:min-h-[540px]">
                            <Image
                                src="/services/Campuses.avif"
                                alt="Anarock commercial office workspace"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-cover grayscale-[25%]"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />

                            <div className="absolute left-5 top-5 inline-flex items-center gap-2 bg-white/95 px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-[#38303a] sm:left-7 sm:top-7">
                                <Globe2 size={15} className="text-[#ad4b9e]" />
                                Anarock
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-9">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
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

            {/* MarketStats: dedicated full-width section */}
            <section
                aria-label="Commercial real estate market statistics"
                className="bg-white px-0 py-8 sm:py-12"
            >
                <div className="mx-auto w-full max-w-[1600px]">
                    <div className="mb-6 px-5 sm:px-8 lg:px-12">
                        <Eyebrow>Market overview</Eyebrow>
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Commercial real estate at a glance
                        </h2>
                    </div>
                    <MarketStats />
                </div>
            </section>

            {/* Company statistics */}
            <section className="border-y border-[#eae6eb] bg-[#f8f7f8] px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-9">
                        <Eyebrow>ANAROCK in numbers</Eyebrow>
                        <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            Our scale and reach.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-px overflow-hidden border border-[#e9e4e9] bg-[#e9e4e9] sm:grid-cols-2 lg:grid-cols-4">
                        {companyStats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                variants={fadeUp}
                                className="flex min-h-[160px] flex-col justify-between bg-white p-6 sm:p-7"
                            >
                                <div>
                                    <p className="text-3xl font-semibold tracking-[-0.04em] text-[#ad4b9e] sm:text-4xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-black">
                                        {stat.label}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="relative min-h-[230px] overflow-hidden bg-[#e8e5e8]">
                            <Image
                                src="/services/research/seat.webp"
                                alt="Commercial office workspace"
                                fill
                                priority
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover grayscale"
                            />
                        </div>

                        <div className="flex min-h-[230px] flex-col justify-center bg-white p-8 sm:p-10">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                                Annual revenue
                            </p>
                            <p className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-[#ad4b9e]">
                                $110 M
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="flex min-h-[230px] flex-col justify-center bg-white p-8 sm:p-10">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                                Presence in
                            </p>
                            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#ad4b9e]">
                                India, US, UK,
                                <br />
                                Middle East &amp; Singapore
                            </p>
                        </div>
                        <div className="relative min-h-[230px] overflow-hidden bg-[#e8e5e8]">
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
            <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-16">
                <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-12">
                    {" "}
                    <div className="lg:col-span-2">
                        <Eyebrow>Global partners</Eyebrow>
                        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                            A connected
                            <span className="block text-[#ad4b9e]">global network.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-3">
                        {partners.map((partner) => (
                            <div
                                key={partner.name}
                                className="flex min-h-[110px] items-center justify-center rounded-sm border border-[#eae5eb] bg-white p-5 transition-all duration-300 hover:border-[#cda5c7] hover:shadow-sm sm:min-h-[125px]"
                            >
                                {partner.IMG && (
                                    <img
                                        src={partner.IMG}
                                        alt={partner.name}
                                        loading="lazy"
                                        className="max-h-[95px] max-w-full object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section className="border-t border-[#eae6eb] bg-[#f8f7f8] px-5 py-16 sm:px-8 sm:py-20 lg:px-16">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-10">
                        <Eyebrow>Leadership</Eyebrow>
                        <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            Our Leaders
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {leaders.map((leader, index) => (
                            <motion.article
                                key={leader.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="group overflow-hidden border border-[#e9e3ea] bg-white transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(40,25,43,0.07)]"
                            >
                                <div className="relative flex h-[270px] items-end justify-center overflow-hidden bg-[#f3edf3]">
                                    <div className="absolute bottom-0 h-[205px] w-[205px] rounded-full bg-[#ead9e8]" />

                                    <Image
                                        src={leader.image}
                                        alt={leader.name}
                                        width={300}
                                        height={300}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="relative z-10 h-[255px] w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>

                                <div className="p-6 sm:p-7">
                                    <h3 className="text-xl font-semibold tracking-tight text-black">
                                        <a
                                            href={`${leader.linkedin}`}
                                            aria-label={`${leader.name} LinkedIn`}
                                            className="hover:text-[#7D397D]"
                                        >
                                            {leader.name}
                                        </a>
                                    </h3>

                                    <p className="mt-1 min-h-[38px] text-sm leading-5 text-[#974597]">

                                        <a
                                            href={`mailto:${leader.email}`}
                                            aria-label={`Email ${leader.name}`}
                                            className="hover:text-[#7D397D]"
                                        >
                                            {leader.role}
                                        </a>
                                    </p>

                                    <div className="my-5 h-px bg-[#ece6ed]" />

                                    <p className="text-sm leading-6 text-black [&_strong]:font-semibold [&_strong]:text-[#974597]">
                                        {leader.description}
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 pt-20">
                    {leaders2.map((leader) => (
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
                                        href={`${leader.linkedin}`}
                                        aria-label={`${leader.name} LinkedIn`}
                                        className="hover:text-[#7D397D]"
                                    >
                                        <ArrowUpRight size={15} />{" "}
                                    </a>
                                    <a
                                        href={`mailto:${leader.email}`}
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
            </section>
        </main>
    );
}
