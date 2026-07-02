<script lang="ts">
  import profile_placeholder from "$lib/assets/images/profile_placeholder.jpeg";
  import BrandIcon from "../BrandIcon.svelte";

  interface Props {
    src?: string;
    alt?: string;
    href?: string;
    name?: string;
    title?: string;
    socials?: { platform: string; href: string }[];
  }

  let {
    src = profile_placeholder,
    alt = "profile picture placeholder",
    href = "",
    name = "",
    title = "",
    socials = [
      {
        platform: "",
        href: "",
      },
    ],
  }: Props = $props();
</script>

{#if href}
  <a {href} class="w-full h-full relative">
    <img {src} {alt} class="w-full h-full object-cover" />
    <div
      class="w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center bg-dark opacity-0 hover:opacity-100 hover:bg-opacity-75 transition-all duration-500 ease-fast-slow"
    >
      <div class="h-2"></div>
      <h5 class="text-white my-3">{name}</h5>
      <p class="my-3">{title}</p>
      <div
        class="h-6 my-3 flex flex-row items center justify-center transition-opacity"
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
    </div>
  </a>
{:else}
  <div class="w-full h-full relative">
    <img {src} {alt} class="w-full h-full object-cover" />
    <div
      class="w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center bg-dark opacity-0 hover:opacity-100 hover:bg-opacity-75 transition-all duration-500 ease-fast-slow"
    >
      <div class="h-2"></div>
      <h5 class="text-white my-3">{name}</h5>
      <p class="my-3">{title}</p>
      <div class="h-6 my-3 flex flex-row items center justify-center">
        {#each socials as social}
          <a
            href={social.href}
            class="mx-6 w-6 h-6 hover:opacity-75 transition-all bump"
          >
            <BrandIcon platform={social.platform} />
          </a>
        {/each}
      </div>
    </div>
  </div>
{/if}
