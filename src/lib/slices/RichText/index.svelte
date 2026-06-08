<script>
	import { PrismicRichText } from '@prismicio/svelte';
	import Label from './Label.svelte';

	
	/**
	 * @typedef {Object} Props
	 * @property {import("@prismicio/client").Content.RichTextSlice} slice
	 */

	/** @type {Props} */
	let { slice } = $props();
</script>

<section class="container p-2 md:p8">
	<PrismicRichText
		field={slice.primary.content}
		components={{
			label: Label
		}}
		
	/>
</section>

<style>
	.container {
		max-width: 600px;
		margin: 6em auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
			'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
	}
</style>
