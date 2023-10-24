import { type Signal } from "@preact/signals-react";

export default function Counter({ count }: { count: Signal<number> }) {
  return (
    <div>
      <p className="count">{count}</p>
      <button className="counter" onClick={() => count.value++}>update</button>
    </div>
  );
}
