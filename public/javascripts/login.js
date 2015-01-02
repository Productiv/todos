
$(function() {
  $('.signup-link').click(function(e) {
    $('.nav-tabs > li').removeClass('active');
    $(this).addClass('active');
    $('form.login').hide();
    $('form.signup').show();
    synchronize('.login', '.signup');
  });
  $('.login-link').click(function(e) {
    $('.nav-tabs > li').removeClass('active');
    $(this).addClass('active');
    $('form.signup').hide();
    $('form.login').show();
    synchronize('.signup', '.login');
  });
  $('form.login button.login').click(function(e) {
    e.preventDefault();
    var email = $('.login .email').val();
    var password = $('.login .password').val();
    $.post('http://accounts.productiv.me/api/login', {
      email: email,
      password: password
    }, function(res, req, options) {
      console.log(res);
      if(!res.success) {
        console.log(res);
        var message = (res && res.message) || 'unknown error';
        $('.notice').html(message).removeClass('hidden');
        return;
      } else if(res.token && res.uid) {
        setCookie('productivToken', res.token);
        setCookie('productivUid', res.uid);
        location.href = '/';
      } else {
        $('.notice').html('Server error. Bad token received.').removeClass('hidden');
      }
    });
  });
  $('form.signup button.signup').click(function(e) {
    e.preventDefault();

    var name     = $('.signup .name').val();
    var email    = $('.signup .email').val();
    var password = $('.signup .password').val();

    if(!email)              $('.notice').html('Email is a required field').removeClass('hidden');
    else if(!password)      $('.notice').html('Password is a required field').removeClass('hidden');
    if(!email || !password) return;

    $.post('http://accounts.productiv.me/api/signup', {
      name: name,
      email: email,
      password: password
    }, function(res, req, options) {
      console.log(res);
      if(res.success) location.href = '/';
      else {
        var message = (res && res.message) || 'unknown error';
        $('.notice').html(message);
      }
    });

  });
});

function synchronize(src, dest) {
  var $src = $('form' + src);
  var email = $src.find('input.email').val();
  var password = $src.find('input.password').val();
  var $dest = $('form' + dest);
  $dest.find('input.email').val(email);
  $dest.find('input.password').val(password);
};
