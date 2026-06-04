import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data/allCountries.txt');
const OUT_DIR = path.join(__dirname, '../generated');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

interface CountryData {
  a1: Record<string, string>;
  p: Record<string, [string, string] | [string, string, string]>;
  c: Record<string, string[]>;
}

async function build() {
  console.log('Building address data...');
  const countries: Record<string, CountryData> = {};

  const fileStream = fs.createReadStream(DATA_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let count = 0;
  for await (const line of rl) {
    const fields = line.split('\t');
    if (fields.length < 5) continue;

    const countryCode = fields[0];
    const postalCode = fields[1];
    const placeName = fields[2];
    const admin1Name = fields[3];
    const admin1Code = fields[4];
    const admin2Name = fields[5];

    if (!countries[countryCode]) {
      countries[countryCode] = { a1: {}, p: {}, c: {} };
    }

    const country = countries[countryCode];

    // Admin 1 (State/Province)
    if (admin1Code && admin1Name && !country.a1[admin1Code]) {
      country.a1[admin1Code] = admin1Name;
    }

    // Postal code mapping
    // Store: [placeName, admin1Code, admin2Name]
    // We only store admin2Name if it's different from placeName and not empty
    const pEntry: [string, string, string?] = [placeName, admin1Code];
    if (admin2Name && admin2Name !== placeName) {
      pEntry.push(admin2Name);
    }
    country.p[postalCode] = pEntry as [string, string] | [string, string, string];

    // Cities per Admin 1
    if (admin1Code) {
      if (!country.c[admin1Code]) {
        country.c[admin1Code] = [];
      }
      if (!country.c[admin1Code].includes(placeName)) {
        country.c[admin1Code].push(placeName);
      }
    }

    count++;
    if (count % 100000 === 0) {
      console.log(`Processed ${count} lines...`);
    }
  }

  console.log('Saving country files...');
  for (const [code, data] of Object.entries(countries)) {
    // Sort cities for better DX
    for (const admin1Code in data.c) {
      data.c[admin1Code].sort();
    }
    fs.writeFileSync(
      path.join(OUT_DIR, `${code}.json`),
      JSON.stringify(data)
    );
  }

  console.log(`Done! Processed ${count} records for ${Object.keys(countries).length} countries.`);
}

build().catch(console.error);
