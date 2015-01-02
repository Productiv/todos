
function synchronize(src, dest) {
  return function(e) {
    $('.nav-tabs > li').removeClass('active');
    $(dest + '-link').addClass('active');
    $('form' + src).hide();
    $('form' + dest).show();
    if(dest === '.signup') $('.tab-panel').css('border-top-left-radius', '0');
    else $('.tab-panel').css('border-top-left-radius', '');

    var $src = $('form' + src);
    var email = $src.find('input.email').val();
    var password = $src.find('input.password').val();
    var $dest = $('form' + dest);
    $dest.find('input.email').val(email);
    $dest.find('input.password').val(password);
  }
};

$(function() {
  $('.signup-link').click(synchronize('.login', '.signup'));
  $('.login-link').click(synchronize('.signup', '.login'));
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
