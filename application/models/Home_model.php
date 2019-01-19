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
		public function get_registroById($id){
			$this->db->select('*');
			$this->db->where("id", $id);
			return $this->db->get('canais')->row_Array();
		}
	}
?>
