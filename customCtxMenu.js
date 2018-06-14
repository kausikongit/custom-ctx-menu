"use strict";

window.contextMenu = function (targetElem, opts) {
  var self = this; 
  var contextMenuClassName = opts.ctxElemId;
  var taskItemClassName = opts.targetClasses;
  var taskItemInContext;
  
  /**
   * Initialise.
   */
  this.init = function () {
    this.runId = Math.round(Math.random() * 1000000001);
    this.menu = this.appendMenuHTML(opts.menu);
    this.menuState = 0; 
    this.contextListener();
    this.documentClickListener();
    this.resizeListener();
  };

  this.appendMenuHTML = function (menu) {
    var menuNode = this.getMenuNode(menu);
    menuNode.setAttribute('id','menu_' + this.runId);
    return menuNode; 
  };

  this.getMenuNode = function (menu) {
    var menuNode = createNode(document.body, {nodeName: 'menu', attributes: {class: 'menu'}});
    menu.forEach(function(menuItem) {
      self.getItemNode(menuNode, menuItem);
    });
    return menuNode; 
  };

  this.getItemNode = function (parent, menuItem) {
    var hasSubMenu = (menuItem.menu && menuItem.menu instanceof Array);
    var li = createNode(parent, {nodeName: 'li', attributes: {class: 'menu-item ' + (hasSubMenu ? "submenu" : "")}, event:this.clickHandler.bind(menuItem)});
    var btn = createNode(li, {nodeName: 'button',attributes: {type:'', class: 'menu-btn'}});  
    var icon = menuItem.iconClass ? createNode(btn, {nodeName: 'i',attributes: {class: menuItem.iconClass}}) : null; 
    var span = createNode(btn, {nodeName: 'span',attributes: {class: 'menu-text'},text: menuItem.label})
    
    if(hasSubMenu) {
      li.appendChild(this.getMenuNode(menuItem.menu));
    }
    return li; 
  };

  function createNode(parent, vnode) {
    var node = document.createElement(vnode.nodeName);
    Object.keys(vnode.attributes || {}).forEach(function (key) {
      node.setAttribute(key, vnode.attributes[key]);
    });
    
    if(vnode.text) {
      node.appendChild(document.createTextNode(vnode.text));
    }
    if(vnode.event) {
      node.addEventListener('click', vnode.event, false);
    }
    if(parent) {
      parent.appendChild(node); 
    }
    return node;
  }

  /**
   * Listens for contextmenu events.
   */
  this.contextListener = function () {
    var timer, touchDelay = 500;
    var targetElemList = document.querySelectorAll(targetElem);
    for (var i = 0; i < targetElemList.length; i++) {
      targetElemList[i].addEventListener("contextmenu", function (e) {
        self.contextMenuHandler(e);
      });

      targetElemList[i].addEventListener("touchstart", function (e) {
        e.preventDefault();
        self.toggleMenuOff(); 
        timer = setTimeout(self.contextMenuHandler.bind(self, e), touchDelay);
      });

      targetElemList[i].addEventListener("touchend", function (e) {
        if (timer) {
          clearTimeout(timer);
        }
      });

    }

  };

  /** Handle Right click or touch - hold event  */

  this.contextMenuHandler = function (e) {
    e.preventDefault();
    taskItemInContext = e.target;
    this.toggleMenuOn();
    this.positionMenu(e);
  };

  /**
   * Listens for click events on document.
   */

  this.documentClickListener = function () {
    /iP/i.test(navigator.userAgent) 
    && (document.body.style.cursor = 'pointer') 
    && (document.body.style['-webkit-tap-highlight-color'] = 'rgba(0, 0, 0, 0)'); 

    document.addEventListener('click', self.clickHandler, false); 
  }

  this.clickHandler = function (e) {
    var clickeElIsLink = clickInsideElement(e, 'menu-item');
    if (clickeElIsLink) {
      e.preventDefault();
      e.stopPropagation();
      if (clickeElIsLink.classList.contains('submenu')) {
        return;
      }
      self.toggleMenuOff();
      if (this.onClick) {
        this.onClick.call(taskItemInContext);
      }
    } else {
      self.toggleMenuOff();
    }
  }

  /**
   * Window resize event listener - to off menu when window resized
   */
  this.resizeListener = function () {
    window.onresize = function (e) {
      self.toggleMenuOff();
    };
  }

  /**
   * Turns the custom context menu on.
   */
  this.toggleMenuOn = function () {
    if (this.menuState !== 1) {
      this.menuState = 1;
      this.menu.classList.add('show-menu');
    }
  }

  /**
   * Turns the custom context menu off.
   */
  this.toggleMenuOff = function () {
    if (this.menuState !== 0) {
      this.menuState = 0;
      this.menu.classList.remove('show-menu');
    }
  };

  /**
   * Positions the menu properly.
   */
  this.positionMenu = function (e) {
    var clickCoords = getPosition(e);
    var clickCoordsX = clickCoords.x;
    var clickCoordsY = clickCoords.y;

    var menuWidth = this.menu.offsetWidth + 4;
    var menuHeight = this.menu.offsetHeight + 4;

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    if ((windowWidth - clickCoordsX) < menuWidth) {
      this.menu.style.left = windowWidth - menuWidth + "px";
    } else {
      this.menu.style.left = clickCoordsX + "px";
    }

    if ((windowHeight - clickCoordsY) < menuHeight) {
      this.menu.style.top = windowHeight - menuHeight + "px";
    } else {
      this.menu.style.top = clickCoordsY + "px";
    }
  }

  /**
   * Function to check if we clicked inside an element with a particular class
   * name.
   * 
   * @param {Object} e The event
   * @param {String} className The class name to check against
   * @return {Boolean}
   */
  function clickInsideElement(e, className) {
    var el = e.srcElement || e.target;


    if (el.classList.contains(className)) {
      return el;
    } else {
      while (el = el.parentNode) {
        if (el.classList && el.classList.contains(className)) {
          return el;
        }
      }
    }
    return false;
  }

  /**
   * Get's exact position of event.
   * 
   * @param {Object} e The event passed in
   * @return {Object} Returns the x and y position
   */
  function getPosition(e) {
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;

    if (e.pageX || e.pageY || e.touches[0].pageX || e.touches[0].pageY) {
      posx = e.pageX || e.touches[0].pageX;
      posy = e.pageY || e.touches[0].pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: posx,
      y: posy
    }
  }
  this.init();
}