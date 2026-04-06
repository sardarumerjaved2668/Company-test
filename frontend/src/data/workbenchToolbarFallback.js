/** Mirrors backend `workbenchToolbar.js` if API is unavailable. */
export const WORKBENCH_TOOLBAR_FALLBACK = [
  { id: 'mic', icon: '🎤', category: 'create_content', queryHint: 'Audio or voice notes' },
  { id: 'clip', icon: '📎', category: 'use_cases', queryHint: 'Documents and attachments' },
  { id: 'video', icon: '🎬', category: 'create_content', queryHint: 'Video script or editing' },
  { id: 'screen', icon: '🖥️', category: 'monitor', queryHint: 'Screen or dashboard monitoring' },
  { id: 'camera', icon: '📷', category: 'create_content', queryHint: 'Images and visuals' },
  { id: 'more', icon: '➕', category: 'use_cases', queryHint: 'New ideas' },
];
