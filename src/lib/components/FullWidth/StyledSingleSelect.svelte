<script lang="ts">
  import Select from "svelte-select";
  import dropdownArrow from "$lib/assets/icons/dropdown-arrow-light.svg";

  interface Props {
    items: string[] | { label: string; value: string }[];
    value?: string;
    placeholder?: string;
    class?: string;
  }

  let {
    items,
    value = $bindable(""),
    placeholder = "",
    class: klass = "",
  }: Props = $props();

  let selectHover = $state(false);
</script>

<div
  class="max-w-[720px] w-full mx-auto cursor-pointer relative {klass}"
  role="separator"
  onmouseover={() => (selectHover = true)}
  onfocus={() => (selectHover = true)}
  onmouseout={() => (selectHover = false)}
  onblur={() => (selectHover = false)}
>
  <Select
    {items}
    bind:value
    {placeholder}
    searchable={false}
    class="svelte-select"
  />
  <div
    class="absolute h-full aspect-square right-0 top-0 flex items-center justify-center pointer-events-none"
  >
    <img
      src={dropdownArrow}
      alt="decorative dropdown arrow"
      aria-hidden
      class:opacity-55={selectHover}
      class=" transition-all pointer-events-none"
    />
  </div>
</div>
