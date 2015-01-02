
onClickTitle = function(e) {
  var title = $(this).html();
  var $todo = $(this).parents('.todo');
  $todo.data('title', title);
  $(this).remove();
  $todo.append('<input class="title-input" type="text"/>');
  $todo.attr('draggable', false);

  var $input = $todo.children('.title-input');
  $input.keydown(onKeydownTitle)
        .val(title)
        .focus()
        .focusout(submitTitle);

  // Move cursor to end of input
  var tmpStr = $input.val();
  $input.val('');
  $input.val(tmpStr);
};

onKeydownTitle = function(e) {

  // Press Enter
  if(e.which === 13 && $(this).val() === '') removeTodo.call(this, e);
  else if(e.which === 13) submitTitle.call(this, e);

  if(e.which === 27) {
    renderTitle($(this).parents('.todo'));
  }
};

onCheckChange = function(e) {
  e.preventDefault();

  var $todo = $(this).parents('.todo');
  var isDone = this.checked;
  var id = $todo.attr('id');

  if($todo.parents('.todos').hasClass('hide-done')) {
    $todo.fadeOut('300', function(e) {
      $(this).toggleClass('done').attr('style', '');
    });
  } else $todo.toggleClass('done');

  showUndo('Marked as done.', function() {
    updateTodo(id, { isDone: isDone }, function(res) { console.log(res); });
  }, function() {
    $todo.find('.check').attr('checked', !isDone);
    $todo.removeClass('done');
  });

  $todo.children('.title-input').focus();
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
  $todo.attr('draggable', true);
};

removeTodo = function(e) {
  e.preventDefault();

  var $todo = $(this).parents('.todo');
  $todo.fadeOut('300');
  if($todo.children('.title-input').length > 0) renderTitle($todo);

  showUndo('Task deleted.', function() {
    $todo.remove();
    deleteTodo($todo.attr('id'), function(res) {
      console.log(res);
    });
  }, function() {
    $todo.show();
  });
};

submitTitle = function(e) {
  e.preventDefault();
  var $todo = $(this).parents('.todo');
  var title = $(this).val();
  renderTitle($todo, title);
  updateTodo($todo.attr('id'), { title: title }, function(res, success) {
    console.log('update title res: ', res);
  });
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

saveTodoOrder = function() {
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

sortTodosByDone = function(dir) {
  var first = (dir === 'asc') ? -1 : 1;
  var second = (dir === 'asc') ? 1 : -1;
  var items = $('.todo');
  items.sort(function(a, b) {
    if($(a).hasClass('done') && !$(b).hasClass('done'))      return first;
    else if(!$(a).hasClass('done') && $(b).hasClass('done')) return second;
    else return 0;
  });
  $('.todos').html(items);
};

sortTodosByIndex = function() {
  var items = $('.todo');
  items.sort(function(a, b) {
    return a.index - b.index;
  });
  $('.todos').html(items);
};

setShowDone = function() {
  if(getCookie('productivShowDone') === 'true') {
    $('.show-done').html('Done: Show');
    $('.todos').removeClass('hide-done');
  } else {
    $('.show-done').html('Done: Hidden');
    $('.todos').addClass('hide-done');
  }
};

$(function() {
  // Load settings from cookie
  setShowDone();

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
        $todo.children('.check').change(onCheckChange);
        saveTodoOrder();
        $('.sortable').sortable('reload');
      }
    });
  });

  $('.todo .check').change(onCheckChange);

  $('.todo .title').click(onClickTitle);

  $('.sortable').sortable({
    forcePlaceholderSize: true,
    items: ':not(.disabled)'
  }).bind('sortupdate', saveTodoOrder);

  $('.logout').click(logout(function(res) {
    if(!res.success) console.log(res);
    else location.href = '/login';
  }));

  hoverShowDone = function(e) {
    if(getCookie('productivShowDone') === 'true')
      $('.show-done').html('Done: Hide');
    else
      $('.show-done').html('Done: Show');
  };

  $('.show-done').click(function(e) {
    var show = getCookie('productivShowDone');
    if(show === 'true') setCookie('productivShowDone', 'false');
    else setCookie('productivShowDone', 'true');
    setShowDone();
  }).hover(hoverShowDone, setShowDone);

  $('.todo .remove').click(removeTodo);

  $('.done-to-bottom').click(function(e) {
    sortTodosByDone('desc');
    saveTodoOrder();
  });

});