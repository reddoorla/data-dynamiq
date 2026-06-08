<script lang="ts">
  import { MapPin, Phone, Mail } from "@lucide/svelte";
</script>

<div class="w-full flex flex-col gap-6">
  <div class="w-full h-8 flex justify-start items-center gap-6">
    <MapPin />
    <p>385 Noah Place Suite 878</p>
  </div>
  <div class="w-full h-8 flex justify-start items-center gap-6">
    <Phone />
    <p>877-255-7945</p>
  </div>
  <div class="w-full h-8 flex justify-start items-center gap-6">
    <Mail />
    <p>info@form.com</p>
  </div>
</div>
