<?php
	defined('BASEPATH') OR exit('No direct script access allowed');
	require_once("Geral.php");

	class Dashboard extends Geral{

		public function __construct()
		{
			parent::__construct();
			$this->load->model('Home_model');
		}
		public function index()
		{
			$dados['title'] = "Advan TV - Admin";
			$dados['canais'] = $this->Home_model->get_canais();
			$this->load->view('header',$dados);
			$this->load->view('dashboard/menu');
			$this->load->view('dashboard/exibe');
		}


	}
?>