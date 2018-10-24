<?php
include "conecta.php";
include "funcoes.php";

if(isset($_GET['ur'])) $url = $_GET['ur'];
else $url = null;
$pegaCanal = Array();
$pegaCanal =  get_canaisById($conexao, $url);
echo $pegaCanal[0]['link'];
?>