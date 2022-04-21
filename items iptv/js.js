$("#retur").hide();
$("#loading").hide();
var canal = "";
function converter(dados){
  var linhas = dados.split("#EXTINF:-1");
  for(var i = 1; i < linhas.length; i++){
    var nome ="", url= "", rl= "",  link= "", Turls = "";

    link =  "<li " + linhas[i]+"></li>";
    nome ="\nNAME="+$(link).attr("tvg-name")+"; ";
    Turls = linhas[i].split(",");
    if(Turls.length <= 2){
      rl = Turls[1].split("http:");
      url = "URL=http:"+ rl[1].trim();
      canal += nome.concat(url, ';');
    } 
    else {
      canal +="";
    }
  }
  var monta = "[Tocom_URL_LIST]\n"+canal;
  $("#resultado").val(monta),
  $("#loading").fadeOut(),
  $("#retur").show().fadeIn();
}

function showUser(site) {
  $("#loading").fadeIn();
  fetch("redirect.php?link="+site).then(function(response) {
    // tratar a response
      response.text().then(function(data){  
        converter(data);
      })
  });
  
}
$('#converte').click(function(){
    $("#resultado").val("");
    var dados = $("#arquivo").val();
    dados.replace("#EXTM3U", "");
    var linha = dados.split("#EXTINF:-1");
    
    if(linha.length>1) converter(dados);
    else showUser(dados);
});
 