<div class="container clearfix mb-5">
    <h1 class="display-4 text-center">Projetos Executivos</h1>
    <div class="row">

        <div class="col-md-10">
            <div class="row w-100 mx-auto">

                <div class="card w-100">
                    <div class="accordion" id="accordionExample">
                        <div class="card">
						<?php 
							for($i = 0; $i < COUNT($years); $i++)
							{
								echo"<div class='card-header text-center font-weight-bold' id='headingOne".$years[$i]['Ano']."'>";
									echo"<h5 class='mb-0'>";
										echo"<button class='btn btn-link' type='button' data-toggle='collapse' data-target='#collapseOne".$years[$i]['Ano']."' aria-expanded='true' aria-controls='collapseOne'>";
											echo $years[$i]['Ano'];
										echo"</button>";
									echo"</h5>";
								echo"</div>";
								
								for($j = 0; $j < COUNT($projetos); $j++)
								{
									if($years[$i]['Ano'] == $projetos[$j]['Ano'])
									{
										echo"<div id='collapseOne".$years[$i]['Ano']."' class='collapse ";
										if($i==0) echo "show";
										echo "' aria-labelledby='headingOne".$years[$i]['Ano']."' data-parent='#accordionExample'>";
											echo"<div class='card-body'>";
												echo"<div class='col-sm-auto mt-3 d-inline-block'>";
													echo"<div class='card text-center' style='width: 12rem;padding-top: 1rem;'>";
														echo"<div style='font-size:2em; color:Tomato;'>";
															echo"<i class='fas fa-file-pdf fa-1x'></i>";
														echo"</div>";
														echo"<div class='card-body'>";
															echo"<h6 class='card-title' style='font-size: 13px;'>";
															echo "Projeto ".$projetos[$j]['numero'];
															echo"</h6>";
															echo"<p class='card-text' style='font-size: 11px;'>Publicado em: ".$projetos[$j]['data']." </p>";
															echo"<a href='".base_url()."content/sessoes/ordinarias/' class='btn btn-info' target='_blank' style='width:  100%; border-radius:  inherit;'><i class='fas fa-cloud-download-alt'></i> Baixar</a>";
														echo"</div>";
													echo"</div>";
												echo"</div>";
											echo"</div>";
										echo"</div>";
									}
								}
							}
						?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?= loadMenus() ?>
    </div>
</div>		
