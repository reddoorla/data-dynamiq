<script lang="ts">
  import BrandIcon from "../BrandIcon.svelte";

  let {
    socials = [
      {
        platform: "",
        href: "",
      },
    ],
  } = $props();
</script>

<div
  class="h-full flex flex-row items center justify-center transition-opacity"
>
  {#each socials as social}
    <a
      href={social.href}
      class="mx-6 w-6 h-6 hover:opacity-75 transition-all bump"
    >
      <BrandIcon platform={social.platform} />
    </a>
  {/each}
</div>
