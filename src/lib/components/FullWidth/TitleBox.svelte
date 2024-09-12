<script lang='ts'>
    import placeholderIcon from "../../assets/icons/logos/logo.svg"
    import DefaultButton from "../Buttons/DefaultButton.svelte";
    import ArrowButton from "../Buttons/ArrowButton.svelte";


export let icon = placeholderIcon;
export let iconAltText = "logo"
export let labelText = ""
export let titleText = ""
export let subtitleText = ""
export let paragraphText = ""
export let buttonText = ""
export let linkText=""
export let linkHref=""
export let backgroundColor="transparent"
export let float = "center"

let justify=float;
if(float==="left")
    justify="start";
if(float==="right")
    justify="end"

let horizontalFloatMargin = "mx-auto"
if(float==="left")
    horizontalFloatMargin="ml-0 mr-auto";
if(float==="right")
    horizontalFloatMargin="ml-auto mr-0"

let isLinkArrowActive=false;
</script>

<div class="w-full flex flex-col p-2 md:p-8 justify-{justify} text-{float} {$$props.class || ''}"
     style="background-color: {backgroundColor}"
>
    {#if icon}
        <img src={icon} alt={iconAltText} class="w-[70px] h-[70px] mb-7 {horizontalFloatMargin}"/>
    {/if}
    {#if labelText}
        <h6 class="mb-7">{labelText}</h6>
    {/if}
    {#if titleText}
        <h1 class="mb-7">{titleText}</h1>
    {/if}
    {#if subtitleText}
        <h6 class="mb-7">{subtitleText}</h6>
    {/if}
    {#if paragraphText}
        <p class="mb-7 max-w-full">{paragraphText}</p>
    {/if}
    <div class="w-full flex flex-col sm:flex-row align-middle justify-center sm:justify-{justify}">
        {#if buttonText}
            <DefaultButton text={buttonText} class="mr-12"/>
        {/if}
        {#if linkText}
            <ArrowButton text={linkText} href={linkHref} class="sm:translate-x-0 ml-4 -translate-x-4"/>
        {/if}
    </div>


</div>