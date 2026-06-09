export interface Country {
  name: string
  flag: string
  code: string
  ddi: string
}

const COUNTRIES: Country[] = [
  { name: 'Brasil', flag: '🇧🇷', code: 'BR', ddi: '55' },
  { name: 'Estados Unidos', flag: '🇺🇸', code: 'US', ddi: '1' },
  { name: 'Canadá', flag: '🇨🇦', code: 'CA', ddi: '1' },
  { name: 'México', flag: '🇲🇽', code: 'MX', ddi: '52' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR', ddi: '54' },
  { name: 'Chile', flag: '🇨🇱', code: 'CL', ddi: '56' },
  { name: 'Colômbia', flag: '🇨🇴', code: 'CO', ddi: '57' },
  { name: 'Peru', flag: '🇵🇪', code: 'PE', ddi: '51' },
  { name: 'Paraguai', flag: '🇵🇾', code: 'PY', ddi: '595' },
  { name: 'Uruguai', flag: '🇺🇾', code: 'UY', ddi: '598' },
  { name: 'Venezuela', flag: '🇻🇪', code: 'VE', ddi: '58' },
  { name: 'Reino Unido', flag: '🇬🇧', code: 'GB', ddi: '44' },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT', ddi: '351' },
  { name: 'Espanha', flag: '🇪🇸', code: 'ES', ddi: '34' },
  { name: 'Itália', flag: '🇮🇹', code: 'IT', ddi: '39' },
  { name: 'França', flag: '🇫🇷', code: 'FR', ddi: '33' },
  { name: 'Alemanha', flag: '🇩🇪', code: 'DE', ddi: '49' },
  { name: 'Holanda', flag: '🇳🇱', code: 'NL', ddi: '31' },
  { name: 'Áustria', flag: '🇦🇹', code: 'AT', ddi: '43' },
  { name: 'Suíça', flag: '🇨🇭', code: 'CH', ddi: '41' },
  { name: 'Polônia', flag: '🇵🇱', code: 'PL', ddi: '48' },
  { name: 'Japão', flag: '🇯🇵', code: 'JP', ddi: '81' },
  { name: 'China', flag: '🇨🇳', code: 'CN', ddi: '86' },
  { name: 'Coreia do Sul', flag: '🇰🇷', code: 'KR', ddi: '82' },
  { name: 'Índia', flag: '🇮🇳', code: 'IN', ddi: '91' },
  { name: 'Austrália', flag: '🇦🇺', code: 'AU', ddi: '61' },
]

export function useCountryDDI() {
  const defaultCountry = COUNTRIES[0]

  return {
    countries: COUNTRIES,
    defaultCountry,
  }
}
