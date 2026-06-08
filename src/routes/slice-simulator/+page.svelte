<script lang="ts">
	import { SliceSimulator } from '@slicemachine/adapter-sveltekit/simulator';
	import { SliceZone } from '@prismicio/svelte';
	import type { SliceZone as SliceZoneType } from '@prismicio/client';
	import { components } from '$lib/slices';
</script>

<SliceSimulator >
	{#snippet children({ slices }: { slices: SliceZoneType })}
		<SliceZone {slices} {components} />
	{/snippet}
</SliceSimulator>
