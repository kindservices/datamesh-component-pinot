(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const app = "";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function attribute_to_object(attributes) {
  const result = {};
  for (const attribute of attributes) {
    result[attribute.name] = attribute.value;
  }
  return result;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr2, _oldValue, newValue) {
      this[attr2] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}
function create_fragment$3(ctx) {
  let button;
  let t0;
  let t1;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t0 = text("clicks: ");
      t1 = text(
        /*count*/
        ctx[0]
      );
      this.c = noop;
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t0);
      append(button, t1);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*increment*/
          ctx[1]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*count*/
      1)
        set_data(
          t1,
          /*count*/
          ctx2[0]
        );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let count = 0;
  const increment = () => {
    $$invalidate(0, count += 1);
  };
  return [count, increment];
}
class Counter extends SvelteElement {
  constructor(options) {
    super();
    init(
      this,
      {
        target: this.shadowRoot,
        props: attribute_to_object(this.attributes),
        customElement: true
      },
      instance$2,
      create_fragment$3,
      safe_not_equal,
      {},
      null
    );
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
    }
  }
}
customElements.define("my-counter", Counter);
function create_fragment$2(ctx) {
  let main;
  let div4;
  let div3;
  let div2;
  let div1;
  let div0;
  let h2;
  let t0;
  let t1;
  let h3;
  let t2;
  let t3;
  let counter;
  let current;
  counter = new Counter({});
  return {
    c() {
      main = element("main");
      div4 = element("div");
      div3 = element("div");
      div2 = element("div");
      div1 = element("div");
      div0 = element("div");
      h2 = element("h2");
      t0 = text(
        /*card_title*/
        ctx[0]
      );
      t1 = space();
      h3 = element("h3");
      t2 = text(
        /*card_desc*/
        ctx[1]
      );
      t3 = space();
      create_component(counter.$$.fragment);
      this.c = noop;
      attr(div0, "class", "card-title");
      attr(div1, "class", "row");
      attr(div2, "class", "card-body");
      attr(div3, "class", "card");
      attr(div4, "class", "card-container");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div4);
      append(div4, div3);
      append(div3, div2);
      append(div2, div1);
      append(div1, div0);
      append(div0, h2);
      append(h2, t0);
      append(div2, t1);
      append(div2, h3);
      append(h3, t2);
      append(div2, t3);
      mount_component(counter, div2, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & /*card_title*/
      1)
        set_data(
          t0,
          /*card_title*/
          ctx2[0]
        );
      if (!current || dirty & /*card_desc*/
      2)
        set_data(
          t2,
          /*card_desc*/
          ctx2[1]
        );
    },
    i(local) {
      if (current)
        return;
      transition_in(counter.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(counter.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_component(counter);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let { card_title, card_desc } = $$props;
  $$self.$$set = ($$props2) => {
    if ("card_title" in $$props2)
      $$invalidate(0, card_title = $$props2.card_title);
    if ("card_desc" in $$props2)
      $$invalidate(1, card_desc = $$props2.card_desc);
  };
  return [card_title, card_desc];
}
class Card extends SvelteElement {
  constructor(options) {
    super();
    this.shadowRoot.innerHTML = `<style>.card{max-width:350px;border-radius:5px;box-shadow:0 4px 6px 0 #00000033;padding:0 0 10px 0}.card-body{padding:5px 10px}</style>`;
    init(
      this,
      {
        target: this.shadowRoot,
        props: attribute_to_object(this.attributes),
        customElement: true
      },
      instance$1,
      create_fragment$2,
      safe_not_equal,
      { card_title: 0, card_desc: 1 },
      null
    );
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
      if (options.props) {
        this.$set(options.props);
        flush();
      }
    }
  }
  static get observedAttributes() {
    return ["card_title", "card_desc"];
  }
  get card_title() {
    return this.$$.ctx[0];
  }
  set card_title(card_title) {
    this.$$set({ card_title });
    flush();
  }
  get card_desc() {
    return this.$$.ctx[1];
  }
  set card_desc(card_desc) {
    this.$$set({ card_desc });
    flush();
  }
}
customElements.define("my-card", Card);
function create_fragment$1(ctx) {
  let main;
  let div;
  let card;
  let current;
  card = new Card({
    props: {
      card_title: "web component main app",
      card_desc: "whatever"
    }
  });
  return {
    c() {
      main = element("main");
      div = element("div");
      create_component(card.$$.fragment);
      this.c = noop;
      attr(div, "class", "card");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div);
      mount_component(card, div, null);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(card.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(card.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_component(card);
    }
  };
}
class App extends SvelteElement {
  constructor(options) {
    super();
    init(
      this,
      {
        target: this.shadowRoot,
        props: attribute_to_object(this.attributes),
        customElement: true
      },
      null,
      create_fragment$1,
      safe_not_equal,
      {},
      null
    );
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
    }
  }
}
customElements.define("my-app", App);
function create_fragment(ctx) {
  let button;
  let slot;
  let button_class_value;
  return {
    c() {
      button = element("button");
      slot = element("slot");
      this.c = noop;
      attr(button, "class", button_class_value = /*type*/
      ctx[0] == "solid" ? "btn-solid" : "btn-outline");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, slot);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*type*/
      1 && button_class_value !== (button_class_value = /*type*/
      ctx2[0] == "solid" ? "btn-solid" : "btn-outline")) {
        attr(button, "class", button_class_value);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(button);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { type = "solid" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("type" in $$props2)
      $$invalidate(0, type = $$props2.type);
  };
  return [type];
}
class Button extends SvelteElement {
  constructor(options) {
    super();
    this.shadowRoot.innerHTML = `<style>button{padding:10px;color:#fff;font-size:17px;border-radius:5px;border:1px solid #ccc;cursor:pointer}.btn-solid{background:#20c997;border-color:#4cae4c}.btn-outline{color:#20c997;background:transparent;border-color:#20c997}</style>`;
    init(
      this,
      {
        target: this.shadowRoot,
        props: attribute_to_object(this.attributes),
        customElement: true
      },
      instance,
      create_fragment,
      safe_not_equal,
      { type: 0 },
      null
    );
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
      if (options.props) {
        this.$set(options.props);
        flush();
      }
    }
  }
  static get observedAttributes() {
    return ["type"];
  }
  get type() {
    return this.$$.ctx[0];
  }
  set type(type) {
    this.$$set({ type });
    flush();
  }
}
customElements.define("my-button", Button);
new App({
  target: document.getElementById("webcomponent-app")
});
