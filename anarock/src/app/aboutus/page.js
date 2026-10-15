
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Compass,
    Heart,
    Layers3,
    MapPin,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    Users,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: "easeOut" },
    },
};

const reveal = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const values = [
    {
        number: "01",
        icon: Compass,
        title: "Clarity in every choice",
        description:
            "Finding the right commercial space should feel straightforward. We bring relevant property information together to help you explore your options with confidence.",
    },
    {
        number: "02",
        icon: ShieldCheck,
        title: "Transparency first",
        description:
            "From property details to location and pricing information, we aim to make comparisons easier and your search more informed.",
    },
    {
        number: "03",
        icon: Target,
        title: "Built around your needs",
        description:
            "Whether you need a conventional office or a flexible coworking space, discover options that align with your business requirements.",
    },
];

const features = [
    {
        icon: Search,
        title: "Discover",
        description:
            "Explore commercial properties with intuitive search and relevant filters.",
    },
    {
        icon: Layers3,
        title: "Compare",
        description:
            "Evaluate shortlisted properties side by side before making your decision.",
    },
    {
        icon: Heart,
        title: "Shortlist",
        description:
            "Keep your preferred spaces together and revisit the options that matter.",
    },
];

export default function AboutUsPage() {
    return (
        <main className="overflow-hidden bg-white text-[#21152f]">
            {/* HERO */}
            <section className="relative isolate">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(222,91,185,0.12),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(119,82,210,0.12),transparent_42%)]" />

                <div className="absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(#39234f_1px,transparent_1px),linear-gradient(90deg,#39234f_1px,transparent_1px)] [background-size:48px_48px]" />

                <div className="mx-auto grid min-h-[660px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-16 lg:py-24">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={reveal}
                        className="relative z-10"
                    >
                        <motion.div
                            variants={fadeUp}
                            className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e9d7f1] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8550a6] shadow-sm"
                        >
                            <Sparkles size={14} />
                            About ANAROCK
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="max-w-2xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-[76px]"
                        >
                            Space for your
                            <span className="mt-2 block bg-gradient-to-r from-[#d34caa] via-[#a34dc4] to-[#7752d2] bg-clip-text pb-2 text-transparent">
                                next big move.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mt-7 max-w-xl text-base leading-8 text-[#72677e] sm:text-lg"
                        >
                            Every great business needs the right space to grow. We make
                            discovering, evaluating, and shortlisting commercial real estate
                            a more intuitive experience.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="mt-9 flex flex-wrap gap-4"
                        >
                            <Link
                                href="/properties"
                                className="group inline-flex items-center gap-3 rounded-xl bg-[#281637] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(40,22,55,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#47245e]"
                            >
                                Explore properties
                                <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </Link>

                            <Link
                                href="/shortlist"
                                className="inline-flex items-center gap-2 rounded-xl border border-[#e7dbea] bg-white/80 px-6 py-4 text-sm font-semibold text-[#39234f] transition-all hover:border-[#c77ed0] hover:bg-[#fcf6ff]"
                            >
                                <Heart size={17} />
                                Your shortlist
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-[#eadff0] pt-6"
                        >
                            <div className="flex items-center gap-2 text-sm text-[#71667c]">
                                <Building2 size={17} className="text-[#bb56b0]" />
                                Commercial spaces
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#71667c]">
                                <MapPin size={17} className="text-[#bb56b0]" />
                                Multiple locations
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* HERO IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.85, ease: "easeOut", delay: 0.15 }}
                        className="relative mx-auto w-full max-w-[620px] lg:ml-auto"
                    >
                        <div className="absolute -right-5 -top-5 h-36 w-36 rounded-full bg-[#eac5ec]/50 blur-3xl" />
                        <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-[#cbb8f6]/50 blur-3xl" />

                        <div className="relative rounded-[28px] border border-white/80 bg-white/70 p-3 shadow-[0_35px_100px_rgba(75,43,94,0.17)] backdrop-blur-sm sm:p-4">
                            <div className="relative h-[380px] overflow-hidden rounded-[21px] sm:h-[490px]">
                                <img
                                    src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85"
                                    alt="Contemporary commercial office interior"
                                    className="h-full w-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#20102f]/65 via-transparent to-[#20102f]/10" />

                                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-xl sm:left-7 sm:top-7">
                                    <span className="h-2 w-2 rounded-full bg-[#f4b3e7]" />
                                    A better way to find your space
                                </div>

                                <div className="absolute bottom-6 left-5 right-5 text-white sm:bottom-8 sm:left-8 sm:right-8">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                                        Your next chapter starts here
                                    </p>
                                    <h2 className="max-w-md text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                                        Find a space that moves you forward.
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            animate={{ y: [0, -7, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -bottom-6 left-2 flex items-center gap-3 rounded-2xl border border-[#eee1f3] bg-white p-4 shadow-[0_15px_45px_rgba(52,28,71,0.12)] sm:-left-8 sm:bottom-10 sm:p-5"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#f6d9f0] to-[#e5d9ff] text-[#8242a1]">
                                <Building2 size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#281637]">
                                    Your space. Your way.
                                </p>
                                <p className="mt-1 text-xs text-[#82748c]">
                                    Search · Compare · Shortlist
                                </p>
                            </div>
                        </motion.div>

                        <div className="absolute -right-3 top-24 -z-10 h-24 w-24 rounded-full border border-[#d9b9e8] sm:-right-8 sm:h-32 sm:w-32" />
                    </motion.div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#e5d4ed] to-transparent" />
            </section>

            {/* INTRODUCTION */}
            <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-16">
                <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                        variants={reveal}
                    >
                        <motion.p
                            variants={fadeUp}
                            className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b04da8]"
                        >
                            <span className="h-px w-7 bg-[#b04da8]" />
                            Who we are
                        </motion.p>

                        <motion.h2
                            variants={fadeUp}
                            className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
                        >
                            Real estate discovery,
                            <span className="block text-[#a24bb7]">reimagined.</span>
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                        variants={reveal}
                        className="lg:pt-10"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="text-lg leading-9 text-[#74687e]"
                        >
                            Choosing a commercial property is more than finding four walls.
                            It is about finding a location that supports your people,
                            reflects your ambitions, and fits the way your business works.
                        </motion.p>

                        <motion.p
                            variants={fadeUp}
                            className="mt-5 text-base leading-8 text-[#74687e]"
                        >
                            ANAROCK brings a more organised approach to exploring commercial
                            real estate. Our platform helps you discover office spaces,
                            explore coworking options, evaluate property details, and narrow
                            your choices in one convenient place.
                        </motion.p>

                        <motion.div variants={fadeUp} className="mt-8">
                            <Link
                                href="/properties"
                                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#9b43a9] transition-colors hover:text-[#6e369d]"
                            >
                                Discover your possibilities
                                <ArrowUpRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                                />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* WHAT MAKES THE EXPERIENCE DIFFERENT */}
            <section className="relative bg-[#faf7fc] px-5 py-20 sm:px-8 sm:py-28 lg:px-16">
                <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#55326c_1px,transparent_1px),linear-gradient(90deg,#55326c_1px,transparent_1px)] [background-size:56px_56px]" />

                <div className="relative mx-auto max-w-[1280px]">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={reveal}
                        className="mx-auto max-w-2xl text-center"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#ad4db0]"
                        >
                            The ANAROCK experience
                        </motion.p>

                        <motion.h2
                            variants={fadeUp}
                            className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
                        >
                            Less searching blindly.
                            <span className="mt-2 block text-[#a14bb8]">
                                More finding your fit.
                            </span>
                        </motion.h2>

                        <motion.p
                            variants={fadeUp}
                            className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#796d84]"
                        >
                            Thoughtful tools and a streamlined browsing experience help you
                            move from a long list of options to a more focused decision.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        variants={reveal}
                        className="mt-14 grid gap-5 md:grid-cols-3"
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <motion.article
                                    key={feature.title}
                                    variants={fadeUp}
                                    whileHover={{ y: -7 }}
                                    className="group rounded-[24px] border border-[#eee3f2] bg-white p-7 shadow-[0_8px_30px_rgba(54,30,72,0.035)] transition-shadow duration-300 hover:shadow-[0_20px_55px_rgba(93,53,113,0.10)] sm:p-9"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8e5f3] to-[#eee5ff] text-[#9c47b3] transition-transform duration-300 group-hover:scale-110">
                                            <Icon size={25} strokeWidth={1.7} />
                                        </div>
                                        <span className="text-sm font-medium text-[#c8b5d2]">
                                            0{index + 1}
                                        </span>
                                    </div>

                                    <h3 className="mt-8 text-xl font-semibold tracking-tight text-[#30213d]">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-4 text-sm leading-7 text-[#7d7187]">
                                        {feature.description}
                                    </p>

                                    <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#a24bb3]">
                                        Built for better decisions
                                        <ArrowRight
                                            size={14}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </div>
                                </motion.article>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* OUR APPROACH */}
            <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-16">
                <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7 }}
                        className="relative"
                    >
                        <div className="absolute -left-4 -top-4 h-28 w-28 rounded-full bg-[#f0d8f1] blur-3xl" />

                        <div className="relative overflow-hidden rounded-[26px]">
                            <img
                                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85"
                                alt="Bright modern office with collaborative workspaces"
                                className="h-[360px] w-full object-cover sm:h-[480px]"
                                loading="lazy"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#281637]/50 via-transparent to-transparent" />

                            <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-9 sm:left-9">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                                    Built around possibilities
                                </p>
                                <p className="mt-3 max-w-sm text-2xl font-medium leading-snug sm:text-3xl">
                                    Every business deserves a space to thrive.
                                </p>
                            </div>
                        </div>

                        <div className="absolute -bottom-5 -right-3 -z-10 h-36 w-36 rounded-full border border-[#d9b9e8] sm:-right-5 sm:h-44 sm:w-44" />
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={reveal}
                    >
                        <motion.p
                            variants={fadeUp}
                            className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b04da8]"
                        >
                            <span className="h-px w-7 bg-[#b04da8]" />
                            Our approach
                        </motion.p>

                        <motion.h2
                            variants={fadeUp}
                            className="text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl"
                        >
                            A smarter journey from
                            <span className="block text-[#a24bb7]">search to space.</span>
                        </motion.h2>

                        <motion.p
                            variants={fadeUp}
                            className="mt-6 text-base leading-8 text-[#796d84]"
                        >
                            We believe the property discovery process should work around
                            your requirements, not the other way around. That means making
                            it easier to explore different possibilities, organise your
                            preferences, and take the next step when you are ready.
                        </motion.p>

                        <div className="mt-8 space-y-5">
                            {[
                                "Explore conventional offices and coworking spaces.",
                                "Narrow down options using relevant property details.",
                                "Compare your preferred spaces in one place.",
                                "Move forward with a clearer understanding of your choices.",
                            ].map((item) => (
                                <motion.div
                                    variants={fadeUp}
                                    key={item}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle2
                                        size={21}
                                        className="mt-0.5 shrink-0 text-[#ae50b7]"
                                    />
                                    <p className="text-sm leading-7 text-[#675a73]">{item}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div variants={fadeUp} className="mt-9">
                            <Link
                                href="/properties"
                                className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#ad4cba] to-[#8050d3] px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(145,72,183,0.22)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(145,72,183,0.30)]"
                            >
                                Start exploring
                                <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* OUR VALUES */}
            <section className="border-y border-[#eee3f2] bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-16">
                <div className="mx-auto max-w-[1280px]">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={reveal}
                        className="mb-12 max-w-2xl"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#ad4db0]"
                        >
                            What guides us
                        </motion.p>

                        <motion.h2
                            variants={fadeUp}
                            className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
                        >
                            Principles behind
                            <span className="block text-[#a14bb8]">every experience.</span>
                        </motion.h2>
                    </motion.div>

                    <div className="grid gap-0 md:grid-cols-3">
                        {values.map((value, index) => {
                            const Icon = value.icon;

                            return (
                                <motion.article
                                    key={value.number}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.2 }}
                                    variants={fadeUp}
                                    className={`py-8 md:px-7 md:py-5 ${index !== 0
                                            ? "border-t border-[#eee3f2] md:border-l md:border-t-0"
                                            : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <Icon size={25} strokeWidth={1.6} className="text-[#ae50b7]" />
                                        <span className="text-sm font-medium text-[#c5b2d1]">
                                            {value.number}
                                        </span>
                                    </div>

                                    <h3 className="mt-7 text-xl font-semibold tracking-tight">
                                        {value.title}
                                    </h3>

                                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#796d84]">
                                        {value.description}
                                    </p>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CLOSING CTA */}
            <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7 }}
                    className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[30px] bg-[#281637] px-6 py-14 text-center sm:px-12 sm:py-20 lg:px-20"
                >
                    <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-[#c44fb3]/30 blur-[85px]" />
                    <div className="absolute -bottom-40 -right-12 h-80 w-80 rounded-full bg-[#8150d6]/35 blur-[90px]" />

                    <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />

                    <div className="relative mx-auto max-w-3xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#efb7e7]">
                            <Building2 size={27} />
                        </div>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#e3b2e8]">
                            The next move is yours
                        </p>

                        <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                            Your next space.
                            <span className="block bg-gradient-to-r from-[#f0b9e8] to-[#c8b2ff] bg-clip-text text-transparent">
                                Your next chapter.
                            </span>
                        </h2>

                        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/65">
                            Discover spaces that match your ambitions and take the next step
                            toward finding the right environment for your business.
                        </p>

                        <div className="mt-9 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/properties"
                                className="group inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-[#281637] transition-all hover:-translate-y-1 hover:bg-[#f8e9fa]"
                            >
                                Find your space
                                <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </Link>

                            <Link
                                href="/shortlist"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10"
                            >
                                <Heart size={17} />
                                View shortlist
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-white/45">
                            <ArrowDownRight size={15} />
                            A more thoughtful way to find commercial real estate
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
