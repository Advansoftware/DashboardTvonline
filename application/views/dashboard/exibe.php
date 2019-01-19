<div class="modal fade" id="#modal" tabindex="-1" role="dialog" aria-labelledby="#modal" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered 	modal-lg" role="document">

		<div class="modal-content">
			
		</div>
	</div>
</div>


<div class="container">

	<div class="row  mt-5">
		<div class="col-md-11 text-right">
			<button class="btn btn-success" onclick="carregacodigo('0')">Adicionar Canal</button>
		</div>
	</div>
	<div class="row mt-3">
		<div class="col-md-11">
			<div class="accordion" id="accordionExample">
			 <?php for($i=0; $i<count($canais); $i++): ?>
			  <div class="card">
			    <div class="card-header" id="headingOne<?=$i?>">

			      	<div class="container-fluid lead">
			      		<div class="row">
			      			<div class="col-md-2">
			      				<img src="<?= $canais[$i]['logo'];?>" class="img-fluid">
			      			</div>
			      			<div class="col-md-8">
			      				<div class="container">
			      					<div class="row">
			      						<div class="col-md-7">
			      							Nome: <?= $canais[$i]['nome']?>
			      						</div>
			      						<div class="col-md-3 text-right">
			      							Status 
			      						</div>
			      						<div class="col-md-2 text-left">
			      						<?php
				                            if($canais[$i]['status'] == 1) echo "<span class='text-info'><i class='fas fa-signal' title='online' alt='online'></i><span>";
				                            else echo "<span class='text-danger'><i class='fas fa-exclamation-circle' title='offline' alt='offline'></i></span>";
					                    ?>
			      						</div>
			      					</div>
			      					<div class="row">
			      						<div class="col-sm-12">
			      							  <button class="btn btn-link"  onclick="rodar(<?=$canais[$i]['id']?>)">
			         					
				         						<i class="fas fa-play-circle text-dark fa-2x"></i> <span class="text-dark">Testar</span>
			      						  </button>
			      						</div>
			      					</div>
			      				</div>
			      			</div>
			      			<div class="col-md-1 col-sm-5 text-center">
			      				<i class="fas fa-pen-square fa-1x" alt="Editar" title="Editar" onclick="carregacodigo('<?= $canais[$i]['id']?>')"></i>
			      			</div>
			      			<div class="col-md-1 col-sm-5 text-center">
			      				<i class="fas fa-trash fa-1x" alt="Excluir" title="Excluir"></i>
			      			</div>		
			      		</div>
			      	</div>


			    </div>

			    <div id="collapseOne<?=$i?>" class="collapse" aria-labelledby="headingOne<?=$i?>" data-parent="#accordionExample">
			      <div class="card-body">
			       
			      </div>
			    </div>
			  </div>
			<?php endfor; ?>
			</div>
		</div>
	</div>
</div>
