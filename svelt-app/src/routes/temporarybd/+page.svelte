<script>
  import { prelistIndexDb } from "$lib/db/prelistIndexDb";
  import { liveQuery } from "dexie";
  import { onMount } from "svelte";

  let pageSize = 10; // Número de itens por página
  let currentPage = 1; // Página atual
  let totalItems = 0; // Total de itens
  let totalPages = 0; // Total de páginas
  let items = []; // Itens na página atual

  // Função para carregar os itens da página atual
  async function loadItems() {
    const offset = (currentPage - 1) * pageSize;
    items = await prelistIndexDb.prelist.offset(offset).limit(pageSize).toArray();
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
</script>
<ul>
  {#each items as item (item.id)}
    <li>{item.name}, {item.group}</li>
  {/each}
</ul>

<div>
  <button on:click={previousPage} disabled={currentPage === 1}>Anterior</button>
  <span>Página {currentPage} de {totalPages}</span>
  <button on:click={nextPage} disabled={currentPage === totalPages}>Próximo</button>
</div>
