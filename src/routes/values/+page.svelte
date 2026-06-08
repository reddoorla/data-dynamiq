<script lang="ts">
  import { run } from 'svelte/legacy';

  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import Spacer from "$lib/components/Spacer.svelte";
  import ContentBox from "$lib/components/FullWidth/ContentBox.svelte";
  import placeholder from "$lib/assets/images/image_placeholder.svg"
  import HalfWidthImage from "$lib/components/HalfWidth/HalfWidthImage.svelte";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import chevronLeft from "$lib/assets/icons/chevron-left.svg"
  import chevronRight from "$lib/assets/icons/chevron-right.svg"
  import { fade } from "svelte/transition";
  import { swipe } from "svelte-gestures";


    let innerWidth:number = $state();    
    const loremParagraph = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."
    

    let activeValue = $state(2);
    let showValueBox = $state(true);
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

<svelte:head>
    <title>Values Blocks | Reddoor Wireframer</title>
</svelte:head>

<svelte:window bind:innerWidth />

<!-- values block #1 -->
<ContentWidth>
    <h2 class="mb-16 text-center">Here is our Value Proposition</h2>
    <div use:swipe={{minSwipeDistance:20, touchAction: 'pan-y'}} onswipe={handleSwipe} class="w-[300vw] lg:translate-x-0 lg:w-full flex flex-row justify-around lg:justify-between flex-nowrap transition-transform overflow-hidden duration-1000"
            style={innerWidth < 1024 ? sliderStyleString : ""}>
        <div class="w-[360px]">
        <ContentBox 
            icon={placeholder}
            labelText="Strategic Foundation"
            paragraphText={loremParagraph}
            class=""
        />
        </div>
        <div class="w-[360px]">
        <ContentBox 
            icon={placeholder}
            labelText="User-centric precision"
            paragraphText={loremParagraph}
            class=""
        />
        </div>
        <div class="w-[360px]">
        <ContentBox 
            icon={placeholder}
            labelText="iterate for excellence"
            paragraphText={loremParagraph}
            class=""
        />
        </div>
    </div>
    <div class="absolute h-10 flex align-middle justify-start xl:left-8 translate-x-[2px] -bottom-4 lg:hidden">
        
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
    <button onclick={()=>activeValue--} class="{activeValue==1||innerWidth>1024 ? "hidden" : ""} absolute left-0 h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle justify-center cursor-pointer transition-all duration-500 hover:bg-[#424B5A] hover:border-[#424B5A]">
        <img alt='chevron-left' src={chevronLeft} class='-translate-x-[1px]' />
      </button>
      <button onclick={()=>activeValue++} class="{activeValue==3||innerWidth>1024 ? "hidden" : ""} absolute right-0 h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle cursor-pointer transition-all duration-500 justify-center hover:bg-[#424B5A] hover:border-[#424B5A]">
        <img alt='chevron-right' src={chevronRight} class='translate-x-[1px]' />
      </button>
</ContentWidth>
<Spacer color="#424B5A" />

<!-- values block #2 -->

<ContentWidth >
    <h6 class="mb-16">HERE IS OUR VALUE PROPOSITION</h6>
    <div class="flex w-full mb-16 flex-col lg:flex-row">
        <div class="w-full lg:w-1/2 flex flex-col justify-start pr-6">
            <div class="w-full justify-between mb-16 hidden sm:flex">
                <DefaultButton 
                    text="Value 1"
                    filled={activeValue===1}
                    click={()=>setActiveValueWithDelay(1)}
                />
                <DefaultButton 
                    text="Value 2"
                    filled={activeValue===2}
                    click={()=>setActiveValueWithDelay(2)}
                />
                <DefaultButton 
                    text="Value 3"
                    filled={activeValue===3}
                    click={()=>setActiveValueWithDelay(3)}
                />
            </div>
            {#key activeValue}
            <div out:fade={{duration:300}} in:fade={{delay:500, duration:300}} >
            
            {#if activeValue==1 && showValueBox || innerWidth < 560}
           
            <ContentBox 
                icon=""
                titleTag="h2"
                titleText="Value 1"
                paragraphText={loremParagraph}
                linkText="Learn More"
                float="{innerWidth > 1024 ? "left" : "center"}"
                class="p-0 w-[480px] mx-auto lg:w-3/4 lg:-ml-8 mb-16"
            />
            {/if}
           
            {#if activeValue==2 && showValueBox || innerWidth < 560}
            <ContentBox 
                icon=""
                titleTag="h2"
                titleText="Value 2"
                paragraphText={loremParagraph}
                linkText="Learn More"
                float="{innerWidth > 1024 ? "left" : "center"}"
                class="p-0 w-[480px] mx-auto lg:w-3/4 lg:-ml-8 mb-16"
            />
            {/if}
            
        
            
            {#if activeValue==3 && showValueBox || innerWidth < 560}
            <ContentBox 
                icon=""
                titleTag="h2"
                titleText="Value 3"
                paragraphText={loremParagraph}
                linkText="Learn More"
                float="{innerWidth > 1024 ? "left" : "center"}"
                class="p-0 w-[480px] mx-auto lg:w-3/4 lg:-ml-8 mb-16"
            />
            {/if}
            </div>
            {/key}
        
        </div>
        <HalfWidthImage class="lg:pl-6 mt-0"/>
    </div>
</ContentWidth>
<Spacer color="#424B5A" />

<!-- values block #3 -->

<ContentWidth class="my-16">
    <h2 class="text-center">Here is Our Value Proposition</h2>
    <div class="mt-16 flex flex-col lg:flex-row">
        <HalfWidthImage />
        <div class="w-full lg:w-1/2 lg:ml-16 flex flex-row flex-wrap -mt-4">
            {#each {length:6} as _, i (i)}
            <div class="w-full sm:w-1/2 aspect-video flex flex-col py-6 pr-6">
                <div class="flex flex-row my-5">
                    <img src={placeholder} alt="placeholder" class="w-6 mr-5" />
                    <h6>{"Value "+(i+1)}</h6>
                </div>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididuntut lab.
                </p>
            </div>
            {/each} 
        </div>

    </div>
</ContentWidth>

<Spacer color="#424B5A" />

<!-- values block #4 -->

<ContentWidth class="my-16">
    <h2 class="mb-16 text-center">Here is our Value Proposition</h2>
    <p class="text-center mb-16">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <div class="flex flex-row justify-between flex-wrap">
        {#each {length:4} as _, i (i)}
            <ContentBox 
                icon={placeholder}
                float="center"
                subtitleText={"Value "+(i+1)}
                paragraphText="Lorem ipsum dolor sit amet, consectetur"
                class="w-full md:w-[45%] lg:w-[20%] h-96"
            />
        {/each}
    </div>
</ContentWidth>