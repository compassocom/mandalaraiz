export class LocalizationService {
  private countryToLanguage: Map<string, string> = new Map([
    // Americas
    ['US', 'en-US'],
    ['CA', 'en-US'],
    ['MX', 'es-MX'],
    ['BR', 'pt-BR'],
    ['AR', 'es-AR'],
    ['CL', 'es-CL'],
    ['CO', 'es-CO'],
    ['PE', 'es-PE'],
    ['VE', 'es-VE'],
    ['EC', 'es-EC'],
    ['BO', 'es-BO'],
    ['PY', 'es-PY'],
    ['UY', 'es-UY'],
    ['CR', 'es-CR'],
    ['GT', 'es-GT'],
    ['HN', 'es-HN'],
    ['SV', 'es-SV'],
    ['NI', 'es-NI'],
    ['PA', 'es-PA'],
    ['CU', 'es-CU'],
    ['DO', 'es-DO'],
    ['PR', 'es-PR'],
    
    // Europe
    ['GB', 'en-GB'],
    ['IE', 'en-GB'],
    ['ES', 'es-ES'],
    ['PT', 'pt-PT'],
    ['FR', 'fr-FR'],
    ['DE', 'de-DE'],
    ['IT', 'it-IT'],
    ['NL', 'nl-NL'],
    ['BE', 'fr-FR'],
    ['CH', 'de-DE'],
    ['AT', 'de-DE'],
    ['SE', 'sv-SE'],
    ['NO', 'no-NO'],
    ['DK', 'da-DK'],
    ['FI', 'fi-FI'],
    ['PL', 'pl-PL'],
    ['CZ', 'cs-CZ'],
    ['SK', 'sk-SK'],
    ['HU', 'hu-HU'],
    ['RO', 'ro-RO'],
    ['BG', 'bg-BG'],
    ['HR', 'hr-HR'],
    ['SI', 'sl-SI'],
    ['LT', 'lt-LT'],
    ['LV', 'lv-LV'],
    ['EE', 'et-EE'],
    ['GR', 'el-GR'],
    ['RU', 'ru-RU'],
    ['UA', 'uk-UA'],
    ['BY', 'be-BY'],
    
    // Asia
    ['CN', 'zh-CN'],
    ['TW', 'zh-TW'],
    ['HK', 'zh-HK'],
    ['JP', 'ja-JP'],
    ['KR', 'ko-KR'],
    ['IN', 'hi-IN'],
    ['TH', 'th-TH'],
    ['VN', 'vi-VN'],
    ['ID', 'id-ID'],
    ['MY', 'ms-MY'],
    ['SG', 'en-US'],
    ['PH', 'en-US'],
    ['BD', 'bn-BD'],
    ['PK', 'ur-PK'],
    ['LK', 'si-LK'],
    ['MM', 'my-MM'],
    ['KH', 'km-KH'],
    ['LA', 'lo-LA'],
    ['MN', 'mn-MN'],
    ['KZ', 'kk-KZ'],
    ['UZ', 'uz-UZ'],
    ['KG', 'ky-KG'],
    ['TJ', 'tg-TJ'],
    ['TM', 'tk-TM'],
    ['AF', 'fa-AF'],
    ['IR', 'fa-IR'],
    ['IQ', 'ar-IQ'],
    ['TR', 'tr-TR'],
    ['SY', 'ar-SY'],
    ['LB', 'ar-LB'],
    ['JO', 'ar-JO'],
    ['IL', 'he-IL'],
    ['PS', 'ar-PS'],
    ['SA', 'ar-SA'],
    ['AE', 'ar-AE'],
    ['QA', 'ar-QA'],
    ['KW', 'ar-KW'],
    ['BH', 'ar-BH'],
    ['OM', 'ar-OM'],
    ['YE', 'ar-YE'],
    
    // Africa
    ['ZA', 'en-ZA'],
    ['NG', 'en-NG'],
    ['KE', 'en-KE'],
    ['UG', 'en-UG'],
    ['TZ', 'sw-TZ'],
    ['ET', 'am-ET'],
    ['EG', 'ar-EG'],
    ['MA', 'ar-MA'],
    ['DZ', 'ar-DZ'],
    ['TN', 'ar-TN'],
    ['LY', 'ar-LY'],
    ['SD', 'ar-SD'],
    ['GH', 'en-GH'],
    ['CI', 'fr-CI'],
    ['SN', 'fr-SN'],
    ['ML', 'fr-ML'],
    ['BF', 'fr-BF'],
    ['NE', 'fr-NE'],
    ['TD', 'fr-TD'],
    ['CM', 'fr-CM'],
    ['CF', 'fr-CF'],
    ['CG', 'fr-CG'],
    ['CD', 'fr-CD'],
    ['GA', 'fr-GA'],
    ['GQ', 'es-GQ'],
    ['AO', 'pt-AO'],
    ['MZ', 'pt-MZ'],
    ['GW', 'pt-GW'],
    ['CV', 'pt-CV'],
    ['ST', 'pt-ST'],
    
    // Oceania
    ['AU', 'en-AU'],
    ['NZ', 'en-NZ'],
    ['FJ', 'en-FJ'],
    ['PG', 'en-PG'],
    ['SB', 'en-SB'],
    ['VU', 'en-VU'],
    ['NC', 'fr-NC'],
    ['PF', 'fr-PF']
  ]);

  private supportedLanguages = [
    'en-US', 'es-ES', 'pt-BR', 'fr-FR', 'de-DE', 'it-IT', 
    'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA', 'hi-IN', 'ru-RU'
  ];

  // Detect language from country code
  detectLanguageFromCountry(countryCode: string): string {
    const language = this.countryToLanguage.get(countryCode.toUpperCase());
    
    if (language && this.supportedLanguages.includes(language)) {
      return language;
    }
    
    // Fallback to base language if specific variant not supported
    if (language) {
      const baseLanguage = language.split('-')[0];
      const fallback = this.supportedLanguages.find(lang => lang.startsWith(baseLanguage));
      if (fallback) {
        return fallback;
      }
    }
    
    // Default to English
    return 'en-US';
  }

  // Detect language from IP address (would integrate with IP geolocation service)
  async detectLanguageFromIP(ipAddress: string): Promise<string> {
    try {
      // In a real implementation, you would use a service like:
      // - MaxMind GeoIP2
      // - IPStack
      // - Cloudflare CF-IPCountry header
      
      // For demo purposes, return default language
      console.log(`Detecting language for IP: ${ipAddress}`);
      
      // Mock geolocation - in production, replace with actual service
      const mockCountryCode = 'US'; // This would come from geolocation service
      
      return this.detectLanguageFromCountry(mockCountryCode);
    } catch (error) {
      console.error('Error detecting language from IP:', error);
      return 'en-US'; // Default fallback
    }
  }

  // Get supported languages list
  getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'en-US', name: 'English', nativeName: 'English' },
      { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
      { code: 'fr-FR', name: 'French', nativeName: 'Français' },
      { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
      { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
      { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
      { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
      { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' }
    ];
  }

  // Get localized currency for country
  getCurrencyForCountry(countryCode: string): string {
    const currencyMap: Map<string, string> = new Map([
      ['US', 'USD'], ['CA', 'CAD'], ['MX', 'MXN'], ['BR', 'BRL'],
      ['GB', 'GBP'], ['EU', 'EUR'], ['DE', 'EUR'], ['FR', 'EUR'],
      ['ES', 'EUR'], ['IT', 'EUR'], ['NL', 'EUR'], ['BE', 'EUR'],
      ['AT', 'EUR'], ['PT', 'EUR'], ['IE', 'EUR'], ['FI', 'EUR'],
      ['GR', 'EUR'], ['LU', 'EUR'], ['MT', 'EUR'], ['CY', 'EUR'],
      ['SK', 'EUR'], ['SI', 'EUR'], ['EE', 'EUR'], ['LV', 'EUR'],
      ['LT', 'EUR'], ['JP', 'JPY'], ['CN', 'CNY'], ['KR', 'KRW'],
      ['IN', 'INR'], ['AU', 'AUD'], ['NZ', 'NZD'], ['CH', 'CHF'],
      ['SE', 'SEK'], ['NO', 'NOK'], ['DK', 'DKK'], ['PL', 'PLN'],
      ['CZ', 'CZK'], ['HU', 'HUF'], ['RU', 'RUB'], ['TR', 'TRY'],
      ['ZA', 'ZAR'], ['SG', 'SGD'], ['HK', 'HKD'], ['TW', 'TWD'],
      ['TH', 'THB'], ['MY', 'MYR'], ['ID', 'IDR'], ['PH', 'PHP'],
      ['VN', 'VND'], ['AR', 'ARS'], ['CL', 'CLP'], ['CO', 'COP'],
      ['PE', 'PEN'], ['UY', 'UYU'], ['SA', 'SAR'], ['AE', 'AED'],
      ['IL', 'ILS'], ['EG', 'EGP'], ['NG', 'NGN'], ['KE', 'KES']
    ]);

    return currencyMap.get(countryCode.toUpperCase()) || 'USD';
  }

  // Get timezone for country
  getTimezoneForCountry(countryCode: string): string {
    const timezoneMap: Map<string, string> = new Map([
      ['US', 'America/New_York'], ['CA', 'America/Toronto'],
      ['MX', 'America/Mexico_City'], ['BR', 'America/Sao_Paulo'],
      ['AR', 'America/Argentina/Buenos_Aires'], ['CL', 'America/Santiago'],
      ['GB', 'Europe/London'], ['DE', 'Europe/Berlin'],
      ['FR', 'Europe/Paris'], ['ES', 'Europe/Madrid'],
      ['IT', 'Europe/Rome'], ['NL', 'Europe/Amsterdam'],
      ['SE', 'Europe/Stockholm'], ['NO', 'Europe/Oslo'],
      ['DK', 'Europe/Copenhagen'], ['FI', 'Europe/Helsinki'],
      ['PL', 'Europe/Warsaw'], ['RU', 'Europe/Moscow'],
      ['JP', 'Asia/Tokyo'], ['CN', 'Asia/Shanghai'],
      ['KR', 'Asia/Seoul'], ['IN', 'Asia/Kolkata'],
      ['TH', 'Asia/Bangkok'], ['SG', 'Asia/Singapore'],
      ['AU', 'Australia/Sydney'], ['NZ', 'Pacific/Auckland']
    ]);

    return timezoneMap.get(countryCode.toUpperCase()) || 'UTC';
  }
}
