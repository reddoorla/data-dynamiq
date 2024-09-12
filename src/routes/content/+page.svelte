<script lang='ts'>
    import ContentBox from "$lib/components/FullWidth/ContentBox.svelte"
    import TitleBox from "$lib/components/FullWidth/TitleBox.svelte";
    import Spacer from "$lib/components/Spacer.svelte";
    import ContentWidthImage from "$lib/components/ContentWidth/ContentWidthImage.svelte";
    import SliderOfContentBoxes from "$lib/components/FullWidth/SliderOfContentBoxes.svelte";
    import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
    import FourByThreeImage from "$lib/components/FullWidth/FourByThreeImage.svelte";
  import SquareImage from "$lib/components/FullWidth/SquareImage.svelte";
  import placeholderImage from "$lib/assets/images/image_placeholder.svg"

    
</script>
<svelte:head>
    <title>Content Blocks | Reddoor Wireframer</title>
</svelte:head>

<!--content #1-->
<div class="max-w-80 sm:w-[560px] sm:max-w-full mx-auto mt-20 sm:mt-[125px] my-14">
    <TitleBox 
        titleText="Generic Content"
        paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
    />
</div>

<Spacer color="#424B5A" />

<!--content #2-->

<ContentWidth class="flex flew-row flex-wrap my-14">
    <div class="w-full md:w-1/2 relative overflow-hidden">
        <SliderOfContentBoxes />
    </div> 
    <div class="w-full md:w-1/2 p-4">
            <FourByThreeImage />
    </div>
</ContentWidth>

<Spacer color="#424B5A" />

<!-- content #3 -->

<div class='my-14'>
<ContentWidthImage>

<div class="w-full left-0 lg:left-auto lg:w-[400px] absolute bottom-0 lg:right-8 xl:right-0">
    <ContentBox
        titleText="Generic Text"
        titleTag="h3"
        subtitleText="subtitle here"
        buttonText="BUTTON"
        linkText="LEARN MORE"
        icon=""
        backgroundColor="white"
    />
</div>
    
</ContentWidthImage>
</div>


<Spacer color="#424B5A" />

<!-- content #4 -->
<div class="w-screen h-[200vh] md:h-auto flex flex-col md:flex-row">
    <div class="w-full md:w-1/2  h-screen md:h-auto flex relative">
        <FourByThreeImage class="h-full md:h-auto"/>
        <ContentBox 
            subtitleText="Image Content"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor."
            buttonText="Button"
            class="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-96 z-10"
            backgroundColor="white"
        />
    </div>
    <div class="w-full md:w-1/2 h-screen md:h-auto flex relative">
        <FourByThreeImage />
        <ContentBox 
            subtitleText="Image Content"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor."
            buttonText="Button"
            class="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-96 z-10"
            backgroundColor="white"
        />
    </div>

</div>

<Spacer color="#424B5A" />
<!-- content #5 -->

<div class="w-screen flex flex-col md:flex-row">
    <SquareImage class="w-full md:w-1/2" />
    <div class="w-full md:w-1/2 max-w-[462px] md:ml-16 flex flex-col justify-center">
        <ContentBox
            icon="placeholder"
            titleTag="h3"
            titleText="Video Content"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."
            buttonText="button"
            linkText="Learn more"
            class=""
            float="left"
        />
    </div>  

</div>

<Spacer color="#424B5A" />

<!-- content #6 -->
 <ContentWidth>
    <h2 class="mx-auto">Generic Content</h2>

    <div class="w-full flex flex-col md:flex-row mt-20 md:mt-40 gap-8">
        <ContentBox
            subtitleText="label"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquat enim ad minim veniam."
            buttonText="button"
            backgroundColor="#F3F3F3"
            class="w-full md:w-1/2"
        />
        <ContentBox
            subtitleText="label"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquat enim ad minim veniam."
            buttonText="button"
            backgroundColor="#F3F3F3"
            class="w-full md:w-1/2"
        />
    </div>
 </ContentWidth>

 <Spacer color="#424B5A" />
 
 <!-- content #7 -->

 <ContentWidth class="flex flex-col md:flex-row my-16">
    <div class="w-full md:w-1/2 h-full flex flex-col justify-between">
        <ContentBox
            titleTag="h3"
            titleText="Generic Content"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
            float="left"
        />
        <div class="w-full flex flex-col gap-12 sm:flex-row p-2 sm:p-8">
            <div class="w-full md:w-1/3 flex flex-col gap-4">
                <img class="w-10" src={placeholderImage} alt="placeholder" />
                <p>Pretty Big Idea</p>
                <div class="label">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor.</div>
            </div>
            <div class="w-full md:w-1/3 flex flex-col gap-4">
                <img class="w-10" src={placeholderImage} alt="placeholder" />
                <p>Really Big Idea</p>
                <div class="label">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor.</div>
            </div>
            <div class="w-full md:w-1/3 flex flex-col gap-4">
                <img class="w-10" src={placeholderImage} alt="placeholder" />
                <p>Even Bigger Idea</p>
                <div class="label">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor.</div>
            </div>
        </div>
    </div>
    <FourByThreeImage 
        class="w-full md:w-1/2 m-2"
    />
 </ContentWidth>