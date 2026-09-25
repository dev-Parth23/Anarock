const clean = (value) => {
  if (value === null || value === undefined) return "";
  return value;
};

const num = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
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
  if (!row || typeof row !== "object") {
    return null;
  }
  const folder = folderPath(row.ImageFolderPath);
  return {
    ...row,
    id: String(row.ROWID || ""),
    rowId: String(row.ROWID || ""),
    slug: clean(row.PropertyName),

    availabilityType: clean(row.AvailabilityType),
    officeType: clean(row.OfficeType),
    name: clean(row.PropertyName),
    city: clean(row.City),
    state: clean(row.StateOfHandover),
    area: clean(row.Micromarket),
    micromarket: clean(row.Micromarket),
    address: clean(row.Address),
    location: clean(row.Location),
    latitude: num(row.Latitude),
    longitude: num(row.Longitude),
    distanceFromMetro: clean(row.DistanceFromMetro),
    distanceFromAirport: clean(row.DistanceFromAirport),
    buildingType: clean(row.BuildingType),
    buildingName: clean(row.BuildingName),
    techPark: clean(row.TechPark),
    buildingStructure: clean(row.BuildingStructure),
    ownershipStructure: clean(row.OwnershipStructure),
    developer: clean(row.Developer),
    floor: clean(row.Floor || row.ProposedFloor),
    proposedFloor: clean(row.ProposedFloor),
    unitNumber: clean(row.UnitNumber),
    floorPlate: clean(row.FloorPlate),
    estYearOfCompletion: clean(row.EstYearOfCompletion),
    availability: clean(row.Availability),
    availabilityDate: clean(row.AvailabilityDate),
    projectStatus: clean(row.ProjectStatus),
    handoverTimelines: clean(row.HandoverTimelines),
    occupancyCertificate: clean(row.OccupancyCertificate),
    areaSqft: num(row.OfferedSuperArea),
    offeredSuperArea: num(row.OfferedSuperArea),
    builtupArea: num(row.BuiltupArea),
    carpetArea: num(row.CarpetArea),
    totalLeasableAreaAvailable: num(row.TotalLeasableAreaAvailable),
    centerArea: num(row.CenterArea),
    totalDevelopmentSize: num(row.TotalDevelopmentSize),
    quotedRent: num(row.QuotedRent),
    achievableRent: num(row.AchievableRent),
    quotedSalePrice: num(row.QuotedSalePrice),
    quotedEfficiency: num(row.QuotedEfficiency),
    quotedCAM: clean(row.QuotedCAM),
    rentOptions: clean(row.RentOptions),
    escalation: clean(row.Escalation),
    escalationInterval: clean(row.EscalationInterval),
    parking: clean(row.ParkingRatio),
    parkingRatio: clean(row.ParkingRatio),
    additionalParkingCost: clean(row.AdditionalParkingCost),
    monthlyCarParkingCharges: num(row.MonthlyCarParkingCharges),
    NoOfSeatsOffered: num(row.NoOfSeatsOffered),
    centerSeatingCapacity: num(row.CenterSeatingCapacity),
    operator: clean(row.Operator),
    offeredSpace: clean(row.OfferedSpace),
    configuration: clean(row.Configuration),
    sizePerWorkstation: clean(row.SizePerWorkstation),
    monthlyCostPerSeat: num(row.MonthlyCostPerSeat),
    oneTimeSetupCost: num(row.OneTimeSetupCost),
    costOfModifications: clean(row.CostOfModifications),
    noOfCreditsProvided: num(row.NoOfCreditsProvided),
    standardOperatingHours: clean(row.StandardOperatingHours),
    chargesForMeeting: num(row.ChargesForMeeting),
    inclusions: clean(row.Inclusions),
    exclusions: clean(row.Exclusions),
    powerBackup: clean(row.PowerBackup),
    hvacSystem: clean(row.HVACSystem),
    elevators: clean(row.Elevators),
    buildingCertifications: clean(row.BuildingCertifications),
    lockinPeriod: clean(row.LockinPeriod),
    securityDeposit: clean(row.SecurityDeposit),
    noticePeriodForTermination: clean(row.NoticePeriodForTermination),
    tenantProfile: clean(row.TenantProfile),
    term: clean(row.Term),
    projectHighlights: clean(row.ProjectHighlights),
    centerHighlights: clean(row.CenterHighlights),
    aiAttributes: clean(row.AIAttributes),
    crmID: clean(row.crmID),
    creatorID: clean(row.CREATORID),
    createdTime: clean(row.CREATEDTIME),
    modifiedTime: clean(row.MODIFIEDTIME),
    // image: primaryImage,
    // gallery: primaryImage
    //   ? [
    //     {
    //       name: "Project_Picture_1.jpg",
    //       key: `${folder}Project_Picture_1.jpg`,
    //       url: primaryImage,
    //     },
    //   ]
    //   : [],
    imageFolderPath: folder,
  };
}