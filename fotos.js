$(document).ready(function () {

    var baseUrlFotos = $('#baseUrlFotos').val();
    var idContrato = $('#idContrato').val();
    var podeAcessarFotos = $('#podeAcessarFotos').val() == 1;
    var galeria = document.getElementById('difoccus-gallery');
    var $galeria = $(galeria)
    var $btnBaixar = $('#btnBaixar');
    var $paginacao = $('.pagination');
    var justifiedGalleryOptions = {
        lastRow: 'center',
        margins: 2,
        target: podeAcessarFotos ? '_blank' : '_self'
    };
    var lightGalleryOptions = {
        speed: 500,
        thumbnail: true,
        licenseKey: 'DB1B1840-AFD54D59-9EB42E87-F809E8FF',
        plugins: [lgThumbnail],
    };
    var limitItems = 1000;
    var pageActual = 1;
    var totalPage = 1;
    var count = 0;
    var delimiter = 0;
    var items = [];
    var pageItems = [];
    var lg = false;

    // busca as fotos quando o evento é selecionado
    $('#idEvento').change(function () {
        ocultarPaginacao();
        $galeria.html('<h4 class="text-center">Carregando...</h4>');

        var idEvento = $(this).val();
        if (idEvento != '' && idContrato != '') {
            let params = {
                apiuser: 'api',
                apipin: 'g3r3nc14d0r',
                action: 'getfotos',
                contrato: idContrato,
                evento: idEvento,
            };
            $.post(baseUrlFotos + "/api/Api.php", params, function (results) {
                $galeria.html('');
                pageActual = 1;
                items = results;
                gallery();
            });
        } else {
            ocultarPaginacao();
            $galeria.html('<h4 class="text-center">Selecione um evento</h4>');
        }
    });

    // atualiza pageItems que fotos da página atual a serem exibidos e define os valores da paginação
    function paginateItems() {
        let result = [];
        totalPage = Math.ceil(items.length / limitItems);
        count = (pageActual * limitItems) - limitItems;
        delimiter = count + limitItems;
        if (pageActual <= totalPage) {
            for (let i = count; i < delimiter; i++) {
                if (items[i] != null) {
                    result.push(items[i]);
                }
                count++;
            }
        }
        // ajustar delimiter para exibir div#toNumber na primeira página
        if (totalPage == 1) {
            delimiter = items.length;
        }
        // ajustar delimiter para exibir div#toNumber na última página
        if (pageActual == totalPage) {
            delimiter = count - limitItems + result.length;
        }
        pageItems = result;
    }

    // atualiza html e libs da galeria com as fotos da página atual
    function gallery() {
        paginateItems();
        $galeria.html('');
        for (let i = 0; i < pageItems.length; i++) {
            let item = pageItems[i];
            let href = podeAcessarFotos && item.original ? item.original : 'javascript:void(0)';
            $galeria.append(`<a href="` + href + `" data-sub-html="<h4>Foto ` + item.filename + `</h4>" class="gallery-item">
                     <img src="` + item.thumb + `" alt="Foto ` + item.filename + `" />
                </a>`);
        }
        $galeria.justifiedGallery(justifiedGalleryOptions);
        if (podeAcessarFotos) {
            if (lg) {
                lg.refresh();
            } else {
                lg = lightGallery(galeria, lightGalleryOptions);
            }
        }
        updatePagination();
    }

    // atualização do html da paginação
    function updatePagination() {
        if (items.length > 0) {
            exibirPaginacao();
            if (totalPage == 1) {
                $('.anterior').addClass('disabled');
                $('.proxima').addClass('disabled');
            } else if (pageActual == 1) {
                $('.anterior').addClass('disabled');
                $('.proxima').removeClass('disabled');
            } else if (pageActual == totalPage) {
                $('.anterior').removeClass('disabled');
                $('.proxima').addClass('disabled');
            } else {
                $('.anterior').removeClass('disabled');
                $('.proxima').removeClass('disabled');
            }
            $('#fromNumber').html(count - limitItems + 1);
            $('#toNumber').html(delimiter);
            $('#totalNumber').html(items.length);
        } else {
            ocultarPaginacao();
            $galeria.html('<h4 class="text-center">Aguarde a publicação das fotos</h4>');
        }
    }

    // controle do click da paginação
    $('.controle').click(function (e) {
        if (!$(this).hasClass('disabled')) {
            disableDownloadButton();
            if ($(this).hasClass('proxima')) {
                pageActual++;
            } else {
                pageActual--;
            }
            gallery();
        }
    });

    // voltar ao topo após carregar fotos
    $galeria.justifiedGallery().on('jg.complete', function (e) {
        if (items) {
            $("html, body").animate({scrollTop: 0}, 800);
            enableDownloadButton();
        }
    });

    // dispara download das fotos da página atual
    $btnBaixar.click(function (e) {
        if (!$btnBaixar.hasClass('disabled')) {
            disableDownloadButton('Baixando fotos...');

            var idEvento = $('#idEvento').val();
            let params = {
                apiuser: 'api',
                apipin: 'g3r3nc14d0r',
                action: 'download',
                contrato: idContrato,
                evento: idEvento,
                imagens: pageItems,
            };
            console.log(params);
            $.post(baseUrlFotos + "/api/Api.php", params, function (result) {
                console.log('deu bom');
                console.log(result);
                window.open(baseUrlFotos + "/zip.php?z=" + result)
            }).fail(function() {
                console.log('falhou');
            }).always(function() {
                enableDownloadButton('Baixar fotos desta página');
            });
        }
    });

    function disableDownloadButton(description) {
        if (description) {
            $btnBaixar.html(description);
        }
        $btnBaixar.addClass('disabled');
    }

    function enableDownloadButton(description) {
        if (description) {
            $btnBaixar.html(description);
        }
        $btnBaixar.removeClass('disabled');
    }

    $('#difoccus-gallery').click(function (e) {
        if (!podeAcessarFotos) {
            $('#prazoExpiradoModal').modal('show');
        }
    });

    function ocultarPaginacao() {
        $paginacao.addClass('invisible');
    }

    function exibirPaginacao() {
        $paginacao.removeClass('invisible');
    }
});