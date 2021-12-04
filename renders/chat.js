var socket = null;

$(document).ready(function(){
    var id = $('#id');
    var chat_in_btn = $('#chat_in');
    var chat_out_btn = $('#chat_out');
    var chat_list = $('#chat_list');
    var status_msg = $('#status_msg');
    var chat_text = $('#chat_text');

    chat_out_btn.hide();

    chat_text.bind('keydown', function(e) {
        if (socket === null)
            return;

        if (e.keyCode === 13) {
            socket.emit('new_text', { user: id.val(), text: chat_text.val() });
            chat_text.val('');
        } else {
            socket.emit('typing', { user: id.val() });
        }
    });

    chat_in_btn.bind('click', function(){
        var user = id.val();

        if (id.val() == "") {
            status_msg.text("대화명을 입력하세요...");
        } else {
            socket_coneect();
            chat_out_btn.show();
            chat_in_btn.hide();
            status_msg.text("채팅방에 입장하였습니다...");
            id.attr('disabled', 'disabled');
        }
    });
});

function socket_coneect(){
    if (socket === null) {
        socket = io.connect('http://211.184.253.206:9999');
        btn_bind();
    }
};

function btn_bind(){
    var id = $('#id');
    var chat_in_btn = $('#chat_in');
    var chat_out_btn = $('#chat_out');
    var chat_list = $('#chat_list');
    var status_msg = $('#status_msg');

    socket.on('connect', () => {
        socket.on('new_text', (data) => {
            chat_list.append(`<p><span>${data.user} : ${data.text}</span></p>`).scrollTop(chat_list.height() + 1000000);
            status_msg.text('');
        });

        socket.on('in', (data) => {
            chat_list.append(`<p><span>${data.user} 가 입장 하셨습니다.</span></p>`);
        });

        socket.on('out', (data) => {
            chat_list.append(`<p><span>${data.user} 가 퇴장 하셨습니다.</span></p>`);
        });

        socket.on('typing', (data) => {
            status_msg.text(`${data.user} 글 입력중...`);
        });

        chat_in_btn.unbind('click').bind('click', function(){
            if (id.val() == "") {
                status_msg.text("대화명을 입력하세요...");
            } else {
                socket_coneect();
                chat_out_btn.show();
                chat_in_btn.hide();
                status_msg.text("채팅방에 입장하였습니다...");
                socket.emit('in', { user: id.val() });
                id.attr('disabled', 'disabled');
            }
        });
    
        chat_out_btn.unbind('click').bind('click', function(){
            socket.on('disconnect', (res) => {
                id.val('');
                chat_in_btn.show();
                chat_out_btn.hide();
                status_msg.text("채팅방에 나가셨습니다...");
                id.removeAttr('disabled');
            });
            socket.user = id.val();
            socket.disconnect();
            socket = null;
        });
    });
};