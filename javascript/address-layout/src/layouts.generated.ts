import { addCommaAfter, capitalize } from './utils.js';

export interface LayoutPart {
  attribute: string;
  transforms?: Array<(v: string) => string>;
}

export type LayoutLine = Array<string | LayoutPart>;

export interface AddressLayout {
  array: LayoutLine[];
}

export type CountryLayouts = Record<string, AddressLayout>;

export const AR = {
    default: {
        array: [
            ['honorificPrefix', 'givenName', 'additionalName', 'firstFamilyName'],
            ['secondFamilyName', 'honorificSuffix'],
            ['companyName'],
            ['careOf'],
            ['address1', 'address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AU = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize, addCommaAfter] },
                'state',
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AT = {
    default: {
        array: [
            ['honorificPrefix'],
            ['givenName', 'additionalName', 'familyName', 'honorificSuffix'],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BS = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [addCommaAfter] }, 'region'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BR = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }, 'state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
const _caEnglish = {
    array: [
        ['honorificPrefix', 'givenName', 'familyName', 'honorificSuffix'],
        ['companyName'],
        ['careOf'],
        ['address1', 'address2'],
        [
            { attribute: 'city', transforms: [capitalize, addCommaAfter] },
            'province',
            'postalCode',
        ],
        [{ attribute: 'country', transforms: [capitalize] }],
    ],
};
export const CA = {
    english: _caEnglish,
    french: {
        array: [
            ['honorificPrefix', 'givenName', 'familyName', 'honorificSuffix'],
            ['companyName'],
            ['careOf'],
            ['address1', 'address2'],
            ['city', 'province'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
    default: _caEnglish,
};
export const CH = {
    default: {
        array: [
            ['companyName'],
            ['honorificPrefix', 'givenName', 'familyName', 'honorificSuffix'],
            ['careOf'],
            ['address1', 'address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CN = {
    default: {
        array: [
            [{ attribute: 'country', transforms: [capitalize] }],
            ['province', 'city'],
            ['careOf'],
            ['address1', 'address2'],
            ['companyName'],
            ['familyName', 'givenName', 'honorificPrefix', 'honorificSuffix'],
        ],
    },
};
export const CZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const DE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'title',
                'givenName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const DK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'title',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const ES = {
    default: {
        array: [
            ['honorificPrefix', 'givenName', 'additionalName', 'firstFamilyName'],
            ['secondFamilyName', 'honorificSuffix'],
            ['companyName'],
            ['careOf'],
            ['address1', 'address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const FI = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const FR = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const HR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const HU = {
    business: {
        array: [
            [
                'honorificPrefix',
                'honorificSuffix',
                'familyName',
                'givenName',
                'additionalName',
            ],
            ['companyName'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
    default: {
        array: [
            ['honorificPrefix', 'honorificSuffix', 'familyName', 'givenName'],
            ['companyName'],
            [{ attribute: 'city', transforms: [capitalize] }],
            ['careOf'],
            ['address1', 'address2'],
            ['postalCode'],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IT = {
    default: {
        array: [
            ['honorificPrefix', 'givenName', 'familyName', 'honorificSuffix'],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                'postalCode',
                { attribute: 'city', transforms: [capitalize] },
                'province',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const JP = {
    default: {
        array: [
            [{ attribute: 'country', transforms: [capitalize] }],
            ['postalCode', 'prefecture', 'city'],
            ['careOf'],
            ['address1', 'address2'],
            ['companyName'],
            ['familyName', 'givenName', 'honorificPrefix', 'honorificSuffix'],
        ],
    },
};
export const KR = {
    default: {
        array: [
            ['familyName', 'givenName', 'honorificPrefix', 'honorificSuffix'],
            ['companyName'],
            ['careOf'],
            ['do', 'si', 'dong', 'gu', 'addressNum'],
            ['postalCode', { attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MY = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NL = {
    business: {
        array: [
            ['companyName'],
            [
                't.a.v.',
                'title',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
const _noPersonal = {
    array: [
        [
            'honorificPrefix',
            'givenName',
            'additionalName',
            'familyName',
            'honorificSuffix',
        ],
        ['careOf'],
        ['address1'],
        ['address2'],
        [
            'postalCode',
            {
                attribute: 'city',
                transforms: [capitalize],
            },
        ],
        [{ attribute: 'country', transforms: [capitalize] }],
    ],
};
export const NO = {
    business: {
        array: [
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['givenName', 'familyName', 'honorificSuffix'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
    personal: _noPersonal,
    default: _noPersonal,
};
export const PL = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PT = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const RO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const RU = {
    default: {
        array: [
            [{ attribute: 'country', transforms: [capitalize] }],
            [
                'republic',
                'state',
                'region',
                { attribute: 'city', transforms: [capitalize] },
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['companyName'],
            ['familyName'],
            ['givenName', 'additionalName', 'honorificSuffix'],
        ],
    },
};
export const SG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
const _sePersonal = {
    array: [
        [
            'honorificPrefix',
            'givenName',
            'additionalName',
            'familyName',
            'honorificSuffix',
        ],
        ['careOf'],
        ['address1'],
        ['address2'],
        [
            'postalCode',
            {
                attribute: 'city',
                transforms: [capitalize],
            },
        ],
        [{ attribute: 'country', transforms: [capitalize] }],
    ],
};
export const SE = {
    business: {
        array: [
            ['companyName'],
            ['givenName', 'familyName', 'honorificSuffix'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
    personal: _sePersonal,
    default: _sePersonal,
};
export const TR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city', 'state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const US = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize, addCommaAfter] },
                'state',
                'postalCode',
            ],
            [
                {
                    attribute: 'country',
                    transforms: [capitalize],
                },
            ],
        ],
    },
};
export const AC = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AD = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['region'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AF = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AI = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AL = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode'],
            ['city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode'],
            ['city'],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AS = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AX = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BB = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [addCommaAfter] },
                'region',
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BD = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BE = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BF = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BL = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BT = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BY = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'postalCode', transforms: [addCommaAfter] }, 'city'],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CC = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CI = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1', 'city'],
            ['address2'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'state', transforms: [addCommaAfter] }, 'city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CU = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'state'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CV = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            ['region'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CX = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CY = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const DO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const DZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const EE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city', 'state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const EG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['state'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const EH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const ET = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const FK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const FM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const FO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GB = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GF = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GI = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GL = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['postalCode', 'address1', 'city'],
            ['address2'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GP = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GS = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GT = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GU = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }, 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GW = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const HK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            [{ attribute: 'region', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const HM = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const HN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [addCommaAfter] }, 'region'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const HT = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const ID = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['state', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['region'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IL = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            ['state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IQ = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize, addCommaAfter] },
                { attribute: 'state', transforms: [capitalize] },
            ],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IR = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['state'],
            [{ attribute: 'city', transforms: [addCommaAfter] }],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const IS = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const JE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const JM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['region'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const JO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KI = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'region', transforms: [capitalize] }],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [addCommaAfter] }, 'region'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KW = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KY = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['region', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const KZ = {
    default: {
        array: [
            ['postalCode'],
            ['state'],
            ['city'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LB = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LI = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LS = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LT = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city', 'state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LU = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LV = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['state'],
            [{ attribute: 'city', transforms: [addCommaAfter] }, 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MC = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MD = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const ME = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MF = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [addCommaAfter] }, 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['state', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MP = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MQ = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MT = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'postalCode', transforms: [capitalize] },
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MU = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MV = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MW = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MX = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'postalCode', transforms: [capitalize] },
                { attribute: 'city', transforms: [capitalize, addCommaAfter] },
                { attribute: 'state', transforms: [capitalize] },
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const MZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city', 'state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NC = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NF = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }, 'postalCode'],
            [{ attribute: 'state', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NI = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode'],
            [
                { attribute: 'city', transforms: [capitalize, addCommaAfter] },
                { attribute: 'region', transforms: [capitalize] },
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NP = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['region'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const NZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const OM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode'],
            ['city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'state', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PF = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                'postalCode',
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'region', transforms: [capitalize] },
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode', 'state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'address2', transforms: [addCommaAfter] }, 'city'],
            ['postalCode', 'state'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PM = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }, 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PW = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const RE = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SC = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            [{ attribute: 'region', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SD = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SJ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize, addCommaAfter] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SR = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            [{ attribute: 'state', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SV = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'postalCode', transforms: [capitalize] },
                { attribute: 'city', transforms: [capitalize] },
            ],
            [{ attribute: 'state', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TC = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'postalCode', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'address2', transforms: [addCommaAfter] }, 'city'],
            [{ attribute: 'state', transforms: [capitalize] }, 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TJ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TV = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'region', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TW = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [addCommaAfter] },
                'region',
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const UA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['region'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const UM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const UZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'state', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const VA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const VC = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const VG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const VI = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [
                { attribute: 'city', transforms: [capitalize] },
                { attribute: 'state', transforms: [capitalize] },
                'postalCode',
            ],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const VN = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['state', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const WF = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const XK = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const YT = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const ZA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city'],
            ['postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const ZM = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', 'city'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const AO = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BW = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const BZ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const CM = {
    default: {
        array: [
            ['companyName'],
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const FJ = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const GH = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'region', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const LY = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const PS = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }, 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const QA = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const SY = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TL = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['city', 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const TT = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }, 'postalCode'],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const UG = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            ['postalCode', { attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const YE = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export const ZW = {
    default: {
        array: [
            [
                'honorificPrefix',
                'givenName',
                'additionalName',
                'familyName',
                'honorificSuffix',
            ],
            ['companyName'],
            ['careOf'],
            ['address1'],
            ['address2'],
            [{ attribute: 'city', transforms: [capitalize] }],
            [{ attribute: 'country', transforms: [capitalize] }],
        ],
    },
};
export { AR as BO, AR as CL, AR as CO, AR as EC, AR as GY, AR as PY, AR as PE, AR as UY, AR as VE, };
export { HR as RS, HR as SI };
export { KR as KP };
export { NL as AW, NL as BQ, NL as CW, NL as SX };
export { NZ as CK, NZ as NU, NZ as TK };
export { GB as MS };
export { BW as AG, BW as DM, BW as GD, BW as GM, BW as LC };
export { BW as SB, BW as SL, BW as SS, BW as TO, BW as VU, BW as WS };
export { CM as BI, CM as BJ, CM as CD, CM as CF, CM as CG, CM as DJ, CM as ER, CM as GA, CM as GQ, CM as KM, CM as ML, CM as MR, CM as RW, CM as ST, CM as TD, CM as TG, };

export const ALL_LAYOUTS: Record<string, CountryLayouts> = {
  AR,
  AU,
  AT,
  BS,
  BG,
  BR,
  CA,
  CH,
  CN,
  CZ,
  DE,
  DK,
  ES,
  FI,
  FR,
  GR,
  HR,
  HU,
  IT,
  JP,
  KR,
  MY,
  NL,
  NO,
  PL,
  PT,
  RO,
  RU,
  SG,
  SE,
  TR,
  US,
  AC,
  AD,
  AE,
  AF,
  AI,
  AL,
  AM,
  AS,
  AX,
  AZ,
  BA,
  BB,
  BD,
  BE,
  BF,
  BH,
  BL,
  BM,
  BN,
  BT,
  BY,
  CC,
  CI,
  CR,
  CU,
  CV,
  CX,
  CY,
  DO,
  DZ,
  EE,
  EG,
  EH,
  ET,
  FK,
  FM,
  FO,
  GB,
  GE,
  GF,
  GG,
  GI,
  GL,
  GN,
  GP,
  GS,
  GT,
  GU,
  GW,
  HK,
  HM,
  HN,
  HT,
  ID,
  IE,
  IL,
  IM,
  IN,
  IO,
  IQ,
  IR,
  IS,
  JE,
  JM,
  JO,
  KE,
  KG,
  KH,
  KI,
  KN,
  KW,
  KY,
  KZ,
  LA,
  LB,
  LI,
  LK,
  LR,
  LS,
  LT,
  LU,
  LV,
  MA,
  MC,
  MD,
  ME,
  MF,
  MG,
  MH,
  MK,
  MM,
  MN,
  MO,
  MP,
  MQ,
  MT,
  MU,
  MV,
  MW,
  MX,
  MZ,
  NA,
  NC,
  NE,
  NF,
  NG,
  NI,
  NP,
  NR,
  NZ,
  OM,
  PA,
  PF,
  PG,
  PH,
  PK,
  PM,
  PN,
  PR,
  PW,
  RE,
  SA,
  SC,
  SD,
  SH,
  SJ,
  SK,
  SM,
  SN,
  SO,
  SR,
  SV,
  SZ,
  TA,
  TC,
  TH,
  TJ,
  TM,
  TN,
  TV,
  TW,
  TZ,
  UA,
  UM,
  UZ,
  VA,
  VC,
  VG,
  VI,
  VN,
  WF,
  XK,
  YT,
  ZA,
  ZM,
  AO,
  BW,
  BZ,
  CM,
  FJ,
  GH,
  LY,
  PS,
  QA,
  SY,
  TL,
  TT,
  UG,
  YE,
  ZW,
  BO: AR,
  RS: HR,
  KP: KR,
  AW: NL,
  CK: NZ,
  MS: GB,
  AG: BW,
  SB: BW,
  BI: CM,
  CL: AR,
  CO: AR,
  EC: AR,
  GY: AR,
  PY: AR,
  PE: AR,
  UY: AR,
  VE: AR,
  SI: HR,
  BQ: NL,
  CW: NL,
  SX: NL,
  NU: NZ,
  TK: NZ,
  DM: BW,
  GD: BW,
  GM: BW,
  LC: BW,
  SL: BW,
  SS: BW,
  TO: BW,
  VU: BW,
  WS: BW,
  BJ: CM,
  CD: CM,
  CF: CM,
  CG: CM,
  DJ: CM,
  ER: CM,
  GA: CM,
  GQ: CM,
  KM: CM,
  ML: CM,
  MR: CM,
  RW: CM,
  ST: CM,
  TD: CM,
  TG: CM,
};
