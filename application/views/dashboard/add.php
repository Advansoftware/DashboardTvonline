<div class="modal-header ribbon-bookmark">
	<?php
	 	echo empty($registro['nome']) ? 'Adicionar Canal':'Editar Canal';
	?>
</div>
<div class="modal-body">
	<div class="container-fluid">
		<form name="canal">
			<div class="form-group">
				<label for="Cnome">Nome do canal: </label>
				<input class="form-control" name="Cnome" id="Cnome" value="<?=!empty($registro['nome']) ? $registro['nome']:''?>"></input>
			</div>
			<div class="form-group">
				<label for="Curl">Url: </label>
				<input class="form-control" name="Curl" id="Curl" value="<?=!empty($registro['link']) ? $registro['link']:''?>"></input>
			</div>
			<div class="form-group">
				<div class="row">
					<div class="col-8">
						<label for="Clogo">Logo: </label>
						<input class="form-control" name="Clogo" id="Clogo" value="<?=!empty($registro['logo']) ? $registro['logo']:''?>"></input>
					</div>
					<div class="col-4">
						<label for="Cstatus">Status: </label>
						<select class="form-control" id="Cstatus">
							<?php
								if($registro['status'] == 1) 
								{
									echo "<option selected value='1'>Online</option>";
									echo "<option value='0'>Offline</option>";
								}
								else
								{
									echo "<option  value='1'>Online</option>
									<option selected value='0'>Offline</option>";
								}

							?>
							
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