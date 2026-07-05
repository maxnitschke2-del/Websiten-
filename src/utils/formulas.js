// Meilensteine: alle 10 Level verdoppelt sich die Produktion einer Station.
// Sorgt dafür, dass das Einkommen mit der exponentiellen Kostenkurve mitwächst.
export const MILESTONE_STEP = 10;

export function milestoneMultiplier(level) {
  return Math.pow(2, Math.floor(level / MILESTONE_STEP));
}

export function nextMilestoneLevel(level) {
  return (Math.floor(level / MILESTONE_STEP) + 1) * MILESTONE_STEP;
}
