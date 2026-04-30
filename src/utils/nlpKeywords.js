const STOP = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','as','is','was','are','were','been','be','have','has','had','do','does',
  'did','will','would','could','should','may','might','must','can','not','no',
  'this','that','these','those','then','also','per','due','via','over',
  'patient','patients','received','treatment','therapy','diagnosed','history',
  'prior','previously','dose','mg','ml','oral','iv','given','used','taken',
  'well','good','poor','known','status','grade','type','current','new',
]);

export function extractKeywords(text) {
  if (!text?.trim()) return [];
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w))
    ),
  ].slice(0, 12);
}
