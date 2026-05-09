import * as React from 'react';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

let count = 0;
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return count.toString(); }

type State = { toasts: ToasterToast[] };
type Listener = (state: State) => void;

const listeners: Listener[] = [];
let memoryState: State = { toasts: [] };
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function dispatch(next: State) {
  memoryState = next;
  listeners.forEach((l) => l(memoryState));
}

function scheduleRemove(id: string) {
  if (timeouts.has(id)) return;
  const t = setTimeout(() => {
    timeouts.delete(id);
    dispatch({ ...memoryState, toasts: memoryState.toasts.filter((x) => x.id !== id) });
  }, TOAST_REMOVE_DELAY);
  timeouts.set(id, t);
}

export function toast(opts: Omit<ToasterToast, 'id' | 'open' | 'onOpenChange'>) {
  const id = genId();
  const newToast: ToasterToast = {
    ...opts,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        dispatch({ ...memoryState, toasts: memoryState.toasts.filter((x) => x.id !== id) });
      }
    },
  };
  dispatch({ toasts: [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT) });
  scheduleRemove(id);
  return { id };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { ...state, toast };
}
