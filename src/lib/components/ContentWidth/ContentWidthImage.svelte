<script lang='ts'>
    import placeholder from "../../assets/images/background_placeholder.svg";
    
    interface Props {
        image?: any;
        altText?: string;
        children?: import('svelte').Snippet;
    }

    let { image = placeholder, altText = "background image", children }: Props = $props();
    </script>

        <div  class="max-w-screen-xl mx-auto relative w-full aspect-[9/16] sm:aspect-square lg:aspect-[16/9]">
            <img src={image} alt={altText} class="absolute bottom-0 h-full w-full object-cover -z-10"/>
            <div class='w-full h-full p-[4%] xl:p-0'>
                {@render children?.()}
            </div>
        </div>