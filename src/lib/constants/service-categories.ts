export const SERVICE_CATEGORIES = [
  { value: "plumber", label: "Plumbing", description: "Pipes, leaks, drainage, water tanks" },
  { value: "electrician", label: "Electrical", description: "Wiring, fixtures, appliances, panels" },
  { value: "cleaner", label: "Cleaning", description: "Home, office, post-construction cleaning" },
  { value: "carpenter", label: "Carpentry", description: "Furniture, wood repairs, roofing, doors" },
  { value: "laundry", label: "Laundry & Dry Cleaning", description: "Washing, ironing, delicate fabric care" },
  { value: "mechanic", label: "Auto Mechanic", description: "Car servicing, diagnostics, brakes" },
  { value: "painter", label: "Painting", description: "Interior, exterior, finishing" },
  { value: "ac_technician", label: "AC & Refrigeration", description: "Servicing, gas refill, installation" },
  { value: "other", label: "Other Services", description: "Handyman and other everyday local services" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

export const SERVICE_CATEGORY_VALUES = SERVICE_CATEGORIES.map((c) => c.value);
