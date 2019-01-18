<!DOCTYPE html>
<html>
<head>
	<title>403 Forbidden</title>
	<style type="text/css">

		body{
			background-color: #54c3ef;
			text-align: center;
		}
		img{
			margin: 1em auto;
			width: 40%;
			min-width: 250px;
		}
	</style>
</head>
<body>
	<?php
		$host= "http://$_SERVER[HTTP_HOST]";
	?>
	<img src="<?=$host?>/camara/content/imagens/permissao.png">
</body>
</html>