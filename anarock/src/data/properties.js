export const properties = [
  {
    id: 1,
    slug: "grade-a-tower-bkc",
    title: "Grade A Tower, BKC",
    city: "Mumbai",
    micromarket: "BKC",
    type: "Corporate",
    grade: "Grade A",
    area: 12000,
    price: 450,
    unit: "sq.ft/mo",
    floors: "14–19",
    description:
      "Premium Grade A commercial office space located in Mumbai's BKC business district.",
    attributes: [
      "Column-free plate",
      "3 dedicated lifts",
      "Metro 320m",
    ],
    color: "purple",
  },

  {
    id: 2,
    slug: "millennium-business-park",
    title: "Millennium Business Park",
    city: "Gurgaon",
    micromarket: "Cyber City",
    type: "IT Park",
    grade: "Grade A",
    area: 25000,
    price: 185,
    unit: "sq.ft/mo",
    floors: "3–6",
    description:
      "Large-scale commercial workspace designed for enterprise and GCC requirements.",
    attributes: [
      "24x7 power backup",
      "LEED Gold",
      "Food court",
    ],
    color: "teal",
  },

  {
    id: 3,
    slug: "cascade-tech-campus",
    title: "Cascade Tech Campus",
    city: "Bengaluru",
    micromarket: "Whitefield",
    type: "IT Park",
    grade: "Grade A",
    area: 18500,
    price: 95,
    unit: "sq.ft/mo",
    floors: "Full floors",
    description:
      "Technology-focused commercial campus in Bengaluru's Whitefield corridor.",
    attributes: [
      "Naturally lit",
      "EV charging",
      "Metro 700m",
    ],
    color: "sand",
  },

  {
    id: 4,
    slug: "marine-vista-chambers",
    title: "Marine Vista Chambers",
    city: "Mumbai",
    micromarket: "Nariman Point",
    type: "Institutional",
    grade: "Grade A+",
    area: 8200,
    price: 520,
    unit: "sq.ft/mo",
    floors: "Premium HQ",
    description:
      "Premium sea-facing commercial property designed for high-end corporate headquarters.",
    attributes: [
      "Sea view",
      "Valet parking",
      "Grade A+",
    ],
    color: "rose",
  },

  {
    id: 5,
    slug: "orion-gcc-campus",
    title: "Orion GCC Campus",
    city: "Hyderabad",
    micromarket: "Hitech City",
    type: "GCC Campus",
    grade: "Grade A",
    area: 32000,
    price: 78,
    unit: "sq.ft/mo",
    floors: "SEZ",
    description:
      "Large GCC-ready commercial campus in Hyderabad's Hitech City.",
    attributes: [
      "LEED Platinum",
      "On-site cafeteria",
      "24x7 access",
    ],
    color: "mint",
  },

  {
    id: 6,
    slug: "hive-managed-offices",
    title: "The Hive Managed Offices",
    city: "Bengaluru",
    micromarket: "Koramangala",
    type: "Flex",
    grade: "Grade A",
    area: 6400,
    price: 135,
    unit: "sq.ft/mo",
    floors: "Plug-and-play",
    description:
      "Flexible managed workspace for companies looking for furnished, move-in-ready offices.",
    attributes: [
      "Move-in ready",
      "Furnished",
      "Metro 250m",
    ],
    color: "purple",
  },
];

export function getPropertyBySlug(slug) {
  return properties.find((property) => property.slug === slug);
}