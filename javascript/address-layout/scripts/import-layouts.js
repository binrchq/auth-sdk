import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findFormatsFile() {
  // Start searching from the project root or parent directories
  let currentDir = path.resolve(__dirname, '../../../../'); 
  const targets = [
    'app/adapter/node_modules/i18n-postal-address/dist/formats/index.js',
    'node_modules/i18n-postal-address/dist/formats/index.js'
  ];

  // Try walking up from the current script location to find the node_modules
  let walkDir = __dirname;
  while (walkDir !== path.parse(walkDir).root) {
    for (const target of targets) {
      const fullPath = path.join(walkDir, target);
      if (fs.existsSync(fullPath)) return fullPath;
      // Also check if it's directly in a node_modules folder we just passed
      const directNodeModules = path.join(walkDir, 'node_modules/i18n-postal-address/dist/formats/index.js');
      if (fs.existsSync(directNodeModules)) return directNodeModules;
    }
    walkDir = path.dirname(walkDir);
  }

  throw new Error('Could not find i18n-postal-address/dist/formats/index.js. Please ensure i18n-postal-address is installed in the workspace.');
}

const SRC_FILE = findFormatsFile();
const DEST_FILE = path.join(__dirname, '../src/layouts.generated.ts');

function transform() {
  console.log('Transforming layouts from i18n-postal-address...');
  let content = fs.readFileSync(SRC_FILE, 'utf-8');

  // Replace imports
  content = content.replace(/import \{ .* \} from '\.\.\/address-transforms\.js';/, "import { addCommaAfter, capitalize } from './utils.js';");

  // Add types
  content = "import { addCommaAfter, capitalize } from './utils.js';\n\n" +
            "export interface LayoutPart {\n" +
            "  attribute: string;\n" +
            "  transforms?: Array<(v: string) => string>;\n" +
            "}\n\n" +
            "export type LayoutLine = Array<string | LayoutPart>;\n\n" +
            "export interface AddressLayout {\n" +
            "  array: LayoutLine[];\n" +
            "}\n\n" +
            "export type CountryLayouts = Record<string, AddressLayout>;\n\n" +
            content.substring(content.indexOf('export const AR'));

  // Collect all exports to build the ALL_LAYOUTS map
  const countryCodes = [];
  const exportMatches = content.matchAll(/export const ([A-Z]{2}) =/g);
  for (const match of exportMatches) {
    countryCodes.push(match[1]);
  }

  // Handle aliases like export { AR as BO, ... }
  const aliases = {};
  const aliasMatches = content.matchAll(/export \{ ([A-Z]{2}) as ([A-Z]{2})/g);
  for (const match of aliasMatches) {
    aliases[match[2]] = match[1];
  }
  
  // Note: matchAll above only gets the first one in a line like "export { AR as BO, AR as CL }"
  // Let's do it more robustly
  const aliasBlocks = content.matchAll(/export \{ ([^\}]+) \};/g);
  for (const block of aliasBlocks) {
    const parts = block[1].split(',');
    for (const part of parts) {
      const subMatch = part.trim().match(/([A-Z]{2}) as ([A-Z]{2})/);
      if (subMatch) {
        aliases[subMatch[2]] = subMatch[1];
      }
    }
  }

  let allLayoutsStr = "\nexport const ALL_LAYOUTS: Record<string, CountryLayouts> = {\n";
  for (const code of countryCodes) {
    allLayoutsStr += `  ${code},\n`;
  }
  for (const [alias, target] of Object.entries(aliases)) {
    allLayoutsStr += `  ${alias}: ${target},\n`;
  }
  allLayoutsStr += "};\n";

  fs.writeFileSync(DEST_FILE, content + allLayoutsStr);
  console.log(`Generated ${DEST_FILE} with ${countryCodes.length} countries and ${Object.keys(aliases).length} aliases.`);
}

transform();
