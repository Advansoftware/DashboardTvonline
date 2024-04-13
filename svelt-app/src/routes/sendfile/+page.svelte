<script>
  import SendFile from "$lib/components/SendFile.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import uploadIcon from "$lib/images/upload-icon.svg";
  import { writable } from "svelte/store";
  
  let playlistFiles = writable(null);

  function updatePlaylistFiles(file) {
    playlistFiles.set(file);
  }
  /*$: if ($playlistFiles) {
    console.log('Arquivo atual:', $playlistFiles);
  }
  */
</script>
<div class="flex items-center p-4 justify-center text-center h-screen">
<Card.Root class="w-96 justify-center">
  <Card.Header class="flex text-right"><a href="/"><span class="material-symbols-outlined">
close
</span> </a></Card.Header>
  <Card.Content>
    <img src={uploadIcon} alt="upload icon" />    
  </Card.Content>
  <Card.Footer class="flex justify-center flex-col">
    <SendFile on:fileChange={event => updatePlaylistFiles(event.detail)}/>
     <span class="my-2"> OU </span>
    <Input type="text" placeholder="Playlist URL" class="flex-1 w-full mb-2" />
    <Button class="flex-1 w-full">Enviar Link</Button>
  </Card.Footer>
</Card.Root>
</div>