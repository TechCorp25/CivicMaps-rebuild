export function createAdmissionGate(limit) {
  if (!Number.isSafeInteger(limit) || limit < 1) throw new TypeError('Invalid admission limit');
  let active = 0;
  return {
    get active() {
      return active;
    },
    tryAcquire() {
      if (active >= limit) return null;
      active += 1;
      let released = false;
      return () => {
        if (released) return;
        released = true;
        active -= 1;
      };
    },
  };
}
