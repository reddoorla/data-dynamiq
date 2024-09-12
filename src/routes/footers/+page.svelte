<script lang='ts'>
    import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
    import SquareImage from "$lib/components/FullWidth/SquareImage.svelte";
    import Spacer from "$lib/components/Spacer.svelte";

    import logoIcon from "$lib/assets/icons/logos/logo.svg"
    import logoFull from "$lib/assets/icons/logos/logoFull.svg"
  import SocialsRow from "$lib/components/FullWidth/SocialsRow.svelte";

  const SOCIALS = [
    {
        platform: "twitter",
        href:"https://twitter.com"
    },
    {
        platform: "facebook",
        href:"https://facebook.com"
    },
    {
        platform: "instagram",
        href:"https://instagram.com"
    },
    {
        platform: "linkedin",
        href:"https://linkedin.com"
    },
  ]
</script>

<svelte:head>
    <title>Footers | Reddoor Wireframer</title>
</svelte:head>


<!-- footers #1 -->
<ContentWidth class="flex flex-col md:flex-row items-center justify-between flex-wrap my-8">
    <a href="/" class="w-11 hover:opacity-80 transition-all duration-500 bump">
        <SquareImage src={logoIcon} class="my-0"/>
    </a>
    <div class="flex flex-col md:flex-row w-auto my-16 md:my-0 md:w-[425px] h-[425px] md:h-11 items-center justify-between">
        <a href="/">HOME</a>
        <a href="/">FEATURES</a>
        <a href="/">PRICING</a>
        <a href="/">BLOG</a>
        <a href="/">ABOUT</a>
    </div>
    <p class="w-full lg:w-auto text-center md:mt-16 lg:mt-0">©2018 - Form  |   All right reserved</p>

</ContentWidth>
<Spacer color="#424B5A" />

<div class="flex flex-col items-center justify-center gap-12">
    <a href="/" class="hover:opacity-80 transition-all duration-500 bump">
        <img src={logoFull} alt="logo" class="-mb-4"/>
    </a>
    
        <SocialsRow socials={SOCIALS}/>
    
    <p>   ©2018 - Form  |   All right reserved  </p>
</div>


<!-- footers #2 -->
<Spacer color="#424B5A" />

<!-- footers #3 -->
<Spacer color="#424B5A" />

<!-- footers #4 -->
<Spacer color="#424B5A" />