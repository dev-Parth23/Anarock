"use client";

import { useState, useEffect } from "react";
import { Cookie, Settings, X } from "lucide-react";

export default function CookieConsent({ onConsentGiven }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent_accepted");

    if (!consent) {
      setShow(true);
    } else {
      if (onConsentGiven) onConsentGiven();
    }
  }, [onConsentGiven]);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent_accepted", "true");
    setShow(false);

    if (onConsentGiven) onConsentGiven();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 sm:p-6">
      <div
        className="
          relative
          w-full
          max-w-[1200px]
          bg-white
          rounded-[28px]
          sm:rounded-[32px]
          shadow-[0_20px_70px_rgba(0,0,0,0.18)]
          border
          border-slate-100
          px-6
          py-7
          sm:px-10
          sm:py-9
          lg:px-14
          lg:py-10
        "
      >
        {/* Close
        <button
          type="button"
          aria-label="Close cookie consent"
          onClick={handleAccept}
          className="
            absolute
            top-5
            right-5
            sm:top-7
            sm:right-7
            lg:top-8
            lg:right-9
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-full
            text-slate-900
            hover:bg-slate-100
            transition-all
            duration-200
          "
        >
          <X size={30} strokeWidth={2.2} />
        </button> */}
        {/* Content */}
        <div className="pr-12 sm:pr-16">
          <h2
            className="
              text-[25px]
              sm:text-[29px]
              lg:text-[32px]
              font-semibold
              tracking-[-0.02em]
              text-slate-950
              leading-tight
            "
          >
            We Use Cookies 🍪
          </h2>

          <div className="mt-7 sm:mt-8 space-y-5 max-w-[1050px]">
            <p
              className="
                text-[15px]
                sm:text-[16px]
                lg:text-[17px]
                leading-[1.55]
                text-slate-800
              "
            >
              We use cookies and location data to personalize your workspace
              search experience. Please accept to proceed.
            </p>

            <p
              className="
                text-[15px]
                sm:text-[16px]
                lg:text-[17px]
                leading-[1.55]
                text-slate-800
              "
            >
              You can view our full{" "}
              <button
                type="button"
                className="
                  font-semibold
                  underline
                  underline-offset-2
                  hover:text-[#A054A0]
                  transition-colors
                "
              >
                Cookie Policy
              </button>{" "}
              for more details and update or disable your preferences anytime in
              your browser settings.
            </p>
          </div>
        </div>
        {/* Actions */}
        <div
          className="
            mt-8
            sm:mt-9
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            sm:items-center
            gap-3
            sm:gap-4
          "
        >
          {/* Accept */}
          <button
            type="button"
            onClick={handleAccept}
            className="
              h-14
              px-7
              sm:px-8
              rounded-full
              bg-[#222222]
              hover:bg-[#111111]
              text-white
              text-[15px]
              sm:text-[16px]
              font-semibold
              whitespace-nowrap
              transition-all
              duration-200
              shadow-sm
              hover:shadow-md
            "
          >
            Accept all
          </button>

          {/* Essential */}
          <button
            type="button"
            onClick={handleAccept}
            className="
              h-14
              px-7
              sm:px-8
              rounded-full
              bg-white
              border
              border-slate-400
              hover:border-slate-700
              hover:bg-slate-50
              text-slate-900
              text-[15px]
              sm:text-[16px]
              font-medium
              whitespace-nowrap
              transition-all
              duration-200
            "
          >
            Essential only
          </button>
        </div>
      </div>
    </div>
  );
}
// "use client";

// import { useState, useEffect } from "react";
// import { ChevronRight } from "lucide-react";

// export default function CookieConsent({ onConsentGiven }) {
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     const consent = localStorage.getItem("cookie_consent_accepted");

//     if (!consent) {
//       setShow(true);
//     } else {
//       if (onConsentGiven) onConsentGiven();
//     }
//   }, [onConsentGiven]);

//   const handleAccept = () => {
//     localStorage.setItem("cookie_consent_accepted", "true");
//     setShow(false);

//     if (onConsentGiven) onConsentGiven();
//   };

//   if (!show) return null;

//   return (
//     <div
//       className="
//         fixed
//         inset-0
//         z-[1000]
//         flex
//         items-center
//         justify-center
//         bg-black/10
//         backdrop-blur-[2px]
//         p-0
//         sm:p-4
//         lg:p-5
//       "
//     >
//       <div
//         className="
//           relative
//           w-full
//           max-w-[1380px]
//           overflow-hidden
//           rounded-t-[30px]
//           sm:rounded-[30px]
//           lg:rounded-[34px]
//           border
//           border-white/80
//           bg-gradient-to-r
//           from-[#fff1df]
//           via-[#fffafa]
//           to-[#eafcff]
//           shadow-[0_-10px_50px_rgba(0,0,0,0.10)]
//           px-7
//           py-8
//           sm:px-10
//           sm:py-10
//           lg:px-14
//           lg:py-12
//         "
//       >
//         <div className="max-w-[1080px]">
//           <h2
//             className="
//               text-[28px]
//               sm:text-[32px]
//               lg:text-[36px]
//               font-medium
//               tracking-[-0.025em]
//               leading-tight
//               text-black
//             "
//           >
//             We Use Cookies 🍪
//           </h2>

//           <p
//             className="
//               mt-7
//               sm:mt-8
//               max-w-[1080px]
//               text-[19px]
//               sm:text-[23px]
//               lg:text-[27px]
//               font-normal
//               leading-[1.55]
//               tracking-[-0.015em]
//               text-[#555555]
//             "
//           >
//             We use cookies and location data to personalize your workspace
//             search experience. Please accept to proceed.
//           </p>
//         </div>

//         <div
//           className="
//             mt-10
//             sm:mt-12
//             lg:mt-16
//             flex
//             flex-col
//             gap-7
//             sm:flex-row
//             sm:items-center
//             sm:justify-between
//           "
//         >
//           {" "}
//           <button
//             type="button"
//             className="
//               group
//               flex
//               w-fit
//               items-center
//               gap-2
//               text-left
//               text-[18px]
//               sm:text-[21px]
//               lg:text-[25px]
//               font-medium
//               text-black
//               transition-all
//               duration-200
//             "
//           >
//             <span
//               className="
//                 underline
//                 underline-offset-[5px]
//                 decoration-[1.5px]
//                 group-hover:text-[#555555]
//               "
//             >
//               Privacy Policy Page
//             </span>

//             <ChevronRight
//               size={24}
//               strokeWidth={2}
//               className="
//                 transition-transform
//                 duration-200
//                 group-hover:translate-x-1
//                 sm:w-7
//                 sm:h-7
//               "
//             />
//           </button>
//           <div
//             className="
//               flex
//               flex-col
//               gap-4
//               sm:flex-row
//               sm:items-center
//               sm:gap-7
//               lg:gap-10
//             "
//           >
//             <button
//               type="button"
//               onClick={handleAccept}
//               className="
//                 h-14
//                 sm:h-16
//                 px-4
//                 sm:px-6
//                 rounded-full
//                 text-[16px]
//                 sm:text-[18px]
//                 lg:text-[20px]
//                 font-medium
//                 tracking-[-0.01em]
//                 text-black
//                 whitespace-nowrap
//                 transition-all
//                 duration-200
//                 hover:bg-black/5
//               "
//             >
//               Accept All
//             </button>
//             <button
//               type="button"
//               onClick={handleAccept}
//               className="
//                 h-14
//                 sm:h-16
//                 px-4
//                 sm:px-6
//                 rounded-full
//                 text-[16px]
//                 sm:text-[18px]
//                 lg:text-[20px]
//                 font-medium
//                 tracking-[-0.01em]
//                 text-black
//                 whitespace-nowrap
//                 transition-all
//                 duration-200
//                 hover:bg-black/5
//               "
//             >
//               Essential Only
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
