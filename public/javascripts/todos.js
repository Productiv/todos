
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
      else {
        addTodo(res);
        $('.add-todo').val('');
      }
    });
  });

  $('.todo .check').change(function(e) {
    e.preventDefault();

    var $todo = $(this).parent('.todo');
    var isDone = this.checked;
    var id = $todo.attr('id');
    var url = '/api/todo/' + id;

    $todo.toggleClass('done');

    $.ajax(url, {
      type: "PUT",
      data: {
        isDone: isDone
      }
    }).done(function(res, success) {
      if(!success) {
        console.log(res.message);
        isDone = !isDone;
        e.target.checked = isDone;
        isDone ? $todo.addClass('done') : $todo.removeClass('done');
      }
    });
  });
});