
onClickTitle = function(e) {
  var title = $(this).html();
  var $todo = $(this).parents('.todo');
  $todo.data('title', title);
  $(this).remove();
  $todo.append('<input class="title-input" type="text"/>');

  var $input = $todo.children('.title-input');
  $input.keydown(onKeydownTitle)
        .val(title)
        .focus();

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
  });
}

showUndo = function(message, action, undoAction) {
  $('.notice').html('<span class="message">' + message + '</span> ' +
                    '<a class="undo" href="#"> Undo </a>')
  $('.notice').fadeIn(0);

  // Could cause race conditions, etc.
  setTimeout(function() { $('.notice').fadeOut(2000); }, 3000);
  window.onbeforeunload = action;
  window.undo_timeout = setTimeout(function() {
    action();
    window.onbeforeunload = null;
  }, 5000);

  $('.undo').click(function(e) {
    e.preventDefault();
    window.onbeforeunload = null
    $('.notice').stop().fadeOut(0);
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

removeTodo = function(e) {
  e.preventDefault();
  var $todo = $(this).parents('.todo');
  $todo.hide();
  showUndo('Task Deleted', function() {
    $todo.remove();
    deleteTodo($todo.attr('id'), function(res) {
      console.log(res);
    });
  }, function() {
    $todo.show();
  });
};

onKeydownTitle = function(e) {

  // Press Enter
  if(e.which === 13) {
    e.preventDefault();
    var $todo = $(this).parents('.todo');
    var title = $(this).val();
    renderTitle($todo, title);
    updateTodo($todo.attr('id'), { title: title }, function(res, success) {
      console.log('update title res: ', res);
    });
  }

  // Press Backspace when input is empty
  if(e.which === 8 && $(this).val() === '') {
    removeTodo.call(this, e);
    renderTitle($(this).parents('.todo'));
  }

  if(e.which === 27) {
    renderTitle($(this).parents('.todo'));
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
  $.post('/api/todo', { data: JSON.stringify(todo), render: true }, callback);
};

updateTodo = function(id, todo, callback) {
  var url = '/api/todo/' + id;
  $.put(url, { data: JSON.stringify(todo) }, callback);
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

logout = function(callback) {
  return function(e) {
    e.preventDefault();
    var uid = getCookie('productivUid');
    $.post('http://accounts.productiv.me/api/logout', {
      uid: uid
    }, callback);
  };
};

toggleShowDone = function(show) {
  if(show == undefined) {
    $('.show-done').toggleClass('active');
    $('.todos').toggleClass('hide-done');
  } else if(show) {
    $('.show-done').addClass('active');
    $('.todos').removeClass('hide-done');
  } else {
    $('.show-done').removeClass('active');
    $('.todos').addClass('hide-done');
  }
};

$(function() {
  // Load settings from cookie
  if(getCookie('productivShowDone') === 'true') toggleShowDone(true);

  $('.add-todo').keydown(function(e) {
    if(e.which !== 13) return;

    var title = $(this).val();
    var uid = getCookie('productivUid');

    renderNewTodo({ title: title, owner: uid }, function(res) {
      console.log('res: ', res);
      if(!res.success) console.log(res.message);
      else {
        $('.todos').prepend(res.data);
        $('.add-todo').val('');
        var $todo = $('.todos').children('.todo').first();
        $todo.children('.title').click(onClickTitle);
        $todo.children('.remove').click(removeTodo);
        setTodoOrder();
        $('.sortable').sortable('reload');
      }
    });
  });

  $('.todo .check').change(function(e) {
    e.preventDefault();

    var $todo = $(this).parents('.todo');
    var isDone = this.checked;
    var id = $todo.attr('id');

    if($todo.parents('.todos').hasClass('hide-done')) {
      $todo.fadeOut('300', function(e) {
        $(this).toggleClass('done');
      });
    } else $($todo).toggleClass('done');

    updateTodo(id, { isDone: isDone }, function(res) {
      console.log(res);
      if(!res.success) {
        console.log(res.message);
        isDone = !isDone;
        e.target.checked = isDone;
        isDone ? $todo.addClass('done').animate(300) : $todo.removeClass('done');
      }
    });

    $todo.children('.title-input').focus();
  });

  $('.todo .title').click(onClickTitle);

  $('.sortable').sortable({
    forcePlaceholderSize: true
  }).bind('sortupdate', setTodoOrder);

  $('.logout').click(logout(function(res) {
    if(!res.success) console.log(res);
    else location.href = '/login';
  }));

  $('.show-done').click(function(e) {
    toggleShowDone();
    var show = getCookie('productivShowDone');
    if(show === 'true') setCookie('productivShowDone', 'false');
    else setCookie('productivShowDone', 'true');
  });

  $('.todo .remove').click(removeTodo);
});