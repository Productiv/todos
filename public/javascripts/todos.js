
function addTodo(todo) {
  $('.todos').prepend(todo);
};

$(function() {
  $('.add-todo').keydown(function(e) {
    if(e.which !== 13) {
      return;
    }

    var title = $(this).val();
    var uid = getCookie('productivUid');
    console.log(title);
    console.log(uid);

    $.post('/api/todo', {
      data: JSON.stringify({
        todo: {
          owner: uid,
          title: title
        },
        render: true
      })
    }, function(res, success) {
      console.log('res: ', res);
      if(!success) console.log(res.message);
      else addTodo(res);
    });
  })
});