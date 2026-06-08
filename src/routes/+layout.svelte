<script lang="ts">
  import { PrismicPreview } from "@prismicio/svelte/kit";
  import { page } from "$app/state";
  import { repositoryName } from "$lib/prismicio";
  import "../app.css";
  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <title>{page.data.title}</title>
  {#if page.data.meta_description}
    <meta name="description" content={page.data.meta_description} />
  {/if}
  {#if page.data.meta_title}
    <meta name="og:title" content={page.data.meta_title} />
  {/if}
  {#if page.data.meta_image}
    <meta name="og:image" content={page.data.meta_image.url} />
    <meta name="twitter:card" content="summary_large_image" />
  {/if}
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0 user-scalable=no"
  />
</svelte:head>
<main>
  {@render children?.()}
</main>
<PrismicPreview {repositoryName} />
