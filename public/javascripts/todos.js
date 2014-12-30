$(function() {
  $('.add-todo').keydown(function(e) {
    if(e.which !== 13) {
      return;
    }

    var title = $(this).val();
    var uid = getCookie('uid');
    console.log(title);
    console.log(uid);

    // $.post('todos.productiv.me/api/todo', {
    //   owner: uid,
    //   title: title
    // });
  })
});