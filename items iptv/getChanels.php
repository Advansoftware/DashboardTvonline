<?php
// Meu arquivo
$arquivo = 'tv_chanels.m3u';

// Cria o recurso (abrir o arquivo)
$handle = fopen( $arquivo, 'r' );

// Lê o arquivo (se existir) 
$ler = fread( $handle, filesize($arquivo) );

// Mostra dados na tela
echo $ler;

// Fecha o arquivo
fclose($handle);
?>