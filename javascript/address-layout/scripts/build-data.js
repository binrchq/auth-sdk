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

// Translations seed (Admin1 names)
const TRANSLATIONS = {
  zh: {
    CN: {
      '01': '安徽', '02': '浙江', '03': '江西', '04': '江苏', '05': '吉林',
      '07': '辽宁', '08': '内蒙古', '09': '宁夏', '10': '青海', '11': '山东',
      '12': '山西', '13': '陕西', '14': '四川', '15': '西藏', '16': '新疆',
      '17': '云南', '18': '甘肃', '19': '广西', '20': '贵州', '21': '海南',
      '22': '北京', '23': '上海', '24': '天津', '25': '重庆', '26': '河北',
      '27': '河南', '28': '湖北', '29': '湖南', '30': '广东', '31': '福建',
      '32': '黑龙江'
    },
    TW: {
      'TPE': '台北市', 'NWT': '新北市', 'KHH': '高雄市', 'TXG': '台中市',
      'TNN': '台南市', 'TYN': '桃园市'
    }
  }
};

async function build() {
  console.log('Building address data with compression...');
  const countries = {};

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
      countries[countryCode] = {
        s: [], // String pool
        m: new Map(), // String to index map for speed
        a: {}, // Admin1 map
        p: {}, // Postal map
        c: {}, // Cities map
      };
    }

    const country = countries[countryCode];

    const getStrIdx = (str) => {
      if (!str) return -1;
      if (country.m.has(str)) return country.m.get(str);
      const idx = country.s.length;
      country.s.push(str);
      country.m.set(str, idx);
      return idx;
    };

    const placeIdx = getStrIdx(placeName);
    const admin1Idx = getStrIdx(admin1Name);
    const admin2Idx = getStrIdx(admin2Name);

    // Admin 1 mapping
    if (admin1Code && !country.a[admin1Code]) {
      country.a[admin1Code] = admin1Idx;
    }

    // Postal code mapping
    const pEntry = [placeIdx, admin1Code];
    if (admin2Idx !== -1 && admin2Idx !== placeIdx) {
      pEntry.push(admin2Idx);
    }
    // Optimization: if same postal code exists, check if we should overwrite
    // (GeoNames sometimes has multiple entries for same postal code)
    country.p[postalCode] = pEntry;

    // Cities per Admin 1
    if (admin1Code && placeIdx !== -1) {
      if (!country.c[admin1Code]) {
        country.c[admin1Code] = new Set();
      }
      country.c[admin1Code].add(placeIdx);
    }

    count++;
    if (count % 100000 === 0) {
      console.log(`Processed ${count} lines...`);
    }
  }

  console.log('Saving country files...');
  for (const [code, data] of Object.entries(countries)) {
    // Convert Sets to sorted Arrays of indices
    for (const a1Code in data.c) {
      data.c[a1Code] = Array.from(data.c[a1Code]).sort((a, b) => {
        return data.s[a].localeCompare(data.s[b]);
      });
    }

    // Clean up temporary Map before saving
    delete data.m;

    fs.writeFileSync(
      path.join(OUT_DIR, `${code}.json`),
      JSON.stringify(data)
    );
  }

  // Save translations
  console.log('Saving translations...');
  const localeDir = path.join(OUT_DIR, 'locales');
  if (!fs.existsSync(localeDir)) fs.mkdirSync(localeDir);

  for (const [lang, countryMap] of Object.entries(TRANSLATIONS)) {
    const langDir = path.join(localeDir, lang);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir);
    for (const [code, trans] of Object.entries(countryMap)) {
      fs.writeFileSync(
        path.join(langDir, `${code}.json`),
        JSON.stringify(trans)
      );
    }
  }

  console.log(`Done! Processed ${count} records for ${Object.keys(countries).length} countries.`);
}

build().catch(console.error);
