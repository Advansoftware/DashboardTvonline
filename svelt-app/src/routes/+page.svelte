<script>
	import { prelistIndexDb } from "$lib/db/prelistIndexDb";
  import { writable } from "svelte/store";
  import { getJsonListFromUrlAsync } from "../helpers/M38uToJson";
  import { v4 as uuidv4 } from "uuid";
  let loading = writable(false);
  let message = writable('');
async function getData() {
		 try {
      loading.set(true);
      message.set('iniciando download da lista');
      let data = await getJsonListFromUrlAsync("/atmosiptv/get.php?username=16272011&password=40062316&type=m3u_plus&output=mpegts");
      message.set('download concluido.');
      await prelistIndexDb.prelist.clear();
      message.set('Atualizando tabelas');
      await prelistIndexDb.prelist.bulkAdd(
        data.map(list => ({
          id: uuidv4(),
          name: list.name,
          poster: list.image,
          group: list.group,
          url: list.link,
        }))
      );
      message.set('Atualização concluida! voce ja pode selecionar o item desejado para download');
      return data;
    }
    catch (e) {
      console.error(e)
    }
    finally{
      loading.set(false);
    }
	}

</script>
<p>{$loading}</p>
<span> {$message}</span>
<div class="flex items-center p-4 justify-center text-center h-screen">
 <a href="/sendfile">enviar <span class="material-symbols-outlined">
send
</span> </a>

<button on:click={getData}>Atualizar Lista de itens</button>

<span class="material-symbols-outlined">
progress_activity
</span>

<a href="/testebd">testar bd <span class="material-symbols-outlined">
send
</span>
</a>

<a href="/temporarybd">Ver BdTemporario <span class="material-symbols-outlined">
send
</span>
</a>
</div>
