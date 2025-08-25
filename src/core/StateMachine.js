export class StateMachine {
  constructor(){ this.state = 'boot'; this.handlers = new Map(); }
  on(state, fn){ this.handlers.set(state, fn); }
  set(state){ this.state = state; this.handlers.get(state)?.(); }
}