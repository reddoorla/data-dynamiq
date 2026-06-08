<script lang='ts'>
   import Spacer from "$lib/components/Spacer.svelte";
   import FourByThreeImage from "$lib/components/FullWidth/FourByThreeImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";  
  import ContentBox from "$lib/components/FullWidth/ContentBox.svelte";
  import placeholder from "$lib/assets/images/image_placeholder.svg"
  import ContactBox from "$lib/components/FullWidth/SocialsRow.svelte";

  let innerWidth:number = $state();
  const LOREM = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
</script>

<svelte:head>
    <title>Listed Content Blocks | Reddoor Wireframer</title>
</svelte:head>
<svelte:window bind:innerWidth />

<!-- List 1 -->


    {#if innerWidth > 768}
    <div class="w-full h-[37.5vw] relative">
    <div class="w-[50vw] h-[37.5vw] left-0 -top-8 -bottom-8 absolute">
        <FourByThreeImage />
    </div>
   <ContentWidth class="h-[37.5vw] relative flex items-center justify-end">
        <ContentBox 
            icon=""
            class="sm:w-[45%] float-right"
            titleTag="h5"
            titleText="This is a Title"
            paragraphText={LOREM}
            buttonText="BUTTON"
            float="left"
        />
   </ContentWidth>
    </div>
   {:else}
   <div class="w-screen">
    <FourByThreeImage />
   </div>
   <ContentWidth>
    <ContentBox 
            icon=""
            titleTag="h5"
            titleText="This is a Title"
            paragraphText={LOREM}
            buttonText="BUTTON"
            float="left"
        />
   </ContentWidth>
   {/if}

   {#if innerWidth > 768}
   <div class="w-full h-[37.5vw] relative ">
   <div class="w-[50vw] h-[37.5vw] right-0 -top-8 -bottom-8 absolute">
       <FourByThreeImage />
   </div>
  <ContentWidth class="h-[37.5vw] relative flex items-center justify-start">
       <ContentBox 
           icon=""
           class="sm:w-[45%] float-left"
           titleTag="h5"
           titleText="This is a Title"
           paragraphText={LOREM}
           buttonText="BUTTON"
           float="left"
       />
  </ContentWidth>
   </div>
  {:else}
  <div class="w-screen">
   <FourByThreeImage />
  </div>
  <ContentWidth>
   <ContentBox 
           icon=""
           titleTag="h5"
           titleText="This is a Title"
           paragraphText={LOREM}
           buttonText="BUTTON"
           float="left"
       />
  </ContentWidth>
  {/if}



<Spacer color="#424B5A" />

<!-- List 2 -->
<ContentWidth>
 
<div class="sm:-ml-16 -mb-8  md:ml-0 w-full flex flex-row flex-wrap">
    <ContentBox 
        icon=""
        titleTag="h2"
        titleText="This is a Title "
        float= "left"
        class="w-full md:w-1/2"
    />
    <ContentBox 
        icon=""
        paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
        float= "left"
        buttonText="BUTTON"
        class="-mt-8 -mb-8 md:my-0 w-full md:w-1/2"
    />

</div>
<div class="flex flex-row justify-between flex-wrap w-full mt-16">
    <ContentBox
        icon={placeholder}
        labelText="subtitle here"
        paragraphText={LOREM}
        linkText="Learn More"
        class="w-full sm:w-[48%] mt-8"
        backgroundColor="#C2D1D950"
    />
    <ContentBox
    icon={placeholder}
    labelText="subtitle here"
    paragraphText={LOREM}
    linkText="Learn More"
    class="w-full sm:w-[48%] mt-8"
    backgroundColor="#C2D1D950"
/>
<ContentBox
icon={placeholder}
labelText="subtitle here"
paragraphText={LOREM}
linkText="Learn More"
class="w-full sm:w-[48%] mt-8"
backgroundColor="#C2D1D950"
/>
<ContentBox
icon={placeholder}
labelText="subtitle here"
paragraphText={LOREM}
linkText="Learn More"
class="w-full sm:w-[48%] mt-8"
backgroundColor="#C2D1D950"
/>

   

</div>
</ContentWidth>

<Spacer color="#424B5A" />