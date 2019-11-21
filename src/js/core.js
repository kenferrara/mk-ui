/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function (root, factory) {

	if (typeof define === "function" && define.amd) {
		define([], function () {
			return (root.Mk = factory(root));
		});
	}
	else if (typeof module === "object" && module.exports) {

		module.exports = root.document ?

			factory(root) :

			function (w) {
				if (!w.document) {
					throw new Error("Mk[ui] requires a window with a document");
				}
				return factory(w);
			};
	}
	else {
		root.Mk = factory(root);
	}

})(typeof window !== "undefined" && window || this, function (root) {

"use strict";

var prop = ({}).hasOwnProperty;

var noop = function () {};

var Mk = function () {};

Mk.fn = {};


Mk.fn.uid = function () {

    return 'mkxxx4xxyxx'.replace(/[xy]/g, function(c) {

        var r = Math.random() * 16 | 0,
            v = c == 'x' && r || (r&0x3 | 0x8);

        return v.toString(16);
    });
};


Mk.type = function (obj, type) {

    var types = type.toLowerCase().split("|"),
        count = types.length,
        table = Mk.fn.typemap,
        i = 0, fn, ty;

    for (; i < count; i++) {

        ty = types[i];
        fn = prop.call(table, ty) ? table[ty] : table.defaultt;

        if (fn(obj, ty)) {
            return true;
        }
    }
    return false;
};

Mk.fn.typemap = {

    "index": function (o, i) {
        return o.indexOf(i) > -1;
    },

    "array": function (o) {
        return o instanceof Array;
    },

    "empty": function (o) {
        return o === "" || o === null
            || o === void+1 || o === false;
    },

    "null": function (o) {
        return o === null;
    },

    "date": function (o) {
        return o instanceof Date || o === Date;
    },

    "nodelist": function (o) {
        return o instanceof NodeList;
    },

    "node": function (o) {
        return /1|9|11/.test(o && o.nodeType || 0);
    },

    "window": function (o) {
        return o && o === o.window;
    },

    "function": function (o) {
        return typeof o === "function"
            && !Mk.fn.typemap.classlike(o);
    },

    "arraylike": function (o) {

        if (Mk.type(o, "function|string|window")) {
            return false;
        }

        var n = !!o && typeof o.length === "number",
            l = n && "length" in o && o.length;

        return Mk.type(o, "array|nodelist")
            || l === 0 || n && l > 0 && (l - 1) in o;
    },

    "instance": function (o) {

        var p = Object.getPrototypeOf(o),
            c = p && p.hasOwnProperty("constructor") && p.constructor,
            f = ({}).hasOwnProperty.toString;

        return (typeof c === "function" && f.call(c) === f.call(Object)) !== true;
    },

    "descriptor": function (o) {

        var index = Mk.fn.typemap.index,
            keys  = typeof o === "object" && Object.keys(o || {}) || [];

        if (index(keys, "enumerable") && index(keys, "configurable")) {

            if (index(keys, "value")) {
                return index(keys, "writable");
            }

            if (index(keys, "get")) {
                return index(keys, "set");
            }
        }
        return false;
    },

    "classlike": function (o) {
        return typeof o === "function"
            && Object.keys(o.prototype).length > 0;
    },

    "object": function (o) {
        return !!o && typeof o === "object" && !(o instanceof Array);
    },

    "defaultt": function (o, t) {
        return typeof o === t;
    }
};


Mk.fn.each = function (context, obj, callback) {

    var i = 0, count, result;

    if (Mk.type(obj, 'arraylike')) {

        count = obj.length;

        for (; i < count; i++) {

            result = callback.call(context, obj[i], i, obj);

            if (result === false) {
                break;
            }

            if (result === -1) {
                [].splice.call(obj, i, 1);
                i--; count--;
            }
        }
    }

    else {

        for (i in obj) {

            result = callback.call(context, obj[i], i, obj);

            if (result === false) {
                break;
            }

            if (result === -1) {
                delete o[i];
            }
        }
    }

    return context;
};

Mk.fn.first = function (context, obj, callback) {

    var result;

    Mk.fn.each(context, obj, function (o, i, orig) {

        result = callback.call(this, o, i, orig);

        if (result !== void+1) {
            return false;
        }
    });

    return result;
};

Mk.fn.map = function (context, obj, callback) {

    var map, result, i;

    if (Mk.type(obj, 'arraylike')) {

        map = [];

        Array.prototype.map.call(obj, function (o, x, orig) {

            result = callback.call(context, o, x, orig);

            if (result !== void+1) {
                map.push(result);
            }
        });
    }
    else {

        map = {};

        for (i in obj) {

            result = callback.call(context, obj[i], i, obj);

            if (result !== void+1) {
                map[i] = result;
            }
        }
    }

    return map;
};

Mk.fn.filter = function (context, obj, callback) {

    if (Mk.type(obj, 'arraylike')) {
        return Array.prototype.filter.call(obj, function (o, i, orig) {
            return callback.call(context, o, i, orig);
        });
    }

    var result = {}, i;

    for (i in obj) {
        if (callback.call(context, obj[i], i, obj) !== false) {
            result[i] = obj[i];
        }
    }
    return result;
};

/*
    Super light-weight DOM library
    We've chosen to leave jQuery out of the default build
    and use a very light weight roll of common DOM functionality.
    You can always replace this implementation with jQuery or any other
    by:

    1. using AMD, define a module called MkDOM as a dependency of Core.
    2. Vanilla JavaScript, just set window.MkDOM to a different library.

    The Core.$ will be overridden with the new library you've specified.
    Make sure method names for the below are the SAME or current components will break
    on referencing non existent members.

    Members:

    length

    is()
    val()
    each()
    find()
    filter()
    parent() (also does closest)
    hasClass()
    addClass()
    removeClass()
    attr()
    prop()
    data()
    html()
    text()
    markup()
    appendTo()
    prependTo()
    append()
    prepend()
    remove()
    on()
    one()
    off()
    emit()
    ajax()
*/

function $(selector, context) {
    return this.find(selector, context);
}

$.cache = {};


$.data = function (node, key, value) {

    // get/create a unique id for our node
    // for memory leaks, we only assign a string to the node,
    // the object is kept entirely seperate
    var id = node._id_ || Mk.fn.uid(),
        // default out the value.
        val = value,
        // pull the cache object or create a new empty primitive
        cache = $.cache[id] || {};

    // if the key is explicitly null, we want to remove the entire cache entry.
    // remove the node id, and delete the cache. Finally, return it to
    // the user for future use.

    if (key === null) {
        node._id_ = null;
        delete $.cache[id];

        return cache;
    }

    // if the value is explicitly null we want to remove that entry.
    // assign the entry to val then delete it from the larger cache entry.

    if (val === null) {
        val = cache[key];
        delete cache[key];

        return val;
    }

    // if value is undefined, we want to pull from cache
    // or if node is a legit DOM node, pull from a data attribute.
    // we are not going to cache data attributes here because they may change.

    if (val === void+1) {

        val = cache[key];

        if (val === void+1 && /1|9|11/.test(node.nodeType)) {
            val = node.getAttribute('data-' + key) || undefined;
        }
    }

    // finally, we're just going to set the cache entry to
    // our value. Nothing crazy to see here.

    else {
        cache[key] = val;
    }

    // reassign the id incase this is the first entry
    node._id_ = id;
    // reassign the cache in case this is the first entry
    $.cache[id] = cache;

    return val;
}


$.wrap = {
    option: [1, '<select multiple="multiple">', '</select>'],
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    li: [1, '<ul>', '</ul>'],
    dd: [1, '<dl>', '</dl>'],
    defaultt: [ 0, '', '']
};

$.wrap.optgroup  = $.wrap.option;
$.wrap.caption   = $.wrap.thead;
$.wrap.tbody     = $.wrap.thead;
$.wrap.tfoot     = $.wrap.thead;
$.wrap.dt        = $.wrap.dd;

$.markup = function (s) {

    var d = document;

    if (!s) {
        return d.createDocumentFragment();
    }

    // html5 templates
    // most browsers support this method and
    // is much faster than the latter.
    var c = d.createElement('template'),
        f, p;

    if (c.content) {
        c.innerHTML = s;
        return c.content;
    }

    // Sadly, buy as expected, Internet Explorer doesn't support
    // templates so we get to insert inner html and rip out the children.
    var t = (/^\s*<([^>\s]+)/.exec(s) || [])[1] || null,
        a = t && $.wrap.hasOwnProperty(t) && $.wrap[t] || $.wrap.defaultt,
        i = 0;

    c = d.createElement('div');
    c.innerHTML = a[1] + s + a[2];

    p = c.firstChild;
    f = d.createDocumentFragment();

    while (i < a[0]) {
        p = p.firstChild;
        i++;
    }

    if (p) {
        f.appendChild(p);
    }

    return f;
};


$.remove = function (node) {

    // we are only dealing with node types of 1 (element) and 11 (fragment)
    // 9 (document) gets ignored

    if (node && (node.nodeType === 1 || node.nodeType === 11)) {

        // recursively look children and call remove
        // we do this because of the following steps

        var children = node.childNodes,
            l = children.length;

        while (l--) {
            $.remove(children[l]);
        }

        // pull the data entry and remove it from cache
        // frees up memory

        var data = $.data(node, null);

        // loop events associated with the node and remove all listeners
        // frees up memory

        if (data && data.events) {
            Mk.fn.each(this, data.events, function (obj, type) {
                $.events.off(node, type);
            });
        }
    }

    // finally, remove the element
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}


$.events = {
    //
    // delegation events for certain event types
    // require the capture boolean to be set to true.
    capture: function (type, del) {

        if (del) {
            switch (type) {
                case "mouseenter":
                case "mouseleave":
                case "blur":
                case "focus":
                    return true;
            }
        }

        return false;
    },

    delegate: function (parent, e, selector) {

        var node = e.target,
            result = {
            // are we allowed to invoke the handler with
            // these perticular parameters??
            allowed: false,
            // default target will be the parent node, which
            // is really just the element with the bound event
            target: parent
        };

        // if we have no delegate selector,
        // allow the event to be invoked with the original node
        // being the target element.
        if (!selector) {
            result.allowed = true;
        }
        else {
            // crazyness for event capturing
            // (ie: delegate focus/blur mouseenter/leave events)
            if (e.toElement) {

                var n = new $(e.toElement, parent),
                    f = new $(e.fromElement, parent);

                if ((n.is(selector) && f.parent(e.toElement).length)
                    || (f.is(selector) && n.parent(e.fromElement).length)) {
                    return result;
                }
            }
            // we're dealing with a delegate
            // find the selector elements in the target parent,
            // loop them, and look for exact matches.
            // if found, set the new target and allow the event to invoke
            new $(selector, parent).each(function (el) {

                if (node === el || new $(node).parent(el).length) {

                    result.allowed = true;
                    result.target = el;
                    return false;
                }
            });
        }
        return result;
    },

    // on
    // set an event handler onto an element.
    // supports delegates and namespaces.

    on: function (node, type, delegate, handler, single) {

        var parts = type.split('.');

        this.add({
            node: node,
            type: parts.shift(),
            namespace: parts.join('.'),
            handler: handler,
            single: single || false,
            delegate: typeof delegate === 'string' ? delegate : undefined,
            capture: typeof delegate === 'boolean' ? delegate : undefined
        });
    },

    // off
    // remove a handler or batch of handlers from an element.
    // supports namespaces.

    off: function (node, type, handler) {

        var parts = type.split('.');

        this.remove({
            node: node,
            type: parts.shift(),
            namespace: parts.join('.'),
            handler: handler
        });
    },

    // emit
    // trigger an event on an element.
    // supports namespaces

    emit: function (node, type, data) {

        var parts = type.split('.'),
            event = new Event(parts.shift());

        event.namespace = parts.join('.');
        event.data = data || [];

        node.dispatchEvent(event);
    },

    // find a perticular event stored in the cache
    // object for element events ($.data).

    find: function (node, type, id) {

        var events = $.data(node, 'events') || {},
            handlers = events[type] || [];

        return Mk.fn.first(this, handlers, function (handler) {
            if (handler.id === id) return handler;
        });
    },

    // add
    // internal event for binding listeners
    // creates a new handler which will accept delegates
    // namespaces and single (one) bindings.
    // currently the only pointer is 'id' which is a string (yay)

    add: function (obj) {

        var
        id = Mk.fn.uid(),
        node = obj.node,
        type = obj.type,
        events = $.data(node, 'events') || {},
        capture = obj.capture || this.capture(type, obj.delegate),

        handler = function (e) {

            var event = $.events.find(this, e.type, id),
                trigger = $.events.delegate(this, e, event.delegate),
                invoke = false,
                result;

            if (e.namespace) {
                if (e.namespace === event.namespace && trigger.allowed) {
                    invoke = true;
                }
            }
            else if (trigger.allowed) {
                invoke = true;
            }

            if (invoke) {

                if (event.single) {
                    $.events.remove({
                        node: this,
                        add: false,
                        type: event.type,
                        handler: event.original,
                        namespace: event.namespace
                    });
                }

                result = event.original.apply(trigger.target, [e].concat(e.data));
            }

            return result;
        };

        events[type] = events[type] || [];

        events[type].push({
            type: type,
            capture: capture,
            namespace: obj.namespace,
            original: obj.handler,
            delegate: obj.delegate,
            handler: handler,
            single: obj.single,
            id: id
        });

        $.data(node, 'events', events);

        node.addEventListener(type, handler, capture);
    },

    // remove
    // internal method for removing event listeners or an
    // entire batch of events based on type. Can also remove events
    // based on type + namespace.

    remove: function (obj) {

        var node = obj.node,
            type = obj.type,
            func = obj.handler,
            ns = obj.namespace,

            events = $.data(node, 'events') || {},
            handlers = events[type] || [];

        Mk.fn.each(this, handlers, function (handler) {
            if (!ns || handler.namespace === ns) {
                if (!func || func === handler.original) {
                    node.removeEventListener(type, handler.handler, handler.capture);
                    return -1;
                }
            }
        });
    }
};


$.prototype = {

    length: 0,

    context: null,

    constructor: $,

    toFrag: function () {

        var f = document.createDocumentFragment();

        this.each(function (el) {
            f.appendChild(el);
        });

        return f;
    },

    nv: function (name, value, fn) {

        if (typeof name === 'object') {

            var k = Object.keys(name),
                l = k.length, i;

            return this.each(function (el) {

                i = 0;

                for (; i < l; i++) {
                    fn(el, k[i], name[k[i]]);
                }
            });
        }

        if (value === void+1) {
            return this.length ? fn(this[0], name, value) : undefined;
        }

        return this.each(function (el) {
            fn(el, name, value);
        });
    },

    first: function () {

        var reg = /1|9|11/, i = 0, l, n;

        if (this.length) {

            l = this.length;

            while (i < l) {

                n = this[i];
                i++;

                if (reg.test(n.nodeType)) {
                    return n;
                }
            }
        }

        return undefined;
    },

    last: function () {

        var reg = /1|9|11/, n, l;

        if (this.length) {

            l = this.length;

            while (l--) {

                n = this[l]

                if (reg.test(n.nodeType)) {
                    return n;
                }
            }
        }

        return undefined;
    },

    each: function (fn) {

        var i = 0,
            l = this.length,
            r;

        while (i < l) {

            r = fn.call(this, this[i], i++);

            if (r === false) break;
        }

        return this;
    },

    index: function (i) {

        if (typeof i !== 'number' && this.length) {

            var el = this[0],
                children = el.parentNode && el.parentNode.childNodes || [];

            for (var i = 0, l = children.length; i < l; i++) {
                if (children[i] === el) return i;
            }
            return 0;
        }

        return this.length > i && this[i] || undefined;
    },

    find: function (s, c) {

        var d = document, n

        c = c || this.length && this
            || this.length !== void+1 && this.context
            || [d];

        if (c === this) {
            return new $(s, c);
        }

        if (Mk.type(c, 'string')) {
            c = new $(c, d);
        }
        else if (c.nodeType) {
            c = [c];
        }

        n = s;

        if (Mk.type(s, 'string')) {

            if (/^\s*<([^>\s]+)/.test(s)) {
                n = this.markup(s);
            }
            else {

                n = [];

                Mk.fn.each(this, c, function (el) {
                    n = n.concat([].slice.call(el.querySelectorAll(s)));
                });
            }
        }

        if (n && /1|9|11/.test(n.nodeType)) {
            n = [n];
        }

        if (Mk.type(n, 'arraylike')) {
            n = [].slice.call(n);
        }

        [].splice.call(this, 0, this.length || 0);

        if (n) {
            [].push.apply(this, n);
        }

        this.context = c;

        return this;
    },

    is: function (selector) {

        var elems = new $(selector, this.context),
            result = false;

        this.each(function (el) {

            elems.each(function (_el) {

                if (el === _el) {
                    result = true;
                    return false;
                }
            });

            if (result) {
                return false;
            }
        });

        return result;
    },

    filter: function (s) {

        var elems = new $(s, this.context),
            filtered = [];

        this.each(function (el) {
            elems.each(function (_el) {
                if (el === _el) filtered.push(el);
            });
        });
        return new $(filtered, this.context);
    },

    parent: function (s, c) {

        var p = [], ps;

        if (arguments.length) {

            ps = new $(s, c);

            this.each(function (el) {

                while (el.parentNode) {
                    ps.each(function (_el) {

                        if (_el === el.parentNode) {

                            if (p.indexOf(_el) < 0) {
                                p.push(_el);
                            }
                            return false;
                        }
                    });
                    el = el.parentNode;
                }
            });
        }
        else {
            this.each(function (el) {
                if (el.parentNode) p.push(el.parentNode);
            });
        }
        return new $(p);
    },

    closest: function (selector, context) {
        return this.parent(selector, context);
    },

    markup: function (str) {

        var m = $.markup(str);
        return m.childNodes;
    },

    html: function (str) {

        if (str === void+1) {

            var elem = this.first();

            return elem && elem.innerHTML || '';
        }

        return this.each(function (el) {

            var children = el.childNodes,
                l = children.length;

            while (l--) {
                $.remove(children[l]);
            }

            el.appendChild($.markup(str));
        });
    },

    text: function (text) {

        if (text === void+1) {

            var elem = this.first();

            return elem && elem.textContent || '';
        }

        return this.each(function (el) {
            el.textContent = text;
        });
    },

    removeAttr: function (name) {

        return this.each(function (el) {
            el.removeAttribute(name);
        });
    },

    attr: function (name, value) {

        return this.nv(name, value, function (el, n, v) {

            if (v === void+1) {
                return el.getAttribute(n);
            }
            el.setAttribute(n, v);
        });
    },

    prop: function (name, value) {

        return this.nv(name, value, function (el, n, v) {

            if (v === void+1) {
                return el[n] || undefined;
            }
            el[n] = v;
        });
    },

    val: function (value) {

        if (value === void+1 && this.length) {
            return this[0].value;
        }

        return this.each(function (el) {
            el.value = value;
        });
    },

    data: function (name, value) {

        return this.nv(name, value, function (el, n, v) {

            if (v === void+1 || v === null) {
                return $.data(el, n, v);
            }
            $.data(el, n, v);
        });
    },

    css: function (name, value) {

        return this.nv(name, value, function (el, n, v) {
            if (v === void+1) {
                return getComputedStyle(el).getPropertyValue(v);
            }
            el.style[n] = typeof v === 'number' && v + 'px' || v;
        });
    },

    hasClass: function (cls) {

        var r = false;
        var that = this;
        
        this.each(function (el) {
            r = el.classList ? el.classList.contains(cls) :
                (el.className && el.className.trim().split(/\s+/g).indexOf(cls) > -1);

            if (r) return false;
        });

        return r;
    },

    addClass: function (value) {

        var values = value.split(' '), c;

        return Mk.fn.each(this, values, function (v) {

            this.each(function (el) {

                if (el.classList) {
                    el.classList.add(v);
                    return;
                }

                if (!Mk.$(el).hasClass(v)) {
                    el.className = (el.className || '').trim() + ' ' + v.trim();
                }
            });
        });
    },

    removeClass: function (value) {

        var values = value.split(' '), c, _v;
        return Mk.fn.each(this, values, function (v) {
            this.each(function (el) {

                if (el.classList) {
                    el.classList.remove(v);
                    return;
                }

                wrdBndryRegexp = new RegExp('\\b' + v.trim() + '\\b');
                wrdBndryRegexp2 = new RegExp('\\b ' + v + '\\b');

                el.className = el.className.replace(wrdBndryRegexp2, '')
                    .replace(wrdBndryRegexp, '').trim();
            });
        });
    },

    appendTo: function (selector, context) {

        var elem = new $(selector, context).last();

        if (elem) {
            elem.appendChild(this.toFrag());
        }
        return this;
    },

    prependTo: function (selector, context) {

        var elem = new $(selector, context).last(),
            frag = this.toFrag();

        if (elem) {
            elem.firstChild
                ? elem.insertBefore(frag, elem.firstChild)
                : elem.appendChild(frag);
        }
        return this;
    },

    append: function (selector, context) {

        var elem = this.last();

        if (elem) {
            elem.appendChild(
                new $(selector, context).toFrag());

        }
        return this;
    },

    prepend: function (selector, context) {

        var elem = this.last(), frag;

        if (elem) {

            frag = new $(selector, context).toFrag();

            elem.firstChild
                ? elem.insertBefore(frag, elem.firstChild)
                : elem.appendChild (frag);
        }
        return this;
    },

    remove: function (selector) {

        var o = this, e;

        if (selector) {
            o = new $(selector, this);
        }

        o.each(function (el) {
            $.remove(el);
        });

        return this;
    },

    focus: function () {

        var elem = this.last();

        if (elem) {
            elem.focus();
        }
        return this;
    },

    blur: function () {

        var elem = this.last();

        if (elem) {
            elem.blur();
        }
        return this;
    },

    on: function (type, delegate, handler, single) {

        if (!handler) {
            handler = delegate;
            delegate = null;
        }
        return this.each(function (el) {
            $.events.on(el, type, delegate, handler, single);
        });
    },

    one: function (type, delegate, handler) {
        return this.on(type, delegate, handler, true);
    },

    off: function (type, handler) {
        return this.each(function (el) {
            $.events.off(el, type, handler);
        });
    },

    emit: function (type, data) {
        return this.each(function (el) {
            $.events.emit(el, type, data);
        });
    }
};


Mk.$ = function (selector, context) {
    return new $(selector, context);
};

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

Mk.extend = function (to, from, name) {

    var prop;

    if (Mk.type(name, 'undefined')) {

        for (prop in from) {
            Mk.extend(to, from, prop);
        }
    }
    else {

        prop = Object.getOwnPropertyDescriptor(from, name);

        // cannot access getters/setters with obj[prop] notation or an exception
        // will be thrown due to accessors on the prototype but not in actual context.
        // so for getters and setters we must do this.
        if (prop && (prop.get !== void+1 || prop.set !== void+1)) {
            Object.defineProperty(to, name, prop);
        }
        else {
            // everybody else goes here.
            // In this case, the descriptor has a 'value' property.
            // The value can be writable, and configurable or not, if it is not,
            // we want to leave the value alone. If it is, we want to pull out the raw value and reset it.
            Mk.property(to, name, prop.writable ? prop.value : prop);
        }
    }
    return this;
};

Mk.property = function (obj, name, value) {

    var prop = value,
        func;

    if (Mk.type(value, 'function')) {

        func = Mk.fn.wrapFunction(value, name);

        prop = {
            enumerable: true,
            configurable: true,
            get: function () {
                return func;
            },
            set: function (newvalue) {

                if (Mk.type(newvalue, 'function')) {
                    func = Mk.fn.wrapFunction(newvalue, name);
                    return;
                }
                func = newvalue;
            }
        };
    }

    if (!Mk.type(prop, 'descriptor')) {
        prop = {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true,
        };
    }

    Object.defineProperty(obj, name, prop);

    return this;
};

Mk.fn.wrapFunction = function (func, name) {

    if (func._id_) {
        return func;
    }

    var wrap = function () {

        this._pushSuper(name);
        var result = func.apply(this, arguments);
        this._popSuper(name);
        return result;
    };

    wrap._id_ = Mk.fn.uid();

    wrap.toString = function () {
        return func.toString();
    };

    return wrap;
};

Mk.fn.pushSuper = function (name) {
    this._chain_ = this._chain_ || [];
    this._chain_.push(name);
};

Mk.fn.popSuper = function (name) {
    this._chain_.splice(
        this._chain_.lastIndexOf(name), 1);
};


Mk.fn.template = {

    xWhitespace: /[\r|\t|\n]+/g,

    xStatements: /{{([^}]+)}}(.*)({{\/\1}})/g,

    xInjections: /{{([^{]+)}}/g,

    markup: {
        highlight: '<span class="highlight">$1</span>',
        error: '<span class="error">{{template}} not found</span>'
    },

    parse: function (name, key, templates, data) {

        name = name || '';

        data = data || {};
        data.$key = key;

        templates = templates || {};

        var me = this;

        return me.get(name, templates)

        .replace(me.xWhitespace, '')

        .replace(me.xStatements, function (str, code, content) {
            return me.statements(str, key, code, content, templates, data);
        })

        .replace(me.xInjections, function (str, code) {
            return me.inject(str, key, code, templates, data);
        });
    },

    get: function (name, template) {

        var tmp = name;

        if (template && prop.call(template, name)) {
            tmp = template[name];
        }

        if (tmp instanceof Array) {
            tmp = tmp.join('');
        }

        return tmp;
    },

    statements: function (str, key, code, content, templates, data) {

        var parts = code.split(':'),
            map = parts[0],
            point = parts[1];

        if (prop.call(this.map, map)) {
            return this.map[ map ](
                content,
                key,
                templates,
                map == 'if' ? data : (data[ point ] || data),
                point);
        }

        return '';
    },

    inject: function (str, key, code, templates, data) {

        var parts = code.split( ':' ),
            map = parts[ 0 ],
            point = parts[ 1 ];

        if (point && prop.call(this.map, map)) {
            return this.map[map](
                point,
                key,
                templates,
                data,
                point);
        }

        if (prop.call(data, map)
            && !Mk.type(data[map], 'undefined|null')) {
            return data[map];
        }

        return '';
    },

    map: {

        'loop': function (name, key, templates, data, point) {

            var tmp = Mk.fn.template,
                buffer = [], i = 0,
                l, dp, x;

            if (/^\d+$/.test(point)) {

                l = parseInt(point, 10);

                for(; i < l; i++) {
                    data.$index = i;
                    buffer.push(tmp.parse(name, key, templates, data));
                }
                delete data.$index;
            }
            else if (Mk.type(data, 'arraylike')) {

                l = data.length;

                for(; i < l; i++) {

                    dp = data[i];

                    if (!Mk.type(dp, 'object')) {
                        dp = {key: '', value: dp};
                    }

                    dp.$index = i;

                    buffer.push(tmp.parse(name, key, templates, dp));

                    delete dp.$index;
                }
            }
            else {

                x = 0;

                for (l in data) {
                    buffer.push(tmp.parse(name, key, templates, {
                        key: l,
                        value: data[i],
                        $index: x++
                    }));
                }
            }
            return buffer.join('');
        },

        'if': function (name, key, templates, data, point) {

            if (prop.call(data, point)) {

                var dp = data[point];

                if ((!Mk.type(dp, 'empty'))
                    || (dp instanceof Array && dp.length > 0)) {
                    return Mk.fn.template.parse(name, key, templates, data);
                }
            }
            return '';
        },

        'unless': function(name, key, templates, data, point) {

            if (prop.call(data, point)) {

                var dp = data[point];

                if (dp !== undefined && dp === false) {
                    return Mk.fn.template.parse(name, key, templates, data);

                }
            }
            return '';
        },

        'highlight': function (name, key, templates, data, point) {

            var tmp = Mk.fn.template,
                str = data[point],
                hlt = data.highlight || '',
                htm;

            if (hlt) {
                htm = tmp.get('highlight', tmp.markup);
                //string escape patterns throw errors
				//so we must replace the escape character with doubles.
                str = str.replace(new RegExp('(' + hlt.replace(/\\/g, '\\\\') + ')', 'gi'), htm);
            }
            return str;
        },

        'scope': function (name, key, templates, data) {
            return Mk.fn.template.parse(name, key, templates, data);
        },

        'template': function (name, key, templates, data) {
            return Mk.fn.template.parse(name, key, templates, data);
        }
    }
};

Mk.fn.eventEmitter = {

    add: function (obj) {

        var bucket = obj.bucket,
            event = this.event(obj.type);

        obj.namespace = event.namespace;
        obj.type = event.type;

        if (!prop.call(bucket, event.type)) {
             bucket[event.type] = [];
        }

        bucket[event.type].push({
            namespace: event.namespace,
            type: event.type,
            handler: obj.handler,
            context: obj.context,
        });
    },

    event: function (type) {

        return {
            type: /^(\w+)\.?/.exec(type)[1] || '',
            namespace: (/^\w+(\.?.*)$/.exec(type) || [])[1] || undefined
        };
    },

    args: function (args) {

        return Mk.fn.map(this, args, function (o) {
            return o;
        });
    },

    on: function on(obj) {
        return this.add(obj);
    },

    one: function(obj) {
        obj.single = true;
        return this.add(obj);
    },

    off: function off (obj, b, ev, h) {

        var bucket = obj.bucket,
            handler = obj.handler,
            event = this.event(obj.type);

        if (prop.call(bucket, event.type)) {

            var handlers = bucket[event.type],
                noHandler = Mk.type(handler, 'undefined'),
                namespace = event.namespace,
                count = handlers.length,
                i = 0, item;

            for (; i < count; i++) {

                item = handlers[i];

                if (item.namespace === namespace && (noHandler || handler === item.handler)) {
                    handlers.splice(i, 1);
                    count--; i--;
                }
            }
        }
    },

    emit: function emit (bucket, argz /* arguments */) {

        var args = this.args(argz),
            type = args.shift(),
            event = this.event(type);

        if (prop.call(bucket, event.type)) {

            var namespace = event.namespace,
                handlers = bucket[event.type],
                count = handlers.length,
                i = 0, item;

            for (; i < count; i++) {

                item = handlers[i];

                if (!namespace || item.namespace === namespace) {

                    item.handler.apply(item.context || root, args);

                    if (item.single) {
                        handlers.splice(i, 1);
                        count--; i--;
                    }
                }
            }
        }
    }
};


//
// transition
//
// Give us our browser transition key if
// transitions are enabled
// --------------------------------------------------

Mk.transitions = {

    _enabled: false,

    _key: null,

    _keys: {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    },

    get enabled () {
        return this._enabled;
    },

    get disabled () {
        return this._enabled !== true;
    },

    get key () {

        if (this.enabled) {

            if (this._key) {
                return this._key;
            }

            var keys = this._keys,
                el = document.createElement('xanimate'), t;

            for (t in keys) {
                if (!Mk.type(el.style[t], 'undefined')) {
                    return this._key = keys[t];
                }
            }
        }
        return void+1;
    },

    enable: function () {
        return this._enabled = true;
    },

    disable: function () {
        return this._enabled = false;
    }
};


Mk.fn.keycodes = {
    backspace: 8, tab: 9, enter: 13, esc: 27, space: 32,
    pageup: 33, pagedown: 34, end: 35, home: 36,
    left: 37, up: 38, right: 39, down: 40, comma: 188
};


Mk.define = function (namespace, obj) {

    var base = Mk,
        parts = namespace.split( '.' ),
        count = parts.length - 1,
        i = 0;

    for (; i < count; i++) {
        if (!prop.call(base, parts[i])) {
            base[parts[i]] = {};
        }
        base = base[parts[i]];
    }
    return base[parts[count]] = obj;
};

Mk.get = function (namespace) {

    var parts = namespace.split('.'),
        count = parts.length,
        base = Mk,
        obj = null,
        i = 0;

    for (; i < count; i++) {
        if (prop.call(base, parts[i])) {
            obj = base[parts[i]];
            base = obj;
        }
        else {
            obj = null;
        }
    }
    return obj;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base === 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var obj = function () {
        this.init.apply(this, arguments);
        return this;
    };

    obj.prototype = Object.create(base.prototype);

    Mk.extend(obj.prototype, proto);

    //TODO: add static members

    obj.prototype.constructor = obj;

    obj.prototype._super_ = base;
    obj.prototype._chain_ = null;

    return this.define(name, obj);
};


Mk.prototype = {
    /*
        <property:name>
            <desc>Unique name used for each object derived from Mk. This name will be used in templating signatures, markup, event emitters, and selectors.</desc>
        </property:name>
    */
    name: '',

    constructor: Mk,
    /*
        <property:templates>
            <desc>Contains default templates for generating markup. See the Templates section for more details.</desc>
        </property:templates>
    */
    templates: {},
    /*
        <property:formats>
            <desc>Contains default formats for text. See the Templates section for more details.</desc>
        </property:formats>
    */
    formats: {},
    /*
    <property:config>
        <desc>Configuration object of settings built of attributes and parameters passed into each instance.</desc>
    </property:config>
    */
    config: null,
    /*
    <property:events>
        <desc>Event Emitter handlers are stored here.</desc>
    </property:events>
    */
    events: null,
    /*
    <property:root>
        <desc>The root elements passed in as the first parameter to each instance of an Mk object.</desc>
    </property:root>
    */
    root: null,
    /*
    <property:deviceExp>
        <desc>Expression used to check the user agent for device patterns.</desc>
    </property:deviceExp>
    */
    deviceExp: /(android|nexus|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

    get _pushSuper () {
        return Mk.fn.pushSuper;
    },

    get _popSuper () {
        return Mk.fn.popSuper;
    },
    /*
    <property:super>
        <desc>The super is a property as well as a function. It is dynamic in that it will return you the same super method as derived method you are invoking, but in correct context. Super is also recursive and can be chained down until you reach the Core object, Mk.</desc>
    </property:super>
    */
    get super () {

        var p = this,
            c = p._chain_ || [],
            m = c[c.length - 1],
            d = c.reduce(function(a, b) {
                if (b === m) a++;
                return a;
            }, 0);

        while (d--) {
            p = p._super_.prototype;
        }

        if (p && prop.call(p, m)) {
            return p[m];
        }
        return null;
    },
    /*
    <property:keycode>
        <desc>Object containing friendly named keycodes for keyboard events.</desc>
    </property:keycode>
    */
    get keycode () {
        return Mk.fn.keycodes;
    },
    /*
    <property:transitions>
        <desc>Boolean representing if transitions are turned on or not.</desc>
    </property:transitions>
    */
    get transitions () {
        return Mk.transitions.enabled;
    },
    /*
    <property:version>
        <desc>Current version.</desc>
    </property:version>
    */
    get version () {
        return 'v1.0.0';
    },
    /*
    <property:element>
        <desc>The root as a raw Node.</desc>
    </property:element>
    */
    get element () {
        return this.root[0];
    },
    /*
    <property:device>
        <desc>Returns device API. See Device for more details.</desc>
    </property:device>
    */
    get device () {
        return this.deviceExp.test(navigator.userAgent);
    },
    /*
    <property:devicekey>
        <desc>Key pulled from user agent for general device name checking (iphone, android, ipad, etc).</desc>
    </property:devicekey>
    */
    get devicekey () {

        var ua = navigator.userAgent,
            match = (this.deviceExp.exec(ua) || [])[1] || '';

        return match.toLowerCase();
    },
    /*
    <method:$>
        <invoke>.$(selector, context)</invoke>
        <param:selector>
            <type>Mixed - String/Node/NodeList/Wrapper</type>
            <desc>A selector, Node, NodeList, or wrapped ($) node.</desc>
        </param:selector>
        <param:context>
            <type>Mixed - String/Node/Wrapper</type>
            <desc>A parent selector, node, or wrapped ($) node.</desc>
        </param:context>
        <desc>Custom Mk DOM manipulation wrapper. Think minimalistic jQuery.</desc>
    </method:$>
    */
    $: function (selector, context) {
        return Mk.$(selector, context);
    },
    /*
    <method:uid>
        <invoke>.uid()</invoke>
        <desc>Generates a unique id.</desc>
    </method:uid>
    */
    uid: function () {
        return Mk.fn.uid();
    },
    /*
    <method:template>
        <invoke>.template(name, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the template.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to template parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured tempates and returns parse string.</desc>
    </method:template>
    */
    template: function (name, data) {
        return Mk.fn.template.parse(
            name, this.name, this.config.templates, data);
    },
    /*
    <method:format>
        <invoke>.format(name, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the format.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to format parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured formats and returns parse string.</desc>
    </method:format>
    */
    format: function (name, data) {
        return Mk.fn.template.parse(
            name, this.name, this.config.formats, data);
    },
    /*
    <method:html>
        <invoke>.html(template, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the template.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to template parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured templates and returns a wrapped ($) Node/DocumentFragment.</desc>
    </method:html>
    */
    html: function (templateOrMarkup, data) {
        return this.$(this.template(templateOrMarkup, data));
    },
    /*
    <method:each>
        <invoke>.each(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loops objects and array-like objects running a function on each iteration. Return false to break loop. Return -1 to splice/delete item from object.</desc>
    </method:each>
    */
    each: function (o, f) {
        return Mk.fn.each(this, o, f);
    },
    /*
    <method:first>
        <invoke>.first(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loops objects and array-like objects running a function on each iteration. The first value to be returned will stop loop and assign from callback.</desc>
    </method:first>
    */
    first: function (o, f) {
        return Mk.fn.first(this, o, f);
    },
    /*
    <method:map>
        <invoke>.map(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loop objects and array-like objects and return a value on each iteraction to be 'mapped' to a new object (like Array's map). Return nothing, or undefined, to exclude adding anything for that iteration.</desc>
    </method:map>
    */
    map: function (o, f) {
        return Mk.fn.map(this, o, f);
    },
    /*
    <method:filter>
        <invoke>.filter(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loop objects and array-like objects and return true or false to specify whether to filter the element out of the new return object. (like Array's filter).</desc>
    </method:filter>
    */
    filter: function (o, f) {
        return Mk.fn.filter(this, o, f);
    },
    /*
    <method:node>
        <invoke>.node(selector[, context])</invoke>
        <param:selector>
            <type>String</type>
            <desc>A selector to be run through the selector() prefixer.</desc>
        </param:selector>
        <param:context>
            <type>Mixed</type>
            <desc>Selector/Node/Wrapped ($) Node to be used as context element. Default is root.</desc>
        </param:context>
        <desc>Shadow nodes created by Mk components have prefixed names. This method runs your selector through the prefixed name and root context to easily find your element.</desc>
    </method:node>
    */
    node: function (selector, context) {
        return this.$(this.selector(selector), context || this.root || null);
    },
    /*
    <method:selector>
        <invoke>.selector(name)</invoke>
        <param:key>
            <type>String</type>
            <desc>A selector to be prefixed with component naming.</desc>
        </param:key>
        <desc>Takes a base string selector (ie: 'list') and returns the component's true selector (ie: mk-core-list).</desc>
    </method:selector>
    */
    selector: function (key) {
        return '.' + this.name + (key && '-' + key || '');
    },
    /*
    <method:transition>
        <invoke>.transition(node, handler)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node to bind transition event handler on.</desc>
        </param:node>
        <param:handler>
            <type>Function</type>
            <desc>Event handler to be bound.</desc>
        </param:handler>
        <desc>Binds transition event to a node(s). If transitions are disabled, or not supported, handler is executed in setTimeout (1 millisecond).</desc>
    </method:transition>
    */
    transition: function (node, cb) {

        var  n = this.$(node),
             t = Mk.transitions.key,
             c = this;

        if (t) {

            n.addClass('transition');
            n.one(t, function (e) {
                n.removeClass('transition');
                cb.call(c, e, n);
            });

            return this;
        }

        n.removeClass('transition');

        return this.each(n, function (el) {
            this.delay(function () {
                cb.call(this, null, this.$(el));
            }, 1);
        });
    },
    /*
    <method:clearTransitions>
        <invoke>.clearTransitions(node)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node to bind transition event handler on.</desc>
        </param:node>
        <desc>Clear transition handlers on node.</desc>
    </method:clearTransitions>
    */
    clearTransitions: function (node) {

        var t = Mk.transitions.key;

        if (t) {
            this.$(node).off(t).removeClass('transition');
        }
        return this;
    },
    /*
    <method:transitioning>
        <invoke>.transitioning(node)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node.</desc>
        </param:node>
        <desc>Returns true if element is currently transitioning. False for anything else.</desc>
    </method:clearTransitions>
    */
    transitioning: function (node) {
        return this.$(node).hasClass('transition');
    },
    /*
    <method:delay>
        <invoke>.delay(fn[, milliseconds])</invoke>
        <param:fn>
            <type>Function</type>
            <desc>Function to be invoked when delay ends.</desc>
        </param:fn>
        <param:milliseconds>
            <type>Number</type>
            <desc>Number of milliseconds for the timer. Default is 1.</desc>
        </param:milliseconds>
        <desc>Runs a timer on invoking a function. Useful for rendering race conditions and transition effects. For rendering race conditions, no milliseconds are necessary as the default (1) handles that.</desc>
    </method:delay>
    */
    delay: function (fn, ms) {

        var c = this, t;

        t = setTimeout(function () {

            fn.call(c);

            clearTimeout(t);
            t = null;

        }, ms || 1);

        return t;
    },
    /*
    <method:on>
        <invoke>.on(event, handler)</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Handler to invoke when event type has been emit.</desc>
        </param:handler>
        <desc>Binds a handler to an event type through the Event Emitter. Allows for namespaced events.</desc>
    </method:on>
    */
    on: function (type, handler) {

        Mk.fn.eventEmitter.on({
            bucket: this.events,
            type: type,
            handler: handler,
            context: this
        });

        return this;
    },
    /*
    <method:one>
        <invoke>.one(event, handler)</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Handler to invoke when event type has been emit.</desc>
        </param:handler>
        <desc>Binds a handler to an event type through the Event Emitter. Once fired, an event bound through one() will be removed. Allows for namespaced events.</desc>
    </method:one>
    */
    one: function (type, handler) {

        Mk.fn.eventEmitter.one({
            bucket: this.events,
            type: type,
            handler: handler,
            context: this
        });

        return this;
    },
    /*
    <method:off>
        <invoke>.off(event[, handler])</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Optional handler to remove. Defaults to remove all handlers for event type.</desc>
        </param:handler>
        <desc>Removes a handler (or all handlers) from an event type.</desc>
    </method:off>
    */
    off: function (type, handler) {

        Mk.fn.eventEmitter.off({
            bucket: this.events,
            type: type,
            handler: handler
        });

        return this;
    },
    /*
    <method:emit>
        <invoke>.emit(event[, argument1, arguments2, ...])</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:arguments>
            <type>Mixed</type>
            <desc>Any other arguments passed through emit will be applied to the handlers invoked on the event.</desc>
        </param:arguments>
        <desc>Invokes handler(s) bound to event type.</desc>
    </method:emit>
    */
    emit: function (type /*, arguments */) {

        Mk.fn.eventEmitter.emit(this.events, arguments);
        return this;
    },
    /*
    <method:init>
        <invoke>.init(root[, config])</invoke>
        <param:root>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node set to be the root.</desc>
        </param:root>
        <param:config>
            <type>Object</type>
            <desc>Configuration object passed into an instance as settings.</desc>
        </param:config>
        <desc>Internal, private, method used as a contructor. Useful when building your own custom components. Invoked internally only.</desc>
    </method:init>
    */
    init: function (r, o) {

        // define properties such as:
        // templates, formats, name, etc.
        this.define(r, o);

        //build markup or invoke logic
        this.build();

        //bind events, hooks, messages, etc.
        this.bind();

        //mount component to the dom
        this.mount();
    },
    /*
    <method:define>
        <invoke>.define(root[, config])</invoke>
        <param:root>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node set to be the root.</desc>
        </param:root>
        <param:config>
            <type>Object</type>
            <desc>Configuration object passed into an instance as settings.</desc>
        </param:config>
        <desc>A setup function called by _init. This initializes the root, events, config object, formats, templates, etc. Invoked internally only.</desc>
    </method:define>
    */
    define: function (r, o) {

        this.root = this.$(r);

        this.events = {};

        this.config = {
            templates: {},
            formats: {},
            events: {}
        };

        this.each(this.formats, function (v, n) {
            this.config.formats[ n ] = v;
        });

        this.each(this.templates, function (v, n) {
            this.config.templates[ n ] = v;
        });

        this.configure(o);

        return this;
    },
    /*
    <method:configure>
        <invoke>.configure(object)</invoke>
        <param:object>
            <type>Object</type>
            <desc>An object of end developer settings passed in and added to the config property.</desc>
        </param:object>
        <desc>Internal method, invoked by _init, responsible for setting object properties onto the internal configuration object.</desc>
    </method:configure>
    */
    configure: function (o) {

        o = o || {};

        var c = this.config;
            c.events

        this.each(o, function (v, n) {

            if (n === 'events') {
                this.each(v, function (handler, type) {
                    this.on(type, handler);
                });
            }
            else if (Mk.type(v, 'object|arraylike') && prop.call(c, n)) {
                this.each(v, function (e, k) {
                    c[n][k] = e;
                });
            }
            else {
                c[n] = v;
            }
        });

        return this;
    },
    /*
    <method:param>
        <invoke>.param(name, type, config, default[, node])</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of config property.</desc>
        </param:name>
        <param:type>
            <type>String</type>
            <desc>Type to case value to.</desc>
        </param:type>
        <param:config>
            <type>Object</type>
            <desc>Object to set result value on.</desc>
        </param:config>
        <param:default>
            <type>Mixed</type>
            <desc>Default value to set if no value is found through all other means.</desc>
        </param:default>
        <param:node>
            <type>Wrapped Node ($)</type>
            <desc>Optional Node to search for configurations on. Default is root.</desc>
        </param:node>
        <desc>Runs logic to find a configuration setting. It will first look to see if the value lives on config already. If not, it will check for the value on the node (or root if no node is specified). Lastly, it will type case the value based on the type specified. The final result will be set on the config object passed in.</desc>
    </method:param>
    */
    param: function (n, ty, o, d, el) {

        var v, t;

        if (prop.call(o, n)) {
            return this;
        }

        v = this.$(el || this.root).data(n);

        if (v === undefined && ty !== 'undefined' || v === null) {
            v = d;
        }

        t = typeof(v);

        if (t !== ty) {

            switch(ty) {

                case 'boolean':
                    v = v === 'true' || false;
                    break;

                case 'number':
                    v = parseFloat(v, 10);
                    break;

                case 'string':
                    v = v + '';

                case 'undefined':
                    v = d;
                    break;

                case 'object':
                    v = v === null
                        ? d : v;
                    break;
            }
        }

        o[n] = v;

        return this;
    },
    /*
    <method:bind>
        <invoke>.bind()</invoke>
        <desc>Internal Placeholder method for binding the event handlers. Invoked internally by init.</desc>
    </method:bind>
    */
    bind: function () {},
    /*
    <method:build>
        <invoke>.build()</invoke>
        <desc>Internal Placeholder method for building the components. Invoked internally by init.</desc>
    </method:build>
    */
    build: function () {},
    /*
    <method:mount>
        <invoke>.mount()</invoke>
        <desc>Internal Placeholder method for mounting the component to the DOM. Invoked internally by init.</desc>
    </method:mount>
    */
    mount: function () {},
    /*
    <method:unmount>
        <invoke>.unmount()</invoke>
        <desc>Internal Placeholder method for component teardown. Invoked by end developer by choice.</desc>
    </method:unmount>
    */
    unmount: function () {},
};


    return Mk;
});
