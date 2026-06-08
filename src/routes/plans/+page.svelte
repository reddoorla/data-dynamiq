<script lang='ts'>
    import Spacer from "$lib/components/Spacer.svelte";
    import placeholder from "$lib/assets/images/image_placeholder.svg"
    import ArrowButton from "$lib/components/Buttons/ArrowButton.svelte";
    import nextArrow from "$lib/assets/icons/wireframe-link-arrow-right.svg"
    import ContentBox from "$lib/components/FullWidth/ContentBox.svelte";
    import HalfWidthImage from "$lib/components/HalfWidth/HalfWidthImage.svelte";
    import FourByThreeImage from "$lib/components/FullWidth/FourByThreeImage.svelte"
  import { fade } from "svelte/transition";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import SliderOfContentBoxes from "$lib/components/FullWidth/SliderOfContentBoxes.svelte";

    const placeholderParagraph = `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.

    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.`;

    let step = $state(1);
    let showStepBox = $state(true);

    const setStepWithDelay = (i:number) => {
        showStepBox = false;
        step = i;
        setTimeout(() => {
            showStepBox = true;
        }, 300);
  }

  const planContentBoxPropsArray = [
        {
        float: "left",
        titleTag:"h6",
        titleText: "SIGN UP",
        paragraphText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
      },
      {
        titleTag:"h6",
        float: "left",
        titleText: "SET UP",
        paragraphText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
      },
      {
        titleTag:"h6",
        float: "left",
        titleText: "SHARE",
        paragraphText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
      }
    
    
  ]
</script>
<style>
    .plan-arrow{
        filter: invert(1);
        filter: invert(88%) sepia(19%) saturate(154%) hue-rotate(156deg) brightness(96%) contrast(82%);
    }
    .plan-line{
        height: 1px;
        width: calc(100% - 100px);
        background-color: #C2D1D9;
    }
</style>
<svelte:head>
    <title>Plan | Reddoor Wireframer</title>
</svelte:head>

<!-- plan #1 -->

<div class="max-w-screen-xl xl:mx-auto flex flex-col justify-center items-center my-32 mx-[4%]">
    <h2 class="mb-20">The Plan</h2>
    <div class="flex w-full justify-between items-center flex-col lg:flex-row mb-20">
        <div class="w-full sm:w-96 lg:w-1/3 flex flex-col justify-center items-center py-5 px-4 mx-auto relative mb-10">
            <div class="w-9 h-9 bg-black rounded-full text-white flex justify-center items-center mb-5"><p class="translate-y-[1px]">1</p></div>
            <img src={placeholder} alt="placeholder" class="w-32 mb-5" />
            <h6 class="mb-6">Blueprint Your Vision</h6>
            <p class="text-center">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.</p>
            <img  src={nextArrow} alt="next arrow" class="w-6 absolute -translate-2 rotate-90 lg:rotate-0 top-[100%] lg:top-[50%] right-[50%] lg:right-0 translate-x-3 plan-arrow"/>
        </div>
        <div class="w-full sm:w-96 lg:w-1/3 flex flex-col justify-center items-center py-5 px-4 mx-auto relative mb-10">
            <div class="w-9 h-9 bg-black rounded-full text-white flex justify-center items-center mb-5"><p class="translate-y-[1px]">2</p></div>
            <img src={placeholder} alt="placeholder" class="w-32 mb-5" />
            <h6 class="mb-6">Refine with Precision</h6>
            <p class="text-center">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.</p>
            <img  src={nextArrow} alt="next arrow" class="w-6 absolute -translate-2 rotate-90 lg:rotate-0 top-[100%] lg:top-[50%] right-[50%] lg:right-0 translate-x-3 plan-arrow"/>
        </div>
        <div class="w-full sm:w-96 lg:w-1/3 flex flex-col justify-center items-center py-5 px-4 mx-auto relative mb-10">
            <div class="w-9 h-9 bg-black rounded-full text-white flex justify-center items-center mb-5"><p class="translate-y-[1px]">3</p></div>
            <img src={placeholder} alt="placeholder" class="w-32 mb-5" />
            <h6 class="mb-6">Test and Iterate</h6>
            <p class="text-center">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.</p>
            <img  src={nextArrow} alt="next arrow" class="w-6 absolute -translate-2 rotate-90 lg:rotate-0 top-[100%] lg:top-[50%] right-[50%] lg:right-0 translate-x-3 plan-arrow hidden"/>
        </div>
    </div>
    <ArrowButton text="Learn More" />
</div>

<Spacer color="#424B5A" />

<!-- plan #2 -->

<div class="max-w-screen-xl xl:mx-auto flex flex-col justify-center items-center my-32 mx-[4%]">
    <h2 class="mb-20">The Plan</h2>
    <div class="w-11/12 h-24 relative flex flex-row justify-between">
        <div class="plan-line absolute top-6 translate-y-[1.5px] left-[50px] -z-10"></div>
        <button class="flex flex-col justify-center items-center hover:opacity-95"
            onclick={()=>setStepWithDelay(1)}
        >
            <div class="w-12 h-12 {step==1 ? "bg-black":"bg-dark"} hover:bg-black transition-all duration-300 rounded-full text-white flex justify-center items-center mb-5"><p class="translate-y-[1px]">1</p></div>
            <h6>Sign Up</h6>
        </button>
        <button class="flex flex-col justify-center items-center hover:bg-opacity-95"
        onclick={()=>setStepWithDelay(2)}>
            <div class="w-12 h-12 {step==2 ? "bg-black":"bg-dark"} transition-all duration-300 hover:bg-black rounded-full text-white flex justify-center items-center mb-5"><p class="translate-y-[1px]">2</p></div>
            <h6>Set Up</h6>
        </button> 
        <button class="flex flex-col justify-center items-center transition-opacity hover:opacity-95 cursor-pointer"
             onclick={()=>setStepWithDelay(3)}
        >
            <div class="w-12 h-12 {step==3 ? "bg-black":"bg-dark"} hover:bg-black transition-all duration-300 rounded-full text-white flex justify-center items-center mb-5"><p class="translate-y-[1px]">3</p></div>
            <h6>Share</h6>
        </button>  
    </div>
    <div class="w-full flex flex-col lg:flex-row justify-center items-top mt-16">
        <div class="w-full lg:w-1/2 pr-6">
            {#key step}
            <div out:fade={{duration:300}} in:fade={{delay:500, duration:300}}>
            
            {#if step==1&&showStepBox}
           
            <ContentBox 
                titleTag="h3"
                titleText="BLUEPRINT YOUR VISION"
                paragraphText={placeholderParagraph}
                buttonText="BUTTON"
                linkText="Learn More"
                float="left"
                icon=""
                class=""
            />
           
            {:else if step==2&&showStepBox}
            
            <ContentBox 
                titleTag="h3"
                titleText="REFINE WITH PRECISION"
                paragraphText={placeholderParagraph}
                buttonText="BUTTON"
                linkText="Learn More"
                float="left"
                icon=""
                class=""
            />
            
            {:else if step==3&&showStepBox}
            
            <ContentBox 
                titleTag="h3"
                titleText="TEST AND ITERATE"
                paragraphText={placeholderParagraph}
                buttonText="BUTTON"
                linkText="Learn More"
                float="left"
                icon=""
                class=""
            />
           
            {/if}
            </div>
            {/key}

        </div>
       
        <div class="w-full lg:w-1/2 h-full">
            {#key step}
            <div out:fade={{duration:300}} in:fade={{delay:500, duration:300}}>
            
            {#if step==1&&showStepBox}
                <FourByThreeImage />
            {:else if step==2&&showStepBox}
                <FourByThreeImage />
            {:else if step==3&&showStepBox}
                <FourByThreeImage />
            {/if}
            </div>
            {/key}
            </div>
            
       
    </div>
</div>
<Spacer color="#424B5A" />

<!-- plan #3 -->
 <ContentWidth>
    <h2>The Plan</h2>
    <div class="w-full flex flex-col lg:flex-row relative gap-6">
        <FourByThreeImage class="w-full lg:w-2/3" />
        <div class="w-full h-full lg:w-1/3 flex flex-col sm:flex-row lg:flex-col justify-evenly relative mt-16 gap-16">
            <div class="w-full sm:w-1/3 lg:w-full flex flex-row justify-between gap-4">
                <div class="w-12 h-12 rounded-full p-2 bg-[#F2F5F7] flex justify-center items-center">
                    <img class="w-10 h-10" src={placeholder} alt="placeholder"/>
                </div>
                <div class="flex flex-col h-full">
                    <h6 class="mt-2">STEP 1</h6>
                    <p>Lorem ipsum dolor sit amet consectetur.</p>
                </div>
            </div>
            <div class="w-full sm:w-1/3 lg:w-full flex flex-row justify-between gap-4">
                <div class="w-12 h-12 rounded-full p-2 bg-[#F2F5F7] flex justify-center items-center">
                    <img class="w-10 h-10" src={placeholder} alt="placeholder"/>
                </div>
                <div class="flex flex-col h-full">
                    <h6 class="mt-2">STEP 2</h6>
                    <p>Lorem ipsum dolor sit amet consectetur.</p>
                </div>
            </div>
            <div class="w-full sm:w-1/3 lg:w-full flex flex-row justify-between gap-4">
                <div class="w-12 h-12 rounded-full p-2 bg-[#F2F5F7] flex justify-center items-center">
                    <img class="w-10 h-10" src={placeholder} alt="placeholder"/>
                </div>
                <div class="flex flex-col h-full">
                    <h6 class="mt-2">STEP 3</h6>
                    <p>Lorem ipsum dolor sit amet consectetur.</p>
                </div>
            </div>
        </div>
    </div>

 </ContentWidth>
<Spacer color="#424B5A" />

<!-- plan #4 -->
<ContentWidth class="flex flex-col lg:flex-row my-16">
    <div class="flex flex-col md:flex-row lg:flex-col w-full lg:w-1/3">
        <ContentBox
            titleTag="h2"
            titleText="The Plan"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            float="left"
        />
        <SliderOfContentBoxes
            contentBoxPropsArray={planContentBoxPropsArray}
            isNumbered
        />
    </div>
    <FourByThreeImage class="w-full lg:w-2/3" />

</ContentWidth>