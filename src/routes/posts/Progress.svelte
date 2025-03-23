<script lang="ts">
	let { progress }: { progress: number } = $props();
</script>

<div class="absolute top-0 bottom-0 left-0 bg-pink-400/30" style="width: {progress}%"></div>
