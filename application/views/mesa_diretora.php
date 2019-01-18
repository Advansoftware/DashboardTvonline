<div class="container clearfix mb-5">

	<div class="row">
		<h1 class="display-4 text-center col-md-10">Mesa Diretora</h1>
		<div class="col-md-10">
			<div class="col text-center">
				<div class="row justify-content-center">
					<?php
					for($i=0; $i<count($cargo); $i++){
						if($cargo[$i]["nome_cargo"]!=null){

							echo "<div class='card bg-dark text-white text-center mt-3 ml-3 d-inline-block border border-warning' style='width: 18rem'>";
							echo "<div class='bg-white' style='position: relative;width: 17.9rem; height: 10rem;padding: 3rem;' >";
							echo "<img class='imgPartidosmesa p-2' src='".base_url()."content/imagens/partidos/".$cargo[$i]["partido"].".png'    alt='Card image'>";
							echo "</div>";

							echo "<div class='card-body'>";
							echo "<div class='card-img-overlay'>";
							echo "<img class='card-img rounded mx-auto d-block p-4 rounded-circle imgVereadoresmesa' src='".base_url()."content/imagens/vereadores/".$cargo[$i]["foto"].".jpg' alt='Card image'>";
							echo "</div>";
							echo "<h5 class='card-title mt-5'>".$cargo[$i]["nome_cargo"]."<br/></h5>";
							echo "<p class='card-text mb-3'>".$cargo[$i]["nome_vereador"]."</p>";
							echo "</div>";
							echo "</div>";
						}
					}
					?>
				</div>



				<h1 class="display-4">Demais Vereadores</h1>


				<div class="row justify-content-center">


					<?php
					for($i=0; $i<count($cargo); $i++){
						if($cargo[$i]["nome_cargo"]==null){
							echo "<div class='card bg-dark text-white text-center mt-3 ml-3 d-inline-block border border-warning' style='width: 18rem'>";
							echo "<div class='bg-white' style='position: relative;width: 17.9rem; height: 10rem;padding: 3rem;' >";
							echo "<img class='imgPartidosmesa p-2' src='".base_url()."content/imagens/partidos/".$cargo[$i]["partido"].".png'    alt='Card image'>";
							echo "</div>";

							echo "<div class='card-body'>";
							echo "<div class='card-img-overlay'>";
							echo "<img class='card-img rounded mx-auto d-block p-4 rounded-circle imgVereadoresmesa' src='".base_url()."content/imagens/vereadores/".$cargo[$i]["foto"].".jpg' alt='Card image'>";
							echo "</div>";
							echo "<h5 class='card-title mt-5'>&nbsp;<br/></h5>";
							echo "<p class='card-text mb-3'>".$cargo[$i]["nome_vereador"]."</p>";
							echo "</div>";
							echo "</div>";

						}
					}
					?>
				</div>





			</div>
		</div>

		<?= loadMenus() ?>


	</div>
</div>
</div>
