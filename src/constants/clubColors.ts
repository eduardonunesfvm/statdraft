export interface ClubStyle {
  bgFrom: string;
  bgTo: string;
  textColor: string;
}

export const CLUB_COLORS: Record<string, ClubStyle> = {
  realmadrid:   { bgFrom: '#fbbf24', bgTo: '#581c87', textColor: '#09090b' },
  mancity:      { bgFrom: '#38bdf8', bgTo: '#075985', textColor: '#0284c7' },
  flamengo:     { bgFrom: '#dc2626', bgTo: '#09090b', textColor: '#ffffff' },
  palmeiras:   { bgFrom: '#059669', bgTo: '#022c22', textColor: '#ffffff' },
  corinthians: { bgFrom: '#09090b', bgTo: '#f4f4f5', textColor: '#ffffff' },
  saopaulo:    { bgFrom: '#dc2626', bgTo: '#09090b', textColor: '#ffffff' },
  gremio:      { bgFrom: '#0ea5e9', bgTo: '#09090b', textColor: '#ffffff' },
  riverplate:  { bgFrom: '#ffffff', bgTo: '#dc2626', textColor: '#09090b' },
  bocajuniors: { bgFrom: '#1d4ed8', bgTo: '#fbbf24', textColor: '#fef08a' },
  santos:      { bgFrom: '#f4f4f5', bgTo: '#09090b', textColor: '#09090b' },
  cruzeiro:    { bgFrom: '#2563eb', bgTo: '#172554', textColor: '#ffffff' },
  atleticomg:  { bgFrom: '#09090b', bgTo: '#a1a1aa', textColor: '#ffffff' },
  fluminense:  { bgFrom: '#065f46', bgTo: '#881337', textColor: '#ffffff' },
  internacional: { bgFrom: '#dc2626', bgTo: '#7f1d1d', textColor: '#ffffff' },
  athleticopr: { bgFrom: '#b91c1c', bgTo: '#09090b', textColor: '#ffffff' },
  fortaleza:   { bgFrom: '#2563eb', bgTo: '#dc2626', textColor: '#ffffff' },
  botafogo:    { bgFrom: '#09090b', bgTo: '#27272a', textColor: '#ffffff' },
  vasco:       { bgFrom: '#09090b', bgTo: '#f4f4f5', textColor: '#ffffff' },
  bahia:       { bgFrom: '#2563eb', bgTo: '#dc2626', textColor: '#ffffff' },
  coritiba:    { bgFrom: '#047857', bgTo: '#f4f4f5', textColor: '#ffffff' },
  alnassr:     { bgFrom: '#facc15', bgTo: '#1e3a8a', textColor: '#ffffff' },
  intermiami:  { bgFrom: '#f9a8d4', bgTo: '#111827', textColor: '#ffffff' },
  chelsea:     { bgFrom: '#1d4ed8', bgTo: '#1e3a8a', textColor: '#ffffff' },
  roma:        { bgFrom: '#7f1d1d', bgTo: '#ca8a04', textColor: '#ffffff' },
  zenit:       { bgFrom: '#38bdf8', bgTo: '#2563eb', textColor: '#ffffff' },
  monaco:      { bgFrom: '#dc2626', bgTo: '#f4f4f5', textColor: '#111827' },
  default:     { bgFrom: '#334155', bgTo: '#0f172a', textColor: '#f8fafc' }
  
};

export function getClubStyle(clubId: string): ClubStyle {
  if (!clubId) return CLUB_COLORS.default;
  const normalized = clubId.toLowerCase().replace(/[^a-z]/g, '');
  return CLUB_COLORS[normalized] || CLUB_COLORS.default;
}