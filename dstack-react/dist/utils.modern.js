import { get, uniq } from 'lodash-es';
import moment from 'moment';
import axios from 'axios';

const parseSearch = searchString => {
  const search = searchString.substring(1);
  let params = {};
  if (!search.length) return params;

  try {
    params = JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  } catch (e) {
    params = {};
  }

  return params;
};

const getDataFailedRequest = responseError => {
  let error = 'Unknown error';

  try {
    error = JSON.parse(get(responseError, 'request.response')).message;
  } catch (e) {
    console.log(error, e);
  }

  const requestStatus = get(responseError, 'request.status');

  return {
    error,
    requestStatus
  };
};

const unicodeBase64Decode = text => {
  try {
    const decodeData = window.atob(text);
    return decodeURIComponent(Array.prototype.map.call(decodeData, c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return null;
  }
};

const formatBytes = (bytes, decimals) => {
  if (bytes === 0) return '0 Bytes';
  let k = 1024;
  let dm = decimals <= 0 ? 0 : decimals || 2;
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const downloadFile = ({
  url,
  blob,
  type,
  fileName
}) => {
  if (blob) {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([blob]));
    link.setAttribute('target', '_blank');
    link.setAttribute('download', fileName);
    link.setAttribute('type', type);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }

  if (url) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('target', '_blank');
    link.setAttribute('download', true);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }
};

var parseStackParams = ((attachments, tab) => {
  const fields = {};
  if (!attachments || !attachments.length) return;
  attachments.forEach(i => {
    Object.keys(i.params).forEach(key => {
      var _i$params$tab$value, _i$params$tab$key;

      if (tab && ((_i$params$tab$value = i.params[tab.value]) === null || _i$params$tab$value === void 0 ? void 0 : _i$params$tab$value.type) !== 'tab' && ((_i$params$tab$key = i.params[tab.key]) === null || _i$params$tab$key === void 0 ? void 0 : _i$params$tab$key.title) !== tab.value) return;
      if (i.params[key] instanceof Object) return;
      if (fields[key]) fields[key].options.push(i.params[key]);else fields[key] = {
        options: [i.params[key]]
      };
    });
  });
  Object.keys(fields).forEach(key => {
    fields[key].options = uniq(fields[key].options);
    fields[key].label = key;

    if (typeof fields[key].options[0] === 'string') {
      fields[key].type = 'select';
      fields[key].options = fields[key].options.filter((a, b) => fields[key].options.indexOf(a) === b).map(i => ({
        label: i,
        value: i
      }));
    }

    if (typeof fields[key].options[0] === 'boolean') {
      fields[key].type = 'checkbox';
    }

    if (typeof fields[key].options[0] === 'number') {
      const options = fields[key].options;
      fields[key].type = 'slider';
      fields[key].min = Math.min.apply(null, options);
      fields[key].max = Math.max.apply(null, options);
      fields[key].options = {};
      options.filter((a, b) => options.indexOf(a) === b).forEach(i => fields[key].options[i] = i);
    }
  });
  return fields;
});

var parseStackTabs = (attachments => {
  const tabs = [];
  if (!attachments || !attachments.length) return [];
  attachments.forEach(i => {
    Object.keys(i.params).forEach(key => {
      if (i.params[key] instanceof Object && i.params[key].type === 'tab') {
        const tab = i.params[key].title || key;
        if (!tabs.find(i => i.value === tab)) tabs.push({
          label: tab,
          value: tab,
          key
        });
      }
    });
  });
  return tabs;
});

var getFormattedDuration = (duration => {
  if (duration < 1000) return '0sec';
  let string = '';
  const momentDuration = moment.duration(duration);
  const hours = momentDuration.hours();
  const minutes = momentDuration.minutes();
  const seconds = momentDuration.seconds();
  if (hours) string += `${moment.duration(hours, 'hours').as('hours')}h`;
  if (minutes) string += ` ${moment.duration(minutes, 'minutes').as('minutes')}min`;
  if (seconds) string += ` ${moment.duration(seconds, 'seconds').asSeconds()}sec`;
  return string;
});

var getStackCategory = (({
  application,
  contentType
}) => {
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

const fileToBase64 = async file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => resolve(reader.result.split(',')[1]);

  reader.onerror = error => reject(error);
});

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
  CHECK_USER: userName => `/users/exists/${userName}`,
  STACK_LIST: '/stacks',
  USER_STACK_LIST: userName => `/stacks/${userName}`,
  DELETE_STACK: () => '/stacks/delete',
  STACK_DETAILS: (userName, stack) => `/stacks/${userName}/${stack}`,
  STACK_FRAME: (userName, stack, frameId) => `/frames/${userName}/${stack}/${frameId}`,
  STACK_ATTACHMENT: (stack, frameId, id) => `/attachs/${stack}/${frameId}/${id}`,
  STACK_UPDATE: '/stacks/update',
  STACK_PUSH: '/stacks/push',
  APPS_EXECUTE: '/apps/execute',
  APPS_POLL: '/apps/poll',
  DASHBOARD_LIST: userName => `/dashboards/${userName}`,
  DASHBOARD_DETAILS: (userName, id) => `/dashboards/${userName}/${id}`,
  DASHBOARD_CREATE: '/dashboards/create',
  DASHBOARD_UPDATE: '/dashboards/update',
  DASHBOARD_DELETE: '/dashboards/delete',
  DASHBOARD_CARDS_INSERT: '/dashboards/cards/insert',
  DASHBOARD_CARDS_UPDATE: '/dashboards/cards/update',
  DASHBOARD_CARDS_DELETE: '/dashboards/cards/delete',
  JOB_LIST: userName => `/jobs/${userName}`,
  JOB_DETAILS: (userName, id) => `/jobs/${userName}/${id}`,
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

const fetcher = async (url, responseDataFormat = data => data) => {
  const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);

  try {
    const request = await axios({
      url: url,
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    return responseDataFormat(request.data);
  } catch (e) {
    let errorBody = null;
    let status = null;

    try {
      errorBody = JSON.parse(get(e, 'request.response'));
    } catch (e) {
      console.log(e);
    }

    try {
      status = get(e, 'request.status');
    } catch (e) {
      console.log(e);
    }

    const error = new Error('An error occurred while fetching the data.');
    error.info = errorBody;
    error.status = status;
    throw error;
  }
};

const typeMap = {
  'TextFieldView': 'text',
  'LongTextFieldView': 'textarea',
  'ComboBoxView': 'select',
  'SliderView': 'slider',
  'CheckBoxView': 'checkbox',
  'ApplyView': 'apply'
};
var parseStackViews = (views => {
  if (!views || !Array.isArray(views)) return {};
  const fields = {};
  views.forEach((view, index) => {
    fields[index] = {
      label: view.label,
      type: typeMap[(view.long ? 'Long' : '') + view.type],
      value: view.data,
      disabled: !view.enabled
    };
    if (view.type === 'CheckBoxView') fields[index].value = view.selected;

    if (view.type === 'ComboBoxView') {
      fields[index].options = view.titles.map((title, i) => ({
        label: title,
        value: i
      }));
      fields[index].value = view.selected;
      fields[index].multiple = view.multiple;
    }

    if (view.type === 'SliderView') {
      fields[index].options = {};
      view.data.forEach(item => fields[index].options[item] = item);
      fields[index].min = Math.min.apply(null, view.data);
      fields[index].max = Math.max.apply(null, view.data);
      fields[index].value = view.data[view.selected];
    }
  });
  return fields;
});

const isSignedIn = () => {
  const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
  return Boolean(token && token.length);
};

export { fetcher as dataFetcher, downloadFile, fileToBase64 as fileToBaseTo64, formatBytes, getDataFailedRequest, getFormattedDuration, getStackCategory, isSignedIn, parseSearch, parseStackParams, parseStackTabs, parseStackViews, unicodeBase64Decode };
//# sourceMappingURL=utils.modern.js.map
