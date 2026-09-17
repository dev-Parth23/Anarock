// "use client";
// import HeroSection from "@/components/home/HeroSection";

// import MarketStats from "@/components/home/MarketStats";
// import Link from "next/link";
// import {
//   Users,
//   Sparkles,
//   BarChart3,
//   Handshake,
//   Leaf,
//   Brain,
//   ArrowRight,
//   Search,
//   Compass,
//   Scale,
//   CheckCircle2,
//   X,
// } from "lucide-react";
// import Navbar from "@/components/layout/Navbar";

// // export const metadata = {
// //   title: "Anarock - AI-Powered Commercial Real Estate in India",
// //   description:
// //     "Find premium office spaces, coworking environments and commercial properties across Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad. AI search + expert advisory.",
// //   alternates: { canonical: "/" },
// // };

// const popularCities = [
//   {
//     name: "Gurugram",
//     url: "https://i.redd.it/xod5eka58r1f1.jpeg",
//   },
//   {
//     name: "Pune",
//     url: "https://images.unsplash.com/photo-1638205022792-85c33651ae2c?w=800&q=80",
//   },
//   {
//     name: "Delhi",
//     url: "https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg",
//   },
//   {
//     name: "Bengaluru",
//     url: "https://static.toiimg.com/photo/62507296/.jpg",
//   },
//   {
//     name: "Mumbai",
//     url: "https://cdn.getyourguide.com/image/format=auto%2Cfit=crop%2Cgravity=auto%2Cquality=60%2Cwidth=400%2Cheight=265%2Cdpr=2/tour_img/f26d681a32ddcd849cb30d5c7334d51bbcc4763cac1d1a8c313cea88436e8d28.png",
//   },
//   {
//     name: "Hyderabad",
//     url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWKsgqLEdw_YIERfsuq0p1kpVUOJVCUeoLTgnvYz-gq-BXQcZg30sbqjE&s=10",
//   },
//   {
//     name: "Chennai",
//     url: "https://www.pelago.com/img/collections/chennai/0527-0937_chennai.jpg",
//   },
//   {
//     name: "Noida",
//     url: "https://static.startuptalky.com/2026/06/noida-airport-clears-final-flight-trial-Startuptalky.jpg",
//   },
//   {
//     name: "Kolkata",
//     url: "https://s7ap1.scene7.com/is/image/incredibleindia/howrah-bridge-howrah-west-bengal-city-1-hero?qlt=82&ts=1742154305591",
//   },
//   {
//     name: "Ahmedabad",
//     url: "https://www.kiomoi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fkmadmin%2Fimage%2Fupload%2Fc_scale%2Cw_1248%2Ff_auto%2Fv1560260650%2Fkiomoi%2FAhmedabad%2Fkankaria%20Lake%20%20(1).webp&w=3840&q=75",
//   },
// ];

// const whyItems = [
//   {
//     icon: Users,
//     title: "Client-Centric",
//     desc: "Tailored advisory built around your unique business needs.",
//   },
//   {
//     icon: Sparkles,
//     title: "AI-Enabled",
//     desc: "Smart search that understands your intent, not just keywords.",
//   },
//   {
//     icon: BarChart3,
//     title: "Data-Driven",
//     desc: "Decisions backed by market intelligence and analytics.",
//   },
//   {
//     icon: Handshake,
//     title: "Transaction Expertise",
//     desc: "End-to-end deal execution with commercial clarity.",
//   },
//   {
//     icon: Leaf,
//     title: "Sustainability-Focused",
//     desc: "Green-certified buildings and ESG-aligned choices.",
//   },
//   {
//     icon: Brain,
//     title: "Market Intelligence",
//     desc: "Real-time insights across 850M+ sq.ft of commercial stock.",
//   },
// ];

// const journey = [
//   {
//     icon: Compass,
//     title: "Define",
//     desc: "Outline your property requirements across location, space, budget and key business priorities.",
//   },
//   {
//     icon: Search,
//     title: "Discover",
//     desc: "Explore relevant property options aligned with your defined requirements and search criteria.",
//   },
//   {
//     icon: Scale,
//     title: "Evaluate",
//     desc: "Shortlist suitable options and engage with our experts to assess fit, commercials and negotiate optimal terms.",
//   },
//   {
//     icon: CheckCircle2,
//     title: "Decide",
//     desc: "Select the right property with confidence, supported by informed evaluation and commercial clarity.",
//   },
// ];

// export default function HomePage() {
//   return (
//     <div className="bg-white text-slate-800 selection:bg-[#A054A0] selection:text-white relative overflow-hidden">
//       <Navbar />
//       <HeroSection />
//       <section
//         className="py-20 bg-slate-50/50 relative border-t border-slate-100"
//         id="market-glance"
//       >
//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-[#A054A0] to-[#7a377a] bg-clip-text text-transparent">
//               Market at a Glance
//             </h2>
//             <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-base md:text-lg">
//               The trusted partner for India&apos;s most ambitious enterprises.
//             </p>
//           </div>

//           <MarketStats />
//         </div>
//       </section>
//       <section className="py-20 relative bg-white" id="whychoose">
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#A054A0]/10 via-amber-200/20 to-purple-100/30 blur-[130px] rounded-full pointer-events-none" />

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-[#A054A0] to-slate-900 bg-clip-text text-transparent">
//               Why Choose Anarock
//             </h2>
//             <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-base md:text-lg">
//               The trusted partner for India&apos;s most ambitious enterprises.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//             {whyItems.map((w) => (
//               <div
//                 key={w.title}
//                 className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md hover:border-[#A054A0]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(160,84,160,0.12)]"
//               >
//                 <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#A054A0]/5 via-amber-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

//                 <div className="h-14 w-14 rounded-xl bg-[#A054A0]/10 border border-[#A054A0]/20 flex items-center justify-center mb-4 text-[#A054A0] group-hover:bg-[#A054A0] group-hover:text-white transition-all duration-300 shadow-sm">
//                   <w.icon className="h-6 w-6" />
//                 </div>

//                 <h3 className="font-semibold text-slate-900 text-base mb-2 group-hover:text-[#A054A0] transition-colors">
//                   {w.title}
//                 </h3>

//                 <p className="text-xs text-slate-500 leading-relaxed">
//                   {w.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//       {/* ================= CLIENT JOURNEY SECTION ================= */}
//       <section className="relative py-24 md:py-28 bg-[#FCFBFF] overflow-hidden">
//         <div
//           className="absolute inset-0 opacity-[0.035]"
//           style={{
//             backgroundImage:
//               "linear-gradient(#A054A0 1px, transparent 1px), linear-gradient(90deg, #A054A0 1px, transparent 1px)",
//             backgroundSize: "48px 48px",
//           }}
//         />

//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#A054A0]/10 blur-[140px] pointer-events-none" />
//         <div className="absolute -left-32 top-1/3 w-72 h-72 rounded-full bg-purple-200/20 blur-[100px]" />
//         <div className="absolute -right-32 bottom-1/4 w-72 h-72 rounded-full bg-fuchsia-200/20 blur-[100px]" />

//         <div className="container mx-auto px-4 relative z-10">
//           {" "}
//           <div className="text-center mb-16 md:mb-20">
//             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A054A0]/[0.07] border border-[#A054A0]/15 text-[#A054A0] text-[11px] md:text-xs font-semibold tracking-[0.22em] uppercase">
//               <span className="w-1.5 h-1.5 rounded-full bg-[#A054A0] animate-pulse" />
//               OUR PROCESS
//             </span>

//             <h2 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
//               The Client{" "}
//               <span className="bg-gradient-to-r from-[#A054A0] via-[#b14db1] to-[#7a377a] bg-clip-text text-transparent">
//                 Journey
//               </span>
//             </h2>

//             <p className="mt-5 max-w-2xl mx-auto text-slate-500 text-base md:text-lg leading-relaxed">
//               A seamless, insight-led process to help you find, evaluate, and
//               secure the right commercial space.
//             </p>
//           </div>
//           <div className="relative">
//             <div className="hidden lg:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 items-center pointer-events-none">
//               <div className="w-full h-px bg-gradient-to-r from-transparent via-[#A054A0]/20 to-transparent" />
//               <div className="absolute left-0 w-24 h-px bg-gradient-to-r from-transparent via-[#A054A0] to-transparent animate-[journeyLine_4s_linear_infinite]" />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 items-center">
//               {journey.map((j, i) => (
//                 <div
//                   key={j.title}
//                   className="journey-card group relative h-[400px] lg:h-[390px] rounded-[28px] border border-slate-200/80 bg-white/85 backdrop-blur-xl overflow-hidden cursor-pointer transition-[flex,transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:border-[#A054A0]/30 hover:shadow-[0_30px_70px_rgba(160,84,160,0.14)]"
//                 >
//                   <div className="absolute inset-0 pointer-events-none">
//                     <div
//                       className={`journey-orb absolute rounded-full bg-[#A054A0]/[0.07] blur-[1px] transition-all duration-700 ease-out
//                   ${
//                     i === 0
//                       ? "w-36 h-36 left-1/2 top-[24%] -translate-x-1/2"
//                       : i === 1
//                         ? "w-40 h-40 left-1/2 top-[20%] -translate-x-1/2"
//                         : i === 2
//                           ? "w-36 h-36 left-1/2 top-[24%] -translate-x-1/2"
//                           : "w-36 h-36 left-1/2 top-[24%] -translate-x-1/2"
//                   }
//                   group-hover:scale-[1.35]
//                   group-hover:bg-[#A054A0]/[0.12]"`}
//                     />
//                     <div className="absolute left-1/2 top-[29%] -translate-x-1/2 -translate-y-1/2 w-32 h-32">
//                       {[0, 60, 120, 180, 240, 300].map((angle) => (
//                         <span
//                           key={angle}
//                           className="absolute left-1/2 top-1/2 w-14 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A054A0]/[0.055] border border-[#A054A0]/[0.04] transition-all duration-700 group-hover:bg-[#A054A0]/[0.09]"
//                           style={{
//                             transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-26px)`,
//                           }}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   <div className="absolute top-7 left-7 z-10">
//                     <span className="text-5xl md:text-6xl font-light tracking-tight text-slate-200 group-hover:text-[#A054A0]/30 transition-colors duration-500">
//                       0{i + 1}
//                       <span className="text-[#A054A0]/20">.</span>
//                     </span>
//                   </div>

//                   <div className="absolute top-[27%] left-1/2 -translate-x-1/2 z-20">
//                     <div className="relative">
//                       <div className="absolute inset-0 rounded-full bg-[#A054A0]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//                       <div className="relative w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(15,23,42,0.15)] group-hover:bg-[#A054A0] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
//                         <j.icon className="w-7 h-7" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="absolute inset-x-0 bottom-0 p-7 z-20">
//                     <div className="transition-all duration-500">
//                       <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#A054A0] transition-colors duration-300">
//                         {j.title}
//                       </h3>
//                       <p className="mt-3 text-sm leading-6 text-slate-500 line-clamp-3">
//                         {j.desc}
//                       </p>
//                     </div>
//                     <div className="mt-6 flex items-center gap-3">
//                       <div className="w-9 h-px bg-[#A054A0]/50 group-hover:w-14 transition-all duration-500" />

//                       <span className="text-xs font-semibold uppercase tracking-wider text-[#A054A0]/70 group-hover:text-[#A054A0] transition-colors">
//                         {i === 0
//                           ? "Define"
//                           : i === 1
//                             ? "Discover"
//                             : i === 2
//                               ? "Evaluate"
//                               : "Decide"}
//                       </span>

//                       <ArrowRight className="w-4 h-4 text-[#A054A0]/60 group-hover:text-[#A054A0] group-hover:translate-x-2 transition-all duration-500" />
//                     </div>
//                   </div>

//                   <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

//                   <div className="absolute inset-x-0 bottom-0 p-7 z-30 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
//                     <div className="flex items-center gap-3 mb-4">
//                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A054A0]">
//                         Step 0{i + 1}
//                       </span>

//                       <div className="flex-1 h-px bg-[#A054A0]/15" />
//                     </div>

//                     <h3 className="text-2xl font-bold text-slate-900 mb-3">
//                       {j.title}
//                     </h3>

//                     <p className="text-sm text-slate-500 leading-6">{j.desc}</p>

//                     <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#A054A0]">
//                       <span>
//                         {i === 0
//                           ? "Set Your Goals"
//                           : i === 1
//                             ? "Explore Options"
//                             : i === 2
//                               ? "Compare & Analyse"
//                               : "Make It Happen"}
//                       </span>

//                       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
//                     </div>
//                   </div>

//                   <div className="absolute inset-0 rounded-[28px] border border-transparent group-hover:border-[#A054A0]/20 transition-all duration-500 pointer-events-none" />

//                   <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#A054A0]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//       <section className="py-20 bg-white relative">
//         <div className="container mx-auto px-4">
//           <div className="flex items-end justify-between mb-10">
//             <div>
//               <span className="inline-block px-3 py-1 bg-[#A054A0]/10 border border-[#A054A0]/20 text-[#A054A0] text-xs font-semibold rounded-full mb-3 tracking-wider uppercase">
//                 EXPLORE LOCATIONS
//               </span>

//               <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
//                 Popular Cities
//               </h2>
//             </div>

//             <Link
//               href="/properties"
//               className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#A054A0] hover:text-[#7a377a] transition-colors group"
//             >
//               View All
//               <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>

//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
//             {popularCities.map((c) => (
//               <Link
//                 key={c.name}
//                 href={`/properties?city=${encodeURIComponent(c.name)}`}
//                 className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900 border border-slate-200 hover:border-[#A054A0] transition-all duration-300 shadow-sm"
//               >
//                 <img
//                   src={c.url}
//                   alt={`${c.name} commercial real estate`}
//                   className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-110 transition duration-700 ease-out"
//                 />

//                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

//                 <div className="absolute inset-x-0 bottom-0 p-4">
//                   <div className="text-white text-lg font-bold group-hover:text-amber-300 transition-colors">
//                     {c.name}
//                   </div>

//                   <div className="text-xs text-slate-300 group-hover:text-white flex items-center gap-1 mt-1 transition-colors">
//                     <span>Explore spaces</span>
//                     <span className="text-[#A054A0] group-hover:translate-x-1 transition-transform">
//                       →
//                     </span>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>
//       {/* About Us Section */}
//       <section
//         id="aboutus"
//         className="py-20 bg-slate-50/70 relative border-t border-slate-100"
//       >
//         <div className="container mx-auto px-4 max-w-4xl">
//           <div className="text-center">
//             <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-[#A054A0] to-slate-900 bg-clip-text text-transparent mb-8">
//               About Us
//             </h2>

//             <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
//               Anarock is India&apos;s leading real estate services firm,
//               leveraging cutting-edge AI technology alongside deep market
//               expertise to transform commercial real estate discovery and
//               transaction processes. We empower enterprises, investors, and
//               occupiers with real-time market intelligence across 850M+ sq.ft of
//               commercial inventory to deliver seamless, value-driven outcomes.
//             </p>

//             <Link
//               key="About us"
//               href="/aboutus"
//               className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#A054A0] text-white font-medium text-sm hover:bg-[#884288] hover:shadow-[0_10px_25px_rgba(160,84,160,0.3)] hover:-translate-y-0.5 transition-all duration-300"
//             >
//               <span>Learn More About Us</span>
//               <ArrowRight className="h-4 w-4" />
//             </Link>
//           </div>
//         </div>
//       </section>
//       {/* ================= POST YOUR REQUIREMENT SECTION ================= */}
//       <section
//         id="enquiry"
//         className="relative overflow-hidden bg-[#FCFBFF] py-20 md:py-28"
//       >
//         {/* Background Accents */}
//         <div className="pointer-events-none absolute inset-0">
//           <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#A054A0]/[0.06] blur-[120px]" />

//           <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-purple-200/20 blur-[100px]" />

//           <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-fuchsia-200/20 blur-[100px]" />
//         </div>

//         <div className="container relative z-10 mx-auto max-w-5xl px-4">
//           {/* Section Heading */}
//           <div className="mb-12 text-center md:mb-16">
//             <span className="inline-flex items-center gap-2 rounded-full border border-[#A054A0]/15 bg-[#A054A0]/[0.07] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#A054A0]">
//               <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#A054A0]" />
//               GET STARTED
//             </span>

//             <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
//               Post Your{" "}
//               <span className="bg-gradient-to-r from-[#A054A0] via-[#b14db1] to-[#7a377a] bg-clip-text text-transparent">
//                 Requirement
//               </span>
//             </h2>

//             <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
//               Tell us what you're looking for. Our experts will help you find
//               suitable commercial spaces tailored to your needs.
//             </p>
//           </div>

//           {/* Requirement Form Card */}
//           <div className="overflow-hidden rounded-3xl border border-[#A054A0]/15 bg-white shadow-[0_20px_70px_rgba(160,84,160,0.08)]">
//             <form
//               className="space-y-0"
//               onSubmit={(e) => {
//                 e.preventDefault();

//                 const formData = new FormData(e.currentTarget);

//                 console.log(
//                   "Requirement Submitted:",
//                   Object.fromEntries(formData.entries()),
//                 );

//                 alert("Your requirement has been submitted!");

//                 e.currentTarget.reset();
//               }}
//             >
//               {/* ================= CONTACT DETAILS ================= */}
//               <div className="border-b border-slate-100 p-6 md:p-12">
//                 <div className="mb-8 flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A054A0]/10 text-lg font-bold text-[#A054A0]">
//                       1
//                     </span>

//                     <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
//                       Contact Details
//                     </h3>
//                   </div>

//                   <span className="hidden text-sm text-slate-400 md:block">
//                     Help us know you better
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>

//                     <input
//                       required
//                       name="name"
//                       placeholder="Enter your full name"
//                       className="requirement-input"
//                     />
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Email Address <span className="text-red-500">*</span>
//                     </label>

//                     <input
//                       required
//                       type="email"
//                       name="email"
//                       placeholder="Enter your email address"
//                       className="requirement-input"
//                     />
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Phone Number <span className="text-red-500">*</span>
//                     </label>

//                     <input
//                       required
//                       type="tel"
//                       name="phone"
//                       placeholder="Enter your phone number"
//                       className="requirement-input"
//                     />
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Company Name
//                     </label>

//                     <input
//                       name="company"
//                       placeholder="Enter your company name"
//                       className="requirement-input"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ================= REQUIREMENT DETAILS ================= */}
//               <div className="border-b border-slate-100 bg-[#FCFBFF]/70 p-6 md:p-12">
//                 <div className="mb-8 flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A054A0]/10 text-lg font-bold text-[#A054A0]">
//                       2
//                     </span>

//                     <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
//                       Requirement Details
//                     </h3>
//                   </div>

//                   <span className="hidden text-sm text-slate-400 md:block">
//                     Share your property requirements
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Requirement Type <span className="text-red-500">*</span>
//                     </label>

//                     <select
//                       required
//                       name="requirementType"
//                       defaultValue=""
//                       className="requirement-input"
//                     >
//                       <option value="" disabled>
//                         Select requirement type
//                       </option>

//                       <option value="Office Space">Office Space</option>
//                       <option value="Coworking">Coworking</option>
//                       <option value="Retail">Retail Space</option>
//                       <option value="Warehouse">Warehouse</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Preferred Location <span className="text-red-500">*</span>
//                     </label>

//                     <input
//                       required
//                       name="location"
//                       placeholder="Enter preferred location(s)"
//                       className="requirement-input"
//                     />
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Required Area (sq. ft.)
//                     </label>

//                     <input
//                       name="area"
//                       type="number"
//                       min="0"
//                       placeholder="Enter area in sq. ft."
//                       className="requirement-input"
//                     />
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Budget Range
//                     </label>

//                     <select
//                       name="budget"
//                       defaultValue=""
//                       className="requirement-input"
//                     >
//                       <option value="">Select budget range</option>

//                       <option value="Below 1 Lakh">Below ₹1 Lakh</option>
//                       <option value="1 - 5 Lakh">₹1–5 Lakh</option>
//                       <option value="5 - 10 Lakh">₹5–10 Lakh</option>
//                       <option value="10+ Lakh">₹10+ Lakh</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* ================= ADDITIONAL INFORMATION ================= */}
//               <div className="p-6 md:p-12">
//                 <div className="mb-8 flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A054A0]/10 text-lg font-bold text-[#A054A0]">
//                       3
//                     </span>

//                     <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
//                       Additional Information
//                     </h3>
//                   </div>

//                   <span className="hidden text-sm text-slate-400 md:block">
//                     Any specific requirements?
//                   </span>
//                 </div>

//                 <textarea
//                   name="message"
//                   rows={5}
//                   placeholder="Tell us more about your requirement..."
//                   className="requirement-input resize-none"
//                 />

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#A054A0] to-[#b14db1] px-6 py-4 text-base font-bold text-white shadow-[0_8px_25px_rgba(160,84,160,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(160,84,160,0.35)]"
//                 >
//                   Submit Requirement
//                   <ArrowRight className="h-5 w-5" />
//                 </button>

//                 <p className="mt-5 text-center text-xs text-slate-400">
//                   🔒 Your information is secure and will only be used to assist
//                   you with your property requirement.
//                 </p>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Input Styles */}
//         <style jsx>{`
//           .requirement-input {
//             width: 100%;
//             border: 1px solid #e2e8f0;
//             border-radius: 12px;
//             padding: 14px 16px;
//             font-size: 14px;
//             color: #1e293b;
//             background: white;
//             outline: none;
//             transition: all 0.2s;
//           }

//           .requirement-input:focus {
//             border-color: #a054a0;
//             box-shadow: 0 0 0 3px rgba(160, 84, 160, 0.1);
//           }

//           .requirement-input::placeholder {
//             color: #94a3b8;
//           }
//         `}</style>
//       </section>
//     </div>
//   );
// }
import HomePage from "@/pages/HomePage";

export default function Page() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none -z-0"
        style={{
          backgroundImage:
            "linear-gradient(#A054A0 2px, transparent 2px), linear-gradient(90deg, #A054A0 2px, transparent 2px)",
          backgroundSize: "100% 100%",
        }}
      />

      <div className="relative z-10">
        <HomePage />
      </div>
    </>
  );
}
