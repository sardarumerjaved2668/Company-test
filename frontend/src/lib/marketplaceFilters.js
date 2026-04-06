/**
 * Client-side marketplace filters. Data is loaded once from GET /api/models.
 */

/** Pill id → substrings matched against model.categories (case-insensitive) */
const CATEGORY_MODE_MAP = {
  language: ['Language', 'Translation', 'Multilingual'],
  vision: ['Multimodal', 'Vision'],
  code: ['Code'],
  imageGen: ['Image'],
  audio: ['Audio', 'Speech', 'Music', 'Voice'],
};

/** Maps UI pricing checkboxes → backend pricing.tier values */
export const PRICING_GROUP_TO_TIERS = {
  payPerUse: ['budget', 'mid', 'premium'],
  subscription: ['mid'],
  freeTier: ['free'],
  enterprise: ['premium'],
};

export function tiersFromPricingGroups(pricingGroupSet) {
  if (!pricingGroupSet || pricingGroupSet.size === 0) return null;
  const tiers = new Set();
  pricingGroupSet.forEach((g) => {
    const list = PRICING_GROUP_TO_TIERS[g];
    if (list) list.forEach((t) => tiers.add(t));
  });
  return tiers;
}

/**
 * @param {object[]} rawModels - AIModel docs from API
 * @param {object} filters
 */
export function filterRawModels(rawModels, filters) {
  const {
    search = '',
    categoryMode = null,
    labProvider = null,
    selectedProviders = new Set(),
    pricingGroups = new Set(),
    maxInputPrice = 100,
    minRating = 0,
    licence = new Set(),
    starRatingFn = null,
  } = filters;

  const term = (search || '').trim().toLowerCase();
  const tierSet = tiersFromPricingGroups(pricingGroups);

  return rawModels.filter((m) => {
    if (term) {
      const hay = [m.name, m.provider, m.description, ...(m.categories || [])]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(term)) return false;
    }

    if (labProvider && m.provider !== labProvider) return false;

    if (selectedProviders.size > 0 && !selectedProviders.has(m.provider)) {
      return false;
    }

    if (categoryMode && categoryMode !== 'all') {
      if (categoryMode === 'openSource') {
        if (!m.openSource) return false;
      } else {
        const needles = CATEGORY_MODE_MAP[categoryMode];
        if (needles?.length) {
          const cats = m.categories || [];
          const ok = needles.some((needle) => {
            const rx = new RegExp(
              needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'i'
            );
            return cats.some((c) => rx.test(c));
          });
          if (!ok) return false;
        }
      }
    }

    if (tierSet && tierSet.size > 0) {
      const tier = m.pricing?.tier || 'mid';
      if (!tierSet.has(tier)) return false;
    }

    if (maxInputPrice < 100) {
      const inp = m.pricing?.input ?? 0;
      if (inp > maxInputPrice) return false;
    }

    if (licence && licence.size > 0) {
      const isCommercial = !m.openSource && !m.researchOnly;
      const isOS = !!m.openSource;
      const isRes = !!m.researchOnly;
      const ok =
        (licence.has('commercial') && isCommercial) ||
        (licence.has('openSource') && isOS) ||
        (licence.has('researchOnly') && isRes);
      if (!ok) return false;
    }

    if (minRating > 0 && starRatingFn) {
      const stars = starRatingFn(m);
      const n = stars == null ? NaN : parseFloat(String(stars));
      if (Number.isNaN(n) || n < minRating) return false;
    }

    return true;
  });
}
