<script lang='ts'>
    import { onMount } from "svelte";
    import { swipe } from "svelte-gestures";
    import TestimonialBox from "./TestimonialBox.svelte";
    import type { ComponentProps } from "svelte";
    import chevronLeft from "../../assets/icons/chevron-left.svg";
    import chevronRight from "../../assets/icons/chevron-right.svg";
    import arrow from "$lib/assets/icons/wireframe-link-arrow-right.svg"
  
  interface Props {
    testimonialBoxPropsArray?: ComponentProps<TestimonialBox>[];
  }

  let { testimonialBoxPropsArray = [
      {
        icon: "",
        float: "left",
        testimonialText:  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
        attribution:"John Smith",
        attributionLabel: "a trustworthy person"
    },
    {
        icon: "",
        float: "left",
        testimonialText:  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
        attribution:"Jane Baker",
        attributionLabel: "a knowledgable person"
    },
      
    ] }: Props = $props();
  

    const SLIDER_INTERVAL_IN_MS = 5000;
    let sliderIndex = $state(0);
    let sliderInterval: NodeJS.Timeout;
    let sliderWidth = 100 / testimonialBoxPropsArray.length / 5;
    let isSlideAnimated = $state(true);

  
    const resetSlider = () => {
      setTimeout(() => isSlideAnimated = false, 500);
      setTimeout(() => sliderIndex = testimonialBoxPropsArray.length, 520);
      setTimeout(() => isSlideAnimated = true, 540);
    }
  
    const slideLeft = () => {
        sliderIndex++;
        clearInterval(sliderInterval);
	    sliderInterval = setInterval(()=>slideLeft(), SLIDER_INTERVAL_IN_MS);
        if(sliderIndex%testimonialBoxPropsArray.length==0&&sliderIndex!==0) 
            resetSlider();
    }
  
    const slideRight = () => {
      sliderIndex--;
      clearInterval(sliderInterval);
      
	sliderInterval = setInterval(()=>slideRight(), SLIDER_INTERVAL_IN_MS);
    if(sliderIndex%testimonialBoxPropsArray.length==0&&sliderIndex!==0 && sliderIndex<0)
        resetSlider();

        console.log(sliderIndex);
    }

    const handleSwipe = (e:CustomEvent<{ direction: "left" | "top" | "right" | "bottom"; target: EventTarget; }>) => {
      if(e.detail.direction==="left") 
        slideLeft();

        if(e.detail.direction==="right") 
        slideRight();
    }
  
    onMount(() => {
      sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
    });
  
    const quintupledPropsArray = [...testimonialBoxPropsArray, ...testimonialBoxPropsArray, ...testimonialBoxPropsArray, ...testimonialBoxPropsArray, ...testimonialBoxPropsArray];
  </script>
  
  <div use:swipe onswipe={handleSwipe} class="w-full h-full relative overflow-hidden">
    <div class="flex flex-row flex-nowrap  {isSlideAnimated ? 'transition-transform duration-500 ease-in-out' : ''}" style="width: {quintupledPropsArray.length * 100}%; transform: translateX(-{(sliderIndex+testimonialBoxPropsArray.length) * sliderWidth}%);">
      {#each quintupledPropsArray as testimonialBoxProps}
        <div class="h-full z-0" style="width: {sliderWidth}%;">
          <TestimonialBox {...testimonialBoxProps} />
        </div>
      {/each}
    </div>
  
    <div class="ml-8 h-6 w-16 flex justify-between z-10 absolute bottom-0  left-0">
      <button onclick={slideRight} class="h-6 w-6 rounded-full p-1 flex align-middle justify-center cursor-pointer transition-all duration-300 active:-translate-y-2  hover:bg-[#C2D1D9] ">
        <img alt='chevron-left' src={arrow} class='-translate-x-[1px] rotate-180 opacity-40 hover:opacity-100' />
      </button>
      <button onclick={slideLeft} class="h-6 w-6 rounded-full p-1 flex align-middle cursor-pointer transition-all duration-300 active:-translate-y-2 justify-center hover:bg-[#C2D1D9] ">
        <img alt='chevron-right' src={arrow} class='opacity-40 hover:opacity-100 translate-x-[1px]' />
      </button>
    </div>
  </div>