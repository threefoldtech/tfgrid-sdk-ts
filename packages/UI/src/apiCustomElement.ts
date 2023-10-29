/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */
import {
  type ComponentInjectOptions,
  type ComponentInternalInstance,
  type ComponentOptions,
  type ComponentOptionsMixin,
  type ComponentOptionsWithArrayProps,
  type ComponentOptionsWithObjectProps,
  type ComponentOptionsWithoutProps,
  type ComponentPropsOptions,
  type ComponentPublicInstance,
  type ComputedOptions,
  type ConcreteComponent,
  createVNode,
  defineComponent,
  type EmitsOptions,
  type ExtractPropTypes,
  type MethodOptions,
  nextTick,
  type RenderFunction,
  type RootHydrateFunction,
  type SetupContext,
  type SlotsType,
  type VNode,
  warn,
} from "@vue/runtime-core";
import { hydrate, render } from "@vue/runtime-dom";
import { camelize, extend, hyphenate, isArray, toNumber } from "@vue/shared";
import HTMLParsedElement from "html-parsed-element";

export type VueElementConstructor<P = {}> = {
  new (initialProps?: Record<string, any>): VueElement & P;
};

export interface DefineCustomElementConfig {
  /**
   * Render inside a shadow root DOM element
   * @default true
   */
  shadowRoot?: boolean;
}

// defineCustomElement provides the same type inference as defineComponent
// so most of the following overloads should be kept in sync w/ defineComponent.

// overload 1: direct setup function
export function defineCustomElement<Props, RawBindings = object>(
  setup: (props: Readonly<Props>, ctx: SetupContext) => RawBindings | RenderFunction,
  config?: DefineCustomElementConfig,
): VueElementConstructor<Props>;

// overload 2: object format with no props
export function defineCustomElement<
  Props = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = EmitsOptions,
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
>(
  options: ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: string[];
  },
  config?: DefineCustomElementConfig,
): VueElementConstructor<Props>;

// overload 3: object format with array props declaration
export function defineCustomElement<
  PropNames extends string,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
>(
  options: ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: string[];
  },
  config?: DefineCustomElementConfig,
): VueElementConstructor<{ [K in PropNames]: any }>;

// overload 4: object format with object props declaration
export function defineCustomElement<
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
>(
  options: ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: string[];
  },
  config?: DefineCustomElementConfig,
): VueElementConstructor<ExtractPropTypes<PropsOptions>>;

// overload 5: defining a custom element from the returned value of
// `defineComponent`
export function defineCustomElement(
  options: {
    new (...args: any[]): ComponentPublicInstance;
  },
  config?: DefineCustomElementConfig,
): VueElementConstructor;

/*! #__NO_SIDE_EFFECTS__ */
export function defineCustomElement(
  options: any,
  config?: DefineCustomElementConfig,
  hydrate?: RootHydrateFunction,
): VueElementConstructor {
  const Comp = defineComponent(options) as any;
  class VueCustomElement extends VueElement {
    static def = Comp;
    constructor(initialProps?: Record<string, any>) {
      super(Comp, initialProps, config, hydrate);
    }
  }

  return VueCustomElement;
}

/*! #__NO_SIDE_EFFECTS__ */
export const defineSSRCustomElement = ((options: any, config?: DefineCustomElementConfig) => {
  // @ts-expect-error
  return defineCustomElement(options, config, hydrate);
}) as typeof defineCustomElement;

const BaseClass = (typeof HTMLElement !== "undefined" ? HTMLParsedElement : class {}) as typeof HTMLElement;

type InnerComponentDef = ConcreteComponent & { styles?: string[] };

export class VueElement extends BaseClass {
  /**
   * @internal
   */
  _instance: ComponentInternalInstance | null = null;

  private _connected = false;
  private _resolved = false;
  private _numberProps: Record<string, true> | null = null;
  private _styles?: HTMLStyleElement[];
  private _slots?: Element[];
  private _ob?: MutationObserver | null = null;

  constructor(
    private _def: InnerComponentDef,
    private _props: Record<string, any> = {},
    private _config: DefineCustomElementConfig = {},
    hydrate?: RootHydrateFunction,
  ) {
    super();
    this._config = extend(
      {
        shadowRoot: true,
      },
      this._config,
    );

    if (this._config.shadowRoot) {
      if (this._root && this.shadowRoot && hydrate) {
        hydrate(this._createVNode(), this._root);
      } else {
        const __DEV__ = true;
        if (__DEV__ && this.shadowRoot) {
          warn(
            `Custom element has pre-rendered declarative shadow root but is not ` +
              `defined as hydratable. Use \`defineSSRCustomElement\`.`,
          );
        }
        this.attachShadow({ mode: "open" });
        if (!(this._def as ComponentOptions).__asyncLoader) {
          // for sync component defs we can immediately resolve props
          this._resolveProps(this._def);
        }
      }
    } else {
      if (hydrate && this._root) {
        hydrate(this._createVNode(), this._root);
      }
    }
  }

  get _root(): Element | ShadowRoot | null {
    return this._config.shadowRoot ? this.shadowRoot : this;
  }

  connectedCallback() {
    if (this._config.shadowRoot) {
      this._connect();
    } else {
      // @ts-expect-error
      super.connectedCallback();
    }
  }

  // use of parsedCallback when shadowRoot is disabled
  // to wait for slots to be parsed
  // see https://stackoverflow.com/a/52884370
  parsedCallback() {
    if (!this._config.shadowRoot) {
      this._connect();
    }
  }

  _connect() {
    this._connected = true;
    if (!this._instance) {
      if (this._resolved) {
        this._update();
      } else {
        this._resolveDef();
      }
    }
  }

  disconnectedCallback() {
    this._connected = false;
    if (this._ob) {
      this._ob.disconnect();
      this._ob = null;
    }
    nextTick(() => {
      if (!this._connected) {
        if (this._root) {
          render(null, this._root);
        }
        this._instance = null;
      }
    });
  }

  /**
   * resolve inner component definition (handle possible async component)
   */
  private _resolveDef() {
    this._resolved = true;

    // set initial attrs
    for (let i = 0; i < this.attributes.length; i++) {
      this._setAttr(this.attributes[i].name);
    }

    // watch future attr changes
    this._ob = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.attributeName) {
          this._setAttr(m.attributeName);
        }
      }
    });

    this._ob.observe(this, { attributes: true });

    const resolve = (def: InnerComponentDef, isAsync = false) => {
      const { props, styles } = def;

      // cast Number-type props set before resolve
      let numberProps;
      if (props && !isArray(props)) {
        for (const key in props) {
          const opt = props[key];
          if (opt === Number || (opt && opt.type === Number)) {
            if (key in this._props) {
              this._props[key] = toNumber(this._props[key]);
            }
            (numberProps || (numberProps = Object.create(null)))[camelize(key)] = true;
          }
        }
      }
      this._numberProps = numberProps;

      if (isAsync) {
        // defining getter/setters on prototype
        // for sync defs, this already happened in the constructor
        this._resolveProps(def);
      }

      // replace slot
      if (!this._config.shadowRoot) {
        this._slots = Array.from(this.children).map(n => n.cloneNode(true) as Element);
        this.replaceChildren();
      }

      // apply CSS
      this._applyStyles(styles);

      // initial render
      this._update();
    };

    const asyncDef = (this._def as ComponentOptions).__asyncLoader;
    if (asyncDef) {
      asyncDef().then((def: InnerComponentDef) => resolve(def, true));
    } else {
      resolve(this._def);
    }
  }

  private _resolveProps(def: InnerComponentDef) {
    const { props } = def;
    const declaredPropKeys = isArray(props) ? props : Object.keys(props || {});

    // check if there are props set pre-upgrade or connect
    for (const key of Object.keys(this)) {
      if (key[0] !== "_" && declaredPropKeys.includes(key)) {
        this._setProp(key, this[key as keyof this], true, false);
      }
    }

    // defining getter/setters on prototype
    for (const key of declaredPropKeys.map(camelize)) {
      Object.defineProperty(this, key, {
        get() {
          return this._getProp(key);
        },
        set(val) {
          this._setProp(key, val);
        },
      });
    }
  }

  protected _setAttr(key: string) {
    let value = this.getAttribute(key);
    const camelKey = camelize(key);
    if (this._numberProps && this._numberProps[camelKey]) {
      value = toNumber(value);
    }
    this._setProp(camelKey, value, false);
  }

  /**
   * @internal
   */
  protected _getProp(key: string) {
    return this._props[key];
  }

  /**
   * @internal
   */
  protected _setProp(key: string, val: any, shouldReflect = true, shouldUpdate = true) {
    if (val !== this._props[key]) {
      this._props[key] = val;
      if (shouldUpdate && this._instance) {
        this._update();
      }
      // reflect
      if (shouldReflect) {
        if (val === true) {
          this.setAttribute(hyphenate(key), "");
        } else if (typeof val === "string" || typeof val === "number") {
          this.setAttribute(hyphenate(key), val + "");
        } else if (!val) {
          this.removeAttribute(hyphenate(key));
        }
      }
    }
  }

  private _update() {
    if (this._root) {
      render(this._createVNode(), this._root);
    }
  }

  private _createVNode(): VNode<any, any> {
    let childs = null;
    // web components without shadow DOM do not supports native slot
    // so, we create a VNode based on the content of child nodes.
    // NB: named slots are currently not supported
    if (!this._config.shadowRoot) {
      childs = () => {
        const toObj = (a: NamedNodeMap) => {
          const res: Record<string, string | null> = {};
          for (let i = 0, l = a.length; i < l; i++) {
            const attr = a[i];
            res[attr.nodeName] = attr.nodeValue;
          }
          return res;
        };
        return this._slots?.map(ele => {
          const attrs = ele.attributes ? toObj(ele.attributes) : {};
          attrs.innerHTML = ele.innerHTML;
          return createVNode(ele.tagName, attrs, null);
        });
      };
    }
    const vnode = createVNode(this._def, extend({}, this._props), childs);
    return vnode;
  }

  private _applyStyles(styles: string[] | undefined) {
    if (styles) {
      styles.forEach(css => {
        const s = document.createElement("style");
        s.textContent = css;
        this._root?.appendChild(s);
        // record for HMR
        const __DEV__ = true;
        if (__DEV__) {
          (this._styles || (this._styles = [])).push(s);
        }
      });
    }
  }
}
