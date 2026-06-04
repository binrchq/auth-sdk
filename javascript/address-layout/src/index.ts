import { fileURLToPath } from 'url';
import { AddressLayoutSDK, CountryData, PostalResult } from './types.js';
import { validatePostal } from './formats.js';
import { getLayout, AddressLayout } from './layouts.js';

export class AddressSDK implements AddressLayoutSDK {
  private cache: Record<string, CountryData> = {};
  private translations: Record<string, Record<string, Record<string, string>>> = {};
  private dataPath: string;

  constructor(dataPath?: string) {
    if (dataPath) {
      this.dataPath = dataPath;
    } else {
      try {
        this.dataPath = fileURLToPath(new URL('../generated', import.meta.url));
      } catch (e) {
        this.dataPath = './generated';
      }
    }
  }

  private async fetchJSON(path: string) {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = await import('fs/promises');
      const content = await fs.readFile(path, 'utf-8');
      return JSON.parse(content);
    } else {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    }
  }

  async load(countryCode: string, locale?: string): Promise<boolean> {
    const code = countryCode.toUpperCase();
    
    // Load main data
    if (!this.cache[code]) {
      try {
        const path = await import('path');
        const data = await this.fetchJSON(path.join(this.dataPath, `${code}.json`));
        if (!data) return false;
        this.cache[code] = data;
      } catch (e) {
        return false;
      }
    }

    // Load locale if requested
    if (locale) {
      if (!this.translations[locale]) this.translations[locale] = {};
      if (!this.translations[locale][code]) {
        try {
          const path = await import('path');
          const transPath = path.join(this.dataPath, 'locales', locale, `${code}.json`);
          const trans = await this.fetchJSON(transPath);
          this.translations[locale][code] = trans || {};
        } catch (e) {
          this.translations[locale][code] = {};
        }
      }
    }

    return true;
  }

  private getAdmin1Name(code: string, admin1Code: string, locale?: string): string {
    const data = this.cache[code];
    if (!data) return '';

    if (locale && this.translations[locale]?.[code]?.[admin1Code]) {
      return this.translations[locale][code][admin1Code];
    }

    const idx = data.a[admin1Code];
    return idx !== undefined ? data.s[idx] : '';
  }

  async lookupPostal(countryCode: string, postalCode: string, locale?: string): Promise<PostalResult | null> {
    const code = countryCode.toUpperCase();
    if (!await this.load(code, locale)) return null;

    const data = this.cache[code];
    const normalized = postalCode.trim().toUpperCase();
    const entry = data.p[normalized];
    if (!entry) return null;

    const [placeIdx, admin1Code, admin2Idx] = entry;
    const placeName = data.s[placeIdx];
    const admin1Name = this.getAdmin1Name(code, admin1Code, locale);
    const admin2Name = admin2Idx !== undefined ? data.s[admin2Idx] : undefined;

    return {
      postalCode: normalized,
      placeName,
      admin1Code,
      admin1Name,
      admin2Name,
      city: placeName,
      state: admin1Name,
      province: admin1Name,
      region: admin2Name || admin1Name,
      country: code,
    };
  }

  async getAdmin1List(countryCode: string, locale?: string): Promise<Array<{ code: string; name: string }>> {
    const code = countryCode.toUpperCase();
    if (!await this.load(code, locale)) return [];

    const data = this.cache[code];
    return Object.keys(data.a).map(admin1Code => ({
      code: admin1Code,
      name: this.getAdmin1Name(code, admin1Code, locale),
    }));
  }

  async getCities(countryCode: string, admin1Code: string): Promise<string[]> {
    const code = countryCode.toUpperCase();
    if (!await this.load(code)) return [];

    const data = this.cache[code];
    const indices = data.c[admin1Code] || [];
    return indices.map(idx => data.s[idx]);
  }

  async normalizePostal(countryCode: string, input: string): Promise<string | null> {
    const normalized = input.trim().toUpperCase();
    if (validatePostal(countryCode, normalized)) {
      const code = countryCode.toUpperCase();
      if (await this.load(code)) {
        if (this.cache[code].p[normalized]) return normalized;
        return null;
      }
      return normalized;
    }
    return null;
  }

  getLayout(countryCode: string, variant: string = 'default'): AddressLayout | null {
    return getLayout(countryCode, variant);
  }
}

export const addressSDK = new AddressSDK();
export * from './types.js';
export * from './formats.js';
export * from './layouts.js';
export * from './utils.js';
