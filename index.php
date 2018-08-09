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
	<title>Teste streaming</title>
	<link href="css/bootstrap.min.css" rel="stylesheet">
	<link href="css/animate.css" rel="stylesheet">
	<link href="videojs/video-js.css" rel="stylesheet">
	<script src="videojs/jquery.min.js"></script>
	<script src="js/popper.min.js"></script>
  	<script src="js/bootstrap.min.js"></script>
  	<script src="videojs/video.js"></script>
	<script src="videojs/videojs-contrib-hls.js"></script>
	<style>
		*{
			margin: 0px;
			padding: 0px;
		}
		body, html{
			width: 100%;
			height: 100%;
			background-image: url("wal.png");
		    background-repeat: no-repeat;
		    background-size: cover;
		    background-color: black;
		}
		.video-js .vjs-tech {
		    position: fixed !important;
		    top: 0px;
		    left: 0px;
		    right: 0px;
		    bottom: 0px;
		    width: 100%;
		    height: 100%;
		    background-color: black;
		}
		.video-player-dimensions.vjs-fluid {
			position: fixed!important;
			padding: 0px;
			top:45%;
		}
		.wrapper{
			display: none;
		}
		.infos{
			background-color:  rgba(35,33,33,.7);
		}
		.imagem-infos{
			background-color: #131111;
			width: 9rem;
			height: 9rem;
		}
		.logos{
			width: 4rem;
			height: 4rem;
		}
		.navegacao{
			height: 25rem;
		}
		.btn.focus, .btn:focus{
			box-shadow: none;
		}
	</style>
</head>
<body>
	<div class="container-fluid">
		
		<div class="wrapper" style="z-index: 50;">
			<div class="videocontent">
				<video id="video-player"width="600" height="500" class="video-js vjs-default-skin" data-setup='{"fluid": true}'>
				  <source src="<?= $pegaCanal[0]['link']; ?>"
				     type="application/x-mpegURL">
				</video>
			</div>
		</div>
		<div class="row">
			<div class="col-md-4 my-3">
				<div id="menu" class="card navegacao infos animated slideInLeft">
					<div class="card-header text-center text-white">
						<h5>Todos os Canais</h5>
					</div>
					<div class="card-body" stile="overflow: auto;">
						<?php for($i=0; $i<count($canais); $i++): ?>
							<a href="?ur=<?= $canais[$i]['id']; ?>">
								<div class="card my-2">
									<div class="card-body btn btn-outline-primary bg-dark btn-block">
										<div class="row">
											<div class="col-md-3"><img src="<?= $canais[$i]['logo']; ?>" class="img-fluid logos"></div>
											<div class="col-md-8 text-white align-middle">
												<h5><?= $canais[$i]['nome']; ?></h5>					
											</div>
										</div>
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
	<script>
		var player = videojs('video-player');

			player.play();
			$(".wrapper").css("display","block");
	</script>
</body>
</html>