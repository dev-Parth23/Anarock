const clean = (value) => {
  if (value === null || value === undefined) return "";
  return value;
};

const num = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const folderPath = (value) => {
  if (!value) return "";

  let folder = String(value).trim();

  if (!folder.endsWith("/")) {
    folder += "/";
  }

  return folder;
};

export function mapProperty(row) {
  const folder = folderPath(row.ImageFolderPath);

  const primaryImage = folder
    ? `/api/property-images/${encodeURIComponent(folder)}Project_Picture_1.jpg`
    : "";

  return {
    id: String(row.ROWID),
    rowId: String(row.ROWID),

    name: clean(row.PropertyName),
    slug: clean(row.PropertyName),

    type: clean(row.OfficeType),
    officeType: clean(row.OfficeType),

    city: clean(row.City),
    state: clean(row.StateOfHandover),
    area: clean(row.Micromarket),
    micromarket: clean(row.Micromarket),
    address: clean(row.Address),

    latitude: num(row.Latitude),
    longitude: num(row.Longitude),

    buildingType: clean(row.BuildingType),
    buildingName: clean(row.BuildingName),
    techPark: clean(row.TechPark),
    buildingStructure: clean(row.BuildingStructure),

    floor: clean(row.ProposedFloor),
    proposedFloor: clean(row.ProposedFloor),

    yearBuilt: clean(row.TermEstYearOfCompletion),

    availability: clean(row.Availability),
    availabilityDate: clean(row.AvailabilityDate),
    projectStatus: clean(row.ProjectStatus),

    areaSqft: num(row.OfferedSuperArea),
    offeredSuperArea: num(row.OfferedSuperArea),
    builtupArea: num(row.BuiltupArea),
    carpetArea: num(row.CarpetArea),
    floorPlate: num(row.FloorPlate),
    totalLeasableArea: num(row.TotalLeasableArea),

    price: num(row.QuotedRent),
    quotedRent: num(row.QuotedRent),
    achievableRent: num(row.AchievableRent),
    quotedSalePrice: num(row.QuotedSalePrice),
    quotedCAM: num(row.QuotedCAM),

    pricePerSqft: num(row.QuotedRent),

    rentOptions: clean(row.RentOptions),

    parking: clean(row.ParkingRatio),
    parkingRatio: clean(row.ParkingRatio),
    additionalParkingCost: num(row.AdditionalParkingCost),
    monthlyCarParkingCharges: num(row.MonthlyCarParkingCharges),

    seats: num(row.NoOfSeats),
    centerArea: num(row.CenterArea),
    centerSeatingCapacity: num(row.CenterSeatingCapacity),

    operatorName: clean(row.OperatorName),
    offeredSpace: clean(row.OfferedSpace),
    configuration: clean(row.OfferedConfiguration),

    powerBackup: clean(row.PowerBackup),
    hvacSystem: clean(row.HVACSystem),
    elevators: clean(row.Elevators),

    developer: clean(row.Developer),
    ownershipStructure: clean(row.OwnershipStructure),

    projectHighlights: clean(row.ProjectHighlights),
    centerHighlights: clean(row.AvailableCenterHighlights),
    buildingCertifications: clean(row.BuildingCertifications),

    occupancyCertificate: clean(row.OccupancyCertificate),
    handoverTimelines: clean(row.HandoverTimelines),

    lockinPeriod: clean(row.LockinPeriod),
    securityDeposit: clean(row.SecurityDeposit),

    noticePeriodForTermination: clean(row.NoticePeriodForTermination),

    escalationInterval: clean(row.EscalationInterval),
    tenantProfile: clean(row.TenantProfile),

    oneTimeSetupCost: num(row.OneTimeSetupCost),
    costOfModifications: num(row.CostOfModifications),
    monthlyCostPerSeat: num(row.MonthlyCostPerSeat),
    sizePerWorkstation: num(row.SizePerWorkstation),

    noOfCreditsProvided: num(row.NoOfCreditsProvided),
    standardOperatingHours: clean(row.StandardOperatingHours),
    chargesForMeeting: num(row.ChargesForMeeting),

    inclusions: clean(row.Inclusions),
    exclusions: clean(row.Exclusions),

    aiAttributes: clean(row.AIAttributes),
    crmID: clean(row.crmID),

    contact: {
      name: clean(row.SPOCName),
      phone: clean(row.SPOCNumber),
    },

    description:
      clean(row.ProjectHighlights) ||
      clean(row.AvailableCenterHighlights) ||
      clean(row.AIAttributes) ||
      "",

    amenities: [
      row.PowerBackup,
      row.HVACSystem,
      row.Elevators,
      row.ParkingRatio,
      row.BuildingCertifications,
      row.OccupancyCertificate,
    ].filter(Boolean),

    image: primaryImage,

    gallery: primaryImage
      ? [
          {
            name: "Project_Picture_1.jpg",
            key: `${folder}Project_Picture_1.jpg`,
            url: primaryImage,
          },
        ]
      : [],

    imageFolderPath: folder,
  };
}
