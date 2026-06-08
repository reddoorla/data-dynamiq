<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {import("@prismicio/client").RTLabelNode} node
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { node, children } = $props();
</script>

{#if node.data.label === 'codespan'}
	<code>{@render children?.()}</code>
{:else}
	<span class={node.data.label}>{@render children?.()}</span>
{/if}
