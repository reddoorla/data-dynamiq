import {
	useSwipe,
	type SwipeCustomEvent,
	type SwipeParameters,
} from "svelte-gestures";

/**
 * Svelte 5 action wrapper for svelte-gestures v5's `useSwipe` hook.
 *
 * v5 removed the v4 `swipe` action export; the swipe gesture is now a hook.
 * Calling it with `isRaw = true` returns a `.swipe(node)` registrar so we can
 * keep using the familiar `use:swipe` directive in markup:
 *
 *   const swipe = createSwipeAction((e) => { ... }, { minSwipeDistance: 20 });
 *   <div use:swipe> ... </div>
 *
 * `parameters` maps to the v4 `use:swipe={{ ... }}` options (e.g. the
 * `minSwipeDistance` / `touchAction: 'pan-y'` the carousels relied on).
 */
export const createSwipeAction = (
	handler: (e: SwipeCustomEvent) => void,
	parameters?: Partial<SwipeParameters>,
) => {
	const gesture = useSwipe(
		handler,
		parameters ? () => parameters : undefined,
		undefined,
		true,
	);
	return (node: HTMLElement) => ({ destroy: gesture.swipe(node) });
};

export type { SwipeCustomEvent };
