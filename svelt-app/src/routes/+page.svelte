<script>
	import { prelistIndexDb } from "$lib/db/prelistIndexDb";
  import { getJsonListFromUrlAsync } from "../helpers/M38uToJson";
  import { v4 as uuidv4 } from "uuid";
  let loading = false;
async function getData() {
		 try {
      loading = true;
      let data = await getJsonListFromUrlAsync("/atmosiptv/get.php?username=16272011&password=40062316&type=m3u_plus&output=mpegts");
      await prelistIndexDb.prelist.bulkAdd(
        data.map(list => ({
          id: uuidv4(),
          name: list.name,
          poster: list.image,
          group: list.group,
          url: list.link,
        }))
      );
      loading = false;
      return data;
    }
    catch (e) {
      console.error(e)
    }
	}

</script>
<p>{loading}</p>
<div class="flex items-center p-4 justify-center text-center h-screen">
 <a href="/sendfile">enviar <span class="material-symbols-outlined">
send
</span> </a>

<button on:click={getData}>Get Data</button>



<a href="/testebd">testar bd <span class="material-symbols-outlined">
send
</span>
</a>

<a href="/temporarybd">Ver BdTemporario <span class="material-symbols-outlined">
send
</span>
</a>
</div>