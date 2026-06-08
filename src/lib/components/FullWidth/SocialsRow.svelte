<script lang="ts">
    import { FontAwesomeIcon} from '@fortawesome/svelte-fontawesome'
    import { faFacebook, faTwitter, faReddit, faInstagram, faLinkedin} from '@fortawesome/free-brands-svg-icons'
    
    let { socials = [{
        platform: "",
        href:""
                        }] } = $props();

    
</script>

        <div class="h-full flex flex-row items center justify-center transition-opacity">
            {#each socials as social }
               
                <a href={social.href} class="mx-6 w-6 h-6 hover:opacity-75 transition-all bump">
                    {#if social.platform==='facebook'}
                        <FontAwesomeIcon icon={faFacebook} size="2x" />
                    {:else if social.platform=='twitter'}
                        <FontAwesomeIcon icon={faTwitter} size="2x"/>
                    {:else if social.platform=='reddit'}
                        <FontAwesomeIcon icon={faReddit}  size="2x"/>
                    {:else if social.platform=='instagram'}
                        <FontAwesomeIcon icon={faInstagram} size="2x"/>
                    {:else if social.platform=='linkedin'}
                        <FontAwesomeIcon icon={faLinkedin} size="2x"/>
                    {/if}

                </a>
               
            {/each}
        </div>

