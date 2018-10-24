function envia(id){
    $.get("pegaUrl.php?ur="+id, function(data, status){
        var player = videojs('video-player');
        player.src(data)
        player.play();
        $(".wrapper").css("display","block");
});}
