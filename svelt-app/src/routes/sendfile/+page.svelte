<script>
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import uploadIcon from "$lib/images/upload-icon.svg"
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
    <Input type="text" placeholder="Playlist URL" class="flex-1 w-full my-2" />
    <Button class="mt-2 flex-1 w-full">Enviar Playlist</Button>
  </Card.Footer>
</Card.Root>
</div>