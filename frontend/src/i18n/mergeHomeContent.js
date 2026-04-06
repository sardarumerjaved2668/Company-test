/** Overlay translated card fields from messages onto base homeContent items. */
export function overlayHomeItem(item, sectionKey, itemId, messages) {
  const patch = messages?.home?.cards?.[sectionKey]?.[itemId];
  if (!patch || typeof patch !== 'object') return item;
  return { ...item, ...patch };
}
