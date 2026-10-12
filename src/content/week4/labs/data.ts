// Small categorical datasets used by several week 4 labs.

export interface TennisRow {
  day: string;
  outlook: 'Sunny' | 'Overcast' | 'Rain';
  humidity: 'High' | 'Normal';
  wind: 'Weak' | 'Strong';
  play: 'Yes' | 'No';
}

const T = (day: string, outlook: TennisRow['outlook'], humidity: TennisRow['humidity'], wind: TennisRow['wind'], play: TennisRow['play']): TennisRow => ({
  day,
  outlook,
  humidity,
  wind,
  play,
});

/** PlayTennis with three predictors; Day only identifies the row. 9 Yes, 5 No. */
export const TENNIS: TennisRow[] = [
  T('D1', 'Sunny', 'High', 'Weak', 'No'),
  T('D2', 'Sunny', 'High', 'Strong', 'No'),
  T('D3', 'Overcast', 'High', 'Weak', 'Yes'),
  T('D4', 'Rain', 'High', 'Weak', 'Yes'),
  T('D5', 'Rain', 'Normal', 'Weak', 'Yes'),
  T('D6', 'Rain', 'Normal', 'Strong', 'No'),
  T('D7', 'Overcast', 'Normal', 'Strong', 'Yes'),
  T('D8', 'Sunny', 'High', 'Weak', 'No'),
  T('D9', 'Sunny', 'Normal', 'Weak', 'Yes'),
  T('D10', 'Rain', 'Normal', 'Weak', 'Yes'),
  T('D11', 'Sunny', 'Normal', 'Strong', 'Yes'),
  T('D12', 'Overcast', 'High', 'Strong', 'Yes'),
  T('D13', 'Overcast', 'Normal', 'Weak', 'Yes'),
  T('D14', 'Rain', 'High', 'Strong', 'No'),
];

export const TENNIS_ATTRS = [
  { name: 'Outlook', values: ['Sunny', 'Overcast', 'Rain'], get: (r: TennisRow) => r.outlook as string },
  { name: 'Humidity', values: ['High', 'Normal'], get: (r: TennisRow) => r.humidity as string },
  { name: 'Wind', values: ['Weak', 'Strong'], get: (r: TennisRow) => r.wind as string },
];
export const DAY_ATTR = { name: 'Day', values: TENNIS.map((r) => r.day), get: (r: TennisRow) => r.day };

export interface OrganRow {
  model: string;
  condition: 'excellent' | 'good' | 'fair';
  leslie: 'yes' | 'no';
  price: number;
}

/** Nine second-hand Hammond organs: model, condition, whether a Leslie speaker is included, and price. */
export const ORGANS: OrganRow[] = [
  { model: 'B3', condition: 'excellent', leslie: 'no', price: 4513 },
  { model: 'T202', condition: 'fair', leslie: 'yes', price: 625 },
  { model: 'A100', condition: 'good', leslie: 'no', price: 1051 },
  { model: 'T202', condition: 'good', leslie: 'no', price: 270 },
  { model: 'M102', condition: 'good', leslie: 'yes', price: 870 },
  { model: 'A100', condition: 'excellent', leslie: 'no', price: 1770 },
  { model: 'T202', condition: 'fair', leslie: 'no', price: 99 },
  { model: 'A100', condition: 'good', leslie: 'yes', price: 1900 },
  { model: 'E112', condition: 'fair', leslie: 'no', price: 77 },
];

export const ORGAN_ATTRS = [
  { name: 'Model', values: ['A100', 'B3', 'E112', 'M102', 'T202'], get: (r: OrganRow) => r.model },
  { name: 'Condition', values: ['excellent', 'good', 'fair'], get: (r: OrganRow) => r.condition as string },
  { name: 'Leslie', values: ['yes', 'no'], get: (r: OrganRow) => r.leslie as string },
];
