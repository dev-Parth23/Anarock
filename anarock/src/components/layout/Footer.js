"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[#0b0b0b] text-white">
      <div className="mx-auto w-full max-w-none px-5 sm:px-8 md:px-10 lg:px-16 xl:px-20">
        <div className="grid min-w-0 grid-cols-1 gap-10 py-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-8 xl:gap-x-12 2xl:gap-x-16">
          <div className="min-w-0 pr-0 sm:pr-2 lg:pr-4 xl:pr-6">
            <Link
              href="/"
              aria-label="Anarock Commercial Listing Platform"
              className="group flex min-w-0 shrink-0 items-center transition-transform duration-200 active:scale-95"
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
                <img
                  src="/Anarock(W).svg"
                  alt="Anarock"
                  className="block h-auto w-[95px] object-contain transition-transform duration-300 group-hover:scale-105 sm:w-[115px] lg:w-[130px]"
                />
              </div>
            </Link>

            <p className="mt-5 w-full max-w-[370px] text-[15px] leading-7 text-[#c6c6c6] sm:mt-6">
              Leading real estate services company that delivers integrated
              solutions to a diversified client base including developers,
              investors, corporates and the government.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-5 sm:gap-6">
              {/* LINKEDIN */}
              <Link
                href="https://www.linkedin.com/company/anarock-property-consultants/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[#cfcfcf] transition-colors duration-200 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[24px] w-[24px]"
                  fill="currentColor"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM3.56 20.45h3.57V8.99H3.56v11.46z" />
                </svg>
              </Link>

              {/* INSTAGRAM */}
              <Link
                href="https://www.instagram.com/anarockpropertyconsultants/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#cfcfcf] transition-colors duration-200 hover:text-white"
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
              </Link>

              {/* YOUTUBE */}
              <Link
                href="https://www.youtube.com/@AnarockProperty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[#cfcfcf] transition-colors duration-200 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[20px] w-[20px]"
                  fill="currentColor"
                >
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.4.58A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.86.58 9.4.58 9.4.58s7.54 0 9.4-.58a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.93V8.07L16.4 12l-6.8 3.93z" />
                </svg>
              </Link>

              {/* FACEBOOK */}
              <Link
                href="https://www.facebook.com/anarockproperty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#cfcfcf] transition-colors duration-200 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[20px] w-[20px]"
                  fill="currentColor"
                >
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.09 4.39 23.07 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.04 1.79-4.72 4.54-4.72 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.29h3.32l-.53 3.49h-2.79V24C19.61 23.07 24 18.09 24 12.07z" />
                </svg>
              </Link>

              {/* X */}
              <Link
                href="https://x.com/ANAROCK"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="text-[#cfcfcf] transition-colors duration-200 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[19px] w-[19px]"
                  fill="currentColor"
                >
                  <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.37l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2zm-1.1 17.9h1.73L8.28 3.98H6.42L17.8 19.9z" />
                </svg>
              </Link>
            </div>
          </div>
          {/* SERVICES */}
          <FooterColumn title="Services">
            <FooterLink href="https://www.anarock.com/services/transaction-advisory">
              Transaction Advisory
            </FooterLink>

            <FooterLink href="/services/leasing-investment-advisory">
              Leasing &amp; Investment
              <br className="hidden xl:block" />
              Advisory
            </FooterLink>

            <FooterLink href="/services/management-services">
              Management Services
            </FooterLink>

            <FooterLink href="/services/technology-solutions">
              Technology Solutions
            </FooterLink>
          </FooterColumn>
          {/* RESEARCH */}
          <FooterColumn title="Research">
            <FooterLink href="/research">
              Research &amp; Advisory Service
            </FooterLink>

            <FooterLink href="/research/bespoke">Bespoke Research</FooterLink>

            <FooterLink href="/research/anarock-perspective">
              The Anarock Perspective
            </FooterLink>
          </FooterColumn>
          {/* MEDIA */}
          <FooterColumn title="Media">
            <FooterLink href="/media/awards">Awards</FooterLink>

            <FooterLink href="/media/podcasts-videos">
              Podcasts &amp; Videos
            </FooterLink>
          </FooterColumn>
          {/* COMPANY */}
          <FooterColumn title="Company">
            <FooterLink href="/about">About Us</FooterLink>

            <FooterLink href="/leadership">Leadership Team</FooterLink>

            <FooterLink href="/community-impact">Community Impact</FooterLink>

            <FooterLink href="/careers">Careers</FooterLink>

            <FooterLink href="/contact">Contact Us</FooterLink>
          </FooterColumn>
          {/* OFFICES */}
          <FooterColumn title="Offices">
            <FooterLink href="/offices/mumbai">Mumbai MMR</FooterLink>

            <FooterLink href="/offices/ahmedabad">Ahmedabad</FooterLink>

            <FooterLink href="/offices/bengaluru">Bengaluru</FooterLink>

            <FooterLink href="/offices/chennai">Chennai</FooterLink>

            <FooterLink href="/offices/dubai">Dubai</FooterLink>

            <FooterLink href="/offices/hyderabad">Hyderabad</FooterLink>

            <Link
              href="/offices"
              className="mt-3 inline-block text-[15px] text-[#cfcfcf] underline underline-offset-[5px] transition-colors duration-200 hover:text-white"
            >
              View All
            </Link>
          </FooterColumn>
        </div>
        <div className="h-px w-full bg-[#7f3f80]" />
        <div className="py-8 sm:py-10 lg:py-11">
          <h3 className="text-[16px] font-semibold text-white">Disclaimer</h3>

          <p className="mt-4 text-[14px] leading-6 text-[#8f8f8f] sm:mt-5 sm:text-[14px] sm:leading-[1.75]">
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
        {/* PURPLE LINE */}
        <div className="h-px w-full bg-[#7f3f80]" />
        {/* BOTTOM BAR */}
        <div className="flex flex-col gap-5 py-5 text-[14px] leading-5 sm:flex-row sm:items-center sm:justify-between sm:text-[12px]">
          <p className="text-[#e0e0e0]">
            © {new Date().getFullYear()} Anarock Property Consultants Pvt Ltd.
            All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[#a6a6a6] sm:gap-x-7">
            <Link
              href="/privacy-policy"
              className="transition-colors duration-200 hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/rera"
              className="transition-colors duration-200 hover:text-white"
            >
              RERA
            </Link>

            <Link
              href="/terms-of-use"
              className="transition-colors duration-200 hover:text-white"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
function FooterColumn({ title, children }) {
  return (
    <div className="min-w-0">
      <h3 className="flex items-center text-[18px] font-semibold leading-tight text-white sm:text-[18px]">
        <span className="mr-3 h-[18px] w-[3px] shrink-0 bg-[#a054a0]" />
        {title}
      </h3>

      <div className="mt-4 flex min-w-0 flex-col gap-3 sm:mt-5 sm:gap-[14px]">
        {children}
      </div>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="break-words text-[13px] leading-6 text-[#bdbdbd] transition-colors duration-200 hover:text-white sm:text-[14px] lg:text-[15px]"
    >
      {children}
    </Link>
  );
}
