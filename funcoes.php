<?php
	function get_canais($database  = null){
		if(isset($database)){
			$canal  = mysqli_query($database, "SELECT * FROM canais");
			$itens = mysqli_fetch_all($canal, MYSQLI_ASSOC);
		}
		else{
			$itens = null;
		}
		return $itens;
	}
	function get_canaisById($database, $id){
		if(isset($database) && isset($id)){
			$canal  =  mysqli_query($database, "SELECT * FROM canais where id = $id");
			$itens = mysqli_fetch_all($canal, MYSQLI_ASSOC);
		}
		else
		{
			$itens = null;
		}
		return $itens;
	}
?>