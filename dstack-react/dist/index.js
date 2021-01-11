function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var axios = _interopDefault(require('axios'));
var lodashEs = require('lodash-es');
var cx = _interopDefault(require('classnames'));
var Highlight = _interopDefault(require('react-highlight.js'));
var reactI18next = require('react-i18next');
var copy = _interopDefault(require('copy-to-clipboard'));
var RcTooltip = _interopDefault(require('rc-tooltip'));
var moment = _interopDefault(require('moment'));
var ReactMarkdown = _interopDefault(require('react-markdown'));
var MathJax = _interopDefault(require('react-mathjax'));
var RemarkMathPlugin = _interopDefault(require('remark-math'));
var reactPortal = require('react-portal');
var Select = require('rc-select');
var Select__default = _interopDefault(Select);
var Slider = _interopDefault(require('rc-slider'));
var Plot = _interopDefault(require('react-plotly.js'));
var CSV = require('csv-string');
var reactRouterDom = require('react-router-dom');
var reactUse = require('react-use');
var uuid = require('uuid');
var useSWR = _interopDefault(require('swr'));
var Editor = _interopDefault(require('react-simple-code-editor'));
var prismCore = require('prismjs/components/prism-core');
require('prismjs/components/prism-python');
require('prismjs/components/prism-r');
require('prismjs/themes/prism.css');
var reactDnd = require('react-dnd');

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

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectDestructuringEmpty(obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

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

var initialState = {
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
var reducer = function reducer(state, action) {
  if (state === void 0) {
    state = initialState;
  }

  switch (action.type) {
    case actionsTypes.FETCH_CURRENT_USER:
      return _extends({}, state, {
        currentUser: _extends({}, state.currentUser, {
          loading: true
        })
      });

    case actionsTypes.FETCH_CURRENT_USER_SUCCESS:
      return _extends({}, state, {
        currentUser: _extends({}, state.currentUser, {
          data: action.payload,
          loading: false
        })
      });

    case actionsTypes.FETCH_CURRENT_USER_FAIL:
      return _extends({}, state, {
        currentUser: _extends({}, state.currentUser, {
          loading: false
        })
      });

    case actionsTypes.FETCH_CONFIG_INFO:
      return _extends({}, state, {
        configInfo: _extends({}, state.configInfo, {
          loading: true
        })
      });

    case actionsTypes.FETCH_CONFIG_INFO_SUCCESS:
      return _extends({}, state, {
        configInfo: _extends({}, state.configInfo, {
          data: action.payload,
          loading: false
        })
      });

    case actionsTypes.FETCH_CONFIG_INFO_FAIL:
      return _extends({}, state, {
        configInfo: _extends({}, state.configInfo, {
          loading: false
        })
      });

    case actionsTypes.START_PROGRESS:
      return _extends({}, state, {
        appProgress: _extends({}, state.appProgress, {
          active: true,
          value: null
        })
      });

    case actionsTypes.SET_PROGRESS:
      return _extends({}, state, {
        appProgress: _extends({}, state.appProgress, {
          value: action.payload
        })
      });

    case actionsTypes.COMPLETE_PROGRESS:
      return _extends({}, state, {
        appProgress: _extends({}, state.appProgress, {
          active: false,
          value: null
        })
      });

    case actionsTypes.RESET_PROGRESS:
      return _extends({}, state, {
        appProgress: _extends({}, state.appProgress, {
          active: null,
          value: null
        })
      });

    default:
      return state;
  }
};
var StateContext = React.createContext();
var AppStoreProvider = function AppStoreProvider(_ref) {
  var children = _ref.children,
      apiUrl = _ref.apiUrl;
  return /*#__PURE__*/React__default.createElement(StateContext.Provider, {
    value: React.useReducer(reducer, _extends({}, initialState, {
      apiUrl: apiUrl
    }))
  }, children);
};
var useAppStore = function useAppStore() {
  return React.useContext(StateContext);
};

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
  STACK_LIST: '/stacks',
  USER_STACK_LIST: function USER_STACK_LIST(userName) {
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
var reportModelPythonCode = "import dstack as ds\nfrom sklearn.linear_model import LogisticRegression\n\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\nds.push(\"my_model\", model, \"My first linear model\")";
var reportPlotPythonCode = "import matplotlib.pyplot as plt\nimport dstack as ds\n\nfig = plt.figure()\nplt.plot([1, 2, 3, 4], [1, 4, 9, 16])\n\nds.push_frame(\"my_plot\", fig, \"My first plot\")";

var apiFabric = function apiFabric(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      apiUrl = _ref.apiUrl;

  var CancelToken = axios.CancelToken;
  var instance = axios.create({
    baseURL: apiUrl,
    crossDomain: true
  });
  instance.cancelToken = CancelToken;
  instance.interceptors.request.use(function (requestConfig) {
    var token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    requestConfig.headers.Authorization = token ? "Bearer " + token : '';
    return requestConfig;
  });
  instance.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if (lodashEs.get(error, 'response.status', null) === 401) {
      return Promise.reject(error.response);
    } else if (lodashEs.get(error, 'response.status', null) === 400) {
      return Promise.reject(error.response);
    } else {
      return Promise.reject(error);
    }
  });
  return instance;
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

var _ref = /*#__PURE__*/React.createElement("rect", {
  x: 17.023,
  y: 5.294,
  width: 51.377,
  height: 70.558,
  rx: 25.689,
  stroke: "#CFAEE1",
  strokeWidth: 10
});

var _ref2 = /*#__PURE__*/React.createElement("rect", {
  x: 0.516,
  y: 42.057,
  width: 84.394,
  height: 61.377,
  rx: 10,
  fill: "#E9CAFA"
});

var _ref3 = /*#__PURE__*/React.createElement("g", {
  opacity: 0.3,
  fill: "#BB77DF"
}, /*#__PURE__*/React.createElement("rect", {
  x: 38.877,
  y: 63.206,
  width: 7.672,
  height: 16.879,
  rx: 3.836
}), /*#__PURE__*/React.createElement("rect", {
  x: 35.808,
  y: 72.412,
  width: 13.81,
  height: 13.81,
  rx: 6.905
}));

function SvgLock(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$1({
    width: 85,
    height: 104,
    viewBox: "0 0 85 104",
    fill: "none"
  }, props), _ref, _ref2, _ref3);
}

var css = {"forbidden":"_3PN84","message":"_2i8KH"};

var AccessForbidden = function AccessForbidden(_ref) {
  var children = _ref.children;
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

var css$1 = {"avatar":"_3xvkT"};

var Avatar = React.forwardRef(function (_ref, ref) {
  var className = _ref.className,
      name = _ref.name,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? 'violet' : _ref$color,
      _ref$size = _ref.size,
      size = _ref$size === void 0 ? 'normal' : _ref$size,
      withBorder = _ref.withBorder,
      onClick = _ref.onClick;
  return /*#__PURE__*/React__default.createElement("div", {
    ref: ref,
    className: cx(css$1.avatar, className, color, size, {
      border: withBorder
    }),
    onClick: onClick
  }, name.slice(0, 2));
});

var css$2 = {"back":"_1MuhU","children":"_3cJ8S"};

var BackButton = function BackButton(_ref) {
  var _ref$Component = _ref.Component,
      Component = _ref$Component === void 0 ? 'button' : _ref$Component,
      children = _ref.children,
      className = _ref.className,
      props = _objectWithoutPropertiesLoose(_ref, ["Component", "children", "className"]);

  return /*#__PURE__*/React__default.createElement(Component, _extends({
    className: cx(css$2.back, className)
  }, props), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-arrow-left"
  }), children && /*#__PURE__*/React__default.createElement("span", {
    className: css$2.children
  }, children));
};

var css$3 = {"button":"_2lKoS","spinner":"_31PPt"};

var css$4 = {"spinner":"_3XhrC","spinner-animation":"_2UA3s"};

var COLORS = {
  white: '#fff',
  blue: '#507CD0'
};

var Spinner = function Spinner(_ref) {
  var _ref$size = _ref.size,
      size = _ref$size === void 0 ? 22 : _ref$size,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? 'white' : _ref$color,
      isShown = _ref.isShown,
      className = _ref.className,
      align = _ref.align;
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$4.spinner, className, align, {
      show: isShown
    })
  }, /*#__PURE__*/React__default.createElement("svg", {
    width: size,
    height: size,
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
    stopColor: COLORS[color]
  }), /*#__PURE__*/React__default.createElement("stop", {
    offset: "1",
    stopColor: COLORS[color],
    stopOpacity: "0.2"
  })))));
};

var Button = React.forwardRef(function (_ref, ref) {
  var _ref$Component = _ref.Component,
      Component = _ref$Component === void 0 ? 'button' : _ref$Component,
      children = _ref.children,
      className = _ref.className,
      _ref$size = _ref.size,
      size = _ref$size === void 0 ? 'normal' : _ref$size,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? 'default' : _ref$color,
      _ref$variant = _ref.variant,
      variant = _ref$variant === void 0 ? 'default' : _ref$variant,
      _ref$fullWidth = _ref.fullWidth,
      fullWidth = _ref$fullWidth === void 0 ? false : _ref$fullWidth,
      isShowSpinner = _ref.isShowSpinner,
      props = _objectWithoutPropertiesLoose(_ref, ["Component", "children", "className", "size", "color", "variant", "fullWidth", "isShowSpinner"]);

  return /*#__PURE__*/React__default.createElement(Component, _extends({
    ref: ref,
    className: cx(css$3.button, size, "color-" + color, "variant-" + variant, className, {
      'full-width': fullWidth
    })
  }, props), isShowSpinner && /*#__PURE__*/React__default.createElement(Spinner, {
    className: css$3.spinner,
    color: "white",
    isShown: true
  }), children);
});

var css$5 = {"checkbox":"_3lqFk","toggle-label":"_1aLAG","label":"_2PZb-","wrapper":"_2Vufp","mark":"_2Pb2f"};

var CheckboxField = function CheckboxField(_ref) {
  var className = _ref.className,
      value = _ref.value,
      disabled = _ref.disabled,
      _ref$appearance = _ref.appearance,
      appearance = _ref$appearance === void 0 ? 'checkbox' : _ref$appearance,
      _ref$align = _ref.align,
      align = _ref$align === void 0 ? 'left' : _ref$align,
      label = _ref.label,
      onLabel = _ref.onLabel,
      offLabel = _ref.offLabel,
      children = _ref.children,
      props = _objectWithoutPropertiesLoose(_ref, ["className", "value", "disabled", "appearance", "align", "label", "onLabel", "offLabel", "children"]);

  return /*#__PURE__*/React__default.createElement("label", {
    className: cx(css$5.checkbox, className, appearance, align, {
      disabled: disabled
    })
  }, /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement("input", _extends({
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

var css$6 = {"copy":"_3J5hd","message":"_3RWnQ","button":"_2YqEb","icon":"_25GMO","margin":"_3W0rA"};

var Copy = function Copy(_ref) {
  var _cx;

  var children = _ref.children,
      className = _ref.className,
      copyText = _ref.copyText,
      successMessage = _ref.successMessage,
      buttonTitle = _ref.buttonTitle;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(false),
      isShowMessage = _useState[0],
      setIsShowMessage = _useState[1];

  var onCLick = function onCLick() {
    copy(copyText);
    setIsShowMessage(true);
    setTimeout(function () {
      return setIsShowMessage(false);
    }, 3000);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$6.copy, className)
  }, children ? children({
    onClick: onCLick
  }) : /*#__PURE__*/React__default.createElement("div", {
    className: css$6.button,
    onClick: onCLick
  }, /*#__PURE__*/React__default.createElement("span", {
    className: cx(css$6.icon, (_cx = {}, _cx[css$6.margin] = buttonTitle !== null, _cx), 'mdi mdi-content-copy')
  }), buttonTitle && buttonTitle, buttonTitle === undefined && t('copy')), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$6.message, {
      'is-show': isShowMessage
    })
  }, successMessage ? successMessage : t('copied')));
};

var css$7 = {"code":"_3gARj","copy":"_m44gX","icon":"_ZmZbg"};

var CodeViewer = function CodeViewer(_ref) {
  var className = _ref.className,
      language = _ref.language,
      children = _ref.children,
      fontSize = _ref.fontSize;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$7.code, className, fontSize && "font-size-" + fontSize)
  }, /*#__PURE__*/React__default.createElement(Highlight, {
    language: language
  }, children), /*#__PURE__*/React__default.createElement(Copy, {
    className: css$7.copy,
    copyText: children,
    successMessage: t('snippetIsCopied')
  }));
};

var css$8 = {"dropdown":"_1qRCw","button":"_fzNEm","menu":"_AJ1Y3","item":"_3lbfY"};

var Dropdown = function Dropdown(_ref) {
  var className = _ref.className,
      buttonClassName = _ref.buttonClassName,
      children = _ref.children,
      items = _ref.items;

  var _useState = React.useState(false),
      isShow = _useState[0],
      setIsShow = _useState[1];

  var buttonRef = React.useRef(null);
  var dropdownRef = React.useRef(null);
  React.useEffect(function () {
    document.body.addEventListener('click', outlineClickHandle);
    return function () {
      return document.body.removeEventListener('click', outlineClickHandle);
    };
  });

  var outlineClickHandle = function outlineClickHandle(event) {
    var targetElement = event.target;

    do {
      if (targetElement === buttonRef.current || targetElement === dropdownRef.current) return;
      targetElement = targetElement.parentNode;
    } while (targetElement);

    if (isShow) setIsShow(false);
  };

  var onCLickButton = function onCLickButton(event) {
    clickStopPropagation(event);
    setIsShow(!isShow);
  };

  var clickStopPropagation = function clickStopPropagation(event) {
    event.stopPropagation();
    event.preventDefault();
  };

  var onCLickItem = function onCLickItem(item) {
    return function () {
      setIsShow(!isShow);
      if (item.onClick) item.onClick();
    };
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
    }, items.map(function (i, index) {
      return /*#__PURE__*/React__default.createElement("div", {
        key: index,
        className: css$8.item,
        onClick: onCLickItem(i)
      }, i.title);
    }))
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

var css$9 = {"dnd":"_3uYii","fileWrapper":"_1GUx_","file":"_2LG6L","fileExtend":"_3w6--","fileSection":"_B8y5t","fileName":"_3Juxo","fileSize":"_3G6N8","fileRemove":"_16dzP","placeholder":"_Wr_Zp","button":"_14ku1","loading":"_2KndP","progressBar":"_DHbC1","progress":"_2-dth","animate-stripes":"_1Iecq"};

var FileDragnDrop = function FileDragnDrop(_ref, ref) {
  var formats = _ref.formats,
      className = _ref.className,
      loading = _ref.loading,
      _ref$progressPercent = _ref.progressPercent,
      progressPercent = _ref$progressPercent === void 0 ? null : _ref$progressPercent,
      onChange = _ref.onChange;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var inputRef = React.useRef(null);

  var _useState = React.useState(false),
      active = _useState[0],
      setActive = _useState[1];

  var _useState2 = React.useState(),
      selectedFile = _useState2[0],
      setSelectedFile = _useState2[1];

  var isDidMount = React.useRef(true);
  React.useImperativeHandle(ref, function () {
    return {
      clear: function clear() {
        return removeFile();
      }
    };
  });
  React.useEffect(function () {
    if (!isDidMount.current) {
      if (onChange) onChange(selectedFile);
    } else isDidMount.current = false;
  }, [selectedFile]);

  var onClick = function onClick(event) {
    event.preventDefault();
    if (inputRef.current) inputRef.current.click();
  };

  var preventStop = function preventStop(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  var onDrop = function onDrop(event) {
    preventStop(event);
    setActive(false);
    var _event$dataTransfer$f = event.dataTransfer.files,
        file = _event$dataTransfer$f[0];
    if (file && checkAvailableExtension(file)) setSelectedFile(file);
  };

  var onDragEnter = function onDragEnter(event) {
    preventStop(event);
    setActive(true);
  };

  var onDragLeave = function onDragLeave(event) {
    preventStop(event);
    setActive(false);
  };

  var onChangeInput = function onChangeInput(event) {
    var _event$target$files = event.target.files,
        file = _event$target$files[0];
    if (file && checkAvailableExtension(file)) setSelectedFile(file);
  };

  var removeFile = function removeFile() {
    setSelectedFile(null);
  };

  var checkAvailableExtension = function checkAvailableExtension(file) {
    var ext = '.' + file.name.split('.').pop();
    var isAvailable;
    if (formats && formats.length) isAvailable = formats.some(function (format) {
      if (format === '.jpg' || format === '.jpeg') return ext === '.jpg' || ext === '.jpeg';else return format === ext;
    });else isAvailable = true;
    return isAvailable;
  };

  if (loading) return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$9.dnd, className, {
      active: active
    })
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$9.loading
  }, t('Uploading'), "\u2026", typeof progressPercent === 'number' && progressPercent + "%"), typeof progressPercent === 'number' && /*#__PURE__*/React__default.createElement("div", {
    className: css$9.progressBar
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$9.progress,
    style: {
      width: progressPercent + "%"
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
      active: active
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
  }, t('dragHereAFile'), '', Boolean(formats) && "(" + formats.join(', ') + ")", ' ', t('or'), ' '), /*#__PURE__*/React__default.createElement(Button, {
    className: css$9.button,
    variant: "contained",
    color: "primary",
    size: "small",
    onClick: onClick
  }, t('chooseAFile')));
};

var FileDragnDrop$1 = React.forwardRef(FileDragnDrop);

var css$a = {"loader":"_18_Ho","text":"_3dZu_","stacks-pulse":"_350eA","grid":"_Uki0v","item":"_MvjKB","pic":"_Pc6fT","section":"_2EIKh"};

var Loader = function Loader(_ref) {
  _objectDestructuringEmpty(_ref);

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

var MarkdownRender = function MarkdownRender(props) {
  var newProps = _extends({}, props, {
    plugins: [RemarkMathPlugin],
    renderers: _extends({}, props.renderers, {
      math: function math(props) {
        return /*#__PURE__*/React__default.createElement(MathJax.Node, {
          formula: props.value
        });
      },
      inlineMath: function inlineMath(props) {
        return /*#__PURE__*/React__default.createElement(MathJax.Node, {
          inline: true,
          formula: props.value
        });
      }
    })
  });

  return /*#__PURE__*/React__default.createElement(MathJax.Provider, {
    input: "tex"
  }, /*#__PURE__*/React__default.createElement(ReactMarkdown, newProps));
};

var css$b = {"modal":"_3FQ59","dialog":"_268e0","close":"_1Y7yz","title":"_knxNI"};

var Modal = function Modal(_ref) {
  var title = _ref.title,
      className = _ref.className,
      dialogClassName = _ref.dialogClassName,
      titleClassName = _ref.titleClassName,
      _ref$size = _ref.size,
      size = _ref$size === void 0 ? 'big' : _ref$size,
      onClose = _ref.onClose,
      isShow = _ref.isShow,
      children = _ref.children,
      withCloseButton = _ref.withCloseButton;

  var onClickByLayer = function onClickByLayer(event) {
    if (event.currentTarget === event.target && onClose) onClose();
  };

  return /*#__PURE__*/React__default.createElement(reactPortal.Portal, null, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$b.modal, className, {
      show: isShow
    }),
    onClick: onClickByLayer
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$b.dialog, size, dialogClassName)
  }, withCloseButton && /*#__PURE__*/React__default.createElement("span", {
    className: cx(css$b.close, 'mdi mdi-close'),
    onClick: onClose
  }), title && /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$b.title, titleClassName)
  }, title), children)));
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

var _ref$1 = /*#__PURE__*/React.createElement("path", {
  d: "M36.888 47.532V21.244L20.14 47.532h16.748zM35.616 77V63.22H0V48.592L33.496.68h20.246v46.852h8.692V63.22h-8.692V77H35.616zM197.773 47.532V21.244l-16.748 26.288h16.748zM196.501 77V63.22h-35.616V48.592L194.381.68h20.246v46.852h8.692V63.22h-8.692V77h-18.126z",
  fill: "#B4B8C7",
  fillOpacity: 0.6
});

var _ref2$1 = /*#__PURE__*/React.createElement("path", {
  d: "M150.806 39c0 20.987-17.014 38-38 38-20.987 0-38-17.013-38-38s17.013-38 38-38c20.986 0 38 17.013 38 38zm-60.048 0c0 12.177 9.871 22.048 22.048 22.048 12.176 0 22.047-9.871 22.047-22.048 0-12.177-9.871-22.048-22.047-22.048-12.177 0-22.048 9.871-22.048 22.048z",
  fill: "#89C6FF"
});

var _ref3$1 = /*#__PURE__*/React.createElement("path", {
  d: "M150.806 39a37.997 37.997 0 01-30.186 37.188l-3.28-15.612A22.047 22.047 0 00134.853 39h15.953z",
  fill: "#D294F2"
});

var _ref4 = /*#__PURE__*/React.createElement("path", {
  d: "M122.552 75.729a38.002 38.002 0 01-45.98-48.183l15.219 4.81a22.041 22.041 0 0026.667 27.947l4.094 15.426z",
  fill: "#CDF27E"
});

function Svg404(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$2({
    width: 224,
    height: 77,
    viewBox: "0 0 224 77",
    fill: "none"
  }, props), _ref$1, _ref2$1, _ref3$1, _ref4);
}

var css$c = {"not-found":"_tAZyq","message":"_3Ok1U","help":"_Aa8x8"};

var NotFound = function NotFound(_ref) {
  var children = _ref.children;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

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

var usePrevious = (function (value) {
  var ref = React.useRef(value);
  React.useEffect(function () {
    ref.current = value;
  }, [value]);
  return ref.current;
});

var css$d = {"bar":"_12oWc","progress":"_3JWjz"};

var ProgressBar = function ProgressBar(_ref) {
  var className = _ref.className,
      isActive = _ref.isActive,
      globalProgress = _ref.progress;

  var _useState = React.useState(0),
      progress = _useState[0],
      setProgress = _useState[1];

  var _useState2 = React.useState(1000),
      width = _useState2[0],
      setWidth = _useState2[1];

  var prevIsActive = usePrevious(isActive);
  var step = React.useRef(0.01);
  var currentProgress = React.useRef(0);
  var requestFrame = React.useRef(null);
  var isActiveRef = React.useRef(false);
  var ref = React.useRef(null);
  React.useEffect(function () {
    isActiveRef.current = isActive;

    if (isActive) {
      setProgress(0);
      step.current = 0.01;
      currentProgress.current = 0;
      startCalculateProgress();
    }

    if (prevIsActive === true && isActive === false) {
      setProgress(100);
      setTimeout(function () {
        return setProgress(0);
      }, 800);
    }

    if (isActive === null) {
      setProgress(0);
    }

    if (!isActive && requestFrame.current) {
      cancelAnimationFrame(requestFrame.current);
    }
  }, [isActive]);
  React.useEffect(function () {
    if (globalProgress !== null) setProgress(globalProgress);else {
      setProgress(0);
    }
  }, [globalProgress]);
  React.useEffect(function () {
    window.addEventListener('resize', onResize);
    if (ref.current) setWidth(ref.current.offsetWidth);
    return function () {
      return window.removeEventListener('resize', onResize);
    };
  }, []);

  var calculateProgress = function calculateProgress() {
    currentProgress.current += step.current;
    var progress = Math.round(Math.atan(currentProgress.current) / (Math.PI / 2) * 100 * 1000) / 1000;
    setProgress(progress);
    if (progress > 70) step.current = 0.005;
    if (progress >= 100 || !isActiveRef.current) cancelAnimationFrame(requestFrame.current);
    if (isActiveRef.current) requestFrame.current = requestAnimationFrame(calculateProgress);
  };

  var startCalculateProgress = function startCalculateProgress() {
    requestAnimationFrame(calculateProgress);
  };

  var onResize = function onResize() {
    if (ref.current) setWidth(ref.current.offsetWidth);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    ref: ref,
    className: cx(css$d.bar, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$d.progress,
    style: {
      width: progress + "%",
      backgroundSize: width + "px 5px"
    }
  }));
};

var css$e = {"field":"_3WCaE","input":"_9Tk5W","label":"_1mHtq","error":"_3jOrk"};

var validateValue = function validateValue(value) {
  if (typeof value === 'string' || value) return value;else return '';
};

var TextField = function TextField(_ref) {
  var label = _ref.label,
      className = _ref.className,
      _ref$size = _ref.size,
      size = _ref$size === void 0 ? 'normal' : _ref$size,
      _ref$errors = _ref.errors,
      errors = _ref$errors === void 0 ? [] : _ref$errors,
      restValue = _ref.value,
      restOnChange = _ref.onChange,
      props = _objectWithoutPropertiesLoose(_ref, ["label", "className", "size", "errors", "value", "onChange"]);

  var _useState = React.useState(function () {
    return validateValue(restValue);
  }),
      value = _useState[0],
      setValue = _useState[1];

  var hasErrors = Boolean(errors.length);
  React.useEffect(function () {
    if (restValue !== value) setValue(validateValue(restValue));
  }, [restValue]);

  var onChange = function onChange(e) {
    setValue(e.target.value);
    if (typeof restOnChange === 'function') restOnChange(e);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$e.field, className, size, {
      disabled: props.disabled
    })
  }, /*#__PURE__*/React__default.createElement("label", null, label && /*#__PURE__*/React__default.createElement("div", {
    className: css$e.label
  }, label), /*#__PURE__*/React__default.createElement("div", {
    className: css$e.input
  }, /*#__PURE__*/React__default.createElement("input", _extends({
    className: cx({
      error: hasErrors
    }),
    value: value,
    onChange: onChange
  }, props))), hasErrors && /*#__PURE__*/React__default.createElement("div", {
    className: css$e.error
  }, errors.join(', '))));
};

var css$f = {"search":"_3s1gr","field":"_17rsB","clear":"_3oKZ5","button":"_3BfRl"};

var SearchField = function SearchField(_ref) {
  var className = _ref.className,
      showEverything = _ref.showEverything,
      isDark = _ref.isDark,
      props = _objectWithoutPropertiesLoose(_ref, ["className", "showEverything", "isDark"]);

  var _useState = React.useState(showEverything || props.value && props.value.length),
      isShow = _useState[0],
      setIsShow = _useState[1];

  var clear = function clear() {
    if (props.onChange) props.onChange('');
    if (!showEverything) setIsShow(false);
  };

  var onChangeHandle = function onChangeHandle(event) {
    if (props.onChange) props.onChange(event.target.value);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$f.search, className, {
      'is-dark': isDark
    })
  }, isShow && /*#__PURE__*/React__default.createElement(TextField, _extends({}, props, {
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
    onClick: function onClick() {
      return setIsShow(true);
    }
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-magnify"
  })));
};

var css$g = {"field":"_2jF9E","label":"_iehEi","error":"_3bZhg","rcSelectLoadingIcon":"_VtsrG","rcSelectDropdownSlideUpIn":"_27wr-","rcSelectDropdownSlideUpOut":"_1QVN6","rcSelectDropdownSlideDownIn":"_1vYLX","rcSelectDropdownSlideDownOut":"_1-lNh","select-field":"_1mUh_","select-field-selector":"_V9Ufm","select-field-arrow":"_c4k8s","mdi":"_2hNDK","select-field-selection-placeholder":"_2Vdv0","select-field-selection-search":"_3GdNa","select-field-selection-search-input":"_3BOaB","select-field-selection-item":"_2uDu7","select-field-item-option-checkbox":"_2K_G1","select-field-selection-item-remove":"_1k1IW","select-field-show-search":"_3EVnU","select-field-show-arrow":"_1xlmm","select-field-open":"__jEZ1","select-field-multiple":"_2YFSs","select-field-single":"_1n3qF","select-field-clear":"_Mg5xq","select-field-item-option-state":"_2yGkG","select-field-selection__choice-zoom":"_3NUb5","select-field-selection__choice-zoom-appear":"_ZO73y","select-field-selection__choice-zoom-leave":"_2i54q","select-field-dropdown":"_14ngc"};

var allValue = 'all';

var SelectField = function SelectField(_ref) {
  var _ref$align = _ref.align,
      align = _ref$align === void 0 ? 'left' : _ref$align,
      _ref$size = _ref.size,
      size = _ref$size === void 0 ? 'normal' : _ref$size,
      label = _ref.label,
      disabled = _ref.disabled,
      placeholder = _ref.placeholder,
      _ref$value = _ref.value,
      propValue = _ref$value === void 0 ? [] : _ref$value,
      className = _ref.className,
      mode = _ref.mode,
      onChange = _ref.onChange,
      _ref$options = _ref.options,
      options = _ref$options === void 0 ? [] : _ref$options,
      _ref$errors = _ref.errors,
      errors = _ref$errors === void 0 ? [] : _ref$errors,
      _ref$showSearch = _ref.showSearch,
      showSearch = _ref$showSearch === void 0 ? true : _ref$showSearch,
      props = _objectWithoutPropertiesLoose(_ref, ["align", "size", "label", "disabled", "placeholder", "value", "className", "mode", "onChange", "options", "errors", "showSearch"]);

  var hasErrors = Boolean(errors.length);

  var onChangeHandle = function onChangeHandle(value) {
    if (Array.isArray(value) && value.indexOf(allValue) >= 0) if (value.length > options.length) value = [];else value = options.map(function (o) {
      return o.value;
    });
    if (onChange) onChange(value);
  };

  var onSelect = function onSelect() {};

  var onDeselect = function onDeselect() {};

  var renderOptions = function renderOptions() {
    return options.map(function (_ref2) {
      var value = _ref2.value,
          label = _ref2.label;
      return /*#__PURE__*/React__default.createElement(Select.Option, {
        key: value,
        value: value
      }, mode === 'multiple' && /*#__PURE__*/React__default.createElement(CheckboxField, {
        readOnly: true,
        className: "select-field-item-option-checkbox",
        value: propValue.indexOf(value) >= 0
      }), /*#__PURE__*/React__default.createElement("span", {
        className: "select-field-item-option-label"
      }, label));
    });
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$g.field, className, size, align, {
      disabled: disabled
    })
  }, /*#__PURE__*/React__default.createElement(Select__default, _extends({
    value: propValue,
    prefixCls: "select-field",
    mode: mode,
    showArrow: true,
    showSearch: showSearch,
    onSelect: onSelect,
    onDeselect: onDeselect,
    placeholder: placeholder,
    onChange: onChangeHandle,
    inputIcon: /*#__PURE__*/React__default.createElement("span", {
      className: "mdi mdi-chevron-down"
    })
  }, props), options.length && mode === 'multiple' && /*#__PURE__*/React__default.createElement(Select.Option, {
    key: allValue,
    value: allValue
  }, /*#__PURE__*/React__default.createElement(CheckboxField, {
    readOnly: true,
    className: "select-field-item-option-checkbox",
    value: propValue.length === options.length
  }), /*#__PURE__*/React__default.createElement("span", {
    className: "select-field-item-option-label"
  }, "Select all")), mode === 'multiple' ? /*#__PURE__*/React__default.createElement(Select.OptGroup, null, renderOptions()) : renderOptions()), label && /*#__PURE__*/React__default.createElement("label", {
    className: css$g.label
  }, label), hasErrors && /*#__PURE__*/React__default.createElement("div", {
    className: css$g.error
  }, errors.join(', ')));
};

var css$h = {"field":"_2_NXc","rcSliderTooltipZoomDownIn":"_2jvao","rcSliderTooltipZoomDownOut":"_2HgMB","slider":"_31Ylv","label":"_Zo_r8","rc-slider":"_1hLjI","rc-slider-rail":"_v9bxI","rc-slider-track":"__3emJ","rc-slider-handle":"_12sQ3","rc-slider-handle-dragging":"_2u63-","rc-slider-handle-click-focused":"_7xSSR","rc-slider-mark":"_1l2Qm","rc-slider-mark-text":"_2zf2c","rc-slider-mark-text-active":"_25tuh","rc-slider-step":"_3wC_L","rc-slider-dot":"_17-SM","rc-slider-dot-active":"_1eLwY","rc-slider-dot-reverse":"_Ewb1d","rc-slider-disabled":"_1YO43","rc-slider-vertical":"_12Juq","rc-slider-tooltip-zoom-down-enter":"_2a95b","rc-slider-tooltip-zoom-down-appear":"_2wvsD","rc-slider-tooltip-zoom-down-leave":"_3jMC3","rc-slider-tooltip-zoom-down-enter-active":"_1M8Be","rc-slider-tooltip-zoom-down-appear-active":"_3tu2z","rc-slider-tooltip-zoom-down-leave-active":"_P9_lk","rc-slider-tooltip":"_1PZK2","rc-slider-tooltip-hidden":"_2CvyB","rc-slider-tooltip-placement-top":"_qzmlA","rc-slider-tooltip-inner":"_27Bp4","rc-slider-tooltip-arrow":"_35-HY"};

var CustomHandle = function CustomHandle(props) {
  var style = {
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

var SliderField = function SliderField(_ref) {
  var className = _ref.className,
      disabled = _ref.disabled,
      label = _ref.label,
      onChange = _ref.onChange,
      name = _ref.name,
      _ref$align = _ref.align,
      align = _ref$align === void 0 ? 'left' : _ref$align,
      props = _objectWithoutPropertiesLoose(_ref, ["className", "disabled", "label", "onChange", "name", "align"]);

  var onChangeHandle = function onChangeHandle(value) {
    if (onChange) onChange({
      target: {
        value: value,
        name: name
      }
    });
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$h.field, className, align, {
      disabled: disabled
    })
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$h.slider
  }, /*#__PURE__*/React__default.createElement(Slider, _extends({
    onChange: onChangeHandle,
    tipFormatter: function tipFormatter(value) {
      return "$" + value;
    },
    handle: CustomHandle
  }, props))), label && /*#__PURE__*/React__default.createElement("span", {
    className: css$h.label
  }, label));
};

var css$i = {"field":"_3PgPN","textarea":"_2Ok_K","label":"_1qnsP","error":"_1C6bH"};

var TextAreaField = React.forwardRef(function (_ref, ref) {
  var label = _ref.label,
      className = _ref.className,
      _ref$size = _ref.size,
      size = _ref$size === void 0 ? 'normal' : _ref$size,
      _ref$errors = _ref.errors,
      errors = _ref$errors === void 0 ? [] : _ref$errors,
      value = _ref.value,
      props = _objectWithoutPropertiesLoose(_ref, ["label", "className", "size", "errors", "value"]);

  var hasErrors = Boolean(errors.length);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$i.field, className, size, {
      disabled: props.disabled
    })
  }, /*#__PURE__*/React__default.createElement("label", null, label && /*#__PURE__*/React__default.createElement("div", {
    className: css$i.label
  }, label), /*#__PURE__*/React__default.createElement("div", {
    className: css$i.textarea
  }, /*#__PURE__*/React__default.createElement("textarea", _extends({
    className: cx({
      error: hasErrors
    }),
    value: value,
    ref: ref
  }, props))), hasErrors && /*#__PURE__*/React__default.createElement("div", {
    className: css$i.error
  }, errors.join(', '))));
});

var css$j = {"filters":"_kiZkv","sidebar":"_2hZRZ","field":"_3_9Ku","slider":"_3xe_A","switcher":"_8cgpK","buttons":"_1fRrD"};

var StackFilters = function StackFilters(_ref) {
  var _cx;

  var className = _ref.className,
      fields = _ref.fields,
      form = _ref.form,
      _onChange = _ref.onChange,
      onApply = _ref.onApply,
      isSidebar = _ref.isSidebar,
      disabled = _ref.disabled;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  if (!Object.keys(fields).length) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$j.filters, (_cx = {}, _cx[css$j.sidebar] = isSidebar, _cx), className)
  }, Object.keys(fields).map(function (key) {
    switch (fields[key].type) {
      case 'text':
        return /*#__PURE__*/React__default.createElement(TextField, {
          size: "small",
          key: "text-" + key,
          className: cx(css$j.field, css$j.text),
          onChange: function onChange(event) {
            return _onChange(key, event.target.value);
          },
          label: fields[key].label,
          name: key,
          value: form[key],
          disabled: disabled || fields[key].disabled
        });

      case 'textarea':
        return /*#__PURE__*/React__default.createElement(TextAreaField, {
          size: "small",
          key: "text-" + key,
          className: cx(css$j.field, css$j.text),
          onChange: function onChange(event) {
            return _onChange(key, event.target.value);
          },
          label: fields[key].label,
          name: key,
          value: form[key],
          disabled: disabled || fields[key].disabled
        });

      case 'select':
        return /*#__PURE__*/React__default.createElement(SelectField, {
          size: "small",
          key: "select-" + key,
          align: "bottom",
          className: cx(css$j.field, css$j.select),
          onChange: function onChange(value) {
            return _onChange(key, value);
          },
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
          key: "checkbox-" + key,
          className: cx(css$j.field, css$j.switcher),
          onChange: _onChange,
          label: fields[key].label,
          name: key,
          value: form[key],
          disabled: disabled || fields[key].disabled
        });

      case 'slider':
        return /*#__PURE__*/React__default.createElement(SliderField, {
          key: "slider-" + key,
          className: cx(css$j.field, css$j.slider),
          onChange: _onChange,
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
          key: "apply-" + key,
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

var css$k = {"field":"_2DYF1","hidden":"_3z5o2"};

var StretchTitleField = function StretchTitleField(_ref) {
  var propValue = _ref.value,
      _ref$placeholder = _ref.placeholder,
      placeholder = _ref$placeholder === void 0 ? '' : _ref$placeholder,
      className = _ref.className,
      onChangeProp = _ref.onChange,
      props = _objectWithoutPropertiesLoose(_ref, ["value", "placeholder", "className", "onChange"]);

  var _useState = React.useState(propValue),
      value = _useState[0],
      set = _useState[1];

  var onChange = function onChange(event) {
    if (onChangeProp) onChangeProp(event.target.value);
    set(event.target.value);
  };

  React.useEffect(function () {
    set(propValue);
  }, [propValue]);
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$k.field, className)
  }, /*#__PURE__*/React__default.createElement("input", _extends({
    type: "text",
    placeholder: placeholder,
    value: value,
    onChange: onChange
  }, props)), /*#__PURE__*/React__default.createElement("div", {
    className: css$k.hidden
  }, value && value.length ? value : placeholder));
};

var css$l = {"fieldWrap":"_vED3t","field":"_1XqN9","hidden":"_38Nis"};

var StretchTextAreaField = React.forwardRef(function (_ref, ref) {
  var propValue = _ref.value,
      _ref$placeholder = _ref.placeholder,
      placeholder = _ref$placeholder === void 0 ? '' : _ref$placeholder,
      className = _ref.className,
      onChangeProp = _ref.onChange,
      props = _objectWithoutPropertiesLoose(_ref, ["value", "placeholder", "className", "onChange"]);

  var _useState = React.useState(propValue),
      value = _useState[0],
      set = _useState[1];

  var onChange = function onChange(event) {
    if (onChangeProp) onChangeProp(event.target.value);
    set(event.target.value);
  };

  React.useEffect(function () {
    set(propValue);
  }, [propValue]);
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$l.fieldWrap
  }, /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$l.field, className)
  }, /*#__PURE__*/React__default.createElement("textarea", _extends({
    rows: 1,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    ref: ref
  }, props)), /*#__PURE__*/React__default.createElement("div", {
    className: css$l.hidden
  }, value && value.length ? value : placeholder, '\n')));
});

var css$m = {"tabs":"_-hQvT","tab":"_2dsXN","soon":"_2_DJa"};

var Tabs = function Tabs(_ref) {
  var className = _ref.className,
      currentTabValue = _ref.value,
      tabs = _ref.tabs,
      _ref$appearance = _ref.appearance,
      appearance = _ref$appearance === void 0 ? 'transparent' : _ref$appearance,
      onChange = _ref.onChange,
      tabComponent = _ref.tabComponent;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var getOnClickTab = function getOnClickTab(value) {
    return function () {
      if (typeof onChange === 'function') onChange(value);
    };
  };

  var Component = tabComponent ? tabComponent : 'div';
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$m.tabs, appearance, className)
  }, tabs.map(function (_ref2, index) {
    var value = _ref2.value,
        label = _ref2.label,
        soon = _ref2.soon,
        rest = _objectWithoutPropertiesLoose(_ref2, ["value", "label", "soon"]);

    return /*#__PURE__*/React__default.createElement(Component, _extends({}, rest, {
      key: index,
      className: cx(css$m.tab, {
        active: value && value === currentTabValue
      }),
      onClick: getOnClickTab(value)
    }), label, soon && /*#__PURE__*/React__default.createElement("span", {
      className: css$m.soon
    }, t('soon')));
  }));
};

var css$n = {"tooltip":"_rE8Jn"};

var Tooltip = function Tooltip(_ref) {
  var children = _ref.children,
      overlayContent = _ref.overlayContent,
      _ref$arrowContent = _ref.arrowContent,
      arrowContent = _ref$arrowContent === void 0 ? null : _ref$arrowContent,
      _ref$placement = _ref.placement,
      placement = _ref$placement === void 0 ? 'bottomLeft' : _ref$placement,
      _ref$trigger = _ref.trigger,
      trigger = _ref$trigger === void 0 ? ['hover'] : _ref$trigger,
      _ref$overlayStyle = _ref.overlayStyle,
      overlayStyle = _ref$overlayStyle === void 0 ? {
    pointerEvents: 'none'
  } : _ref$overlayStyle,
      props = _objectWithoutPropertiesLoose(_ref, ["children", "overlayContent", "arrowContent", "placement", "trigger", "overlayStyle"]);

  return /*#__PURE__*/React__default.createElement(RcTooltip, _extends({
    overlayStyle: overlayStyle,
    arrowContent: arrowContent,
    placement: placement,
    trigger: trigger,
    overlay: /*#__PURE__*/React__default.createElement("div", {
      className: css$n.tooltip
    }, overlayContent)
  }, props), children);
};

var css$o = {"switcher":"_3NMzC"};

var ViewSwitcher = function ViewSwitcher(_ref) {
  var _ref$value = _ref.value,
      value = _ref$value === void 0 ? 'grid' : _ref$value,
      onChange = _ref.onChange,
      className = _ref.className;

  var _useState = React.useState(value),
      stateValue = _useState[0],
      setStateValue = _useState[1];

  React.useEffect(function () {
    if (value !== stateValue) setStateValue(value);
  }, [value]);

  var toggleValue = function toggleValue() {
    var newValue = stateValue === 'grid' ? 'list' : 'grid';
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

var Yield = function Yield(_ref) {
  var name = _ref.name,
      className = _ref.className,
      children = _ref.children;
  if (!name) return null;

  if (children) {
    var node = document && document.getElementById(name);
    if (!node) return null;
    return /*#__PURE__*/React__default.createElement(reactPortal.Portal, {
      node: node
    }, children);
  }

  return /*#__PURE__*/React__default.createElement("div", {
    className: className,
    id: name
  });
};

var css$p = {"table":"_2TzH3"};

var Table = function Table(_ref) {
  var data = _ref.data;
  var captions = data[0],
      rows = data.slice(1);
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$p.table
  }, /*#__PURE__*/React__default.createElement("table", null, /*#__PURE__*/React__default.createElement("thead", null, /*#__PURE__*/React__default.createElement("tr", null, captions.map(function (caption) {
    return /*#__PURE__*/React__default.createElement("th", {
      key: caption
    }, caption);
  }))), /*#__PURE__*/React__default.createElement("tbody", null, rows.map(function (row, index) {
    return /*#__PURE__*/React__default.createElement("tr", {
      key: index
    }, row.map(function (cell, i) {
      return /*#__PURE__*/React__default.createElement("td", {
        key: i
      }, cell);
    }));
  }))));
};

var isImageType = function isImageType(type) {
  return /^image/.test(type);
};
var base64ToJSON = function base64ToJSON(base64) {
  var parsedJSON;

  try {
    parsedJSON = JSON.parse(atob(base64));
  } catch (e) {
    console.log(e);
  }

  return parsedJSON;
};

var css$q = {"view":"_1T-AH","text":"_6S5f-","message":"_1p-0w","description":"_VNtCL","code":"_26Ytj","footer":"_O3Gct"};

var base64ImagePrefixes = {
  'image/svg+xml': 'data:image/svg+xml;charset=utf-8;',
  'image/png': 'data:image/png;charset=utf-8;',
  'image/jpeg': 'data:image/jpeg;charset=utf-8;'
};

var View = function View(_ref) {
  var frameId = _ref.frameId,
      attachment = _ref.attachment,
      fullAttachment = _ref.fullAttachment,
      isList = _ref.isList,
      className = _ref.className,
      requestStatus = _ref.requestStatus,
      stack = _ref.stack;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var viewRef = React.useRef();

  var _useState = React.useState(1),
      tableScale = _useState[0],
      setTableScale = _useState[1];

  var _useState2 = React.useState(0),
      viewWidth = _useState2[0],
      setVieWidth = _useState2[1];

  var _useState3 = React.useState(false),
      noRender = _useState3[0],
      setNoRender = _useState3[1];

  var onResizeCard = function onResizeCard() {
    if (viewRef.current) {
      var containerWidth = viewRef.current.parentElement.offsetWidth;

      var _viewWidth = viewRef.current.offsetWidth / tableScale;

      var newScale = containerWidth / _viewWidth;
      if (newScale > 1) newScale = 1;
      setTableScale(newScale);
      setVieWidth(containerWidth);
    }
  };

  React.useEffect(function () {
    if (window && isList) window.addEventListener('resize', onResizeCard);
    return function () {
      if (window && isList) window.removeEventListener('resize', onResizeCard);
    };
  }, []);
  React.useEffect(function () {
    if (noRender) {
      setNoRender(false);
    }
  }, [noRender]);
  React.useEffect(function () {
    if (attachment && attachment['application'] === 'plotly' && !noRender) {
      setNoRender(true);
    }

    if (attachment && attachment['application'] === 'bokeh') {
      var Bokeh;
      var json = base64ToJSON(attachment.data);
      var version = lodashEs.get(attachment, 'settings.bokeh_version');

      if (version && parseInt(version.split('.')[0], 10) === 2) {
        Bokeh = window.Bokeh['2.2.1'];
      } else {
        Bokeh = window.Bokeh;
      }

      if (json && document.querySelector("#bokeh-" + frameId)) Bokeh.embed.embed_item(json, "bokeh-" + frameId);
    }

    if (isList) setTimeout(function () {
      return onResizeCard();
    }, 10);
  }, [attachment]);

  var renderImage = function renderImage() {
    if (!attachment.preview) return /*#__PURE__*/React__default.createElement("img", {
      src: base64ImagePrefixes[attachment['content_type']] + "base64," + attachment.data,
      alt: ""
    });else if (fullAttachment) {
      if (fullAttachment['download_url']) {
        return /*#__PURE__*/React__default.createElement("img", {
          src: fullAttachment['download_url'],
          alt: ""
        });
      } else return /*#__PURE__*/React__default.createElement("img", {
        src: base64ImagePrefixes[attachment['content_type']] + "base64," + attachment.data,
        alt: ""
      });
    }
    return null;
  };

  var renderCSV = function renderCSV() {
    var decodeCSV = unicodeBase64Decode(attachment.data);

    if (decodeCSV) {
      var data = CSV.parse(decodeCSV);
      if (Array.isArray(data) && data.length) return /*#__PURE__*/React__default.createElement(Table, {
        data: data
      });
    }

    return /*#__PURE__*/React__default.createElement("div", {
      className: css$q.text
    }, t('notSupportedAttachment'));
  };

  var renderPlotly = function renderPlotly() {
    var json = base64ToJSON(attachment.data);
    if (!json) return null;
    json.layout.width = viewWidth;
    json.layout.margin = 0;
    json.layout.autosize = true;
    if (json.config) json.config.responsive = true;else json.config = {
      responsive: true
    };
    return /*#__PURE__*/React__default.createElement(Plot, _extends({}, json, {
      style: {
        width: '100%',
        height: '100%'
      },
      useResizeHandler: true
    }));
  };

  var renderMl = function renderMl() {
    var pullPythonCode = function pullPythonCode(data) {
      var a = ["'/" + stack + "'"];
      var params = Object.keys(data.params);

      if (params.length > 0) {
        var p = [];
        params.forEach(function (key) {
          if (lodashEs.isString(data.params[key])) p.push("'" + key + "': '" + data.params[key] + "'");else p.push("'" + key + "': " + data.params[key]);
        });
        a.push('params={' + p.join(', ') + '}');
      }

      return "import dstack as ds\n\nmodel = ds.pull(" + a.join(', ') + ")";
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

  var renderBokeh = function renderBokeh() {
    return /*#__PURE__*/React__default.createElement("div", {
      id: "bokeh-" + frameId
    });
  };

  var renderAttachment = function renderAttachment() {
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
      case lodashEs.isEqual(attachment, {}):
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
      transform: "scale(" + tableScale + ")"
    } : {}
  }, renderAttachment());
};

var areEqual = function areEqual(prevProps, nextProps) {
  return lodashEs.isEqual(prevProps.attachment, nextProps.attachment);
};

var View$1 = React.memo(View, areEqual);

var useIntersectionObserver = (function (callBack, _ref, deps) {
  var _ref$rootMargin = _ref.rootMargin,
      rootMargin = _ref$rootMargin === void 0 ? '0px' : _ref$rootMargin,
      _ref$threshold = _ref.threshold,
      threshold = _ref$threshold === void 0 ? 0.01 : _ref$threshold,
      _ref$root = _ref.root,
      root = _ref$root === void 0 ? null : _ref$root;
  var ref = React.useRef(null);
  var intersectionCallback = React.useCallback(function (_ref2) {
    var target = _ref2[0];

    if (target.isIntersecting) {
      callBack();
    }
  }, deps);
  React.useEffect(function () {
    var options = {
      root: root,
      rootMargin: rootMargin,
      threshold: threshold
    };
    var observer = new IntersectionObserver(intersectionCallback, options);
    if (ref && ref.current) observer.observe(ref.current);
    return function () {
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

var initialState$1 = {
  data: {},
  errors: {},
  requestStatus: null
};
var reducer$1 = function reducer(state, action) {
  var _extends2, _extends3, _extends4, _extends5, _extends6, _extends7;

  if (state === void 0) {
    state = initialState$1;
  }

  switch (action.type) {
    case actionsTypes$1.FETCH:
      return _extends({}, state, {
        data: _extends({}, state.data, (_extends3 = {}, _extends3[action.meta.frameId] = _extends({}, state.data[action.meta.frameId], (_extends2 = {}, _extends2[action.meta.id] = _extends({}, state.data[action.meta.frameId] ? state.data[action.meta.frameId][action.meta.id] : {}, {
          loading: true,
          requestStatus: null,
          error: null
        }), _extends2)), _extends3))
      });

    case actionsTypes$1.FETCH_SUCCESS:
      return _extends({}, state, {
        data: _extends({}, state.data, (_extends5 = {}, _extends5[action.meta.frameId] = _extends({}, state.data[action.meta.frameId], (_extends4 = {}, _extends4[action.meta.id] = _extends({}, action.payload, {
          loading: false
        }), _extends4)), _extends5))
      });

    case actionsTypes$1.FETCH_FAIL:
      return _extends({}, state, {
        data: _extends({}, state.data, (_extends7 = {}, _extends7[action.meta.frameId] = _extends({}, state.data[action.meta.frameId], (_extends6 = {}, _extends6[action.meta.id] = {
          error: action.payload.error,
          requestStatus: action.payload.requestStatus,
          loading: false
        }, _extends6)), _extends7))
      });

    default:
      return state;
  }
};
var StateContext$1 = React.createContext();
var StateProvider = function StateProvider(_ref) {
  var children = _ref.children,
      apiUrl = _ref.apiUrl;
  return /*#__PURE__*/React__default.createElement(StateContext$1.Provider, {
    value: React.useReducer(reducer$1, _extends({}, initialState$1, {
      apiUrl: apiUrl
    }))
  }, children);
};
var useStateValue = function useStateValue() {
  return React.useContext(StateContext$1);
};

var actions = (function () {
  var _useStateValue = useStateValue(),
      apiUrl = _useStateValue[0].apiUrl,
      dispatch = _useStateValue[1];

  var fetchAttachment = function fetchAttachment(stack, frameId, id, onSuccess) {
    try {
      var token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
      dispatch({
        type: actionsTypes$1.FETCH,
        meta: {
          frameId: frameId,
          id: id
        }
      });

      var _temp2 = _catch(function () {
        return Promise.resolve(axios({
          baseURL: apiUrl,
          url: config.STACK_ATTACHMENT(stack, frameId, id),
          headers: {
            Authorization: token ? "Bearer " + token : ''
          }
        })).then(function (request) {
          dispatch({
            type: actionsTypes$1.FETCH_SUCCESS,
            meta: {
              frameId: frameId,
              id: id
            },
            payload: request.data.attachment
          });
          if (onSuccess) onSuccess();
        });
      }, function (e) {
        var error = 'Unknown error';

        try {
          error = JSON.parse(lodashEs.get(e, 'request.response')).message;
        } catch (e) {
          console.log(error);
        }

        dispatch({
          type: actionsTypes$1.FETCH_FAIL,
          meta: {
            frameId: frameId,
            id: id
          },
          payload: {
            error: error
          }
        });
      });

      return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return {
    fetchAttachment: fetchAttachment
  };
});

var css$r = {"attachment":"_3NILI","loading-pulse":"_IhCO3","view":"_3UWqG","text":"_MOcaD"};

var Attachment = function Attachment(_ref) {
  var id = _ref.id,
      className = _ref.className,
      frameId = _ref.frameId,
      isList = _ref.isList,
      withLoader = _ref.withLoader,
      stack = _ref.stack,
      customData = _ref.customData;

  var _actions = actions(),
      fetchAttachment = _actions.fetchAttachment;

  var _useStateValue = useStateValue(),
      _useStateValue$ = _useStateValue[0],
      data = _useStateValue$.data,
      apiUrl = _useStateValue$.apiUrl;

  var attachment = lodashEs.get(data, frameId + "." + id, {});
  var loading = attachment.loading,
      error = attachment.error,
      requestStatus = attachment.requestStatus;

  var _useState = React.useState(false),
      loadingFullAttachment = _useState[0],
      setLoadingFullAttachment = _useState[1];

  var _useState2 = React.useState(null),
      fullAttachment = _useState2[0],
      setFullAttachment = _useState2[1];

  var prevAttachment = usePrevious(attachment);

  var fetchFullAttachment = function fetchFullAttachment() {
    try {
      var _temp3 = function _temp3() {
        setLoadingFullAttachment(false);
      };

      setLoadingFullAttachment(true);

      var _temp4 = _catch(function () {
        var url = config.STACK_ATTACHMENT(stack, frameId, id) + '?download=true';
        return Promise.resolve(axios({
          baseUrl: apiUrl,
          url: url
        })).then(function (_ref2) {
          var data = _ref2.data;
          setFullAttachment(data.attachment);
        });
      }, function (e) {
        console.log(e);
      });

      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  React.useEffect(function () {
    if (!customData && !isList && attachment && !lodashEs.isEqual(prevAttachment, attachment) && attachment.preview && isImageType(attachment['content_type'])) {
      fetchFullAttachment();
    }
  }, [data]);
  React.useEffect(function () {
    if (!customData && !isList && typeof id === 'number' && frameId && (!attachment.data && !error || (attachment === null || attachment === void 0 ? void 0 : attachment.index) !== id)) {
      fetchAttachment(stack, frameId, id);
    }
  }, [id, frameId]);

  var _useIntersectionObser = useIntersectionObserver(function () {
    if (!customData && isList && !loading && (!attachment.data && !error || attachment.data && attachment.index !== id)) fetchAttachment(stack, frameId, id);
  }, {}, [id, frameId, data]),
      ref = _useIntersectionObser[0];

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

var css$s = {"list":"_FL7ja","avatar":"_37Kcf","count":"_11i1Z"};

var PermissionUsers = function PermissionUsers(_ref) {
  var permissions = _ref.permissions,
      className = _ref.className,
      _ref$variant = _ref.variant,
      variant = _ref$variant === void 0 ? 'details' : _ref$variant,
      maxLength = _ref.maxLength,
      owner = _ref.owner;
  if (!permissions || !permissions.length) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$s.list, className, variant)
  }, permissions.slice(0, maxLength).map(function (i, index) {
    return /*#__PURE__*/React__default.createElement(Avatar, {
      withBorder: true,
      size: variant === 'list' ? 'list' : 'small',
      key: index,
      className: cx(css$s.avatar, {
        owner: owner === i.user
      }),
      name: i.user || i.email
    });
  }), maxLength && maxLength < permissions.length && /*#__PURE__*/React__default.createElement("span", {
    className: css$s.count
  }, "+", permissions.length - maxLength));
};

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

var _ref$2 = /*#__PURE__*/React.createElement("g", {
  fill: "#86A6DD"
}, /*#__PURE__*/React.createElement("rect", {
  width: 2,
  height: 19,
  rx: 1
}), /*#__PURE__*/React.createElement("rect", {
  x: 4,
  y: 5.846,
  width: 2,
  height: 13.154,
  rx: 1
}), /*#__PURE__*/React.createElement("rect", {
  x: 8,
  y: 9.5,
  width: 2,
  height: 9.5,
  rx: 1
}), /*#__PURE__*/React.createElement("rect", {
  x: 12,
  y: 7.308,
  width: 2,
  height: 11.692,
  rx: 1
}), /*#__PURE__*/React.createElement("rect", {
  x: 16,
  y: 12.971,
  width: 2,
  height: 6.029,
  rx: 1
}), /*#__PURE__*/React.createElement("rect", {
  x: 20,
  y: 9.5,
  width: 2,
  height: 9.5,
  rx: 1
}));

function SvgChart(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$3({
    width: 22,
    height: 19,
    viewBox: "0 0 22 19",
    fill: "none"
  }, props), _ref$2);
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

var _ref$3 = /*#__PURE__*/React.createElement("path", {
  fill: "#86A6DD",
  d: "M18.797 6.34a3.38 3.38 0 00-2.944-4.026C14.835-.088 11.55-.492 10 1.671 8.45-.49 5.167-.089 4.149 2.314A3.38 3.38 0 001.204 6.34a3.375 3.375 0 00-.381 4.79c-2.022 2.721-.1 6.69 3.387 6.69 1.114 2.322 4.293 2.598 5.79.508 1.5 2.092 4.678 1.812 5.791-.509 3.479.008 5.41-3.967 3.387-6.69a3.375 3.375 0 00-.38-4.789zM7.177 18.461c-1.763 0-2.78-2.07-1.631-3.46a.63.63 0 10-.972-.802 3.378 3.378 0 00-.768 2.323c-2.39-.255-3.455-3.113-1.875-4.875.017.02.61-.828 1.875-.963-.021.409.032.822.163 1.222a.63.63 0 001.199-.392A2.116 2.116 0 016.52 8.848a.63.63 0 10-.392-1.198 3.42 3.42 0 00-.418.168 1.649 1.649 0 01.482-1.867.63.63 0 00-.804-.97 2.907 2.907 0 00-.71 3.608c-.425.47-.524.818-.56.818-.925 0-1.781.301-2.476.81a2.113 2.113 0 01.539-3.11.63.63 0 00.26-.746c-.463-1.297.41-2.823 2.083-2.823a.63.63 0 00.609-.47 2.115 2.115 0 014.157.544v12.735a2.116 2.116 0 01-2.114 2.114zm11.022-8.244a4.168 4.168 0 00-2.489-.81c-.142-.3-.319-.566-.547-.818a2.906 2.906 0 00-.71-3.609.63.63 0 10-.804.971c.56.464.733 1.224.482 1.867a3.423 3.423 0 00-.418-.168.63.63 0 10-.392 1.198 2.116 2.116 0 011.352 2.666.63.63 0 101.199.392c.13-.4.184-.813.163-1.222a2.941 2.941 0 012.623 2.919 2.94 2.94 0 01-2.623 2.918 3.377 3.377 0 00-.768-2.323.63.63 0 00-.972.804c1.146 1.386.133 3.46-1.63 3.46a2.116 2.116 0 01-2.114-2.115V3.612a2.115 2.115 0 014.157-.543.63.63 0 00.63.469c1.477-.055 2.566 1.413 2.062 2.823-.1.279.009.59.26.747a2.113 2.113 0 01.539 3.11z"
});

function SvgMl(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$4({
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none"
  }, props), _ref$3);
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

var _ref$4 = /*#__PURE__*/React.createElement("g", {
  fill: "#86A6DD"
}, /*#__PURE__*/React.createElement("rect", {
  y: 1,
  width: 1.5,
  height: 20,
  rx: 0.75
}), /*#__PURE__*/React.createElement("rect", {
  x: 6,
  y: 1,
  width: 1.5,
  height: 20,
  rx: 0.75
}), /*#__PURE__*/React.createElement("rect", {
  y: 21,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 21)"
}), /*#__PURE__*/React.createElement("rect", {
  y: 15,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 15)"
}), /*#__PURE__*/React.createElement("rect", {
  y: 9,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 9)"
}), /*#__PURE__*/React.createElement("rect", {
  y: 2.4,
  width: 1.5,
  height: 20,
  rx: 0.75,
  transform: "rotate(-90 0 2.4)"
}), /*#__PURE__*/React.createElement("rect", {
  x: 18.5,
  y: 1,
  width: 1.5,
  height: 20,
  rx: 0.75
}));

function SvgTable(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$5({
    width: 20,
    height: 21,
    viewBox: "0 0 20 21",
    fill: "none"
  }, props), _ref$4);
}

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

var _ref$5 = /*#__PURE__*/React.createElement("g", {
  clipPath: "url(#app_svg__clip0)",
  fill: "#86A6DD"
}, /*#__PURE__*/React.createElement("path", {
  d: "M7.857 0H.714A.714.714 0 000 .714v7.143c0 .395.32.714.714.714h7.143c.395 0 .714-.319.714-.714V.714A.714.714 0 007.857 0zm-.714 7.143H1.429V1.429h5.714v5.714zM7.857 11.429H.714a.714.714 0 00-.714.714v7.143c0 .394.32.714.714.714h7.143c.395 0 .714-.32.714-.714v-7.143a.714.714 0 00-.714-.714zm-.714 7.142H1.429v-5.714h5.714v5.714zM19.286 11.429h-7.143a.714.714 0 00-.714.714v7.143c0 .394.32.714.714.714h7.143c.395 0 .714-.32.714-.714v-7.143a.714.714 0 00-.714-.714zm-.714 7.142h-5.715v-5.714h5.715v5.714z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.79 6.22a.714.714 0 000-1.01l-5-5a.714.714 0 00-1.01 0l-5 5a.712.712 0 000 1.01l5 5a.712.712 0 001.01 0l5-5zm-9.494-.506l3.99-3.99 3.99 3.99-3.99 3.99-3.99-3.99z"
}));

var _ref2$2 = /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
  id: "app_svg__clip0"
}, /*#__PURE__*/React.createElement("path", {
  d: "M0 0h20v20H0z"
})));

function SvgApp(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$6({
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none"
  }, props), _ref$5, _ref2$2);
}

var css$t = {"item":"_fLtf5","name":"_147V3","delete":"_2PoaL","icon":"_3yxhI","top":"_3aJqR","permissions":"_2SUP0","date":"_2c9og"};

var Item = function Item(_ref) {
  var className = _ref.className,
      _ref$Component = _ref.Component,
      Component = _ref$Component === void 0 ? 'div' : _ref$Component,
      data = _ref.data,
      deleteAction = _ref.deleteAction,
      rest = _objectWithoutPropertiesLoose(_ref, ["className", "Component", "data", "deleteAction"]);

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var ref = React.useRef(null);

  var onClickDelete = function onClickDelete(event) {
    event.stopPropagation();
    event.preventDefault();
    deleteAction(data.name);
  };

  var renderIcon = function renderIcon() {
    var _data$head, _data$head$preview, _data$head2, _data$head2$preview;

    var contentType = (_data$head = data.head) === null || _data$head === void 0 ? void 0 : (_data$head$preview = _data$head.preview) === null || _data$head$preview === void 0 ? void 0 : _data$head$preview.content_type;
    var application = (_data$head2 = data.head) === null || _data$head2 === void 0 ? void 0 : (_data$head2$preview = _data$head2.preview) === null || _data$head2$preview === void 0 ? void 0 : _data$head2$preview.application;
    var category = getStackCategory({
      application: application,
      contentType: contentType
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

  return /*#__PURE__*/React__default.createElement(Component, _extends({
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
    className: "mdi mdi-lock" + (data["private"] ? '' : '-open')
  }), data["private"] && /*#__PURE__*/React__default.createElement(PermissionUsers, {
    variant: "list",
    owner: data.user,
    className: css$t.permissions,
    permissions: data.permissions,
    maxLength: 3
  })), data.head && /*#__PURE__*/React__default.createElement("div", {
    className: css$t.date
  }, t('updated'), " ", moment(data.head.timestamp).format('L')), deleteAction && /*#__PURE__*/React__default.createElement("span", {
    className: css$t["delete"],
    onClick: onClickDelete
  }, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-close"
  })));
};

var routes = {
  notFound: function notFound() {
    return '/404';
  },
  auth: function auth() {
    return '/auth';
  },
  authLogin: function authLogin() {
    return '/auth/login';
  },
  verifyUser: function verifyUser() {
    return '/auth/verify';
  },
  authSignUp: function authSignUp() {
    return '/auth/signup';
  },
  authForgetPassword: function authForgetPassword() {
    return '/auth/forget-password';
  },
  authResetPassword: function authResetPassword() {
    return '/auth/reset-password';
  },
  confirmEmailMessage: function confirmEmailMessage() {
    return '/auth/confirm-message';
  },
  stacks: function stacks() {
    return '/';
  },
  userStacks: function userStacks(user) {
    if (user === void 0) {
      user = ':user';
    }

    return "/" + user;
  },
  categoryStacks: function categoryStacks(category) {
    if (category === void 0) {
      category = ':category(applications|models)';
    }

    return "/" + category;
  },
  categoryUserStacks: function categoryUserStacks(user, category) {
    if (user === void 0) {
      user = ':user';
    }

    if (category === void 0) {
      category = ':category(applications|models)';
    }

    return "/" + user + "/" + category;
  },
  stackDetails: function stackDetails(user, id) {
    if (user === void 0) {
      user = ':user';
    }

    if (id === void 0) {
      id = ':stack';
    }

    return "/" + user + "/" + id + (id === ':stack' ? '+' : '');
  },
  reports: function reports(user) {
    if (user === void 0) {
      user = ':user';
    }

    return "/" + user + "/d";
  },
  reportsDetails: function reportsDetails(user, id) {
    if (user === void 0) {
      user = ':user';
    }

    if (id === void 0) {
      id = ':id';
    }

    return "/" + user + "/d/" + id;
  },
  jobs: function jobs(user) {
    if (user === void 0) {
      user = ':user';
    }

    return "/" + user + "/j";
  },
  jobsDetails: function jobsDetails(user, id) {
    if (user === void 0) {
      user = ':user';
    }

    if (id === void 0) {
      id = ':id';
    }

    return "/" + user + "/j/" + id;
  },
  settings: function settings() {
    return '/settings';
  },
  accountSettings: function accountSettings() {
    return '/settings/account';
  },
  usersSettings: function usersSettings() {
    return '/settings/users';
  }
};

var css$u = {"list":"_3CcWo","header":"_3MHvB","title":"_2HbVV","headerSide":"_TN8Ts","search":"_3VlZv","uploadButton":"_35PkI","controls":"_ee5au","viewSwitcher":"_1boU7","sorting":"_1S_L9","sortingButton":"_1c0ym","message":"_3XJKG","text":"_1_wO5","tabs":"_DBGuk","itemList":"_1fksy","item":"_1RHsG","loadingItem":"_1uHPv","stacks-pulse":"_1qO_N","modal":"_1BJIQ","description":"_1U-iN","buttons":"_19NkE","button":"_3jLaw"};

var List = function List(_ref) {
  var _ref$data = _ref.data,
      data = _ref$data === void 0 ? [] : _ref$data,
      loading = _ref.loading,
      deleteStack = _ref.deleteStack,
      currentUser = _ref.currentUser,
      user = _ref.user,
      category = _ref.category;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var categoryMap = {
    applications: 'app',
    models: 'mlModel'
  };

  var _useState = React.useState(null),
      deletingStack = _useState[0],
      setDeletingStack = _useState[1];

  var _useState2 = React.useState(false),
      isShowWelcomeModal = _useState2[0],
      setIsShowWelcomeModal = _useState2[1];

  var _useState3 = React.useState(''),
      search = _useState3[0],
      setSearch = _useState3[1];

  var isInitialMount = React.useRef(true);

  var showWelcomeModal = function showWelcomeModal() {
    return setIsShowWelcomeModal(true);
  };

  var onChangeSearch = function onChangeSearch(value) {
    return setSearch(value);
  };

  var hideWelcomeModal = function hideWelcomeModal() {
    localStorage.setItem('welcome-modal-is-showing', true);
    setIsShowWelcomeModal(false);
  };

  React.useEffect(function () {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (!localStorage.getItem('welcome-modal-is-showing') && !loading && !data.length) showWelcomeModal();
    }
  }, [data]);

  var deleteItem = function deleteItem() {
    deleteStack(deletingStack);
    hideDeleteConfirmation();
  };

  var showDeleteConfirmation = function showDeleteConfirmation(name) {
    setDeletingStack(name);
  };

  var hideDeleteConfirmation = function hideDeleteConfirmation() {
    return setDeletingStack(null);
  };

  var getItems = function getItems() {
    var filteredItems = [];
    var items = data.filter(function (stack) {
      var _stack$head, _stack$head$preview, _stack$head2, _stack$head2$preview;

      var stackCategory = getStackCategory({
        application: (_stack$head = stack.head) === null || _stack$head === void 0 ? void 0 : (_stack$head$preview = _stack$head.preview) === null || _stack$head$preview === void 0 ? void 0 : _stack$head$preview.application,
        contentType: (_stack$head2 = stack.head) === null || _stack$head2 === void 0 ? void 0 : (_stack$head2$preview = _stack$head2.preview) === null || _stack$head2$preview === void 0 ? void 0 : _stack$head2$preview.content_type
      });
      return stackCategory === categoryMap[category];
    });

    if (items && items.length) {
      if (search.length) filteredItems = items.filter(function (i) {
        return i.name.indexOf(search) >= 0;
      });else filteredItems = items;
    }

    return filteredItems;
  };

  var items = getItems();
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$u.list
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$u.header
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$u.title
  }, {
    applications: t('application_plural'),
    models: t('mlModel_plural')
  }[category]), Boolean(data.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$u.headerSide
  }, Boolean(data.length) && /*#__PURE__*/React__default.createElement(SearchField, {
    className: css$u.search,
    showEverything: true,
    isDark: true,
    placeholder: t('findStack'),
    size: "small",
    value: search,
    onChange: onChangeSearch
  }))), loading && !Boolean(data.length) && /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$u.itemList)
  }, new Array(12).fill({}).map(function (i, index) {
    return /*#__PURE__*/React__default.createElement("div", {
      key: index,
      className: css$u.loadingItem
    });
  })), !loading && !data.length && /*#__PURE__*/React__default.createElement("div", {
    className: css$u.message
  }, user === currentUser ? t('youHaveNoStacksYet') : t('theUserHasNoStacksYetByName', {
    name: user
  })), Boolean(data.length && items.length) && /*#__PURE__*/React__default.createElement("div", {
    className: css$u.itemList
  }, items.map(function (item, index) {
    return /*#__PURE__*/React__default.createElement(Item, {
      className: css$u.item,
      Component: reactRouterDom.Link,
      key: index,
      data: item,
      to: routes.stackDetails(item.user, item.name),
      deleteAction: currentUser === item.user && showDeleteConfirmation
    });
  })), Boolean(data.length && !items.length) && /*#__PURE__*/React__default.createElement("div", {
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
    title: t('welcomeToDStack') + "\uD83D\uDC4B",
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

var css$v = {"howto":"_3e8x1","tabs":"_2M-II","description":"_1cd6d","code":"_1VE_j","footer":"_1gsjy"};

var pullPythonCode = function pullPythonCode(data) {
  var a = ["'/" + data.stack + "'"];
  var params = Object.keys(data.params);

  if (params.length > 0) {
    var p = [];
    params.forEach(function (key) {
      if (lodashEs.isString(data.params[key])) p.push("'" + key + "': '" + data.params[key] + "'");else p.push("'" + key + "': " + data.params[key]);
    });
    a.push('params={' + p.join(', ') + '}');
  }

  return "import dstack as ds\n\ndf = ds.pull(" + a.join(', ') + ")";
};

var HowTo = function HowTo(_ref) {
  var modalMode = _ref.modalMode,
      data = _ref.data,
      configurePythonCommand = _ref.configurePythonCommand;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

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

var useOnClickOutside = (function (ref, handler) {
  React.useEffect(function () {
    var listener = function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return function () {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
});

var css$w = {"frames":"_3D3R4","frames-dropdown":"_3hapH","button":"_Tn4o_","name":"_YzOn7","label":"_Hg7hs","dropdown":"_16pcp","item":"_1q46l","mark":"_1h8Eq","info":"_2BnTD","modal":"_pk61B","description":"_2GOOp","buttons":"_3Ml-A"};

var getFrameName = function getFrameName(frame) {
  return moment(frame.timestamp).format('D MMM YYYY h:mm a');
};

var Frames = function Frames(_ref) {
  var frame = _ref.frame,
      frames = _ref.frames,
      headId = _ref.headId,
      onChange = _ref.onChange,
      onMarkAsHead = _ref.onMarkAsHead,
      className = _ref.className;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(false),
      isShowDropdown = _useState[0],
      setIsShowDropdown = _useState[1];

  var toggleDropdown = function toggleDropdown() {
    return setIsShowDropdown(!isShowDropdown);
  };

  var _useState2 = React.useState(null),
      frameForMarkingAsHead = _useState2[0],
      setFrameForMarkingAsHead = _useState2[1];

  var dropdownRef = React.useRef(null);
  useOnClickOutside(dropdownRef, function () {
    return isShowDropdown && toggleDropdown();
  });
  if (!frames.length) return null;
  var activeFrame = frames.find(function (f) {
    return f.id === frame;
  });

  var onClickItem = function onClickItem(frameId) {
    return function () {
      toggleDropdown();
      if (frame !== frameId && onChange) onChange(frameId);
    };
  };

  var onClickMarkAsHead = function onClickMarkAsHead(frameId) {
    return function (event) {
      event.stopPropagation();
      setFrameForMarkingAsHead(frameId);
      toggleDropdown();
    };
  };

  var hideConfirmation = function hideConfirmation() {
    return setFrameForMarkingAsHead(null);
  };

  var confirmMarkFrameAsHead = function confirmMarkFrameAsHead() {
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
  }, frames.map(function (f) {
    return /*#__PURE__*/React__default.createElement(Tooltip, {
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
    }, t('markAsHead'))));
  }))), activeFrame && activeFrame.description && /*#__PURE__*/React__default.createElement(Tooltip, {
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

var useDebounce = (function (callback, depsOrDelay, deps) {
  var delay = 300;
  if (typeof depsOrDelay === 'number') delay = depsOrDelay;else deps = depsOrDelay;
  return React.useCallback(lodashEs.debounce(callback, delay), deps);
});

var isEmail = function isEmail(value) {
  if (!value) return true;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
};
var isRequired = function isRequired(value) {
  return !(value === null || value === undefined || value === '');
};
var noSpaces = function noSpaces(value) {
  return /^[\S]*$/.test(value);
};
var isValidStackName = function isValidStackName(value) {
  return /^[^\/]/.test(value) && /^[a-zA-Z0-9\/_]+$/.test(value);
};
var isValidEmail = function isValidEmail(mail) {
  var errors = {
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

var api = apiFabric();
var useActions = (function () {
  var _useAppStore = useAppStore(),
      apiUrl = _useAppStore[0].apiUrl;

  var checkUser = function checkUser(userName) {
    return new Promise(function (resolve, reject) {
      try {
        var _temp2 = _catch(function () {
          return Promise.resolve(api.get(apiUrl + config.CHECK_USER(userName))).then(function (request) {
            resolve(request.data);
          });
        }, function (e) {
          reject(e);
        });

        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var addPermissions = function addPermissions(_ref) {
    var userName = _ref.userName,
        instancePath = _ref.instancePath;
    var params = {
      path: instancePath
    };
    if (isValidEmail(userName).isValid) params.email = userName;else params.user = userName;
    return new Promise(function (resolve, reject) {
      try {
        var _temp4 = _catch(function () {
          return Promise.resolve(api.post(apiUrl + config.PERMISSIONS_ADD, params)).then(function () {
            resolve(params);
          });
        }, function (e) {
          reject(e);
        });

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var removePermissions = function removePermissions(_ref2) {
    var user = _ref2.user,
        instancePath = _ref2.instancePath;

    var params = _extends({
      path: instancePath
    }, user);

    return new Promise(function (resolve, reject) {
      try {
        var _temp6 = _catch(function () {
          return Promise.resolve(api.post(apiUrl + config.PERMISSIONS_DELETE, params)).then(function () {
            resolve();
          });
        }, function () {
          reject();
        });

        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  return {
    checkUser: checkUser,
    addPermissions: addPermissions,
    removePermissions: removePermissions
  };
});

var css$x = {"desktopButton":"_2X9G0","mobileButton":"_3s7Ow","modal":"_I7l_L","dialog":"_2ieJ1","description":"_2kfzG","copyAndDropdown":"_3e5Np","link":"_2420g","copy":"_2rv__","separator":"_3gVSm","dropdown":"_3Iy_D","dropdownButton":"_11Rdi","content":"_3zGyt","invite":"_2Zs79","checkUserName":"_2UalE","inviteField":"_2VZEa","inviteButton":"_2MARU","checkUserMessage":"_1jlEB","users":"_2gjKq","user":"_3VlxR","user-pic":"_2PGqr","user-name":"_-pvaS","userPic":"_IWEUU","userName":"_2xAc9","userDelete":"_3QkG0","userMessage":"_1Bvl_","userMessageSuccess":"_1PzgS"};

var Share = function Share(_ref) {
  var className = _ref.className,
      instancePath = _ref.instancePath,
      initialAccessLevel = _ref.accessLevel,
      _ref$defaultPermissio = _ref.defaultPermissions,
      defaultPermissions = _ref$defaultPermissio === void 0 ? [] : _ref$defaultPermissio,
      onChangeAccessLevel = _ref.onChangeAccessLevel,
      _ref$urlParams = _ref.urlParams,
      urlParams = _ref$urlParams === void 0 ? {} : _ref$urlParams,
      onUpdatePermissions = _ref.onUpdatePermissions,
      stackName = _ref.stackName;

  var _useAppStore = useAppStore(),
      configInfo = _useAppStore[0].configInfo;

  var _useState = React.useState(null),
      userExists = _useState[0],
      setUserExists = _useState[1];

  var _useState2 = React.useState(false),
      isEmail = _useState2[0],
      setIsEmail = _useState2[1];

  var _useState3 = React.useState(initialAccessLevel),
      accessLevel = _useState3[0],
      setAccessLevel = _useState3[1];

  var _useState4 = React.useState(defaultPermissions),
      permissions = _useState4[0],
      setPermissions = _useState4[1];

  var _useState5 = React.useState(false),
      loading = _useState5[0],
      setLoading = _useState5[1];

  var _useState6 = React.useState(false),
      isShowModal = _useState6[0],
      setIsShowModal = _useState6[1];

  var _useState7 = React.useState(''),
      userName = _useState7[0],
      setUserName = _useState7[1];

  var _useActions = useActions(),
      checkUser = _useActions.checkUser,
      addPermissions = _useActions.addPermissions,
      removePermissions = _useActions.removePermissions;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var toggleModal = function toggleModal() {
    return setIsShowModal(!isShowModal);
  };

  var dropdownOptionsMap = {
    "public": t('public'),
    internal: t('forDstackaiUsersOnly'),
    "private": t('forSelectedUsers')
  };
  React.useEffect(function () {
    setPermissions(defaultPermissions);
    setAccessLevel(initialAccessLevel);
  }, [instancePath]);
  var checkUserName = useDebounce(function (userName) {
    setUserExists(null);

    if (userName.length) {
      checkUser(userName).then(function (data) {
        return setUserExists(data.exists);
      })["catch"](function () {
        return setUserExists(null);
      });
    }
  }, []);

  var onChangeDropdown = function onChangeDropdown(value) {
    setAccessLevel(value);
    onChangeAccessLevel(value);
  };

  var onChangeUserName = function onChangeUserName(event) {
    setUserName(event.target.value);

    if (isValidEmail(event.target.value).isValid && lodashEs.get(configInfo, 'data.email_enabled')) {
      setUserExists(null);
      setIsEmail(true);
    } else {
      checkUserName(event.target.value);
      if (isEmail) setIsEmail(false);
    }
  };

  var submitInvite = function submitInvite() {
    if (userName.length) {
      var userHasPermission = permissions.some(function (i) {
        return i.user === userName;
      });
      if (!userHasPermission) addUser(userName);else {
        setUserName('');
        setUserExists(null);
        setIsEmail(false);
      }
    }
  };

  var onKeyPressUserName = function onKeyPressUserName(event) {
    if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter') {
      submitInvite();
    }
  };

  var addUser = function addUser(userName) {
    setLoading(true);
    addPermissions({
      userName: userName,
      instancePath: instancePath
    }).then(function (data) {
      setUserName('');
      setPermissions(function (permissions) {
        var newPermissions = permissions.concat([data]);
        onUpdatePermissions(newPermissions);
        return newPermissions;
      });
    })["finally"](function () {
      return setLoading(false);
    });
  };

  var removeUser = function removeUser(user) {
    return function () {
      removePermissions({
        instancePath: instancePath,
        user: user
      }).then(function () {
        setPermissions(function (permissions) {
          var newPermissions = permissions.filter(function (i) {
            return !lodashEs.isEqual(i, user);
          });
          onUpdatePermissions(newPermissions);
          return newPermissions;
        });
      });
    };
  };

  var renderUser = function renderUser(user, index) {
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

  var searchString = React.useMemo(function () {
    var searchString = Object.keys(urlParams).reduce(function (result, key) {
      if (urlParams[key]) result.push(key + "=" + urlParams[key]);
      return result;
    }, []).join('&');
    if (searchString) return "?" + searchString;
  }, [urlParams]);
  var origin = window.location.origin;
  return /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement(Button, {
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
  }, origin + "/" + instancePath + searchString), /*#__PURE__*/React__default.createElement(Copy, {
    className: css$x.copy,
    buttonTitle: null,
    copyText: origin + "/" + instancePath + searchString,
    successMessage: t('linkIsCopied')
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$x.separator
  }), /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$x.dropdown,
    items: Object.keys(dropdownOptionsMap).map(function (key) {
      return {
        title: dropdownOptionsMap[key],
        value: key,
        onClick: function onClick() {
          return onChangeDropdown(key);
        }
      };
    })
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
    placeholder: lodashEs.get(configInfo, 'data.email_enabled') ? t('enterUsernameEmailAndPressEnter') : t('enterUsernameAndPressEnter'),
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

var css$y = {"loader":"_2wNmt","title":"_1Ms-2","stacks-pulse":"_FjfKI","label":"_1rFaq","description":"_1Rg_O","diagram":"_2Aj7C"};

var Loader$1 = function Loader(_ref) {
  _objectDestructuringEmpty(_ref);

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

var css$z = {"tabs":"_gaP0O","tab":"_vQ7S6"};

var Tabs$1 = function Tabs(_ref) {
  var className = _ref.className,
      value = _ref.value,
      items = _ref.items,
      onChange = _ref.onChange,
      disabled = _ref.disabled;
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$z.tabs, className)
  }, items.map(function (i, index) {
    return /*#__PURE__*/React__default.createElement("div", {
      key: index,
      className: cx(css$z.tab, {
        active: value === i.value,
        disabled: disabled || i.disabled
      }),
      onClick: function onClick() {
        return onChange(i.value);
      }
    }, i.label);
  }));
};

var css$A = {"readme":"_1PJ3A","container":"_-2BiZ","header":"_3iG0n","title":"_g2ESz","edit":"_nlNob","content":"_3ljCE","field":"_3xq6J","emptyMessage":"_2_Q5X","preview":"_2KwU9","help":"_PBB0u","buttons":"_3X-XL","button":"_16WI-"};

var EmptyMessage = function EmptyMessage(_ref) {
  var onAdd = _ref.onAdd;
  return /*#__PURE__*/React__default.createElement(reactI18next.Trans, {
    i18nKey: "readmeEmptyMessage"
  }, "Sure your ML model is easy to understand without README? IF no, please, ", /*#__PURE__*/React__default.createElement("a", {
    href: "#",
    onClick: onAdd
  }, "add some helpful information"), " about how to use the model.");
};

var Readme = function Readme(_ref2) {
  var _currentUser$data;

  var className = _ref2.className,
      data = _ref2.data,
      onUpdate = _ref2.onUpdate;

  var _useAppStore = useAppStore(),
      currentUser = _useAppStore[0].currentUser;

  var currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;
  var category = getStackCategory({
    application: lodashEs.get(data, 'head.attachments[0].application'),
    contentType: lodashEs.get(data, 'head.attachments[0].content_type')
  });

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var textareaRef = React.useRef(null);

  var _useState = React.useState(data.readme),
      value = _useState[0],
      setValue = _useState[1];

  var _useState2 = React.useState(false),
      isEdit = _useState2[0],
      setIsEdit = _useState2[1];

  React.useEffect(function () {
    if (isEdit && (textareaRef === null || textareaRef === void 0 ? void 0 : textareaRef.current)) {
      textareaRef.current.focus();
      if (textareaRef.current.setSelectionRange) textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [isEdit]);

  var edit = function edit() {
    return setIsEdit(true);
  };

  var cancel = function cancel() {
    setIsEdit(false);
    setValue(data.readme);
  };

  var save = function save() {
    onUpdate(value);
    setIsEdit(false);
  };

  var onAddReadme = function onAddReadme(event) {
    event.preventDefault();
    edit();
  };

  var onChange = function onChange(event) {
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

var validationMap = {
  required: isRequired,
  email: isEmail,
  'no-spaces-stack': noSpaces,
  'stack-name': isValidStackName
};

var getValidationFunction = function getValidationFunction(validator) {
  if (typeof validator === 'string' && validationMap[validator]) return validationMap[validator];
  if (typeof validator === 'function') return validator;
  return function () {
    return true;
  };
};

var useForm = (function (initialFormState, fieldsValidators) {
  if (fieldsValidators === void 0) {
    fieldsValidators = {};
  }

  var _useState = React.useState(initialFormState),
      form = _useState[0],
      setForm = _useState[1];

  var _useState2 = React.useState({}),
      formErrors = _useState2[0],
      setFormErrors = _useState2[1];

  var onChange = function onChange(eventOrName, value) {
    var _extends2, _extends3;

    var name;
    var fieldValue;

    if (eventOrName.target) {
      var event = eventOrName;
      fieldValue = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      name = event.target.name;
    } else {
      name = eventOrName;
      fieldValue = value;
    }

    setForm(_extends({}, form, (_extends2 = {}, _extends2[name] = fieldValue, _extends2)));
    setFormErrors(_extends({}, formErrors, (_extends3 = {}, _extends3[name] = [], _extends3)));
  };

  var resetForm = function resetForm() {
    setForm(initialFormState);
    setFormErrors({});
  };

  var getFieldErrors = function getFieldErrors(fieldName) {
    var errors = [];
    if (Array.isArray(fieldsValidators[fieldName])) fieldsValidators[fieldName].forEach(function (validator) {
      var isValid = getValidationFunction(validator);
      if (!isValid(form[fieldName])) errors.push(validator);
    });

    if (typeof fieldsValidators[fieldName] === 'string') {
      var isValid = getValidationFunction(fieldsValidators[fieldName]);
      if (!isValid(form[fieldName])) errors.push(fieldsValidators[fieldName]);
    }

    return errors;
  };

  var checkValidForm = function checkValidForm() {
    var isValid = true;
    var newFormErrors = {};
    Object.keys(fieldsValidators).forEach(function (fieldName) {
      var errors = getFieldErrors(fieldName);
      newFormErrors[fieldName] = errors;
      isValid = isValid && !errors.length;
    });
    setFormErrors(newFormErrors);
    return isValid;
  };

  return {
    form: form,
    setForm: setForm,
    formErrors: formErrors,
    setFormErrors: setFormErrors,
    resetForm: resetForm,
    onChange: onChange,
    checkValidForm: checkValidForm
  };
});

var css$B = {"details":"_3iAZb","header":"_2kekg","backButton":"_1cfLo","title":"_1zGvd","permissions":"_3ydGO","sideHeader":"_1FUDu","share":"_2kaMN","dropdown":"_3axDI","description":"_Y6gJz","label":"_2FemD","label-tooltip":"_2Oe5S","actions":"_sZkKa","size":"_Ja107","revisions":"_bLqAO","tabs":"_3mpfk","container":"_3_I7R","withFilters":"_3exQh","filters":"_1-hdZ","attachment":"_3IGZo","readme":"_mADeQ"};

var Details = function Details(_ref) {
  var _data$head, _cx;

  var attachmentIndex = _ref.attachmentIndex,
      onChangeAttachmentIndex = _ref.onChangeAttachmentIndex,
      onUpdateReadme = _ref.onUpdateReadme,
      data = _ref.data,
      frame = _ref.frame,
      loading = _ref.loading,
      currentUser = _ref.currentUser,
      backUrl = _ref.backUrl,
      user = _ref.user,
      stack = _ref.stack,
      changeAccessLevel = _ref.changeAccessLevel,
      updatePermissions = _ref.updatePermissions;

  var _useTranslation = reactI18next.useTranslation();

  var didMountRef = React.useRef(false);

  var _useForm = useForm({}),
      form = _useForm.form,
      setForm = _useForm.setForm,
      onChange = _useForm.onChange;

  var _useState = React.useState(),
      activeTab = _useState[0],
      setActiveTab = _useState[1];

  var _useState2 = React.useState({}),
      fields = _useState2[0],
      setFields = _useState2[1];

  var _useState3 = React.useState([]),
      tabs = _useState3[0],
      setTabs = _useState3[1];

  var prevFrame = usePrevious(frame);
  React.useEffect(function () {
    if ((!lodashEs.isEqual(prevFrame, frame) || !didMountRef.current) && frame) parseTabs();
  }, [frame]);
  var findAttach = React.useCallback(function (form, tabName, attachmentIndex) {
    var attachments = lodashEs.get(frame, 'attachments');
    var fields = Object.keys(form);
    var tab = tabs.find(function (t) {
      return t.value === tabName;
    });
    if (!attachments) return;

    if (fields.length || tabs.length) {
      attachments.some(function (attach, index) {
        var _attach$params$tab$va, _attach$params$tab$ke;

        var valid = true;
        if (tab && ((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) !== 'tab' && ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) !== tab.value) return false;
        fields.forEach(function (key) {
          if (!attach.params || !lodashEs.isEqual(attach.params[key], form[key])) valid = false;
        });
        if (valid && !(attachmentIndex === undefined && index === 0)) onChangeAttachmentIndex(index);
        return valid;
      });
    }
  }, [tabs]);
  var findAttachDebounce = React.useCallback(lodashEs.debounce(findAttach, 300), [data, frame, findAttach]);
  React.useEffect(function () {
    if (didMountRef.current) findAttachDebounce(form, activeTab, attachmentIndex);
  }, [form]);
  React.useEffect(function () {
    if (didMountRef.current) parseParams();
  }, [activeTab]);
  React.useEffect(function () {
    if (!didMountRef.current) didMountRef.current = true;
  }, []);

  var getCurrentAttachment = function getCurrentAttachment(selectedTab) {
    var attachments = lodashEs.get(frame, 'attachments');
    var attachment;

    if (selectedTab) {
      attachment = attachments.find(function (attach) {
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

  var parseTabs = function parseTabs() {
    var attachments = lodashEs.get(frame, 'attachments');
    if (!attachments || !attachments.length) return;
    var tabs = parseStackTabs(attachments);
    var attachment = getCurrentAttachment();
    setTabs(tabs);

    if (attachment) {
      var _params$tab;

      var params = _extends({}, attachment.params);

      var tab = Object.keys(params).find(function (key) {
        var _params$key;

        return ((_params$key = params[key]) === null || _params$key === void 0 ? void 0 : _params$key.type) === 'tab';
      });
      setActiveTab(((_params$tab = params[tab]) === null || _params$tab === void 0 ? void 0 : _params$tab.title) || tab || null);
    }
  };

  var parseParams = function parseParams() {
    var attachments = lodashEs.get(frame, 'attachments');
    var tab = tabs.find(function (t) {
      return t.value === activeTab;
    });
    var attachment = getCurrentAttachment(tab);
    var fields = parseStackParams(attachments, tab);
    setFields(fields);

    if (attachment) {
      var params = _extends({}, attachment.params);

      var _tab = Object.keys(params).find(function (key) {
        var _params$key2;

        return ((_params$key2 = params[key]) === null || _params$key2 === void 0 ? void 0 : _params$key2.type) === 'tab';
      });

      delete params[_tab];
      setForm(params);
    }
  };

  var onChangeTab = function onChangeTab(tabName) {
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
    Component: reactRouterDom.Link,
    to: backUrl
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$B.title
  }, data.name, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-lock" + (data['access_level'] === 'private' ? '' : '-open')
  })), data['access_level'] === 'private' && /*#__PURE__*/React__default.createElement(PermissionUsers, {
    className: css$B.permissions,
    permissions: data.permissions
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$B.sideHeader
  }, data && data.user === currentUser && /*#__PURE__*/React__default.createElement(Share, {
    stackName: stack,
    instancePath: user + "/" + stack,
    onChangeAccessLevel: changeAccessLevel,
    className: css$B.share,
    accessLevel: data['access_level'],
    defaultPermissions: data.permissions,
    urlParams: {
      a: attachmentIndex ? attachmentIndex : null,
      f: (frame === null || frame === void 0 ? void 0 : frame.id) !== (data === null || data === void 0 ? void 0 : (_data$head = data.head) === null || _data$head === void 0 ? void 0 : _data$head.id) ? frame === null || frame === void 0 ? void 0 : frame.id : null
    },
    onUpdatePermissions: function onUpdatePermissions(permissions) {
      return updatePermissions(user + "/" + stack, permissions);
    }
  }))), Boolean(tabs.length) && /*#__PURE__*/React__default.createElement(Tabs$1, {
    className: css$B.tabs,
    onChange: onChangeTab,
    value: activeTab,
    items: tabs
  }), /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$B.container, (_cx = {}, _cx[css$B.withFilters] = Object.keys(fields).length, _cx))
  }, /*#__PURE__*/React__default.createElement(StackFilters, {
    fields: fields,
    form: form,
    onChange: onChange,
    className: cx(css$B.filters)
  }), frame && /*#__PURE__*/React__default.createElement(Attachment, {
    className: css$B.attachment,
    withLoader: true,
    stack: user + "/" + stack,
    frameId: frame.id,
    id: attachmentIndex || 0
  })), data && /*#__PURE__*/React__default.createElement(Readme, {
    className: css$B.readme,
    data: data,
    onUpdate: onUpdateReadme
  }));
};

var css$C = {"loader":"_31Z5G","side":"_k2iUe","filter-pulse":"_vad3r","content":"_kUkc8"};

var Loader$2 = function Loader(_ref) {
  var className = _ref.className;
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$C.loader, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$C.side
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$C.content
  }));
};

var css$D = {"progress":"_1PIt0","percent":"_m5cJQ","bar":"_1v1JQ","label":"_1xBAh"};

var Progress = function Progress(_ref) {
  var _ref$isActive = _ref.isActive,
      isActive = _ref$isActive === void 0 ? true : _ref$isActive,
      className = _ref.className;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(0),
      progress = _useState[0],
      setProgress = _useState[1];

  var step = React.useRef(0.01);
  var currentProgress = React.useRef(0);
  var prevIsActive = usePrevious(isActive);
  var requestFrame = React.useRef(null);
  var isActiveRef = React.useRef(false);
  React.useEffect(function () {
    isActiveRef.current = isActive;

    if (isActive) {
      setProgress(0);
      step.current = 0.01;
      currentProgress.current = 0;
      startCalculateProgress();
    }

    if (prevIsActive === true && isActive === false) {
      setProgress(100);
      setTimeout(function () {
        return setProgress(0);
      }, 800);
    }

    if (isActive === null) {
      setProgress(0);
    }

    if (!isActive && requestFrame.current) {
      cancelAnimationFrame(requestFrame.current);
    }
  }, [isActive]);

  var calculateProgress = function calculateProgress() {
    currentProgress.current += step.current;
    var progress = Math.round(Math.atan(currentProgress.current) / (Math.PI / 2) * 100 * 1000) / 1000;
    setProgress(progress);
    if (progress > 70) step.current = 0.005;
    if (progress >= 100 || !isActiveRef.current) cancelAnimationFrame(requestFrame.current);
    if (isActiveRef.current) requestFrame.current = requestAnimationFrame(calculateProgress);
  };

  var startCalculateProgress = function startCalculateProgress() {
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
      width: progress + "%"
    }
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$D.label
  }, t('calculatingTheData')));
};

var api$1 = apiFabric();
var actions$1 = (function () {
  var _useAppStore = useAppStore(),
      apiUrl = _useAppStore[0].apiUrl;

  var executeStack = function executeStack(params) {
    return new Promise(function (resolve, reject) {
      try {
        var _temp2 = _catch(function () {
          return Promise.resolve(api$1.post(apiUrl + config.APPS_EXECUTE, params)).then(function (request) {
            resolve(request.data);
          });
        }, function (e) {
          reject(e);
        });

        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var pollStack = function pollStack(_ref) {
    var id = _ref.id;
    return new Promise(function (resolve, reject) {
      try {
        var _temp4 = _catch(function () {
          return Promise.resolve(api$1.get(apiUrl + config.APPS_POLL + ("?id=" + id))).then(function (request) {
            resolve(request.data);
          });
        }, function (e) {
          reject(e);
        });

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  return {
    executeStack: executeStack,
    pollStack: pollStack
  };
});

var css$E = {"details":"_ti47L","header":"_1-me2","backButton":"_1ERQl","title":"_1ZJdY","permissions":"_3X_XO","sideHeader":"_1w9C6","share":"_2sRwt","dropdown":"_1fs1J","description":"_3dUVb","label":"_1JQAe","label-tooltip":"_15gJa","actions":"_2mMuP","size":"_2GzG9","revisions":"_1t1sR","tabs":"_1iRHh","container":"_2Ro1o","withSidebar":"_3dv-r","filters":"_283Wj","filterLoader":"_7OdCa","attachment":"_1QLqg","progress":"_HhauM","initMessage":"_3mGpo","emptyMessage":"_16j-R","error":"_2FCD_","message":"_nbe6T","logs":"_36zNW","logsButton":"_1K-0S","logsExpand":"_1YGSB","fromAgo":"_2urIx","log":"_3Aob9","readme":"_19inZ"};

var REFRESH_INTERVAL = 1000;
var STATUSES = Object.freeze({
  READY: 'READY',
  SCHEDULED: 'SCHEDULED',
  RUNNING: 'RUNNING',
  FINISHED: 'FINISHED',
  FAILED: 'FAILED'
});

var Details$1 = function Details(_ref) {
  var _data$head, _cx;

  var executionId = _ref.executionId,
      onChangeExecutionId = _ref.onChangeExecutionId,
      attachmentIndex = _ref.attachmentIndex,
      onChangeAttachmentIndex = _ref.onChangeAttachmentIndex,
      onUpdateReadme = _ref.onUpdateReadme,
      data = _ref.data,
      frame = _ref.frame,
      loading = _ref.loading,
      currentUser = _ref.currentUser,
      backUrl = _ref.backUrl,
      user = _ref.user,
      stack = _ref.stack,
      changeAccessLevel = _ref.changeAccessLevel,
      updatePermissions = _ref.updatePermissions;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var didMountRef = React.useRef(false);

  var _useForm = useForm({}),
      form = _useForm.form,
      setForm = _useForm.setForm,
      onChange = _useForm.onChange;

  var _useState = React.useState({}),
      fields = _useState[0],
      setFields = _useState[1];

  var _useState2 = React.useState(false),
      logsExpand = _useState2[0],
      setExpandLogs = _useState2[1];

  var _useState3 = React.useState(null),
      executeData = _useState3[0],
      setExecuteData = _useState3[1];

  var _useState4 = React.useState(false),
      executing = _useState4[0],
      setExecuting = _useState4[1];

  var _useState5 = React.useState(false),
      calculating = _useState5[0],
      setCalculating = _useState5[1];

  var _useState6 = React.useState(null),
      error = _useState6[0],
      setError = _useState6[1];

  var _useState7 = React.useState(null),
      appAttachment = _useState7[0],
      setAppAttachment = _useState7[1];

  var _useState8 = React.useState(false),
      isScheduled = _useState8[0],
      setIsScheduled = _useState8[1];

  var _useState9 = React.useState(),
      activeTab = _useState9[0],
      setActiveTab = _useState9[1];

  var _useState10 = React.useState([]),
      tabs = _useState10[0],
      setTabs = _useState10[1];

  var prevFrame = usePrevious(frame);

  var _actions = actions$1(),
      executeStack = _actions.executeStack,
      pollStack = _actions.pollStack;

  var getFormFromViews = function getFormFromViews(views) {
    if (!views || !Array.isArray(views)) return {};
    return views.reduce(function (result, view, index) {
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

  var setActiveExecutionId = function setActiveExecutionId(value) {
    if (typeof onChangeExecutionId === 'function') onChangeExecutionId(value);

    if (tabs.length && activeTab) {
      var tabIndex = tabs.findIndex(function (t) {
        return t.value === activeTab;
      });

      if (tabIndex >= 0) {
        tabs[tabIndex].executionId = value;
        setTabs(tabs);
      }
    }
  };

  var updateExecuteData = function updateExecuteData(data) {
    if (data.views) {
      var _fields = parseStackViews(data.views);

      var _form = getFormFromViews(data.views);

      setFields(_fields);
      setForm(_form);
    }

    setExecuteData(_extends({
      lastUpdate: Date.now()
    }, data));
  };

  var hasApplyButton = function hasApplyButton() {
    if (!(executeData === null || executeData === void 0 ? void 0 : executeData.views) || !Array.isArray(executeData.views)) return false;
    return executeData.views.some(function (view) {
      return view.type === 'ApplyView';
    });
  };

  var submit = function submit(form, apply) {
    if (apply === void 0) {
      apply = true;
    }

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
      apply: apply,
      views: executeData.views && executeData.views.map(function (view, index) {
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
            view.selected = view.data.findIndex(function (i) {
              return i === form[index];
            });
            break;

          default:
            view.data = form[index];
        }

        return view;
      })
    }).then(function (data) {
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
    })["catch"](function () {
      setExecuting(false);
      setCalculating(false);
      setError({
        status: null
      });
    });
  };

  reactUse.useDebounce(function () {
    if (!lodashEs.isEqual(form, getFormFromViews(executeData === null || executeData === void 0 ? void 0 : executeData.views)) && !executing) {
      submit(form, !!(!hasApplyButton() && appAttachment));
    }
  }, 300, [form]);

  var onApply = function onApply() {
    return submit(form);
  };

  React.useEffect(function () {
    if (executeData && executeData.status === STATUSES.READY && !appAttachment && !executing) {
      if (!hasApplyButton()) submit(form, true);
    }
  }, [executeData]);
  React.useEffect(function () {
    if ((data === null || data === void 0 ? void 0 : data.user) && (data === null || data === void 0 ? void 0 : data.name) && frame && !loading) {
      if (!executionId || !lodashEs.isEqual(frame, prevFrame)) {
        setExecuting(true);
        setExecuteData(null);
        setAppAttachment(null);
        executeStack({
          user: data.user,
          stack: data.name,
          frame: frame === null || frame === void 0 ? void 0 : frame.id,
          attachment: attachmentIndex || 0
        }).then(function (data) {
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
        })["catch"](function () {
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
  React.useEffect(function () {
    if ((!lodashEs.isEqual(prevFrame, frame) || !didMountRef.current) && frame) parseTabs();
  }, [frame]);
  React.useEffect(function () {
    if (!didMountRef.current) didMountRef.current = true;
  }, []);

  var getCurrentAttachment = function getCurrentAttachment(selectedTab) {
    var attachments = lodashEs.get(frame, 'attachments');
    var attachment;

    if (selectedTab) {
      attachment = attachments.find(function (attach) {
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

  var parseTabs = function parseTabs() {
    var attachments = lodashEs.get(frame, 'attachments');
    if (!attachments || !attachments.length) return;
    var tabs = parseStackTabs(attachments);
    var attachment = getCurrentAttachment();
    setTabs(tabs);

    if (attachment) {
      var _params$tab;

      var params = _extends({}, attachment.params);

      var tab = Object.keys(params).find(function (key) {
        var _params$key;

        return ((_params$key = params[key]) === null || _params$key === void 0 ? void 0 : _params$key.type) === 'tab';
      });
      setActiveTab(((_params$tab = params[tab]) === null || _params$tab === void 0 ? void 0 : _params$tab.title) || tab || null);
    }
  };

  var onChangeTab = function onChangeTab(tabName) {
    setActiveTab(tabName);
    var attachments = lodashEs.get(frame, 'attachments');
    var tab = tabs.find(function (t) {
      return t.value === tabName;
    });
    if (!attachments) return;

    if (tabs.length) {
      attachments.some(function (attach, index) {
        var _attach$params$tab$va, _attach$params$tab$ke;

        if (tab && ((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) !== 'tab' && ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) !== tab.value) return false;
        if (onChangeExecutionId) onChangeExecutionId(tab.executionId);
        setExecuteData(null);
        onChangeAttachmentIndex(index);
        return true;
      });
    }
  };

  var checkFinished = function checkFinished(_ref2) {
    var id = _ref2.id,
        isUpdateData = _ref2.isUpdateData;
    pollStack({
      id: id
    }).then(function (data) {
      setIsScheduled(data.status === STATUSES.SCHEDULED);
      if ([STATUSES.SCHEDULED, STATUSES.RUNNING].indexOf(data.status) >= 0) setTimeout(function () {
        checkFinished({
          id: data.id
        });
      }, REFRESH_INTERVAL);

      if ([STATUSES.FINISHED, STATUSES.FAILED, STATUSES.READY].indexOf(data.status) >= 0) {
        setCalculating(false);
      }

      if ([STATUSES.FINISHED, STATUSES.READY].indexOf(data.status) >= 0) {
        setAppAttachment(data.output);

        if (isUpdateData) {
          setExecuting(false);
          updateExecuteData(data);
        } else {
          setExecuteData(_extends({}, executeData, {
            logs: data.logs,
            date: Date.now()
          }));
        }
      }

      if (data.status === STATUSES.FAILED) {
        if (isUpdateData) {
          setExecuting(false);
          updateExecuteData(data);
        } else {
          setExecuteData(_extends({}, executeData, {
            logs: data.logs,
            date: Date.now()
          }));
        }

        setActiveExecutionId(null);
        setError({
          status: data.status
        });
      }
    });
  };

  if (loading) return /*#__PURE__*/React__default.createElement(Loader$1, null);
  var withSidebar = Object.keys(fields).some(function (key, index) {
    if (fields[key].type === 'textarea') return true;
    return index >= 3;
  });
  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$E.details)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$E.header
  }, /*#__PURE__*/React__default.createElement(BackButton, {
    className: css$E.backButton,
    Component: reactRouterDom.Link,
    to: backUrl
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$E.title
  }, data.name, /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-lock" + (data['access_level'] === 'private' ? '' : '-open')
  })), data['access_level'] === 'private' && /*#__PURE__*/React__default.createElement(PermissionUsers, {
    className: css$E.permissions,
    permissions: data.permissions
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$E.sideHeader
  }, data && data.user === currentUser && /*#__PURE__*/React__default.createElement(Share, {
    instancePath: user + "/" + stack,
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
    onUpdatePermissions: function onUpdatePermissions(permissions) {
      return updatePermissions(user + "/" + stack, permissions);
    }
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
    className: cx(css$E.container, (_cx = {}, _cx[css$E.withSidebar] = withSidebar, _cx))
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
    stack: user + "/" + stack,
    customData: appAttachment
  }), calculating && !isScheduled && /*#__PURE__*/React__default.createElement(Progress, {
    className: css$E.progress
  }), !appAttachment && !error && isScheduled && /*#__PURE__*/React__default.createElement("div", {
    className: css$E.initMessage
  }, t('initializingTheApplication')), !calculating && !executing && !appAttachment && !error && !isScheduled && /*#__PURE__*/React__default.createElement("div", {
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
    onClick: function onClick() {
      return setExpandLogs(function (value) {
        return !value;
      });
    },
    size: "small"
  }, t('logs'), /*#__PURE__*/React__default.createElement("span", {
    className: "mdi mdi-arrow-" + (logsExpand ? 'collapse' : 'expand')
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

var css$F = {"upload":"_1HGtr","content":"_zyXjr","subtitle":"_2QLXi","field":"_2kyid","dragndrop":"_1_81H","buttons":"_1PXB0","button":"_1nx-b"};

var MB = 1048576;

var Upload = function Upload(_ref) {
  var stack = _ref.stack,
      className = _ref.className,
      isShow = _ref.isShow,
      onClose = _ref.onClose,
      refresh = _ref.refresh,
      withButton = _ref.withButton,
      apiUrl = _ref.apiUrl,
      user = _ref.user;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(false),
      isShowModal = _useState[0],
      setIsShowModal = _useState[1];

  var _useState2 = React.useState(null),
      uploading = _useState2[0],
      setUploading = _useState2[1];

  var _useState3 = React.useState(null),
      progress = _useState3[0],
      setProgress = _useState3[1];

  var _useState4 = React.useState(null),
      file = _useState4[0],
      setFile = _useState4[1];

  var isDidMount = React.useRef(true);

  var _useForm = useForm({
    stack: stack || ''
  }, {
    stack: ['required', 'no-spaces-stack', 'stack-name']
  }),
      form = _useForm.form,
      onChange = _useForm.onChange,
      formErrors = _useForm.formErrors,
      checkValidForm = _useForm.checkValidForm;

  var runValidation = useDebounce(checkValidForm);
  React.useEffect(function () {
    if (!isDidMount.current) runValidation();else isDidMount.current = false;
  }, [form.stack]);
  React.useEffect(function () {
    if (isShow !== undefined) setIsShowModal(isShow);
  }, [isShow]);

  var toggleModal = function toggleModal() {
    return setIsShowModal(!isShowModal);
  };

  var closeHandle = function closeHandle() {
    if (onClose) onClose();else setIsShowModal(false);
  };

  var getErrorsText = function getErrorsText(fieldName) {
    if (formErrors[fieldName] && formErrors[fieldName].length) return [t("formErrors." + formErrors[fieldName][0])];
  };

  var submit = function submit() {
    try {
      var _temp7 = function _temp7() {
        var _temp4 = _catch(function () {
          var token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
          return Promise.resolve(axios({
            method: 'post',
            headers: {
              Authorization: token ? "Bearer " + token : ''
            },
            baseURL: apiUrl,
            url: config.STACK_PUSH,
            data: params
          })).then(function (_ref2) {
            var data = _ref2.data;

            function _temp3() {
              setUploading(false);
              closeHandle();
              if (refresh) refresh();
            }

            var _temp2 = function () {
              if (data.attachments && data.attachments.length) {
                var _data$attachments = data.attachments,
                    attachment = _data$attachments[0];

                var _temp9 = function () {
                  if (attachment['upload_url']) {
                    return Promise.resolve(axios.put(attachment['upload_url'], file, {
                      headers: {
                        'Content-Type': 'application/octet-stream'
                      },
                      onUploadProgress: function onUploadProgress(progressEvent) {
                        var percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total);
                        setProgress(percentCompleted);
                      }
                    })).then(function () {});
                  }
                }();

                if (_temp9 && _temp9.then) return _temp9.then(function () {});
              }
            }();

            return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
          });
        }, function () {
          closeHandle();
        });

        if (_temp4 && _temp4.then) return _temp4.then(function () {});
      };

      setProgress(null);
      setUploading(true);
      var params = {
        type: file.type,
        timestamp: Date.now(),
        id: uuid.v4(),
        stack: user + "/" + form.stack,
        size: file.size
      };

      var _temp8 = function () {
        if (file.size > MB) params.attachments = [{
          length: file.size
        }];else return Promise.resolve(fileToBase64(file)).then(function (_fileToBaseTo) {
          params.attachments = [{
            data: _fileToBaseTo
          }];
        });
      }();

      return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(_temp7) : _temp7(_temp8));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return /*#__PURE__*/React__default.createElement(React.Fragment, null, withButton && /*#__PURE__*/React__default.createElement(Tooltip, {
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
  }, !stack && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    className: css$F.subtitle
  }, t('theUploadedFileWouldBeSavedAsANewStack')), /*#__PURE__*/React__default.createElement(TextField, {
    size: "middle",
    className: css$F.field,
    name: "stack",
    onChange: onChange,
    value: form.value,
    maxLength: 30,
    placeholder: t('stackName') + ", " + t('noSpaces') + ", " + t('maxSymbol', {
      count: 30
    }),
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

var css$G = {"upload":"_2UOiz","content":"_22x3Q","subtitle":"_2sXDC","field":"_3icVJ","dragndrop":"_30Hxh","buttons":"_3VDuj","button":"_2bzId"};

var MB$1 = 1048576;

var Upload$1 = function Upload(_ref) {
  var stack = _ref.stack,
      className = _ref.className,
      refresh = _ref.refresh,
      apiUrl = _ref.apiUrl,
      user = _ref.user;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(null),
      uploading = _useState[0],
      setUploading = _useState[1];

  var _useState2 = React.useState(null),
      progress = _useState2[0],
      setProgress = _useState2[1];

  var _useState3 = React.useState(null),
      file = _useState3[0],
      setFile = _useState3[1];

  var isDidMount = React.useRef(true);
  var fileFieldRef = React.useRef(null);

  var _useForm = useForm({
    stack: stack || ''
  }, {
    stack: ['required', 'no-spaces-stack', 'stack-name']
  }),
      form = _useForm.form,
      onChange = _useForm.onChange,
      setForm = _useForm.setForm,
      formErrors = _useForm.formErrors,
      checkValidForm = _useForm.checkValidForm;

  var runValidation = useDebounce(checkValidForm);
  React.useEffect(function () {
    if (!isDidMount.current) runValidation();else isDidMount.current = false;
  }, [form.stack]);

  var clearForm = function clearForm() {
    setFile(null);
    setForm({
      stack: ''
    });
    if (fileFieldRef.current) fileFieldRef.current.clear();
  };

  var getErrorsText = function getErrorsText(fieldName) {
    if (formErrors[fieldName] && formErrors[fieldName].length) return [t("formErrors." + formErrors[fieldName][0])];
  };

  var submit = function submit() {
    try {
      var _temp7 = function _temp7() {
        var _temp4 = _catch(function () {
          var token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
          return Promise.resolve(axios({
            method: 'post',
            headers: {
              Authorization: token ? "Bearer " + token : ''
            },
            baseURL: apiUrl,
            url: config.STACK_PUSH,
            data: params
          })).then(function (_ref2) {
            var data = _ref2.data;

            function _temp3() {
              setUploading(false);
              if (refresh) refresh();
              clearForm();
            }

            var _temp2 = function () {
              if (data.attachments && data.attachments.length) {
                var _data$attachments = data.attachments,
                    attachment = _data$attachments[0];

                var _temp9 = function () {
                  if (attachment['upload_url']) {
                    return Promise.resolve(axios.put(attachment['upload_url'], file, {
                      headers: {
                        'Content-Type': 'application/octet-stream'
                      },
                      onUploadProgress: function onUploadProgress(progressEvent) {
                        var percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total);
                        setProgress(percentCompleted);
                      }
                    })).then(function () {});
                  }
                }();

                if (_temp9 && _temp9.then) return _temp9.then(function () {});
              }
            }();

            return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
          });
        }, function (e) {
          console.log(e);
          clearForm();
        });

        if (_temp4 && _temp4.then) return _temp4.then(function () {});
      };

      setProgress(null);
      setUploading(true);
      var params = {
        type: file.type,
        timestamp: Date.now(),
        id: uuid.v4(),
        stack: user + "/" + form.stack,
        size: file.size
      };

      var _temp8 = function () {
        if (file.size > MB$1) params.attachments = [{
          length: file.size
        }];else return Promise.resolve(fileToBase64(file)).then(function (_fileToBaseTo) {
          params.attachments = [{
            data: _fileToBaseTo
          }];
        });
      }();

      return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(_temp7) : _temp7(_temp8));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$G.upload, className)
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$G.content
  }, !stack && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    className: css$G.subtitle
  }, t('stackName')), /*#__PURE__*/React__default.createElement(TextField, {
    size: "middle",
    className: css$G.field,
    name: "stack",
    onChange: onChange,
    value: form.value,
    maxLength: 30,
    placeholder: t('stackName') + ", " + t('noSpaces') + ", " + t('maxSymbol', {
      count: 30
    }),
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

var css$H = {"howto":"_362z-","tabs":"_h6zun","description":"_SODNv","code":"_WU2Z-","footer":"_1DRv-"};

var UploadStack = function UploadStack(_ref) {
  var user = _ref.user,
      refresh = _ref.refresh,
      apiUrl = _ref.apiUrl,
      configurePythonCommand = _ref.configurePythonCommand,
      withFileUpload = _ref.withFileUpload;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(1),
      activeCodeTab = _useState[0],
      setActiveCodeTab = _useState[1];

  var _useState2 = React.useState(1),
      activePublishTab = _useState2[0],
      setActivePublishTab = _useState2[1];

  var tabs = [{
    label: t('python'),
    value: 1
  }];
  var publishTabs = [{
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

var api$2 = apiFabric();
var useActions$1 = (function () {
  var _useAppStore = useAppStore(),
      apiUrl = _useAppStore[0].apiUrl;

  var fetchJob = function fetchJob(_ref) {
    var user = _ref.user,
        id = _ref.id;
    return new Promise(function (resolve) {
      try {
        var _temp2 = _catch(function () {
          return Promise.resolve(api$2.get(apiUrl + config.JOB_DETAILS(user, id))).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var runJob = function runJob(params) {
    return new Promise(function (resolve) {
      try {
        var _temp4 = _catch(function () {
          return Promise.resolve(api$2.post(apiUrl + config.JOB_RUN, params)).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var stopJob = function stopJob(params) {
    return new Promise(function (resolve) {
      try {
        var _temp6 = _catch(function () {
          return Promise.resolve(api$2.post(apiUrl + config.JOB_STOP, params)).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var createJob = function createJob(params) {
    return new Promise(function (resolve) {
      try {
        var _temp8 = _catch(function () {
          return Promise.resolve(api$2.post(apiUrl + config.JOB_CREATE, params)).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var updateJob = function updateJob(params) {
    return new Promise(function (resolve) {
      try {
        var _temp10 = _catch(function () {
          return Promise.resolve(api$2.post(apiUrl + config.JOB_UPDATE, params)).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var removeJob = function removeJob(params) {
    return new Promise(function (resolve) {
      try {
        var _temp12 = _catch(function () {
          return Promise.resolve(api$2.post(apiUrl + config.JOB_DELETE, params)).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp12 && _temp12.then ? _temp12.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  return {
    fetchJob: fetchJob,
    runJob: runJob,
    stopJob: stopJob,
    createJob: createJob,
    updateJob: updateJob,
    removeJob: removeJob
  };
});

var css$I = {"loader":"_DHDDF","title":"_3eHle","loader-pulsee":"_3Q4hE","text":"_2QdBi","table":"_3c_Ia","item":"_2_9nD"};

var Loader$3 = function Loader(_ref) {
  _objectDestructuringEmpty(_ref);

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

var JOB_DEFAULT_ESTIMATED_DURATION = 600000;
var calculateJobProgress = function calculateJobProgress(job) {
  var estimatedDuration = job['estimated_duration'] || JOB_DEFAULT_ESTIMATED_DURATION;
  var currentDuration = Date.now() - job.started;
  var leftDuration = estimatedDuration - currentDuration;
  var progress = Math.min(currentDuration / estimatedDuration * 100, 100).toFixed();
  return [progress, leftDuration];
};

var css$J = {"section":"_3RnYw","progressBar":"_3xjSa","progress":"_3eEzL","time":"_1q33r"};

var Progress$1 = function Progress(_ref) {
  var data = _ref.data,
      className = _ref.className,
      onlyDuration = _ref.onlyDuration;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var progressTimer = React.useRef(null);

  var _useState = React.useState(null),
      set = _useState[1];

  React.useEffect(function () {
    if (data.status === 'RUNNING') {
      clearInterval(progressTimer.current);
      progressTimer.current = setInterval(function () {
        set(Date.now());
      }, 50);
    } else {
      clearInterval(progressTimer.current);
    }

    return function () {
      return clearInterval(progressTimer.current);
    };
  }, [data]);
  if (!data.started) return null;

  var _calculateJobProgress = calculateJobProgress(data),
      progress = _calculateJobProgress[0],
      leftDuration = _calculateJobProgress[1];

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$J.section, className)
  }, !onlyDuration && /*#__PURE__*/React__default.createElement("div", {
    className: css$J.progressBar
  }, /*#__PURE__*/React__default.createElement("div", {
    className: css$J.progress,
    style: {
      width: progress + "%"
    }
  })), /*#__PURE__*/React__default.createElement("div", {
    className: css$J.time
  }, getFormattedDuration(leftDuration), " ", t('left')));
};

var css$K = {"row":"_2f7FO","dropdown":"_2hTQP","cell":"_3ntzL","status":"_2MUSr","progress":"_1J2il"};

var REFRESH_TIMEOUT = 2000;

var dataFormat = function dataFormat(data) {
  return data.job;
};

var TableRow = React.memo(function (_ref) {
  var _currentUser$data;

  var data = _ref.data,
      onClickRow = _ref.onClickRow,
      onEdit = _ref.onEdit,
      onDelete = _ref.onDelete;

  var _useActions = useActions$1(),
      runJob = _useActions.runJob,
      stopJob = _useActions.stopJob;

  var _useAppStore = useAppStore(),
      _useAppStore$ = _useAppStore[0],
      currentUser = _useAppStore$.currentUser,
      apiUrl = _useAppStore$.apiUrl;

  var currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useParams = reactRouterDom.useParams(),
      user = _useParams.user;

  var _useState = React.useState(0),
      refreshInterval = _useState[0],
      setRefreshInterval = _useState[1];

  var _useSWR = useSWR([apiUrl + config.JOB_DETAILS(user, data.id), dataFormat], fetcher, {
    refreshInterval: refreshInterval,
    initialData: data,
    revalidateOnFocus: false
  }),
      jobData = _useSWR.data,
      mutate = _useSWR.mutate;

  var rowClick = function rowClick() {
    if (onClickRow) onClickRow(jobData);
  };

  React.useEffect(function () {
    if (['RUNNING', 'SCHEDULED'].indexOf(jobData === null || jobData === void 0 ? void 0 : jobData.status) >= 0) {
      if (!refreshInterval) setRefreshInterval(REFRESH_TIMEOUT);
    } else if (refreshInterval) {
      setRefreshInterval(0);
    }
  }, [jobData]);

  var onRun = function onRun() {
    try {
      return Promise.resolve(runJob({
        user: user,
        id: jobData.id
      })).then(function (_ref2) {
        var job = _ref2.job;
        if (job) mutate(_extends({}, jobData, job));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var onStop = function onStop() {
    try {
      return Promise.resolve(stopJob({
        user: user,
        id: jobData.id
      })).then(function (_ref3) {
        var job = _ref3.job;
        if (job) mutate(_extends({}, jobData, job));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var getTitle = function getTitle() {
    if (jobData.title && jobData.title.length) return jobData.title;else return /*#__PURE__*/React__default.createElement("span", null, "New job");
  };

  var renderStatus = function renderStatus() {
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
    items: [].concat(['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData.status) >= 0 ? [{
      title: t('stop'),
      onClick: onStop
    }] : [{
      title: t('run'),
      onClick: onRun
    }], [{
      title: t('edit'),
      onClick: onEdit
    }, {
      title: t('delete'),
      onClick: onDelete
    }])
  })));
});

var css$L = {"list":"_VXs44","title":"_r4zAA","button":"_21dbT","search":"_1mylL","mobileSearch":"_3Oub0","text":"_Ra7UV","tableWrap":"_2CYWc","table":"_2iL6k","tableCaptions":"_2YOUS","tableCell":"_3tQ5e"};

var dataFormat$1 = function dataFormat(data) {
  return data.jobs;
};

var List$1 = function List() {
  var _currentUser$data;

  var _useActions = useActions$1(),
      createJob = _useActions.createJob,
      removeJob = _useActions.removeJob;

  var _useAppStore = useAppStore(),
      _useAppStore$ = _useAppStore[0],
      currentUser = _useAppStore$.currentUser,
      apiUrl = _useAppStore$.apiUrl;

  var currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(''),
      search = _useState[0],
      setSearch = _useState[1];

  var _useParams = reactRouterDom.useParams(),
      user = _useParams.user;

  var _useHistory = reactRouterDom.useHistory(),
      push = _useHistory.push;

  var _useSWR = useSWR([apiUrl + config.JOB_LIST(user), dataFormat$1], fetcher),
      data = _useSWR.data,
      mutate = _useSWR.mutate;

  var onChangeSearch = function onChangeSearch(value) {
    return setSearch(value);
  };

  var getItems = function getItems() {
    var items = [];

    if (data && data.length) {
      if (search.length) items = data.filter(function (i) {
        return i.title.indexOf(search) >= 0;
      });else items = data;
    }

    return items;
  };

  var items = getItems();

  var onAdd = function onAdd() {
    try {
      var lastRuntime = localStorage.getItem('lastRuntime') || 'python';
      return Promise.resolve(createJob({
        user: user,
        runtime: lastRuntime
      })).then(function (data) {
        push(routes.jobsDetails(user, data.job.id));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var getOnRemove = function getOnRemove(job) {
    return function () {
      try {
        return Promise.resolve(removeJob({
          user: user,
          id: job.id
        })).then(function () {
          mutate(data.filter(function (j) {
            return j.id !== job.id;
          }));
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
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
  }, t('status'))), items.map(function (item) {
    return /*#__PURE__*/React__default.createElement(TableRow, {
      data: item,
      key: item.id,
      onClickRow: function onClickRow() {
        return push(routes.jobsDetails(user, item.id));
      },
      onEdit: function onEdit() {
        return push(routes.jobsDetails(user, item.id));
      },
      onDelete: getOnRemove(item)
    });
  }))));
};

var useAppProgress = (function () {
  var _useAppStore = useAppStore(),
      dispatch = _useAppStore[1];

  var startAppProgress = function startAppProgress() {
    dispatch({
      type: actionsTypes.START_PROGRESS
    });
  };

  var setAppProgress = function setAppProgress(progress) {
    dispatch({
      type: actionsTypes.SET_PROGRESS,
      payload: progress
    });
  };

  var completeAppProgress = function completeAppProgress() {
    dispatch({
      type: actionsTypes.COMPLETE_PROGRESS
    });
  };

  var resetAppProgress = function resetAppProgress() {
    dispatch({
      type: actionsTypes.RESET_PROGRESS
    });
  };

  return {
    startAppProgress: startAppProgress,
    setAppProgress: setAppProgress,
    completeAppProgress: completeAppProgress,
    resetAppProgress: resetAppProgress
  };
});

var css$M = {"schedule":"_YoEcM","dropdown":"_3RJdh","runtime":"_2h8GE","dropdownButton":"_3fdRe","message":"_1byIj"};

var timeout = null;

var ScheduleSettings = function ScheduleSettings(_ref) {
  var data = _ref.data,
      className = _ref.className,
      onChange = _ref.onChange,
      onChangeRuntime = _ref.onChangeRuntime;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var messageRef = React.useRef();

  var _useState = React.useState(data ? data.schedule.split('/')[0] : ''),
      scheduleType = _useState[0],
      setScheduleType = _useState[1];

  var _useState2 = React.useState(data ? data.schedule.split('/')[1] : null),
      scheduleTime = _useState2[0],
      setScheduleTime = _useState2[1];

  var _useState3 = React.useState(0),
      nextRunDelay = _useState3[0],
      setNextRunDelay = _useState3[1];

  var isDidMount = React.useRef(true);

  var runtimeChange = function runtimeChange(runtime) {
    return function () {
      onChangeRuntime(runtime);
      localStorage.setItem('lastRuntime', runtime);
    };
  };

  var scheduleTypeChange = function scheduleTypeChange(type) {
    return function () {
      setScheduleType(type);
      if (!scheduleTime) setScheduleTime('12:00');
      if (type === 'daily') type += "/" + (scheduleTime ? scheduleTime : '12:00');
      onChange(type);
    };
  };

  var scheduleTimeChange = function scheduleTimeChange(time) {
    return function () {
      setScheduleTime(time);
      onChange(scheduleType + "/" + time);
      var runTime = moment(time, 'HH:mm');
      if (new Date().getHours() > runTime.get('hours')) runTime.add(1, 'day');
      setNextRunDelay(runTime.toDate().getTime() - Date.now());
    };
  };

  React.useEffect(function () {
    if (nextRunDelay && !isDidMount.current && messageRef.current) {
      messageRef.current.classList.add('show');
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(function () {
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
  }))), scheduleType === 'daily' && /*#__PURE__*/React__default.createElement(React.Fragment, null, t('at'), /*#__PURE__*/React__default.createElement(Dropdown, {
    className: css$M.dropdown,
    items: new Array(24).fill(0).map(function (i, index) {
      var time = (index < 10 ? '0' + index : index) + ":00";
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

var css$N = {"editor":"_m0hwp","token":"_281_3","atrule":"_1M8ph","attr-value":"_T6_N1","keyword":"_1gT7U","function":"_2ZXkX","class-name":"_upcGt","selector":"_3rmyW","attr-name":"_I3P48","string":"_hoRdC","char":"_1uxpB","builtin":"_3xCwG","inserted":"_2Lvrk","scroll":"_1yHaS","content":"_3cHiP","success":"_1Z8bo","lineNumbers":"_1CW5r"};

var CodeEditor = function CodeEditor(_ref) {
  var _ref$value = _ref.value,
      value = _ref$value === void 0 ? '' : _ref$value,
      onChange = _ref.onChange,
      language = _ref.language,
      className = _ref.className,
      saved = _ref.saved;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var successMessageRef = React.useRef();
  var lines = (value.match(/\n/g) || []).length + 2;
  var lineNos = [].concat(Array(lines).keys()).slice(1).join('\n');
  var isDidMount = React.useRef(true);
  React.useEffect(function () {
    if (successMessageRef.current && !isDidMount.current) if (saved) {
      successMessageRef.current.classList.add('show');
      setTimeout(function () {
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
    value: value,
    onValueChange: onChange,
    highlight: function highlight(code) {
      return prismCore.highlight(code, prismCore.languages[language]);
    },
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

var css$O = {"status":"_3Pfpo"};

var Status = function Status(_ref) {
  var data = _ref.data;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  if (!data.started) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$O.status
  }, t('lastRunning'), ' ', moment(data.started).format("MM-DD-YYYY [" + t('at') + "] HH:mm"), /*#__PURE__*/React__default.createElement("span", null, /*#__PURE__*/React__default.createElement("span", {
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

var css$P = {"logs":"_1poNo","button":"_35eOC","text":"_2eQos","label":"_LksjJ"};

var Logs = function Logs(_ref) {
  var data = _ref.data,
      className = _ref.className;
  if (!data.logs) return null;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(true),
      isShown = _useState[0],
      setIsShown = _useState[1];

  var _useState2 = React.useState(data.finished || data.started),
      updated = _useState2[0];

  var toggleShow = function toggleShow() {
    return setIsShown(!isShown);
  };

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

var css$Q = {"loader":"_2nOeY","loader-pulse":"_1Aj7Q","title":"_RJ2x5","text1":"_2hZDH","text2":"_1-tIa","code":"_3LgqO"};

var Loader$4 = function Loader(_ref) {
  _objectDestructuringEmpty(_ref);

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

var css$R = {"details":"_1K_mA","header":"_1nmEh","dropdown":"_3RSoB","dropdownButton":"_2dnN2","title":"_3U50H","edit":"_bgkiC","side":"_3uIQ_","progress":"_1jRHi","button":"_2J0VV","schedule":"_2YXFa","codeEditor":"_1M2Sw","logs":"_ZQT6g"};

var REFRESH_TIMEOUT$1 = 3000;

var dataFormat$2 = function dataFormat(data) {
  return data.job;
};

var Details$2 = function Details(_ref) {
  var _currentUser$data;

  _objectDestructuringEmpty(_ref);

  var _useActions = useActions$1(),
      runJob = _useActions.runJob,
      stopJob = _useActions.stopJob,
      updateJob = _useActions.updateJob,
      removeJob = _useActions.removeJob;

  var _useAppProgress = useAppProgress(),
      setAppProgress = _useAppProgress.setAppProgress,
      resetAppProgress = _useAppProgress.resetAppProgress;

  var _useParams = reactRouterDom.useParams(),
      user = _useParams.user,
      id = _useParams.id;

  var _useState = React.useState(0),
      refreshInterval = _useState[0],
      setRefreshInterval = _useState[1];

  var _useAppStore = useAppStore(),
      _useAppStore$ = _useAppStore[0],
      currentUser = _useAppStore$.currentUser,
      apiUrl = _useAppStore$.apiUrl;

  var currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;

  var _useSWR = useSWR([apiUrl + config.JOB_DETAILS(user, id), dataFormat$2], fetcher, {
    refreshInterval: refreshInterval
  }),
      jobData = _useSWR.data,
      error = _useSWR.error,
      mutate = _useSWR.mutate;

  var _useHistory = reactRouterDom.useHistory(),
      push = _useHistory.push;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState2 = React.useState(''),
      titleValue = _useState2[0],
      setTitleValue = _useState2[1];

  var _useState3 = React.useState(''),
      code = _useState3[0],
      setCode = _useState3[1];

  var _useState4 = React.useState(false),
      running = _useState4[0],
      setRunning = _useState4[1];

  var _useState5 = React.useState(false),
      stopping = _useState5[0],
      setStopping = _useState5[1];

  var _useState6 = React.useState(true),
      codeSaved = _useState6[0],
      setCodeSaved = _useState6[1];

  var progressTimer = React.useRef(null);

  var update = function update(params) {
    try {
      return Promise.resolve(updateJob(params)).then(function (data) {
        mutate(_extends({}, jobData, data.job));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var updateDebounce = useDebounce(update, 1000, []);
  var updateLongDebounce = useDebounce(update, 2000, []);
  var prevData = usePrevious(jobData);
  React.useEffect(function () {
    window.addEventListener('keydown', detectEnterPress);
    return function () {
      return window.removeEventListener('keydown', detectEnterPress);
    };
  }, [jobData, code]);
  React.useEffect(function () {
    if (jobData) {
      setTitleValue(jobData.title);
      setCode(jobData.code);
    }
  }, []);

  var detectEnterPress = function detectEnterPress(event) {
    if (event.code === 'Enter' && (event.shiftKey || event.ctrlKey)) {
      event.preventDefault();
      if (!running && !stopping) onClickRun();
    }
  };

  React.useEffect(function () {
    if (['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData === null || jobData === void 0 ? void 0 : jobData.status) >= 0) {
      clearInterval(progressTimer.current);
      progressTimer.current = setInterval(function () {
        var _calculateJobProgress = calculateJobProgress(jobData),
            progress = _calculateJobProgress[0];

        setAppProgress(progress);
      }, 50);
    } else {
      clearInterval(progressTimer.current);
    }

    return function () {
      return clearInterval(progressTimer.current);
    };
  }, [refreshInterval, jobData]);
  React.useEffect(function () {
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

    return function () {
      resetAppProgress();
    };
  }, [jobData]);

  var onChangeTitle = function onChangeTitle(value) {
    setTitleValue(value);
    updateDebounce({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      title: value
    });
  };

  var onChangeCode = function onChangeCode(value) {
    setCode(value);
    setCodeSaved(false);
    updateLongDebounce({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      code: value
    }, function () {
      return setCodeSaved(true);
    });
  };

  var onChangeRuntime = function onChangeRuntime(runtime) {
    update({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      runtime: runtime
    });
  };

  var onChangeSchedule = function onChangeSchedule(schedule) {
    update({
      user: user,
      id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
      schedule: schedule
    });
  };

  var onClickRun = function onClickRun() {
    try {
      var _temp3 = function _temp3() {
        setRunning(false);
      };

      setRunning(true);

      var _temp4 = _catch(function () {
        return Promise.resolve(runJob({
          user: user,
          id: jobData === null || jobData === void 0 ? void 0 : jobData.id,
          code: code
        })).then(function (data) {
          mutate(_extends({}, jobData, data));
          setRefreshInterval(REFRESH_TIMEOUT$1);
        });
      }, function (e) {
        console.log(e);
      });

      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var onClickStop = function onClickStop() {
    try {
      var _temp7 = function _temp7() {
        setStopping(false);
      };

      setStopping(true);

      var _temp8 = _catch(function () {
        return Promise.resolve(stopJob({
          user: user,
          id: jobData === null || jobData === void 0 ? void 0 : jobData.id
        })).then(function (data) {
          mutate(_extends({}, jobData, data));
        });
      }, function (e) {
        console.log(e);
      });

      return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(_temp7) : _temp7(_temp8));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var onClickDelete = function onClickDelete() {
    try {
      return Promise.resolve(removeJob({
        user: user,
        id: jobData === null || jobData === void 0 ? void 0 : jobData.id
      })).then(function () {
        push(routes.jobs(user));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  if (!jobData && !error) return /*#__PURE__*/React__default.createElement(Loader$4, null);
  if ((error === null || error === void 0 ? void 0 : error.status) === 403) return /*#__PURE__*/React__default.createElement(AccessForbidden, null, t('youDontHaveAnAccessToThisJob'), ".", isSignedIn() && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement("br", null), /*#__PURE__*/React__default.createElement(reactRouterDom.Link, {
    to: routes.dashboards(currentUserName)
  }, t('goToMyJobs'))));
  if ((error === null || error === void 0 ? void 0 : error.status) === 404) return /*#__PURE__*/React__default.createElement(NotFound, null, t('theJobYouAreRookingForCouldNotBeFound'), ' ', isSignedIn() && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement(reactRouterDom.Link, {
    to: routes.dashboards(currentUserName)
  }, t('goToMyJobs')), "."));
  if (!jobData) return null;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$R.details
  }, /*#__PURE__*/React__default.createElement(Yield, {
    name: "header-yield"
  }, /*#__PURE__*/React__default.createElement(BackButton, {
    Component: reactRouterDom.Link,
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

var css$S = {"jobs":"_z2_YO"};

var Jobs = function Jobs(_ref) {
  _objectDestructuringEmpty(_ref);

  return /*#__PURE__*/React__default.createElement("div", {
    className: css$S.jobs
  }, /*#__PURE__*/React__default.createElement(reactRouterDom.Switch, null, /*#__PURE__*/React__default.createElement(reactRouterDom.Route, {
    path: routes.jobs(),
    exact: true,
    component: List$1
  }), /*#__PURE__*/React__default.createElement(reactRouterDom.Route, {
    path: routes.jobsDetails(),
    component: Details$2
  })));
};

var css$T = {"item":"_2TtG-","preview":"_l7PkQ","label":"_IluCM","previewWrap":"_JeLjN","emptyMessage":"_3FYnh","attachment":"_29ErP","section":"_t4Sh3","content":"_1PvDk","name":"_246Ao","by":"_15CWL","permissions":"_Venzr","dropdown":"_3zDl9","preview-stack-pulse":"_1TX_d"};

var Item$1 = function Item(_ref) {
  var data = _ref.data,
      deleteItem = _ref.deleteItem,
      user = _ref.user,
      renderContent = _ref.renderContent;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var ref = React.useRef(null);
  var hasStacks = data.cards && Boolean(data.cards.length);
  var card = data.cards.find(function (c) {
    return lodashEs.get(c, 'head.id');
  });
  var isShowDropdown = Boolean(deleteItem);
  return /*#__PURE__*/React__default.createElement(reactRouterDom.Link, {
    to: "/" + user + "/d/" + data.id,
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
    className: "mdi mdi-lock" + (data["private"] ? '' : '-open')
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

var css$U = {"loader":"_Tepr9","text":"_123Jw","dashboards-pulse":"_DeSvR","grid":"_37UOy","item":"_B93bY","pic":"_33hqz","section":"_3jX_z"};

var Loader$5 = function Loader(_ref) {
  _objectDestructuringEmpty(_ref);

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

var api$3 = apiFabric();
var useActions$2 = (function () {
  var _useAppStore = useAppStore(),
      apiUrl = _useAppStore[0].apiUrl;

  var createReport = function createReport(userName) {
    return new Promise(function (resolve) {
      try {
        var _temp2 = _catch(function () {
          return Promise.resolve(api$3.post(apiUrl + config.DASHBOARD_CREATE, {
            user: userName
          })).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var updateReport = function updateReport(userName, id, fields) {
    return new Promise(function (resolve) {
      try {
        var _temp4 = _catch(function () {
          return Promise.resolve(api$3.post(apiUrl + config.DASHBOARD_UPDATE, _extends({
            user: userName,
            id: id
          }, fields))).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var deleteReport = function deleteReport(userName, reportId) {
    return new Promise(function (resolve) {
      try {
        var _temp6 = _catch(function () {
          return Promise.resolve(api$3.post(apiUrl + config.DASHBOARD_DELETE, {
            user: userName,
            id: reportId
          })).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var reportInsertCard = function reportInsertCard(userName, id, cards, index) {
    return new Promise(function (resolve) {
      try {
        var _temp8 = _catch(function () {
          return Promise.resolve(api$3.post(apiUrl + config.DASHBOARD_CARDS_INSERT + '?attachments=true', {
            user: userName,
            dashboard: id,
            cards: cards,
            index: index
          })).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var reportUpdateCard = function reportUpdateCard(userName, id, stack, fields) {
    return new Promise(function (resolve) {
      try {
        var _temp10 = _catch(function () {
          return Promise.resolve(api$3.post(apiUrl + config.DASHBOARD_CARDS_UPDATE, _extends({
            user: userName,
            dashboard: id,
            stack: stack
          }, fields))).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  var reportDeleteCard = function reportDeleteCard(userName, id, stack) {
    return new Promise(function (resolve) {
      try {
        var _temp12 = _catch(function () {
          return Promise.resolve(api$3.post(apiUrl + config.DASHBOARD_CARDS_DELETE, {
            user: userName,
            dashboard: id,
            stack: stack
          })).then(function (request) {
            resolve(request.data);
          });
        }, function () {
          resolve({});
        });

        return Promise.resolve(_temp12 && _temp12.then ? _temp12.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  };

  return {
    createReport: createReport,
    deleteReport: deleteReport,
    updateReport: updateReport,
    reportInsertCard: reportInsertCard,
    reportUpdateCard: reportUpdateCard,
    reportDeleteCard: reportDeleteCard
  };
});

var css$V = {"list":"_uwcI_","title":"_36F7e","search":"_1HsPY","mobileSearch":"_3JBKO","text":"_11SLK","grid":"_2KJdC","add":"_3vd7A","caption":"_2_R7F"};

var dataFormat$3 = function dataFormat(data) {
  return data.dashboards;
};

var List$2 = function List(_ref) {
  var _currentUser$data;

  _objectDestructuringEmpty(_ref);

  var _useState = React.useState(''),
      search = _useState[0],
      setSearch = _useState[1];

  var _useState2 = React.useState(false),
      creating = _useState2[0],
      setCreating = _useState2[1];

  var _useAppStore = useAppStore(),
      _useAppStore$ = _useAppStore[0],
      currentUser = _useAppStore$.currentUser,
      apiUrl = _useAppStore$.apiUrl;

  var currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;

  var _useActions = useActions$2(),
      createReport = _useActions.createReport,
      deleteReport = _useActions.deleteReport;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useParams = reactRouterDom.useParams(),
      user = _useParams.user;

  var _useHistory = reactRouterDom.useHistory(),
      push = _useHistory.push;

  var _useSWR = useSWR([apiUrl + config.DASHBOARD_LIST(user), dataFormat$3], fetcher),
      data = _useSWR.data,
      error = _useSWR.error,
      mutate = _useSWR.mutate;

  var items = React.useMemo(function () {
    var items = [];

    if (data && data.length) {
      if (search.length) items = data.filter(function (i) {
        return i.title.indexOf(search) >= 0;
      });else items = data;
    }

    return items;
  }, [data, search]);

  var onChangeSearch = function onChangeSearch(value) {
    return setSearch(value);
  };

  var create = function create() {
    try {
      setCreating(true);
      return Promise.resolve(createReport(user)).then(function (data) {
        setCreating(false);
        push(routes.reportsDetails(user, data.dashboard.id));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var getDeleteFunc = function getDeleteFunc(id) {
    return function () {
      try {
        return Promise.resolve(deleteReport(user, id)).then(function () {
          mutate(data.filter(function (r) {
            return r.id !== id;
          }));
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
  };

  if ((error === null || error === void 0 ? void 0 : error.status) === 404) return /*#__PURE__*/React__default.createElement(NotFound, null, t('theDashboardYouAreRookingForCouldNotBeFound'), ' ', isSignedIn() && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement(reactRouterDom.Link, {
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
  }), t('newReport'))), items.map(function (item, index) {
    return /*#__PURE__*/React__default.createElement(Item$1, {
      key: index,
      user: user,
      data: item,
      deleteItem: currentUserName === item.user && getDeleteFunc(item.id)
    });
  })));
};

var css$W = {"loader":"_3meGS","text":"_2fWbA","dashboards-details-pulse":"_nJVCo","filters":"_3RT0J","grid":"_qat5v","item":"_2kTBz"};

var Loader$6 = function Loader(_ref) {
  _objectDestructuringEmpty(_ref);

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
  var newIndex = index + offset;
  return move(array, index, newIndex);
}

var GridContext = React.createContext({
  items: []
});
var GridProvider = /*#__PURE__*/function (_Component) {
  _inheritsLoose(GridProvider, _Component);

  function GridProvider(props) {
    var _this;

    _this = _Component.call(this, props) || this;

    _this.setItems = function (items) {
      return _this.setState({
        items: items
      });
    };

    _this.moveItem = function (sourceId, destinationId) {
      var sourceIndex = _this.state.items.findIndex(function (item) {
        return item.id === sourceId;
      });

      var destinationIndex = _this.state.items.findIndex(function (item) {
        return item.id === destinationId;
      });

      if (sourceId === -1 || destinationId === -1) {
        return;
      }

      var offset = destinationIndex - sourceIndex;

      _this.setState(function (state) {
        return {
          items: moveElement(state.items, sourceIndex, offset)
        };
      });
    };

    _this.state = {
      items: [],
      moveItem: _this.moveItem,
      setItems: _this.setItems
    };
    return _this;
  }

  var _proto = GridProvider.prototype;

  _proto.render = function render() {
    return /*#__PURE__*/React__default.createElement(GridContext.Provider, {
      value: this.state
    }, this.props.children);
  };

  return GridProvider;
}(React.Component);

var css$X = {"loader":"_3bVFk","text":"_2ZWwD","stacks-pulse":"_32IBp","grid":"_1NGPz","item":"_pEfso","pic":"_3Cu55","section":"_3VyE7"};

var Loader$7 = function Loader(_ref) {
  _objectDestructuringEmpty(_ref);

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

var css$Y = {"stacks":"_1EVMf","grid":"_23g1_","search":"_2aMVS","message":"_1MJtk","text":"_3eeN7","item":"_1S3Mz","checkbox":"_1Zf0d","buttons":"_1HBY_","button":"_1m3l6"};

var dataFormat$4 = function dataFormat(data) {
  return data.stacks;
};

var AddStacksModal = function AddStacksModal(_ref) {
  var _currentUser$data;

  var isShow = _ref.isShow,
      onClose = _ref.onClose,
      onAddStacks = _ref.onAddStacks;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var params = reactRouterDom.useParams();

  var _useState = React.useState(''),
      searchQuery = _useState[0],
      setSearchQuery = _useState[1];

  var _useState2 = React.useState([]),
      selected = _useState2[0],
      setSelected = _useState2[1];

  var _useAppStore = useAppStore(),
      _useAppStore$ = _useAppStore[0],
      currentUser = _useAppStore$.currentUser,
      apiUrl = _useAppStore$.apiUrl;

  var currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;

  var _useSWR = useSWR([apiUrl + config.USER_STACK_LIST(params.user), dataFormat$4], fetcher),
      data = _useSWR.data;

  React.useEffect(function () {
    if (!isShow) {
      setSelected([]);
      setSearchQuery('');
    }
  }, [isShow]);
  var items = React.useMemo(function () {
    var items = [];

    if (data && data.length) {
      if (searchQuery.length) items = data.filter(function (i) {
        return i.name.indexOf(searchQuery) >= 0;
      });else items = data;
    }

    return items;
  }, [data, searchQuery]);

  var onChangeSearch = function onChangeSearch(value) {
    return setSearchQuery(value);
  };

  var getFullStackName = function getFullStackName(stack) {
    return stack.user + "/" + stack.name;
  };

  var isChecked = function isChecked(stack) {
    var stackName = getFullStackName(stack);
    return selected.findIndex(function (i) {
      return i === stackName;
    }) >= 0;
  };

  var getOnClickStack = function getOnClickStack(stack) {
    return function () {
      var stackName = getFullStackName(stack);

      if (isChecked(stack)) {
        var filtered = selected.filter(function (i) {
          return i !== stackName;
        });
        setSelected(filtered);
      } else {
        setSelected([].concat(selected, [stackName]));
      }
    };
  };

  var submit = function submit() {
    if (onAddStacks) onAddStacks(selected);
    onClose();
  };

  var isUserOwner = currentUserName === params.user;
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
  }, t('noStacksAreFoundedMatchedTheSearchCriteria')), data && Boolean(data.length && items.length) && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    className: css$Y.grid
  }, items.map(function (item, index) {
    return /*#__PURE__*/React__default.createElement("div", {
      className: css$Y.item,
      key: index,
      onClick: getOnClickStack(item)
    }, /*#__PURE__*/React__default.createElement(CheckboxField, {
      className: css$Y.checkbox,
      value: isChecked(item),
      readOnly: true
    }), /*#__PURE__*/React__default.createElement(Item, {
      data: item
    }));
  })), /*#__PURE__*/React__default.createElement("div", {
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

var css$Z = {"card":"_2USXU","inner":"_nCWYo","head":"_3Ir7x","name":"_dAh2C","nameEdit":"_3U2XI","nameValue":"_1d1pL","info":"_1KbVf","dropdown":"_3Fjm5","button":"_3jXy5","move":"_1XXQ2","viewSwitcher":"_2EIG0","cardControls":"_M80-o","description":"_1od1n","addDesc":"_24azt","infoTime":"_ISfic","emptyMessage":"_3Fu27","attachment":"_3x5M9"};

var viewValueMap = {
  grid: 1,
  list: 2
};
var Card = React.memo(function (_ref) {
  var _data$description;

  var data = _ref.data,
      className = _ref.className,
      deleteCard = _ref.deleteCard,
      updateCard = _ref.updateCard,
      filters = _ref.filters,
      activeTab = _ref.activeTab,
      forwardedRef = _ref.forwardedRef,
      moveAvailable = _ref.moveAvailable;

  var _useState = React.useState(data.title),
      title = _useState[0],
      setTitle = _useState[1];

  var _useState2 = React.useState(data.columns),
      columns = _useState2[0],
      setColumns = _useState2[1];

  var descFieldRef = React.useRef();
  var isMounted = React.useRef(false);
  var isHoveredMoveBtn = React.useRef(false);

  var _useState3 = React.useState((_data$description = data.description) === null || _data$description === void 0 ? void 0 : _data$description.length),
      isShowDesc = _useState3[0],
      setIsShowDesc = _useState3[1];

  var prevIsShowDesc = reactUse.usePrevious(isShowDesc);

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var headId = lodashEs.get(data, 'head.id');
  var stackOwner = data.stack.split('/')[0];

  var _useState4 = React.useState(0),
      attachmentIndex = _useState4[0],
      setAttachmentIndex = _useState4[1];

  var _useState5 = React.useState([]),
      cardParams = _useState5[0],
      setCardParams = _useState5[1];

  React.useEffect(function () {
    var params = parseStackParams(lodashEs.get(data, 'head.attachments', []));
    if (params) setCardParams(Object.keys(params));
  }, [data]);
  React.useEffect(function () {
    findAttach();
  }, [filters]);
  React.useEffect(function () {
    if (forwardedRef && forwardedRef.current) forwardedRef.current.addEventListener('dragstart', function (event) {
      if (!isHoveredMoveBtn.current) {
        event.stopPropagation();
        event.preventDefault();
      }
    });
  }, [forwardedRef]);
  React.useEffect(function () {
    if (isMounted.current && prevIsShowDesc !== isShowDesc && descFieldRef.current) descFieldRef.current.focus();
  }, [isShowDesc]);
  React.useEffect(function () {
    isMounted.current = true;
  }, []);

  var findAttach = function findAttach() {
    var attachments = lodashEs.get(data, 'head.attachments');
    var tabs = parseStackTabs(attachments);
    var fields = Object.keys(filters).filter(function (f) {
      return cardParams.indexOf(f) >= 0;
    });
    var tab = tabs.find(function (t) {
      return t.value === activeTab;
    });
    if (!attachments) return;

    if (fields.length || tabs.length && activeTab) {
      attachments.some(function (attach, index) {
        var _attach$params$tab$va, _attach$params$tab$ke;

        var valid = true;
        if (!tab || ((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) !== 'tab' && ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) !== tab.value) return false;
        fields.forEach(function (key) {
          if (!attach.params || !lodashEs.isEqual(attach.params[key], filters[key])) valid = false;
        });
        if (valid) setAttachmentIndex(index);
        return valid;
      });
    } else setAttachmentIndex(0);
  };

  var onUpdate = updateCard ? useDebounce(updateCard, [updateCard]) : function () {};

  var onChangeTitle = function onChangeTitle(event) {
    setTitle(event.target.value);
    onUpdate({
      title: event.target.value
    });
  };

  var onChangeView = function onChangeView(view) {
    var columns = viewValueMap[view];
    setColumns(columns);
    onUpdate({
      columns: columns
    });
  };

  var onChangeDescription = function onChangeDescription(description) {
    setColumns(columns);
    onUpdate({
      description: description
    });
  };

  var onEnterMove = function onEnterMove() {
    isHoveredMoveBtn.current = true;
  };

  var onLeaveMove = function onLeaveMove() {
    isHoveredMoveBtn.current = false;
  };

  var onBlurDescription = function onBlurDescription() {
    var _data$description2;

    if (!((_data$description2 = data.description) === null || _data$description2 === void 0 ? void 0 : _data$description2.length)) setIsShowDesc(false);
  };

  var addDesc = function addDesc() {
    return setIsShowDesc(true);
  };

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$Z.card, "col-" + columns, className),
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
    overlayContent: /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement("div", null, t('updatedByName', {
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
    Component: reactRouterDom.Link,
    to: "/" + data.stack
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

var DnDItem = React.memo(function (_ref) {
  var id = _ref.id,
      onMoveItem = _ref.onMoveItem,
      children = _ref.children;
  var ref = React.useRef(null);

  var _useDrag = reactDnd.useDrag({
    item: {
      id: id,
      type: 'IMG'
    },
    collect: function collect(monitor) {
      return {
        isDragging: monitor.isDragging()
      };
    }
  }),
      connectDrag = _useDrag[1];

  var _useDrop = reactDnd.useDrop({
    accept: 'IMG',
    drop: function drop(hoveredOverItem) {
      if (hoveredOverItem.id !== id) {
        onMoveItem(hoveredOverItem.id, id);
      }
    }
  }),
      connectDrop = _useDrop[1];

  connectDrag(ref);
  connectDrop(ref);
  return React__default.Children.map(children, function (child) {
    return React__default.cloneElement(child, {
      forwardedRef: ref
    });
  });
});

var css$_ = {"details":"_1YGMH","header":"_1lU-L","title":"_2HPT5","edit":"_3ezYE","permissions":"_3OGBJ","share":"_198zx","sideHeader":"_2PqMZ","addButton":"_4KCh5","description":"_1peNb","addDesc":"_-FjzY","dropdown":"_2-VRH","tabs":"_pJ1U-","container":"_3V4ls","section":"_2_7da","cards":"_3OOzf","fields":"_WLi30","filters":"_2q551","empty":"_13-9o"};

var dataFormat$5 = function dataFormat(data) {
  return data.dashboard;
};

var Details$3 = function Details() {
  var _currentUser$data, _data$description;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useParams = reactRouterDom.useParams(),
      user = _useParams.user,
      id = _useParams.id;

  var _useHistory = reactRouterDom.useHistory(),
      push = _useHistory.push;

  var _useContext = React.useContext(GridContext),
      items = _useContext.items,
      moveItem = _useContext.moveItem,
      setItems = _useContext.setItems;

  var _useAppStore = useAppStore(),
      _useAppStore$ = _useAppStore[0],
      currentUser = _useAppStore$.currentUser,
      apiUrl = _useAppStore$.apiUrl;

  var currentUserName = (_currentUser$data = currentUser.data) === null || _currentUser$data === void 0 ? void 0 : _currentUser$data.user;

  var _useActions = useActions$2(),
      deleteReport = _useActions.deleteReport,
      updateReport = _useActions.updateReport,
      reportInsertCard = _useActions.reportInsertCard,
      reportDeleteCard = _useActions.reportDeleteCard,
      reportUpdateCard = _useActions.reportUpdateCard;

  var descFieldRef = React.useRef();
  var isMounted = React.useRef(false);

  var _useState = React.useState(false),
      isShowStacksModal = _useState[0],
      setIsShowStacksModal = _useState[1];

  var _useState2 = React.useState(),
      activeTab = _useState2[0],
      setActiveTab = _useState2[1];

  var _useState3 = React.useState([]),
      tabs = _useState3[0],
      setTabs = _useState3[1];

  var _useForm = useForm({}),
      form = _useForm.form,
      setForm = _useForm.setForm,
      onChange = _useForm.onChange;

  var _useState4 = React.useState({}),
      fields = _useState4[0],
      setFields = _useState4[1];

  var _useState5 = React.useState([]),
      filteredCards = _useState5[0],
      setFilteredCards = _useState5[1];

  var setGridItems = function setGridItems(cardsItems) {
    return setItems(cardsItems.map(function (card) {
      return {
        id: card.index,
        card: card
      };
    }));
  };

  var _useSWR = useSWR([apiUrl + config.DASHBOARD_DETAILS(user, id), dataFormat$5], fetcher, {
    revalidateOnFocus: false
  }),
      data = _useSWR.data,
      mutate = _useSWR.mutate,
      error = _useSWR.error;

  var _useState6 = React.useState(Boolean(data === null || data === void 0 ? void 0 : (_data$description = data.description) === null || _data$description === void 0 ? void 0 : _data$description.length)),
      isShowDesc = _useState6[0],
      setIsShowDesc = _useState6[1];

  var prevIsShowDesc = usePrevious(isShowDesc);
  var prevData = usePrevious(data);
  React.useEffect(function () {
    var _data$description2;

    if (!lodashEs.isEqual(prevData === null || prevData === void 0 ? void 0 : prevData.cards, data === null || data === void 0 ? void 0 : data.cards) || (data === null || data === void 0 ? void 0 : data.cards) && !isMounted.current) {
      parseTabs();
    }

    if ((prevData === null || prevData === void 0 ? void 0 : prevData.description) !== (data === null || data === void 0 ? void 0 : data.description)) setIsShowDesc(Boolean(data === null || data === void 0 ? void 0 : (_data$description2 = data.description) === null || _data$description2 === void 0 ? void 0 : _data$description2.length));
  }, [data]);
  React.useEffect(function () {
    return function () {
      setGridItems([]);
    };
  }, []);
  React.useEffect(function () {
    if (filteredCards.length) {
      setGridItems(filteredCards);
      parseParams();
    }
  }, [filteredCards]);
  React.useEffect(function () {
    if (activeTab !== undefined) filterCards();
  }, [activeTab]);
  React.useEffect(function () {
    var _data$description3;

    if (isMounted.current && prevIsShowDesc !== isShowDesc && descFieldRef.current && !((_data$description3 = data.description) === null || _data$description3 === void 0 ? void 0 : _data$description3.length)) descFieldRef.current.focus();
  }, [isShowDesc]);
  React.useEffect(function () {
    isMounted.current = true;
  }, []);

  var getAllAttachments = function getAllAttachments(cards) {
    var _cards;

    if (!cards) cards = data === null || data === void 0 ? void 0 : data.cards;
    if (!((_cards = cards) === null || _cards === void 0 ? void 0 : _cards.length)) return [];
    return cards.reduce(function (result, card) {
      return result.concat(lodashEs.get(card, 'head.attachments', []));
    }, []);
  };

  var parseParams = function parseParams() {
    var fields = parseStackParams(getAllAttachments(filteredCards)) || {};
    var defaultFilterValues = Object.keys(fields).reduce(function (result, fieldName) {
      if (fields[fieldName].type === 'select') result[fieldName] = fields[fieldName].options[0].value;

      if (fields[fieldName].type === 'slider') {
        var key = Object.keys(fields[fieldName].options)[0];
        result[fieldName] = fields[fieldName].options[key];
      }

      if (fields[fieldName].type === 'checkbox') result[fieldName] = false;
      return result;
    }, {});
    setForm(defaultFilterValues);
    setFields(fields);
  };

  var parseTabs = function parseTabs() {
    var _tabs$;

    var attachments = getAllAttachments();
    if (!attachments || !attachments.length) return;
    var tabs = parseStackTabs(attachments);
    var hasOldTab = tabs.some(function (t) {
      return activeTab && t.value === activeTab;
    });
    var newActiveTab = hasOldTab ? activeTab : ((_tabs$ = tabs[0]) === null || _tabs$ === void 0 ? void 0 : _tabs$.value) || null;
    setTabs(tabs);
    setActiveTab(newActiveTab);
    if (newActiveTab === activeTab) filterCards();
  };

  var filterCards = function filterCards() {
    if (tabs.length && activeTab) {
      var _filteredCards = data.cards.filter(function (card) {
        var attachments = lodashEs.get(card, 'head.attachments', []);
        if (!attachments || !attachments.length) return true;
        var tabs = parseStackTabs(attachments);
        var tab = tabs.find(function (t) {
          return t.value === activeTab;
        });
        if (!tabs.length) return true;
        return attachments.some(function (attach) {
          var _attach$params$tab$va, _attach$params$tab$ke;

          return tab && (((_attach$params$tab$va = attach.params[tab.value]) === null || _attach$params$tab$va === void 0 ? void 0 : _attach$params$tab$va.type) === 'tab' || ((_attach$params$tab$ke = attach.params[tab.key]) === null || _attach$params$tab$ke === void 0 ? void 0 : _attach$params$tab$ke.title) === tab.value);
        });
      });

      setFilteredCards(_filteredCards);
    } else {
      setFilteredCards(data.cards);
    }
  };

  var onChangeTab = function onChangeTab(tabName) {
    setActiveTab(tabName);
  };

  var update = function update(params) {
    try {
      return Promise.resolve(updateReport(user, id, params)).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var debounceUpdateTitle = useDebounce(function (fields) {
    try {
      return Promise.resolve(update(fields)).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  }, 300);

  var onChangeTitle = function onChangeTitle(title) {
    data.title = title;
    mutate(data, false);
    debounceUpdateTitle({
      title: title
    });
  };

  var debounceUpdateDescription = useDebounce(function (fields) {
    try {
      return Promise.resolve(update(fields)).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  }, 300);

  var onChangeDescription = function onChangeDescription(description) {
    data.description = description;
    mutate(data, false);
    debounceUpdateDescription({
      description: description
    });
  };

  var onChangePrivate = function onChangePrivate(isPrivate) {
    try {
      update({
        "private": isPrivate
      }).then(function () {
        mutate(_extends({}, data, {
          "private": isPrivate
        }), false);
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var addStacks = function addStacks(stacks) {
    try {
      var _data$cards;

      return Promise.resolve(reportInsertCard(user, id, stacks.map(function (stack) {
        return {
          stack: stack
        };
      }), data === null || data === void 0 ? void 0 : (_data$cards = data.cards) === null || _data$cards === void 0 ? void 0 : _data$cards.length)).then(function (_ref) {
        var cards = _ref.dashboard.cards;
        var newCards = cards.filter(function (c) {
          return stacks.indexOf(c.stack) >= 0;
        });
        mutate(_extends({}, data, {
          cards: data.cards.concat(newCards)
        }), false);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var getDeleteCardFunc = function getDeleteCardFunc(stack) {
    return function () {
      try {
        return Promise.resolve(reportDeleteCard(user, id, stack)).then(function () {
          mutate(_extends({}, data, {
            cards: data.cards.filter(function (c) {
              return c.stack !== stack;
            })
          }), false);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
  };

  var updatePermissions = function updatePermissions(permissions) {
    mutate(_extends({}, data, {
      permissions: permissions
    }), false);
  };

  var getUpdatedCardFunc = function getUpdatedCardFunc(stack) {
    return function (fields) {
      try {
        return Promise.resolve(reportUpdateCard(user, id, stack, fields)).then(function (_ref2) {
          var newCards = _ref2.cards;
          var updatedCard = newCards.find(function (i) {
            return i.stack === stack;
          });
          var index = data.cards.findIndex(function (i) {
            return i.stack === stack;
          });
          if (index >= 0) Object.keys(fields).forEach(function (key) {
            data.cards[index][key] = updatedCard[key];
          });
          mutate(_extends({}, data), false);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
  };

  var moveCard = function moveCard(indexFrom, indexTo) {
    if (indexTo < 0 || indexFrom < 0) return;
    var stack = items[indexFrom].card.stack;
    moveItem(indexFrom, indexTo);
    reportUpdateCard(user, id, stack, {
      index: indexTo
    })["catch"](console.log);
  };

  var deleteDashboard = function deleteDashboard() {
    try {
      return Promise.resolve(deleteReport(user, id)).then(function () {
        push(routes.reports(user));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var renderFilters = function renderFilters() {
    if (!Object.keys(fields).length) return null;
    var hasSelectField = Object.keys(fields).some(function (key) {
      return fields[key].type === 'select';
    });
    return /*#__PURE__*/React__default.createElement(StackFilters, {
      fields: fields,
      form: form,
      onChange: onChange,
      className: cx(css$_.filters, {
        'with-select': hasSelectField
      })
    });
  };

  var toggleAddStackModal = function toggleAddStackModal(event) {
    if (event === null || event === void 0 ? void 0 : event.target) event.preventDefault();
    setIsShowStacksModal(function (isShow) {
      return !isShow;
    });
  };

  var onBlurDescription = function onBlurDescription() {
    var _data$description4;

    if (!((_data$description4 = data.description) === null || _data$description4 === void 0 ? void 0 : _data$description4.length)) setIsShowDesc(false);
  };

  var addDesc = function addDesc() {
    return setIsShowDesc(true);
  };

  if ((error === null || error === void 0 ? void 0 : error.status) === 403) return /*#__PURE__*/React__default.createElement(AccessForbidden, null, t('youDontHaveAnAccessToThisDashboard'), ".", isSignedIn() && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement("br", null), /*#__PURE__*/React__default.createElement(reactRouterDom.Link, {
    to: routes.reports(currentUserName)
  }, t('goToMyDashboards'))));
  if ((error === null || error === void 0 ? void 0 : error.status) === 404) return /*#__PURE__*/React__default.createElement(NotFound, null, t('theDashboardYouAreRookingForCouldNotBeFound'), ' ', isSignedIn() && /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement(reactRouterDom.Link, {
    to: routes.reports(currentUserName)
  }, t('goToMyDashboards')), "."));
  if (!data) return /*#__PURE__*/React__default.createElement(Loader$6, null);
  var isUserOwner = currentUserName === user;
  var CardWrapComponent = isUserOwner ? DnDItem : React.Fragment;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$_.details
  }, /*#__PURE__*/React__default.createElement(Yield, {
    name: "header-yield"
  }, /*#__PURE__*/React__default.createElement(BackButton, {
    Component: reactRouterDom.Link,
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
    className: "mdi mdi-lock" + (data["private"] ? '' : '-open')
  })), data["private"] && /*#__PURE__*/React__default.createElement(PermissionUsers, {
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
    instancePath: user + "/d/" + data.id,
    onChangeAccessLevel: onChangePrivate,
    className: css$_.share,
    defaultIsPrivate: data["private"],
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
  }, items.map(function (item) {
    return /*#__PURE__*/React__default.createElement(CardWrapComponent, _extends({
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
    }));
  }))), !items.length && !(data === null || data === void 0 ? void 0 : data.cards) && /*#__PURE__*/React__default.createElement("div", {
    className: css$_.empty
  }, t('thereAreNoStacksYet'), " ", /*#__PURE__*/React__default.createElement("br", null), t('youCanSendStacksYouWantToBeHereLaterOrAddItRightNow'), isUserOwner && /*#__PURE__*/React__default.createElement(React.Fragment, null, ' ', /*#__PURE__*/React__default.createElement("a", {
    className: css$_.addButton,
    onClick: toggleAddStackModal,
    href: "#"
  }, t('addStack')), ".")), /*#__PURE__*/React__default.createElement(AddStacksModal, {
    isShow: isShowStacksModal,
    onClose: toggleAddStackModal,
    onAddStacks: addStacks
  }));
};

var css$$ = {"reports":"_30ROl"};

var Reports = function Reports(_ref) {
  _objectDestructuringEmpty(_ref);

  return /*#__PURE__*/React__default.createElement("div", {
    className: css$$.reports
  }, /*#__PURE__*/React__default.createElement(reactRouterDom.Switch, null, /*#__PURE__*/React__default.createElement(reactRouterDom.Route, {
    path: routes.reports(),
    exact: true,
    component: List$2
  }), /*#__PURE__*/React__default.createElement(reactRouterDom.Route, {
    path: routes.reportsDetails(),
    component: Details$3
  })));
};

function _extends$7() {
  _extends$7 = Object.assign || function (target) {
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

  return _extends$7.apply(this, arguments);
}

var _ref$6 = /*#__PURE__*/React.createElement("path", {
  d: "M72.388 28.36c.867-.884 1.3-2.063 1.3-3.536 0-1.473-.433-2.643-1.3-3.51-.85-.867-1.863-1.3-3.042-1.3-1.179 0-2.201.425-3.068 1.274-.85.85-1.274 2.01-1.274 3.484 0 1.473.425 2.66 1.274 3.562.867.884 1.89 1.326 3.068 1.326 1.179 0 2.193-.433 3.042-1.3zm-3.666 3.874c-1.907 0-3.51-.693-4.81-2.08-1.3-1.404-1.95-3.19-1.95-5.356 0-2.184.641-3.952 1.924-5.304 1.3-1.37 2.912-2.054 4.836-2.054 1.127 0 2.115.26 2.964.78.867.503 1.534 1.17 2.002 2.002V12.76h2.99V32h-2.99v-2.678a5.766 5.766 0 01-2.002 2.132c-.85.52-1.837.78-2.964.78zM79.921 21.782c0-1.213.511-2.236 1.534-3.068 1.023-.85 2.366-1.274 4.03-1.274 1.664 0 2.981.416 3.952 1.248.988.815 1.517 1.933 1.586 3.354h-3.042c-.052-.71-.303-1.265-.754-1.664-.433-.399-1.049-.598-1.846-.598-.797 0-1.421.182-1.872.546-.45.347-.676.815-.676 1.404 0 .572.286 1.023.858 1.352.572.33 1.265.572 2.08.728.832.156 1.655.347 2.47.572a4.422 4.422 0 012.106 1.248c.572.59.858 1.387.858 2.392 0 1.248-.529 2.262-1.586 3.042-1.04.78-2.383 1.17-4.03 1.17-1.647 0-2.981-.399-4.004-1.196-1.023-.797-1.586-1.933-1.69-3.406h3.068c.052.71.312 1.265.78 1.664s1.1.598 1.898.598c.815 0 1.456-.173 1.924-.52.485-.364.728-.84.728-1.43s-.286-1.049-.858-1.378c-.572-.33-1.274-.572-2.106-.728a71.892 71.892 0 01-2.47-.572 4.632 4.632 0 01-2.08-1.196c-.572-.572-.858-1.335-.858-2.288zM101.402 20.092h-3.484v7.93c0 .537.121.927.364 1.17.26.225.693.338 1.3.338h1.82V32h-2.34c-2.756 0-4.134-1.326-4.134-3.978v-7.93h-1.69v-2.418h1.69v-3.562h2.99v3.562h3.484v2.418zM113.572 28.36c.866-.884 1.3-2.063 1.3-3.536 0-1.473-.434-2.643-1.3-3.51-.85-.867-1.864-1.3-3.042-1.3-1.179 0-2.202.425-3.068 1.274-.85.85-1.274 2.01-1.274 3.484 0 1.473.424 2.66 1.274 3.562.866.884 1.889 1.326 3.068 1.326 1.178 0 2.192-.433 3.042-1.3zm-3.666 3.874c-1.907 0-3.51-.693-4.81-2.08-1.3-1.404-1.95-3.19-1.95-5.356 0-2.184.641-3.952 1.924-5.304 1.3-1.37 2.912-2.054 4.836-2.054 1.126 0 2.114.26 2.964.78.866.503 1.534 1.17 2.002 2.002v-2.548h2.99V32h-2.99v-2.678a5.774 5.774 0 01-2.002 2.132c-.85.52-1.838.78-2.964.78zM127.787 32.234c-2.08 0-3.77-.676-5.07-2.028-1.3-1.352-1.95-3.137-1.95-5.356 0-2.236.65-4.03 1.95-5.382 1.317-1.352 3.007-2.028 5.07-2.028 1.733 0 3.163.416 4.29 1.248 1.144.815 1.915 1.985 2.314 3.51h-3.198c-.538-1.508-1.673-2.262-3.406-2.262-1.214 0-2.184.433-2.912 1.3-.711.85-1.066 2.045-1.066 3.588 0 1.543.355 2.747 1.066 3.614.728.867 1.698 1.3 2.912 1.3 1.716 0 2.851-.754 3.406-2.262h3.198c-.416 1.456-1.196 2.617-2.34 3.484-1.144.85-2.566 1.274-4.264 1.274zM140.308 32h-2.964V12.76h2.964v11.18l5.2-6.266h4.108l-6.604 7.176 6.604 7.15h-4.004l-5.304-6.162V32zM154.107 31.506a1.78 1.78 0 01-1.274.494c-.503 0-.927-.173-1.274-.52a1.75 1.75 0 01-.494-1.248c0-.503.165-.927.494-1.274.347-.347.771-.52 1.274-.52s.927.173 1.274.52c.347.347.52.771.52 1.274s-.173.927-.52 1.274zM167.298 28.36c.867-.884 1.3-2.063 1.3-3.536 0-1.473-.433-2.643-1.3-3.51-.849-.867-1.863-1.3-3.042-1.3-1.179 0-2.201.425-3.068 1.274-.849.85-1.274 2.01-1.274 3.484 0 1.473.425 2.66 1.274 3.562.867.884 1.889 1.326 3.068 1.326s2.193-.433 3.042-1.3zm-3.666 3.874c-1.907 0-3.51-.693-4.81-2.08-1.3-1.404-1.95-3.19-1.95-5.356 0-2.184.641-3.952 1.924-5.304 1.3-1.37 2.912-2.054 4.836-2.054 1.127 0 2.115.26 2.964.78a5.284 5.284 0 012.002 2.002v-2.548h2.99V32h-2.99v-2.678a5.766 5.766 0 01-2.002 2.132c-.849.52-1.837.78-2.964.78zM178.861 13.878c0 .537-.182.988-.546 1.352-.364.364-.815.546-1.352.546-.52 0-.962-.182-1.326-.546-.364-.364-.546-.815-.546-1.352 0-.537.182-.988.546-1.352a1.805 1.805 0 011.326-.546c.537 0 .988.182 1.352.546.364.364.546.815.546 1.352zM175.481 32V17.674h2.964V32h-2.964z",
  fill: "#303340"
});

var _ref2$3 = /*#__PURE__*/React.createElement("rect", {
  width: 31.284,
  height: 29.645,
  rx: 3,
  transform: "scale(1.1958 .755) rotate(-45 51.44 21.307)",
  fill: "url(#logo_svg__paint0_linear)"
});

var _ref3$2 = /*#__PURE__*/React.createElement("rect", {
  width: 31.284,
  height: 29.645,
  rx: 3,
  transform: "scale(1.1958 .755) rotate(-45 39.314 16.284)",
  fill: "url(#logo_svg__paint1_linear)",
  fillOpacity: 0.9
});

var _ref4$1 = /*#__PURE__*/React.createElement("rect", {
  width: 31.284,
  height: 29.645,
  rx: 3,
  transform: "scale(1.1958 .755) rotate(-45 26.73 10.993)",
  fill: "url(#logo_svg__paint2_linear)",
  fillOpacity: 0.9
});

var _ref5 = /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
  id: "logo_svg__paint0_linear",
  x1: 24.978,
  y1: -2.508,
  x2: 2.623,
  y2: 27.352,
  gradientUnits: "userSpaceOnUse"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#372191"
}), /*#__PURE__*/React.createElement("stop", {
  offset: 1,
  stopColor: "#9D8EF8"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "logo_svg__paint1_linear",
  x1: 24.899,
  y1: -2.429,
  x2: -1.348,
  y2: 22.377,
  gradientUnits: "userSpaceOnUse"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#7B369F"
}), /*#__PURE__*/React.createElement("stop", {
  offset: 1,
  stopColor: "#DCAFF3"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "logo_svg__paint2_linear",
  x1: 18.113,
  y1: 3.687,
  x2: -8.564,
  y2: 16.952,
  gradientUnits: "userSpaceOnUse"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#84D1EA"
}), /*#__PURE__*/React.createElement("stop", {
  offset: 1,
  stopColor: "#DAF7FE"
})));

function SvgLogo(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$7({
    width: 179,
    height: 48,
    viewBox: "0 0 179 48",
    fill: "none"
  }, props), _ref$6, _ref2$3, _ref3$2, _ref4$1, _ref5);
}

var css$10 = {"header":"_3C4T1","logo":"_1jfuS","buttons":"_2EQYi","button":"_3cb7N"};

var Header = function Header(_ref) {
  var className = _ref.className;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  return /*#__PURE__*/React__default.createElement("div", {
    className: cx(css$10.header, className)
  }, /*#__PURE__*/React__default.createElement(reactRouterDom.Link, {
    to: "/",
    className: css$10.logo
  }, /*#__PURE__*/React__default.createElement(SvgLogo, null)), /*#__PURE__*/React__default.createElement("div", {
    className: css$10.buttons
  }, /*#__PURE__*/React__default.createElement(Button, {
    Component: reactRouterDom.Link,
    to: "/auth/login",
    className: css$10.button,
    color: "primary",
    variant: "contained"
  }, t('logIn'))));
};

var css$11 = {"layout":"_23bi3","header":"_1chFa","main":"_70hee"};

var UnAuthorizedLayout = function UnAuthorizedLayout(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/React__default.createElement("div", {
    className: css$11.layout
  }, /*#__PURE__*/React__default.createElement(Header, {
    className: css$11.header
  }), /*#__PURE__*/React__default.createElement("div", {
    className: css$11.main
  }, children));
};

var css$12 = {"infoButton":"_2zmYM"};

var SettingsInformation = function SettingsInformation(_ref) {
  var className = _ref.className,
      renderModalContent = _ref.renderModalContent;

  var _useTranslation = reactI18next.useTranslation(),
      t = _useTranslation.t;

  var _useState = React.useState(false),
      isShowModal = _useState[0],
      setIsShowModal = _useState[1];

  var toggleModal = function toggleModal() {
    return setIsShowModal(function (value) {
      return !value;
    });
  };

  return /*#__PURE__*/React__default.createElement(React.Fragment, null, /*#__PURE__*/React__default.createElement(Button, {
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

Object.defineProperty(exports, 'DndProvider', {
  enumerable: true,
  get: function () {
    return reactDnd.DndProvider;
  }
});
exports.AccessForbidden = AccessForbidden;
exports.AppStoreProvider = AppStoreProvider;
exports.Avatar = Avatar;
exports.BackButton = BackButton;
exports.Button = Button;
exports.CheckboxField = CheckboxField;
exports.CodeViewer = CodeViewer;
exports.Copy = Copy;
exports.DnDGridContext = GridContext;
exports.DnDGridContextProvider = GridProvider;
exports.DnDItem = DnDItem;
exports.Dropdown = Dropdown;
exports.FileDragnDrop = FileDragnDrop$1;
exports.Jobs = Jobs;
exports.Loader = Loader;
exports.MarkdownRender = MarkdownRender;
exports.Modal = Modal;
exports.NotFound = NotFound;
exports.ProgressBar = ProgressBar;
exports.ReportDetails = Details$3;
exports.ReportList = List$2;
exports.Reports = Reports;
exports.SearchField = SearchField;
exports.SelectField = SelectField;
exports.SettingsInformation = SettingsInformation;
exports.SliderField = SliderField;
exports.Spinner = Spinner;
exports.StackAttachment = Attachment;
exports.StackAttachmentProvider = StateProvider;
exports.StackDetails = Details;
exports.StackDetailsApp = Details$1;
exports.StackFilters = StackFilters;
exports.StackFrames = Frames;
exports.StackHowToFetchData = HowTo;
exports.StackList = List;
exports.StackListItem = Item;
exports.StackUpload = Upload;
exports.StretchTextareaField = StretchTextAreaField;
exports.StretchTitleField = StretchTitleField;
exports.Tabs = Tabs;
exports.TextAreaField = TextAreaField;
exports.TextField = TextField;
exports.Tooltip = Tooltip;
exports.UnAuthorizedLayout = UnAuthorizedLayout;
exports.UploadStack = UploadStack;
exports.ViewSwitcher = ViewSwitcher;
exports.Yield = Yield;
exports.apiFabric = apiFabric;
exports.appStoreActionTypes = actionsTypes;
exports.config = config;
exports.useAppStore = useAppStore;
//# sourceMappingURL=index.js.map
