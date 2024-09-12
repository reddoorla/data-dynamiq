<script lang='ts'>
    import Spacer from '$lib/components/Spacer.svelte';
    import ScreenWidthImage from '$lib/components/ScreenWidth/ScreenWidthImage.svelte';
    import ContentBox from '$lib/components/FullWidth/ContentBox.svelte';
    import EmailSubmit from '$lib/components/FullWidth/EmailSubmit.svelte';
  import DefaultButton from '$lib/components/Buttons/DefaultButton.svelte';
  import { faEnvelope} from '@fortawesome/free-regular-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    const LOREM = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."

  
</script>

<svelte:head>
    <title>Calls to Action | Reddoor Wireframer</title>
</svelte:head>

<!-- cta #4 -->
<ScreenWidthImage>
    <div class="w-full h-full flex flex-col justify-center">
        <div class="w-80 sm:w-[620px] mx-auto md:ml-0 h-fit">
            <ContentBox
                titleTag="h2"
                titleText="This is a Title"
                subtitleText="SUBTITLE HERE"
                paragraphText={LOREM}
                buttonText="button"
                linkText="LEARN MORE"
                icon=""
                float="left"
            />
        </div>
    </div>

</ScreenWidthImage>

<Spacer color="#424B5A" />

<ScreenWidthImage>
    <div class="w-full h-full flex flex-col justify-center">
        <div class="w-80 sm:w-[620px] mx-auto h-fit">
            <ContentBox
                titleTag="h2"
                titleText="This is a Title"
                subtitleText="SUBTITLE HERE"
                paragraphText={LOREM}
                icon=""
                float="center"
            />
            <EmailSubmit />
            
        </div>
    </div>

</ScreenWidthImage>

<!-- cta #8 -->
<Spacer color="#424B5A" />

<!-- cta #2 -->
<Spacer color="#424B5A" />

<!-- cta #1 -->
<Spacer color="#424B5A" />