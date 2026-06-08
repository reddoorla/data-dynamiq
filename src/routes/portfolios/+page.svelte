<script lang='ts'>
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import ContentBox from "$lib/components/FullWidth/ContentBox.svelte";
  import ScreenWidthGallerySliderLarge from "$lib/components/ScreenWidth/ScreenWidthGallerySliderLarge.svelte";
  import FourByThreeImage from "$lib/components/FullWidth/FourByThreeImage.svelte";
    import Spacer from "$lib/components/Spacer.svelte";
    import Select from 'svelte-select'
    import { flip } from "svelte/animate";
    import { fade,scale } from "svelte/transition";
    import bg_placeholder from "$lib/assets/images/background_placeholder.svg"
    import placeholder from '$lib/assets/images/image_placeholder.svg'
    import dropdownArrow from "$lib/assets/icons/dropdown-arrow-light.svg"


    const PORTFOLIO_ITEMS = [
        {
            name: "Item 1",
            featuredText:"Dev + UX, a link",
            href:"#",
            filters:['Dev', 'UX'],
            featuredImage:placeholder      
        },
        {
            name: "Item 2",
            featuredText:"DEV + UI",
            featuredImage:placeholder,  
            filters:['Dev', 'UI']       
        },
        {
            name: "Item 3",
            featuredText:"UX + UI",
            filters:['UI', 'UX'],
            featuredImage:placeholder   
        },
        {
            name: "Item 4",
            featuredText:"Dev + UX + UI",
            featuredImage:placeholder,  
            filters:['Dev', 'UX', 'UI']       
        },
        {
            name: "Item 5",
            featuredText:"None, different image, a link",
            href:"#",
            featuredImage: bg_placeholder,      
        },
        {
            name: "Item 6",
            featuredText:"Dev",
            featuredImage:placeholder,  
            filters:['Dev']       
        }
    ];

    let filters = ['Dev', 'UX', 'UI'];
    let activeFilters:any[]|undefined = $state();;
    let activeFilterValues:string[]|undefined = $derived(activeFilters?.map(filter => filter.value));
    

    let filteredPortfolioItems = $derived(PORTFOLIO_ITEMS.filter(item => {
    if (!activeFilterValues||activeFilterValues.length==0) {
      return true;
    }
    
    if (!item.filters) {
      return false;
    }
        return  activeFilterValues.every(tag => item.filters.includes(tag));
  }));


    let selectHover = $state(false);


</script>

<!-- portfolio #1 -->
<ContentWidth class="-mb-12 mt-12">
    <div class="max-w-[564px] mx-auto">
        <ContentBox 
        icon=""
        titleTag="h2"
        titleText="Our Portfolio"
        paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
        float="center"
        />
    </div>
   
</ContentWidth>
<ScreenWidthGallerySliderLarge itemArray={PORTFOLIO_ITEMS}/>


<Spacer color="#424B5A" />


<!-- portfolio #2 -->

<ContentWidth >
    <div class="max-w-[564px] mx-auto">
        <ContentBox 
        icon=""
        titleTag="h2"
        titleText="Our Portfolio"
        paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
        float="center"
        />
    </div>
    <div class="max-w-[720px] w-full mx-auto cursor-pointer relative" role="separator" onmouseover={()=> selectHover=true} onfocus={()=> selectHover=true} onmouseout={()=> selectHover=false} onblur={()=> selectHover=false} >
        <Select items={filters} bind:value={activeFilters} placeholder="Type of Project" multiple={true} searchable={false} class="svelte-select" />
        <div class="absolute h-full aspect-square right-0 top-0 flex items-center justify-center pointer-events-none">
            <img src={dropdownArrow} alt="decorative dropdown arrow" aria-hidden class:opacity-55={selectHover}  class=" transition-all pointer-events-none"/>

        </div>
    </div>


<div class="w-full flex flex-row flex-wrap gap-y-0 gap-x-8 items-center justify-center mt-8">
    {#each filteredPortfolioItems as item (item.name)}
    <div animate:flip="{{ duration: 500 }}"  class="w-80" transition:scale>
    {#if item.href}
    <a href={item?.href||"#"} class="h-full relative " >
        <FourByThreeImage  src={item?.featuredImage} label={item?.featuredText||""} alt={item.name} class="h-full object-cover -z-10"/>
        <div class="absolute w-full aspect-[4/3] top-8 left-0 bg-dark opacity-0 hover:opacity-100 hover:bg-opacity-80 transition-opacity duration-500 flex justify-center items-center">
          <h4 class="text-white">{item.name}</h4>
      </div>
    </a>
    {:else}
    <div class="h-full w-80" >
      <FourByThreeImage  src={item?.featuredImage}  label={item?.featuredText||""} alt={item.name} class="h-full object-cover -z-10"/>
    </div>
    {/if}
    </div>
    {/each}

</div>
</ContentWidth>

<Spacer color="#424B5A" />

<!-- portfolio #3 -->
<Spacer color="#424B5A" />

<!-- portfolio #4 -->
<Spacer color="#424B5A" />

<!-- portfolio #5 -->
<Spacer color="#424B5A" />