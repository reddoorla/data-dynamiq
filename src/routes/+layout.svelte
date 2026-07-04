<script lang="ts">
  import { PrismicPreview } from "@prismicio/svelte/kit";
  import { page } from "$app/state";
  import { repositoryName } from "$lib/prismicio";
  import "../app.css";
  interface Props {
    children?: import("svelte").Snippet;
    data: { isPreviewSession?: boolean };
  }

  let { children, data }: Props = $props();
</script>

<svelte:head>
  <title>{page.data.title ?? "Data Dynamiq"}</title>
  {#if page.data.meta_description}
    <meta name="description" content={page.data.meta_description} />
  {/if}
  {#if page.data.meta_title}
    <meta property="og:title" content={page.data.meta_title} />
  {/if}
  {#if page.data.meta_image}
    <meta property="og:image" content={page.data.meta_image} />
    <meta name="twitter:card" content="summary_large_image" />
  {/if}
</svelte:head>
<main>
  {@render children?.()}
</main>
{#if data.isPreviewSession}
  <PrismicPreview {repositoryName} />
{/if}
