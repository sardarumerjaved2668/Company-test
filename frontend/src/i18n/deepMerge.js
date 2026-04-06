function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Deep-merge override into base. Arrays and primitives from override replace entirely.
 * Missing keys in override keep base values.
 */
export function deepMerge(base, override) {
  if (override === null || override === undefined) return base;
  if (!isPlainObject(override)) return override;
  if (!isPlainObject(base)) return override;

  const out = { ...base };
  for (const k of Object.keys(override)) {
    const bv = base[k];
    const ov = override[k];
    if (ov === undefined) continue;
    if (isPlainObject(ov) && isPlainObject(bv)) {
      out[k] = deepMerge(bv, ov);
    } else {
      out[k] = ov;
    }
  }
  return out;
}
