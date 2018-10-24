<?php
	include "conecta.php";
	include "funcoes.php";
	
	if(isset($_GET['ur'])) $url = $_GET['ur'];
	else $url = null;
	$canais = Array();
	$canais =  get_canais($conexao);
	$pegaCanal = Array();
	$pegaCanal =  get_canaisById($conexao, $url);
?>
<!DOCTYPE html>
<html>
<head>
	<title>Advan TV</title>
	<link href="css/bootstrap.min.css" rel="stylesheet">
	<link href="css/animate.css" rel="stylesheet">
	<link href="css/css.css" rel="stylesheet">
	<link href="videojs/video-js.css" rel="stylesheet">
	<script src="videojs/jquery.min.js"></script>
	<script src="js/popper.min.js"></script>
  	<script src="js/bootstrap.min.js"></script>
  	<script src="videojs/video.js"></script>
	<script src="videojs/videojs-contrib-hls.js"></script>

</head>
<body oncontextmenu="return false">
	<div class="container-fluid">
		
		<div class="wrapper" style="z-index: 50;">
			<div class="videocontent">
				<video id="video-player"width="600" height="500" class="video-js vjs-default-skin" data-setup='{"fluid": true}'>
				  <source src=""
				     type="application/x-mpegURL">
				</video>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12 my-3">
				<div id="menu" class="card navegacao infos animated slideInLeft">
					<div class="card-header text-center text-white">
						<h5>Todos os Canais</h5>
					</div>
					<div class="card-body" style="overflow: auto;">
						<?php for($i=0; $i<count($canais); $i++): ?>
                        <a onclick="envia(<?= $canais[$i]['id']; ?>)">
                            <div class="card my-1 mx-1 d-inline-block text-center listacanais" style="max-width: 20rem;">
                                <img class="card-img-top img-fluid logos p-4 " src="<?= $canais[$i]['logo']; ?>">
                                <div class="card-body">
                                   <!--- <p class="card-text text-white align-middle"><?= $canais[$i]['nome']; ?></p> --->
                                </div>
                            </div>
                        </a>
					<?php endfor; ?>
					</div>
				</div>
			</div>
		</div>

		<footer class="fixed-bottom">
			<div class="row no-gutters ">
				<div class="col-12">
					<div class="card infos animated bounceInUp delay-1s">
						<div class="card-body">
							<div class="container-fluid">
								<div class="row no-gutters">
									
									<div class="col-3">
										<div class="imagem-infos d-flex align-items-center">
										<?php if(isset($pegaCanal[0]['logo'])): ?>
											<img class="img-fluid w-100" src="<?= $pegaCanal[0]['logo']; ?>">
                                        <?php else:?>
                                            <img class="img-fluid w-100 p-4" src="tv.svg">
                                        <?php endif;?>
										</div>
									</div>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	</div>
    <script src="js/js.js"></script>
</body>
</html>