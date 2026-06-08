<script lang='ts'>
  import { run } from 'svelte/legacy';

  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import ContentBox from "$lib/components/FullWidth/ContentBox.svelte";
    import TestimonialBox from "$lib/components/FullWidth/TestimonialBox.svelte";
    import ScreenWidthImage from '$lib/components/ScreenWidth/ScreenWidthImage.svelte'
    import SliderOfTestimonialBoxes from "$lib/components/FullWidth/SliderOfTestimonialBoxes.svelte";
    import Spacer from "$lib/components/Spacer.svelte";
    import logo6 from "$lib/assets/icons/logos/logo6.svg"
    import logo7 from "$lib/assets/icons/logos/logo7.svg"
    import logo8 from "$lib/assets/icons/logos/logo8.svg"
    import quote from "$lib/assets/icons/quote.svg"
    import { swipe } from "svelte-gestures";

    const LOREM = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquat enim ad minim veniam."

    let innerWidth:number = $state();

    let activeValue = $state(2);
    let showValueBox = true;
    const setActiveValue = (i:number) => activeValue=i;
    const setActiveValueWithDelay = (i:number) => {
        showValueBox = false;
        activeValue = i;
        setTimeout(() => {
            showValueBox = true;
        }, 300);
  }

    
  let sliderNumber = $state((2-activeValue)*100)
    let sliderStyleString = $state("transform:translateX(" + sliderNumber + "vw);");
    run(() => {
        sliderNumber = (2-activeValue)*100
        sliderStyleString = "transform:translateX(" + sliderNumber + "vw);";
    });

    const handleSwipe = (e:CustomEvent<{ direction: "left" | "top" | "right" | "bottom"; target: EventTarget; }>) =>{
        let direction = e.detail.direction;
        console.log(direction)
        if(direction=='right'&&activeValue>1)
            activeValue--;
        if(direction=='left'&&activeValue<3)
            activeValue++;

    }

</script>
<svelte:head><title>Testimonials | Reddoor Wireframer</title></svelte:head>
<svelte:window bind:innerWidth />

<!-- testimonial #1 -->
<ContentWidth>
    <ContentBox
        titleTag="h2"
        titleText="Why People Love Wireframes"
        icon=""
    />

    {#if innerWidth>768}
    <div class="w-full flex justify-between items-stretch flex-wrap">
        <div class="w-[30%]">
            <TestimonialBox 
                icon={logo8}
                testimonialText={LOREM}
                attribution="Sean Farmer"
                attributionLabel="Job Title"
                float="left"
                backgroundColor="#F3F3F3"

            />
        </div>
        <div class="w-[30%] ">
            <TestimonialBox 
                icon={logo7}
                testimonialText={LOREM}
                attribution="Victor Grey"
                attributionLabel="Job Title"
                float="left"
                backgroundColor="#F3F3F3"

            />
        </div>
        <div class="w-[30%]">
            <TestimonialBox 
                icon={logo6}
                testimonialText={LOREM}
                attribution="Leroy Rice"
                attributionLabel="Job Title"
                float="left"
                backgroundColor="#F3F3F3"

            />
        </div>
    </div>
    {:else}
    <div use:swipe={{minSwipeDistance:20, touchAction: 'pan-y'}} onswipe={handleSwipe} class="w-[300vw] lg:translate-x-0 lg:w-full flex flex-row justify-around lg:justify-between flex-nowrap transition-transform overflow-hidden duration-1000"
    style={innerWidth < 1024 ? sliderStyleString : ""}>
<div class="w-[320px]">
    <TestimonialBox 
                icon={logo8}
                testimonialText={LOREM}
                attribution="Sean Farmer"
                attributionLabel="Job Title"
                float="left"
                backgroundColor="#F3F3F3"
                class="p-6 h-96"

            />

</div>
<div class="w-[320px]">
    <TestimonialBox 
                icon={logo7}
                testimonialText={LOREM}
                attribution="Victor Grey"
                attributionLabel="Job Title"
                float="left"
                backgroundColor="#F3F3F3"
                class="p-6 h-96"
        />

</div>
<div class="w-[320px]">
    <TestimonialBox 
                icon={logo6}
                testimonialText={LOREM}
                attribution="Leroy Rice"
                attributionLabel="Job Title"
                float="left"
                backgroundColor="#F3F3F3"
                class="p-6 h-96"

            />
</div>
</div>
<div class="absolute h-10 flex align-middle justify-start xl:left-8 translate-x-[2px] -bottom-16 lg:hidden">

    <div class="h-[10px] w-[10px] border-[1.5px] rounded-full transition-all duration-1000 cursor-pointer hover:opacity-60 mr-4 {activeValue===1 ? "bg-dark border-dark" : "border-light"}"
        onclick={()=>setActiveValue(1)}
        aria-hidden
    ></div>
    <div class="h-[10px] w-[10px] border-[1.5px] rounded-full transition-all duration-1000 cursor-pointer hover:opacity-60 mr-4 {activeValue===2 ? "bg-dark border-dark" : "border-light"}"
        onclick={()=>setActiveValue(2)}
        aria-hidden
    ></div>
    <div class="h-[10px] w-[10px] border-[1.5px] rounded-full transition-all duration-1000 cursor-pointer hover:opacity-60 mr-4 {activeValue===3 ? "bg-dark border-dark" : "border-light"}"
        onclick={()=>setActiveValue(3)}
        aria-hidden
    ></div>
    
</div>

    {/if}
</ContentWidth>

<Spacer color="#424B5A" />

<!-- testimonial #2 -->

<ScreenWidthImage classContent="flex flex-col justify-evenly">
    <ContentBox
        titleTag="h2"
        titleText="Why People Love Wireframes"
        icon=""
        class="mt-12"
    />

    <div class="w-full md:w-1/2 relative">
        <SliderOfTestimonialBoxes />
    </div> 
    <div></div><div></div>

</ScreenWidthImage>
<Spacer color="#424B5A" />

<!-- testimonial #3 -->
<Spacer color="#424B5A" />

<!-- testimonial #4 -->
<Spacer color="#424B5A" />

<!-- testimonial #5 -->
<Spacer color="#424B5A" />