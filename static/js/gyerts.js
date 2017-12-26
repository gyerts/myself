var getOutput_run = false;
var show_from_message = 0;

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function get_messages_from_server(id_for_output, process){
    getOutput_run = true;
    var XHR = new XMLHttpRequest();

    var data = new FormData();
    data.append('process', process);

    data.append('show_from_message', show_from_message);

    XHR.addEventListener('load', function (event) {
        if(parce_and_set_answer(id_for_output, XHR.responseText)){
            setTimeout('get_messages_from_server(\'' + id_for_output + '\', \'' + process + '\');', 1000);
        }
        else{
            get_active_process('program_output');
        }
    });
    XHR.addEventListener('error', function (event) {
    });
    XHR.onreadystatechange = function () {
    };
    var url = (window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/get_status');
    XHR.open('POST', url);
    XHR.send(data);
}

function run_process(id_for_output, process) {
    if(!getOutput_run) {
        var XHR = new XMLHttpRequest();

        var data = new FormData();
        data.append('process', process);
        data.append('workspace', getCookie('workspace'));

        XHR.addEventListener('load', function (event) {
            get_messages_from_server(id_for_output, process);
            parce_and_set_answer(id_for_output, XHR.responseText)
        });
        XHR.addEventListener('error', function (event) {

        });
        XHR.onreadystatechange = function () {

        };
        var url = (window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/run_process');
        XHR.open('POST', url);
        XHR.send(data);
    }
}

function parce_and_set_answer(id_for_output, json_object) {
    var output = $('#' + id_for_output);
    var response = JSON.parse(json_object);

    if(response.status == 'started') {
        show_from_message = 0;
        output.empty();
        var output_topic = $('#output_topic');
        output_topic.empty();
        output_topic.append(response.name);
    }

    if(response.message != '') {
        output.append(response.message);

        var elem = document.getElementById('working_space');

        elem.scrollTop = elem.scrollHeight;

        console.log(elem.scrollTop, elem.scrollHeight);

        var lenth = parseInt(response.len_of_returned_messages);
        if(lenth >= 0) {
            show_from_message += parseInt(lenth);
        }
    }

    if (response.status == 'finished'){
        show_from_message = 0;
        getOutput_run = false;
        return false;
    }
    return true;
}

function get_active_process(id_for_output) {
    if(!getOutput_run) {
        var XHR = new XMLHttpRequest();
        var data = new FormData();
        data.append('workspace', getCookie('workspace'));

        XHR.addEventListener('load', function (event) {
            var response = JSON.parse(XHR.responseText);
            if(response['process'] != 'None') {
                get_messages_from_server(id_for_output, response['process']);
            }
            else{
                setTimeout('get_active_process(\'' + id_for_output + '\');', 3000);
            }
        });
        XHR.addEventListener('error', function (event) {

        });
        XHR.onreadystatechange = function () {

        };
        var url = (window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/get_active_process');
        XHR.open('POST', url);

        XHR.send(data);
    }
}

get_active_process('program_output');