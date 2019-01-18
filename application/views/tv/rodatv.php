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
<?= link_tag('assets/css/css.css') ?>
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
						<img src="<?= base_url() ?>assets/qrcode/php/qr_img.php?d=Teste qrcode&e=H&s=5&t=P">
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
    <script src="<?php echo base_url();?>assets/js/js.js"></script>
</body>
</html>