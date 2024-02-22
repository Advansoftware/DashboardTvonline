<script lang="ts">
  import Hls from 'hls.js';
  import { onDestroy, onMount } from 'svelte';
  export let url: string; // the URL of the TS file
  let video: HTMLVideoElement; // the reference to the video element
  let hls: Hls; // the instance of Hls

  // create a new Hls instance and attach it to the video element
  const initHls = () => {
    hls = new Hls({
			maxLiveSyncPlaybackRate: 1.5,
		});
    hls.attachMedia(video);
    hls.loadSource(url); // use the url prop directly
  };

  // destroy the Hls instance when the component is destroyed
  const destroyHls = () => {
    hls.destroy();
  };

  // initialize the Hls instance on mount and destroy it on destroy
  onMount(initHls);
  onDestroy(destroyHls);
</script>

<style>
  /* add some styles to the video element */
  video {
    width: 100%;
    height: auto;
    object-fit: contain;
    background-color: black;
  }
</style>

<!-- create a video element with a reference -->
<video bind:this={video} controls />
