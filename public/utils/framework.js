const routes = {};

//to add routes to the routes object by specifying a path and a corresponding handler function.
function createRouter() {
  function addRoute(path, handler) {
    routes[path] = handler;
  }
  return {
    addRoute,
  };
}

//creates a link element with the specified text and path and attaches a click event listener to the link. 
function createRouterLink(text, path, className) {
  const link = createA({ href: path, class: className}, text );
  addEventListeners(link, {
    click: (event) => {
      event.preventDefault();
      const newPath = event.target.getAttribute('href');
      navigate(newPath);
    },
  });

  return link;
}

//sets up single page application initial view.
let view = createRouterView(); 

//creates a view element and sets up event handling for route changes.
function createRouterView() {
  const view = createDiv();
  addEventListeners(window, {
    popstate: handleRouteChange,
  });
  return view;
}

//function is called when a route change is detected (either through the popstate event or via navigate). 
function handleRouteChange() {
  const currentPath = window.location.pathname;
  //looks up the route handler for the currentPath by accessing the routes object
  const handler = routes[currentPath];
  if (handler) {
    //removes any existing content within the view
    view.innerHTML = ''; 
    //then calling the route handler function associated with the current route to add a new view
    handler();
  }
}

//updating the browser's URL
function navigate(path) {
  history.pushState(null, null, path);
  handleRouteChange(); 
}

function createElement(type, attributes, ...children) {
  const element = document.createElement(type);

  if (attributes && typeof attributes === 'object') {
    for (const key in attributes) {
      //adding attributes to the element.
      element.setAttribute(key, attributes[key]);
    }
  }

  children.forEach(child => {
    //if the child is an an HTML element.
    if (child instanceof Element) {
      element.appendChild(child);
    } else {
      //if the child is not an HTML element, then adding text content to the element.
      element.appendChild(document.createTextNode(child));
    }
  });

  return element;
}

function addEventListeners(element, eventHandlers) {
  if (eventHandlers) {
    for (const eventName in eventHandlers) {
      //attaching event listener for the event specified in the eventHandlers object. 
      element.addEventListener(eventName, eventHandlers[eventName]);
    }
  }
}

function createSection(attrs, ...children) {
  return createElement('section', attrs, ...children);
}

function createHeader(attrs, ...children) {
  return createElement('header', attrs, ...children);
}

function createFooter(attrs, ...children) {
  return createElement('footer', attrs, ...children);
}

function createH1(text, attrs) {
  return createElement('h1', attrs, text);
}

function createInput(attrs) {
  const input = createElement('input', attrs);
  addEventListeners(input, attrs.eventHandlers); 
  return input;
}

function createDiv(attrs, ...children) {
  return createElement('div', attrs, ...children);
}

function createP(attrs, ...children) {
  return createElement('p', attrs, ...children);
}

function createA(attrs, ...children) {
  return createElement('a', attrs, ...children);
}

function createUl(attrs, ...children) {
  return createElement('ul', attrs, ...children);
}

function createLi(attrs, ...children) {
  return createElement('li', attrs, ...children);
}

function createSpan(attrs, ...children) {
  return createElement('span', attrs, ...children);
}

function createForm(attrs, ...children) {
  return createElement('form', attrs, ...children);
}

function createTextArea(attrs, ...children) {
  return createElement('textarea', attrs, ...children);
}

function createLabel(attrs) {
  const label = createElement('label', attrs);
  label.textContent = attrs.text
  addEventListeners(label, attrs.eventHandlers); 
  return label;
}

function createButton(attrs, text) {
  const button = createElement('button', attrs, text);
  addEventListeners(button, attrs.eventHandlers); 
  return button;
}

const frame = {
  createSection,
  createHeader,
  createFooter,
  createH1,
  createInput,
  createDiv,
  createP,
  createA,
  createUl,
  createLi,
  createSpan,
  createForm, 
  createTextArea,
  createLabel,
  createButton,
  createRouter, 
  createRouterLink, 
  addEventListeners,
}

export default frame;
