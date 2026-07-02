<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="max-w-2xl mx-auto px-8 py-24 space-y-4 text-white">
  <h1 class="font-bold">{page.status}</h1>
  <p>{page.error?.message ?? "Something went wrong."}</p>
  <p><a href="/" class="text-white! underline">Return home</a></p>
</div>
