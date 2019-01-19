<?php
	class Geral extends CI_Controller 
	{
		protected $data;

		public function __construct()
		{
			parent::__construct();
			$this->load->helper('url_helper');
			$this->load->helper('url');
			$this->load->helper('html');
			$this->load->helper('form');
			$this->load->library('session');
			$this->load->helper('cookie');
			$this->data['url'] = base_url();
		}
	}
?>
