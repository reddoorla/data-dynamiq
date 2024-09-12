<script lang='ts'>
import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
import ScreenWidthImageSlider from "$lib/components/ScreenWidth/ScreenWidthImageSlider.svelte"
import TitleBox from "$lib/components/FullWidth/TitleBox.svelte"
import Spacer from "$lib/components/Spacer.svelte";
import playIcon from "$lib/assets/icons/play-button.svg"
</script>

<svelte:head>
    <title>Mastheads | Reddoor Wireframer</title>
</svelte:head>

<!--Masthead #1-->
<ScreenWidthImage>
    <div class="w-full max-w-80 sm:w-[620px] sm:max-w-full mx-auto mt-20 sm:mt-[125px]">
        <TitleBox 
            labelText="Designing Tomorrow's Success Today"
            titleText="Craft Seamless Experiences with Wireframes"
        />
    </div>

    <img src={playIcon} alt="play" class="w-[52.5px] h-[52.5px] mt-0 md:mt-16 mx-auto" />
</ScreenWidthImage>

<Spacer color="#424B5A" />
<!--Masthead #4-->

<ScreenWidthImageSlider>
    <div class="w-full max-w-screen-xl h-full flex flex-col justify-end">
        <div class="w-80 sm:w-[620px] h-fit mx-auto sm:ml-0  mb-28">
            <TitleBox
                labelText="Designing Tomorrow's Success Today"
                titleText="Craft Seamless Experiences with Wireframes"
                buttonText = "BUTTON"
                linkText = "LEARN MORE"
                icon=""
                float="left"
            />
        </div>
    </div>
</ScreenWidthImageSlider>

<Spacer color="#424B5A" />

<!--Masthead #2-->
<ScreenWidthImage>
    <div class="w-full h-full flex flex-col justify-center">
        <div class="w-80 sm:w-[620px] mx-auto md:ml-0 h-fit">
            <TitleBox 
             icon=""
             labelText="Designing Tomorrow's Success Today"
             titleText="Craft Seamless Experiences with Wireframes"
             paragraphText="Unleash the power of intuitive design with our comprehensive wireframing solutions. Elevate your projects through meticulous planning and user-centric layouts. Join us on a journey of innovation and precision in every pixel. Transform your ideas into extraordinary digital experiences."
             buttonText="BUTTON"
             linkText="LEARN MORE"
             float="left"
            />
        </div>
    </div>

</ScreenWidthImage>

<Spacer color="#424B5A" />

<!--Masthead #3-->

<ScreenWidthImage placeholderSide="left">
    <div class="w-full h-full flex flex-col justify-center">
        <div class="w-80 sm:w-[620px] mx-auto md:ml-0 lg:mr-0 lg:ml-auto h-fit">
            <TitleBox 
             icon=""
             labelText="Designing Tomorrow's Success Today"
             titleText="Craft Seamless Experiences with Wireframes"
             paragraphText="Unleash the power of intuitive design with our comprehensive wireframing solutions. Elevate your projects through meticulous planning and user-centric layouts. Join us on a journey of innovation and precision in every pixel. Transform your ideas into extraordinary digital experiences."
             buttonText="BUTTON"
             linkText="LEARN MORE"
             float="left"
            />
        </div>
    </div>

</ScreenWidthImage>