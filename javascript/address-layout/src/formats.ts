export interface PostalFormat {
  pattern: string | null   // null = no postal system
  example: string
  label: string            // 'ZIP Code' | 'Postcode' | '郵便番号' | etc.
}

export const POSTAL_FORMATS: Record<string, PostalFormat> = {
  US: { pattern: '^\\\\d{5}(-\\\\d{4})?$', example: '10001', label: 'ZIP Code' },
  CA: { pattern: '^[A-Z]\\\\d[A-Z]\\\\s?\\\\d[A-Z]\\\\d$', example: 'M5V 3A8', label: 'Postal Code' },
  GB: { pattern: '^[A-Z]{1,2}\\\\d[A-Z\\\\d]?\\\\s?\\\\d[A-Z]{2}$', example: 'SW1A 1AA', label: 'Postcode' },
  CN: { pattern: '^\\\\d{6}$', example: '100000', label: '邮政编码' },
  JP: { pattern: '^\\\\d{3}-?\\\\d{4}$', example: '100-0001', label: '郵便番号' },
  KR: { pattern: '^\\\\d{5}$', example: '03000', label: '우편번호' },
  DE: { pattern: '^\\\\d{5}$', example: '10115', label: 'Postleitzahl' },
  FR: { pattern: '^\\\\d{5}$', example: '75001', label: 'Code postal' },
  AU: { pattern: '^\\\\d{4}$', example: '2000', label: 'Postcode' },
  NZ: { pattern: '^\\\\d{4}$', example: '1010', label: 'Postcode' },
  BR: { pattern: '^\\\\d{5}-?\\\\d{3}$', example: '01310-100', label: 'CEP' },
  MX: { pattern: '^\\\\d{5}$', example: '06600', label: 'Código Postal' },
  IN: { pattern: '^\\\\d{6}$', example: '110001', label: 'PIN Code' },
  AR: { pattern: '^[A-Z]\\\\d{4}[A-Z]{3}$', example: 'C1000AAA', label: 'Código Postal' },
  SG: { pattern: '^\\\\d{6}$', example: '018956', label: 'Postal Code' },
  TW: { pattern: '^\\\\d{3,5}$', example: '100', label: '郵遞區號' },
  HK: { pattern: null, example: '', label: 'District' },
  MO: { pattern: null, example: '', label: 'District' },
  RU: { pattern: '^\\\\d{6}$', example: '101000', label: 'Почтовый index' },
  TR: { pattern: '^\\\\d{5}$', example: '34000', label: 'Posta Kodu' },
  SA: { pattern: '^\\\\d{5}(-\\\\d{4})?$', example: '11564', label: 'Postal Code' },
  AE: { pattern: null, example: '', label: 'Emirate' },
  NL: { pattern: '^\\\\d{4}\\\\s?[A-Z]{2}$', example: '1011 AB', label: 'Postcode' },
  BE: { pattern: '^\\\\d{4}$', example: '1000', label: 'Code postal' },
  CH: { pattern: '^\\\\d{4}$', example: '8001', label: 'PLZ' },
  AT: { pattern: '^\\\\d{4}$', example: '1010', label: 'PLZ' },
  SE: { pattern: '^\\\\d{3}\\\\s?\\\\d{2}$', example: '111 22', label: 'Postnummer' },
  NO: { pattern: '^\\\\d{4}$', example: '0150', label: 'Postnummer' },
  DK: { pattern: '^\\\\d{4}$', example: '1000', label: 'Postnummer' },
  FI: { pattern: '^\\\\d{5}$', example: '00100', label: 'Postinumero' },
  PL: { pattern: '^\\\\d{2}-\\\\d{3}$', example: '00-001', label: 'Kod pocztowy' },
  IT: { pattern: '^\\\\d{5}$', example: '00100', label: 'CAP' },
  ES: { pattern: '^\\\\d{5}$', example: '28001', label: 'Código Postal' },
  PT: { pattern: '^\\\\d{4}-\\\\d{3}$', example: '1000-001', label: 'Código Postal' },
}

export function validatePostal(countryCode: string, value: string): boolean {
  const fmt = POSTAL_FORMATS[countryCode]
  if (!fmt) return true // unknown country: allow anything
  if (fmt.pattern === null) return true // no postal system
  const re = new RegExp(fmt.pattern, 'i')
  return re.test(value.trim())
}
