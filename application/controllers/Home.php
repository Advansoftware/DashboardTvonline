<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once("Geral.php");

class Home extends Geral {
	public function __construct()
	{
		parent::__construct();
		$this->load->model('Home_model');
	}
	public function index(){

		$dados['title'] = "Advan TV";
		$this->load->view('header', $dados);
		$this->load->view('tv/rodatv');
	}

}
?>
