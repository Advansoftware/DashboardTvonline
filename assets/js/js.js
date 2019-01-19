const baseUrl = window.location;

const envia = (id) => {
    $.get("pegaUrl.php?ur="+id, function(data, status){
        var player = videojs('video-player');
        player.src(data)
        player.play();
        $(".wrapper").css("display","block");
});}
const carregacodigo = (id) => {
	$('.modal').modal("show");
	$.ajax({
		url: baseUrl+"/carrega_registro/"+id,
		dataType: "json",
		cache: false,
		type: 'POST',
		success: function(data){
			$(".modal-content").html(data.response);
		}
	});
}

const rodar = (id) => {
	$('.modal').modal("show");
	$.ajax({
		url: baseUrl+"/player/"+id,
		dataType: "json",
		cache: false,
		type: 'POST',
		success: function(data){
			$(".modal-content").html(data.response);
		}
	});
	$('.modal').on('hide.bs.modal', function () {
	$(".modal-content").empty();
});
}
