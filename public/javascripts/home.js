$(function(){

    var _timer = null,
        iframe = $("#J_CodePreview");

    var mixedMode = {
        name: "htmlmixed",
        scriptTypes: [
            {
                matches: /\/x-handlebars-template|\/x-mustache/i,
                mode: null
            },
            {
                matches: /(text|application)\/(x-)?vb(a|script)/i,
                mode: "vbscript"
            }
        ]
    };

    var editor = CodeMirror.fromTextArea($("#J_Editor")[0],{
        mode: mixedMode,
        lineNumbers: true,
        theme: "monokai",
        indentUnit: 4
    });

    // editor.setValue('<!DOCTYPE HTML>\n'
    //     + '<html>\n'
    //     + '<head>\n\t'
    //     + '<meta charset="utf-8">\n\t'
    //     + '<title>Document</title>\n'
    //     + '</head>\n'
    //     + '<body>\n\t'
    //     + '<!-- Your code here. -->\n'
    //     + '</body>\n'
    //     + '</html>');

    editor.on("change", function(e){
        if (_timer) {
            clearTimeout(_timer);
            _timer = null;
        }
        _timer = setTimeout(function(){
            // console.log(editor.getValue());
            // save data
            $.ajax({
                url: "/save",
                type: "post",
                dataType: "jsonp",
                data: {
                    id: $("#J_PID").val(),
                    code: encodeURIComponent(editor.getValue())
                },
                success: function(data) {
                    // console.log(data);
                    if (data.status === "success") {
                        iframe.attr("src", "/preview/" + data.pid + "?_t=" + new Date().getTime());
                    }
                }
            })
        }, 3000);
    });
});