export const DATASET_KEYS = {
  brothers: 'brotherdata.csv',
  familyTree: 'FamilyTreeData.csv',
  rush: 'rushData.csv',
  timeline: 'timelinedata.csv',
};

export function isKnownKey(key) {
  return Object.prototype.hasOwnProperty.call(DATASET_KEYS, key);
}
