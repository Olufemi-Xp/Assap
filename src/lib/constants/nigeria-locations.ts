import { NIGERIA_STATES, type NigeriaState } from "./nigeria-states.ts";

/**
 * Hierarchical location data used by the customer Location Module:
 *   State -> City (major urban centre) -> Local Government Area (LGA)
 *
 * Each city lists the official LGAs that make up (or primarily cover) it.
 * This is a curated set of major service markets per state and can be
 * extended without code changes elsewhere.
 */
export interface NigeriaCity {
  name: string;
  lgas: readonly string[];
}

export const NIGERIA_CITIES_BY_STATE: Record<NigeriaState, readonly NigeriaCity[]> = {
  abia: [
    { name: "Umuahia", lgas: ["Umuahia North", "Umuahia South"] },
    { name: "Aba", lgas: ["Aba North", "Aba South", "Osisioma Ngwa", "Obingwa"] },
  ],
  adamawa: [
    { name: "Yola", lgas: ["Yola North", "Yola South", "Girei"] },
    { name: "Mubi", lgas: ["Mubi North", "Mubi South"] },
  ],
  akwa_ibom: [
    { name: "Uyo", lgas: ["Uyo", "Uruan", "Ibesikpo Asutan", "Itu"] },
    { name: "Eket", lgas: ["Eket", "Esit Eket"] },
    { name: "Ikot Ekpene", lgas: ["Ikot Ekpene"] },
  ],
  anambra: [
    { name: "Awka", lgas: ["Awka North", "Awka South"] },
    { name: "Onitsha", lgas: ["Onitsha North", "Onitsha South", "Ogbaru", "Idemili North"] },
    { name: "Nnewi", lgas: ["Nnewi North", "Nnewi South"] },
  ],
  bauchi: [
    { name: "Bauchi", lgas: ["Bauchi"] },
    { name: "Azare", lgas: ["Katagum"] },
  ],
  bayelsa: [
    { name: "Yenagoa", lgas: ["Yenagoa"] },
    { name: "Ogbia", lgas: ["Ogbia"] },
    { name: "Brass", lgas: ["Brass"] },
  ],
  benue: [
    { name: "Makurdi", lgas: ["Makurdi", "Guma"] },
    { name: "Gboko", lgas: ["Gboko"] },
    { name: "Otukpo", lgas: ["Otukpo"] },
  ],
  borno: [
    { name: "Maiduguri", lgas: ["Maiduguri", "Jere"] },
    { name: "Biu", lgas: ["Biu"] },
  ],
  cross_river: [
    { name: "Calabar", lgas: ["Calabar Municipal", "Calabar South", "Akpabuyo", "Odukpani"] },
    { name: "Ikom", lgas: ["Ikom"] },
    { name: "Ogoja", lgas: ["Ogoja"] },
  ],
  delta: [
    { name: "Asaba", lgas: ["Oshimili South", "Oshimili North"] },
    { name: "Warri", lgas: ["Warri South", "Warri South-West", "Uvwie", "Udu"] },
    { name: "Sapele", lgas: ["Sapele"] },
    { name: "Ughelli", lgas: ["Ughelli North", "Ughelli South"] },
  ],
  ebonyi: [
    { name: "Abakaliki", lgas: ["Abakaliki", "Ebonyi", "Izzi"] },
    { name: "Afikpo", lgas: ["Afikpo North", "Afikpo South"] },
  ],
  edo: [
    { name: "Benin City", lgas: ["Oredo", "Egor", "Ikpoba-Okha", "Ovia North-East"] },
    { name: "Auchi", lgas: ["Etsako West"] },
    { name: "Ekpoma", lgas: ["Esan West"] },
  ],
  ekiti: [
    { name: "Ado-Ekiti", lgas: ["Ado Ekiti", "Irepodun/Ifelodun"] },
    { name: "Ikere", lgas: ["Ikere"] },
    { name: "Ikole", lgas: ["Ikole"] },
  ],
  enugu: [
    { name: "Enugu", lgas: ["Enugu North", "Enugu South", "Enugu East"] },
    { name: "Nsukka", lgas: ["Nsukka"] },
    { name: "Oji River", lgas: ["Oji River"] },
  ],
  fct: [
    { name: "Abuja", lgas: ["Abuja Municipal (AMAC)", "Bwari"] },
    { name: "Gwagwalada", lgas: ["Gwagwalada"] },
    { name: "Kuje", lgas: ["Kuje"] },
    { name: "Kwali", lgas: ["Kwali"] },
    { name: "Abaji", lgas: ["Abaji"] },
  ],
  gombe: [
    { name: "Gombe", lgas: ["Gombe", "Akko"] },
    { name: "Kaltungo", lgas: ["Kaltungo"] },
  ],
  imo: [
    { name: "Owerri", lgas: ["Owerri Municipal", "Owerri North", "Owerri West"] },
    { name: "Orlu", lgas: ["Orlu"] },
    { name: "Okigwe", lgas: ["Okigwe"] },
  ],
  jigawa: [
    { name: "Dutse", lgas: ["Dutse"] },
    { name: "Hadejia", lgas: ["Hadejia"] },
    { name: "Kazaure", lgas: ["Kazaure"] },
  ],
  kaduna: [
    { name: "Kaduna", lgas: ["Kaduna North", "Kaduna South", "Chikun", "Igabi"] },
    { name: "Zaria", lgas: ["Zaria", "Sabon Gari"] },
    { name: "Kafanchan", lgas: ["Jema'a"] },
  ],
  kano: [
    {
      name: "Kano",
      lgas: ["Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nassarawa", "Ungogo", "Kumbotso"],
    },
  ],
  katsina: [
    { name: "Katsina", lgas: ["Katsina", "Batagarawa"] },
    { name: "Funtua", lgas: ["Funtua"] },
    { name: "Daura", lgas: ["Daura"] },
  ],
  kebbi: [
    { name: "Birnin Kebbi", lgas: ["Birnin Kebbi"] },
    { name: "Argungu", lgas: ["Argungu"] },
    { name: "Yauri", lgas: ["Yauri"] },
  ],
  kogi: [
    { name: "Lokoja", lgas: ["Lokoja"] },
    { name: "Okene", lgas: ["Okene"] },
    { name: "Idah", lgas: ["Idah"] },
    { name: "Anyigba", lgas: ["Dekina"] },
  ],
  kwara: [
    { name: "Ilorin", lgas: ["Ilorin West", "Ilorin East", "Ilorin South"] },
    { name: "Offa", lgas: ["Offa"] },
    { name: "Omu-Aran", lgas: ["Irepodun"] },
  ],
  lagos: [
    {
      name: "Lagos Metropolis",
      lgas: [
        "Agege",
        "Ajeromi-Ifelodun",
        "Alimosho",
        "Amuwo-Odofin",
        "Apapa",
        "Eti-Osa",
        "Ifako-Ijaiye",
        "Ikeja",
        "Kosofe",
        "Lagos Island",
        "Lagos Mainland",
        "Mushin",
        "Ojo",
        "Oshodi-Isolo",
        "Shomolu",
        "Surulere",
      ],
    },
    { name: "Ikorodu", lgas: ["Ikorodu"] },
    { name: "Lekki / Ibeju-Lekki", lgas: ["Ibeju-Lekki"] },
    { name: "Epe", lgas: ["Epe"] },
    { name: "Badagry", lgas: ["Badagry"] },
  ],
  nasarawa: [
    { name: "Lafia", lgas: ["Lafia"] },
    { name: "Karu", lgas: ["Karu"] },
    { name: "Keffi", lgas: ["Keffi"] },
    { name: "Akwanga", lgas: ["Akwanga"] },
  ],
  niger: [
    { name: "Minna", lgas: ["Chanchaga", "Bosso"] },
    { name: "Suleja", lgas: ["Suleja"] },
    { name: "Bida", lgas: ["Bida"] },
    { name: "Kontagora", lgas: ["Kontagora"] },
  ],
  ogun: [
    { name: "Abeokuta", lgas: ["Abeokuta North", "Abeokuta South", "Odeda"] },
    { name: "Ota", lgas: ["Ado-Odo/Ota"] },
    { name: "Ifo", lgas: ["Ifo"] },
    { name: "Ijebu-Ode", lgas: ["Ijebu Ode"] },
    { name: "Sagamu", lgas: ["Sagamu"] },
  ],
  ondo: [
    { name: "Akure", lgas: ["Akure South", "Akure North"] },
    { name: "Ondo", lgas: ["Ondo West", "Ondo East"] },
    { name: "Owo", lgas: ["Owo"] },
  ],
  osun: [
    { name: "Osogbo", lgas: ["Osogbo", "Olorunda"] },
    { name: "Ile-Ife", lgas: ["Ife Central", "Ife East", "Ife North", "Ife South"] },
    { name: "Ilesa", lgas: ["Ilesa East", "Ilesa West"] },
    { name: "Iwo", lgas: ["Iwo"] },
  ],
  oyo: [
    {
      name: "Ibadan",
      lgas: [
        "Ibadan North",
        "Ibadan North-East",
        "Ibadan North-West",
        "Ibadan South-East",
        "Ibadan South-West",
        "Akinyele",
        "Egbeda",
        "Ido",
        "Lagelu",
        "Oluyole",
        "Ona Ara",
      ],
    },
    { name: "Ogbomosho", lgas: ["Ogbomosho North", "Ogbomosho South"] },
    { name: "Oyo", lgas: ["Oyo East", "Oyo West", "Atiba"] },
    { name: "Iseyin", lgas: ["Iseyin"] },
  ],
  plateau: [
    { name: "Jos", lgas: ["Jos North", "Jos South", "Jos East"] },
    { name: "Pankshin", lgas: ["Pankshin"] },
    { name: "Shendam", lgas: ["Shendam"] },
  ],
  rivers: [
    { name: "Port Harcourt", lgas: ["Port Harcourt", "Obio/Akpor", "Eleme", "Oyigbo", "Okrika"] },
    { name: "Bonny", lgas: ["Bonny"] },
    { name: "Ahoada", lgas: ["Ahoada East", "Ahoada West"] },
    { name: "Omoku", lgas: ["Ogba/Egbema/Ndoni"] },
  ],
  sokoto: [
    { name: "Sokoto", lgas: ["Sokoto North", "Sokoto South", "Wamako"] },
    { name: "Tambuwal", lgas: ["Tambuwal"] },
  ],
  taraba: [
    { name: "Jalingo", lgas: ["Jalingo"] },
    { name: "Wukari", lgas: ["Wukari"] },
    { name: "Takum", lgas: ["Takum"] },
  ],
  yobe: [
    { name: "Damaturu", lgas: ["Damaturu"] },
    { name: "Potiskum", lgas: ["Potiskum"] },
    { name: "Gashua", lgas: ["Bade"] },
    { name: "Nguru", lgas: ["Nguru"] },
  ],
  zamfara: [
    { name: "Gusau", lgas: ["Gusau"] },
    { name: "Kaura Namoda", lgas: ["Kaura Namoda"] },
    { name: "Talata Mafara", lgas: ["Talata Mafara"] },
  ],
};

export interface SelectedLocation {
  state: string;
  city: string;
  lga: string;
}

export const EMPTY_LOCATION: SelectedLocation = { state: "", city: "", lga: "" };

export function isNigeriaState(value: string): value is NigeriaState {
  return Object.prototype.hasOwnProperty.call(NIGERIA_CITIES_BY_STATE, value);
}

export function getStateLabel(value: string | null | undefined): string {
  if (!value) return "";
  return NIGERIA_STATES.find((s) => s.value === value)?.label ?? value;
}

export function getCitiesForState(state: string): readonly NigeriaCity[] {
  return isNigeriaState(state) ? NIGERIA_CITIES_BY_STATE[state] : [];
}

export function getLgasForCity(state: string, city: string): readonly string[] {
  return getCitiesForState(state).find((c) => c.name === city)?.lgas ?? [];
}

/** Returns all LGAs in a state (or narrowed to a city when a city is selected). */
export function getLgasForState(state: string, city?: string): readonly string[] {
  if (city) return getLgasForCity(state, city);
  const all = getCitiesForState(state).flatMap((c) => c.lgas);
  return Array.from(new Set(all));
}

/** Validates a (possibly partial) hierarchical location; returns a normalised copy or null. */
export function normalizeLocation(input: Partial<SelectedLocation> | null | undefined): SelectedLocation | null {
  const state = input?.state?.trim() ?? "";
  const city = input?.city?.trim() ?? "";
  const lga = input?.lga?.trim() ?? "";
  if (!state) return { ...EMPTY_LOCATION };
  if (!isNigeriaState(state)) return null;
  if (city && !getCitiesForState(state).some((c) => c.name === city)) return null;
  if (lga && !getLgasForState(state, city || undefined).includes(lga)) return null;
  return { state, city, lga };
}

/** Readable "LGA, City, State" label for UI. */
export function formatLocation(loc: { state?: string | null; city?: string | null; lga?: string | null }): string {
  return [loc.lga, loc.city, getStateLabel(loc.state)].filter(Boolean).join(", ");
}
