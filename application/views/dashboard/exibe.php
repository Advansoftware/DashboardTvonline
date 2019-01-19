<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered" role="document">
		<div class="modal-content">
			<div class="modal-header ribbon-bookmark">
				Adicionar Canal
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<form name="canal">
						<div class="form-group">
							<label for="Cnome">Nome do canal: </label>
							<input class="form-control" name="Cnome" id="Cnome"></input>
						</div>
						<div class="form-group">
							<label for="Curl">Url: </label>
							<input class="form-control" name="Curl" id="Curl"></input>
						</div>
						<div class="form-group">
							<div class="row">
								<div class="col-8">
									<label for="Clogo">Logo: </label>
									<input class="form-control" name="Clogo" id="Clogo"></input>
								</div>
								<div class="col-4">
									<label for="Cstatus">Status: </label>
									<select class="form-control" id="Cstatus">
										<option selected value="1">Online</option>
										<option value="0">Offline</option>
									</select>
								</div>
							</div>
							
						</div>
					</form>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-danger" data-dismiss="modal">Cancelar</button>
				<button type="button" class="btn btn-info">Salvar</button>
			</div>
		</div>
	</div>
</div>


<div class="container">

	<div class="row  mt-5">
		<div class="col-md-11 text-right">
			<button class="btn btn-success" data-toggle="modal" data-target="#exampleModalCenter">Adicionar Canal</button>
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
			      							  <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne<?=$i?>" aria-expanded="true" aria-controls="collapseOne<?=$i?>">
			         	
				         						<i class="fas fa-play-circle text-dark fa-2x"></i> <span class="text-dark">Testar</span>
			         	
			      						  </button>
			      						</div>
			      					</div>
			      				</div>
			      			</div>
			      			<div class="col-md-1 col-sm-5 text-center">
			      				<i class="fas fa-pen-square fa-1x" alt="Editar" title="Editar"></i>
			      			</div>
			      			<div class="col-md-1 col-sm-5 text-center">
			      				<i class="fas fa-trash fa-1x" alt="Excluir" title="Excluir"></i>
			      			</div>		
			      		</div>
			      	</div>


			    </div>

			    <div id="collapseOne<?=$i?>" class="collapse" aria-labelledby="headingOne<?=$i?>" data-parent="#accordionExample">
			      <div class="card-body">
			       <video id='hls-video<?=$i?>'>
					    <source src='<?= $canais[$i]['link'];?>' type='application/x-mpegURL'/>
					</video>

					<script>
						fluidPlayer(
						    'hls-video<?=$i?>',
						    {
						        layoutControls: {
						            fillToContainer: true
						        }
						    }
						);
						</script>
					
			      </div>
			    </div>
			  </div>
			<?php endfor; ?>
			</div>
		</div>
	</div>
</div>
