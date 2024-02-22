<script>
  import HlsPlayer from "$lib/components/HlsPlayer.svelte";
  import VideoPlayer from "$lib/components/VideoPlayer.svelte";
  import * as Dialog from "$lib/components/ui/dialog";

  
    let res;
	let statedata = '';
  let poster = "";
  let source = "";
  let format = "";
  let videos = [];
  let showDialog = false;
	async function xget(st) {
        const response = await fetch("/api/getstate", {
            method: 'POST',
            body: JSON.stringify({st}),
            headers: {
                'content-type': 'application/json'
            }
        
        });

        res =  await response.json();
        statedata = res[0];
        poster = statedata.logo;
        source = statedata.link;
        format = statedata.link.split('.')[statedata.link.split('.').length - 1];
			videos = [{
      controls: true,
			srcs: [
				{
					src: source,
					type: 'video/mp4'
				}
			],
			/*tracks: [
				{
					src: 'https://3ee.s3.amazonaws.com/video/tiled_phaser.vtt',
					kind: 'tracked',
					default: true
				}
			],*/
			width: '100%',
			height: '600',
			poster: poster
		}
	];

        showDialog=true;
	}
	export let data;
	//console.log('===>', Object.getOwnPropertyNames(data.data[0]));
	//	const states = JSON.parse(data);
</script>

<h1>Get State Information</h1>
<p>Click state name to see data at bottom.</p>
{#each data.data as state}
<button on:click={() => xget(state.id)}><img src={state.logo} alt="capa" class="w-36 h-52"/></button>{/each}

{#if statedata}
<Dialog.Root open={showDialog} close={showDialog=false}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{statedata.nome}</Dialog.Title>
      <Dialog.Description>
        {statedata.link}
      </Dialog.Description>
    </Dialog.Header>
    {#if format !== 'm3u8'}
    <VideoPlayer {videos} />
    {/if}
    {#if format === 'm3u8'}
      <HlsPlayer url="{source}" class="w-80 h-96"/>
    {/if}
    
  </Dialog.Content>
   <Dialog.Footer>
       {statedata.status}
    </Dialog.Footer>
</Dialog.Root>
{/if}
<a href="/">Voltar</a>
<style>
    button, p {
        padding: .5em .8em;
        margin: .5em;
        font-size: 110%;
    }
    </style>