<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { Snippet } from "svelte";

    interface Props {
        style?: string;
        transitionDelayMax?: number;
        transitionDuration?: number;
        class?: string;
        children?: Snippet;
    }

    let {
        style = "",
        transitionDelayMax = 400,
        transitionDuration = 2400,
        class: klass = "",
        children = undefined,
    }: Props = $props();

    let isInView = $state(false);
    let el: HTMLElement | null = $state(null);
    let transitionDelay = $state(0);

    const checkViewport = () => {
        if(window&&el){
                let rect = el.getBoundingClientRect();
                isInView = rect.bottom <= window.innerHeight + rect.height
                transitionDelay= transitionDelayMax * (rect.left/window.innerWidth)
            }
    }
    let checking:NodeJS.Timeout;

    onMount(()=>{
        checkViewport()

        checking = setInterval(()=>{
            checkViewport()
        }
    ,4000)


        window.addEventListener('scroll', checkViewport)
    })

    onDestroy(()=>{
        if(typeof window !== 'undefined'){
        window.removeEventListener('scroll', checkViewport)

        if(checking)
            clearInterval(checking);
        }}
    )
</script>


<div bind:this={el} class="transition ease-fast-slow {isInView ? "opacity-100 translate-y-0":"opacity-0 translate-y-[50%]"} {klass}" style="transition-delay:{transitionDelay}ms; transition-duration:{transitionDuration}ms; {style}">
    {@render children?.()}
</div>
