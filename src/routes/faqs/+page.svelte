<script lang='ts'>
    import ContentWidth from '$lib/components/ContentWidth/ContentWidth.svelte';
    import Accordian from '$lib/components/FullWidth/Accordian.svelte';
    import Spacer from '$lib/components/Spacer.svelte';
    
    const LOREM = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat m dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor inc."
    const LABELS = ["Is this thing on?", "It could be why don't you check?", "Ok?", "Ok, what?", "I think it might be on, what do you think?", "I don't know maybe that's why I asked you?"]
    const CONTENTS = [LOREM,LOREM,LOREM,LOREM,LOREM,LOREM]
</script>

<svelte:head>
    <title>Frequently Ask Questions Sections | Reddoor Wireframer</title>
</svelte:head>

<!-- faqs #2 -->


<ContentWidth>
    <h2 class="mb-16">Frequently Asked Questions</h2>

    <div class="w-full max-w-screen-md mx-auto">
        <Accordian labels={LABELS} contents={CONTENTS}/>
    </div>
</ContentWidth>
<Spacer color="#424B5A" />
<!-- faqs #6 -->

<ContentWidth>
    <h2 class="mb-16">Frequently Asked Questions</h2>

    <div class="flex flex-col lg:flex-row justify-between relative w-full">
    <div class="w-full lg:w-[48%]">
        <h6 class=" mb-8">bucket 1</h6>
        <Accordian labels={LABELS} contents={CONTENTS}/>
    </div>
    <div class="w-full lg:w-[48%] ">
        <h6 class="mt-16 lg:mt-0 mb-8">bucket 2</h6>
        <Accordian labels={LABELS} contents={CONTENTS}/>
    </div>
    </div>
</ContentWidth>


<Spacer color="#424B5A" />

<!-- faqs #8 -->
<Spacer color="#424B5A" />

<!-- faqs #10 -->
<Spacer color="#424B5A" />
