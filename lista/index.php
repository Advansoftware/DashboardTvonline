#EXTM3U

<?php 
	include "../conecta.php";
	include "../funcoes.php";
	$canais = Array();
	$canais =  get_canais($conexao);
?>
<?php
	header("Content-Type: audio/mpegurl");
	header("Content-Disposition: attachment; filename=playlist.m3u");
	for($i=0; $i<count($canais); $i++){
		echo "#EXTINF:-1 tvg-logo=\"".$canais[$i]['logo']."\" group-title=\"CANAL ABERTO\", ".$canais[$i]['nome'];
		echo "\n".$canais[$i]['link'];
		echo "\r\n\n";
	}
?>