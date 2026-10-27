"use client";

import { useEffect, useEffectEvent, useRef } from "react";

/**
 * Runs `onResult` once for each new result of a `useActionState` action: the
 * place for a success toast or a redirect.
 *
 * A plain `useEffect(…, [state])` isn't enough. With cacheComponents, Next
 * keeps visited routes alive (React Activity) and re-runs their effects when
 * one is shown again, while the action state survives. The last result then
 * replayed on every visit, e.g. Profile toasting "Profile saved." and jumping
 * to /events each time it was opened. A ref outlives the hidden period, so
 * remembering the handled result skips the replay.
 */
export function useActionResult<S>(
  state: S,
  onResult: (state: NonNullable<S>) => void,
) {
  const handled = useRef(state);
  const run = useEffectEvent(onResult);

  useEffect(() => {
    if (state == null || state === handled.current) return;
    handled.current = state;
    run(state);
  }, [state]);
}
