export const processSpine = [
  "Street outreach",
  "Coordinated Access",
  "Assessment & triage",
  "RRH / PSH",
  "Housing navigator",
  "Landlord engagement",
  "Housed (Housing First)",
  "Wrap-around services",
];

export const institutions = [
  { label: "City of Houston",              type: "gov"      },
  { label: "Harris County",               type: "gov"      },
  { label: "Houston Housing Authority",   type: "gov"      },
  { label: "VA (DeBakey)",                type: "gov"      },
  { label: "HUD",                         type: "funder"   },
  { label: "Houston Endowment",           type: "funder"   },
  { label: "Business community",          type: "funder"   },
  { label: "SEARCH",                      type: "service"  },
  { label: "The Beacon",                  type: "service"  },
  { label: "U.S.VETS",                    type: "service"  },
  { label: "Star of Hope",                type: "service"  },
  { label: "Salvation Army",              type: "service"  },
  { label: "New Hope Housing",            type: "service"  },
  { label: "Harris Health",               type: "health"   },
  { label: "Avenue 360",                  type: "health"   },
  { label: "Property owners / landlords", type: "landlord" },
  { label: "Houston Apartment Assoc.",    type: "landlord" },
  { label: "Community Advisory Council",  type: "voice"    },
];

export const hub = {
  label: "Coalition for the Homeless",
  role:  "Lead agency · coordinates the system · runs shared data (HMIS)",
};

export const bureaucracy = {
  stepsBefore: 76,
  stepsAfter:   6,
  daysBefore: 720,
  daysAfter:   32,
};
