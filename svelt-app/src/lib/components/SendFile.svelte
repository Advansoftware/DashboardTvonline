<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  
  const dispatch = createEventDispatcher();
  export let file = writable<File | null>(null);

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      file.set(input.files[0]);
      dispatch('fileChange', input.files[0]);
    }
  }
</script>
 
<div class="grid w-full max-w-sm items-center gap-1.5">
  <Label for="picture" class="border-[1px] py-3 bg-slate-50 text-slate-900 rounded-md">Enviar Lista</Label>
  <Input id="picture" type="file" class="hidden" on:change={handleFileChange} />
</div>