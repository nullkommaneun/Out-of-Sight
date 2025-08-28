export const Events = Object.freeze({
  PLAYER_SEEN: 'PLAYER_SEEN',
  NOISE: 'NOISE',
  ALARM: 'ALARM',
  DOOR: 'DOOR'
});

export function createEventBus() {
  const map = new Map();
  return {
    on(event, fn) {
      if (!map.has(event)) map.set(event, new Set());
      map.get(event).add(fn);
    },
    off(event, fn) {
      const set = map.get(event);
      if (set) set.delete(fn);
    },
    emit(event, payload) {
      const set = map.get(event);
      if (set) for (const fn of set) fn(payload);
    },
    clear() { map.clear(); }
  };
}

export const bus = createEventBus();
