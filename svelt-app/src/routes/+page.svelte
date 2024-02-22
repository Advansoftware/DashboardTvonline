<script>
  import { getJsonListFromUrlAsync } from "../helpers/M38uToJson";

async function getData() {
		 try {
      let data = await getJsonListFromUrlAsync("http://atmosbr.online:80/get.php?username=16272011&password=40062316&type=m3u_plus&output=mpegts");
      console.log(data)
      return data;
    }
    catch (e) {
      console.error(e)
    }
	}

</script>
<div class="flex items-center p-4 justify-center text-center h-screen">
 <a href="/sendfile">enviar <span class="material-symbols-outlined">
send
</span> </a>

<button on:click={getData}>Get Data</button>



<a href="/testebd">testar bd <span class="material-symbols-outlined">
send
</span>
</a>
</div>