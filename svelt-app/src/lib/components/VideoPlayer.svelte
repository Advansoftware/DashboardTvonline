<script lang="ts">
  // Definindo uma interface para o tipo de vídeo
  interface Video {
    width: number;
    height: number;
    poster: string;
    controls: boolean;
    srcs: Array<{ src: string; type: string }>;
    tracks?: Array<{ src: string; kind: string; default: boolean }>;
  }

  // Declarando a propriedade videos como um array de Video
  export let videos: Video[] = [];

  // Adicionando o tipo Event aos parâmetros das funções
  function handlePlayed(e: Event) {
    // Usando o operador opcional para verificar se a propriedade existe
    if (e.target?.currentSrc) {
      console.log('video play', { video: e.target.currentSrc });
    }
  }

  function handleEnded(e: Event) {
    // Usando o operador opcional para verificar se a propriedade existe
    if (e.target?.currentSrc) {
      //console.log('video end', { video: e.target.currentSrc });
    }
  }
</script>

<div class="video-container">
	{#each videos as video}
		<video
			preload="auto"
			width={video.width}
			height={video.height}
			poster={video.poster}
			controls={video.controls}
			on:play={handlePlayed}
			on:ended={handleEnded}
		>
			{#each video.srcs as src}
				<source src={src.src} type={src.type} />
			{/each}
			{#if video?.tracks && video.tracks.length > 0}
				{#each video.tracks as track}
					<track src={track.src} kind={track.kind} default={track.default} />
				{/each}
			{/if}
		</video>
	{/each}
</div>

<style>
	video {
		border-radius: 7px;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 0;
		object-fit: cover;
	}

	.video-container {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%;
	}
</style>
