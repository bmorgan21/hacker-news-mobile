(function() {
  if (!nunjucks.env) {
    nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader('/static/tpl'));
  }

  X.render = function(tpl, ctx) {
    if (ctx == null) {
      ctx = {};
    }
    tpl = nunjucks.env.getTemplate(tpl);
    return tpl.render(ctx);
  };

  X.macro = function(name, ctx, tpl) {
    var _ref;
    if (ctx == null) {
      ctx = {};
    }
    if (tpl == null) {
      tpl = 'macros.html';
    }
    return (_ref = nunjucks.env.getTemplate(tpl).getExported())[name].apply(_ref, ctx);
  };

  $(function() {
    var $doc;
    $doc = $(document);
    $doc.ajaxSuccess(function(event, xhr, settings) {
      var evt, json;
      if ((xhr.getResponseHeader("content-type") || '').toLowerCase().indexOf('json') > -1) {
        json = JSON.parse(xhr.responseText);
        if (!_.isEmpty(json.flash)) {
          evt = $.Event("flash", {
            flash: json.flash
          });
          $doc.trigger(evt);
          if (!evt.isDefaultPrevented()) {
            if (evt.flash) {
              X.flash(evt.flash);
            }
          }
        }
        if (json.redirect) {
          evt = $.Event("redirect", {
            redirect: json.redirect
          });
          $doc.trigger(evt);
          if (!evt.isDefaultPrevented()) {
            window.location = evt.redirect;
            event.stopImmediatePropagation();
            return event.stopPropagation();
          }
        }
      }
    });
  });

  X.flash = function(flashes) {
    var $cont, deduped;
    $cont = $("body div.flash-container");
    deduped = {};
    _.each(flashes, function(messages, type) {
      deduped[type] = [];
      _.each(messages, function(text) {
        var $existing;
        $existing = $cont.find(".alert-" + type + ":visible .msg:contains('" + text + "')");
        if ($existing.length) {
          return $existing.next().text(function(i, str) {
            return 'x' + (str ? parseInt(str.slice(1), 10) + 1 : 2);
          });
        } else {
          return deduped[type].push(text);
        }
      });
      if (deduped[type].length === 0) {
        return delete deduped[type];
      }
    });
    if (!_.isEmpty(deduped)) {
      $cont.append(X.macro('flash', deduped));
      return Behavior2.contentChanged('flash');
    }
  };

  X.getCurrentPosition = function(success_cb, error_cb, options) {
    var coords, handle_success;
    coords = JSON.parse($.cookie('coords') || '{}');
    window.coords = coords;
    if (coords.lat && coords.lng && coords.timestamp) {
      coords.valid = (new Date() - new Date(coords.timestamp)) < 1 * 60 * 1000;
    }
    handle_success = function(coords, success_cb) {
      $.cookie('coords', JSON.stringify(coords));
      return success_cb(new google.maps.LatLng(coords.lat, coords.lng));
    };
    if (coords.valid) {
      return handle_success(coords, success_cb);
    } else if (navigator.geolocation) {
      return navigator.geolocation.getCurrentPosition((function(position) {
        coords = position.coords;
        return handle_success({
          lat: coords.latitude,
          lng: coords.longitude,
          timestamp: new Date().toJSON()
        }, success_cb);
      }), error_cb);
    } else {
      return alert('Functionality not available');
    }
  };

  Behavior2.Class('flash', 'body div.flash-container .alert', function($ctx, that) {
    return setTimeout(function() {
      return $ctx.fadeOut('slow');
    }, 4200);
  });

  Behavior2.Class('flashContainer', 'body div.flash-container', function($ctx, that) {
    return $ctx.scrollToFixed({
      marginTop: 40
    });
  });

  Behavior2.Class('date-picker', 'body input.date-picker', function($ctx, that) {
    return $ctx.datepicker().on('changeDate', function(ev) {
      return $ctx.datepicker('hide');
    });
  });

  Behavior2.Class('formfill', 'form', function($ctx, that) {
    $ctx.values($ctx.data('vars'));
    $ctx.errors($ctx.data('errors'));
    return $ctx.trigger('initialized');
  });

  Behavior2.Class('loginrequired', '.login-required', function($ctx, that) {
    return $('#login-modal').modal();
  });

  Behavior2.Class('filters', '#locations .filters', {
    click: {
      'a.filter': 'toggle_filter'
    }
  }, (function($ctx, that) {
    var $lis, $locations, $ul;
    $locations = $ctx.closest('#locations');
    $ul = $locations.find('ul.nav');
    $lis = $locations.find('ul.nav li');
    return that.toggle_filter = function(evt) {
      var $filter, filter_icon, is_active;
      $filter = $(evt.target).closest('.filter');
      is_active = $filter.hasClass('active');
      $ctx.find('.filter').removeClass('active');
      $ctx.find('.filter .cnt').removeClass('badge badge-info');
      if (!is_active) {
        $filter.addClass('active');
        $filter.find('.cnt').addClass('badge badge-info');
      }
      $ul.find('li').remove();
      filter_icon = $filter.find('.icon').attr('src');
      return _.each($lis, function(li) {
        if (is_active || $(li).find('.icon').attr('src') === filter_icon) {
          return $ul.append(li);
        }
      });
    };
  }));

  $.fn.typeahead.defaults['matcher'] = function(item) {
    return true;
  };

  $.fn.typeahead.defaults['sorter'] = function(items) {
    return $(items).map(function(i, el) {
      return JSON.stringify(el);
    });
  };

  $.fn.typeahead.defaults['highlighter'] = function(json_item) {
    var item, query, result;
    item = JSON.parse(json_item);
    query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    result = item['name'].replace(new RegExp('(' + query + ')', 'ig'), function($1, match) {
      return '<strong>' + match + '</strong>';
    });
    if (item.icon) {
      result = '<img style="max-height:18px; max-width:18px;" src="' + item.icon + '"/> ' + result;
    }
    return result;
  };

  $.fn.typeahead.defaults['updater'] = function(json_item) {
    var item;
    item = JSON.parse(json_item);
    return item['selection'];
  };

}).call(this);
