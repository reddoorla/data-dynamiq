<script lang='ts'>
    import { onMount } from "svelte";
    import { swipe } from "svelte-gestures";
    import ContentBox from "./ContentBox.svelte";
    import type { ComponentProps } from "svelte";
    import chevronLeft from "../../assets/icons/chevron-left.svg";
    import chevronRight from "../../assets/icons/chevron-right.svg";
  

  interface Props {
    contentBoxPropsArray?: ComponentProps<ContentBox>[];
    isNumbered?: boolean;
  }

  let { contentBoxPropsArray = [
      {
        icon: "",
        float: "left",
        titleText: "Generic Content",
        paragraphText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
      },
      {
        icon: "",
        float: "left",
        titleText: "Generic Content 2",
        paragraphText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
      }
    ], isNumbered = false }: Props = $props();
  

    const SLIDER_INTERVAL_IN_MS = 5000;
    let sliderIndex = $state(0);
    let sliderInterval: NodeJS.Timeout;
    let sliderWidth = 100 / contentBoxPropsArray.length / 5;
    let isSlideAnimated = $state(true);

  
    const resetSlider = () => {
      setTimeout(() => isSlideAnimated = false, 500);
      setTimeout(() => sliderIndex = contentBoxPropsArray.length, 520);
      setTimeout(() => isSlideAnimated = true, 540);
    }
  
    const slideLeft = () => {
        sliderIndex++;
        clearInterval(sliderInterval);
	    sliderInterval = setInterval(()=>slideLeft(), SLIDER_INTERVAL_IN_MS);
        if(sliderIndex%contentBoxPropsArray.length==0&&sliderIndex!==0) 
            resetSlider();
    }
  
    const slideRight = () => {
      sliderIndex--;
      clearInterval(sliderInterval);
      
	sliderInterval = setInterval(()=>slideRight(), SLIDER_INTERVAL_IN_MS);
    if(sliderIndex%contentBoxPropsArray.length==0&&sliderIndex!==0 && sliderIndex<0)
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
  
    const quintupledPropsArray = [...contentBoxPropsArray, ...contentBoxPropsArray, ...contentBoxPropsArray, ...contentBoxPropsArray, ...contentBoxPropsArray];
  </script>
  
  <div use:swipe onswipe={handleSwipe} class="w-full h-full relative overflow-hidden">
    <div class="flex flex-row flex-nowrap  {isSlideAnimated ? 'transition-transform duration-500 ease-in-out' : ''}" style="width: {quintupledPropsArray.length * 100}%; transform: translateX(-{(sliderIndex+contentBoxPropsArray.length) * sliderWidth}%);">
      {#each quintupledPropsArray as contentBoxProps, i (i)}
        <div class="h-full z-0" style="width: {sliderWidth}%;">
          {#if isNumbered}
          <div class="ml-2 sm:ml-7 -mb-1 mt-2 sm:-mb-4 w-9 h-9 bg-black rounded-full text-white flex justify-center items-center "><p class="translate-y-[1px]">{i%contentBoxPropsArray.length+1}</p></div>
          {/if}
          <ContentBox {...contentBoxProps} />
        </div>
      {/each}
    </div>
  
    <div class="ml-8 h-6 w-16 flex justify-between z-10 absolute bottom-0 lg:bottom-[10%] xl:bottom-[20%] left-0">
      <button onclick={slideRight} class="h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle justify-center cursor-pointer transition-all duration-300 active:-translate-y-2  hover:bg-[#424B5A] hover:border-[#424B5A]">
        <img alt='chevron-left' src={chevronLeft} class='-translate-x-[1px]' />
      </button>
      <button onclick={slideLeft} class="h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle cursor-pointer transition-all duration-300 active:-translate-y-2 justify-center hover:bg-[#424B5A] hover:border-[#424B5A]">
        <img alt='chevron-right' src={chevronRight} class='translate-x-[1px]' />
      </button>
    </div>
  </div>