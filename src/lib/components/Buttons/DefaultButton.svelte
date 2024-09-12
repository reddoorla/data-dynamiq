<script lang="ts">
    export let text = "BUTTON";
    export let click = ()=>{};
    export let filled = true;
</script>

<style>
    button{
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 1em;
        text-align: center;
        border-radius: 3px;
        display: flex;
        padding: 13px 48px 9px 48px;
        justify-content: center;
        align-items: center;
    }
    @media only screen and (max-width:1340px) {
        button{
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            text-align: center;
            border-radius: 3px;
            padding: 13px 36px 9px 36px;
        }
    }


</style>


<button on:click={click} 
        class="{filled ?
         "bg-dark bg-opacity-80 hover:bg-opacity-100 active:bg-black  text-white" 
         : 
         "hover:bg-dark text-dark hover:text-white active:bg-black " 
         } border-2 border-dark w-full md:w-auto text-center mb-5 sm:mb-0 uppercase cursor-pointer text-nowrap transition-all duration-300 active:-translate-y-2 {$$props.class || ''}">
        {text}
</button>