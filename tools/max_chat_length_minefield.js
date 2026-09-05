/* Persistent Project Thread research utility
 * MAX CONVERSATION LENGTH browser minefield
 * Run manually in ChatGPT web DevTools Console BEFORE reproducing/sending the next turn.
 * No data is transmitted by this script. Logs remain in memory until exported.
 */
(() => {
  if (window.__MAXCHAT_MINEFIELD?.installed) {
    console.warn('[MAXCHAT] minefield already installed');
    return;
  }

  const TARGETS = [
    '이 대화의 최대 길이에 도달',
    '새 채팅을 시작해 계속 이야기할 수 있습니다',
    "You've reached the maximum length for this conversation",
    'maximum length for this conversation',
    'conversation is too long',
  ];
  const startedAt = new Date().toISOString();
  const logs = [];
  let seq = 0;

  const safe = (x) => {
    try {
      if (typeof x === 'string') return x.slice(0, 20000);
      return JSON.parse(JSON.stringify(x, (_k, v) => {
        if (typeof v === 'string' && v.length > 20000) return v.slice(0, 20000) + '…';
        return v;
      }));
    } catch {
      try { return String(x).slice(0, 20000); } catch { return '<unserializable>'; }
    }
  };

  const emit = (kind, data = {}) => {
    const e = {seq: ++seq, ts: new Date().toISOString(), kind, data: safe(data)};
    logs.push(e);
    console.log('%c[MAXCHAT]', 'color:#ff3b30;font-weight:bold', e);
    return e;
  };

  const textHits = (text) => TARGETS.filter(t => String(text || '').toLowerCase().includes(t.toLowerCase()));

  function attrs(el) {
    if (!el?.attributes) return {};
    const out = {};
    for (const a of el.attributes) out[a.name] = a.value;
    return out;
  }

  function reactTrace(el) {
    const out = [];
    try {
      let node = el;
      for (let domDepth = 0; node && domDepth < 7; domDepth++, node = node.parentElement) {
        const keys = Object.keys(node);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber$'));
        const propsKey = keys.find(k => k.startsWith('__reactProps$'));
        const rec = {domDepth, tag: node.tagName, id: node.id || null, cls: node.className || null};
        if (propsKey) {
          const p = node[propsKey];
          rec.reactPropKeys = p && typeof p === 'object' ? Object.keys(p).slice(0, 50) : [];
        }
        if (fiberKey) {
          let f = node[fiberKey];
          const chain = [];
          for (let i = 0; f && i < 18; i++, f = f.return) {
            const type = f.elementType || f.type;
            let name = null;
            if (typeof type === 'string') name = type;
            else if (type) name = type.displayName || type.name || type.$$typeof?.toString?.() || null;
            chain.push({i, tag: f.tag, key: f.key, type: name});
          }
          rec.fiber = chain;
        }
        out.push(rec);
      }
    } catch (err) {
      out.push({error: String(err)});
    }
    return out;
  }

  function reportBanner(el, reason) {
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    const hits = textHits(text);
    if (!hits.length) return;
    const ancestry = [];
    let n = el;
    for (let i = 0; n && i < 8; i++, n = n.parentElement) {
      ancestry.push({
        i, tag: n.tagName, id: n.id || null, cls: n.className || null,
        role: n.getAttribute?.('role'), attrs: attrs(n),
        text: (n.innerText || n.textContent || '').slice(0, 1200)
      });
    }
    emit('BANNER_HIT', {reason, hits, text: text.slice(0, 5000), ancestry, react: reactTrace(el)});
  }

  function scanExisting(reason='initial-scan') {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let n;
    let count = 0;
    while ((n = walker.nextNode()) && count++ < 50000) {
      const text = n.innerText || n.textContent || '';
      if (textHits(text).length) {
        // Prefer deepest matching node to reduce ancestry noise.
        const childMatch = [...n.children].some(c => textHits(c.innerText || c.textContent || '').length);
        if (!childMatch) reportBanner(n, reason);
      }
    }
  }

  // DOM mutation mine.
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes || []) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const text = node.innerText || node.textContent || '';
        if (textHits(text).length) reportBanner(node, 'mutation-added');
        for (const el of node.querySelectorAll?.('*') || []) {
          const t = el.innerText || el.textContent || '';
          if (textHits(t).length) {
            const childMatch = [...el.children].some(c => textHits(c.innerText || c.textContent || '').length);
            if (!childMatch) reportBanner(el, 'mutation-descendant');
          }
        }
      }
      if (m.type === 'characterData') {
        const p = m.target.parentElement;
        if (p && textHits(p.innerText || p.textContent || '').length) reportBanner(p, 'characterData');
      }
    }
  });
  mo.observe(document.documentElement, {subtree:true, childList:true, characterData:true});

  // fetch mine: request + response status/body snippet.
  const origFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const req = args[0];
    const init = args[1] || {};
    const url = typeof req === 'string' ? req : req?.url;
    const method = init.method || req?.method || 'GET';
    const rid = `f${seq+1}-${Math.random().toString(16).slice(2,8)}`;
    emit('FETCH_START', {rid, method, url});
    try {
      const res = await origFetch(...args);
      let body = null;
      try {
        const ct = res.headers.get('content-type') || '';
        if (/json|text|event-stream/i.test(ct)) {
          body = (await res.clone().text()).slice(0, 30000);
        }
      } catch (e) { body = `<clone-read-failed:${e}>`; }
      const hits = textHits(body);
      emit(hits.length ? 'FETCH_TARGET_HIT' : 'FETCH_END', {
        rid, method, url, status: res.status, ok: res.ok,
        contentType: res.headers.get('content-type'), hits, body
      });
      return res;
    } catch (err) {
      emit('FETCH_THROW', {rid, method, url, error:String(err), stack:err?.stack});
      throw err;
    }
  };

  // XHR mine.
  const XO = XMLHttpRequest.prototype.open;
  const XS = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this.__maxchat = {method, url};
    return XO.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function(body) {
    const meta = this.__maxchat || {};
    emit('XHR_START', {method:meta.method, url:meta.url});
    this.addEventListener('loadend', () => {
      let text = '';
      try { if (!this.responseType || this.responseType === 'text') text = String(this.responseText || '').slice(0,30000); } catch {}
      const hits = textHits(text);
      emit(hits.length ? 'XHR_TARGET_HIT' : 'XHR_END', {method:meta.method, url:meta.url, status:this.status, hits, body:text});
    }, {once:true});
    return XS.call(this, body);
  };

  // WebSocket mine.
  const NativeWS = window.WebSocket;
  function WrappedWS(url, protocols) {
    const ws = protocols === undefined ? new NativeWS(url) : new NativeWS(url, protocols);
    emit('WS_OPENING', {url:String(url), protocols:safe(protocols)});
    ws.addEventListener('open', () => emit('WS_OPEN', {url:String(url)}));
    ws.addEventListener('close', e => emit('WS_CLOSE', {url:String(url), code:e.code, reason:e.reason, clean:e.wasClean}));
    ws.addEventListener('error', () => emit('WS_ERROR', {url:String(url)}));
    ws.addEventListener('message', e => {
      const d = typeof e.data === 'string' ? e.data.slice(0,30000) : `<${Object.prototype.toString.call(e.data)}>`;
      const hits = textHits(d);
      if (hits.length) emit('WS_TARGET_HIT', {url:String(url), hits, data:d});
    });
    const send = ws.send.bind(ws);
    ws.send = data => {
      const d = typeof data === 'string' ? data.slice(0,5000) : `<${Object.prototype.toString.call(data)}>`;
      emit('WS_SEND', {url:String(url), data:d});
      return send(data);
    };
    return ws;
  }
  WrappedWS.prototype = NativeWS.prototype;
  Object.setPrototypeOf(WrappedWS, NativeWS);
  window.WebSocket = WrappedWS;

  // Global error mines.
  window.addEventListener('error', e => emit('WINDOW_ERROR', {message:e.message, filename:e.filename, lineno:e.lineno, colno:e.colno, error:String(e.error), stack:e.error?.stack}), true);
  window.addEventListener('unhandledrejection', e => emit('UNHANDLED_REJECTION', {reason:String(e.reason), stack:e.reason?.stack}), true);

  // Resource mine.
  try {
    const po = new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        if (/conversation|backend|api|sentinel|moderation|message|response/i.test(e.name)) {
          emit('RESOURCE', {name:e.name, initiatorType:e.initiatorType, duration:e.duration, transferSize:e.transferSize, encodedBodySize:e.encodedBodySize, decodedBodySize:e.decodedBodySize});
        }
      }
    });
    po.observe({type:'resource', buffered:true});
  } catch (e) { emit('PERF_OBSERVER_FAIL', {error:String(e)}); }

  // Navigation/history mines.
  for (const name of ['pushState','replaceState']) {
    const orig = history[name].bind(history);
    history[name] = (...args) => { emit('HISTORY_'+name.toUpperCase(), {args:safe(args), href:location.href}); return orig(...args); };
  }
  addEventListener('popstate', () => emit('POPSTATE', {href:location.href}));

  // Service worker / storage snapshot names only; avoid dumping private values.
  try {
    navigator.serviceWorker?.addEventListener('message', e => emit('SW_MESSAGE', {data:safe(e.data)}));
    emit('STORAGE_KEYS', {localStorage:Object.keys(localStorage), sessionStorage:Object.keys(sessionStorage)});
  } catch (e) { emit('STORAGE_KEYS_FAIL', {error:String(e)}); }
  if (indexedDB.databases) indexedDB.databases().then(dbs => emit('INDEXEDDB_DATABASES', {dbs})).catch(e => emit('INDEXEDDB_FAIL',{error:String(e)}));

  // Export helper.
  window.__MAXCHAT_MINEFIELD_EXPORT = () => {
    const payload = {
      metadata:{startedAt, exportedAt:new Date().toISOString(), href:location.href, userAgent:navigator.userAgent},
      logs
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maxchat-minefield-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    emit('EXPORT', {count:logs.length});
    return payload;
  };

  window.__MAXCHAT_MINEFIELD = {installed:true, startedAt, logs, scan:scanExisting, export:window.__MAXCHAT_MINEFIELD_EXPORT};
  emit('INSTALLED', {href:location.href, targets:TARGETS});
  scanExisting();
  console.warn('[MAXCHAT] Minefield armed. Send/retry ONE message, then run __MAXCHAT_MINEFIELD_EXPORT()');
})();
