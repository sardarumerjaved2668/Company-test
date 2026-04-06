const SUPPORTED_LANGUAGES = [
  { id: 'en', code: 'EN', region: 'US', label: 'English' },
  { id: 'ar', code: 'AR', region: 'SA', label: 'العربية' },
  { id: 'fr', code: 'FR', region: 'FR', label: 'Français' },
  { id: 'de', code: 'DE', region: 'DE', label: 'Deutsch' },
  { id: 'es', code: 'ES', region: 'ES', label: 'Español' },
  { id: 'pt', code: 'PT', region: 'BR', label: 'Português' },
  { id: 'zh', code: 'ZH', region: 'CN', label: '中文' },
  { id: 'ja', code: 'JA', region: 'JP', label: '日本語' },
  { id: 'ko', code: 'KO', region: 'KR', label: '한국어' },
];

exports.getLanguages = (req, res) => {
  res.json({ success: true, languages: SUPPORTED_LANGUAGES });
};
