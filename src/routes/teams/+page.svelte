<script lang='ts'>
    import Spacer from "$lib/components/Spacer.svelte";
    import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
    import ContentBox from "$lib/components/FullWidth/ContentBox.svelte";
    import profile_placeholder from "$lib/assets/images/profile_placeholder.png"
  import ContactBox from "$lib/components/FullWidth/SocialsRow.svelte";
  import TeamBox from "$lib/components/FullWidth/TeamBox.svelte";

    const TEAM_LIST = [{
            name:"Josie Wells",
            title:"Chief Executive Officer",
            profilePicture: profile_placeholder,
            href:"#",
            socials:[{
                    platform:"twitter",
                    href:"https://twitter.com/?lang=en"
                },
                {
                    platform:"facebook",
                    href:"https://facebook.com"
                },
            ]
        },
        {
            name:"Stella Alvarez",
            title:"CMO",
            profilePicture: profile_placeholder,
            socials:[{
                    platform:"twitter",
                    href:"https://twitter.com/?lang=en"
                },
                {
                    platform:"facebook",
                    href:"https://facebook.com"
                },
            ]
        },
        {
            name:"Stanley George",
            title:"Senior Developer",
            profilePicture: profile_placeholder
        },
        {
            name:"Caleb Brown",
            title:"UX/UI Designer",
            profilePicture: profile_placeholder
        },
        {
            name:"Christine Lawson",
            title:"Marketer",
            profilePicture: profile_placeholder
        },
        {
            name:"Janie Pratt",
            title:"UFO",
            profilePicture: profile_placeholder
        },
    ];

    let innerWidth:number = $state(0);
</script>

<svelte:head><title>Teams | Reddoor Wireframe</title></svelte:head>
<svelte:window bind:innerWidth/>

<!-- team #1 -->

<ContentWidth class="my-16">
    <div class="w-full max-w-[500px] mx-auto md:ml-0">
        <ContentBox 
            icon=""
            titleTag="h2"
            titleText="The Superstar Team"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
            float={innerWidth > 768 ? "left" : "center"}
        />

    </div>

    <div class="w-full flex flex-row justify-evenly flex-wrap">
        {#each TEAM_LIST as person}
            <div class="w-full md:w-[46%] xl:w-[22%] my-12 flex flex-col items-center justify-center">
                <img class="w-full aspect-[5/4] object-cover mb-6 {person.profilePicture===profile_placeholder ? "bg-dark" : ""}" src={person.profilePicture} alt={person.name} />
                <h5>{person.name}</h5>
                <p>{person.title}</p>
            </div>
        {/each}
    </div>
</ContentWidth>



<Spacer color="#424B5A" />

<!-- team #2 -->

<ContentWidth>

    <div class="w-full max-w-[500px] mx-auto mb-16">
        <ContentBox 
            icon=""
            titleTag="h2"
            titleText="The Superstar Team"
            paragraphText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi."
            float= "center"
        />

    </div>
    <div class="w-full flex flex-row justify-evenly flex-wrap">
        {#each TEAM_LIST as person}
            <div class="w-full md:w-[46%] xl:w-[30%] my-12 aspect-[5/4] flex flex-col items-center justify-center bg-light">
                <TeamBox 
                    name={person.name}
                    title={person.title}
                    src={person.profilePicture}
                    alt={person.name}
                    href={person.href}
                    socials={person.socials}
                />
            </div>
        {/each}
    </div>
</ContentWidth>
<Spacer color="#424B5A" />

<!-- team #3 -->
<Spacer color="#424B5A" />

<!-- team #4 -->
<Spacer color="#424B5A" />

<!-- team #5 -->
<Spacer color="#424B5A" />