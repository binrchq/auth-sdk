import { AddressLayout } from './layouts.js';

export interface CountryData {
  /** Strings pool (interned strings to save space) */
  s: string[];
  /** Admin1 (State/Province) mapping: code -> string index */
  a: Record<string, number>;
  /** Postal code mapping: code -> [place index, admin1 code, admin2 index?] */
  p: Record<string, [number, string] | [number, string, number]>;
  /** Cities list per Admin1: admin1Code -> array of place string indices */
  c: Record<string, number[]>;
}

export interface PostalResult {
  postalCode: string;
  placeName: string;
  admin1Code: string;
  admin1Name: string;
  admin2Name?: string;
  // Aliases for compatibility
  city?: string;
  state?: string;
  province?: string;
  region?: string;
  country?: string;
}

export interface AddressLayoutSDK {
  /** Load country data with optional locale */
  load(countryCode: string, locale?: string): Promise<boolean>;
  /** Look up a postal code → place info */
  lookupPostal(countryCode: string, postalCode: string, locale?: string): Promise<PostalResult | null>;
  /** Get admin1 list for a country */
  getAdmin1List(countryCode: string, locale?: string): Promise<Array<{ code: string; name: string }>>;
  /** Get city list for a country+admin1 */
  getCities(countryCode: string, admin1Code: string): Promise<string[]>;
  /** Normalize postal code input */
  normalizePostal(countryCode: string, input: string): Promise<string | null>;
  /** Get layout template for a country */
  getLayout(countryCode: string, variant?: string): AddressLayout | null;
}
