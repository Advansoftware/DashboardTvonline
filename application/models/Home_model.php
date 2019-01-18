<?php
		class Home_model extends CI_Model {
		
		public function __construct()
			{
				$this->load->database();
			}
		public function get_canais()
		{
			$this->db->select('*');
			return $this->db->get('canais')->result_Array();
		}

	}
?>
