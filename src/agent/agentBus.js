// Lets any button on the page open the agent console without prop drilling.
const EVENT = 'agent:open';

export function openAgent() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onAgentOpen(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
