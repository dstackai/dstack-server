function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lodashEs = require('lodash-es');
var moment = _interopDefault(require('moment'));
var axios = _interopDefault(require('axios'));

var parseSearch = function parseSearch(searchString) {
  var search = searchString.substring(1);
  var params = {};
  if (!search.length) return params;

  try {
    params = JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  } catch (e) {
    params = {};
  }

  return params;
};

var getDataFailedRequest = function getDataFailedRequest(responseError) {
  var error = 'Unknown error';

  try {
    error = JSON.parse(lodashEs.get(responseError, 'request.response')).message;
  } catch (e) {
    console.log(error, e);
  }

  var requestStatus = lodashEs.get(responseError, 'request.status');

  return {
    error: error,
    requestStatus: requestStatus
  };
};

var unicodeBase64Decode = function unicodeBase64Decode(text) {
  try {
    var decodeData = window.atob(text);
    return decodeURIComponent(Array.prototype.map.call(decodeData, function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return null;
  }
};

var formatBytes = function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 Bytes';
  var k = 1024;
  var dm = decimals <= 0 ? 0 : decimals || 2;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

var downloadFile = function downloadFile(_ref) {
  var url = _ref.url,
      blob = _ref.blob,
      type = _ref.type,
      fileName = _ref.fileName;

  if (blob) {
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([blob]));
    link.setAttribute('target', '_blank');
    link.setAttribute('download', fileName);
    link.setAttribute('type', type);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }

  if (url) {
    var _link = document.createElement('a');

    _link.href = url;

    _link.setAttribute('target', '_blank');

    _link.setAttribute('download', true);

    document.body.appendChild(_link);

    _link.click();

    _link.parentNode.removeChild(_link);
  }
};

var parseStackParams = (function (attachments, tab) {
  var fields = {};
  if (!attachments || !attachments.length) return;
  attachments.forEach(function (i) {
    Object.keys(i.params).forEach(function (key) {
      var _i$params$tab$value, _i$params$tab$key;

      if (tab && ((_i$params$tab$value = i.params[tab.value]) === null || _i$params$tab$value === void 0 ? void 0 : _i$params$tab$value.type) !== 'tab' && ((_i$params$tab$key = i.params[tab.key]) === null || _i$params$tab$key === void 0 ? void 0 : _i$params$tab$key.title) !== tab.value) return;
      if (i.params[key] instanceof Object) return;
      if (fields[key]) fields[key].options.push(i.params[key]);else fields[key] = {
        options: [i.params[key]]
      };
    });
  });
  Object.keys(fields).forEach(function (key) {
    fields[key].options = lodashEs.uniq(fields[key].options);
    fields[key].label = key;

    if (typeof fields[key].options[0] === 'string') {
      fields[key].type = 'select';
      fields[key].options = fields[key].options.filter(function (a, b) {
        return fields[key].options.indexOf(a) === b;
      }).map(function (i) {
        return {
          label: i,
          value: i
        };
      });
    }

    if (typeof fields[key].options[0] === 'boolean') {
      fields[key].type = 'checkbox';
    }

    if (typeof fields[key].options[0] === 'number') {
      var options = fields[key].options;
      fields[key].type = 'slider';
      fields[key].min = Math.min.apply(null, options);
      fields[key].max = Math.max.apply(null, options);
      fields[key].options = {};
      options.filter(function (a, b) {
        return options.indexOf(a) === b;
      }).forEach(function (i) {
        return fields[key].options[i] = i;
      });
    }
  });
  return fields;
});

var parseStackTabs = (function (attachments) {
  var tabs = [];
  if (!attachments || !attachments.length) return [];
  attachments.forEach(function (i) {
    Object.keys(i.params).forEach(function (key) {
      if (i.params[key] instanceof Object && i.params[key].type === 'tab') {
        var tab = i.params[key].title || key;
        if (!tabs.find(function (i) {
          return i.value === tab;
        })) tabs.push({
          label: tab,
          value: tab,
          key: key
        });
      }
    });
  });
  return tabs;
});

var getFormattedDuration = (function (duration) {
  if (duration < 1000) return '0sec';
  var string = '';
  var momentDuration = moment.duration(duration);
  var hours = momentDuration.hours();
  var minutes = momentDuration.minutes();
  var seconds = momentDuration.seconds();
  if (hours) string += moment.duration(hours, 'hours').as('hours') + "h";
  if (minutes) string += " " + moment.duration(minutes, 'minutes').as('minutes') + "min";
  if (seconds) string += " " + moment.duration(seconds, 'seconds').asSeconds() + "sec";
  return string;
});

var getStackCategory = (function (_ref) {
  var application = _ref.application,
      contentType = _ref.contentType;

  switch (true) {
    case contentType === 'image/svg+xml':
    case contentType === 'image/png':
    case contentType === 'image/jpeg':
    case application === 'plotly':
    case application === 'bokeh':
      return 'chart';

    case contentType === 'text/csv':
      return 'table';

    case application === 'sklearn':
    case /^tensorflow\/*/.test(application):
    case /^torch\/*/.test(application):
      return 'mlModel';

    case application === 'application/python' && contentType === 'application/octet-stream':
      return 'app';

    default:
      return null;
  }
});

var fileToBase64 = function fileToBase64(file) {
  try {
    return Promise.resolve(new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = function () {
        return resolve(reader.result.split(',')[1]);
      };

      reader.onerror = function (error) {
        return reject(error);
      };
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};

// A type of promise-like that resolves synchronously and supports only one observer

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

var config = {
  DOCS_URL: 'http://docs.dstack.ai',
  LOGIN_URL: '/users/login',
  VERIFY_EMAIL_URL: '/users/verify',
  SUPPORT_URL: '/support/submit',
  SIGN_UP_URL: '/users/register',
  RESET_PASSWORD_URL: '/users/reset',
  UPDATE_PASSWORD_URL: '/users/update/password',
  ADMIN_USERS_LIST: '/users/admin/list',
  ADMIN_USERS_CREATE: '/users/admin/create',
  ADMIN_USERS_EDIT: '/users/admin/edit',
  ADMIN_USERS_DELETE: '/users/admin/delete',
  ADMIN_USERS_RESET: '/users/admin/reset',
  USER_DATA_URL: '/users/remember',
  CONFIG_INFO_URL: '/config/info',
  UPDATE_TOKEN_URL: '/users/update/token',
  UPDATE_SETTINGS_URL: '/users/update/settings',
  CHECK_USER: function CHECK_USER(userName) {
    return "/users/exists/" + userName;
  },
  STACKS_LIST: function STACKS_LIST(userName) {
    return "/stacks/" + userName;
  },
  DELETE_STACK: function DELETE_STACK() {
    return '/stacks/delete';
  },
  STACK_DETAILS: function STACK_DETAILS(userName, stack) {
    return "/stacks/" + userName + "/" + stack;
  },
  STACK_FRAME: function STACK_FRAME(userName, stack, frameId) {
    return "/frames/" + userName + "/" + stack + "/" + frameId;
  },
  STACK_ATTACHMENT: function STACK_ATTACHMENT(stack, frameId, id) {
    return "/attachs/" + stack + "/" + frameId + "/" + id;
  },
  STACK_UPDATE: '/stacks/update',
  STACK_PUSH: '/stacks/push',
  APPS_EXECUTE: '/apps/execute',
  APPS_POLL: '/apps/poll',
  DASHBOARD_LIST: function DASHBOARD_LIST(userName) {
    return "/dashboards/" + userName;
  },
  DASHBOARD_DETAILS: function DASHBOARD_DETAILS(userName, id) {
    return "/dashboards/" + userName + "/" + id;
  },
  DASHBOARD_CREATE: '/dashboards/create',
  DASHBOARD_UPDATE: '/dashboards/update',
  DASHBOARD_DELETE: '/dashboards/delete',
  DASHBOARD_CARDS_INSERT: '/dashboards/cards/insert',
  DASHBOARD_CARDS_UPDATE: '/dashboards/cards/update',
  DASHBOARD_CARDS_DELETE: '/dashboards/cards/delete',
  JOB_LIST: function JOB_LIST(userName) {
    return "/jobs/" + userName;
  },
  JOB_DETAILS: function JOB_DETAILS(userName, id) {
    return "/jobs/" + userName + "/" + id;
  },
  JOB_CREATE: '/jobs/create',
  JOB_UPDATE: '/jobs/update',
  JOB_DELETE: '/jobs/delete',
  JOB_RUN: '/jobs/run',
  JOB_STOP: '/jobs/stop',
  PERMISSIONS_ADD: '/permissions/add',
  PERMISSIONS_DELETE: '/permissions/delete',
  DISCORD_URL: 'https://discord.gg/8xfhEYa',
  TWITTER_URL: 'https://twitter.com/dstackai',
  GITHUB_URL: 'https://github.com/dstackai',
  BLOG_URL: 'https://blog.dstack.ai',
  TOKEN_STORAGE_KEY: 'token'
};

var fetcher = function fetcher(url, responseDataFormat) {
  if (responseDataFormat === void 0) {
    responseDataFormat = function responseDataFormat(data) {
      return data;
    };
  }

  try {
    var token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    return Promise.resolve(_catch(function () {
      return Promise.resolve(axios({
        url: url,
        headers: {
          Authorization: token ? "Bearer " + token : ''
        }
      })).then(function (request) {
        return responseDataFormat(request.data);
      });
    }, function (e) {
      var errorBody = null;
      var status = null;

      try {
        errorBody = JSON.parse(lodashEs.get(e, 'request.response'));
      } catch (e) {
        console.log(e);
      }

      try {
        status = lodashEs.get(e, 'request.status');
      } catch (e) {
        console.log(e);
      }

      var error = new Error('An error occurred while fetching the data.');
      error.info = errorBody;
      error.status = status;
      throw error;
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};

var typeMap = {
  'TextFieldView': 'text',
  'LongTextFieldView': 'textarea',
  'ComboBoxView': 'select',
  'SliderView': 'slider',
  'CheckBoxView': 'checkbox',
  'ApplyView': 'apply'
};
var parseStackViews = (function (views) {
  var fields = {};
  views.forEach(function (view, index) {
    fields[index] = {
      label: view.label,
      type: typeMap[(view["long"] ? 'Long' : '') + view.type],
      value: view.data,
      disabled: !view.enabled
    };
    if (view.type === 'CheckBoxView') fields[index].value = view.selected;

    if (view.type === 'ComboBoxView') {
      fields[index].options = view.titles.map(function (title, i) {
        return {
          label: title,
          value: i
        };
      });
      fields[index].value = view.selected;
      fields[index].multiple = view.multiple;
    }

    if (view.type === 'SliderView') {
      fields[index].options = {};
      view.data.forEach(function (item) {
        return fields[index].options[item] = item;
      });
      fields[index].min = Math.min.apply(null, view.data);
      fields[index].max = Math.max.apply(null, view.data);
      fields[index].value = view.data[view.selected];
    }
  });
  return fields;
});

var isSignedIn = function isSignedIn() {
  var token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
  return Boolean(token && token.length);
};

exports.dataFetcher = fetcher;
exports.downloadFile = downloadFile;
exports.fileToBaseTo64 = fileToBase64;
exports.formatBytes = formatBytes;
exports.getDataFailedRequest = getDataFailedRequest;
exports.getFormattedDuration = getFormattedDuration;
exports.getStackCategory = getStackCategory;
exports.isSignedIn = isSignedIn;
exports.parseSearch = parseSearch;
exports.parseStackParams = parseStackParams;
exports.parseStackTabs = parseStackTabs;
exports.parseStackViews = parseStackViews;
exports.unicodeBase64Decode = unicodeBase64Decode;
//# sourceMappingURL=utils.js.map
