<script lang="ts">
  import { createSwipeAction, type SwipeCustomEvent } from "$utils/swipeAction";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import FourByThreeImage from "../FullWidth/FourByThreeImage.svelte";
  import chevronLeft from "$lib/assets/icons/chevron-left.svg";
  import chevronRight from "$lib/assets/icons/chevron-right.svg";

  interface Props {
    imageArray?: string[];
    altText?: string;
    class?: string;
  }

  let {
    imageArray = [placeholder, placeholder, placeholder, placeholder],
    altText = "background image",
    class: klass = "",
  }: Props = $props();

  let viewportWidth: number = $state(0);

  let sliderIndex = $state(0);

  let isSlideAnimated = $state(true);

  const slideRight = () => {
    sliderIndex++;
  };
  const slideLeft = () => {
    sliderIndex--;
  };

  const handleSwipe = (e: SwipeCustomEvent) => {
    if (e.detail.direction === "left") slideRight();

    if (e.detail.direction === "right") slideLeft();
  };

  const swipe = createSwipeAction(handleSwipe);

  const tripledImages = $derived(
    imageArray.concat(imageArray).concat(imageArray),
  );
</script>

<svelte:window bind:innerWidth={viewportWidth} />

<section class="pb-32 {klass}">
  <div use:swipe class="h-[320px] py-2 relative">
    <div
      class="overflow-hidden w-screen mt-20 lg:mt-0"
      style="margin-left:{viewportWidth > 1340
        ? viewportWidth - 1220 / 2
        : viewportWidth * 0.04};"
    >
      <div
        class="h-full flex flex-row flex-nowrap {isSlideAnimated
          ? 'transition-transform duration-[2000ms]'
          : ''}"
        style="width:{352 *
          tripledImages.length}px; margin-left:{viewportWidth > 1340
          ? viewportWidth - 1220 / 2
          : viewportWidth * 0.04}; transform:translateX({-(
          sliderIndex + imageArray.length
        ) * 352}px); "
      >
        {#each tripledImages as _image}
          <div class="w-[360px] h-full mx-4">
            <FourByThreeImage alt={altText} class="h-full object-cover -z-10" />
          </div>
        {/each}
      </div>
    </div>
    <div
      class="absolute flex justify-center w-32 lg:w-full top-16 left-1/2 -translate-left-1/2 lg:bottom-1/2 lg:-left-16"
    >
      <ContentWidth class="h-full relative w-full">
        <button
          onclick={slideLeft}
          class="absolute left-0 lg:top-auto lg:-left-2 h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle justify-center cursor-pointer transition-all duration-500 hover:bg-[#424B5A] hover:border-[#424B5A] active:bg-black bump {sliderIndex ===
          0
            ? 'opacity-20 pointer-events-none'
            : ''}"
        >
          <img
            alt="chevron-left"
            src={chevronLeft}
            class="-translate-x-[1px]"
          />
        </button>
        <button
          onclick={slideRight}
          class="absolute right-0 lg:right-auto lg:-left-2 lg:top-12 -translate-y-[0.7px] h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle cursor-pointer transition-all duration-500 justify-center hover:bg-[#424B5A] hover:border-[#424B5A] active:bg-black bump {sliderIndex ===
          imageArray.length - 1
            ? 'opacity-20 pointer-events-none'
            : ''}"
        >
          <img
            alt="chevron-right"
            src={chevronRight}
            class="translate-x-[1px]"
          />
        </button>
      </ContentWidth>
    </div>
  </div>
</section>
