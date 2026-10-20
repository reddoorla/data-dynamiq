<script lang="ts">
  import PrismicPreview from "$lib/components/PrismicPreview.svelte";
  import { page } from "$app/state";
  import { repositoryName } from "$lib/prismicio";
  import "../app.css";
  import { onMount } from "svelte";
  interface Props {
    children?: import("svelte").Snippet;
    data: { isPreviewSession?: boolean };
  }

  let { children, data }: Props = $props();

  // The fleet form-e2e probe waits for this before it fills the contact form, so
  // its input is not wiped by hydration.
  onMount(() => document.documentElement.setAttribute("data-hydrated", ""));
</script>

<svelte:head>
  <title>{page.data.title ?? "Data Dynamiq"}</title>
  {#if page.data.noindex}
    <meta name="robots" content="noindex" />
  {/if}
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
