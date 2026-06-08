<script lang='ts'>
    interface Props {
        height?: string;
        color?: string;
    }

    let { height = "60px", color = $bindable("transparent") }: Props = $props();

    if(color==="dark")
        color="#424B5A;"
</script>

<div style="height:{height}; background-color:{color}"></div>