
onClickTitle = function(e) {
  var title = $(this).html();
  var $todo = $(this).parent('.todo');
  $todo.data('title', title);
  $(this).remove();
  $todo.append('<input class="title-input" type="text" value="' + title + '"/>');
  var $input = $todo.children('.title-input');
  $input.keydown(onKeydownTitle).focus();

  // Move cursor to end of input
  var tmpStr = $input.val();
  $input.val('');
  $input.val(tmpStr);
};

reloadTodo = function(id) {
  $todo = $('#'+id);
  getTodo(id, function(res, success) {
    if(!success) console.log(res);
    $todo.replaceWith(res);
  })
}

showUndo = function(message, action, undoAction) {
  $('.notice').html(message + '<a class="undo" href="#"> Undo </a>').fadeIn(0);

  setTimeout(function() { $('.notice').fadeOut(1000); }, 2000);
  window.undo_timeout = setTimeout(action, 3000);

  $('.undo').click(function(e) {
    e.preventDefault();
    $('.notice').fadeOut(0);
    clearTimeout(window.undo_timeout);
    undoAction();
  });
};

renderTitle = function($todo, title) {
  var title = title || $todo.data('title');
  $todo.data('title', '');
  $todo.children('.title-input').remove();
  $todo.append('<span class="title">' + title + '</span>');
  $todo.children('.title').click(onClickTitle);
};

onKeydownTitle = function(e) {

  // Press Enter
  if(e.which === 13) {
    e.preventDefault();
    var $todo = $(this).parent('.todo');
    var title = $(this).val();
    restoreTitle($todo, title);
    updateTodo($todo.attr('id'), { title: title }, function(res, success) {
      console.log('update title res: ', res);
    });
  }

  // Press Backspace when input is empty
  if(e.which === 8 && $(this).val() === '') {
    e.preventDefault();
    var $todo = $(this).parent('.todo');
    $todo.hide();
    showUndo('Task Deleted', function() {
      $todo.remove();
      deleteTodo($todo.attr('id'), function(res, success) {
        console.log(res);
      });
    }, function() {
      renderTitle($todo);
      $todo.show();
    });
  }

  if(e.which === 27) {
    renderTitle($(this).parent('.todo'));
  }
};

getTodo = function(id, callback) {
  var url = '/api/todo/' + id;
  $.get(url, callback);
};

renderTodo = function(id, callback) {
  var url = '/api/todo/' + id;
  $.get(url, { render: true }, callback);
};

renderNewTodo = function(todo, callback) {
  var data = JSON.stringify({
    todo: todo,
    render: true
  });
  $.post('/api/todo', { data: data }, callback);
};

updateTodo = function(id, todo, callback) {
  var url = '/api/todo/' + id;
  $.put(url, todo, callback);
};

deleteTodo = function(id, callback) {
  var url = '/api/todo/' + id;
  $.delete(url, callback);
};

reorderTodos = function(ids, callback) {
  $.post('/api/todo/reorder', { data: JSON.stringify(ids) }, callback);
};

setTodoOrder = function() {
  var ids = $.map($('.todo'), function(todo) { return $(todo).attr('id'); });
  reorderTodos(ids, function(res) { console.log(res); });
};

$(function() {
  $('.add-todo').keydown(function(e) {
    if(e.which !== 13) return;

    var title = $(this).val();
    var uid = getCookie('productivUid');

    renderNewTodo({ title: title, owner: uid }, function(res, success) {
      console.log('res: ', res);
      if(!success) console.log(res.message);
      else {
        $('.todos').prepend(res);
        $('.add-todo').val('');
        var $todo = $('.todos').children('.todo').first();
        $todo.children('.title').click(onClickTitle);
        setTodoOrder();
      }
    });
  });

  $('.todo .check').click(function(e) {
    e.stopPropagation();
  }).change(function(e) {
    e.preventDefault();

    var $focused = $(document.activeElement);
    console.log($focused);
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
      } else console.log(res);

      console.log($focused);
    });
  });

  $('.todo .title').click(onClickTitle);

  $('.sortable').sortable({
    forcePlaceholderSize: true
  }).bind('sortupdate', setTodoOrder);
});