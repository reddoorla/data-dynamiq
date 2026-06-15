<script lang="ts">
  interface Props {
    text?: string;
    click?: () => void;
    isSmall?: boolean;
    isVertical?: boolean;
    class?: string;
    disabled?: boolean;
  }

  let {
    text = "BUTTON",
    click = () => {},
    isSmall = false,
    isVertical = false,
    class: klass = "",
    disabled = false,
  }: Props = $props();

  let isHovered = $state(false);
</script>

<button
  onclick={click}
  {disabled}
  class="flex {isVertical
    ? 'flex-col negative-bump'
    : 'flex-row bump '} items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed {klass}"
  onmouseover={() => (isHovered = true)}
  onfocus={() => (isHovered = true)}
  onmouseout={() => (isHovered = false)}
  onblur={() => (isHovered = false)}
>
  <div class={isSmall ? "small" : "large"}>{text}</div>
  {#if isVertical}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="{isHovered ? 'translate-y-1' : ''} transition-transform"
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
    >
      <path
        d="M19.375 3.92969L16.4453 1L10 7.44531L3.55469 0.999999L0.624998 3.92969L10 13.3047L19.375 3.92969Z"
        stroke="white"
        fill={isHovered ? "white" : "none"}
        stroke-width="0.5"
      />
    </svg>
  {:else}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="{isHovered ? 'translate-x-1' : ''} transition-transform"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clip-path="url(#clip0_4759_1155)">
        <path
          d="M5.79688 0.75L3.45313 3.09375L8.60938 8.25L3.45313 13.4063L5.79688 15.75L13.2969 8.25L5.79688 0.75Z"
          stroke="white"
          fill={isHovered ? "white" : "none"}
          stroke-width="0.375"
        />
      </g>
      <defs>
        <clipPath id="clip0_4759_1155">
          <rect
            width="15"
            height="15"
            fill="white"
            transform="translate(0.875 0.75)"
          />
        </clipPath>
      </defs>
    </svg>
  {/if}
</button>

<style>
  button div {
    text-align: center;
    font-feature-settings:
      "liga" off,
      "clig" off;
    font-family: "Chakra Petch";
    font-style: normal;
    font-weight: 700;
    text-transform: uppercase;
  }
  .large {
    font-size: 21px;
    line-height: 30px; /* 142.857% */
    letter-spacing: 2px;
  }
  .small {
    line-height: 22.5px; /* 142.857% */
    letter-spacing: 1.5px;
    font-size: 15.75px;
  }
</style>
