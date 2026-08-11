"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

import LocationButton from "./LocationButton";

const currencies = [
  ["INR", "₹ INR"],
  ["USD", "$ USD"],
  ["SGD", "S$ SGD"],
  ["AED", "AED"],
  ["EUR", "€ EUR"],
];

const navigation = [
  {
    label: "Properties",
    href: "/properties",
  },
  {
    label: "Micromarkets",
    href: "/micromarkets",
  },
  {
    label: "For Occupiers",
    href: "/occupiers",
  },
  {
    label: "For Investors",
    href: "/investors",
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState("₹ INR");
  const [unit, setUnit] = useState("sq.ft");

  const closeMenu = () => {
    setMobileOpen(false);
    setCurrencyOpen(false);
  };

  return (
    <header className="sticky left-0 top-0 z-[100] w-full border-b border-black/10 bg-white/95 backdrop-blur-xl">

      {/* ================================
          MAIN NAVBAR
      ================================= */}

      <div
        className="
          flex
          min-h-[68px]
          w-full
          items-center
          justify-between
          gap-3
          px-4
          sm:gap-4
          sm:px-6
          md:min-h-[74px]
          md:px-8
          lg:min-h-[78px]
          lg:px-10
          xl:px-14
        "
      >

        {/* LOGO */}

        <Link
          href="/"
          onClick={closeMenu}
          aria-label="Anarock Commercial Listing Platform"
          className="flex shrink-0 items-center"
        >
          <div className="flex items-center gap-3 sm:gap-4">

            <img
              src="/Anarock.svg"
              alt="Anarock"
              className="
                block
                h-auto
                w-[95px]
                object-contain
                sm:w-[110px]
                lg:w-[120px]
              "
            />

            <div className="h-7 w-px bg-black/20 sm:h-8" />

            <div
              className="
                hidden
                whitespace-nowrap
                text-[8px]
                font-medium
                uppercase
                leading-none
                tracking-[0.14em]
                text-[#666]
                sm:block
                sm:text-[9px]
                lg:text-[10px]
              "
            >
              CLA · Commercial Platform
            </div>

          </div>
        </Link>


        {/* LOCATION */}

        <div className="ml-auto md:ml-0">
          <LocationButton />
        </div>


        {/* DESKTOP NAVIGATION */}

        <nav
          className="
            ml-auto
            hidden
            items-center
            gap-5
            md:flex
            lg:gap-7
            xl:gap-9
          "
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                group
                relative
                whitespace-nowrap
                text-[14px]
                font-semibold
                text-[#404040]
                transition-colors
                hover:text-black
              "
            >
              {item.label}

              <span
                className="
                  absolute
                  -bottom-1.5
                  left-0
                  h-px
                  w-0
                  bg-black
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </Link>
          ))}
        </nav>


        {/* DESKTOP CONTROLS */}

        <div
          className="
            ml-4
            hidden
            shrink-0
            items-center
            gap-3
            md:flex
            lg:ml-7
            lg:gap-4
          "
        >

          {/* Currency */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setCurrencyOpen((prev) => !prev)
              }
              aria-expanded={currencyOpen}
              className="
                flex
                items-center
                gap-1
                rounded-xl
                border
                border-[#777]
                px-3
                py-2
                text-[11px]
                text-[#111]
                outline-none
                lg:text-[12px]
              "
            >
              {currency}

              <ChevronDown
                size={13}
                strokeWidth={1.7}
                className={`
                  transition-transform
                  duration-200
                  ${currencyOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {currencyOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+10px)]
                  z-[200]
                  w-[125px]
                  overflow-hidden
                  rounded-xl
                  border
                  border-black/30
                  bg-white
                  p-1
                  shadow-[0_12px_30px_rgba(0,0,0,0.10)]
                "
              >
                {currencies.map(([code, label]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setCurrency(label);
                      setCurrencyOpen(false);
                    }}
                    className={`
                      w-full
                      px-4
                      py-2
                      text-left
                      text-[12px]
                      transition-colors
                      ${
                        currency === label
                          ? "bg-[#f2f2f0] text-black"
                          : "text-[#555] hover:bg-[#f2f2f0] hover:text-black"
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

          </div>


          {/* UNIT */}

          <div className="flex overflow-hidden rounded-xl border border-black/30">

            <button
              type="button"
              onClick={() => setUnit("sq.ft")}
              className={`
                px-4
                py-2
                text-[12px]
                font-bold
                transition-colors
                ${
                  unit === "sq.ft"
                    ? "bg-[#A054A0] text-white"
                    : "bg-white text-[#464646] hover:bg-black/10"
                }
              `}
            >
              sq.ft
            </button>

            <button
              type="button"
              onClick={() => setUnit("sq.m")}
              className={`
                px-3
                py-2
                text-[12px]
                font-bold
                transition-colors
                ${
                  unit === "sq.m"
                    ? "bg-[#A054A0] text-white"
                    : "bg-white text-[#464646] hover:bg-black/10"
                }
              `}
            >
              sq.m
            </button>

          </div>


          {/* ENQUIRE */}

          <Link
            href="#enquiry"
            className="
              inline-flex
              min-h-9
              items-center
              justify-center
              rounded-xl
              bg-[#A054A0]
              px-4
              text-[12px]
              font-bold
              text-white
              transition-all
              duration-200
              hover:-translate-y-px
              hover:bg-[#292929]
              lg:min-h-10
              lg:px-[18px]
            "
          >
            Enquire
          </Link>

        </div>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen((prev) => !prev)
          }
          aria-label={
            mobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileOpen}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            text-[#111]
            md:hidden
          "
        >
          {mobileOpen ? (
            <X
              size={23}
              strokeWidth={1.7}
            />
          ) : (
            <Menu
              size={23}
              strokeWidth={1.7}
            />
          )}
        </button>

      </div>


      {/* ================================
          MOBILE MENU
      ================================= */}

      {mobileOpen && (
        <div
          className="
            border-t
            border-black/10
            bg-white
            px-4
            pb-5
            pt-2
            sm:px-6
            md:hidden
          "
        >

          {/* Navigation */}

          <nav className="flex flex-col">

            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="
                  border-b
                  border-black/10
                  py-4
                  text-sm
                  font-medium
                  text-[#111]
                  transition-colors
                  hover:text-black
                "
              >
                {item.label}
              </Link>
            ))}

          </nav>


          {/* Mobile Controls */}

          <div className="mt-5 flex items-center justify-between gap-3">

            {/* Unit */}

            <div className="flex overflow-hidden rounded-xl border border-black/10">

              <button
                type="button"
                onClick={() => setUnit("sq.ft")}
                className={`
                  px-3
                  py-2
                  text-[11px]
                  font-bold
                  ${
                    unit === "sq.ft"
                      ? "bg-[#A054A0] text-white"
                      : "text-[#777]"
                  }
                `}
              >
                sq.ft
              </button>

              <button
                type="button"
                onClick={() => setUnit("sq.m")}
                className={`
                  px-3
                  py-2
                  text-[11px]
                  font-bold
                  ${
                    unit === "sq.m"
                      ? "bg-[#A054A0] text-white"
                      : "text-[#777]"
                  }
                `}
              >
                sq.m
              </button>

            </div>


            {/* Enquire */}

            <Link
              href="#enquiry"
              onClick={closeMenu}
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                rounded-xl
                bg-[#A054A0]
                px-5
                text-[11px]
                font-semibold
                text-white
                transition-colors
                hover:bg-[#292929]
              "
            >
              Enquire
            </Link>

          </div>

        </div>
      )}

    </header>
  );
}