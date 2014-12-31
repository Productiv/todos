
function onClickTitle(e) {
  var title = $(this).html();
  var parent = $(this).parent('.todo');
  $(this).remove();
  parent.append('<input class="title-input" type="text" value="' + title + '"/>');
  parent.children('.title-input').keydown(onSubmitTitle);
};

onSubmitTitle = function(e) {
  if(e.which === 13) {
    e.preventDefault();
    console.log('test');
    var title = $(this).val();
    var todo = $(this).parent('.todo');
    $(this).remove();
    todo.append('<span class="title">' + title + '</span>');
    todo.children('.title').click(onClickTitle);
    updateTodo(todo.attr('id'), { title: title }, function(res, success) {
      console.log('update title res: ', res);
    });
  }
};

renderTodo = function(todo, callback) {
  $.post('/api/todo', {
    data: JSON.stringify({
      todo: todo,
      render: true
    })
  }, callback);
};

updateTodo = function(id, todo, callback) {
  var url = '/api/todo/' + id;
  $.ajax(url, {
    type: "PUT",
    data: todo
  }).done(callback);
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

    renderTodo({ title: title, owner: uid }, function(res, success) {
      console.log('res: ', res);
      if(!success) console.log(res.message);
      else {
        $('.todos').prepend(res);
        $('.add-todo').val('');
        var $todo = $('.todos').children('.todo').first();
        $todo.children('.title').click(onClickTitle);
      }
    });
  });

  $('.todo .check').change(function(e) {
    e.preventDefault();

    var $todo = $(this).parent('.todo');
    var isDone = this.checked;
    var id = $todo.attr('id');

    $todo.toggleClass('done');

    updateTodo(id, { isDone: isDone }, function(res, success) {
      if(!success) {
        console.log(res.message);
        isDone = !isDone;
        e.target.checked = isDone;
        isDone ? $todo.addClass('done') : $todo.removeClass('done');
      }
    });
  });

  $('.todo .title').click(onClickTitle);
});