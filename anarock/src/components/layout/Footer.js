"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[#0b0b0b] text-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-5
          sm:px-8
          md:px-10
          lg:px-14
          xl:px-16
          2xl:px-20
        "
      >
        {/* =========================================================
            TOP FOOTER
        ========================================================= */}
        <div
          className="
            flex
            flex-col
            gap-8
            py-9

            min-[480px]:py-10

            sm:gap-9
            sm:py-12

            md:gap-10
            md:py-14

            lg:flex-row
            lg:items-start
            lg:justify-between
            lg:gap-16
            lg:py-16

            xl:gap-24
            xl:py-18
          "
        >
          {/* BRAND + DESCRIPTION */}
          <div
            className="
              min-w-0
              max-w-2xl

              max-lg:text-center
            "
          >
            <Link
              href="/"
              aria-label="Anarock Commercial Listing Platform"
              className="
                group
                inline-flex
                items-center
                transition-transform
                duration-200
                active:scale-95
              "
            >
              <img
                src="/Anarock(W).svg"
                alt="Anarock"
                className="
                  block
                  h-auto
                  w-[100px]
                  object-contain
                  transition-transform
                  duration-300
                  group-hover:scale-105

                  min-[480px]:w-[110px]
                  sm:w-[120px]
                  lg:w-[130px]
                "
              />
            </Link>

            <p
              className="
                mt-5
                max-w-2xl
                text-[13px]
                leading-6
                text-[#bcbcbc]

                min-[400px]:text-[14px]
                min-[400px]:leading-6

                sm:mt-6
                sm:text-[15px]
                sm:leading-7

                lg:max-w-[680px]
              "
            >
              Leading real estate services company that delivers integrated
              solutions to a diversified client base including developers,
              investors, corporates and the government.
            </p>
          </div>

          {/* SOCIAL LINKS */}
          <div
            className="
              flex
              shrink-0
              items-center
              justify-center
              gap-5

              sm:gap-6

              lg:justify-end
              lg:pt-2
            "
          >
            {/* LINKEDIN */}
            <SocialLink
              href="https://www.linkedin.com/company/anarock-property-consultants/"
              label="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[20px] w-[20px]"
                fill="currentColor"
              >
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM3.56 20.45h3.57V8.99H3.56v11.46z" />
              </svg>
            </SocialLink>

            {/* INSTAGRAM */}
            <SocialLink
              href="https://www.instagram.com/anarockpropertyconsultants/"
              label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[20px] w-[20px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </SocialLink>

            {/* YOUTUBE */}
            <SocialLink
              href="https://www.youtube.com/@AnarockProperty"
              label="YouTube"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[20px] w-[20px]"
                fill="currentColor"
              >
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.4.58A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.86.58 9.4.58 9.4.58s7.54 0 9.4-.58a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.93V8.07L16.4 12l-6.8 3.93z" />
              </svg>
            </SocialLink>

            {/* FACEBOOK */}
            <SocialLink
              href="https://www.facebook.com/anarockproperty/"
              label="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[20px] w-[20px]"
                fill="currentColor"
              >
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.09 4.39 23.07 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.04 1.79-4.72 4.54-4.72 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.29h3.32l-.53 3.49h-2.79V24C19.61 23.07 24 18.09 24 12.07z" />
              </svg>
            </SocialLink>

            {/* X */}
            <SocialLink href="https://x.com/ANAROCK" label="X">
              <svg
                viewBox="0 0 24 24"
                className="h-[19px] w-[19px]"
                fill="currentColor"
              >
                <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.37l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2zm-1.1 17.9h1.73L8.28 3.98H6.42L17.8 19.9z" />
              </svg>
            </SocialLink>
          </div>
        </div>

        {/* =========================================================
            DIVIDER
        ========================================================= */}
        <div className="h-px w-full bg-[#7f3f80]/80" />

        {/* =========================================================
            DISCLAIMER
        ========================================================= */}
        <div
          className="
            py-8

            sm:py-9

            md:py-10

            lg:py-11
          "
        >
          <h3
            className="
              text-[14px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-white

              sm:text-[15px]
            "
          >
            Disclaimer
          </h3>

          <p
            className="
              mt-3
              max-w-[1450px]
              text-[12px]
              leading-[1.7]
              text-[#8f8f8f]

              min-[400px]:text-[13px]

              sm:mt-4
              sm:text-[14px]
              sm:leading-[1.75]
            "
          >
            The site and its contents is provided on an &quot;as is&quot; basis.
            Anarock Property Consultants Private Limited, its associate or
            subsidiary companies (collectively &quot;Anarock&quot;) expressly
            disclaims all warranties, including the warranties of
            merchantability, fitness for a particular purpose and
            non-infringement. Anarock disclaims all responsibility for any loss,
            injury, claim, liability or damage of any kind resulting from,
            arising out of or any way related to any (i) errors or omissions
            from the site (including any content), including but not limited to
            technical inaccuracies and typographical errors, (ii) third party
            web sites or content therein directly or indirectly accessed through
            links in this site, including but not limited to any errors in or
            omissions therefrom, (iii) unavailability of the site or any portion
            thereof, (iv) use of this site by you or (v) use of any equipment or
            software in connection with the site by you.
          </p>
        </div>

        {/* =========================================================
            BOTTOM DIVIDER
        ========================================================= */}
        <div className="h-px w-full bg-[#7f3f80]/80" />

        {/* =========================================================
            COPYRIGHT + LEGAL LINKS
        ========================================================= */}
        <div
          className="
            flex
            flex-col
            items-center
            gap-4
            py-5
            text-center

            min-[480px]:py-6

            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:gap-6
            sm:py-6
            sm:text-left
          "
        >
          <p
            className="
              text-[11px]
              leading-5
              text-[#d0d0d0]

              min-[400px]:text-[12px]

              sm:text-[12px]
            "
          >
            © {new Date().getFullYear()} Anarock Property Consultants Pvt Ltd.
            All Rights Reserved.
          </p>

          <nav
            aria-label="Legal"
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-4
              gap-y-2
              text-[11px]
              text-[#999999]

              min-[400px]:gap-x-5
              min-[400px]:text-[12px]

              sm:justify-end
              sm:gap-x-6
              sm:text-[12px]
            "
          >
            <FooterLegalLink href="/privacy-policy">
              Privacy Policy
            </FooterLegalLink>

            <FooterLegalLink href="/rera">RERA</FooterLegalLink>

            <FooterLegalLink href="/terms-of-use">Terms of Use</FooterLegalLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   SOCIAL LINK
========================================================= */

function SocialLink({ href, label, children }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="
        group
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        text-[#bdbdbd]
        transition-all
        duration-200

        hover:bg-white/[0.07]
        hover:text-white
        active:scale-95

        sm:h-10
        sm:w-10
      "
    >
      <span
        className="
          flex
          items-center
          justify-center
          transition-transform
          duration-200
          group-hover:scale-110
        "
      >
        {children}
      </span>
    </Link>
  );
}
function FooterLegalLink({ href, children }) {
  return (
    <Link
      href={href}
      className="
        whitespace-nowrap
        transition-colors
        duration-200
        hover:text-white
      "
    >
      {children}
    </Link>
  );
}
