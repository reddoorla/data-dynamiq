<script lang='ts'>
    import Spacer from '$lib/components/Spacer.svelte';
    import ContentWidth from '$lib/components/ContentWidth/ContentWidth.svelte';
    import ContentBox from '$lib/components/FullWidth/ContentBox.svelte';
    import Accordian from '$lib/components/FullWidth/Accordian.svelte';
    import FourByThreeImage from '$lib/components/FullWidth/FourByThreeImage.svelte'
  import DefaultButton from '$lib/components/Buttons/DefaultButton.svelte';
  import { isFilled } from '@prismicio/client';

    const LOREM = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat m dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor inc."
    const LABELS = ["Is this thing on?", "It could be why don't you check?", "Ok?", "Ok, what?", "I think it might be on, what do you think?", "I don't know maybe that's why I asked you?"]
    const CONTENTS = [LOREM,LOREM,LOREM,LOREM,LOREM,LOREM]

</script>

<svelte:head>
    <title>Blog Sections | Reddoor Wireframer</title>
</svelte:head>

<!-- blog #4 -->

<ContentWidth>

    <div class="-ml-16 -mb-8  md:ml-0 w-full flex flex-row flex-wrap">
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
            class="-mt-16 -mb-8 md:my-0 w-full md:w-1/2"
        />

    </div>
    <div class="w-full flex flex-row justify-evenly items-start flex-wrap">
            <div class="w-full md:w-[46%] xl:w-[30%] my-12 flex flex-col items-center justify-center">
               <div class="w-full flex flex-row justify-between items-baseline -mb-4">
                <h6>Grids</h6>
                <a href="/">See all</a>
               </div>
               <FourByThreeImage />
               <Accordian contents={CONTENTS} labels={LABELS}/>
            </div>
            <div class="w-full md:w-[46%] xl:w-[30%] my-12 flex flex-col items-center justify-center">
                <div class="w-full flex flex-row justify-between items-baseline -mb-4">
                 <h6>Guides</h6>
                 <a href="/">See all</a>
                </div>
                <FourByThreeImage />
                <Accordian contents={CONTENTS} labels={LABELS}/>
             </div>
             <div class="w-full md:w-[46%] xl:w-[30%] my-12 flex flex-col items-center justify-center">
                <div class="w-full flex flex-row justify-between items-baseline -mb-4">
                 <h6>Concept</h6>
                 <a href="/">See all</a>
                </div>
                <FourByThreeImage />
                <Accordian contents={CONTENTS} labels={LABELS}/>
             </div>
            
</ContentWidth>
<Spacer color="#424B5A" />
<!-- blog #1 -->

<ContentWidth>

    <div class="w-full flew flex-row flex-wrap">
        <ContentBox 
            icon=""
            titleTag="h2"
            titleText="Fresh Blog Content "
            float= "left"
            class="w-full -mb-16"
        />
      

    </div>
    <div class="w-full flex flex-row justify-evenly items-start flex-wrap">
            <div class="w-full md:w-[30%] my-12 flex flex-col items-start">
            
               <FourByThreeImage />
               <h6 class="text-light text-left -mt-7">22 OCT 2018</h6>
               <p class="my-4">Mastering the Art of Wireframing: A Comprehensive Guide for Digital Design Success</p>
               <DefaultButton filled={false} text="READ BUTTON"/>
              
            </div>
            <div class="w-full md:w-[30%] my-12 flex flex-col items-start">

                <FourByThreeImage />
                <h6 class="text-light text-left -mt-7">22 OCT 2018</h6>
                <p class="my-4">Mastering the Art of Wireframing: A Comprehensive Guide for Digital Design Success</p>
                <DefaultButton filled={false} text="READ BUTTON"/>
                
             </div>
             <div class="w-full md:w-[30%] my-12 flex flex-col items-start">

                <FourByThreeImage />
                <h6 class="text-light text-left -mt-7">22 OCT 2018</h6>
                <p class="my-4">Mastering the Art of Wireframing: A Comprehensive Guide for Digital Design Success</p>
                <DefaultButton filled={false} text="READ BUTTON"/>
               
             </div>
            
</ContentWidth>

<Spacer color="#424B5A" />
<!-- blog #2 -->
<Spacer color="#424B5A" />
<!-- blog #5 -->
<Spacer color="#424B5A" />