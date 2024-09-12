<script lang="ts">
	import logo from "$lib/assets/icons/logos/evidence360.svg"
	import bg1 from "$lib/assets/images/digitalBg.jpg"
	import mac from "$lib/assets/images/mac.jpg"
	import collab from "$lib/assets/icons/collab.svg"
	import innov from "$lib/assets/icons/innov1.svg"
	import backlog from "$lib/assets/icons/backlog.svg"
	import hex1 from "$lib/assets/icons/hex1.svg"
	import hex2 from "$lib/assets/icons/hex2.svg"
	import hex3 from "$lib/assets/icons/hex3.svg"
	import folder from "$lib/assets/icons/folder.svg"
	import cloud from "$lib/assets/icons/cloud.svg"
	import report from "$lib/assets/icons/report.svg"
	import media from "$lib/assets/icons/media.svg"
	import api from "$lib/assets/icons/api.svg"
	import bell from "$lib/assets/icons/bell.svg"
	import ai from "$lib/assets/icons/ai.svg"
	import chain from "$lib/assets/icons/chain.svg"
	import finalBg from "$lib/assets/images/finalBg.jpg"
	import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
	import ContactButton from "$lib/components/Buttons/ContactButton.svelte";
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import { Turnstile } from 'svelte-turnstile';

  import Spacer from "$lib/components/Spacer.svelte";
  import ContentBox from "$lib/components/FullWidth/ContentBox.svelte";
  import placeholder from "$lib/assets/images/image_placeholder.svg"
  import HalfWidthImage from "$lib/components/HalfWidth/HalfWidthImage.svelte";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import chevronLeft from "$lib/assets/icons/chevron-left.svg"
  import chevronRight from "$lib/assets/icons/chevron-right.svg"
  import { fade, fly } from "svelte/transition";
  import { swipe } from "svelte-gestures";
  import { onMount } from "svelte";


  let isEvolveHollow = true;


    let innerWidth:number;    
    const loremParagraph = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."
    

    let activeValue = 1;
    let showValueBox = true;
    const setActiveValue = (i:number) => activeValue=i;
    const setActiveValueWithDelay = (i:number) => {
        showValueBox = false;
        activeValue = i;
        setTimeout(() => {
            showValueBox = true;
        }, 300);
  }

    
  let sliderNumber = (2-activeValue)*100
    let sliderStyleString = "transform:translateX(" + sliderNumber + "vw);";
    $:{
        sliderNumber = (2-activeValue)*100
        sliderStyleString = "transform:translateX(" + sliderNumber + "vw);";
    }

    const handleSwipe = (e:CustomEvent<{ direction: "left" | "top" | "right" | "bottom"; target: EventTarget; }>) =>{
        let direction = e.detail.direction;
        console.log(direction)
        if(direction=='right'&&activeValue>1)
            activeValue--;
        if(direction=='left'&&activeValue<3)
            activeValue++;

    }

	let isFormOpen =false;
	let form:HTMLFormElement;

	$: {
		if(typeof window !== 'undefined'){
		if(isFormOpen){
			document.body.style.top = `-${window.scrollY}px`;
			document.body.style.position = 'fixed';
		}else{
			const scrollY = document.body.style.top;
			document.body.style.position = '';
			document.body.style.top = '';
			window.scrollTo(0, parseInt(scrollY || '0') * -1);
			submitted=false;
		}}
	}

	let submitted=false;

const handleSubmit = (event:any) => {
 event.preventDefault();

 const myForm = event.target;
 const formData = new FormData(myForm);


   const formDataObject: Record<string, string> = {};
 formData.forEach((value, key) => {
   formDataObject[key] = value.toString();
 });


 fetch("/contact", {
   method: "POST",
   headers: { "Content-Type": "application/x-www-form-urlencoded" },
   body: new URLSearchParams(formDataObject).toString(),
 })
   
   .catch((error) => alert(error));

   submitted=true;
   myForm.reset();
};

	let evolve:HTMLSpanElement
   
	onMount(() => {
  const handleScroll = () => {
    if (evolve) {
      if (evolve.getBoundingClientRect().top < window.innerHeight / 2) {
        isEvolveHollow = false;
      } else {
        isEvolveHollow = true;
      }
    }
  };

  // Initial check
  handleScroll();

  // Add scroll event listener
  window.addEventListener("scroll", handleScroll);

  // Clean up the event listener when the component is destroyed
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
});
</script>

<svelte:window bind:innerWidth />
<svelte:head><title>Evidence360</title></svelte:head>

<style>


	.outlined {
  color: black;
  background-color: black;
  text-shadow: -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white, 0.5px 0.5px 0 white;
  letter-spacing: .4px;
}
</style>


{#if isFormOpen}
<div class="w-screen h-screen top-0 left-0 fixed pointer-events-none z-20">
	<button transition:fade class="w-full h-full absolute top-0 left-0 bg-black opacity-40 pointer-events-auto" on:click={()=>isFormOpen=false}/>
	<div transition:fly={{x:"-100%"}} class="w-full lg:w-3/5 h-full lg:h-3/5 p-8 lg:p-24 z-20 flex flex-col xl:flex-row items-start fixed top-0 lg:top-[20%] bg-black left-0 gap-16 lg:left-[20%] pointer-events-auto overflow-y-scroll">
		<button class="absolute top-6 right-6" on:click={()=>isFormOpen=false}><i class="text-white hover:text-light transtition bump fa-regular fa-sharp fa-close fa-2xl"/></button>

		<div class="xl:w-1/2 xl:h-4/5 flex flex-col justify-start items-start gap-7">
			<h5 class="text-white">Contact us</h5>
			<p class="text-white text-left">We’re here to help you step into the future of data management. Reach out if you have questions or would like a demo.</p>
		</div>
		<div class="w-full xl:w-1/2 xl:h-4/5">
			{#if submitted}
	

					<i class="fa-solid fa-thin fa-close fa-2xl text-white hover:text-light transition absolute top-8 right-5" />
					<h4 class="text-white">Thanks for reaching out! <br/> <br/>We'll get back to you as soon as we can.</h4>
	
			{:else}
			
			<form bind:this={form} class="h-full w-full mt-8 md:mt-0  flex flex-col gap-2 text-white items-start"  name="contact" method="POST" on:submit={handleSubmit} data-netlify="true" data-netlify-honeypot="bot-field">
               
                
                <input type="hidden" name="form-name" value="contact" />
                    
                       
                        <input type="text" name="name" required placeholder="NAME" class="w-full border-[1px] border-white p-2 rounded-sm mb-4 bg-black" />
                 
                        <input type="email" name="email" required placeholder="EMAIL" class="w-full border-[1px] border-white p-2 rounded-sm mb-4 bg-black" />
                       
                        <p class="hidden">
                            <label>
                              Don’t fill this out if you’re human: <input name="bot-field" />
                            </label>
                          </p>
                      
          
                        <textarea name="message" required placeholder="YOUR MESSAGE" class="min-h-24 w-full bg-black border-[1px] rounded-sm border-white p-1 mb-4"/>

						<Turnstile siteKey="0x4AAAAAAAjylnwnKtVp2F7G" />
                 
                        <ContactButton text="request info" click={()=>form.submit()}/>
                  
                         
               </form>
			   {/if}
		</div>
	</div>
</div>
{/if}

<div class="h-16 w-screen  fixed top-0 left-0 z-10">
	<ContentWidth class="h-16 flex flex-row justify-between lg:justify-center items-center relative">
	
		<button class="h-6" on:click={()=>window.scrollTo({top:0, left:0, behavior:"smooth"})}><img src={logo} alt="evidence 360" /></button>
		
		<ContactButton text="CONTACT US" isSmall class="absolute right-0 top-1/2 -translate-y-1/2" click={()=>isFormOpen=true}/>
	</ContentWidth>
</div>

<ScreenWidthImage image={bg1} >
	<div class="w-full h-full flex flex-col justify-between items-center py-12 md:py-32">
	<div/>
	<h1 class=" max-w-screen-xl"> The software system that unifies the Digital Evidence workflow. </h1>
	<ContactButton text="LET’S ANALYZE" isVertical click={()=>window.scrollTo({left:0, top:window.innerHeight, behavior:'smooth'})}/>
	</div>
</ScreenWidthImage>
<div class="h-screen w-screen">
	<ContentWidth class="h-full flex flex-col justify-between items-center py-32">
		<h2 class="text-white outlined">We Live in an <span bind:this={evolve} class="{isEvolveHollow?"text-black":"text-white"} transition duration-[3200ms] ease-fast-slow">Evolving</span> Digital Age</h2>
		<ContentWidth>

			<div use:swipe={{minSwipeDistance:20, touchAction: 'pan-y'}} on:swipe={handleSwipe} class="w-[300vw] lg:translate-x-0 lg:w-full flex flex-row justify-around lg:justify-between flex-nowrap transition-transform overflow-hidden duration-1000"
					style={innerWidth < 1024 ? sliderStyleString : ""}>
				<div class="w-[380px]">
				<ContentBox 
					icon={innov}
					labelText="lead with innovation"
					paragraphText="Effectively manage digital evidence in one place without the hassle of jumping between multiple systems and tools."
					class="text-white"
				/>
				</div>
				<div class="w-[380px]">
				<ContentBox 
					icon={backlog}
					labelText="Say goodbye to backlogs"
					paragraphText="Free your workflow by seamlessly processing files in their native formats using a robust set of native tools."
					class="text-white"
				/>
				</div>
				<div class="w-[380px]">
				<ContentBox 
					icon={collab}
					labelText="collaborate with ease"
					paragraphText="Save time and money by efficiently sharing digital evidence within and across agencies to help solve cases faster."
					class="text-white"
				/>
				</div>
			</div>
			<div class="absolute h-10 flex align-middle justify-start xl:left-8 translate-x-[2px] -bottom-4 lg:hidden">
				
					<div class="h-[10px] w-[10px] border-[1.5px] rounded-full transition-all duration-1000 cursor-pointer hover:opacity-60 mr-4 {activeValue===1 ? "bg-primary border-primary" : "border-white"}"
						on:click={()=>setActiveValue(1)}
						aria-hidden
					></div>
					<div class="h-[10px] w-[10px] border-[1.5px] rounded-full transition-all duration-1000 cursor-pointer hover:opacity-60 mr-4 {activeValue===2 ? "bg-primary border-primary" : "border-white"}"
						on:click={()=>setActiveValue(2)}
						aria-hidden
					></div>
					<div class="h-[10px] w-[10px] border-[1.5px] rounded-full transition-all duration-1000 cursor-pointer hover:opacity-60 mr-4 {activeValue===3 ? "bg-primary border-primary" : "border-white"}"
						on:click={()=>setActiveValue(3)}
						aria-hidden
					></div>
					
			</div>
			<button on:click={()=>activeValue--} class="{activeValue==1||innerWidth>1024 ? "hidden" : ""} absolute left-0 top-[20%] h-6 w-6 rounded-full border-primary border-2 p-1 flex align-middle justify-center cursor-pointer transition-all duration-500 hover:bg-primary hover:border-primary">
				<img alt='chevron-left' src={chevronLeft} class='-translate-x-[1px] brightness-200' />
			  </button>
			  <button on:click={()=>activeValue++} class="{activeValue==3||innerWidth>1024 ? "hidden" : ""} absolute right-0 top-[20%] h-6 w-6 rounded-full border-primary border-2 p-1 flex align-middle cursor-pointer transition-all duration-500 justify-center hover:bg-primary hover:border-primary">
				<img alt='chevron-right' src={chevronRight} class='translate-x-[1px] brightness-200' />
			  </button>
		</ContentWidth>
		<ContactButton click={()=>isFormOpen=true} text="REQUEST A DEMO" />
	</ContentWidth>
</div>

<ScreenWidthImage image={mac}>
	<div class="md:w-1/2 md:max-w-[540px] h-full flex flex-col justify-center items-start gap-10">
		<h5 class="text-primary">Finally, the complete evidence workflow.</h5>
		<p class="text-left paragraph-large">Evidence360 offers a comprehensive and integrative approach to investigators by providing an exhaustive and thorough platform for evidence handling, case tracking, analysis, and communication.
		</p>
		<ContactButton click={()=>isFormOpen=true} text="request demo" />
	</div>
</ScreenWidthImage>
<ContentWidth class="flex flex-col items-center justify-evenly gap-24 py-24">
	<img src={logo} class="h-10 my-10" alt="evidence 360"/>
	

		<div class="flex flex-col lg:flex-row justify-around items-center w-full mt-12 mb-24">
		
			<div class="w-full md:w-[380px]">
			<ContentBox 
				icon={hex1}
				labelText="easily intake digital evidence"
				paragraphText="Regardless of the source, you’ll be able to edit any file in its native format so you don’t have to compromise on quality."
				class="text-white"
			/>
			</div>
			<div class="w-full md:w-[380px]">
			<ContentBox 
				icon={hex2}
				labelText="process in a central e-hub"
				paragraphText="Find all the functions you need in order to manage and analyze data from editing to reporting all in one place."
				class="text-white"
			/>
			</div>
			<div class="w-full md:w-[380px]">
			<ContentBox 
				icon={hex3}
				labelText="collaborate with agencies"
				paragraphText="Easily work with other vendors, agencies, and consultants using a secure chain of custody to process cases faster and more effectively."
				class="text-white"
			/>
			</div>
		</div>

		<h5 class="text-primary"> The Complete Experience </h5>
		<div class="w-full max-w-screen-md flex flex-row flex-wrap justify-around items-center gap-16">
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={folder} class="w-12 h-12" alt="folder"/>
				<h6>automated case management</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={cloud} class="w-12 h-12" alt="cloud"/>
				<h6>evidence storage</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={chain} class="w-12 h-12" alt="chain"/>
				<h6>chain of custody</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={collab} class="w-12 h-12" alt="collab"/>
				<h6>real-time collaboration</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={ai} class="w-12 h-12" alt="ai"/>
				<h6>ai/machine learning</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={bell} class="w-12 h-12" alt="bell"/>
				<h6>case status notifications</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={api} class="w-12 h-12" alt="api"/>
				<h6>third party api</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={media} class="w-12 h-12" alt="media"/>
				<h6>media analysis</h6>
			</div>
			<div class="w-40 h-32 flex flex-col items-center justify-center gap-5">
				<img src={report} class="w-12 h-12" alt="report"/>
				<h6>report writing & templates</h6>
			</div>

			
		</div>

		<ContactButton click={()=>isFormOpen=true} text="REQUEST A DEMO" />


		

</ContentWidth>


<ScreenWidthImage image={finalBg}>
	<div class="h-full w-full flex flex-col justify-between items-center">
		<div/>
		<div/>
		<h2 class="text-white max-w-[960px]">Reduce Backlog, Boost Productivity, and Unify Your Team</h2>
		<ContactButton click={()=>isFormOpen=true} text="REQUEST A DEMO" />
		<div class="label text-white mb-4">©2024 Data Dynamiq  |   All Rights Reserved</div>
	</div>
</ScreenWidthImage>