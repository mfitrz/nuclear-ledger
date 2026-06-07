export const COUNTRY_COLORS = {
  'United States': '#c9a800',
  'Soviet Union': '#e02222',
  'United Kingdom': '#2278e0',
  France: '#a022e0',
  China: '#e06010',
  India: '#22d464',
  Pakistan: '#18c8c0',
  'North Korea': '#e02898',
  Unknown: '#8a7c00',
}

export const COUNTRY_ABBR = {
  'United States': 'USA',
  'Soviet Union': 'USSR',
  'United Kingdom': 'UK',
  France: 'FRA',
  China: 'CHN',
  India: 'IND',
  Pakistan: 'PAK',
  'North Korea': 'DPRK',
  Unknown: '???',
}

export function getColor(country) {
  return COUNTRY_COLORS[country] || '#8a7c00'
}
