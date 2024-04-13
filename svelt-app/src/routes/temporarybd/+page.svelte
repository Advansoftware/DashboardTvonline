<script>
  import HlsPlayer from "$lib/components/HlsPlayer.svelte";
  import VideoPlayer from "$lib/components/VideoPlayer.svelte";
  import { Title,Card, Content } from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import { prelistIndexDb } from "$lib/db/prelistIndexDb";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  let pageSize = 50; // Número de itens por página
  let currentPage = 1; // Página atual
  let totalItems = 0; // Total de itens
  let totalPages = 0; // Total de páginas
  let items = []; // Itens na página atual
  let statedata = null;
  let showDialog = false;
  let format = '';
  let videos = [];
  let loadData = writable(false);
  // Função para carregar os itens da página atual
  async function loadItems() {
    const offset = (currentPage - 1) * pageSize;
    items = await prelistIndexDb.prelist.offset(offset).limit(pageSize).toArray();
    loadData.set(true);
  }

  // Função para atualizar a paginação
  function updatePagination() {
    totalPages = Math.ceil(totalItems / pageSize);
  }

  // Carrega os itens da página atual quando o componente é montado
  onMount(async () => {
    // Carrega o total de itens
    totalItems = await prelistIndexDb.prelist.count();
    updatePagination();
    loadItems();
  });

  // Função para ir para a próxima página
  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      loadItems();
    }
  }

  // Função para ir para a página anterior
  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      loadItems();
    }
  }
  function openInfo(info){
    showDialog= true;
    format = info.url.split('.')[info.url.split('.').length - 1];
    console.log(format)
    videos = [{
      controls: true,
			srcs: [
				{
					src: info.url,
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
			poster: info.poster
		}
	];
    statedata = info;
  }
</script>
<span>{!$loadData ? $loadData : ''}</span>
<div class="grid grid-cols-9 gap-3 my-8 mx-4">
  {#each items as item (item.id)}
  
    <Card>
      <div  on:click={() => openInfo(item)} class="h-full">
      <Content>
        <Title  class="my-1">{item.name} - {item.group}</Title>
      <img src={item.poster} alt={item.name}/>
      </Content>
      </div>
    </Card>
    
  {/each}
</div>
<div>
  <button on:click={previousPage} disabled={currentPage === 1}>Anterior</button>
  <span>Página {currentPage} de {totalPages}</span>
  <button on:click={nextPage} disabled={currentPage === totalPages}>Próximo</button>
</div>
{#if statedata}
<Dialog.Root open={showDialog} close={showDialog=false}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{statedata.name}</Dialog.Title>
      <Dialog.Description>
        {statedata.url}
      </Dialog.Description>
    </Dialog.Header>
    {#if format !== 'm3u8'}
    <VideoPlayer {videos} />
    {/if}
    {#if format === 'm3u8'}
      <HlsPlayer url="{statedata.url}" class="w-80 h-96"/>
    {/if}
    
  </Dialog.Content>
   <Dialog.Footer>
       {statedata.status}
    </Dialog.Footer>
</Dialog.Root>
{/if}