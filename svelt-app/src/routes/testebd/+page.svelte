<script>
    let res;
	let statedata = '';
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
    <p>The capital of {statedata.nome} !</p>
    <p>Its abbreviation is {statedata.logo}.</p>
    <p>It is in the {statedata.link} region.</p>
    <p>Its state bird is the {statedata.status}.</p>
{/if}
<a href="/">Voltar</a>
<style>
    button, p {
        padding: .5em .8em;
        margin: .5em;
        font-size: 110%;
    }
    </style>