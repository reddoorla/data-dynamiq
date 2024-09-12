<script lang='ts'>
    import Spacer from '$lib/components/Spacer.svelte';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
    import ContentWidth from '$lib/components/ContentWidth/ContentWidth.svelte';
  import ContactBox from '$lib/components/FullWidth/ContactBox.svelte';
    import ContactForm from '$lib/components/FullWidth/ContactForm.svelte';
    import mapPlaceholder from "$lib/assets/images/map_placeholder.svg"

    const LOREM = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
</script>

<svelte:head>
    <title>Contact Sections | Reddoor Wireframer</title>
</svelte:head>

<!-- contact #1 -->
<ContentWidth>
    <h2 class="mb-20">Contact us</h2>
    <div class="w-full flex flex-row justify-between flex-wrap">
    <div class="w-full md:w-1/2">
        <h6 class="mb-7">We'd love to hear from you</h6>
        <p class="mb-7 w-5/6">{LOREM}</p>
        <ContactBox />
    </div>
    <div class="w-full mt-8 md:mt-0 md:w-1/2">
        <ContactForm />
    </div>
</div>
</ContentWidth>
<Spacer color="#424B5A" />

<!-- contact #4 -->

<ContentWidth>
    <h2 class="mb-20">Contact us</h2>
    <div class="w-full flex flex-row justify-between flex-wrap h-auto md:h-72 overflow-hidden">
        <div class="w-full md:w-1/2 h-full pr-0 md:pr-16 relative">
            <img src={mapPlaceholder} alt="map" class="w-full h-full object-cover" />
            <FontAwesomeIcon icon={faLocationDot} class="absolute top-1/2 left-1/3" size="2x"/>
        </div>
    <div class="w-full md:w-1/2  mt-8 md:mt-0">
        <h6 class="mb-7">We'd love to hear from you</h6>
        <p class="mb-7 w-5/6">{LOREM}</p>
        <ContactBox />
    </div>
    
</div>
</ContentWidth>

<Spacer color="#424B5A" />

<!-- contact #5 -->
<Spacer color="#424B5A" />

<!-- contact #8 -->
<Spacer color="#424B5A" />

<!-- contact #9 -->
<Spacer color="#424B5A" />