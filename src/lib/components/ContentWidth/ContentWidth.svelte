<script lang="ts">
  import type { Snippet } from "svelte";
  import AnimateIn from "../AnimateIn.svelte";

  interface Props {
    animateIn?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    animateIn = false,
    class: klass = "flex flex-col items-center justify-center relative",
    children,
  }: Props = $props();
</script>

{#if animateIn}
  <AnimateIn
    ><div
      class="max-w-[1220px] xl:max-w-[1440px] xl:mx-auto mx-[4%] w-[92%] {klass}"
    >
      {@render children?.()}
    </div></AnimateIn
  >
{:else}
  <div
    class="max-w-[1220px] xl:max-w-[1440px] xl:mx-auto mx-[4%] w-[92%] {klass}"
  >
    {@render children?.()}
  </div>
{/if}
