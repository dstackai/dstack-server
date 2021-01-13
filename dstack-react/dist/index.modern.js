import React__default, { createContext, useReducer, useContext, createElement, forwardRef, useState, useRef, useEffect, useImperativeHandle, memo, useCallback, useMemo, Fragment, Component } from 'react';
import axios from 'axios';
import { get, uniq, isEqual, isString, debounce } from 'lodash-es';
import cx from 'classnames';
import Highlight from 'react-highlight.js';
import { useTranslation, Trans } from 'react-i18next';
import copy from 'copy-to-clipboard';
import RcTooltip from 'rc-tooltip';
import moment from 'moment';
import ReactMarkdown from 'react-markdown';
import MathJax from 'react-mathjax';
import RemarkMathPlugin from 'remark-math';
import { Portal } from 'react-portal';
import Select, { Option, OptGroup } from 'rc-select';
import Slider from 'rc-slider';
import Plot from 'react-plotly.js';
import { parse } from 'csv-string';
import { Link, useParams, useHistory, Switch, Route } from 'react-router-dom';
import { useDebounce as useDebounce$1, usePrevious as usePrevious$1 } from 'react-use';
import { v4 } from 'uuid';
import useSWR from 'swr';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-r';
import 'prismjs/themes/prism.css';
import { useDrag, useDrop } from 'react-dnd';
export { DndProvider } from 'react-dnd';

var actionsTypes = {
  FETCH_CURRENT_USER: 'app/user/FETCH',
  FETCH_CURRENT_USER_SUCCESS: 'app/user/FETCH_SUCCESS',
  FETCH_CURRENT_USER_FAIL: 'app/user/FETCH_FAIL',
  FETCH_CONFIG_INFO: 'app/config/FETCH',
  FETCH_CONFIG_INFO_SUCCESS: 'app/config/FETCH_SUCCESS',
  FETCH_CONFIG_INFO_FAIL: 'app/config/FETCH_FAIL',
  START_PROGRESS: 'app/START_PROGRESS',
  SET_PROGRESS: 'app/SET_PROGRESS',
  COMPLETE_PROGRESS: 'app/COMPLETE_PROGRESS',
  RESET_PROGRESS: 'app/RESET_PROGRESS'
};

const initialState = {
  currentUser: {
    loading: false,
    data: null
  },
  configInfo: {
    loading: false,
    data: null
  },
  appProgress: {
    active: null,
    value: null
  }
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionsTypes.FETCH_CURRENT_USER:
      return { ...state,
        currentUser: { ...state.currentUser,
          loading: true
        }
      };

    case actionsTypes.FETCH_CURRENT_USER_SUCCESS:
      return { ...state,
        currentUser: { ...state.currentUser,
          data: action.payload,
          loading: false
        }
      };

    case actionsTypes.FETCH_CURRENT_USER_FAIL:
      return { ...state,
        currentUser: { ...state.currentUser,
          loading: false
        }
      };

    case actionsTypes.FETCH_CONFIG_INFO:
      return { ...state,
        configInfo: { ...state.configInfo,
          loading: true
        }
      };

    case actionsTypes.FETCH_CONFIG_INFO_SUCCESS:
      return { ...state,
        configInfo: { ...state.configInfo,
          data: action.payload,
          loading: false
        }
      };

    case actionsTypes.FETCH_CONFIG_INFO_FAIL:
      return { ...state,
        configInfo: { ...state.configInfo,
          loading: false
        }
      };

    case actionsTypes.START_PROGRESS:
      return { ...state,
        appProgress: { ...state.appProgress,
          active: true,
          value: null
        }
      };

    case actionsTypes.SET_PROGRESS:
      return { ...state,
        appProgress: { ...state.appProgress,
          value: action.payload
        }
      };

    case actionsTypes.COMPLETE_PROGRESS:
      return { ...state,
        appProgress: { ...state.appProgress,
          active: false,
          value: null
        }
      };

    case actionsTypes.RESET_PROGRESS:
      return { ...state,
        appProgress: { ...state.appProgress,
          active: null,
          value: null
        }
      };

    default:
      return state;
  }
};
const StateContext = createContext();
const AppStoreProvider = ({
  children,
  apiUrl
}) => /*#__PURE__*/React__default.createElement(StateContext.Provider, {
  value: useReducer(reducer, { ...initialState,
    apiUrl
  })
}, children);
const useAppStore = () => useContext(StateContext);

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
const reportModelPythonCode = `import dstack as ds
from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
model.fit(X_train, y_train)

ds.push("my_model", model, "My first linear model")`;
const reportPlotPythonCode = `import matplotlib.pyplot as plt
import dstack as ds

fig = plt.figure()
plt.plot([1, 2, 3, 4], [1, 4, 9, 16])

ds.push_frame("my_plot", fig, "My first plot")`;

const apiFabric = ({
  apiUrl
} = {}) => {
  const CancelToken = axios.CancelToken;
  const instance = axios.create({
    baseURL: apiUrl,
    crossDomain: true
  });
  instance.cancelToken = CancelToken;
  instance.interceptors.request.use(requestConfig => {
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    requestConfig.headers.Authorization = token ? `Bearer ${token}` : '';
    return requestConfig;
  });
  instance.interceptors.response.use(response => {
    return response;
  }, error => {
    if (get(error, 'response.status', null) === 401) {
      return Promise.reject(error.response);
    } else if (get(error, 'response.status', null) === 400) {
      return Promise.reject(error.response);
    } else {
      return Promise.reject(error);
    }
  });
  return instance;
};

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var _ref = /*#__PURE__*/createElement("rect", {
  x: 17.023,
  y: 5.294,
  width: 51.377,
  height: 70.558,
  rx: 25.689,
  stroke: "#CFAEE1",
  strokeWidth: 10
});

var _ref2 = /*#__PURE__*/createElement("rect", {
  x: 0.516,
  y: 42.057,
  width: 84.394,
  height: 61.377,
  rx: 10,
  fill: "#E9CAFA"
});

var _ref3 = /*#__PURE__*/createElement("g", {
  opacity: 0.3,
  fill: "#BB77DF"
}, /*#__PURE__*/createElement("rect", {
  x: 38.877,
  y: 63.206,
  width: 7.672,
  height: 16.879,
  rx: 3.836
}), /*#__PURE__*/createElement("rect", {
  x: 35.808,
  y: 72.412,
  width: 13.81,
  height: 13.81,
  rx: 6.905
}));

function SvgLock(props) {
  return /*#__PURE__*/createElement("svg", _extends({
    width: 85,
    height: 104,
    viewBox: "0 0 85 104",
    fill: "none"
  }, props), _ref, _ref2, _ref3);
}

var css = {"forbidden":"_style-module__forbidden__3PN84","message":"_style-module__message__2i8KH"};

const AccessForbidden = ({
  children
}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css.forbidden
  }, /*#__PURE__*/React__default.createElement(SvgLock, {
    alt: "",
    width: "85",
    height: "104"
  }), children && /*#__PURE__*/React__default.createElement("div", {
    className: css.message
  }, children));
};

var css$1 = {"avatar":"_styles-module__avatar__3xvkT"};

const Avatar = forwardRef(({
  className,
  name,
  color: _color = 'violet',
  size: _size = 'normal',
  withBorder,
  onClick
}, ref) => {
  return /*#__PURE__*/React__default.createElement("div", {
    ref: ref,
    className: cx(css$1.avatar, className, _color, _size, {
      border: withBorder
    }),
    onClick: onClick
  }, name.slice(0, 2));
});

var css$2 = {"back":"_styles-module__back__1MuhU","children":"_styles-module__children__3cJ8S"};

const BackButton = ({
  Component: _Component = 'button',
  children,
  className,
  ...props
}) => {
  return /*#__PURE__*/React__default.createElement(_Component, Object.assign({
    className: cx(css$2.back, className)
  }, props), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-arrow-left"
  }), children && /*#__PURE__*/React__default.createElement("span", {
    className: css$2.children
  }, children));
};

var css$3 = {"button":"_style-module__button__2lKoS","spinner":"_style-module__spinner__31PPt"};

var css$4 = {"spinner":"_styles-module__spinner__3XhrC","spinner-animation":"_styles-module__spinner-animation__2UA3s"};

const COLORS = {
  white: '#fff',
  blue: '#507CD0'
};

const Spinner = ({
  size: _size = 22,
  color: _color = 'white',
  isShown,
  className,
  align
}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$4.spinner, className, align, {
      show: isShown
    })
  }, /*#__PURE__*/React__default.createElement("svg", {
    width: _size,
    height: _size,
    viewBox: "0 0 22 22",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React__default.createElement("path", {
    d: "M11.7046 18.9689C13.3618 18.8224 14.9321 18.1628 16.1969 17.0821C17.4617 16.0014 18.3581 14.5532 18.7614 12.9392C19.1647 11.3252 19.0548 9.62557 18.4469 8.07695C17.839 6.52832 16.7635 5.20773 15.37 4.29897C13.9765 3.39021 12.3343 2.9385 10.672 3.00671C9.00979 3.07491 7.41015 3.65964 6.09577 4.67951C4.78139 5.69938 3.81766 7.10365 3.33871 8.69687C2.85976 10.2901 2.88943 11.993 3.42358 13.5686L5.19569 12.9678C4.78648 11.7607 4.76375 10.4561 5.13067 9.23556C5.4976 8.01499 6.23591 6.93918 7.24286 6.15785C8.24981 5.37653 9.4753 4.92857 10.7488 4.87632C12.0222 4.82406 13.2803 5.17012 14.3478 5.86632C15.4154 6.56253 16.2394 7.57423 16.7051 8.76064C17.1708 9.94704 17.255 11.2491 16.946 12.4856C16.6371 13.7221 15.9503 14.8316 14.9814 15.6595C14.0124 16.4875 12.8094 16.9927 11.5398 17.105L11.7046 18.9689Z",
    fill: "url(#paint0_linear)"
  }), /*#__PURE__*/React__default.createElement("defs", null, /*#__PURE__*/React__default.createElement("linearGradient", {
    id: "paint0_linear",
    x1: "13.5",
    y1: "18",
    x2: "4",
    y2: "13",
    gradientUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React__default.createElement("stop", {
    stopColor: COLORS[_color]
  }), /*#__PURE__*/React__default.createElement("stop", {
    offset: "1",
    stopColor: COLORS[_color],
    stopOpacity: "0.2"
  })))));
};

const Button = forwardRef(({
  Component: _Component = 'button',
  children,
  className,
  size: _size = 'normal',
  color: _color = 'default',
  variant: _variant = 'default',
  fullWidth: _fullWidth = false,
  isShowSpinner,
  ...props
}, ref) => {
  return /*#__PURE__*/React__default.createElement(_Component, Object.assign({
    ref: ref,
    className: cx(css$3.button, _size, `color-${_color}`, `variant-${_variant}`, className, {
      'full-width': _fullWidth
    })
  }, props), isShowSpinner && /*#__PURE__*/React__default.createElement(Spinner, {
    className: css$3.spinner,
    color: "white",
    isShown: true
  }), children);
});

var css$5 = {"checkbox":"_styles-module__checkbox__3lqFk","toggle-label":"_styles-module__toggle-label__1aLAG","label":"_styles-module__label__2PZb-","wrapper":"_styles-module__wrapper__2Vufp","mark":"_styles-module__mark__2Pb2f"};

const CheckboxField = ({
  className,
  value,
  disabled,
  appearance: _appearance = 'checkbox',
  align: _align = 'left',
  label,
  onLabel,
  offLabel,
  children,
  ...props
}) => {
  return /*#__PURE__*/React__default.createElement("label", {
    className: cx(css$5.checkbox, className, _appearance, _align, {
      disabled
    })
  }, /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("input", Object.assign({
    type: "checkbox",
    checked: value
  }, props)), offLabel && /*#__PURE__*/React__default.createElement("span", {
    className: cx(css$5['toggle-label'], 'off'),
    dangerouslySetInnerHTML: {
      __html: offLabel
    }
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$5.wrapper
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$5.mark, 'mdi', 'mdi-check', {
      'toggle-color': !(onLabel && offLabel)
    })
  })), onLabel && /*#__PURE__*/React__default.createElement("span", {
    className: cx(css$5['toggle-label'], 'on'),
    dangerouslySetInnerHTML: {
      __html: onLabel
    }
  }), label && /*#__PURE__*/React__default.createElement("span", {
    className: css$5.label
  }, label)), children);
};

var css$6 = {"copy":"_styles-module__copy__3J5hd","message":"_styles-module__message__3RWnQ","button":"_styles-module__button__2YqEb","icon":"_styles-module__icon__25GMO","margin":"_styles-module__margin__3W0rA"};

const Copy = ({
  children,
  className,
  copyText,
  successMessage,
  buttonTitle
}) => {
  const {
    t
  } = useTranslation();
  const [isShowMessage, setIsShowMessage] = useState(false);

  const onCLick = () => {
    copy(copyText);
    setIsShowMessage(true);
    setTimeout(() => setIsShowMessage(false), 3000);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$6.copy, className)
  }, children ? children({
    onClick: onCLick
  }) : /*#__PURE__*/React__default.createElement("div", {
    className: css$6.button,
    onClick: onCLick
  }, /*#__PURE__*/React__default.createElement("span", {
    className: cx(css$6.icon, {
      [css$6.margin]: buttonTitle !== null
    }, 'mdi mdi-content-copy')
  }), buttonTitle && buttonTitle, buttonTitle === undefined && t('copy')), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$6.message, {
      'is-show': isShowMessage
    })
  }, successMessage ? successMessage : t('copied')));
};

var css$7 = {"code":"_styles-module__code__3gARj","copy":"_styles-module__copy__m44gX","icon":"_styles-module__icon__ZmZbg"};

const CodeViewer = ({
  className,
  language,
  children,
  fontSize
}) => {
  const {
    t
  } = useTranslation();
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$7.code, className, fontSize && `font-size-${fontSize}`)
  }, /*#__PURE__*/React__default.createElement(Highlight, {
    language: language
  }, children), /*#__PURE__*/React__default.createElement(Copy, {
    className: css$7.copy,
    copyText: children,
    successMessage: t('snippetIsCopied')
  }));
};

var css$8 = {"dropdown":"_styles-module__dropdown__1qRCw","button":"_styles-module__button__fzNEm","menu":"_styles-module__menu__AJ1Y3","item":"_styles-module__item__3lbfY"};

const Dropdown = ({
  className,
  buttonClassName,
  children,
  items
}) => {
  const [isShow, setIsShow] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  useEffect(() => {
    document.body.addEventListener('click', outlineClickHandle);
    return () => document.body.removeEventListener('click', outlineClickHandle);
  });

  const outlineClickHandle = event => {
    let targetElement = event.target;

    do {
      if (targetElement === buttonRef.current || targetElement === dropdownRef.current) return;
      targetElement = targetElement.parentNode;
    } while (targetElement);

    if (isShow) setIsShow(false);
  };

  const onCLickButton = event => {
    clickStopPropagation(event);
    setIsShow(!isShow);
  };

  const clickStopPropagation = event => {
    event.stopPropagation();
    event.preventDefault();
  };

  const onCLickItem = item => () => {
    setIsShow(!isShow);
    if (item.onClick) item.onClick();
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$8.dropdown, className, {
      active: isShow
    })
  }, /*#__PURE__*/React__default.createElement(RcTooltip, {
    arrowContent: null,
    visible: isShow,
    placement: "bottomRight",
    destroyTooltipOnHide: true,
    align: {
      offset: [0, 0]
    },
    overlay: /*#__PURE__*/React__default.createElement("div", {
      className: cx(css$8.menu, 'show'),
      ref: dropdownRef,
      onClick: clickStopPropagation
    }, items.map((i, index) => /*#__PURE__*/React__default.createElement("div", {
      key: index,
      className: css$8.item,
      onClick: onCLickItem(i)
    }, i.title)))
  }, children ? React__default.cloneElement(children, {
    onClick: onCLickButton,
    ref: buttonRef
  }) : /*#__PURE__*/React__default.createElement("div", {
    ref: buttonRef,
    className: cx(css$8.button, buttonClassName),
    onClick: onCLickButton
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-dots-vertical"
  }))));
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

var css$9 = {"dnd":"_style-module__dnd__3uYii","fileWrapper":"_style-module__fileWrapper__1GUx_","file":"_style-module__file__2LG6L","fileExtend":"_style-module__fileExtend__3w6--","fileSection":"_style-module__fileSection__B8y5t","fileName":"_style-module__fileName__3Juxo","fileSize":"_style-module__fileSize__3G6N8","fileRemove":"_style-module__fileRemove__16dzP","placeholder":"_style-module__placeholder__Wr_Zp","button":"_style-module__button__14ku1","loading":"_style-module__loading__2KndP","progressBar":"_style-module__progressBar__DHbC1","progress":"_style-module__progress__2-dth","animate-stripes":"_style-module__animate-stripes__1Iecq"};

const FileDragnDrop = ({
  formats,
  className,
  loading,
  progressPercent: _progressPercent = null,
  onChange
}, ref) => {
  const {
    t
  } = useTranslation();
  const inputRef = useRef(null);
  const [active, setActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const isDidMount = useRef(true);
  useImperativeHandle(ref, () => ({
    clear: () => removeFile()
  }));
  useEffect(() => {
    if (!isDidMount.current) {
      if (onChange) onChange(selectedFile);
    } else isDidMount.current = false;
  }, [selectedFile]);

  const onClick = event => {
    event.preventDefault();
    if (inputRef.current) inputRef.current.click();
  };

  const preventStop = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = event => {
    preventStop(event);
    setActive(false);
    const [file] = event.dataTransfer.files;
    if (file && checkAvailableExtension(file)) setSelectedFile(file);
  };

  const onDragEnter = event => {
    preventStop(event);
    setActive(true);
  };

  const onDragLeave = event => {
    preventStop(event);
    setActive(false);
  };

  const onChangeInput = event => {
    const [file] = event.target.files;
    if (file && checkAvailableExtension(file)) setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const checkAvailableExtension = file => {
    const ext = '.' + file.name.split('.').pop();
    let isAvailable;
    if (formats && formats.length) isAvailable = formats.some(format => {
      if (format === '.jpg' || format === '.jpeg') return ext === '.jpg' || ext === '.jpeg';else return format === ext;
    });else isAvailable = true;
    return isAvailable;
  };

  if (loading) return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$9.dnd, className, {
      active
    })
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$9.loading
  }, t('Uploading'), "\u2026", typeof _progressPercent === 'number' && `${_progressPercent}%`), typeof _progressPercent === 'number' && /*#__PURE__*/React__default.createElement("div", {
    className: css$9.progressBar
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$9.progress,
    style: {
      width: `${_progressPercent}%`
    }
  })));
  if (selectedFile) return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$9.fileWrapper, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$9.file
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$9.fileExtend
  }, selectedFile.name.split('.').pop()), /*#__PURE__*/React__default.createElement("div", {
    className: css$9.fileSection
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$9.fileName
  }, selectedFile.name), /*#__PURE__*/React__default.createElement("div", {
    className: css$9.fileSize
  }, formatBytes(selectedFile.size))), /*#__PURE__*/React__default.createElement("div", {
    onClick: removeFile,
    className: cx(css$9.fileRemove, 'mdi mdi-close')
  })));
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$9.dnd, className, {
      active
    }),
    onDrop: onDrop,
    onDragEnter: onDragEnter,
    onDragOver: onDragEnter,
    onDragLeave: onDragLeave
  }, /*#__PURE__*/React__default.createElement("input", {
    ref: inputRef,
    onChange: onChangeInput,
    type: "file"
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$9.placeholder
  }, t('dragHereAFile'), '', Boolean(formats) && `(${formats.join(', ')})`, ' ', t('or'), ' '), /*#__PURE__*/React__default.createElement(Button, {
    className: css$9.button,
    variant: "contained",
    color: "primary",
    size: "small",
    onClick: onClick
  }, t('chooseAFile')));
};

var FileDragnDrop$1 = forwardRef(FileDragnDrop);

var css$a = {"loader":"_styles-module__loader__18_Ho","text":"_styles-module__text__3dZu_","stacks-pulse":"_styles-module__stacks-pulse__350eA","grid":"_styles-module__grid__Uki0v","item":"_styles-module__item__MvjKB","pic":"_styles-module__pic__Pc6fT","section":"_styles-module__section__2EIKh"};

const Loader = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$a.loader
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$a.text
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$a.grid
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$a.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$a.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$a.section
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$a.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$a.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$a.section
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$a.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$a.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$a.section
  }))));
};

const MarkdownRender = props => {
  const newProps = { ...props,
    plugins: [RemarkMathPlugin],
    renderers: { ...props.renderers,
      math: props => /*#__PURE__*/React__default.createElement(MathJax.Node, {
        formula: props.value
      }),
      inlineMath: props => /*#__PURE__*/React__default.createElement(MathJax.Node, {
        inline: true,
        formula: props.value
      })
    }
  };
  return /*#__PURE__*/React__default.createElement(MathJax.Provider, {
    input: "tex"
  }, /*#__PURE__*/React__default.createElement(ReactMarkdown, newProps));
};

var css$b = {"modal":"_styles-module__modal__3FQ59","dialog":"_styles-module__dialog__268e0","close":"_styles-module__close__1Y7yz","title":"_styles-module__title__knxNI"};

const Modal = ({
  title,
  className,
  dialogClassName,
  titleClassName,
  size: _size = 'big',
  onClose,
  isShow,
  children,
  withCloseButton
}) => {
  const onClickByLayer = event => {
    if (event.currentTarget === event.target && onClose) onClose();
  };

  return /*#__PURE__*/React__default.createElement(Portal, null, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$b.modal, className, {
      show: isShow
    }),
    onClick: onClickByLayer
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$b.dialog, _size, dialogClassName)
  }, withCloseButton && /*#__PURE__*/React__default.createElement("span", {
    className: cx(css$b.close, 'mdi mdi-close'),
    onClick: onClose
  }), title && /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$b.title, titleClassName)
  }, title), children)));
};

function _extends$1() {
  _extends$1 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$1.apply(this, arguments);
}

var _ref$1 = /*#__PURE__*/createElement("path", {
  d: "M36.888 47.532V21.244L20.14 47.532h16.748zM35.616 77V63.22H0V48.592L33.496.68h20.246v46.852h8.692V63.22h-8.692V77H35.616zM197.773 47.532V21.244l-16.748 26.288h16.748zM196.501 77V63.22h-35.616V48.592L194.381.68h20.246v46.852h8.692V63.22h-8.692V77h-18.126z",
  fill: "#B4B8C7",
  fillOpacity: 0.6
});

var _ref2$1 = /*#__PURE__*/createElement("path", {
  d: "M150.806 39c0 20.987-17.014 38-38 38-20.987 0-38-17.013-38-38s17.013-38 38-38c20.986 0 38 17.013 38 38zm-60.048 0c0 12.177 9.871 22.048 22.048 22.048 12.176 0 22.047-9.871 22.047-22.048 0-12.177-9.871-22.048-22.047-22.048-12.177 0-22.048 9.871-22.048 22.048z",
  fill: "#89C6FF"
});

var _ref3$1 = /*#__PURE__*/createElement("path", {
  d: "M150.806 39a37.997 37.997 0 01-30.186 37.188l-3.28-15.612A22.047 22.047 0 00134.853 39h15.953z",
  fill: "#D294F2"
});

var _ref4 = /*#__PURE__*/createElement("path", {
  d: "M122.552 75.729a38.002 38.002 0 01-45.98-48.183l15.219 4.81a22.041 22.041 0 0026.667 27.947l4.094 15.426z",
  fill: "#CDF27E"
});

function Svg404(props) {
  return /*#__PURE__*/createElement("svg", _extends$1({
    width: 224,
    height: 77,
    viewBox: "0 0 224 77",
    fill: "none"
  }, props), _ref$1, _ref2$1, _ref3$1, _ref4);
}

var css$c = {"not-found":"_style-module__not-found__tAZyq","message":"_style-module__message__3Ok1U","help":"_style-module__help__Aa8x8"};

const NotFound = ({
  children
}) => {
  const {
    t
  } = useTranslation();
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$c['not-found']
  }, /*#__PURE__*/React__default.createElement(Svg404, {
    width: "224",
    height: "77"
  }), children && /*#__PURE__*/React__default.createElement("div", {
    className: css$c.message
  }, children), /*#__PURE__*/React__default.createElement("div", {
    className: css$c.help
  }, t('needHelpWWriteToUsOn'), ' ', /*#__PURE__*/React__default.createElement("a", {
    target: "_blank",
    href: config.TWITTER_URL
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-twitter"
  }), " Twitter"), ', ', /*#__PURE__*/React__default.createElement("a", {
    target: "_blank",
    href: config.GITHUB_URL
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-github-circle"
  }), "GitHub"), ' ', t('or'), ' ', /*#__PURE__*/React__default.createElement("a", {
    target: "_blank",
    href: config.DISCORD_URL
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-discord"
  }), "Discord")));
};

var usePrevious = (value => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
});

var css$d = {"bar":"_styles-module__bar__12oWc","progress":"_styles-module__progress__3JWjz"};

const ProgressBar = ({
  className,
  isActive,
  progress: globalProgress
}) => {
  const [progress, setProgress] = useState(0);
  const [width, setWidth] = useState(1000);
  const prevIsActive = usePrevious(isActive);
  const step = useRef(0.01);
  const currentProgress = useRef(0);
  const requestFrame = useRef(null);
  const isActiveRef = useRef(false);
  const ref = useRef(null);
  useEffect(() => {
    isActiveRef.current = isActive;

    if (isActive) {
      setProgress(0);
      step.current = 0.01;
      currentProgress.current = 0;
      startCalculateProgress();
    }

    if (prevIsActive === true && isActive === false) {
      setProgress(100);
      setTimeout(() => setProgress(0), 800);
    }

    if (isActive === null) {
      setProgress(0);
    }

    if (!isActive && requestFrame.current) {
      cancelAnimationFrame(requestFrame.current);
    }
  }, [isActive]);
  useEffect(() => {
    if (globalProgress !== null) setProgress(globalProgress);else {
      setProgress(0);
    }
  }, [globalProgress]);
  useEffect(() => {
    window.addEventListener('resize', onResize);
    if (ref.current) setWidth(ref.current.offsetWidth);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const calculateProgress = () => {
    currentProgress.current += step.current;
    const progress = Math.round(Math.atan(currentProgress.current) / (Math.PI / 2) * 100 * 1000) / 1000;
    setProgress(progress);
    if (progress > 70) step.current = 0.005;
    if (progress >= 100 || !isActiveRef.current) cancelAnimationFrame(requestFrame.current);
    if (isActiveRef.current) requestFrame.current = requestAnimationFrame(calculateProgress);
  };

  const startCalculateProgress = () => {
    requestAnimationFrame(calculateProgress);
  };

  const onResize = () => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    ref: ref,
    className: cx(css$d.bar, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$d.progress,
    style: {
      width: `${progress}%`,
      backgroundSize: `${width}px 5px`
    }
  }));
};

var css$e = {"field":"_styles-module__field__3WCaE","input":"_styles-module__input__9Tk5W","label":"_styles-module__label__1mHtq","error":"_styles-module__error__3jOrk"};

const validateValue = value => {
  if (typeof value === 'string' || value) return value;else return '';
};

const TextField = ({
  label,
  className,
  size: _size = 'normal',
  errors: _errors = [],
  value: restValue,
  onChange: restOnChange,
  ...props
}) => {
  const [value, setValue] = useState(() => validateValue(restValue));
  const hasErrors = Boolean(_errors.length);
  useEffect(() => {
    if (restValue !== value) setValue(validateValue(restValue));
  }, [restValue]);

  const onChange = e => {
    setValue(e.target.value);
    if (typeof restOnChange === 'function') restOnChange(e);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$e.field, className, _size, {
      disabled: props.disabled
    })
  }, /*#__PURE__*/React__default.createElement("label", null, label && /*#__PURE__*/React__default.createElement("div", {
    className: css$e.label
  }, label), /*#__PURE__*/React__default.createElement("div", {
    className: css$e.input
  }, /*#__PURE__*/React__default.createElement("input", Object.assign({
    className: cx({
      error: hasErrors
    }),
    value: value,
    onChange: onChange
  }, props))), hasErrors && /*#__PURE__*/React__default.createElement("div", {
    className: css$e.error
  }, _errors.join(', '))));
};

var css$f = {"search":"_styles-module__search__3s1gr","field":"_styles-module__field__17rsB","clear":"_styles-module__clear__3oKZ5","button":"_styles-module__button__3BfRl"};

const SearchField = ({
  className,
  showEverything,
  isDark,
  ...props
}) => {
  const [isShow, setIsShow] = useState(showEverything || props.value && props.value.length);

  const clear = () => {
    if (props.onChange) props.onChange('');
    if (!showEverything) setIsShow(false);
  };

  const onChangeHandle = event => {
    if (props.onChange) props.onChange(event.target.value);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$f.search, className, {
      'is-dark': isDark
    })
  }, isShow && /*#__PURE__*/React__default.createElement(TextField, Object.assign({}, props, {
    onChange: onChangeHandle,
    className: css$f.field
  })), isShow && Boolean(props.value && props.value.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$f.clear,
    onClick: clear
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-close"
  })), isShow && !Boolean(props.value && props.value.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$f.clear
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-magnify"
  })), !isShow && /*#__PURE__*/React__default.createElement("div", {
    className: css$f.button,
    onClick: () => setIsShow(true)
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-magnify"
  })));
};

var css$g = {"field":"_styles-module__field__2jF9E","label":"_styles-module__label__iehEi","error":"_styles-module__error__3bZhg","rcSelectLoadingIcon":"_styles-module__rcSelectLoadingIcon__VtsrG","rcSelectDropdownSlideUpIn":"_styles-module__rcSelectDropdownSlideUpIn__27wr-","rcSelectDropdownSlideUpOut":"_styles-module__rcSelectDropdownSlideUpOut__1QVN6","rcSelectDropdownSlideDownIn":"_styles-module__rcSelectDropdownSlideDownIn__1vYLX","rcSelectDropdownSlideDownOut":"_styles-module__rcSelectDropdownSlideDownOut__1-lNh","select-field":"_styles-module__select-field__1mUh_","select-field-selector":"_styles-module__select-field-selector__V9Ufm","select-field-arrow":"_styles-module__select-field-arrow__c4k8s","mdi":"_styles-module__mdi__2hNDK","select-field-selection-placeholder":"_styles-module__select-field-selection-placeholder__2Vdv0","select-field-selection-search":"_styles-module__select-field-selection-search__3GdNa","select-field-selection-search-input":"_styles-module__select-field-selection-search-input__3BOaB","select-field-selection-item":"_styles-module__select-field-selection-item__2uDu7","select-field-item-option-checkbox":"_styles-module__select-field-item-option-checkbox__2K_G1","select-field-selection-item-remove":"_styles-module__select-field-selection-item-remove__1k1IW","select-field-show-search":"_styles-module__select-field-show-search__3EVnU","select-field-show-arrow":"_styles-module__select-field-show-arrow__1xlmm","select-field-open":"_styles-module__select-field-open___jEZ1","select-field-multiple":"_styles-module__select-field-multiple__2YFSs","select-field-single":"_styles-module__select-field-single__1n3qF","select-field-clear":"_styles-module__select-field-clear__Mg5xq","select-field-item-option-state":"_styles-module__select-field-item-option-state__2yGkG","select-field-selection__choice-zoom":"_styles-module__select-field-selection__choice-zoom__3NUb5","select-field-selection__choice-zoom-appear":"_styles-module__select-field-selection__choice-zoom-appear__ZO73y","select-field-selection__choice-zoom-leave":"_styles-module__select-field-selection__choice-zoom-leave__2i54q","select-field-dropdown":"_styles-module__select-field-dropdown__14ngc"};

const allValue = 'all';

const SelectField = ({
  align: _align = 'left',
  size: _size = 'normal',
  label,
  disabled,
  placeholder,
  value: propValue = [],
  className,
  mode,
  onChange,
  options: _options = [],
  errors: _errors = [],
  showSearch: _showSearch = true,
  ...props
}) => {
  const hasErrors = Boolean(_errors.length);

  const onChangeHandle = value => {
    if (Array.isArray(value) && value.indexOf(allValue) >= 0) if (value.length > _options.length) value = [];else value = _options.map(o => o.value);
    if (onChange) onChange(value);
  };

  const onSelect = () => {};

  const onDeselect = () => {};

  const renderOptions = () => _options.map(({
    value,
    label
  }) => /*#__PURE__*/React__default.createElement(Option, {
    key: value,
    value: value
  }, mode === 'multiple' && /*#__PURE__*/React__default.createElement(CheckboxField, {
    readOnly: true,
    className: "select-field-item-option-checkbox",
    value: propValue.indexOf(value) >= 0
  }), /*#__PURE__*/React__default.createElement("span", {
    className: "select-field-item-option-label"
  }, label)));

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$g.field, className, _size, _align, {
      disabled
    })
  }, /*#__PURE__*/React__default.createElement(Select, Object.assign({
    value: propValue,
    prefixCls: "select-field",
    mode: mode,
    showArrow: true,
    showSearch: _showSearch,
    onSelect: onSelect,
    onDeselect: onDeselect,
    placeholder: placeholder,
    onChange: onChangeHandle,
    inputIcon: /*#__PURE__*/React__default.createElement("span", {
      className: "mdi mdi-chevron-down"
    })
  }, props), _options.length && mode === 'multiple' && /*#__PURE__*/React__default.createElement(Option, {
    key: allValue,
    value: allValue
  }, /*#__PURE__*/React__default.createElement(CheckboxField, {
    readOnly: true,
    className: "select-field-item-option-checkbox",
    value: propValue.length === _options.length
  }), /*#__PURE__*/React__default.createElement("span", {
    className: "select-field-item-option-label"
  }, "Select all")), mode === 'multiple' ? /*#__PURE__*/React__default.createElement(OptGroup, null, renderOptions()) : renderOptions()), label && /*#__PURE__*/React__default.createElement("label", {
    className: css$g.label
  }, label), hasErrors && /*#__PURE__*/React__default.createElement("div", {
    className: css$g.error
  }, _errors.join(', ')));
};

var css$h = {"field":"_styles-module__field__2_NXc","rcSliderTooltipZoomDownIn":"_styles-module__rcSliderTooltipZoomDownIn__2jvao","rcSliderTooltipZoomDownOut":"_styles-module__rcSliderTooltipZoomDownOut__2HgMB","slider":"_styles-module__slider__31Ylv","label":"_styles-module__label__Zo_r8","rc-slider":"_styles-module__rc-slider__1hLjI","rc-slider-rail":"_styles-module__rc-slider-rail__v9bxI","rc-slider-track":"_styles-module__rc-slider-track___3emJ","rc-slider-handle":"_styles-module__rc-slider-handle__12sQ3","rc-slider-handle-dragging":"_styles-module__rc-slider-handle-dragging__2u63-","rc-slider-handle-click-focused":"_styles-module__rc-slider-handle-click-focused__7xSSR","rc-slider-mark":"_styles-module__rc-slider-mark__1l2Qm","rc-slider-mark-text":"_styles-module__rc-slider-mark-text__2zf2c","rc-slider-mark-text-active":"_styles-module__rc-slider-mark-text-active__25tuh","rc-slider-step":"_styles-module__rc-slider-step__3wC_L","rc-slider-dot":"_styles-module__rc-slider-dot__17-SM","rc-slider-dot-active":"_styles-module__rc-slider-dot-active__1eLwY","rc-slider-dot-reverse":"_styles-module__rc-slider-dot-reverse__Ewb1d","rc-slider-disabled":"_styles-module__rc-slider-disabled__1YO43","rc-slider-vertical":"_styles-module__rc-slider-vertical__12Juq","rc-slider-tooltip-zoom-down-enter":"_styles-module__rc-slider-tooltip-zoom-down-enter__2a95b","rc-slider-tooltip-zoom-down-appear":"_styles-module__rc-slider-tooltip-zoom-down-appear__2wvsD","rc-slider-tooltip-zoom-down-leave":"_styles-module__rc-slider-tooltip-zoom-down-leave__3jMC3","rc-slider-tooltip-zoom-down-enter-active":"_styles-module__rc-slider-tooltip-zoom-down-enter-active__1M8Be","rc-slider-tooltip-zoom-down-appear-active":"_styles-module__rc-slider-tooltip-zoom-down-appear-active__3tu2z","rc-slider-tooltip-zoom-down-leave-active":"_styles-module__rc-slider-tooltip-zoom-down-leave-active__P9_lk","rc-slider-tooltip":"_styles-module__rc-slider-tooltip__1PZK2","rc-slider-tooltip-hidden":"_styles-module__rc-slider-tooltip-hidden__2CvyB","rc-slider-tooltip-placement-top":"_styles-module__rc-slider-tooltip-placement-top__qzmlA","rc-slider-tooltip-inner":"_styles-module__rc-slider-tooltip-inner__27Bp4","rc-slider-tooltip-arrow":"_styles-module__rc-slider-tooltip-arrow__35-HY"};

const CustomHandle = props => {
  const style = {
    left: props.offset + '%',
    transform: 'translateX(-50%)'
  };
  return /*#__PURE__*/React__default.createElement("div", {
    className: props.className,
    key: props.index,
    style: style,
    "data-value": props.value
  });
};

const SliderField = ({
  className,
  disabled,
  label,
  onChange,
  name,
  align: _align = 'left',
  ...props
}) => {
  const onChangeHandle = value => {
    if (onChange) onChange({
      target: {
        value,
        name
      }
    });
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$h.field, className, _align, {
      disabled
    })
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$h.slider
  }, /*#__PURE__*/React__default.createElement(Slider, Object.assign({
    onChange: onChangeHandle,
    tipFormatter: value => `$${value}`,
    handle: CustomHandle
  }, props))), label && /*#__PURE__*/React__default.createElement("span", {
    className: css$h.label
  }, label));
};

var css$i = {"field":"_styles-module__field__3PgPN","textarea":"_styles-module__textarea__2Ok_K","label":"_styles-module__label__1qnsP","error":"_styles-module__error__1C6bH"};

const TextAreaField = forwardRef(({
  label,
  className,
  size: _size = 'normal',
  errors: _errors = [],
  value,
  ...props
}, ref) => {
  const hasErrors = Boolean(_errors.length);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$i.field, className, _size, {
      disabled: props.disabled
    })
  }, /*#__PURE__*/React__default.createElement("label", null, label && /*#__PURE__*/React__default.createElement("div", {
    className: css$i.label
  }, label), /*#__PURE__*/React__default.createElement("div", {
    className: css$i.textarea
  }, /*#__PURE__*/React__default.createElement("textarea", Object.assign({
    className: cx({
      error: hasErrors
    }),
    value: value,
    ref: ref
  }, props))), hasErrors && /*#__PURE__*/React__default.createElement("div", {
    className: css$i.error
  }, _errors.join(', '))));
});

var css$j = {"filters":"_styles-module__filters__kiZkv","sidebar":"_styles-module__sidebar__2hZRZ","field":"_styles-module__field__3_9Ku","slider":"_styles-module__slider__3xe_A","switcher":"_styles-module__switcher__8cgpK","buttons":"_styles-module__buttons__1fRrD"};

const StackFilters = ({
  className,
  fields,
  form,
  onChange,
  onApply,
  isSidebar,
  disabled
}) => {
  const {
    t
  } = useTranslation();
  if (!Object.keys(fields).length) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$j.filters, {
      [css$j.sidebar]: isSidebar
    }, className)
  }, Object.keys(fields).map(key => {
    switch (fields[key].type) {
      case 'text':
        return /*#__PURE__*/React__default.createElement(TextField, {
          size: "small",
          key: `text-${key}`,
          className: cx(css$j.field, css$j.text),
          onChange: event => onChange(key, event.target.value),
          label: fields[key].label,
          name: key,
          value: form[key],
          disabled: disabled || fields[key].disabled
        });

      case 'textarea':
        return /*#__PURE__*/React__default.createElement(TextAreaField, {
          size: "small",
          key: `text-${key}`,
          className: cx(css$j.field, css$j.text),
          onChange: event => onChange(key, event.target.value),
          label: fields[key].label,
          name: key,
          value: form[key],
          disabled: disabled || fields[key].disabled
        });

      case 'select':
        return /*#__PURE__*/React__default.createElement(SelectField, {
          size: "small",
          key: `select-${key}`,
          align: "bottom",
          className: cx(css$j.field, css$j.select),
          onChange: value => onChange(key, value),
          label: fields[key].label,
          name: key,
          options: fields[key].options,
          value: Array.isArray(form[key]) ? form[key] : [form[key]],
          disabled: disabled || fields[key].disabled,
          mode: fields[key].multiple ? 'multiple' : null
        });

      case 'checkbox':
        return /*#__PURE__*/React__default.createElement(CheckboxField, {
          appearance: "switcher",
          key: `checkbox-${key}`,
          className: cx(css$j.field, css$j.switcher),
          onChange: onChange,
          label: fields[key].label,
          name: key,
          value: form[key],
          disabled: disabled || fields[key].disabled
        });

      case 'slider':
        return /*#__PURE__*/React__default.createElement(SliderField, {
          key: `slider-${key}`,
          className: cx(css$j.field, css$j.slider),
          onChange: onChange,
          align: "right",
          label: fields[key].label,
          name: key,
          value: form[key],
          step: null,
          min: fields[key].min,
          max: fields[key].max,
          marks: fields[key].options,
          disabled: disabled || fields[key].disabled
        });

      case 'apply':
        return /*#__PURE__*/React__default.createElement("div", {
          key: `apply-${key}`,
          className: cx(css$j.field, css$j.buttons)
        }, onApply && /*#__PURE__*/React__default.createElement(Button, {
          size: "small",
          color: "primary",
          variant: "contained",
          onClick: onApply,
          disabled: disabled || fields[key].disabled
        }, t('apply')));

      default:
        return null;
    }
  }));
};

var css$k = {"field":"_styles-module__field__2DYF1","hidden":"_styles-module__hidden__3z5o2"};

const StretchTitleField = ({
  value: propValue,
  placeholder: _placeholder = '',
  className,
  onChange: onChangeProp,
  ...props
}) => {
  const [value, set] = useState(propValue);

  const onChange = event => {
    if (onChangeProp) onChangeProp(event.target.value);
    set(event.target.value);
  };

  useEffect(() => {
    set(propValue);
  }, [propValue]);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$k.field, className)
  }, /*#__PURE__*/React__default.createElement("input", Object.assign({
    type: "text",
    placeholder: _placeholder,
    value: value,
    onChange: onChange
  }, props)), /*#__PURE__*/React__default.createElement("div", {
    className: css$k.hidden
  }, value && value.length ? value : _placeholder));
};

var css$l = {"fieldWrap":"_styles-module__fieldWrap__vED3t","field":"_styles-module__field__1XqN9","hidden":"_styles-module__hidden__38Nis"};

const StretchTextAreaField = forwardRef(({
  value: propValue,
  placeholder: _placeholder = '',
  className,
  onChange: onChangeProp,
  ...props
}, ref) => {
  const [value, set] = useState(propValue);

  const onChange = event => {
    if (onChangeProp) onChangeProp(event.target.value);
    set(event.target.value);
  };

  useEffect(() => {
    set(propValue);
  }, [propValue]);
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$l.fieldWrap
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$l.field, className)
  }, /*#__PURE__*/React__default.createElement("textarea", Object.assign({
    rows: 1,
    placeholder: _placeholder,
    value: value,
    onChange: onChange,
    ref: ref
  }, props)), /*#__PURE__*/React__default.createElement("div", {
    className: css$l.hidden
  }, value && value.length ? value : _placeholder, '\n')));
});

var css$m = {"tabs":"_styles-module__tabs__-hQvT","tab":"_styles-module__tab__2dsXN","soon":"_styles-module__soon__2_DJa"};

const Tabs = ({
  className,
  value: currentTabValue,
  tabs,
  appearance: _appearance = 'transparent',
  onChange,
  tabComponent
}) => {
  const {
    t
  } = useTranslation();

  const getOnClickTab = value => () => {
    if (typeof onChange === 'function') onChange(value);
  };

  const Component = tabComponent ? tabComponent : 'div';
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$m.tabs, _appearance, className)
  }, tabs.map(({
    value,
    label,
    soon,
    ...rest
  }, index) => /*#__PURE__*/React__default.createElement(Component, Object.assign({}, rest, {
    key: index,
    className: cx(css$m.tab, {
      active: value && value === currentTabValue
    }),
    onClick: getOnClickTab(value)
  }), label, soon && /*#__PURE__*/React__default.createElement("span", {
    className: css$m.soon
  }, t('soon')))));
};

var css$n = {"tooltip":"_style-module__tooltip__rE8Jn"};

const Tooltip = ({
  children,
  overlayContent,
  arrowContent: _arrowContent = null,
  placement: _placement = 'bottomLeft',
  trigger: _trigger = ['hover'],
  overlayStyle: _overlayStyle = {
    pointerEvents: 'none'
  },
  ...props
}) => {
  return /*#__PURE__*/React__default.createElement(RcTooltip, Object.assign({
    overlayStyle: _overlayStyle,
    arrowContent: _arrowContent,
    placement: _placement,
    trigger: _trigger,
    overlay: /*#__PURE__*/React__default.createElement("div", {
      className: css$n.tooltip
    }, overlayContent)
  }, props), children);
};

var css$o = {"switcher":"_styles-module__switcher__3NMzC"};

const ViewSwitcher = ({
  value: _value = 'grid',
  onChange,
  className
}) => {
  const [stateValue, setStateValue] = useState(_value);
  useEffect(() => {
    if (_value !== stateValue) setStateValue(_value);
  }, [_value]);

  const toggleValue = () => {
    const newValue = stateValue === 'grid' ? 'list' : 'grid';
    setStateValue(newValue);
    if (onChange) onChange(newValue);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$o.switcher, stateValue, className),
    onClick: toggleValue
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-view-grid"
  }), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-view-list"
  }));
};

const Yield = ({
  name,
  className,
  children
}) => {
  if (!name) return null;

  if (children) {
    const node = document && document.getElementById(name);
    if (!node) return null;
    return /*#__PURE__*/React__default.createElement(Portal, {
      node: node
    }, children);
  }

  return /*#__PURE__*/React__default.createElement("div", {
    className: className,
    id: name
  });
};

var css$p = {"table":"_styles-module__table__2TzH3"};

const Table = ({
  data
}) => {
  const [captions, ...rows] = data;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$p.table
  }, /*#__PURE__*/React__default.createElement("table", null, /*#__PURE__*/React__default.createElement("thead", null, /*#__PURE__*/React__default.createElement("tr", null, captions.map(caption => /*#__PURE__*/React__default.createElement("th", {
    key: caption
  }, caption)))), /*#__PURE__*/React__default.createElement("tbody", null, rows.map((row, index) => /*#__PURE__*/React__default.createElement("tr", {
    key: index
  }, row.map((cell, i) => /*#__PURE__*/React__default.createElement("td", {
    key: i
  }, cell)))))));
};

const isImageType = type => /^image/.test(type);
const base64ToJSON = base64 => {
  let parsedJSON;

  try {
    parsedJSON = JSON.parse(atob(base64));
  } catch (e) {
    console.log(e);
  }

  return parsedJSON;
};

var css$q = {"view":"_styles-module__view__1T-AH","text":"_styles-module__text__6S5f-","message":"_styles-module__message__1p-0w","description":"_styles-module__description__VNtCL","code":"_styles-module__code__26Ytj","footer":"_styles-module__footer__O3Gct"};

const base64ImagePrefixes = {
  'image/svg+xml': 'data:image/svg+xml;charset=utf-8;',
  'image/png': 'data:image/png;charset=utf-8;',
  'image/jpeg': 'data:image/jpeg;charset=utf-8;'
};

const View = ({
  frameId,
  attachment,
  fullAttachment,
  isList,
  className,
  requestStatus,
  stack
}) => {
  const {
    t
  } = useTranslation();
  const viewRef = useRef();
  const [tableScale, setTableScale] = useState(1);
  const [viewWidth, setVieWidth] = useState(0);
  const [noRender, setNoRender] = useState(false);

  const onResizeCard = () => {
    if (viewRef.current) {
      const containerWidth = viewRef.current.parentElement.offsetWidth;
      const viewWidth = viewRef.current.offsetWidth / tableScale;
      let newScale = containerWidth / viewWidth;
      if (newScale > 1) newScale = 1;
      setTableScale(newScale);
      setVieWidth(containerWidth);
    }
  };

  useEffect(() => {
    if (window && isList) window.addEventListener('resize', onResizeCard);
    return () => {
      if (window && isList) window.removeEventListener('resize', onResizeCard);
    };
  }, []);
  useEffect(() => {
    if (noRender) {
      setNoRender(false);
    }
  }, [noRender]);
  useEffect(() => {
    if (attachment && attachment['application'] === 'plotly' && !noRender) {
      setNoRender(true);
    }

    if (attachment && attachment['application'] === 'bokeh') {
      let Bokeh;
      const json = base64ToJSON(attachment.data);
      const version = get(attachment, 'settings.bokeh_version');

      if (version && parseInt(version.split('.')[0], 10) === 2) {
        Bokeh = window.Bokeh['2.2.1'];
      } else {
        Bokeh = window.Bokeh;
      }

      if (json && document.querySelector(`#bokeh-${frameId}`)) Bokeh.embed.embed_item(json, `bokeh-${frameId}`);
    }

    if (isList) setTimeout(() => onResizeCard(), 10);
  }, [attachment]);

  const renderImage = () => {
    if (!attachment.preview) return /*#__PURE__*/React__default.createElement("img", {
      src: `${base64ImagePrefixes[attachment['content_type']]}base64,${attachment.data}`,
      alt: ""
    });else if (fullAttachment) {
      if (fullAttachment['download_url']) {
        return /*#__PURE__*/React__default.createElement("img", {
          src: fullAttachment['download_url'],
          alt: ""
        });
      } else return /*#__PURE__*/React__default.createElement("img", {
        src: `${base64ImagePrefixes[attachment['content_type']]}base64,${attachment.data}`,
        alt: ""
      });
    }
    return null;
  };

  const renderCSV = () => {
    const decodeCSV = unicodeBase64Decode(attachment.data);

    if (decodeCSV) {
      const data = parse(decodeCSV);
      if (Array.isArray(data) && data.length) return /*#__PURE__*/React__default.createElement(Table, {
        data: data
      });
    }

    return /*#__PURE__*/React__default.createElement("div", {
      className: css$q.text
    }, t('notSupportedAttachment'));
  };

  const renderPlotly = () => {
    const json = base64ToJSON(attachment.data);
    if (!json) return null;
    json.layout.width = viewWidth;
    json.layout.margin = 0;
    json.layout.autosize = true;
    if (json.config) json.config.responsive = true;else json.config = {
      responsive: true
    };
    return /*#__PURE__*/React__default.createElement(Plot, Object.assign({}, json, {
      style: {
        width: '100%',
        height: '100%'
      },
      useResizeHandler: true
    }));
  };

  const renderMl = () => {
    const pullPythonCode = data => {
      let a = [`\'/${stack}\'`];
      let params = Object.keys(data.params);

      if (params.length > 0) {
        let p = [];
        params.forEach(key => {
          if (isString(data.params[key])) p.push(`\'${key}\': \'${data.params[key]}\'`);else p.push(`\'${key}\': ${data.params[key]}`);
        });
        a.push('params={' + p.join(', ') + '}');
      }

      return `import dstack as ds

model = ds.pull(${a.join(', ')})`;
    };

    return /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("div", {
      className: css$q.description
    }, t('pullDatasetIntro')), /*#__PURE__*/React__default.createElement(CodeViewer, {
      className: css$q.code,
      language: "python"
    }, pullPythonCode(attachment)), /*#__PURE__*/React__default.createElement("div", {
      className: css$q.footer,
      dangerouslySetInnerHTML: {
        __html: t('notClearCheckTheDocks_2', {
          href: config.DOCS_URL
        })
      }
    }));
  };

  const renderBokeh = () => /*#__PURE__*/React__default.createElement("div", {
    id: `bokeh-${frameId}`
  });

  const renderAttachment = () => {
    if (noRender) return null;
    if (requestStatus === 404 && isList) return /*#__PURE__*/React__default.createElement("div", {
      className: css$q.message
    }, t('notFound'));
    if (requestStatus === 404 && !isList) return /*#__PURE__*/React__default.createElement("div", {
      className: css$q.text
    }, t('noPreview'));
    if (attachment.preview && isList && isImageType(attachment['content_type'])) return /*#__PURE__*/React__default.createElement("div", {
      className: css$q.message
    }, t('noPreview'));

    switch (true) {
      case attachment['content_type'] === 'image/svg+xml':
      case attachment['content_type'] === 'image/png':
      case attachment['content_type'] === 'image/jpeg':
        return renderImage();

      case attachment['content_type'] === 'text/csv':
        return renderCSV();

      case attachment['application'] === 'plotly':
        return renderPlotly();

      case attachment['application'] === 'bokeh':
        return renderBokeh();

      case attachment['application'] === 'sklearn':
      case /^tensorflow\/*/.test(attachment['application']):
      case /^torch\/*/.test(attachment['application']):
        return renderMl();

      case undefined:
      case isEqual(attachment, {}):
        return null;

      default:
        return /*#__PURE__*/React__default.createElement("div", {
          className: isList ? css$q.message : css$q.text
        }, t('notSupportedAttachment'));
    }
  };

  return /*#__PURE__*/React__default.createElement("div", {
    ref: viewRef,
    className: cx(css$q.view, className, {
      'table': attachment && attachment.data && attachment['content_type'] === 'text/csv',
      'bokeh': attachment && attachment.data && attachment['application'] === 'bokeh'
    }),
    style: attachment && attachment['content_type'] === 'text/csv' ? {
      transform: `scale(${tableScale})`
    } : {}
  }, renderAttachment());
};

const areEqual = (prevProps, nextProps) => {
  return isEqual(prevProps.attachment, nextProps.attachment);
};

var View$1 = memo(View, areEqual);

var useIntersectionObserver = ((callBack, {
  rootMargin: _rootMargin = '0px',
  threshold: _threshold = 0.01,
  root: _root = null
}, deps) => {
  const ref = useRef(null);
  const intersectionCallback = useCallback(([target]) => {
    if (target.isIntersecting) {
      callBack();
    }
  }, deps);
  useEffect(() => {
    const options = {
      root: _root,
      rootMargin: _rootMargin,
      threshold: _threshold
    };
    const observer = new IntersectionObserver(intersectionCallback, options);
    if (ref && ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, intersectionCallback]);
  return [ref];
});

var actionsTypes$1 = {
  FETCH: 'stacks/attachments/FETCH',
  FETCH_SUCCESS: 'stacks/attachments/FETCH_SUCCESS',
  FETCH_FAIL: 'stacks/attachments/FETCH_FAIL'
};

const initialState$1 = {
  data: {},
  errors: {},
  requestStatus: null
};
const reducer$1 = (state = initialState$1, action) => {
  switch (action.type) {
    case actionsTypes$1.FETCH:
      return { ...state,
        data: { ...state.data,
          [action.meta.frameId]: { ...state.data[action.meta.frameId],
            [action.meta.id]: { ...(state.data[action.meta.frameId] ? state.data[action.meta.frameId][action.meta.id] : {}),
              loading: true,
              requestStatus: null,
              error: null
            }
          }
        }
      };

    case actionsTypes$1.FETCH_SUCCESS:
      return { ...state,
        data: { ...state.data,
          [action.meta.frameId]: { ...state.data[action.meta.frameId],
            [action.meta.id]: { ...action.payload,
              loading: false
            }
          }
        }
      };

    case actionsTypes$1.FETCH_FAIL:
      return { ...state,
        data: { ...state.data,
          [action.meta.frameId]: { ...state.data[action.meta.frameId],
            [action.meta.id]: {
              error: action.payload.error,
              requestStatus: action.payload.requestStatus,
              loading: false
            }
          }
        }
      };

    default:
      return state;
  }
};
const StateContext$1 = createContext();
const StateProvider = ({
  children,
  apiUrl
}) => /*#__PURE__*/React__default.createElement(StateContext$1.Provider, {
  value: useReducer(reducer$1, { ...initialState$1,
    apiUrl
  })
}, children);
const useStateValue = () => useContext(StateContext$1);

var actions = (() => {
  const [{
    apiUrl
  }, dispatch] = useStateValue();

  const fetchAttachment = async (stack, frameId, id, onSuccess) => {
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    dispatch({
      type: actionsTypes$1.FETCH,
      meta: {
        frameId,
        id
      }
    });

    try {
      const request = await axios({
        baseURL: apiUrl,
        url: config.STACK_ATTACHMENT(stack, frameId, id),
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      dispatch({
        type: actionsTypes$1.FETCH_SUCCESS,
        meta: {
          frameId,
          id
        },
        payload: request.data.attachment
      });
      if (onSuccess) onSuccess();
    } catch (e) {
      let error = 'Unknown error';

      try {
        error = JSON.parse(get(e, 'request.response')).message;
      } catch (e) {
        console.log(error);
      }

      dispatch({
        type: actionsTypes$1.FETCH_FAIL,
        meta: {
          frameId,
          id
        },
        payload: {
          error
        }
      });
    }
  };

  return {
    fetchAttachment
  };
});

var css$r = {"attachment":"_styles-module__attachment__3NILI","loading-pulse":"_styles-module__loading-pulse__IhCO3","view":"_styles-module__view__3UWqG","text":"_styles-module__text__MOcaD"};

const Attachment = ({
  id,
  className,
  frameId,
  isList,
  withLoader,
  stack,
  customData
}) => {
  const {
    fetchAttachment
  } = actions();
  const [{
    data,
    apiUrl
  }] = useStateValue();
  const attachment = get(data, `${frameId}.${id}`, {});
  const {
    loading,
    error,
    requestStatus
  } = attachment;
  const [loadingFullAttachment, setLoadingFullAttachment] = useState(false);
  const [fullAttachment, setFullAttachment] = useState(null);
  const prevAttachment = usePrevious(attachment);

  const fetchFullAttachment = async () => {
    setLoadingFullAttachment(true);

    try {
      const url = config.STACK_ATTACHMENT(stack, frameId, id) + '?download=true';
      const {
        data
      } = await axios({
        baseUrl: apiUrl,
        url
      });
      setFullAttachment(data.attachment);
    } catch (e) {
      console.log(e);
    }

    setLoadingFullAttachment(false);
  };

  useEffect(() => {
    if (!customData && !isList && attachment && !isEqual(prevAttachment, attachment) && attachment.preview && isImageType(attachment['content_type'])) {
      fetchFullAttachment();
    }
  }, [data]);
  useEffect(() => {
    if (!customData && !isList && typeof id === 'number' && frameId && (!attachment.data && !error || (attachment === null || attachment === void 0 ? void 0 : attachment.index) !== id)) {
      fetchAttachment(stack, frameId, id);
    }
  }, [id, frameId]);
  const [ref] = useIntersectionObserver(() => {
    if (!customData && isList && !loading && (!attachment.data && !error || attachment.data && attachment.index !== id)) fetchAttachment(stack, frameId, id);
  }, {}, [id, frameId, data]);
  return /*#__PURE__*/React__default.createElement("div", {
    ref: ref,
    className: cx(css$r.attachment, className, {
      'is-list': isList,
      loading: loading && withLoader || loadingFullAttachment
    })
  }, !loading && /*#__PURE__*/React__default.createElement(View$1, {
    requestStatus: requestStatus,
    className: css$r.view,
    isList: isList,
    fullAttachment: fullAttachment,
    attachment: customData ? customData : attachment,
    stack: stack
  }));
};

var css$s = {"list":"_styles-module__list__FL7ja","avatar":"_styles-module__avatar__37Kcf","count":"_styles-module__count__11i1Z"};

const PermissionUsers = ({
  permissions,
  className,
  variant: _variant = 'details',
  maxLength,
  owner
}) => {
  if (!permissions || !permissions.length) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$s.list, className, _variant)
  }, permissions.slice(0, maxLength).map((i, index) => /*#__PURE__*/React__default.createElement(Avatar, {
    withBorder: true,
    size: _variant === 'list' ? 'list' : 'small',
    key: index,
    className: cx(css$s.avatar, {
      owner: owner === i.user
    }),
    name: i.user || i.email
  })), maxLength && maxLength < permissions.length && /*#__PURE__*/React__default.createElement("span", {
    className: css$s.count
  }, "+", permissions.length - maxLength));
};

function _extends$2() {
  _extends$2 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$2.apply(this, arguments);
}

var _ref$2 = /*#__PURE__*/createElement("g", {
  fill: "#86A6DD"
}, /*#__PURE__*/createElement("rect", {
  width: 2,
  height: 19,
  rx: 1
}), /*#__PURE__*/createElement("rect", {
  x: 4,
  y: 5.846,
  width: 2,
  height: 13.154,
  rx: 1
}), /*#__PURE__*/createElement("rect", {
  x: 8,
  y: 9.5,
  width: 2,
  height: 9.5,
  rx: 1
}), /*#__PURE__*/createElement("rect", {
  x: 12,
  y: 7.308,
  width: 2,
  height: 11.692,
  rx: 1
}), /*#__PURE__*/createElement("rect", {
  x: 16,
  y: 12.971,
  width: 2,
  height: 6.029,
  rx: 1
}), /*#__PURE__*/createElement("rect", {
  x: 20,
  y: 9.5,
  width: 2,
  height: 9.5,
  rx: 1
}));

function SvgChart(props) {
  return /*#__PURE__*/createElement("svg", _extends$2({
    width: 22,
    height: 19,
    viewBox: "0 0 22 19",
    fill: "none"
  }, props), _ref$2);
}

function _extends$3() {
  _extends$3 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$3.apply(this, arguments);
}

var _ref$3 = /*#__PURE__*/createElement("path", {
  fill: "#86A6DD",
  d: "M18.797 6.34a3.38 3.38 0 00-2.944-4.026C14.835-.088 11.55-.492 10 1.671 8.45-.49 5.167-.089 4.149 2.314A3.38 3.38 0 001.204 6.34a3.375 3.375 0 00-.381 4.79c-2.022 2.721-.1 6.69 3.387 6.69 1.114 2.322 4.293 2.598 5.79.508 1.5 2.092 4.678 1.812 5.791-.509 3.479.008 5.41-3.967 3.387-6.69a3.375 3.375 0 00-.38-4.789zM7.177 18.461c-1.763 0-2.78-2.07-1.631-3.46a.63.63 0 10-.972-.802 3.378 3.378 0 00-.768 2.323c-2.39-.255-3.455-3.113-1.875-4.875.017.02.61-.828 1.875-.963-.021.409.032.822.163 1.222a.63.63 0 001.199-.392A2.116 2.116 0 016.52 8.848a.63.63 0 10-.392-1.198 3.42 3.42 0 00-.418.168 1.649 1.649 0 01.482-1.867.63.63 0 00-.804-.97 2.907 2.907 0 00-.71 3.608c-.425.47-.524.818-.56.818-.925 0-1.781.301-2.476.81a2.113 2.113 0 01.539-3.11.63.63 0 00.26-.746c-.463-1.297.41-2.823 2.083-2.823a.63.63 0 00.609-.47 2.115 2.115 0 014.157.544v12.735a2.116 2.116 0 01-2.114 2.114zm11.022-8.244a4.168 4.168 0 00-2.489-.81c-.142-.3-.319-.566-.547-.818a2.906 2.906 0 00-.71-3.609.63.63 0 10-.804.971c.56.464.733 1.224.482 1.867a3.423 3.423 0 00-.418-.168.63.63 0 10-.392 1.198 2.116 2.116 0 011.352 2.666.63.63 0 101.199.392c.13-.4.184-.813.163-1.222a2.941 2.941 0 012.623 2.919 2.94 2.94 0 01-2.623 2.918 3.377 3.377 0 00-.768-2.323.63.63 0 00-.972.804c1.146 1.386.133 3.46-1.63 3.46a2.116 2.116 0 01-2.114-2.115V3.612a2.115 2.115 0 014.157-.543.63.63 0 00.63.469c1.477-.055 2.566 1.413 2.062 2.823-.1.279.009.59.26.747a2.113 2.113 0 01.539 3.11z"
});

function SvgMl(props) {
  return /*#__PURE__*/createElement("svg", _extends$3({
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none"
  }, props), _ref$3);
}

function _extends$4() {
  _extends$4 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$4.apply(this, arguments);
}

var _ref$4 = /*#__PURE__*/createElement("g", {
  fill: "#86A6DD"
}, /*#__PURE__*/createElement("rect", {
  y: 1,
  width: 1.5,
  height: 20,
  rx: 0.75
}), /*#__PURE__*/createElement("rect", {
  x: 6,
  y: 1,
  width: 1.5,
  height: 20,
  rx: 0.75
}), /*#__PURE__*/createElement("rect", {
  y: 21,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 21)"
}), /*#__PURE__*/createElement("rect", {
  y: 15,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 15)"
}), /*#__PURE__*/createElement("rect", {
  y: 9,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 9)"
}), /*#__PURE__*/createElement("rect", {
  y: 2.4,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 2.4)"
}), /*#__PURE__*/createElement("rect", {
  x: 18.5,
  y: 1,
  width: 1.5,
  height: 20,
  rx: 0.75
}));

function SvgTable(props) {
  return /*#__PURE__*/createElement("svg", _extends$4({
    width: 20,
    height: 21,
    viewBox: "0 0 20 21",
    fill: "none"
  }, props), _ref$4);
}

function _extends$5() {
  _extends$5 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$5.apply(this, arguments);
}

var _ref$5 = /*#__PURE__*/createElement("g", {
  clipPath: "url(#app_svg__clip0)",
  fill: "#86A6DD"
}, /*#__PURE__*/createElement("path", {
  d: "M7.857 0H.714A.714.714 0 000 .714v7.143c0 .395.32.714.714.714h7.143c.395 0 .714-.319.714-.714V.714A.714.714 0 007.857 0zm-.714 7.143H1.429V1.429h5.714v5.714zM7.857 11.429H.714a.714.714 0 00-.714.714v7.143c0 .394.32.714.714.714h7.143c.395 0 .714-.32.714-.714v-7.143a.714.714 0 00-.714-.714zm-.714 7.142H1.429v-5.714h5.714v5.714zM19.286 11.429h-7.143a.714.714 0 00-.714.714v7.143c0 .394.32.714.714.714h7.143c.395 0 .714-.32.714-.714v-7.143a.714.714 0 00-.714-.714zm-.714 7.142h-5.715v-5.714h5.715v5.714z"
}), /*#__PURE__*/createElement("path", {
  d: "M19.79 6.22a.714.714 0 000-1.01l-5-5a.714.714 0 00-1.01 0l-5 5a.712.712 0 000 1.01l5 5a.712.712 0 001.01 0l5-5zm-9.494-.506l3.99-3.99 3.99 3.99-3.99 3.99-3.99-3.99z"
}));

var _ref2$2 = /*#__PURE__*/createElement("defs", null, /*#__PURE__*/createElement("clipPath", {
  id: "app_svg__clip0"
}, /*#__PURE__*/createElement("path", {
  d: "M0 0h20v20H0z"
})));

function SvgApp(props) {
  return /*#__PURE__*/createElement("svg", _extends$5({
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none"
  }, props), _ref$5, _ref2$2);
}

var css$t = {"item":"_styles-module__item__fLtf5","name":"_styles-module__name__147V3","delete":"_styles-module__delete__2PoaL","icon":"_styles-module__icon__3yxhI","top":"_styles-module__top__3aJqR","permissions":"_styles-module__permissions__2SUP0","date":"_styles-module__date__2c9og"};

const Item = ({
  className,
  Component: _Component = 'div',
  data,
  deleteAction,
  ...rest
}) => {
  const {
    t
  } = useTranslation();
  const ref = useRef(null);

  const onClickDelete = event => {
    event.stopPropagation();
    event.preventDefault();
    deleteAction(data.name);
  };

  const renderIcon = () => {
    var _data$head, _data$head$preview, _data$head2, _data$head2$preview;

    const contentType = (_data$head = data.head) === null || _data$head === void 0 ? void 0 : (_data$head$preview = _data$head.preview) === null || _data$head$preview === void 0 ? void 0 : _data$head$preview.content_type;
    const application = (_data$head2 = data.head) === null || _data$head2 === void 0 ? void 0 : (_data$head2$preview = _data$head2.preview) === null || _data$head2$preview === void 0 ? void 0 : _data$head2$preview.application;
    const category = getStackCategory({
      application,
      contentType
    });

    switch (category) {
      case 'chart':
        return /*#__PURE__*/React__default.createElement(SvgChart, null);

      case 'table':
        return /*#__PURE__*/React__default.createElement(SvgTable, null);

      case 'mlModel':
        return /*#__PURE__*/React__default.createElement(SvgMl, null);

      case 'app':
        return /*#__PURE__*/React__default.createElement(SvgApp, null);

      default:
        return null;
    }
  };

  return /*#__PURE__*/React__default.createElement(_Component, Object.assign({
    className: cx(css$t.item, className),
    ref: ref
  }, rest), /*#__PURE__*/React__default.createElement("div", {
    className: css$t.icon
  }, renderIcon()), /*#__PURE__*/React__default.createElement("div", {
    className: css$t.top
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$t.name,
    title: data.name
  }, data.name), /*#__PURE__*/React__default.createElement("span", {
    className: `mdi mdi-lock${data.private ? '' : '-open'}`
  }), data.private && /*#__PURE__*/React__default.createElement(PermissionUsers, {
    variant: "list",
    owner: data.user,
    className: css$t.permissions,
    permissions: data.permissions,
    maxLength: 3
  })), data.head && /*#__PURE__*/React__default.createElement("div", {
    className: css$t.date
  }, t('updated'), " ", moment(data.head.timestamp).format('L')), deleteAction && /*#__PURE__*/React__default.createElement("span", {
    className: css$t.delete,
    onClick: onClickDelete
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-close"
  })));
};

var routes = {
  notFound: () => '/404',
  auth: () => '/auth',
  authLogin: () => '/auth/login',
  verifyUser: () => '/auth/verify',
  authSignUp: () => '/auth/signup',
  authForgetPassword: () => '/auth/forget-password',
  authResetPassword: () => '/auth/reset-password',
  confirmEmailMessage: () => '/auth/confirm-message',
  stacks: () => '/',
  userStacks: (user = ':user') => `/${user}`,
  categoryStacks: (category = ':category(applications|models)') => `/${category}`,
  categoryUserStacks: (user = ':user', category = ':category(applications|models)') => `/${user}/${category}`,
  stackDetails: (user = ':user', id = ':stack') => `/${user}/${id}` + (id === ':stack' ? '+' : ''),
  reports: (user = ':user') => `/${user}/d`,
  reportsDetails: (user = ':user', id = ':id') => `/${user}/d/${id}`,
  jobs: (user = ':user') => `/${user}/j`,
  jobsDetails: (user = ':user', id = ':id') => `/${user}/j/${id}`,
  settings: () => '/settings',
  accountSettings: () => '/settings/account',
  usersSettings: () => '/settings/users'
};

var css$u = {"list":"_styles-module__list__3CcWo","header":"_styles-module__header__3MHvB","title":"_styles-module__title__2HbVV","headerSide":"_styles-module__headerSide__TN8Ts","search":"_styles-module__search__3VlZv","uploadButton":"_styles-module__uploadButton__35PkI","controls":"_styles-module__controls__ee5au","viewSwitcher":"_styles-module__viewSwitcher__1boU7","sorting":"_styles-module__sorting__1S_L9","sortingButton":"_styles-module__sortingButton__1c0ym","message":"_styles-module__message__3XJKG","text":"_styles-module__text__1_wO5","tabs":"_styles-module__tabs__DBGuk","itemList":"_styles-module__itemList__1fksy","item":"_styles-module__item__1RHsG","loadingItem":"_styles-module__loadingItem__1uHPv","stacks-pulse":"_styles-module__stacks-pulse__1qO_N","modal":"_styles-module__modal__1BJIQ","description":"_styles-module__description__1U-iN","buttons":"_styles-module__buttons__19NkE","button":"_styles-module__button__3jLaw"};

const List = ({
  data: _data = [],
  loading,
  deleteStack,
  currentUser,
  user,
  category
}) => {
  const {
    t
  } = useTranslation();
  const categoryMap = {
    applications: 'app',
    models: 'mlModel'
  };
  const [deletingStack, setDeletingStack] = useState(null);
  const [isShowWelcomeModal, setIsShowWelcomeModal] = useState(false);
  const [search, setSearch] = useState('');
  const isInitialMount = useRef(true);

  const showWelcomeModal = () => setIsShowWelcomeModal(true);

  const onChangeSearch = value => setSearch(value);

  const hideWelcomeModal = () => {
    localStorage.setItem('welcome-modal-is-showing', true);
    setIsShowWelcomeModal(false);
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (!localStorage.getItem('welcome-modal-is-showing') && !loading && !_data.length) showWelcomeModal();
    }
  }, [_data]);

  const deleteItem = () => {
    deleteStack(deletingStack);
    hideDeleteConfirmation();
  };

  const showDeleteConfirmation = name => {
    setDeletingStack(name);
  };

  const hideDeleteConfirmation = () => setDeletingStack(null);

  const getItems = () => {
    let filteredItems = [];

    const items = _data.filter(stack => {
      var _stack$head, _stack$head$preview, _stack$head2, _stack$head2$preview;

      const stackCategory = getStackCategory({
        application: (_stack$head = stack.head) === null || _stack$head === void 0 ? void 0 : (_stack$head$preview = _stack$head.preview) === null || _stack$head$preview === void 0 ? void 0 : _stack$head$preview.application,
        contentType: (_stack$head2 = stack.head) === null || _stack$head2 === void 0 ? void 0 : (_stack$head2$preview = _stack$head2.preview) === null || _stack$head2$preview === void 0 ? void 0 : _stack$head2$preview.content_type
      });
      return stackCategory === categoryMap[category];
    });

    if (items && items.length) {
      if (search.length) filteredItems = items.filter(i => i.name.indexOf(search) >= 0);else filteredItems = items;
    }

    return filteredItems;
  };

  const items = getItems();
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$u.list
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$u.header
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$u.title
  }, {
    applications: t('application_plural'),
    models: t('mlModel_plural')
  }[category]), Boolean(_data.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$u.headerSide
  }, Boolean(_data.length) && /*#__PURE__*/React__default.createElement(SearchField, {
    className: css$u.search,
    showEverything: true,
    isDark: true,
    placeholder: t('findStack'),
    size: "small",
    value: search,
    onChange: onChangeSearch
  }))), loading && !Boolean(_data.length) && /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$u.itemList)
  }, new Array(12).fill({}).map((i, index) => /*#__PURE__*/React__default.createElement("div", {
    key: index,
    className: css$u.loadingItem
  }))), !loading && !_data.length && /*#__PURE__*/React__default.createElement("div", {
    className: css$u.message
  }, user === currentUser ? t('youHaveNoStacksYet') : t('theUserHasNoStacksYetByName', {
    name: user
  })), Boolean(_data.length && items.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$u.itemList
  }, items.map((item, index) => /*#__PURE__*/React__default.createElement(Item, {
    className: css$u.item,
    Component: Link,
    key: index,
    data: item,
    to: routes.stackDetails(item.user, item.name),
    deleteAction: currentUser === item.user && showDeleteConfirmation
  }))), Boolean(_data.length && !items.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$u.text
  }, {
    applications: t('noApplicationsMatchingTheSearchCriteria'),
    models: t('noMlModelsMatchingTheSearchCriteria')
  }[category]), /*#__PURE__*/React__default.createElement(Modal, {
    isShow: Boolean(deletingStack),
    onClose: hideDeleteConfirmation,
    size: "confirmation",
    title: t('deleteStack'),
    className: css$u.modal
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$u.description
  }, t('areYouSureYouWantToDelete', {
    name: deletingStack
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$u.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    variant: "contained",
    color: "primary",
    onClick: hideDeleteConfirmation,
    className: css$u.button
  }, t('cancel')), /*#__PURE__*/React__default.createElement(Button, {
    color: "secondary",
    variant: "contained",
    onClick: deleteItem,
    className: css$u.button
  }, t('deleteStack')))), currentUser === user && /*#__PURE__*/React__default.createElement(Modal, {
    isShow: isShowWelcomeModal,
    onClose: hideWelcomeModal,
    size: "small",
    title: `${t('welcomeToDStack')}👋`,
    className: css$u.modal
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$u.description
  }, t('yourEmailWasSuccessfullyConfirmed')), /*#__PURE__*/React__default.createElement("div", {
    className: css$u.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    variant: "contained",
    color: "primary",
    onClick: hideWelcomeModal,
    className: css$u.button
  }, t('getStarted')))));
};

var css$v = {"howto":"_styles-module__howto__3e8x1","tabs":"_styles-module__tabs__2M-II","description":"_styles-module__description__1cd6d","code":"_styles-module__code__1VE_j","footer":"_styles-module__footer__1gsjy"};

const pullPythonCode = data => {
  let a = [`\'/${data.stack}\'`];
  let params = Object.keys(data.params);

  if (params.length > 0) {
    let p = [];
    params.forEach(key => {
      if (isString(data.params[key])) p.push(`\'${key}\': \'${data.params[key]}\'`);else p.push(`\'${key}\': ${data.params[key]}`);
    });
    a.push('params={' + p.join(', ') + '}');
  }

  return `import dstack as ds

df = ds.pull(${a.join(', ')})`;
};

const HowTo = ({
  modalMode,
  data,
  configurePythonCommand
}) => {
  const {
    t
  } = useTranslation();
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$v.howto
  }, !modalMode && /*#__PURE__*/React__default.createElement("div", {
    className: css$v.title
  }, t('howToFetchDataUsingTheAPI')), /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("div", {
    className: css$v.description
  }, t('installPipPackage')), /*#__PURE__*/React__default.createElement(CodeViewer, {
    className: css$v.code,
    language: "bash"
  }, "pip install dstack"), /*#__PURE__*/React__default.createElement("div", {
    className: css$v.description
  }, t('configureDStack')), /*#__PURE__*/React__default.createElement(CodeViewer, {
    className: css$v.code,
    language: "bash"
  }, configurePythonCommand), /*#__PURE__*/React__default.createElement("div", {
    className: css$v.description
  }, t('pullDatasetIntro')), /*#__PURE__*/React__default.createElement(CodeViewer, {
    className: css$v.code,
    language: "python"
  }, pullPythonCode(data))), /*#__PURE__*/React__default.createElement("div", {
    className: css$v.footer,
    dangerouslySetInnerHTML: {
      __html: t('notClearCheckTheDocks_2', {
        href: config.DOCS_URL
      })
    }
  }));
};

var useOnClickOutside = ((ref, handler) => {
  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
});

var css$w = {"frames":"_styles-module__frames__3D3R4","frames-dropdown":"_styles-module__frames-dropdown__3hapH","button":"_styles-module__button__Tn4o_","name":"_styles-module__name__YzOn7","label":"_styles-module__label__Hg7hs","dropdown":"_styles-module__dropdown__16pcp","item":"_styles-module__item__1q46l","mark":"_styles-module__mark__1h8Eq","info":"_styles-module__info__2BnTD","modal":"_styles-module__modal__pk61B","description":"_styles-module__description__2GOOp","buttons":"_styles-module__buttons__3Ml-A"};

const getFrameName = frame => moment(frame.timestamp).format('D MMM YYYY h:mm a');

const Frames = ({
  frame,
  frames,
  headId,
  onChange,
  onMarkAsHead,
  className
}) => {
  const {
    t
  } = useTranslation();
  const [isShowDropdown, setIsShowDropdown] = useState(false);

  const toggleDropdown = () => setIsShowDropdown(!isShowDropdown);

  const [frameForMarkingAsHead, setFrameForMarkingAsHead] = useState(null);
  const dropdownRef = useRef(null);
  useOnClickOutside(dropdownRef, () => isShowDropdown && toggleDropdown());
  if (!frames.length) return null;
  const activeFrame = frames.find(f => f.id === frame);

  const onClickItem = frameId => () => {
    toggleDropdown();
    if (frame !== frameId && onChange) onChange(frameId);
  };

  const onClickMarkAsHead = frameId => event => {
    event.stopPropagation();
    setFrameForMarkingAsHead(frameId);
    toggleDropdown();
  };

  const hideConfirmation = () => setFrameForMarkingAsHead(null);

  const confirmMarkFrameAsHead = () => {
    if (onMarkAsHead) onMarkAsHead(frameForMarkingAsHead.id);
    setFrameForMarkingAsHead(null);
  };

  if (!activeFrame) {
    return null;
  }

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$w.frames, className),
    ref: dropdownRef
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$w['frames-dropdown']),
    ref: dropdownRef
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$w.button,
    onClick: toggleDropdown
  }, /*#__PURE__*/React__default.createElement("span", {
    className: css$w.name
  }, getFrameName(activeFrame)), headId === activeFrame.id && /*#__PURE__*/React__default.createElement("span", {
    className: css$w.label
  }, t('head')), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-chevron-down"
  })), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$w.dropdown, {
      show: isShowDropdown
    })
  }, frames.map(f => /*#__PURE__*/React__default.createElement(Tooltip, {
    key: f.id,
    placement: "rightTop",
    trigger: Boolean(f.description) ? ['hover'] : [],
    align: {
      offset: [-20, -20]
    },
    onClick: onClickItem(f.id),
    overlayContent: f.description
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$w.item
  }, /*#__PURE__*/React__default.createElement("span", {
    className: css$w.name
  }, getFrameName(f)), headId === f.id && /*#__PURE__*/React__default.createElement("span", {
    className: css$w.label
  }, t('head')), headId !== f.id && /*#__PURE__*/React__default.createElement("div", {
    className: css$w.mark,
    onClick: onClickMarkAsHead(f)
  }, t('markAsHead'))))))), activeFrame && activeFrame.description && /*#__PURE__*/React__default.createElement(Tooltip, {
    overlayContent: activeFrame.description
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$w.info)
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-information-variant"
  }))), /*#__PURE__*/React__default.createElement(Modal, {
    isShow: Boolean(frameForMarkingAsHead),
    onClose: hideConfirmation,
    size: "confirmation",
    title: t('changeHeadRevision'),
    className: css$w.modal
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$w.description
  }, t('areYouSureYouWantToChangeTheCurrentHeadRevisionToByName', {
    frame: frameForMarkingAsHead && getFrameName(frameForMarkingAsHead)
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$w.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    variant: "contained",
    color: "primary",
    onClick: confirmMarkFrameAsHead,
    className: css$w.button
  }, t('yesChangeHead')), /*#__PURE__*/React__default.createElement(Button, {
    color: "secondary",
    variant: "contained",
    onClick: hideConfirmation,
    className: css$w.button
  }, t('cancel')))));
};

var useDebounce = ((callback, depsOrDelay, deps) => {
  let delay = 300;
  if (typeof depsOrDelay === 'number') delay = depsOrDelay;else deps = depsOrDelay;
  return useCallback(debounce(callback, delay), deps);
});

const isEmail = value => {
  if (!value) return true;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
};
const isRequired = value => {
  return !(value === null || value === undefined || value === '');
};
const noSpaces = value => {
  return /^[\S]*$/.test(value);
};
const isValidStackName = value => {
  return /^[^\/]/.test(value) && /^[a-zA-Z0-9\/_]+$/.test(value);
};
const isValidEmail = mail => {
  const errors = {
    invalidEmailAddress: 'invalidEmailAddress'
  };
  if (mail && !isEmail(mail)) return {
    isValid: false,
    error: errors.invalidEmailAddress
  };
  return {
    isValid: true
  };
};

const api = apiFabric();
var useActions = (() => {
  const [{
    apiUrl
  }] = useAppStore();

  const checkUser = userName => {
    return new Promise(async (resolve, reject) => {
      try {
        const request = await api.get(apiUrl + config.CHECK_USER(userName));
        resolve(request.data);
      } catch (e) {
        reject(e);
      }
    });
  };

  const addPermissions = ({
    userName,
    instancePath
  }) => {
    const params = {
      path: instancePath
    };
    if (isValidEmail(userName).isValid) params.email = userName;else params.user = userName;
    return new Promise(async (resolve, reject) => {
      try {
        await api.post(apiUrl + config.PERMISSIONS_ADD, params);
        resolve(params);
      } catch (e) {
        reject(e);
      }
    });
  };

  const removePermissions = ({
    user,
    instancePath
  }) => {
    const params = {
      path: instancePath,
      ...user
    };
    return new Promise(async (resolve, reject) => {
      try {
        await api.post(apiUrl + config.PERMISSIONS_DELETE, params);
        resolve();
      } catch (e) {
        reject();
      }
    });
  };

  return {
    checkUser,
    addPermissions,
    removePermissions
  };
});

var css$x = {"desktopButton":"_styles-module__desktopButton__2X9G0","mobileButton":"_styles-module__mobileButton__3s7Ow","modal":"_styles-module__modal__I7l_L","dialog":"_styles-module__dialog__2ieJ1","description":"_styles-module__description__2kfzG","copyAndDropdown":"_styles-module__copyAndDropdown__3e5Np","link":"_styles-module__link__2420g","copy":"_styles-module__copy__2rv__","separator":"_styles-module__separator__3gVSm","dropdown":"_styles-module__dropdown__3Iy_D","dropdownButton":"_styles-module__dropdownButton__11Rdi","content":"_styles-module__content__3zGyt","invite":"_styles-module__invite__2Zs79","checkUserName":"_styles-module__checkUserName__2UalE","inviteField":"_styles-module__inviteField__2VZEa","inviteButton":"_styles-module__inviteButton__2MARU","checkUserMessage":"_styles-module__checkUserMessage__1jlEB","users":"_styles-module__users__2gjKq","user":"_styles-module__user__3VlxR","user-pic":"_styles-module__user-pic__2PGqr","user-name":"_styles-module__user-name__-pvaS","userPic":"_styles-module__userPic__IWEUU","userName":"_styles-module__userName__2xAc9","userDelete":"_styles-module__userDelete__3QkG0","userMessage":"_styles-module__userMessage__1Bvl_","userMessageSuccess":"_styles-module__userMessageSuccess__1PzgS"};

const Share = ({
  className,
  instancePath,
  accessLevel: initialAccessLevel,
  defaultPermissions: _defaultPermissions = [],
  onChangeAccessLevel,
  urlParams: _urlParams = {},
  onUpdatePermissions,
  stackName
}) => {
  const [{
    configInfo
  }] = useAppStore();
  const [userExists, setUserExists] = useState(null);
  const [isEmail, setIsEmail] = useState(false);
  const [accessLevel, setAccessLevel] = useState(initialAccessLevel);
  const [permissions, setPermissions] = useState(_defaultPermissions);
  const [loading, setLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const {
    checkUser,
    addPermissions,
    removePermissions
  } = useActions();
  const {
    t
  } = useTranslation();

  const toggleModal = () => setIsShowModal(!isShowModal);

  const dropdownOptionsMap = {
    public: t('public'),
    internal: t('forDstackaiUsersOnly'),
    private: t('forSelectedUsers')
  };
  useEffect(() => {
    setPermissions(_defaultPermissions);
    setAccessLevel(initialAccessLevel);
  }, [instancePath]);
  const checkUserName = useDebounce(userName => {
    setUserExists(null);

    if (userName.length) {
      checkUser(userName).then(data => setUserExists(data.exists)).catch(() => setUserExists(null));
    }
  }, []);

  const onChangeDropdown = value => {
    setAccessLevel(value);
    onChangeAccessLevel(value);
  };

  const onChangeUserName = event => {
    setUserName(event.target.value);

    if (isValidEmail(event.target.value).isValid && get(configInfo, 'data.email_enabled')) {
      setUserExists(null);
      setIsEmail(true);
    } else {
      checkUserName(event.target.value);
      if (isEmail) setIsEmail(false);
    }
  };

  const submitInvite = () => {
    if (userName.length) {
      const userHasPermission = permissions.some(i => i.user === userName);
      if (!userHasPermission) addUser(userName);else {
        setUserName('');
        setUserExists(null);
        setIsEmail(false);
      }
    }
  };

  const onKeyPressUserName = event => {
    if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter') {
      submitInvite();
    }
  };

  const addUser = userName => {
    setLoading(true);
    addPermissions({
      userName,
      instancePath
    }).then(data => {
      setUserName('');
      setPermissions(permissions => {
        const newPermissions = permissions.concat([data]);
        onUpdatePermissions(newPermissions);
        return newPermissions;
      });
    }).finally(() => setLoading(false));
  };

  const removeUser = user => () => {
    removePermissions({
      instancePath,
      user
    }).then(() => {
      setPermissions(permissions => {
        const newPermissions = permissions.filter(i => !isEqual(i, user));
        onUpdatePermissions(newPermissions);
        return newPermissions;
      });
    });
  };

  const renderUser = (user, index) => {
    return /*#__PURE__*/React__default.createElement("div", {
      className: cx(css$x.user, {
        disabled: !user.user
      }),
      key: index
    }, /*#__PURE__*/React__default.createElement(Avatar, {
      className: css$x.userPic,
      name: user.user || user.email
    }), /*#__PURE__*/React__default.createElement("div", {
      className: css$x.userName
    }, user.user || user.email), /*#__PURE__*/React__default.createElement("span", {
      onClick: removeUser(user),
      className: cx(css$x.userDelete, 'mdi mdi-close')
    }), user.user && /*#__PURE__*/React__default.createElement("span", {
      className: cx(css$x.userMessage, css$x.userMessageSuccess)
    }, t('done')), user.email && /*#__PURE__*/React__default.createElement("span", {
      className: css$x.userMessage
    }, t('waitingForAcceptance')));
  };

  const searchString = useMemo(() => {
    const searchString = Object.keys(_urlParams).reduce((result, key) => {
      if (_urlParams[key]) result.push(`${key}=${_urlParams[key]}`);
      return result;
    }, []).join('&');
    if (searchString) return `?${searchString}`;
  }, [_urlParams]);
  const {
    origin
  } = window.location;
  return /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$x.desktopButton, className),
    color: "primary",
    size: "small",
    variant: "contained",
    onClick: toggleModal
  }, t('share')), /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$x.mobileButton, className),
    color: "primary",
    size: "small",
    onClick: toggleModal
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-share-variant"
  })), instancePath && /*#__PURE__*/React__default.createElement(Modal, {
    isShow: isShowModal,
    onClose: toggleModal,
    size: "small",
    title: t('shareStack'),
    className: css$x.modal,
    dialogClassName: css$x.dialog,
    withCloseButton: true
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$x.description
  }, accessLevel === 'private' && t('theStackNameIsPrivateButYouCanMakeShareItWithSelectedUsers', {
    name: stackName
  }), accessLevel === 'public' && t('theStackNameIsPublic', {
    name: stackName
  }), accessLevel === 'internal' && t('theStackNameIsInternal', {
    name: stackName
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$x.copyAndDropdown
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$x.link
  }, `${origin}/${instancePath}${searchString}`), /*#__PURE__*/React__default.createElement(Copy, {
    className: css$x.copy,
    buttonTitle: null,
    copyText: `${origin}/${instancePath}${searchString}`,
    successMessage: t('linkIsCopied')
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$x.separator
  }), /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$x.dropdown,
    items: Object.keys(dropdownOptionsMap).map(key => ({
      title: dropdownOptionsMap[key],
      value: key,
      onClick: () => onChangeDropdown(key)
    }))
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$x.dropdownButton,
    color: "primary",
    size: "small"
  }, dropdownOptionsMap[accessLevel], /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-chevron-down"
  })))), /*#__PURE__*/React__default.createElement("div", {
    className: css$x.content
  }, accessLevel === 'private' && /*#__PURE__*/React__default.createElement("div", {
    className: css$x.invite
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$x.checkUserName
  }, /*#__PURE__*/React__default.createElement(TextField, {
    size: "small",
    disabled: loading,
    placeholder: get(configInfo, 'data.email_enabled') ? t('enterUsernameEmailAndPressEnter') : t('enterUsernameAndPressEnter'),
    className: css$x.inviteField,
    value: userName,
    onChange: onChangeUserName,
    onKeyPress: onKeyPressUserName
  }), Boolean(userName.length) && !loading && /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$x.checkUserMessage, {
      success: userExists,
      fail: userExists === false,
      secondary: isEmail
    })
  }, userExists && !isEmail && t('userExists'), !userExists && !isEmail && t('userNotFound'), isEmail && t('enterToInvite'))), /*#__PURE__*/React__default.createElement(Button, {
    className: css$x.inviteButton,
    size: "small",
    color: "primary",
    variant: "contained",
    disabled: loading || !isEmail && !userExists,
    onClick: submitInvite
  }, t('sendInvite'))), accessLevel === 'private' && /*#__PURE__*/React__default.createElement("div", {
    className: css$x.users
  }, permissions.map(renderUser)))));
};

var css$y = {"loader":"_styles-module__loader__2wNmt","title":"_styles-module__title__1Ms-2","stacks-pulse":"_styles-module__stacks-pulse__FjfKI","label":"_styles-module__label__1rFaq","description":"_styles-module__description__1Rg_O","diagram":"_styles-module__diagram__2Aj7C"};

const Loader$1 = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$y.loader
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$y.title
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$y.label
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$y.description
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$y.diagram
  }));
};

var css$z = {"tabs":"_styles-module__tabs__gaP0O","tab":"_styles-module__tab__vQ7S6"};

const Tabs$1 = ({
  className,
  value,
  items,
  onChange,
  disabled
}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$z.tabs, className)
  }, items.map((i, index) => /*#__PURE__*/React__default.createElement("div", {
    key: index,
    className: cx(css$z.tab, {
      active: value === i.value,
      disabled: disabled || i.disabled
    }),
    onClick: () => onChange(i.value)
  }, i.label)));
};

var css$A = {"readme":"_styles-module__readme__1PJ3A","container":"_styles-module__container__-2BiZ","header":"_styles-module__header__3iG0n","title":"_styles-module__title__g2ESz","edit":"_styles-module__edit__nlNob","content":"_styles-module__content__3ljCE","field":"_styles-module__field__3xq6J","emptyMessage":"_styles-module__emptyMessage__2_Q5X","preview":"_styles-module__preview__2KwU9","help":"_styles-module__help__PBB0u","buttons":"_styles-module__buttons__3X-XL","button":"_styles-module__button__16WI-"};

const EmptyMessage = ({
  onAdd
}) => {
  return /*#__PURE__*/React__default.createElement(Trans, {
    i18nKey: "readmeEmptyMessage"
  }, "Sure your ML model is easy to understand without README? IF no, please, ", /*#__PURE__*/React__default.createElement("a", {
    href: "#",
    onClick: onAdd
  }, "add some helpful information"), " about how to use the model.");
};

const Readme = ({
  className,
  data,
  onUpdate
}) => {
  var _currentUser$data;

  const [{
    currentUser
  }] = useAppStore();
  const currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  const category = getStackCategory({
    application: get(data, 'head.attachments[0].application'),
    contentType: get(data, 'head.attachments[0].content_type')
  });
  const {
    t
  } = useTranslation();
  const textareaRef = useRef(null);
  const [value, setValue] = useState(data.readme);
  const [isEdit, setIsEdit] = useState(false);
  useEffect(() => {
    if (isEdit && (textareaRef === null || textareaRef === void 0 ? void 0 : textareaRef.current)) {
      textareaRef.current.focus();
      if (textareaRef.current.setSelectionRange) textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [isEdit]);

  const edit = () => setIsEdit(true);

  const cancel = () => {
    setIsEdit(false);
    setValue(data.readme);
  };

  const save = () => {
    onUpdate(value);
    setIsEdit(false);
  };

  const onAddReadme = event => {
    event.preventDefault();
    edit();
  };

  const onChange = event => {
    setValue(event.target.value);
  };

  if (!(data === null || data === void 0 ? void 0 : data.readme) && data.user !== currentUserName || category !== 'mlModel') return null;
  return /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$A.readme, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$A.container
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$A.header
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$A.title
  }, t('readme')), data.user === currentUserName && !isEdit && /*#__PURE__*/React__default.createElement(Button, {
    color: 'secondary',
    className: css$A.edit,
    onClick: edit
  }, /*#__PURE__*/React__default.createElement("span", {
    className: 'mdi mdi-pencil'
  }))), /*#__PURE__*/React__default.createElement("div", {
    className: css$A.content
  }, !isEdit && !data.readme && /*#__PURE__*/React__default.createElement("div", {
    className: css$A.emptyMessage
  }, /*#__PURE__*/React__default.createElement(EmptyMessage, {
    onAdd: onAddReadme
  })), isEdit && /*#__PURE__*/React__default.createElement(TextAreaField, {
    ref: textareaRef,
    onChange: onChange,
    className: css$A.field,
    value: value
  }), !isEdit && data.readme && /*#__PURE__*/React__default.createElement("div", {
    className: css$A.preview
  }, /*#__PURE__*/React__default.createElement(ReactMarkdown, null, data.readme)))), isEdit && /*#__PURE__*/React__default.createElement("div", {
    className: css$A.help
  }, ' **Strong** # Title `code` - List'), isEdit && /*#__PURE__*/React__default.createElement("div", {
    className: css$A.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    size: "small",
    variant: "contained",
    color: "secondary",
    onClick: cancel,
    className: css$A.button
  }, t('cancel')), /*#__PURE__*/React__default.createElement(Button, {
    size: "small",
    color: "primary",
    variant: "contained",
    onClick: save,
    className: css$A.button
  }, t('save')))));
};

const validationMap = {
  required: isRequired,
  email: isEmail,
  'no-spaces-stack': noSpaces,
  'stack-name': isValidStackName
};

const getValidationFunction = validator => {
  if (typeof validator === 'string' && validationMap[validator]) return validationMap[validator];
  if (typeof validator === 'function') return validator;
  return () => true;
};

var useForm = ((initialFormState, fieldsValidators = {}) => {
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  const onChange = (eventOrName, value) => {
    let name;
    let fieldValue;

    if (eventOrName.target) {
      const event = eventOrName;
      fieldValue = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      name = event.target.name;
    } else {
      name = eventOrName;
      fieldValue = value;
    }

    setForm({ ...form,
      [name]: fieldValue
    });
    setFormErrors({ ...formErrors,
      [name]: []
    });
  };

  const resetForm = () => {
    setForm(initialFormState);
    setFormErrors({});
  };

  const getFieldErrors = fieldName => {
    const errors = [];
    if (Array.isArray(fieldsValidators[fieldName])) fieldsValidators[fieldName].forEach(validator => {
      const isValid = getValidationFunction(validator);
      if (!isValid(form[fieldName])) errors.push(validator);
    });

    if (typeof fieldsValidators[fieldName] === 'string') {
      const isValid = getValidationFunction(fieldsValidators[fieldName]);
      if (!isValid(form[fieldName])) errors.push(fieldsValidators[fieldName]);
    }

    return errors;
  };

  const checkValidForm = () => {
    let isValid = true;
    const newFormErrors = {};
    Object.keys(fieldsValidators).forEach(fieldName => {
      const errors = getFieldErrors(fieldName);
      newFormErrors[fieldName] = errors;
      isValid = isValid && !errors.length;
    });
    setFormErrors(newFormErrors);
    return isValid;
  };

  return {
    form,
    setForm,
    formErrors,
    setFormErrors,
    resetForm,
    onChange,
    checkValidForm
  };
});

var css$B = {"details":"_styles-module__details__3iAZb","header":"_styles-module__header__2kekg","backButton":"_styles-module__backButton__1cfLo","title":"_styles-module__title__1zGvd","permissions":"_styles-module__permissions__3ydGO","sideHeader":"_styles-module__sideHeader__1FUDu","share":"_styles-module__share__2kaMN","dropdown":"_styles-module__dropdown__3axDI","description":"_styles-module__description__Y6gJz","label":"_styles-module__label__2FemD","label-tooltip":"_styles-module__label-tooltip__2Oe5S","actions":"_styles-module__actions__sZkKa","size":"_styles-module__size__Ja107","revisions":"_styles-module__revisions__bLqAO","tabs":"_styles-module__tabs__3mpfk","container":"_styles-module__container__3_I7R","withFilters":"_styles-module__withFilters__3exQh","filters":"_styles-module__filters__1-hdZ","attachment":"_styles-module__attachment__3IGZo","readme":"_styles-module__readme__mADeQ"};

const Details = ({
  currentFrameId,
  headId,
  onChangeHeadFrame,
  attachmentIndex,
  onChangeAttachmentIndex,
  downloadAttachment,
  onChangeFrame,
  onUpdateReadme,
  data,
  frame,
  loading,
  currentUser,
  backUrl,
  user,
  stack,
  changeAccessLevel,
  updatePermissions
}) => {
  var _data$head;

  const {
    t
  } = useTranslation();
  const didMountRef = useRef(false);
  const {
    form,
    setForm,
    onChange
  } = useForm({});
  const [activeTab, setActiveTab] = useState();
  const [fields, setFields] = useState({});
  const [tabs, setTabs] = useState([]);
  const prevFrame = usePrevious(frame);
  useEffect(() => {
    if ((!isEqual(prevFrame, frame) || !didMountRef.current) && frame) parseTabs();
  }, [frame]);
  const findAttach = useCallback((form, tabName, attachmentIndex) => {
    const attachments = get(frame, 'attachments');
    const fields = Object.keys(form);
    const tab = tabs.find(t => t.value === tabName);
    if (!attachments) return;

    if (fields.length || tabs.length) {
      attachments.some((attach, index) => {
        var _attach$params$tab$va, _attach$params$tab$ke;

        let valid = true;
        if (tab && ((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) !== 'tab' && ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) !== tab.value) return false;
        fields.forEach(key => {
          if (!attach.params || !isEqual(attach.params[key], form[key])) valid = false;
        });
        if (valid && !(attachmentIndex === undefined && index === 0)) onChangeAttachmentIndex(index);
        return valid;
      });
    }
  }, [tabs]);
  const findAttachDebounce = useCallback(debounce(findAttach, 300), [data, frame, findAttach]);
  useEffect(() => {
    if (didMountRef.current) findAttachDebounce(form, activeTab, attachmentIndex);
  }, [form]);
  useEffect(() => {
    if (didMountRef.current) parseParams();
  }, [activeTab]);
  useEffect(() => {
    if (!didMountRef.current) didMountRef.current = true;
  }, []);

  const getCurrentAttachment = selectedTab => {
    const attachments = get(frame, 'attachments');
    let attachment;

    if (selectedTab) {
      attachment = attachments.find(attach => {
        var _attach$params$select, _attach$params$select2;

        return ((_attach$params$select = attach.params[selectedTab.value]) === null || _attach$params$select === void 0 ? void 0 : _attach$params$select.type) === 'tab' || ((_attach$params$select2 = attach.params[selectedTab.key]) === null || _attach$params$select2 === void 0 ? void 0 : _attach$params$select2.title) === selectedTab.value;
      });
    } else if (attachmentIndex !== undefined) {
      if (attachments[attachmentIndex]) {
        attachment = attachments[attachmentIndex];
      }
    } else {
      attachment = attachments[0];
    }

    return attachment;
  };

  const parseTabs = () => {
    const attachments = get(frame, 'attachments');
    if (!attachments || !attachments.length) return;
    const tabs = parseStackTabs(attachments);
    const attachment = getCurrentAttachment();
    setTabs(tabs);

    if (attachment) {
      var _params$tab;

      const params = { ...attachment.params
      };
      const tab = Object.keys(params).find(key => {
        var _params$key;

        return ((_params$key = params[key]) === null || _params$key === void 0 ? void 0 : _params$key.type) === 'tab';
      });
      setActiveTab(((_params$tab = params[tab]) === null || _params$tab === void 0 ? void 0 : _params$tab.title) || tab || null);
    }
  };

  const parseParams = () => {
    const attachments = get(frame, 'attachments');
    const tab = tabs.find(t => t.value === activeTab);
    const attachment = getCurrentAttachment(tab);
    const fields = parseStackParams(attachments, tab);
    setFields(fields);

    if (attachment) {
      const params = { ...attachment.params
      };

      const _tab = Object.keys(params).find(key => {
        var _params$key2;

        return ((_params$key2 = params[key]) === null || _params$key2 === void 0 ? void 0 : _params$key2.type) === 'tab';
      });

      delete params[_tab];
      setForm(params);
    }
  };

  const onChangeTab = tabName => {
    findAttachDebounce(form, tabName, attachmentIndex);
    setActiveTab(tabName);
  };

  if (loading) return /*#__PURE__*/React__default.createElement(Loader$1, null);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$B.details)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$B.header
  }, /*#__PURE__*/React__default.createElement(BackButton, {
    className: css$B.backButton,
    Component: Link,
    to: backUrl
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$B.title
  }, data.name, /*#__PURE__*/React__default.createElement("span", {
    className: `mdi mdi-lock${data['access_level'] === 'private' ? '' : '-open'}`
  })), data['access_level'] === 'private' && /*#__PURE__*/React__default.createElement(PermissionUsers, {
    className: css$B.permissions,
    permissions: data.permissions
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$B.sideHeader
  }, data && data.user === currentUser && /*#__PURE__*/React__default.createElement(Share, {
    stackName: stack,
    instancePath: `${user}/${stack}`,
    onChangeAccessLevel: changeAccessLevel,
    className: css$B.share,
    accessLevel: data['access_level'],
    defaultPermissions: data.permissions,
    urlParams: {
      a: attachmentIndex ? attachmentIndex : null,
      f: (frame === null || frame === void 0 ? void 0 : frame.id) !== (data === null || data === void 0 ? void 0 : (_data$head = data.head) === null || _data$head === void 0 ? void 0 : _data$head.id) ? frame === null || frame === void 0 ? void 0 : frame.id : null
    },
    onUpdatePermissions: permissions => updatePermissions(`${user}/${stack}`, permissions)
  }))), Boolean(tabs.length) && /*#__PURE__*/React__default.createElement(Tabs$1, {
    className: css$B.tabs,
    onChange: onChangeTab,
    value: activeTab,
    items: tabs
  }), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$B.container, {
      [css$B.withFilters]: Object.keys(fields).length
    })
  }, /*#__PURE__*/React__default.createElement(StackFilters, {
    fields: fields,
    form: form,
    onChange: onChange,
    className: cx(css$B.filters)
  }), frame && /*#__PURE__*/React__default.createElement(Attachment, {
    className: css$B.attachment,
    withLoader: true,
    stack: `${user}/${stack}`,
    frameId: frame.id,
    id: attachmentIndex || 0
  })), data && /*#__PURE__*/React__default.createElement(Readme, {
    className: css$B.readme,
    data: data,
    onUpdate: onUpdateReadme
  }));
};

var css$C = {"loader":"_styles-module__loader__31Z5G","side":"_styles-module__side__k2iUe","filter-pulse":"_styles-module__filter-pulse__vad3r","content":"_styles-module__content__kUkc8"};

const Loader$2 = ({
  className
}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$C.loader, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$C.side
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$C.content
  }));
};

var css$D = {"progress":"_styles-module__progress__1PIt0","percent":"_styles-module__percent__m5cJQ","bar":"_styles-module__bar__1v1JQ","label":"_styles-module__label__1xBAh"};

const Progress = ({
  isActive: _isActive = true,
  className,
  message
}) => {
  const {
    t
  } = useTranslation();
  const [progress, setProgress] = useState(0);
  const step = useRef(0.01);
  const currentProgress = useRef(0);
  const prevIsActive = usePrevious(_isActive);
  const requestFrame = useRef(null);
  const isActiveRef = useRef(false);
  useEffect(() => {
    isActiveRef.current = _isActive;

    if (_isActive) {
      setProgress(0);
      step.current = 0.01;
      currentProgress.current = 0;
      startCalculateProgress();
    }

    if (prevIsActive === true && _isActive === false) {
      setProgress(100);
      setTimeout(() => setProgress(0), 800);
    }

    if (_isActive === null) {
      setProgress(0);
    }

    if (!_isActive && requestFrame.current) {
      cancelAnimationFrame(requestFrame.current);
    }
  }, [_isActive]);

  const calculateProgress = () => {
    currentProgress.current += step.current;
    const progress = Math.round(Math.atan(currentProgress.current) / (Math.PI / 2) * 100 * 1000) / 1000;
    setProgress(progress);
    if (progress > 70) step.current = 0.005;
    if (progress >= 100 || !isActiveRef.current) cancelAnimationFrame(requestFrame.current);
    if (isActiveRef.current) requestFrame.current = requestAnimationFrame(calculateProgress);
  };

  const startCalculateProgress = () => {
    requestAnimationFrame(calculateProgress);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$D.progress, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$D.percent
  }, Math.floor(progress), " %"), /*#__PURE__*/React__default.createElement("div", {
    className: css$D.bar
  }, /*#__PURE__*/React__default.createElement("div", {
    style: {
      width: `${progress}%`
    }
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$D.label
  }, message));
};

const api$1 = apiFabric();
var actions$1 = (() => {
  const [{
    apiUrl
  }] = useAppStore();

  const executeStack = params => {
    return new Promise(async (resolve, reject) => {
      try {
        const request = await api$1.post(apiUrl + config.APPS_EXECUTE, params);
        resolve(request.data);
      } catch (e) {
        reject(e);
      }
    });
  };

  const pollStack = ({
    id
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const request = await api$1.get(apiUrl + config.APPS_POLL + `?id=${id}`);
        resolve(request.data);
      } catch (e) {
        reject(e);
      }
    });
  };

  return {
    executeStack,
    pollStack
  };
});

var css$E = {"details":"_styles-module__details__ti47L","header":"_styles-module__header__1-me2","backButton":"_styles-module__backButton__1ERQl","title":"_styles-module__title__1ZJdY","permissions":"_styles-module__permissions__3X_XO","sideHeader":"_styles-module__sideHeader__1w9C6","share":"_styles-module__share__2sRwt","dropdown":"_styles-module__dropdown__1fs1J","description":"_styles-module__description__3dUVb","label":"_styles-module__label__1JQAe","label-tooltip":"_styles-module__label-tooltip__15gJa","actions":"_styles-module__actions__2mMuP","size":"_styles-module__size__2GzG9","revisions":"_styles-module__revisions__1t1sR","tabs":"_styles-module__tabs__1iRHh","container":"_styles-module__container__2Ro1o","withSidebar":"_styles-module__withSidebar__3dv-r","filters":"_styles-module__filters__283Wj","filterLoader":"_styles-module__filterLoader__7OdCa","attachment":"_styles-module__attachment__1QLqg","progress":"_styles-module__progress__HhauM","emptyMessage":"_styles-module__emptyMessage__16j-R","error":"_styles-module__error__2FCD_","message":"_styles-module__message__nbe6T","logs":"_styles-module__logs__36zNW","logsButton":"_styles-module__logsButton__1K-0S","logsExpand":"_styles-module__logsExpand__1YGSB","fromAgo":"_styles-module__fromAgo__2urIx","log":"_styles-module__log__3Aob9","readme":"_styles-module__readme__19inZ"};

const REFRESH_INTERVAL = 1000;
const STATUSES = Object.freeze({
  READY: 'READY',
  SCHEDULED: 'SCHEDULED',
  RUNNING: 'RUNNING',
  FINISHED: 'FINISHED',
  FAILED: 'FAILED'
});

const Details$1 = ({
  currentFrameId,
  headId,
  executionId,
  onChangeExecutionId,
  onChangeHeadFrame,
  attachmentIndex,
  onChangeAttachmentIndex,
  onChangeFrame,
  onUpdateReadme,
  data,
  frame,
  loading,
  currentUser,
  backUrl,
  user,
  stack,
  changeAccessLevel,
  updatePermissions
}) => {
  var _data$head;

  const {
    t
  } = useTranslation();
  const didMountRef = useRef(false);
  const {
    form,
    setForm,
    onChange
  } = useForm({});
  const [fields, setFields] = useState({});
  const [logsExpand, setExpandLogs] = useState(false);
  const [executeData, setExecuteData] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [appAttachment, setAppAttachment] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [activeTab, setActiveTab] = useState();
  const [tabs, setTabs] = useState([]);
  const prevFrame = usePrevious(frame);
  const {
    executeStack,
    pollStack
  } = actions$1();

  const getFormFromViews = views => {
    if (!views || !Array.isArray(views)) return {};
    return views.reduce((result, view, index) => {
      switch (view.type) {
        case 'ApplyView':
          return result;

        case 'SliderView':
          result[index] = view.data[view.selected];
          break;

        case 'ComboBoxView':
          result[index] = view.selected;
          break;

        case 'CheckBoxView':
          result[index] = view.selected;
          break;

        default:
          result[index] = view.data;
      }

      return result;
    }, {});
  };

  const setActiveExecutionId = value => {
    if (typeof onChangeExecutionId === 'function') onChangeExecutionId(value);

    if (tabs.length && activeTab) {
      const tabIndex = tabs.findIndex(t => t.value === activeTab);

      if (tabIndex >= 0) {
        tabs[tabIndex].executionId = value;
        setTabs(tabs);
      }
    }
  };

  const updateExecuteData = data => {
    const fields = parseStackViews(data === null || data === void 0 ? void 0 : data.views);
    const form = getFormFromViews(data === null || data === void 0 ? void 0 : data.views);
    setFields(fields);
    setForm(form);
    setExecuteData({
      lastUpdate: Date.now(),
      ...data
    });
  };

  const hasApplyButton = () => {
    if (!(executeData === null || executeData === void 0 ? void 0 : executeData.views) || !Array.isArray(executeData.views)) return false;
    return executeData.views.some(view => view.type === 'ApplyView');
  };

  const submit = (form, apply = true) => {
    setExecuting(true);
    if (apply) setCalculating(true);else {
      setAppAttachment(null);
      setActiveExecutionId(undefined);
    }
    executeStack({
      user: data.user,
      stack: data.name,
      frame: frame === null || frame === void 0 ? void 0 : frame.id,
      attachment: attachmentIndex || 0,
      apply,
      views: executeData.views && executeData.views.map((view, index) => {
        switch (view.type) {
          case 'ApplyView':
            return view;

          case 'CheckBoxView':
            view.selected = form[index];
            break;

          case 'ComboBoxView':
            view.selected = form[index];
            break;

          case 'SliderView':
            view.selected = view.data.findIndex(i => i === form[index]);
            break;

          default:
            view.data = form[index];
        }

        return view;
      })
    }).then(data => {
      setExecuting(false);
      setError(null);
      updateExecuteData(data);

      if (apply) {
        checkFinished({
          id: data.id,
          isUpdateData: apply
        });
        setActiveExecutionId(data.id);
      }
    }).catch(() => {
      setExecuting(false);
      setCalculating(false);
      setError({
        status: null
      });
    });
  };

  useDebounce$1(() => {
    if (!isEqual(form, getFormFromViews(executeData === null || executeData === void 0 ? void 0 : executeData.views)) && !executing) {
      submit(form, !!(!hasApplyButton() && appAttachment));
    }
  }, 300, [form]);

  const onApply = () => submit(form);

  useEffect(() => {
    if (executeData && executeData.status === STATUSES.READY && !appAttachment && !executing) {
      if (!hasApplyButton()) submit(form, true);
    }
  }, [executeData]);
  useEffect(() => {
    if ((data === null || data === void 0 ? void 0 : data.user) && (data === null || data === void 0 ? void 0 : data.name) && frame && !loading) {
      if (!executionId || !isEqual(frame, prevFrame)) {
        setExecuting(true);
        setExecuteData(null);
        setAppAttachment(null);
        executeStack({
          user: data.user,
          stack: data.name,
          frame: frame === null || frame === void 0 ? void 0 : frame.id,
          attachment: attachmentIndex || 0
        }).then(data => {
          setExecuting(false);
          setError(null);
          updateExecuteData(data);

          if (data.status === STATUSES.SCHEDULED) {
            setIsScheduled(true);
            checkFinished({
              id: data.id,
              isUpdateData: true
            });
          }
        }).catch(error => {
          setExecuting(false);
          setError({
            status: null
          });
        });
      } else {
        setExecuting(true);
        setCalculating(true);
        setAppAttachment(null);
        checkFinished({
          id: executionId,
          isUpdateData: true
        });
      }
    }
  }, [data, frame, attachmentIndex]);
  useEffect(() => {
    if ((!isEqual(prevFrame, frame) || !didMountRef.current) && frame) parseTabs();
  }, [frame]);
  useEffect(() => {
    if (!didMountRef.current) didMountRef.current = true;
    return () => {
      didMountRef.current = false;
    };
  }, []);

  const getCurrentAttachment = selectedTab => {
    const attachments = get(frame, 'attachments');
    let attachment;

    if (selectedTab) {
      attachment = attachments.find(attach => {
        var _attach$params$select, _attach$params$select2;

        return ((_attach$params$select = attach.params[selectedTab.value]) === null || _attach$params$select === void 0 ? void 0 : _attach$params$select.type) === 'tab' || ((_attach$params$select2 = attach.params[selectedTab.key]) === null || _attach$params$select2 === void 0 ? void 0 : _attach$params$select2.title) === selectedTab.value;
      });
    } else if (attachmentIndex !== undefined) {
      if (attachments[attachmentIndex]) {
        attachment = attachments[attachmentIndex];
      }
    } else {
      attachment = attachments[0];
    }

    return attachment;
  };

  const parseTabs = () => {
    const attachments = get(frame, 'attachments');
    if (!attachments || !attachments.length) return;
    const tabs = parseStackTabs(attachments);
    const attachment = getCurrentAttachment();
    setTabs(tabs);

    if (attachment) {
      var _params$tab;

      const params = { ...attachment.params
      };
      const tab = Object.keys(params).find(key => {
        var _params$key;

        return ((_params$key = params[key]) === null || _params$key === void 0 ? void 0 : _params$key.type) === 'tab';
      });
      setActiveTab(((_params$tab = params[tab]) === null || _params$tab === void 0 ? void 0 : _params$tab.title) || tab || null);
    }
  };

  const onChangeTab = tabName => {
    setActiveTab(tabName);
    const attachments = get(frame, 'attachments');
    const tab = tabs.find(t => t.value === tabName);
    if (!attachments) return;

    if (tabs.length) {
      attachments.some((attach, index) => {
        var _attach$params$tab$va, _attach$params$tab$ke;

        if (tab && ((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) !== 'tab' && ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) !== tab.value) return false;
        if (onChangeExecutionId) onChangeExecutionId(tab.executionId);
        setExecuteData(null);
        onChangeAttachmentIndex(index);
        return true;
      });
    }
  };

  const checkFinished = ({
    id,
    isUpdateData
  }) => {
    pollStack({
      id: id
    }).then(data => {
      setIsScheduled(data.status === STATUSES.SCHEDULED);
      if ([STATUSES.SCHEDULED, STATUSES.RUNNING].indexOf(data.status) >= 0) if (didMountRef.current) setTimeout(() => {
        checkFinished({
          id: data.id,
          isUpdateData
        });
      }, REFRESH_INTERVAL);

      if ([STATUSES.FINISHED, STATUSES.FAILED, STATUSES.READY].indexOf(data.status) >= 0) {
        setCalculating(false);
      }

      if ([STATUSES.FINISHED, STATUSES.READY].indexOf(data.status) >= 0) {
        if (data.output) setAppAttachment(data.output);

        if (isUpdateData) {
          setExecuting(false);
          updateExecuteData(data);
        } else {
          setExecuteData({ ...executeData,
            logs: data.logs,
            date: Date.now()
          });
        }
      }

      if (data.status === STATUSES.FAILED) {
        if (isUpdateData) {
          setExecuting(false);
          updateExecuteData(data);
        } else {
          setExecuteData({ ...executeData,
            logs: data.logs,
            date: Date.now()
          });
        }

        setActiveExecutionId(null);
        setError({
          status: data.status
        });
      }
    });
  };

  if (loading) return /*#__PURE__*/React__default.createElement(Loader$1, null);
  const withSidebar = Object.keys(fields).some((key, index) => {
    if (fields[key].type === 'textarea') return true;
    return index >= 3;
  });
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$E.details)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$E.header
  }, /*#__PURE__*/React__default.createElement(BackButton, {
    className: css$E.backButton,
    Component: Link,
    to: backUrl
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$E.title
  }, data.name, /*#__PURE__*/React__default.createElement("span", {
    className: `mdi mdi-lock${data['access_level'] === 'private' ? '' : '-open'}`
  })), data['access_level'] === 'private' && /*#__PURE__*/React__default.createElement(PermissionUsers, {
    className: css$E.permissions,
    permissions: data.permissions
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$E.sideHeader
  }, data && data.user === currentUser && /*#__PURE__*/React__default.createElement(Share, {
    instancePath: `${user}/${stack}`,
    stackName: stack,
    onChangeAccessLevel: changeAccessLevel,
    className: css$E.share,
    accessLevel: data['access_level'],
    defaultPermissions: data.permissions,
    urlParams: {
      a: attachmentIndex ? attachmentIndex : null,
      f: (frame === null || frame === void 0 ? void 0 : frame.id) !== (data === null || data === void 0 ? void 0 : (_data$head = data.head) === null || _data$head === void 0 ? void 0 : _data$head.id) ? frame === null || frame === void 0 ? void 0 : frame.id : null,
      'execution_id': executionId
    },
    onUpdatePermissions: permissions => updatePermissions(`${user}/${stack}`, permissions)
  }))), Boolean(tabs.length) && /*#__PURE__*/React__default.createElement(Tabs$1, {
    className: css$E.tabs,
    onChange: onChangeTab,
    value: activeTab,
    disabled: executing || calculating,
    items: tabs
  }), !executeData && executing && /*#__PURE__*/React__default.createElement("div", {
    className: css$E.container
  }, /*#__PURE__*/React__default.createElement(Loader$2, {
    className: css$E.filterLoader
  })), executeData && /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$E.container, {
      [css$E.withSidebar]: withSidebar
    })
  }, /*#__PURE__*/React__default.createElement(StackFilters, {
    fields: fields,
    form: form,
    onChange: onChange,
    onApply: onApply,
    className: cx(css$E.filters),
    isSidebar: withSidebar,
    disabled: executing || calculating
  }), appAttachment && !calculating && /*#__PURE__*/React__default.createElement(Attachment, {
    className: css$E.attachment,
    stack: `${user}/${stack}`,
    customData: appAttachment
  }), calculating && !isScheduled && /*#__PURE__*/React__default.createElement(Progress, {
    className: css$E.progress,
    message: t('calculatingTheData')
  }), !appAttachment && !error && isScheduled && /*#__PURE__*/React__default.createElement(Progress, {
    className: css$E.progress,
    message: t('initializingTheApplication')
  }), !calculating && !executing && !appAttachment && !error && !isScheduled && /*#__PURE__*/React__default.createElement("div", {
    className: css$E.emptyMessage
  }, t('clickApplyToSeeTheResult')), !calculating && !executing && error && /*#__PURE__*/React__default.createElement("div", {
    className: css$E.error
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$E.message
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-alert-circle-outline"
  }), " ", t('appStackError'))), executeData.logs && /*#__PURE__*/React__default.createElement("div", {
    className: css$E.logs
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$E.logsButton,
    color: "primary",
    onClick: () => setExpandLogs(value => !value),
    size: "small"
  }, t('logs'), /*#__PURE__*/React__default.createElement("span", {
    className: `mdi mdi-arrow-${logsExpand ? 'collapse' : 'expand'}`
  })), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$E.logsExpand, {
      open: logsExpand
    })
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$E.fromAgo
  }, t('updated'), " ", moment(executeData.date).fromNow()), /*#__PURE__*/React__default.createElement("div", {
    className: css$E.log
  }, executeData.logs)))), data && /*#__PURE__*/React__default.createElement(Readme, {
    className: css$E.readme,
    data: data,
    onUpdate: onUpdateReadme
  }));
};

var css$F = {"upload":"_style-module__upload__1HGtr","content":"_style-module__content__zyXjr","subtitle":"_style-module__subtitle__2QLXi","field":"_style-module__field__2kyid","dragndrop":"_style-module__dragndrop__1_81H","buttons":"_style-module__buttons__1PXB0","button":"_style-module__button__1nx-b"};

const MB = 1048576;

const Upload = ({
  stack,
  className,
  isShow,
  onClose,
  refresh,
  withButton,
  apiUrl,
  user
}) => {
  const {
    t
  } = useTranslation();
  const [isShowModal, setIsShowModal] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [progress, setProgress] = useState(null);
  const [file, setFile] = useState(null);
  const isDidMount = useRef(true);
  const {
    form,
    onChange,
    formErrors,
    checkValidForm
  } = useForm({
    stack: stack || ''
  }, {
    stack: ['required', 'no-spaces-stack', 'stack-name']
  });
  const runValidation = useDebounce(checkValidForm);
  useEffect(() => {
    if (!isDidMount.current) runValidation();else isDidMount.current = false;
  }, [form.stack]);
  useEffect(() => {
    if (isShow !== undefined) setIsShowModal(isShow);
  }, [isShow]);

  const toggleModal = () => setIsShowModal(!isShowModal);

  const closeHandle = () => {
    if (onClose) onClose();else setIsShowModal(false);
  };

  const getErrorsText = fieldName => {
    if (formErrors[fieldName] && formErrors[fieldName].length) return [t(`formErrors.${formErrors[fieldName][0]}`)];
  };

  const submit = async () => {
    setProgress(null);
    setUploading(true);
    const params = {
      type: file.type,
      timestamp: Date.now(),
      id: v4(),
      stack: `${user}/${form.stack}`,
      size: file.size
    };
    if (file.size > MB) params.attachments = [{
      length: file.size
    }];else params.attachments = [{
      data: await fileToBase64(file)
    }];

    try {
      const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
      const {
        data
      } = await axios({
        method: 'post',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        baseURL: apiUrl,
        url: config.STACK_PUSH,
        data: params
      });

      if (data.attachments && data.attachments.length) {
        const [attachment] = data.attachments;

        if (attachment['upload_url']) {
          await axios.put(attachment['upload_url'], file, {
            headers: {
              'Content-Type': 'application/octet-stream'
            },
            onUploadProgress: progressEvent => {
              const percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total);
              setProgress(percentCompleted);
            }
          });
        }
      }

      setUploading(false);
      closeHandle();
      if (refresh) refresh();
    } catch (e) {
      closeHandle();
    }
  };

  return /*#__PURE__*/React__default.createElement(Fragment, null, withButton && /*#__PURE__*/React__default.createElement(Tooltip, {
    overlayContent: t('uploadTooltip')
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$F.upload, className),
    size: "small",
    color: "secondary",
    onClick: toggleModal
  }, t('upload'))), /*#__PURE__*/React__default.createElement(Modal, {
    title: t('uploadFile'),
    isShow: isShowModal,
    size: "small"
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$F.content
  }, !stack && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    className: css$F.subtitle
  }, t('theUploadedFileWouldBeSavedAsANewStack')), /*#__PURE__*/React__default.createElement(TextField, {
    size: "middle",
    className: css$F.field,
    name: "stack",
    onChange: onChange,
    value: form.value,
    maxLength: 30,
    placeholder: `${t('stackName')}, ${t('noSpaces')}, ${t('maxSymbol', {
      count: 30
    })}`,
    errors: getErrorsText('stack')
  })), stack && file && /*#__PURE__*/React__default.createElement("div", {
    className: css$F.subtitle
  }, t('theUploadedFileWouldBeSavedAsANewRevisionOfTheStack')), /*#__PURE__*/React__default.createElement(FileDragnDrop$1, {
    className: css$F.dragndrop,
    formats: ['.csv', '.png', '.svg', '.jpg'],
    onChange: setFile,
    loading: uploading,
    progressPercent: progress
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$F.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$F.button,
    variant: "contained",
    color: "primary",
    disabled: !file || !form.stack.length || uploading,
    onClick: submit
  }, t('save')), /*#__PURE__*/React__default.createElement(Button, {
    onClick: closeHandle,
    className: css$F.button,
    variant: "contained",
    color: "secondary",
    disabled: uploading
  }, t('cancel')))));
};

var css$G = {"upload":"_style-module__upload__2UOiz","content":"_style-module__content__22x3Q","subtitle":"_style-module__subtitle__2sXDC","field":"_style-module__field__3icVJ","dragndrop":"_style-module__dragndrop__30Hxh","buttons":"_style-module__buttons__3VDuj","button":"_style-module__button__2bzId"};

const MB$1 = 1048576;

const Upload$1 = ({
  stack,
  className,
  refresh,
  apiUrl,
  user
}) => {
  const {
    t
  } = useTranslation();
  const [uploading, setUploading] = useState(null);
  const [progress, setProgress] = useState(null);
  const [file, setFile] = useState(null);
  const isDidMount = useRef(true);
  const fileFieldRef = useRef(null);
  const {
    form,
    onChange,
    setForm,
    formErrors,
    checkValidForm
  } = useForm({
    stack: stack || ''
  }, {
    stack: ['required', 'no-spaces-stack', 'stack-name']
  });
  const runValidation = useDebounce(checkValidForm);
  useEffect(() => {
    if (!isDidMount.current) runValidation();else isDidMount.current = false;
  }, [form.stack]);

  const clearForm = () => {
    setFile(null);
    setForm({
      stack: ''
    });
    if (fileFieldRef.current) fileFieldRef.current.clear();
  };

  const getErrorsText = fieldName => {
    if (formErrors[fieldName] && formErrors[fieldName].length) return [t(`formErrors.${formErrors[fieldName][0]}`)];
  };

  const submit = async () => {
    setProgress(null);
    setUploading(true);
    const params = {
      type: file.type,
      timestamp: Date.now(),
      id: v4(),
      stack: `${user}/${form.stack}`,
      size: file.size
    };
    if (file.size > MB$1) params.attachments = [{
      length: file.size
    }];else params.attachments = [{
      data: await fileToBase64(file)
    }];

    try {
      const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
      const {
        data
      } = await axios({
        method: 'post',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        baseURL: apiUrl,
        url: config.STACK_PUSH,
        data: params
      });

      if (data.attachments && data.attachments.length) {
        const [attachment] = data.attachments;

        if (attachment['upload_url']) {
          await axios.put(attachment['upload_url'], file, {
            headers: {
              'Content-Type': 'application/octet-stream'
            },
            onUploadProgress: progressEvent => {
              const percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total);
              setProgress(percentCompleted);
            }
          });
        }
      }

      setUploading(false);
      if (refresh) refresh();
      clearForm();
    } catch (e) {
      console.log(e);
      clearForm();
    }
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$G.upload, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$G.content
  }, !stack && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    className: css$G.subtitle
  }, t('stackName')), /*#__PURE__*/React__default.createElement(TextField, {
    size: "middle",
    className: css$G.field,
    name: "stack",
    onChange: onChange,
    value: form.value,
    maxLength: 30,
    placeholder: `${t('stackName')}, ${t('noSpaces')}, ${t('maxSymbol', {
      count: 30
    })}`,
    errors: getErrorsText('stack')
  })), stack && file && /*#__PURE__*/React__default.createElement("div", {
    className: css$G.subtitle
  }, t('theUploadedFileWouldBeSavedAsANewRevisionOfTheStack')), /*#__PURE__*/React__default.createElement(FileDragnDrop$1, {
    ref: fileFieldRef,
    className: css$G.dragndrop,
    formats: ['.csv', '.png', '.svg', '.jpg'],
    onChange: setFile,
    loading: uploading,
    progressPercent: progress
  })), file && /*#__PURE__*/React__default.createElement("div", {
    className: css$G.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$G.button,
    variant: "contained",
    color: "primary",
    disabled: !file || !form.stack.length || uploading,
    onClick: submit
  }, t('save')), /*#__PURE__*/React__default.createElement(Button, {
    onClick: clearForm,
    className: css$G.button,
    variant: "contained",
    color: "secondary",
    disabled: uploading
  }, t('cancel'))));
};

var css$H = {"howto":"_styles-module__howto__362z-","tabs":"_styles-module__tabs__h6zun","description":"_styles-module__description__SODNv","code":"_styles-module__code__WU2Z-","footer":"_styles-module__footer__1DRv-"};

const UploadStack = ({
  user,
  refresh,
  apiUrl,
  configurePythonCommand,
  withFileUpload
}) => {
  const {
    t
  } = useTranslation();
  const [activeCodeTab, setActiveCodeTab] = useState(1);
  const [activePublishTab, setActivePublishTab] = useState(1);
  const tabs = [{
    label: t('python'),
    value: 1
  }];
  const publishTabs = [{
    label: t('model'),
    value: 1
  }, {
    label: t('chart'),
    value: 2
  }];
  if (withFileUpload) tabs.push({
    label: t('upload'),
    value: 3
  });
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$H.howto
  }, tabs.length > 1 && /*#__PURE__*/React__default.createElement(Tabs, {
    className: css$H.tabs,
    value: activeCodeTab,
    onChange: setActiveCodeTab,
    tabs: tabs
  }), activeCodeTab === 1 && /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("div", {
    className: css$H.description
  }, t('installPipPackage')), /*#__PURE__*/React__default.createElement(CodeViewer, {
    className: css$H.code,
    language: "bash"
  }, "pip install dstack"), /*#__PURE__*/React__default.createElement("div", {
    className: css$H.description
  }, t('configureDStack')), /*#__PURE__*/React__default.createElement(CodeViewer, {
    className: css$H.code,
    language: "bash"
  }, configurePythonCommand), /*#__PURE__*/React__default.createElement("div", {
    className: css$H.description
  }, t('reportPlotIntro')), /*#__PURE__*/React__default.createElement(Tabs, {
    className: css$H.tabs,
    value: activePublishTab,
    onChange: setActivePublishTab,
    tabs: publishTabs
  }), activePublishTab === 1 && /*#__PURE__*/React__default.createElement(CodeViewer, {
    className: css$H.code,
    language: "python"
  }, reportModelPythonCode), activePublishTab === 2 && /*#__PURE__*/React__default.createElement(CodeViewer, {
    className: css$H.code,
    language: "python"
  }, reportPlotPythonCode)), activeCodeTab === 3 && /*#__PURE__*/React__default.createElement(Upload$1, {
    user: user,
    refresh: refresh,
    apiUrl: apiUrl
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$H.footer,
    dangerouslySetInnerHTML: {
      __html: t('notClearCheckTheDocks', {
        href: config.DOCS_URL
      })
    }
  }));
};

const api$2 = apiFabric();
var useActions$1 = (() => {
  const [{
    apiUrl
  }] = useAppStore();

  const fetchJob = ({
    user,
    id
  }) => {
    return new Promise(async resolve => {
      try {
        const request = await api$2.get(apiUrl + config.JOB_DETAILS(user, id));
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const runJob = params => {
    return new Promise(async resolve => {
      try {
        const request = await api$2.post(apiUrl + config.JOB_RUN, params);
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const stopJob = params => {
    return new Promise(async resolve => {
      try {
        const request = await api$2.post(apiUrl + config.JOB_STOP, params);
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const createJob = params => {
    return new Promise(async resolve => {
      try {
        const request = await api$2.post(apiUrl + config.JOB_CREATE, params);
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const updateJob = params => {
    return new Promise(async resolve => {
      try {
        const request = await api$2.post(apiUrl + config.JOB_UPDATE, params);
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const removeJob = params => {
    return new Promise(async resolve => {
      try {
        const request = await api$2.post(apiUrl + config.JOB_DELETE, params);
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  return {
    fetchJob,
    runJob,
    stopJob,
    createJob,
    updateJob,
    removeJob
  };
});

var css$I = {"loader":"_styles-module__loader__DHDDF","title":"_styles-module__title__3eHle","loader-pulsee":"_styles-module__loader-pulsee__3Q4hE","text":"_styles-module__text__2QdBi","table":"_styles-module__table__3c_Ia","item":"_styles-module__item__2_9nD"};

const Loader$3 = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$I.loader
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$I.title
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$I.text
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$I.table
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$I.item
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$I.item
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$I.item
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$I.item
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$I.item
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$I.item
  })));
};

const JOB_DEFAULT_ESTIMATED_DURATION = 600000;
const calculateJobProgress = job => {
  const estimatedDuration = job['estimated_duration'] || JOB_DEFAULT_ESTIMATED_DURATION;
  const currentDuration = Date.now() - job.started;
  const leftDuration = estimatedDuration - currentDuration;
  const progress = Math.min(currentDuration / estimatedDuration * 100, 100).toFixed();
  return [progress, leftDuration];
};

var css$J = {"section":"_styles-module__section__3RnYw","progressBar":"_styles-module__progressBar__3xjSa","progress":"_styles-module__progress__3eEzL","time":"_styles-module__time__1q33r"};

const Progress$1 = ({
  data,
  className,
  onlyDuration
}) => {
  const {
    t
  } = useTranslation();
  const progressTimer = useRef(null);
  const [, set] = useState(null);
  useEffect(() => {
    if (data.status === 'RUNNING') {
      clearInterval(progressTimer.current);
      progressTimer.current = setInterval(() => {
        set(Date.now());
      }, 50);
    } else {
      clearInterval(progressTimer.current);
    }

    return () => clearInterval(progressTimer.current);
  }, [data]);
  if (!data.started) return null;
  const [progress, leftDuration] = calculateJobProgress(data);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$J.section, className)
  }, !onlyDuration && /*#__PURE__*/React__default.createElement("div", {
    className: css$J.progressBar
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$J.progress,
    style: {
      width: `${progress}%`
    }
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$J.time
  }, getFormattedDuration(leftDuration), " ", t('left')));
};

var css$K = {"row":"_styles-module__row__2f7FO","dropdown":"_styles-module__dropdown__2hTQP","cell":"_styles-module__cell__3ntzL","status":"_styles-module__status__2MUSr","progress":"_styles-module__progress__1J2il"};

const REFRESH_TIMEOUT = 2000;

const dataFormat = data => data.job;

const TableRow = memo(({
  data,
  onClickRow,
  onEdit,
  onDelete
}) => {
  var _currentUser$data;

  const {
    runJob,
    stopJob
  } = useActions$1();
  const [{
    currentUser,
    apiUrl
  }] = useAppStore();
  const currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  const {
    t
  } = useTranslation();
  const {
    user
  } = useParams();
  const [refreshInterval, setRefreshInterval] = useState(0);
  const {
    data: jobData,
    mutate
  } = useSWR([apiUrl + config.JOB_DETAILS(user, data.id), dataFormat], fetcher, {
    refreshInterval,
    initialData: data,
    revalidateOnFocus: false
  });

  const rowClick = () => {
    if (onClickRow) onClickRow(jobData);
  };

  useEffect(() => {
    if (['RUNNING', 'SCHEDULED'].indexOf(jobData === null || jobData === void 0 ? void 0 : jobData.status) >= 0) {
      if (!refreshInterval) setRefreshInterval(REFRESH_TIMEOUT);
    } else if (refreshInterval) {
      setRefreshInterval(0);
    }
  }, [jobData]);

  const onRun = async () => {
    const {
      job
    } = await runJob({
      user,
      id: jobData.id
    });
    if (job) mutate({ ...jobData,
      ...job
    });
  };

  const onStop = async () => {
    const {
      job
    } = await stopJob({
      user,
      id: jobData.id
    });
    if (job) mutate({ ...jobData,
      ...job
    });
  };

  const getTitle = () => {
    if (jobData.title && jobData.title.length) return jobData.title;else return /*#__PURE__*/React__default.createElement("span", null, "New job");
  };

  const renderStatus = () => {
    switch (jobData.status) {
      case 'SCHEDULED':
        return /*#__PURE__*/React__default.createElement("div", {
          className: css$K.status
        }, t('inProgress'), "\u2026");

      case 'RUNNING':
        return /*#__PURE__*/React__default.createElement("div", {
          className: css$K.status
        }, t('inProgress'), "\u2026", /*#__PURE__*/React__default.createElement(Progress$1, {
          className: css$K.progress,
          data: jobData
        }));

      case 'TIMEOUT':
        return /*#__PURE__*/React__default.createElement("div", {
          className: cx(css$K.status, 'fail')
        }, "\u26D4\uFE0F ", t('failedDueToTimeout'));

      case 'FAILED':
        return /*#__PURE__*/React__default.createElement("div", {
          className: cx(css$K.status, 'fail')
        }, "\u26D4\uFE0F ", t('failed'));

      case 'FINISHED':
        return /*#__PURE__*/React__default.createElement("div", {
          className: cx(css$K.status, 'success')
        }, "\u2705 ", t('completed'));

      case 'CREATED':
        return /*#__PURE__*/React__default.createElement("div", {
          className: css$K.status
        }, t('neverRun'));

      default:
        return /*#__PURE__*/React__default.createElement("div", {
          className: css$K.status
        }, t(jobData.status.toLowerCase()));
    }
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$K.row, {
      red: ['TIMEOUT', 'FAILED'].indexOf(jobData.status) > -1
    }),
    onClick: rowClick
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$K.cell
  }, getTitle()), /*#__PURE__*/React__default.createElement("div", {
    className: css$K.cell
  }, t(jobData.runtime)), /*#__PURE__*/React__default.createElement("div", {
    className: css$K.cell
  }, moment(jobData.started).format('MM-DD-YYYY [at] HH:mm')), /*#__PURE__*/React__default.createElement("div", {
    className: css$K.cell
  }, getFormattedDuration(jobData.finished - jobData.started)), /*#__PURE__*/React__default.createElement("div", {
    className: css$K.cell
  }, renderStatus(), currentUserName === user && /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$K.dropdown,
    items: [...(['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData.status) >= 0 ? [{
      title: t('stop'),
      onClick: onStop
    }] : [{
      title: t('run'),
      onClick: onRun
    }]), {
      title: t('edit'),
      onClick: onEdit
    }, {
      title: t('delete'),
      onClick: onDelete
    }]
  })));
});

var css$L = {"list":"_styles-module__list__VXs44","title":"_styles-module__title__r4zAA","button":"_styles-module__button__21dbT","search":"_styles-module__search__1mylL","mobileSearch":"_styles-module__mobileSearch__3Oub0","text":"_styles-module__text__Ra7UV","tableWrap":"_styles-module__tableWrap__2CYWc","table":"_styles-module__table__2iL6k","tableCaptions":"_styles-module__tableCaptions__2YOUS","tableCell":"_styles-module__tableCell__3tQ5e"};

const dataFormat$1 = data => data.jobs;

const List$1 = () => {
  var _currentUser$data;

  const {
    createJob,
    removeJob
  } = useActions$1();
  const [{
    currentUser,
    apiUrl
  }] = useAppStore();
  const currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  const {
    t
  } = useTranslation();
  const [search, setSearch] = useState('');
  const {
    user
  } = useParams();
  const {
    push
  } = useHistory();
  const {
    data,
    mutate
  } = useSWR([apiUrl + config.JOB_LIST(user), dataFormat$1], fetcher);

  const onChangeSearch = value => setSearch(value);

  const getItems = () => {
    let items = [];

    if (data && data.length) {
      if (search.length) items = data.filter(i => i.title.indexOf(search) >= 0);else items = data;
    }

    return items;
  };

  const items = getItems();

  const onAdd = async () => {
    const lastRuntime = localStorage.getItem('lastRuntime') || 'python';
    const data = await createJob({
      user,
      runtime: lastRuntime
    });
    push(routes.jobsDetails(user, data.job.id));
  };

  const getOnRemove = job => async () => {
    await removeJob({
      user,
      id: job.id
    });
    mutate(data.filter(j => j.id !== job.id));
  };

  if (!data) return /*#__PURE__*/React__default.createElement(Loader$3, null);
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$L.list
  }, /*#__PURE__*/React__default.createElement(Yield, {
    name: "header-yield"
  }, /*#__PURE__*/React__default.createElement(SearchField, {
    showEverything: true,
    isDark: true,
    placeholder: t('findJob'),
    size: "small",
    value: search,
    className: css$L.search,
    onChange: onChangeSearch
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$L.title
  }, currentUserName === user ? t('myJobs') : t('jobsOf', {
    name: user
  }), /*#__PURE__*/React__default.createElement(Button, {
    className: css$L.button,
    variant: "contained",
    color: "primary",
    size: "small",
    onClick: onAdd
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-plus"
  }), " ", t('newJob'))), /*#__PURE__*/React__default.createElement("div", {
    className: css$L.text
  }, t('youHaveJobs', {
    count: data.length
  }), ' ', /*#__PURE__*/React__default.createElement("a", {
    href: config.DOCS_URL + '/jobs',
    target: "_blank"
  }, t('documentation'), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-open-in-new"
  })), "."), data && Boolean(data.length) && /*#__PURE__*/React__default.createElement(SearchField, {
    placeholder: t('findJob'),
    className: css$L.mobileSearch,
    showEverything: true,
    size: "small",
    value: search,
    onChange: onChangeSearch
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$L.tableWrap
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$L.table
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$L.tableCaptions
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$L.tableCell
  }, t('job')), /*#__PURE__*/React__default.createElement("div", {
    className: css$L.tableCell
  }, t('runtime')), /*#__PURE__*/React__default.createElement("div", {
    className: css$L.tableCell
  }, t('lastRun')), /*#__PURE__*/React__default.createElement("div", {
    className: css$L.tableCell
  }, t('timeSpent')), /*#__PURE__*/React__default.createElement("div", {
    className: css$L.tableCell
  }, t('status'))), items.map(item => /*#__PURE__*/React__default.createElement(TableRow, {
    data: item,
    key: item.id,
    onClickRow: () => push(routes.jobsDetails(user, item.id)),
    onEdit: () => push(routes.jobsDetails(user, item.id)),
    onDelete: getOnRemove(item)
  })))));
};

var useAppProgress = (() => {
  const [, dispatch] = useAppStore();

  const startAppProgress = () => {
    dispatch({
      type: actionsTypes.START_PROGRESS
    });
  };

  const setAppProgress = progress => {
    dispatch({
      type: actionsTypes.SET_PROGRESS,
      payload: progress
    });
  };

  const completeAppProgress = () => {
    dispatch({
      type: actionsTypes.COMPLETE_PROGRESS
    });
  };

  const resetAppProgress = () => {
    dispatch({
      type: actionsTypes.RESET_PROGRESS
    });
  };

  return {
    startAppProgress,
    setAppProgress,
    completeAppProgress,
    resetAppProgress
  };
});

var css$M = {"schedule":"_styles-module__schedule__YoEcM","dropdown":"_styles-module__dropdown__3RJdh","runtime":"_styles-module__runtime__2h8GE","dropdownButton":"_styles-module__dropdownButton__3fdRe","message":"_styles-module__message__1byIj"};

let timeout = null;

const ScheduleSettings = ({
  data,
  className,
  onChange,
  onChangeRuntime
}) => {
  const {
    t
  } = useTranslation();
  const messageRef = useRef();
  const [scheduleType, setScheduleType] = useState(data ? data.schedule.split('/')[0] : '');
  const [scheduleTime, setScheduleTime] = useState(data ? data.schedule.split('/')[1] : null);
  const [nextRunDelay, setNextRunDelay] = useState(0);
  const isDidMount = useRef(true);

  const runtimeChange = runtime => () => {
    onChangeRuntime(runtime);
    localStorage.setItem('lastRuntime', runtime);
  };

  const scheduleTypeChange = type => () => {
    setScheduleType(type);
    if (!scheduleTime) setScheduleTime('12:00');
    if (type === 'daily') type += `/${scheduleTime ? scheduleTime : '12:00'}`;
    onChange(type);
  };

  const scheduleTimeChange = time => () => {
    setScheduleTime(time);
    onChange(`${scheduleType}/${time}`);
    const runTime = moment(time, 'HH:mm');
    if (new Date().getHours() > runTime.get('hours')) runTime.add(1, 'day');
    setNextRunDelay(runTime.toDate().getTime() - Date.now());
  };

  useEffect(() => {
    if (nextRunDelay && !isDidMount.current && messageRef.current) {
      messageRef.current.classList.add('show');
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        messageRef.current.classList.remove('show');
      }, 3000);
    }

    if (isDidMount.current) isDidMount.current = false;
  }, [nextRunDelay]);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$M.schedule, className)
  }, t('runtime'), ":", /*#__PURE__*/React__default.createElement(Dropdown, {
    className: cx(css$M.dropdown, css$M.runtime),
    items: [{
      title: t('python'),
      onClick: runtimeChange('python')
    }, {
      title: t('r'),
      onClick: runtimeChange('r')
    }]
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$M.dropdownButton,
    color: "primary"
  }, t(data.runtime), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-chevron-down"
  }))), t('jobIs'), " ", scheduleType !== 'unscheduled' && t('scheduled'), /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$M.dropdown,
    items: [{
      title: t('unscheduled'),
      onClick: scheduleTypeChange('unscheduled')
    }, {
      title: t('daily'),
      onClick: scheduleTypeChange('daily')
    }]
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$M.dropdownButton,
    color: "primary"
  }, t(scheduleType), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-chevron-down"
  }))), scheduleType === 'daily' && /*#__PURE__*/React__default.createElement(Fragment, null, t('at'), /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$M.dropdown,
    items: new Array(24).fill(0).map((i, index) => {
      const time = `${index < 10 ? '0' + index : index}:00`;
      return {
        title: time,
        onClick: scheduleTimeChange(time)
      };
    })
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$M.dropdownButton,
    color: "primary"
  }, scheduleTime, " UTC", /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-chevron-down"
  }))), /*#__PURE__*/React__default.createElement("div", {
    ref: messageRef,
    className: cx(css$M.message, 'green-text')
  }, "The next run starts in ", getFormattedDuration(nextRunDelay))));
};

var css$N = {"editor":"_styles-module__editor__m0hwp","token":"_styles-module__token__281_3","atrule":"_styles-module__atrule__1M8ph","attr-value":"_styles-module__attr-value__T6_N1","keyword":"_styles-module__keyword__1gT7U","function":"_styles-module__function__2ZXkX","class-name":"_styles-module__class-name__upcGt","selector":"_styles-module__selector__3rmyW","attr-name":"_styles-module__attr-name__I3P48","string":"_styles-module__string__hoRdC","char":"_styles-module__char__1uxpB","builtin":"_styles-module__builtin__3xCwG","inserted":"_styles-module__inserted__2Lvrk","scroll":"_styles-module__scroll__1yHaS","content":"_styles-module__content__3cHiP","success":"_styles-module__success__1Z8bo","lineNumbers":"_styles-module__lineNumbers__1CW5r"};

const CodeEditor = ({
  value: _value = '',
  onChange,
  language,
  className,
  saved
}) => {
  const {
    t
  } = useTranslation();
  const successMessageRef = useRef();
  const lines = (_value.match(/\n/g) || []).length + 2;
  const lineNos = [...Array(lines).keys()].slice(1).join('\n');
  const isDidMount = useRef(true);
  useEffect(() => {
    if (successMessageRef.current && !isDidMount.current) if (saved) {
      successMessageRef.current.classList.add('show');
      setTimeout(() => {
        if (successMessageRef.current) successMessageRef.current.classList.remove('show');
      }, 4000);
    } else {
      successMessageRef.current.classList.remove('show');
    }
    if (isDidMount.current) isDidMount.current = false;
  }, [saved]);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$N.editor, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$N.success,
    ref: successMessageRef
  }, t('changesSaved')), /*#__PURE__*/React__default.createElement("div", {
    className: css$N.scroll
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$N.content
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$N.lineNumbers,
    dangerouslySetInnerHTML: {
      __html: lineNos
    }
  }), /*#__PURE__*/React__default.createElement(Editor, {
    value: _value,
    onValueChange: onChange,
    highlight: code => highlight(code, languages[language]),
    padding: 6,
    style: {
      width: '100%',
      fontFamily: '"Roboto Mono", monospace',
      fontSize: 12,
      lineHeight: '150%',
      outline: 'none'
    }
  }))));
};

var css$O = {"status":"_styles-module__status__3Pfpo"};

const Status = ({
  data
}) => {
  const {
    t
  } = useTranslation();
  if (!data.started) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$O.status
  }, t('lastRunning'), ' ', moment(data.started).format(`MM-DD-YYYY [${t('at')}] HH:mm`), /*#__PURE__*/React__default.createElement("span", null, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-clock-outline"
  }), ['RUNNING', 'SCHEDULED'].indexOf(data.status) >= 0 ? /*#__PURE__*/React__default.createElement("span", null, ' ', t('inProgress'), "\u2026") : getFormattedDuration(data.finished - data.started)), data.status === 'FAILED' && /*#__PURE__*/React__default.createElement("span", {
    className: "red-text"
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-close-octagon-outline"
  }), t('failed')), data.status === 'TIMEOUT' && /*#__PURE__*/React__default.createElement("span", {
    className: "red-text"
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-close-octagon-outline"
  }), t('failedDueToTimeout')));
};

var css$P = {"logs":"_styles-module__logs__1poNo","button":"_styles-module__button__35eOC","text":"_styles-module__text__2eQos","label":"_styles-module__label__LksjJ"};

const Logs = ({
  data,
  className
}) => {
  if (!data.logs) return null;
  const {
    t
  } = useTranslation();
  const [isShown, setIsShown] = useState(true);
  const [updated] = useState(data.finished || data.started);

  const toggleShow = () => setIsShown(!isShown);

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$P.logs, className)
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$P.button,
    onClick: toggleShow,
    color: "primary",
    size: "small"
  }, t('logs')), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$P.text, {
      open: isShown
    })
  }, /*#__PURE__*/React__default.createElement("pre", null, data.logs), updated && /*#__PURE__*/React__default.createElement("div", {
    className: css$P.label
  }, t('updated'), " ", moment(updated).fromNow())));
};

var css$Q = {"loader":"_styles-module__loader__2nOeY","loader-pulse":"_styles-module__loader-pulse__1Aj7Q","title":"_styles-module__title__RJ2x5","text1":"_styles-module__text1__2hZDH","text2":"_styles-module__text2__1-tIa","code":"_styles-module__code__3LgqO"};

const Loader$4 = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$Q.loader
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$Q.title
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$Q.text1
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$Q.text2
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$Q.code
  }));
};

var css$R = {"details":"_styles-module__details__1K_mA","header":"_styles-module__header__1nmEh","dropdown":"_styles-module__dropdown__3RSoB","dropdownButton":"_styles-module__dropdownButton__2dnN2","title":"_styles-module__title__3U50H","edit":"_styles-module__edit__bgkiC","side":"_styles-module__side__3uIQ_","progress":"_styles-module__progress__1jRHi","button":"_styles-module__button__2J0VV","schedule":"_styles-module__schedule__2YXFa","codeEditor":"_styles-module__codeEditor__1M2Sw","logs":"_styles-module__logs__ZQT6g"};

const REFRESH_TIMEOUT$1 = 3000;

const dataFormat$2 = data => data.job;

const Details$2 = ({}) => {
  var _currentUser$data;

  const {
    runJob,
    stopJob,
    updateJob,
    removeJob
  } = useActions$1();
  const {
    setAppProgress,
    resetAppProgress
  } = useAppProgress();
  const {
    user,
    id
  } = useParams();
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [{
    currentUser,
    apiUrl
  }] = useAppStore();
  const currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  const {
    data: jobData,
    error,
    mutate
  } = useSWR([apiUrl + config.JOB_DETAILS(user, id), dataFormat$2], fetcher, {
    refreshInterval
  });
  const {
    push
  } = useHistory();
  const {
    t
  } = useTranslation();
  const [titleValue, setTitleValue] = useState('');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [codeSaved, setCodeSaved] = useState(true);
  const progressTimer = useRef(null);

  const update = async params => {
    const data = await updateJob(params);
    mutate({ ...jobData,
      ...data.job
    });
  };

  const updateDebounce = useDebounce(update, 1000, []);
  const updateLongDebounce = useDebounce(update, 2000, []);
  const prevData = usePrevious(jobData);
  useEffect(() => {
    window.addEventListener('keydown', detectEnterPress);
    return () => window.removeEventListener('keydown', detectEnterPress);
  }, [jobData, code]);
  useEffect(() => {
    if (jobData) {
      setTitleValue(jobData.title);
      setCode(jobData.code);
    }
  }, []);

  const detectEnterPress = event => {
    if (event.code === 'Enter' && (event.shiftKey || event.ctrlKey)) {
      event.preventDefault();
      if (!running && !stopping) onClickRun();
    }
  };

  useEffect(() => {
    if (['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData === null || jobData === void 0 ? void 0 : jobData.status) >= 0) {
      clearInterval(progressTimer.current);
      progressTimer.current = setInterval(() => {
        const [progress] = calculateJobProgress(jobData);
        setAppProgress(progress);
      }, 50);
    } else {
      clearInterval(progressTimer.current);
    }

    return () => clearInterval(progressTimer.current);
  }, [refreshInterval, jobData]);
  useEffect(() => {
    if ((prevData === null || prevData === void 0 ? void 0 : prevData.id) !== (jobData === null || jobData === void 0 ? void 0 : jobData.id)) {
      setTitleValue(jobData.title);
      setCode(jobData.code);
    }

    if (['RUNNING', 'SCHEDULED'].indexOf(jobData === null || jobData === void 0 ? void 0 : jobData.status) >= 0) {
      if (!refreshInterval) setRefreshInterval(REFRESH_TIMEOUT$1);
    } else if (refreshInterval) {
      setRefreshInterval(0);
      resetAppProgress();
    }

    return () => {
      resetAppProgress();
    };
  }, [jobData]);

  const onChangeTitle = value => {
    setTitleValue(value);
    updateDebounce({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      title: value
    });
  };

  const onChangeCode = value => {
    setCode(value);
    setCodeSaved(false);
    updateLongDebounce({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      code: value
    }, () => setCodeSaved(true));
  };

  const onChangeRuntime = runtime => {
    update({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      runtime: runtime
    });
  };

  const onChangeSchedule = schedule => {
    update({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      schedule: schedule
    });
  };

  const onClickRun = async () => {
    setRunning(true);

    try {
      const data = await runJob({
        user: user,
        id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
        code
      });
      mutate({ ...jobData,
        ...data
      });
      setRefreshInterval(REFRESH_TIMEOUT$1);
    } catch (e) {
      console.log(e);
    }

    setRunning(false);
  };

  const onClickStop = async () => {
    setStopping(true);

    try {
      const data = await stopJob({
        user: user,
        id: jobData === null || jobData === void 0 ? void 0 : jobData.id
      });
      mutate({ ...jobData,
        ...data
      });
    } catch (e) {
      console.log(e);
    }

    setStopping(false);
  };

  const onClickDelete = async () => {
    await removeJob({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id
    });
    push(routes.jobs(user));
  };

  if (!jobData && !error) return /*#__PURE__*/React__default.createElement(Loader$4, null);
  if ((error === null || error === void 0 ? void 0 : error.status) === 403) return /*#__PURE__*/React__default.createElement(AccessForbidden, null, t('youDontHaveAnAccessToThisJob'), ".", isSignedIn() && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement("br", null), /*#__PURE__*/React__default.createElement(Link, {
    to: routes.dashboards(currentUserName)
  }, t('goToMyJobs'))));
  if ((error === null || error === void 0 ? void 0 : error.status) === 404) return /*#__PURE__*/React__default.createElement(NotFound, null, t('theJobYouAreRookingForCouldNotBeFound'), ' ', isSignedIn() && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement(Link, {
    to: routes.dashboards(currentUserName)
  }, t('goToMyJobs')), "."));
  if (!jobData) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$R.details
  }, /*#__PURE__*/React__default.createElement(Yield, {
    name: "header-yield"
  }, /*#__PURE__*/React__default.createElement(BackButton, {
    Component: Link,
    to: routes.jobs(user)
  }, currentUserName === user ? t('backToJobs') : t('backToJobsOf', {
    name: user
  }))), /*#__PURE__*/React__default.createElement("div", {
    className: css$R.header
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$R.title
  }, /*#__PURE__*/React__default.createElement(StretchTitleField, {
    className: css$R.edit,
    value: titleValue,
    onChange: onChangeTitle,
    readOnly: currentUserName !== user,
    placeholder: t('newJob')
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$R.side
  }, jobData.status === 'RUNNING' && /*#__PURE__*/React__default.createElement(Progress$1, {
    onlyDuration: true,
    className: css$R.progress,
    data: jobData
  }), jobData.status === 'FAILED' && /*#__PURE__*/React__default.createElement("div", {
    className: "red-text"
  }, t('sorryButYourCodeDoesntLookLikePythonJob')), ['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData.status) >= 0 ? /*#__PURE__*/React__default.createElement(Button, {
    className: css$R.button,
    color: "fail",
    size: "small",
    variant: "contained",
    disabled: stopping,
    onClick: onClickStop
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-pause"
  }), t('stop')) : /*#__PURE__*/React__default.createElement(Button, {
    className: css$R.button,
    color: "success",
    size: "small",
    variant: "contained",
    disabled: running,
    onClick: onClickRun
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-play"
  }), t('run'))), currentUserName === user && /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$R.dropdown,
    items: [{
      title: t('delete'),
      onClick: onClickDelete
    }]
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$R.dropdownButton,
    color: "secondary"
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-dots-horizontal"
  })))), /*#__PURE__*/React__default.createElement(Status, {
    data: jobData
  }), /*#__PURE__*/React__default.createElement(ScheduleSettings, {
    className: css$R.schedule,
    data: jobData,
    onChange: onChangeSchedule,
    onChangeRuntime: onChangeRuntime
  }), /*#__PURE__*/React__default.createElement(CodeEditor, {
    className: css$R.codeEditor,
    value: code,
    onChange: onChangeCode,
    language: jobData.runtime,
    saved: codeSaved
  }), /*#__PURE__*/React__default.createElement(Logs, {
    className: css$R.logs,
    data: jobData
  }));
};

var css$S = {"jobs":"_styles-module__jobs__z2_YO"};

const Jobs = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$S.jobs
  }, /*#__PURE__*/React__default.createElement(Switch, null, /*#__PURE__*/React__default.createElement(Route, {
    path: routes.jobs(),
    exact: true,
    component: List$1
  }), /*#__PURE__*/React__default.createElement(Route, {
    path: routes.jobsDetails(),
    component: Details$2
  })));
};

var css$T = {"item":"_styles-module__item__2TtG-","preview":"_styles-module__preview__l7PkQ","label":"_styles-module__label__IluCM","previewWrap":"_styles-module__previewWrap__JeLjN","emptyMessage":"_styles-module__emptyMessage__3FYnh","attachment":"_styles-module__attachment__29ErP","section":"_styles-module__section__t4Sh3","content":"_styles-module__content__1PvDk","name":"_styles-module__name__246Ao","by":"_styles-module__by__15CWL","permissions":"_styles-module__permissions__Venzr","dropdown":"_styles-module__dropdown__3zDl9","preview-stack-pulse":"_styles-module__preview-stack-pulse__1TX_d"};

const Item$1 = ({
  data,
  deleteItem,
  user,
  renderContent
}) => {
  const {
    t
  } = useTranslation();
  const ref = useRef(null);
  const hasStacks = data.cards && Boolean(data.cards.length);
  const card = data.cards.find(c => get(c, 'head.id'));
  const isShowDropdown = Boolean(deleteItem);
  return /*#__PURE__*/React__default.createElement(Link, {
    to: `/${user}/d/${data.id}`,
    className: css$T.item,
    ref: ref
  }, Boolean(data.cards.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$T.label
  }, t('stacksWithCount', {
    count: data.cards.length
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$T.previewWrap
  }, hasStacks ? /*#__PURE__*/React__default.createElement(Attachment, {
    className: css$T.attachment,
    isList: true,
    withLoader: true,
    frameId: card.head.id,
    stack: card.stack,
    id: 0
  }) : /*#__PURE__*/React__default.createElement("div", {
    className: css$T.emptyMessage
  }, t('emptyDashboard'))), /*#__PURE__*/React__default.createElement("div", {
    className: css$T.section
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$T.content
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$T.name
  }, data.title, ' ', /*#__PURE__*/React__default.createElement("span", {
    className: `mdi mdi-lock${data.private ? '' : '-open'}`
  })), user !== data.user && /*#__PURE__*/React__default.createElement("div", {
    className: css$T.by
  }, t('by'), " ", data.user), renderContent && renderContent(data)), isShowDropdown && /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$T.dropdown,
    items: [{
      title: t('delete'),
      onClick: deleteItem
    }]
  })));
};

var css$U = {"loader":"_styles-module__loader__Tepr9","text":"_styles-module__text__123Jw","dashboards-pulse":"_styles-module__dashboards-pulse__DeSvR","grid":"_styles-module__grid__37UOy","item":"_styles-module__item__B93bY","pic":"_styles-module__pic__33hqz","section":"_styles-module__section__3jX_z"};

const Loader$5 = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$U.loader
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$U.text
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$U.grid
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$U.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$U.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$U.section
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$U.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$U.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$U.section
  }))));
};

const api$3 = apiFabric();
var useActions$2 = (() => {
  const [{
    apiUrl
  }] = useAppStore();

  const createReport = userName => {
    return new Promise(async resolve => {
      try {
        const request = await api$3.post(apiUrl + config.DASHBOARD_CREATE, {
          user: userName
        });
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const updateReport = (userName, id, fields) => {
    return new Promise(async resolve => {
      try {
        const request = await api$3.post(apiUrl + config.DASHBOARD_UPDATE, {
          user: userName,
          id,
          ...fields
        });
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const deleteReport = (userName, reportId) => {
    return new Promise(async resolve => {
      try {
        const request = await api$3.post(apiUrl + config.DASHBOARD_DELETE, {
          user: userName,
          id: reportId
        });
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const reportInsertCard = (userName, id, cards, index) => {
    return new Promise(async resolve => {
      try {
        const request = await api$3.post(apiUrl + config.DASHBOARD_CARDS_INSERT + '?attachments=true', {
          user: userName,
          dashboard: id,
          cards,
          index
        });
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const reportUpdateCard = (userName, id, stack, fields) => {
    return new Promise(async resolve => {
      try {
        const request = await api$3.post(apiUrl + config.DASHBOARD_CARDS_UPDATE, {
          user: userName,
          dashboard: id,
          stack,
          ...fields
        });
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  const reportDeleteCard = (userName, id, stack) => {
    return new Promise(async resolve => {
      try {
        const request = await api$3.post(apiUrl + config.DASHBOARD_CARDS_DELETE, {
          user: userName,
          dashboard: id,
          stack
        });
        resolve(request.data);
      } catch (e) {
        resolve({});
      }
    });
  };

  return {
    createReport,
    deleteReport,
    updateReport,
    reportInsertCard,
    reportUpdateCard,
    reportDeleteCard
  };
});

var css$V = {"list":"_styles-module__list__uwcI_","title":"_styles-module__title__36F7e","search":"_styles-module__search__1HsPY","mobileSearch":"_styles-module__mobileSearch__3JBKO","text":"_styles-module__text__11SLK","grid":"_styles-module__grid__2KJdC","add":"_styles-module__add__3vd7A","caption":"_styles-module__caption__2_R7F"};

const dataFormat$3 = data => data.dashboards;

const List$2 = ({}) => {
  var _currentUser$data;

  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [{
    currentUser,
    apiUrl
  }] = useAppStore();
  const currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  const {
    createReport,
    deleteReport
  } = useActions$2();
  const {
    t
  } = useTranslation();
  const {
    user
  } = useParams();
  const {
    push
  } = useHistory();
  const {
    data,
    error,
    mutate
  } = useSWR([apiUrl + config.DASHBOARD_LIST(user), dataFormat$3], fetcher);
  const items = useMemo(() => {
    let items = [];

    if (data && data.length) {
      if (search.length) items = data.filter(i => i.title.indexOf(search) >= 0);else items = data;
    }

    return items;
  }, [data, search]);

  const onChangeSearch = value => setSearch(value);

  const create = async () => {
    setCreating(true);
    const data = await createReport(user);
    setCreating(false);
    push(routes.reportsDetails(user, data.dashboard.id));
  };

  const getDeleteFunc = id => async () => {
    await deleteReport(user, id);
    mutate(data.filter(r => r.id !== id));
  };

  if ((error === null || error === void 0 ? void 0 : error.status) === 404) return /*#__PURE__*/React__default.createElement(NotFound, null, t('theDashboardYouAreRookingForCouldNotBeFound'), ' ', isSignedIn() && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement(Link, {
    to: routes.reportsDetails(currentUserName)
  }, t('goToMyDashboards')), "."));
  if (!data) return /*#__PURE__*/React__default.createElement(Loader$5, null);
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$V.list
  }, /*#__PURE__*/React__default.createElement(Yield, {
    name: "header-yield"
  }, /*#__PURE__*/React__default.createElement(SearchField, {
    showEverything: true,
    isDark: true,
    className: css$V.search,
    placeholder: t('findDashboard'),
    size: "small",
    value: search,
    onChange: onChangeSearch
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$V.title
  }, currentUserName === user ? t('myReports') : t('reportsOf', {
    name: user
  }), data && Boolean(data.length) && /*#__PURE__*/React__default.createElement("span", null, data.length)), data && Boolean(data.length) && /*#__PURE__*/React__default.createElement(SearchField, {
    placeholder: t('search'),
    className: css$V.mobileSearch,
    showEverything: true,
    size: "small",
    value: search,
    onChange: onChangeSearch
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$V.grid
  }, currentUserName === user && /*#__PURE__*/React__default.createElement("div", {
    onClick: create,
    className: cx(css$V.add, {
      disabled: creating
    })
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$V.caption
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-plus"
  }), t('newReport'))), items.map((item, index) => /*#__PURE__*/React__default.createElement(Item$1, {
    key: index,
    user: user,
    data: item,
    deleteItem: currentUserName === item.user && getDeleteFunc(item.id)
  }))));
};

var css$W = {"loader":"_styles-module__loader__3meGS","text":"_styles-module__text__2fWbA","dashboards-details-pulse":"_styles-module__dashboards-details-pulse__nJVCo","filters":"_styles-module__filters__3RT0J","grid":"_styles-module__grid__qat5v","item":"_styles-module__item__2kTBz"};

const Loader$6 = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$W.loader
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$W.text
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$W.filters
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$W.grid
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$W.item
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$W.item
  })));
};

function move(array, oldIndex, newIndex) {
  if (newIndex >= array.length) {
    newIndex = array.length - 1;
  }

  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  return array;
}

function moveElement(array, index, offset) {
  const newIndex = index + offset;
  return move(array, index, newIndex);
}

const GridContext = createContext({
  items: []
});
class GridProvider extends Component {
  constructor(props) {
    super(props);

    this.setItems = items => this.setState({
      items
    });

    this.moveItem = (sourceId, destinationId) => {
      const sourceIndex = this.state.items.findIndex(item => item.id === sourceId);
      const destinationIndex = this.state.items.findIndex(item => item.id === destinationId);

      if (sourceId === -1 || destinationId === -1) {
        return;
      }

      const offset = destinationIndex - sourceIndex;
      this.setState(state => ({
        items: moveElement(state.items, sourceIndex, offset)
      }));
    };

    this.state = {
      items: [],
      moveItem: this.moveItem,
      setItems: this.setItems
    };
  }

  render() {
    return /*#__PURE__*/React__default.createElement(GridContext.Provider, {
      value: this.state
    }, this.props.children);
  }

}

var css$X = {"loader":"_styles-module__loader__3bVFk","text":"_styles-module__text__2ZWwD","stacks-pulse":"_styles-module__stacks-pulse__32IBp","grid":"_styles-module__grid__1NGPz","item":"_styles-module__item__pEfso","pic":"_styles-module__pic__3Cu55","section":"_styles-module__section__3VyE7"};

const Loader$7 = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$X.loader
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$X.text
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$X.grid
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$X.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$X.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$X.section
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$X.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$X.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$X.section
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$X.item
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$X.pic
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$X.section
  }))));
};

var css$Y = {"stacks":"_style-module__stacks__1EVMf","grid":"_style-module__grid__23g1_","search":"_style-module__search__2aMVS","message":"_style-module__message__1MJtk","text":"_style-module__text__3eeN7","item":"_style-module__item__1S3Mz","checkbox":"_style-module__checkbox__1Zf0d","buttons":"_style-module__buttons__1HBY_","button":"_style-module__button__1m3l6"};

const dataFormat$4 = data => data.stacks;

const AddStacksModal = ({
  isShow,
  onClose,
  onAddStacks
}) => {
  var _currentUser$data;

  const {
    t
  } = useTranslation();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [{
    currentUser,
    apiUrl
  }] = useAppStore();
  const currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  const {
    data
  } = useSWR([apiUrl + config.USER_STACK_LIST(params.user), dataFormat$4], fetcher);
  useEffect(() => {
    if (!isShow) {
      setSelected([]);
      setSearchQuery('');
    }
  }, [isShow]);
  const items = useMemo(() => {
    let items = [];

    if (data && data.length) {
      if (searchQuery.length) items = data.filter(i => i.name.indexOf(searchQuery) >= 0);else items = data;
    }

    return items;
  }, [data, searchQuery]);

  const onChangeSearch = value => setSearchQuery(value);

  const getFullStackName = stack => `${stack.user}/${stack.name}`;

  const isChecked = stack => {
    const stackName = getFullStackName(stack);
    return selected.findIndex(i => i === stackName) >= 0;
  };

  const getOnClickStack = stack => () => {
    const stackName = getFullStackName(stack);

    if (isChecked(stack)) {
      const filtered = selected.filter(i => i !== stackName);
      setSelected(filtered);
    } else {
      setSelected([...selected, stackName]);
    }
  };

  const submit = () => {
    if (onAddStacks) onAddStacks(selected);
    onClose();
  };

  const isUserOwner = currentUserName === params.user;
  return /*#__PURE__*/React__default.createElement(Modal, {
    dialogClassName: css$Y.stacks,
    isShow: isShow,
    title: t('selectStacks'),
    onClose: onClose,
    withCloseButton: true
  }, data && Boolean(data.length) && /*#__PURE__*/React__default.createElement(SearchField, {
    className: css$Y.search,
    isDark: true,
    size: "middle",
    showEverything: true,
    placeholder: t('findStack'),
    value: searchQuery,
    onChange: onChangeSearch
  }), !data && /*#__PURE__*/React__default.createElement(Loader$7, null), data && Boolean(data.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$Y.message
  }, isUserOwner ? t('youHaveNoStacksYet') : t('theUserHasNoStacksYetByName', {
    name: params.user
  })), data && Boolean(data.length && !items.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$Y.text
  }, t('noStacksAreFoundedMatchedTheSearchCriteria')), data && Boolean(data.length && items.length) && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    className: css$Y.grid
  }, items.map((item, index) => /*#__PURE__*/React__default.createElement("div", {
    className: css$Y.item,
    key: index,
    onClick: getOnClickStack(item)
  }, /*#__PURE__*/React__default.createElement(CheckboxField, {
    className: css$Y.checkbox,
    value: isChecked(item),
    readOnly: true
  }), /*#__PURE__*/React__default.createElement(Item, {
    data: item
  })))), /*#__PURE__*/React__default.createElement("div", {
    className: css$Y.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$Y.button,
    color: "primary",
    variant: "contained",
    disabled: !selected.length,
    onClick: submit
  }, t('addSelectedStacks')), /*#__PURE__*/React__default.createElement(Button, {
    className: css$Y.button,
    color: "secondary",
    variant: "contained",
    onClick: onClose
  }, t('cancel')))));
};

var css$Z = {"card":"_styles-module__card__2USXU","inner":"_styles-module__inner__nCWYo","head":"_styles-module__head__3Ir7x","name":"_styles-module__name__dAh2C","nameEdit":"_styles-module__nameEdit__3U2XI","nameValue":"_styles-module__nameValue__1d1pL","info":"_styles-module__info__1KbVf","dropdown":"_styles-module__dropdown__3Fjm5","button":"_styles-module__button__3jXy5","move":"_styles-module__move__1XXQ2","viewSwitcher":"_styles-module__viewSwitcher__2EIG0","cardControls":"_styles-module__cardControls__M80-o","description":"_styles-module__description__1od1n","addDesc":"_styles-module__addDesc__24azt","infoTime":"_styles-module__infoTime__ISfic","emptyMessage":"_styles-module__emptyMessage__3Fu27","attachment":"_styles-module__attachment__3x5M9"};

const viewValueMap = {
  grid: 1,
  list: 2
};
const Card = memo(({
  data,
  className,
  deleteCard,
  updateCard,
  filters,
  activeTab,
  forwardedRef,
  moveAvailable
}) => {
  var _data$description;

  const [title, setTitle] = useState(data.title);
  const [columns, setColumns] = useState(data.columns);
  const descFieldRef = useRef();
  const isMounted = useRef(false);
  const isHoveredMoveBtn = useRef(false);
  const [isShowDesc, setIsShowDesc] = useState((_data$description = data.description) === null || _data$description === void 0 ? void 0 : _data$description.length);
  const prevIsShowDesc = usePrevious$1(isShowDesc);
  const {
    t
  } = useTranslation();
  const headId = get(data, 'head.id');
  const stackOwner = data.stack.split('/')[0];
  const [attachmentIndex, setAttachmentIndex] = useState(0);
  const [cardParams, setCardParams] = useState([]);
  useEffect(() => {
    const params = parseStackParams(get(data, 'head.attachments', []));
    if (params) setCardParams(Object.keys(params));
  }, [data]);
  useEffect(() => {
    findAttach();
  }, [filters]);
  useEffect(() => {
    if (forwardedRef && forwardedRef.current) forwardedRef.current.addEventListener('dragstart', event => {
      if (!isHoveredMoveBtn.current) {
        event.stopPropagation();
        event.preventDefault();
      }
    });
  }, [forwardedRef]);
  useEffect(() => {
    if (isMounted.current && prevIsShowDesc !== isShowDesc && descFieldRef.current) descFieldRef.current.focus();
  }, [isShowDesc]);
  useEffect(() => {
    isMounted.current = true;
  }, []);

  const findAttach = () => {
    const attachments = get(data, 'head.attachments');
    const tabs = parseStackTabs(attachments);
    const fields = Object.keys(filters).filter(f => cardParams.indexOf(f) >= 0);
    const tab = tabs.find(t => t.value === activeTab);
    if (!attachments) return;

    if (fields.length || tabs.length && activeTab) {
      attachments.some((attach, index) => {
        var _attach$params$tab$va, _attach$params$tab$ke;

        let valid = true;
        if (!tab || ((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) !== 'tab' && ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) !== tab.value) return false;
        fields.forEach(key => {
          if (!attach.params || !isEqual(attach.params[key], filters[key])) valid = false;
        });
        if (valid) setAttachmentIndex(index);
        return valid;
      });
    } else setAttachmentIndex(0);
  };

  const onUpdate = updateCard ? useDebounce(updateCard, [updateCard]) : () => {};

  const onChangeTitle = event => {
    setTitle(event.target.value);
    onUpdate({
      title: event.target.value
    });
  };

  const onChangeView = view => {
    const columns = viewValueMap[view];
    setColumns(columns);
    onUpdate({
      columns
    });
  };

  const onChangeDescription = description => {
    setColumns(columns);
    onUpdate({
      description
    });
  };

  const onEnterMove = () => {
    isHoveredMoveBtn.current = true;
  };

  const onLeaveMove = () => {
    isHoveredMoveBtn.current = false;
  };

  const onBlurDescription = () => {
    var _data$description2;

    if (!((_data$description2 = data.description) === null || _data$description2 === void 0 ? void 0 : _data$description2.length)) setIsShowDesc(false);
  };

  const addDesc = () => setIsShowDesc(true);

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$Z.card, `col-${columns}`, className),
    ref: forwardedRef
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$Z.inner
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$Z.head
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$Z.name, {
      readonly: !updateCard
    })
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$Z.nameValue
  }, (title === null || title === void 0 ? void 0 : title.length) ? title : t('title')), /*#__PURE__*/React__default.createElement("input", {
    value: title,
    type: "text",
    placeholder: t('title'),
    onChange: onChangeTitle,
    className: cx(css$Z.nameEdit, {
      active: !(title === null || title === void 0 ? void 0 : title.length)
    })
  })), /*#__PURE__*/React__default.createElement(Tooltip, {
    overlayContent: /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement("div", null, t('updatedByName', {
      name: stackOwner
    })), data.head && /*#__PURE__*/React__default.createElement("div", {
      className: css$Z.infoTime
    }, moment(data.head.timestamp).format('D MMM YYYY')))
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$Z.info
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-information-outline"
  }))), /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$Z.button, css$Z.link),
    color: "secondary",
    Component: Link,
    to: `/${data.stack}`
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-open-in-new"
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$Z.cardControls
  }, deleteCard && /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$Z.button),
    color: "secondary",
    onClick: deleteCard
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-trash-can-outline"
  })), moveAvailable && /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$Z.button, css$Z.move),
    color: "secondary",
    onMouseEnter: onEnterMove,
    onMouseLeave: onLeaveMove
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-cursor-move"
  })), /*#__PURE__*/React__default.createElement(ViewSwitcher, {
    onChange: onChangeView,
    value: data.columns === 1 ? 'grid' : 'list',
    className: css$Z.viewSwitcher
  }))), /*#__PURE__*/React__default.createElement("div", {
    className: css$Z.description
  }, isShowDesc && /*#__PURE__*/React__default.createElement(StretchTextAreaField, {
    value: data.description,
    ref: descFieldRef,
    placeholder: t('description'),
    onChange: onChangeDescription,
    onBlur: onBlurDescription,
    readOnly: !updateCard
  }), !isShowDesc && updateCard && /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$Z.addDesc),
    color: "secondary",
    onClick: addDesc
  }, "+ ", t('addDescription'))), headId && attachmentIndex !== null ? /*#__PURE__*/React__default.createElement(Attachment, {
    className: css$Z.attachment,
    isList: true,
    withLoader: true,
    stack: data.stack,
    frameId: headId,
    id: attachmentIndex
  }) : /*#__PURE__*/React__default.createElement("div", {
    className: css$Z.emptyMessage
  }, t('emptyDashboard'))));
});

const DnDItem = memo(({
  id,
  onMoveItem,
  children
}) => {
  const ref = useRef(null);
  const [, connectDrag] = useDrag({
    item: {
      id,
      type: 'IMG'
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      };
    }
  });
  const [, connectDrop] = useDrop({
    accept: 'IMG',
    drop: hoveredOverItem => {
      if (hoveredOverItem.id !== id) {
        onMoveItem(hoveredOverItem.id, id);
      }
    }
  });
  connectDrag(ref);
  connectDrop(ref);
  return React__default.Children.map(children, child => React__default.cloneElement(child, {
    forwardedRef: ref
  }));
});

var css$_ = {"details":"_styles-module__details__1YGMH","header":"_styles-module__header__1lU-L","title":"_styles-module__title__2HPT5","edit":"_styles-module__edit__3ezYE","permissions":"_styles-module__permissions__3OGBJ","share":"_styles-module__share__198zx","sideHeader":"_styles-module__sideHeader__2PqMZ","addButton":"_styles-module__addButton__4KCh5","description":"_styles-module__description__1peNb","addDesc":"_styles-module__addDesc__-FjzY","dropdown":"_styles-module__dropdown__2-VRH","tabs":"_styles-module__tabs__pJ1U-","container":"_styles-module__container__3V4ls","section":"_styles-module__section__2_7da","cards":"_styles-module__cards__3OOzf","fields":"_styles-module__fields__WLi30","filters":"_styles-module__filters__2q551","empty":"_styles-module__empty__13-9o"};

const dataFormat$5 = data => data.dashboard;

const Details$3 = () => {
  var _currentUser$data, _data$description;

  const {
    t
  } = useTranslation();
  const {
    user,
    id
  } = useParams();
  const {
    push
  } = useHistory();
  const {
    items,
    moveItem,
    setItems
  } = useContext(GridContext);
  const [{
    currentUser,
    apiUrl
  }] = useAppStore();
  const currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  const {
    deleteReport,
    updateReport,
    reportInsertCard,
    reportDeleteCard,
    reportUpdateCard
  } = useActions$2();
  const descFieldRef = useRef();
  const isMounted = useRef(false);
  const [isShowStacksModal, setIsShowStacksModal] = useState(false);
  const [activeTab, setActiveTab] = useState();
  const [tabs, setTabs] = useState([]);
  const {
    form,
    setForm,
    onChange
  } = useForm({});
  const [fields, setFields] = useState({});
  const [filteredCards, setFilteredCards] = useState([]);

  const setGridItems = cardsItems => setItems(cardsItems.map(card => ({
    id: card.index,
    card
  })));

  const {
    data,
    mutate,
    error
  } = useSWR([apiUrl + config.DASHBOARD_DETAILS(user, id), dataFormat$5], fetcher, {
    revalidateOnFocus: false
  });
  const [isShowDesc, setIsShowDesc] = useState(Boolean(data === null || data === void 0 ? void 0 : (_data$description = data.description) === null || _data$description === void 0 ? void 0 : _data$description.length));
  const prevIsShowDesc = usePrevious(isShowDesc);
  const prevData = usePrevious(data);
  useEffect(() => {
    var _data$description2;

    if (!isEqual(prevData === null || prevData === void 0 ? void 0 : prevData.cards, data === null || data === void 0 ? void 0 : data.cards) || (data === null || data === void 0 ? void 0 : data.cards) && !isMounted.current) {
      parseTabs();
    }

    if ((prevData === null || prevData === void 0 ? void 0 : prevData.description) !== (data === null || data === void 0 ? void 0 : data.description)) setIsShowDesc(Boolean(data === null || data === void 0 ? void 0 : (_data$description2 = data.description) === null || _data$description2 === void 0 ? void 0 : _data$description2.length));
  }, [data]);
  useEffect(() => {
    return () => {
      setGridItems([]);
    };
  }, []);
  useEffect(() => {
    if (filteredCards.length) {
      setGridItems(filteredCards);
      parseParams();
    }
  }, [filteredCards]);
  useEffect(() => {
    if (activeTab !== undefined) filterCards();
  }, [activeTab]);
  useEffect(() => {
    var _data$description3;

    if (isMounted.current && prevIsShowDesc !== isShowDesc && descFieldRef.current && !((_data$description3 = data.description) === null || _data$description3 === void 0 ? void 0 : _data$description3.length)) descFieldRef.current.focus();
  }, [isShowDesc]);
  useEffect(() => {
    isMounted.current = true;
  }, []);

  const getAllAttachments = cards => {
    var _cards;

    if (!cards) cards = data === null || data === void 0 ? void 0 : data.cards;
    if (!((_cards = cards) === null || _cards === void 0 ? void 0 : _cards.length)) return [];
    return cards.reduce((result, card) => {
      return result.concat(get(card, 'head.attachments', []));
    }, []);
  };

  const parseParams = () => {
    const fields = parseStackParams(getAllAttachments(filteredCards)) || {};
    const defaultFilterValues = Object.keys(fields).reduce((result, fieldName) => {
      if (fields[fieldName].type === 'select') result[fieldName] = fields[fieldName].options[0].value;

      if (fields[fieldName].type === 'slider') {
        const key = Object.keys(fields[fieldName].options)[0];
        result[fieldName] = fields[fieldName].options[key];
      }

      if (fields[fieldName].type === 'checkbox') result[fieldName] = false;
      return result;
    }, {});
    setForm(defaultFilterValues);
    setFields(fields);
  };

  const parseTabs = () => {
    var _tabs$;

    const attachments = getAllAttachments();
    if (!attachments || !attachments.length) return;
    const tabs = parseStackTabs(attachments);
    const hasOldTab = tabs.some(t => activeTab && t.value === activeTab);
    const newActiveTab = hasOldTab ? activeTab : ((_tabs$ = tabs[0]) === null || _tabs$ === void 0 ? void 0 : _tabs$.value) || null;
    setTabs(tabs);
    setActiveTab(newActiveTab);
    if (newActiveTab === activeTab) filterCards();
  };

  const filterCards = () => {
    if (tabs.length && activeTab) {
      const filteredCards = data.cards.filter(card => {
        const attachments = get(card, 'head.attachments', []);
        if (!attachments || !attachments.length) return true;
        const tabs = parseStackTabs(attachments);
        const tab = tabs.find(t => t.value === activeTab);
        if (!tabs.length) return true;
        return attachments.some(attach => {
          var _attach$params$tab$va, _attach$params$tab$ke;

          return tab && (((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) === 'tab' || ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) === tab.value);
        });
      });
      setFilteredCards(filteredCards);
    } else {
      setFilteredCards(data.cards);
    }
  };

  const onChangeTab = tabName => {
    setActiveTab(tabName);
  };

  const update = async params => {
    await updateReport(user, id, params);
  };

  const debounceUpdateTitle = useDebounce(async fields => {
    await update(fields);
  }, 300);

  const onChangeTitle = title => {
    data.title = title;
    mutate(data, false);
    debounceUpdateTitle({
      title
    });
  };

  const debounceUpdateDescription = useDebounce(async fields => {
    await update(fields);
  }, 300);

  const onChangeDescription = description => {
    data.description = description;
    mutate(data, false);
    debounceUpdateDescription({
      description
    });
  };

  const onChangePrivate = async isPrivate => {
    update({
      private: isPrivate
    }).then(() => {
      mutate({ ...data,
        private: isPrivate
      }, false);
    });
  };

  const addStacks = async stacks => {
    var _data$cards;

    const {
      dashboard: {
        cards
      }
    } = await reportInsertCard(user, id, stacks.map(stack => ({
      stack
    })), data === null || data === void 0 ? void 0 : (_data$cards = data.cards) === null || _data$cards === void 0 ? void 0 : _data$cards.length);
    const newCards = cards.filter(c => stacks.indexOf(c.stack) >= 0);
    mutate({ ...data,
      cards: data.cards.concat(newCards)
    }, false);
  };

  const getDeleteCardFunc = stack => async () => {
    await reportDeleteCard(user, id, stack);
    mutate({ ...data,
      cards: data.cards.filter(c => c.stack !== stack)
    }, false);
  };

  const updatePermissions = permissions => {
    mutate({ ...data,
      permissions
    }, false);
  };

  const getUpdatedCardFunc = stack => async fields => {
    const {
      cards: newCards
    } = await reportUpdateCard(user, id, stack, fields);
    const updatedCard = newCards.find(i => i.stack === stack);
    const index = data.cards.findIndex(i => i.stack === stack);
    if (index >= 0) Object.keys(fields).forEach(key => {
      data.cards[index][key] = updatedCard[key];
    });
    mutate({ ...data
    }, false);
  };

  const moveCard = (indexFrom, indexTo) => {
    if (indexTo < 0 || indexFrom < 0) return;
    const {
      stack
    } = items[indexFrom].card;
    moveItem(indexFrom, indexTo);
    reportUpdateCard(user, id, stack, {
      index: indexTo
    }).catch(console.log);
  };

  const deleteDashboard = async () => {
    await deleteReport(user, id);
    push(routes.reports(user));
  };

  const renderFilters = () => {
    if (!Object.keys(fields).length) return null;
    const hasSelectField = Object.keys(fields).some(key => fields[key].type === 'select');
    return /*#__PURE__*/React__default.createElement(StackFilters, {
      fields: fields,
      form: form,
      onChange: onChange,
      className: cx(css$_.filters, {
        'with-select': hasSelectField
      })
    });
  };

  const toggleAddStackModal = event => {
    if (event === null || event === void 0 ? void 0 : event.target) event.preventDefault();
    setIsShowStacksModal(isShow => !isShow);
  };

  const onBlurDescription = () => {
    var _data$description4;

    if (!((_data$description4 = data.description) === null || _data$description4 === void 0 ? void 0 : _data$description4.length)) setIsShowDesc(false);
  };

  const addDesc = () => setIsShowDesc(true);

  if ((error === null || error === void 0 ? void 0 : error.status) === 403) return /*#__PURE__*/React__default.createElement(AccessForbidden, null, t('youDontHaveAnAccessToThisDashboard'), ".", isSignedIn() && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement("br", null), /*#__PURE__*/React__default.createElement(Link, {
    to: routes.reports(currentUserName)
  }, t('goToMyDashboards'))));
  if ((error === null || error === void 0 ? void 0 : error.status) === 404) return /*#__PURE__*/React__default.createElement(NotFound, null, t('theDashboardYouAreRookingForCouldNotBeFound'), ' ', isSignedIn() && /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement(Link, {
    to: routes.reports(currentUserName)
  }, t('goToMyDashboards')), "."));
  if (!data) return /*#__PURE__*/React__default.createElement(Loader$6, null);
  const isUserOwner = currentUserName === user;
  const CardWrapComponent = isUserOwner ? DnDItem : Fragment;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$_.details
  }, /*#__PURE__*/React__default.createElement(Yield, {
    name: "header-yield"
  }, /*#__PURE__*/React__default.createElement(BackButton, {
    Component: Link,
    to: routes.reports(user)
  }, currentUserName === user ? t('backToDashboards') : t('backToDashboardsOf', {
    name: user
  }))), /*#__PURE__*/React__default.createElement("div", {
    className: css$_.header
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$_.title
  }, /*#__PURE__*/React__default.createElement(StretchTitleField, {
    className: css$_.edit,
    value: data.title || '',
    onChange: onChangeTitle,
    readOnly: currentUserName !== data.user,
    placeholder: t('newDashboard')
  }), /*#__PURE__*/React__default.createElement("span", {
    className: `mdi mdi-lock${data.private ? '' : '-open'}`
  })), data.private && /*#__PURE__*/React__default.createElement(PermissionUsers, {
    className: css$_.permissions,
    permissions: data.permissions
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$_.sideHeader
  }, isUserOwner && /*#__PURE__*/React__default.createElement("a", {
    className: css$_.addButton,
    onClick: toggleAddStackModal,
    href: "#"
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-plus"
  }), t('addStack')), isUserOwner && /*#__PURE__*/React__default.createElement(Share, {
    instancePath: `${user}/d/${data.id}`,
    onChangeAccessLevel: onChangePrivate,
    className: css$_.share,
    defaultIsPrivate: data.private,
    defaultPermissions: data.permissions,
    onUpdatePermissions: updatePermissions
  }), isUserOwner && /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$_.dropdown,
    items: [{
      title: t('delete'),
      onClick: deleteDashboard
    }]
  }, /*#__PURE__*/React__default.createElement(Button, {
    className: css$_['dropdown-button'],
    color: "secondary"
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-dots-horizontal"
  }))))), /*#__PURE__*/React__default.createElement("div", {
    className: css$_.description
  }, isShowDesc && /*#__PURE__*/React__default.createElement(StretchTextAreaField, {
    value: data.description || '',
    ref: descFieldRef,
    placeholder: t('description'),
    onChange: onChangeDescription,
    onBlur: onBlurDescription,
    readOnly: currentUserName !== data.user
  }), !isShowDesc && currentUserName === data.user && /*#__PURE__*/React__default.createElement(Button, {
    className: css$_.addDesc,
    color: "secondary",
    onClick: addDesc
  }, "+ ", t('addDescription'))), Boolean(tabs.length) && /*#__PURE__*/React__default.createElement(Tabs$1, {
    className: css$_.tabs,
    onChange: onChangeTab,
    value: activeTab,
    items: tabs
  }), Boolean(items.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$_.container
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$_.section
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$_.fields
  }, renderFilters())), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$_.cards)
  }, items.map(item => /*#__PURE__*/React__default.createElement(CardWrapComponent, Object.assign({
    key: item.card.stack
  }, isUserOwner ? {
    id: item.id,
    onMoveItem: moveCard
  } : {}), /*#__PURE__*/React__default.createElement(Card, {
    activeTab: activeTab,
    filters: form,
    deleteCard: isUserOwner && getDeleteCardFunc(item.card.stack),
    data: item.card,
    updateCard: isUserOwner && getUpdatedCardFunc(item.card.stack),
    moveAvailable: isUserOwner
  }))))), !items.length && !(data === null || data === void 0 ? void 0 : data.cards) && /*#__PURE__*/React__default.createElement("div", {
    className: css$_.empty
  }, t('thereAreNoStacksYet'), " ", /*#__PURE__*/React__default.createElement("br", null), t('youCanSendStacksYouWantToBeHereLaterOrAddItRightNow'), isUserOwner && /*#__PURE__*/React__default.createElement(Fragment, null, ' ', /*#__PURE__*/React__default.createElement("a", {
    className: css$_.addButton,
    onClick: toggleAddStackModal,
    href: "#"
  }, t('addStack')), ".")), /*#__PURE__*/React__default.createElement(AddStacksModal, {
    isShow: isShowStacksModal,
    onClose: toggleAddStackModal,
    onAddStacks: addStacks
  }));
};

var css$$ = {"reports":"_styles-module__reports__30ROl"};

const Reports = ({}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$$.reports
  }, /*#__PURE__*/React__default.createElement(Switch, null, /*#__PURE__*/React__default.createElement(Route, {
    path: routes.reports(),
    exact: true,
    component: List$2
  }), /*#__PURE__*/React__default.createElement(Route, {
    path: routes.reportsDetails(),
    component: Details$3
  })));
};

function _extends$6() {
  _extends$6 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$6.apply(this, arguments);
}

var _ref$6 = /*#__PURE__*/createElement("path", {
  d: "M72.388 28.36c.867-.884 1.3-2.063 1.3-3.536 0-1.473-.433-2.643-1.3-3.51-.85-.867-1.863-1.3-3.042-1.3-1.179 0-2.201.425-3.068 1.274-.85.85-1.274 2.01-1.274 3.484 0 1.473.425 2.66 1.274 3.562.867.884 1.89 1.326 3.068 1.326 1.179 0 2.193-.433 3.042-1.3zm-3.666 3.874c-1.907 0-3.51-.693-4.81-2.08-1.3-1.404-1.95-3.19-1.95-5.356 0-2.184.641-3.952 1.924-5.304 1.3-1.37 2.912-2.054 4.836-2.054 1.127 0 2.115.26 2.964.78.867.503 1.534 1.17 2.002 2.002V12.76h2.99V32h-2.99v-2.678a5.766 5.766 0 01-2.002 2.132c-.85.52-1.837.78-2.964.78zM79.921 21.782c0-1.213.511-2.236 1.534-3.068 1.023-.85 2.366-1.274 4.03-1.274 1.664 0 2.981.416 3.952 1.248.988.815 1.517 1.933 1.586 3.354h-3.042c-.052-.71-.303-1.265-.754-1.664-.433-.399-1.049-.598-1.846-.598-.797 0-1.421.182-1.872.546-.45.347-.676.815-.676 1.404 0 .572.286 1.023.858 1.352.572.33 1.265.572 2.08.728.832.156 1.655.347 2.47.572a4.422 4.422 0 012.106 1.248c.572.59.858 1.387.858 2.392 0 1.248-.529 2.262-1.586 3.042-1.04.78-2.383 1.17-4.03 1.17-1.647 0-2.981-.399-4.004-1.196-1.023-.797-1.586-1.933-1.69-3.406h3.068c.052.71.312 1.265.78 1.664s1.1.598 1.898.598c.815 0 1.456-.173 1.924-.52.485-.364.728-.84.728-1.43s-.286-1.049-.858-1.378c-.572-.33-1.274-.572-2.106-.728a71.892 71.892 0 01-2.47-.572 4.632 4.632 0 01-2.08-1.196c-.572-.572-.858-1.335-.858-2.288zM101.402 20.092h-3.484v7.93c0 .537.121.927.364 1.17.26.225.693.338 1.3.338h1.82V32h-2.34c-2.756 0-4.134-1.326-4.134-3.978v-7.93h-1.69v-2.418h1.69v-3.562h2.99v3.562h3.484v2.418zM113.572 28.36c.866-.884 1.3-2.063 1.3-3.536 0-1.473-.434-2.643-1.3-3.51-.85-.867-1.864-1.3-3.042-1.3-1.179 0-2.202.425-3.068 1.274-.85.85-1.274 2.01-1.274 3.484 0 1.473.424 2.66 1.274 3.562.866.884 1.889 1.326 3.068 1.326 1.178 0 2.192-.433 3.042-1.3zm-3.666 3.874c-1.907 0-3.51-.693-4.81-2.08-1.3-1.404-1.95-3.19-1.95-5.356 0-2.184.641-3.952 1.924-5.304 1.3-1.37 2.912-2.054 4.836-2.054 1.126 0 2.114.26 2.964.78.866.503 1.534 1.17 2.002 2.002v-2.548h2.99V32h-2.99v-2.678a5.774 5.774 0 01-2.002 2.132c-.85.52-1.838.78-2.964.78zM127.787 32.234c-2.08 0-3.77-.676-5.07-2.028-1.3-1.352-1.95-3.137-1.95-5.356 0-2.236.65-4.03 1.95-5.382 1.317-1.352 3.007-2.028 5.07-2.028 1.733 0 3.163.416 4.29 1.248 1.144.815 1.915 1.985 2.314 3.51h-3.198c-.538-1.508-1.673-2.262-3.406-2.262-1.214 0-2.184.433-2.912 1.3-.711.85-1.066 2.045-1.066 3.588 0 1.543.355 2.747 1.066 3.614.728.867 1.698 1.3 2.912 1.3 1.716 0 2.851-.754 3.406-2.262h3.198c-.416 1.456-1.196 2.617-2.34 3.484-1.144.85-2.566 1.274-4.264 1.274zM140.308 32h-2.964V12.76h2.964v11.18l5.2-6.266h4.108l-6.604 7.176 6.604 7.15h-4.004l-5.304-6.162V32zM154.107 31.506a1.78 1.78 0 01-1.274.494c-.503 0-.927-.173-1.274-.52a1.75 1.75 0 01-.494-1.248c0-.503.165-.927.494-1.274.347-.347.771-.52 1.274-.52s.927.173 1.274.52c.347.347.52.771.52 1.274s-.173.927-.52 1.274zM167.298 28.36c.867-.884 1.3-2.063 1.3-3.536 0-1.473-.433-2.643-1.3-3.51-.849-.867-1.863-1.3-3.042-1.3-1.179 0-2.201.425-3.068 1.274-.849.85-1.274 2.01-1.274 3.484 0 1.473.425 2.66 1.274 3.562.867.884 1.889 1.326 3.068 1.326s2.193-.433 3.042-1.3zm-3.666 3.874c-1.907 0-3.51-.693-4.81-2.08-1.3-1.404-1.95-3.19-1.95-5.356 0-2.184.641-3.952 1.924-5.304 1.3-1.37 2.912-2.054 4.836-2.054 1.127 0 2.115.26 2.964.78a5.284 5.284 0 012.002 2.002v-2.548h2.99V32h-2.99v-2.678a5.766 5.766 0 01-2.002 2.132c-.849.52-1.837.78-2.964.78zM178.861 13.878c0 .537-.182.988-.546 1.352-.364.364-.815.546-1.352.546-.52 0-.962-.182-1.326-.546-.364-.364-.546-.815-.546-1.352 0-.537.182-.988.546-1.352a1.805 1.805 0 011.326-.546c.537 0 .988.182 1.352.546.364.364.546.815.546 1.352zM175.481 32V17.674h2.964V32h-2.964z",
  fill: "#303340"
});

var _ref2$3 = /*#__PURE__*/createElement("rect", {
  width: 31.284,
  height: 29.645,
  rx: 3,
  transform: "scale(1.1958 .755) rotate(-45 51.44 21.307)",
  fill: "url(#logo_svg__paint0_linear)"
});

var _ref3$2 = /*#__PURE__*/createElement("rect", {
  width: 31.284,
  height: 29.645,
  rx: 3,
  transform: "scale(1.1958 .755) rotate(-45 39.314 16.284)",
  fill: "url(#logo_svg__paint1_linear)",
  fillOpacity: 0.9
});

var _ref4$1 = /*#__PURE__*/createElement("rect", {
  width: 31.284,
  height: 29.645,
  rx: 3,
  transform: "scale(1.1958 .755) rotate(-45 26.73 10.993)",
  fill: "url(#logo_svg__paint2_linear)",
  fillOpacity: 0.9
});

var _ref5 = /*#__PURE__*/createElement("defs", null, /*#__PURE__*/createElement("linearGradient", {
  id: "logo_svg__paint0_linear",
  x1: 24.978,
  y1: -2.508,
  x2: 2.623,
  y2: 27.352,
  gradientUnits: "userSpaceOnUse"
}, /*#__PURE__*/createElement("stop", {
  stopColor: "#372191"
}), /*#__PURE__*/createElement("stop", {
  offset: 1,
  stopColor: "#9D8EF8"
})), /*#__PURE__*/createElement("linearGradient", {
  id: "logo_svg__paint1_linear",
  x1: 24.899,
  y1: -2.429,
  x2: -1.348,
  y2: 22.377,
  gradientUnits: "userSpaceOnUse"
}, /*#__PURE__*/createElement("stop", {
  stopColor: "#7B369F"
}), /*#__PURE__*/createElement("stop", {
  offset: 1,
  stopColor: "#DCAFF3"
})), /*#__PURE__*/createElement("linearGradient", {
  id: "logo_svg__paint2_linear",
  x1: 18.113,
  y1: 3.687,
  x2: -8.564,
  y2: 16.952,
  gradientUnits: "userSpaceOnUse"
}, /*#__PURE__*/createElement("stop", {
  stopColor: "#84D1EA"
}), /*#__PURE__*/createElement("stop", {
  offset: 1,
  stopColor: "#DAF7FE"
})));

function SvgLogo(props) {
  return /*#__PURE__*/createElement("svg", _extends$6({
    width: 179,
    height: 48,
    viewBox: "0 0 179 48",
    fill: "none"
  }, props), _ref$6, _ref2$3, _ref3$2, _ref4$1, _ref5);
}

var css$10 = {"header":"_styles-module__header__3C4T1","logo":"_styles-module__logo__1jfuS","buttons":"_styles-module__buttons__2EQYi","button":"_styles-module__button__3cb7N"};

const Header = ({
  className
}) => {
  const {
    t
  } = useTranslation();
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$10.header, className)
  }, /*#__PURE__*/React__default.createElement(Link, {
    to: "/",
    className: css$10.logo
  }, /*#__PURE__*/React__default.createElement(SvgLogo, null)), /*#__PURE__*/React__default.createElement("div", {
    className: css$10.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    Component: Link,
    to: "/auth/login",
    className: css$10.button,
    color: "primary",
    variant: "contained"
  }, t('logIn'))));
};

var css$11 = {"layout":"_styles-module__layout__23bi3","header":"_styles-module__header__1chFa","main":"_styles-module__main__70hee"};

const UnAuthorizedLayout = ({
  children
}) => {
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$11.layout
  }, /*#__PURE__*/React__default.createElement(Header, {
    className: css$11.header
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$11.main
  }, children));
};

var css$12 = {"infoButton":"_style-module__infoButton__2zmYM"};

const SettingsInformation = ({
  className,
  renderModalContent
}) => {
  const {
    t
  } = useTranslation();
  const [isShowModal, setIsShowModal] = useState(false);

  const toggleModal = () => setIsShowModal(value => !value);

  return /*#__PURE__*/React__default.createElement(Fragment, null, /*#__PURE__*/React__default.createElement(Button, {
    className: cx(css$12.infoButton, className),
    size: "small",
    color: "secondary",
    onClick: toggleModal
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-information-outline"
  })), renderModalContent && /*#__PURE__*/React__default.createElement(Modal, {
    withCloseButton: true,
    title: t('howToConnectYourDataWithDStack'),
    isShow: isShowModal,
    size: "big",
    onClose: toggleModal
  }, renderModalContent()));
};

export { AccessForbidden, AppStoreProvider, Avatar, BackButton, Button, CheckboxField, CodeViewer, Copy, GridContext as DnDGridContext, GridProvider as DnDGridContextProvider, DnDItem, Dropdown, FileDragnDrop$1 as FileDragnDrop, Jobs, Loader, MarkdownRender, Modal, NotFound, ProgressBar, Details$3 as ReportDetails, List$2 as ReportList, Reports, SearchField, SelectField, SettingsInformation, SliderField, Spinner, Attachment as StackAttachment, StateProvider as StackAttachmentProvider, Details as StackDetails, Details$1 as StackDetailsApp, StackFilters, Frames as StackFrames, HowTo as StackHowToFetchData, List as StackList, Item as StackListItem, Upload as StackUpload, StretchTextAreaField as StretchTextareaField, StretchTitleField, Tabs, TextAreaField, TextField, Tooltip, UnAuthorizedLayout, UploadStack, ViewSwitcher, Yield, apiFabric, actionsTypes as appStoreActionTypes, config, useAppStore };
//# sourceMappingURL=index.modern.js.map
