<!doctype html>
<html lang="en">
  <head>
    <?php header('Access-Control-Allow-Origin: *'); ?>
    <title>Title</title>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
  </head>
  <body>
      <div id="loading" class="text-center" style="position: fixed; z-index:1000; width: 100%; height:100%; background-color: rgba(0,0,0,.5);top: 0px;">
          <img src="143.gif" alt="" class="my-5 py-5" style="position: relative; top: 7rem;">
          <br>
          <span class="text-white position-relative" style="top: 2rem; text-shadow: 1px 2px 3px red;" > 
              Carregando...
          </span>
      </div>
      <div class="container">
        <div class="card my-5">
            <div class="card-header">
                Abrir arquivo
            </div>
            <div class="card-body">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12 badge-dark p-3 rounded-sm">
                            <label for="arquivo">Cole as URLs</label><br />
                            <textarea name="arquivo" id="arquivo" class='w-100' rows="5"></textarea>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-12">
                            <button class="form-control btn-primary btn-block" id="converte">Converter</button>
                        </div>
                    </div>
                    <hr>
                    <div class="row" id="retur">
                        <div class="col-12 badge-success p-3 rounded-sm">
                            <label for="resultado">Resultado</label><br />
                            <textarea name="resultado" id="resultado" class='w-100' rows="15" readonly></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="node_modules/jquery/dist/jquery.slim.min.js"></script>
    <script src="node_modules/popper.js/dist/popper.min.js"></script>
    <script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="js.js"></script>
  </body>
</html>