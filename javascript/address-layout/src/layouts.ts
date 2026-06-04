import * as Generated from './layouts.generated.js';

export type { LayoutPart, LayoutLine, AddressLayout, CountryLayouts } from './layouts.generated.js';

export const ALL_LAYOUTS = Generated.ALL_LAYOUTS;

export function getLayout(countryCode: string, variant: string = 'default'): Generated.AddressLayout | null {
  const code = countryCode.toUpperCase();
  const layouts = (ALL_LAYOUTS as any)[code];
  if (!layouts) return (ALL_LAYOUTS as any)['US'].default; // Fallback to US
  return layouts[variant] || layouts.default;
}
