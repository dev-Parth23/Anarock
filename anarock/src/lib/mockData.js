// Mock property database for Anarock MVP

export const CITIES = [
  "Mumbai", "Bengaluru", "Delhi NCR", "Pune", "Hyderabad",
  "Chennai", "Kolkata", "Ahmedabad", "Gurgaon", "Noida"
];

export const OFFICE_TYPES = [
  "Conventional",
  "Managed Office/Co-working",
  "Consulting",
  "Others"
];

const images = [
  "https://images.unsplash.com/photo-1599398766380-23b3144142c7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1599580546666-c26f15e00933?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1587994990528-14263e4ee443?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1495576775051-8af0d10f19b1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1600596525163-36b26caa9c89?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1661023794774-26e9ac6482bb?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1585503081214-2d3384d1f7b0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "https://images.unsplash.com/photo-1638205022792-85c33651ae2c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
];

const locations = {
  "Mumbai": ["Bandra Kurla Complex", "Andheri East", "Lower Parel", "Nariman Point"],
  "Bengaluru": ["Whitefield", "Koramangala", "Indiranagar", "Electronic City", "MG Road"],
  "Delhi NCR": ["Connaught Place", "Nehru Place", "Saket", "Aerocity"],
  "Pune": ["Hinjewadi", "Baner", "Kharadi", "Viman Nagar"],
  "Hyderabad": ["HITEC City", "Gachibowli", "Banjara Hills", "Madhapur"],
  "Chennai": ["OMR", "Guindy", "Nungambakkam", "Anna Salai"],
  "Kolkata": ["Salt Lake", "Park Street", "New Town", "Rajarhat"],
  "Ahmedabad": ["SG Highway", "Prahlad Nagar", "CG Road"],
  "Gurgaon": ["Cyber City", "Golf Course Road", "Sohna Road", "MG Road"],
  "Noida": ["Sector 62", "Sector 18", "Noida Expressway"]
};

const amenitiesList = [
  "24/7 Access", "Power Backup", "HVAC", "High-Speed Internet", "Conference Rooms",
  "Cafeteria", "Parking", "Security", "Elevator", "CCTV", "Fire Safety",
  "Reception", "Green Building", "EV Charging", "Wellness Center"
];

function rand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick(arr, seed) {
  return arr[Math.floor(rand(seed) * arr.length)];
}

export const PROPERTIES = (() => {
  const list = [];
  let id = 1;
  for (const city of CITIES) {
    const areas = locations[city] || ["Central"];
    for (let i = 0; i < 6; i++) {
      const seed = id * 7.13;
      const area = pick(areas, seed);
      const type = pick(OFFICE_TYPES, seed + 1);
      const areaSqft = 1000 + Math.floor(rand(seed + 2) * 15000);
      const pricePerSqft = 60 + Math.floor(rand(seed + 3) * 250);
      const price = areaSqft * pricePerSqft;
      const imgOffset = Math.floor(rand(seed + 4) * images.length);
      const gallery = [
        images[imgOffset],
        images[(imgOffset + 1) % images.length],
        images[(imgOffset + 2) % images.length],
        images[(imgOffset + 3) % images.length]
      ];
      const shuffled = [...amenitiesList].sort(() => rand(seed + 5) - 0.5);
      const amenities = shuffled.slice(0, 6 + Math.floor(rand(seed + 6) * 5));
      list.push({
        id: String(id),
        slug: `${city.toLowerCase().replace(/\s+/g, '-')}-${area.toLowerCase().replace(/\s+/g, '-')}-${id}`,
        name: `${area} ${type.split('/')[0]} Tower ${id}`,
        city,
        area,
        type,
        price,
        currency: "INR",
        areaSqft,
        pricePerSqft,
        image: gallery[0],
        gallery,
        floor: 1 + Math.floor(rand(seed + 7) * 25),
        totalFloors: 15 + Math.floor(rand(seed + 8) * 25),
        seats: Math.floor(areaSqft / 80),
        parking: 5 + Math.floor(rand(seed + 9) * 40),
        yearBuilt: 2010 + Math.floor(rand(seed + 10) * 14),
        grade: pick(["A+", "A", "B+"], seed + 11),
        rating: (3.8 + rand(seed + 12) * 1.2).toFixed(1),
        availability: pick(["Ready to Move", "Available in 30 days", "Available in 60 days"], seed + 13),
        description: `Premium ${type.toLowerCase()} space located in ${area}, ${city}. This grade-A commercial property offers modern amenities, excellent connectivity, and a professional environment ideal for growing businesses. Featuring high-speed elevators, 24/7 security, ample parking and dedicated power backup.`,
        amenities,
        contact: {
          name: "Anarock Advisory",
          phone: "+91 9876543210",
          email: "advisory@anarock.com"
        }
      });
      id++;
    }
  }
  return list;
})();

export const CURRENCY_RATES = { INR: 1, USD: 0.012, AED: 0.044, EUR: 0.011, SGD: 0.016 };
export const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", AED: "د.إ", EUR: "€", SGD: "S$" };
