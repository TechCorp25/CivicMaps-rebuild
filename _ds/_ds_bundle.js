/* @ds-bundle: {"format":4,"namespace":"CivicMAPSDesignSystem_99ee05","components":[{"name":"LifecycleStatusPill","sourcePath":"components/LifecycleStatusPill.jsx"},{"name":"PresenceIndicator","sourcePath":"components/PresenceIndicator.jsx"},{"name":"RadioCodeBadge","sourcePath":"components/RadioCodeBadge.jsx"},{"name":"LoginPage","sourcePath":"ui_kits/commandmaps/LoginPage.jsx"}],"sourceHashes":{"components/LifecycleStatusPill.jsx":"45e7ede5bff4","components/PresenceIndicator.jsx":"6f6c53ebca5e","components/RadioCodeBadge.jsx":"bbf238bf6b7a","ui_kits/commandmaps/Dashboard.jsx":"4e83c315297b","ui_kits/commandmaps/LoginPage.jsx":"b6ec5c6c6d1c","ui_kits/commandmaps/Modals.jsx":"eefc7a4607cf","ui_kits/commandmaps/OtherPages.jsx":"dd7d2a85d88d","ui_kits/commandmaps/Shell.jsx":"6728858c4d9b","ui_kits/dispatch/Detail.jsx":"22d5b85181be","ui_kits/dispatch/DispatchDashboard.jsx":"525ad2fc6adf","ui_kits/dispatch/DispatchShell.jsx":"17bfe63b2eec","ui_kits/enforcementmaps/MobileShell.jsx":"709002c12863","ui_kits/enforcementmaps/OtherScreens.jsx":"aa7fd51e96ac","ui_kits/enforcementmaps/Patrol.jsx":"7be1884c2a71"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CivicMAPSDesignSystem_99ee05 = window.CivicMAPSDesignSystem_99ee05 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/LifecycleStatusPill.jsx
try { (() => {
/* LifecycleStatusPill — 11-state SR lifecycle promoted out of the dispatch kit (F20).
   Production flow (owner microcopy): Received → Dispatched · Not Active (push sent to
   handset) → Dispatched · Active (push opened/acknowledged) → In Progress → Attended,
   then FORKS: no offence observed → No Report → SR Closed → Completed;
   offence observed → PIN Issued → SR Closed → Completed.
   Consumes semantic status tokens only. Triple-encoded: colour + icon + text. */
function LifecycleStatusPill({
  status = 'RECEIVED'
}) {
  const META = {
    RECEIVED: {
      fg: 'var(--status-pending-strong)',
      bg: 'var(--status-pending-bg)',
      label: 'Received',
      icon: 'inbox'
    },
    DISPATCHED_NOT_ACTIVE: {
      fg: 'var(--status-issued)',
      bg: 'var(--status-issued-bg)',
      label: 'Dispatched · Not Active',
      icon: 'clock'
    },
    DISPATCHED_ACTIVE: {
      fg: 'var(--status-alert-strong)',
      bg: 'var(--status-alert-bg)',
      label: 'Dispatched · Active',
      icon: 'radio'
    },
    IN_PROGRESS: {
      fg: 'var(--status-active-strong)',
      bg: 'var(--status-active-bg)',
      label: 'In Progress',
      icon: 'radio'
    },
    ATTENDED: {
      fg: 'var(--status-attended)',
      bg: 'var(--status-attended-bg)',
      label: 'Attended',
      icon: 'pin'
    },
    PIN_ISSUED: {
      fg: 'var(--status-issued-strong)',
      bg: 'var(--status-issued-bg)',
      label: 'PIN Issued',
      icon: 'clipboard'
    },
    NO_REPORT: {
      fg: 'var(--status-issued-deep)',
      bg: 'var(--status-issued-bg)',
      label: 'No Report',
      icon: 'clipboard'
    },
    COMPLETED: {
      fg: 'var(--civic-neutral-600)',
      bg: 'var(--civic-neutral-100)',
      label: 'Completed',
      icon: 'clipboard'
    },
    VOIDED: {
      fg: 'var(--status-emergency-deep)',
      bg: 'var(--status-emergency-bg)',
      label: 'Voided',
      icon: 'x'
    },
    CANCELLED: {
      fg: 'var(--civic-neutral-500)',
      bg: 'var(--civic-neutral-100)',
      label: 'Cancelled',
      icon: 'x'
    },
    CLOSED: {
      fg: 'var(--civic-neutral-500)',
      bg: 'var(--civic-neutral-100)',
      label: 'Closed',
      icon: 'clipboard'
    }
  };
  const m = META[status] || META.RECEIVED;
  const paths = {
    inbox: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "22 12 16 12 14 15 10 15 8 12 2 12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
    })),
    clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    })),
    radio: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"
    })),
    pin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })),
    clipboard: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "8",
      y: "2",
      width: "8",
      height: "4",
      rx: "1",
      ry: "1"
    })),
    x: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    }))
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      borderRadius: 'var(--radius-full)',
      background: m.bg,
      color: m.fg,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      fontFamily: 'var(--font-primary)'
    },
    "aria-label": 'Status: ' + m.label
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, paths[m.icon]), m.label);
}
Object.assign(__ds_scope, { LifecycleStatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/LifecycleStatusPill.jsx", error: String((e && e.message) || e) }); }

// components/PresenceIndicator.jsx
try { (() => {
/* PresenceIndicator — DR-04 owner-ruled presence badges. Never amber (passive presence). */
function PresenceIndicator({
  state = 'available',
  size = 'md'
}) {
  const META = {
    'available': {
      text: 'var(--presence-available)',
      bg: 'var(--presence-available-bg)',
      border: 'var(--presence-available-border)',
      label: 'Available',
      icon: 'check'
    },
    'active-offline': {
      text: 'var(--presence-active-offline)',
      bg: 'var(--presence-active-offline-bg)',
      border: 'var(--presence-active-offline-border)',
      label: 'Active offline',
      icon: 'signal-off'
    },
    'inactive': {
      text: 'var(--presence-inactive)',
      bg: 'var(--presence-inactive-bg)',
      border: 'var(--presence-inactive-border)',
      label: 'Inactive offline',
      icon: 'moon'
    }
  };
  const m = META[state] || META.available;
  const s = size === 'sm' ? {
    fs: 10,
    pad: '2px 8px',
    ic: 10
  } : {
    fs: 11,
    pad: '3px 10px',
    ic: 12
  };
  const paths = {
    'check': /*#__PURE__*/React.createElement("path", {
      d: "M20 6L9 17l-5-5"
    }),
    'signal-off': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M2 20h.01M7 20v-4M12 20v-8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M17 20V8M22 4v16",
      opacity: ".3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 3l18 18"
    })),
    'moon': /*#__PURE__*/React.createElement("path", {
      d: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"
    })
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: s.pad,
      borderRadius: 'var(--radius-full)',
      background: m.bg,
      color: m.text,
      border: `1px solid ${m.border}`,
      fontSize: s.fs,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      fontFamily: 'var(--font-primary)'
    },
    "aria-label": 'Presence: ' + m.label
  }, /*#__PURE__*/React.createElement("svg", {
    width: s.ic,
    height: s.ic,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, paths[m.icon]), m.label);
}
Object.assign(__ds_scope, { PresenceIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/PresenceIndicator.jsx", error: String((e && e.message) || e) }); }

// components/RadioCodeBadge.jsx
try { (() => {
/* RadioCodeBadge — tier-driven presentation (DR-04). Progressive disclosure (owner ruling):
   code renders as primary with label HIDDEN; tap/click/touch expands to reveal the paired label.
   Codes are configurable content (S01-COD-001) — never hard-coded semantics here. */
const {
  useState: rcbUseState
} = React;
function RadioCodeBadge({
  code,
  label,
  tier = 'work',
  defaultExpanded = false
}) {
  const [open, setOpen] = rcbUseState(defaultExpanded);
  const TIERS = {
    emergency: {
      bg: 'var(--status-emergency)',
      text: '#fff',
      border: 'var(--status-emergency)'
    },
    urgent: {
      bg: 'var(--status-emergency-bg)',
      text: 'var(--status-emergency-text)',
      border: 'var(--status-emergency-border)'
    },
    directive: {
      bg: 'var(--civic-primary)',
      text: '#fff',
      border: 'var(--civic-primary-light)'
    },
    'alert-interactive': {
      bg: 'var(--semantic-alert-interactive)',
      text: 'var(--status-alert-text)',
      border: 'var(--semantic-alert-interactive)'
    },
    presence: {
      bg: 'var(--presence-available-bg)',
      text: 'var(--presence-available)',
      border: 'var(--presence-available-border)'
    },
    comms: {
      bg: 'var(--status-pending-bg)',
      text: 'var(--status-pending-strong)',
      border: 'var(--status-pending-border)'
    },
    work: {
      bg: 'var(--civic-neutral-100)',
      text: 'var(--civic-neutral-700)',
      border: 'var(--civic-neutral-200)'
    }
  };
  const t = TIERS[tier] || TIERS.work;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    "aria-expanded": open,
    "aria-label": code + (open ? '' : ': ' + label + ' (tap to reveal)'),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${t.border}`,
      overflow: 'hidden',
      background: 'var(--civic-surface)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '.05em',
      minHeight: 26
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: t.bg,
      color: t.text,
      padding: '4px 8px',
      display: 'inline-flex',
      alignItems: 'center'
    }
  }, code), open && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--civic-neutral-800)',
      fontFamily: 'var(--font-primary)',
      fontWeight: 600,
      fontSize: 11,
      letterSpacing: '.01em',
      padding: '0 9px',
      textTransform: 'none',
      whiteSpace: 'nowrap'
    }
  }, label));
}
Object.assign(__ds_scope, { RadioCodeBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/RadioCodeBadge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/commandmaps/Dashboard.jsx
try { (() => {
/* CommandMAPS — Map + right panel (dashboard body) */
const {
  useState: useS,
  useEffect: useE
} = React;
function MapCanvas({
  onCode21Click,
  alertCode
}) {
  const zones = [{
    id: 'MAC',
    x: 180,
    y: 140,
    w: 170,
    h: 110,
    label: 'Z-MAC · Macaulay',
    dashed: false
  }, {
    id: 'ELZ',
    x: 380,
    y: 140,
    w: 170,
    h: 110,
    label: 'Z-ELZ · Elizabeth',
    dashed: true
  }, {
    id: 'CBN',
    x: 580,
    y: 140,
    w: 170,
    h: 110,
    label: 'Z-CBN · Carlton N',
    dashed: false
  }, {
    id: 'SWM',
    x: 180,
    y: 280,
    w: 170,
    h: 110,
    label: 'Z-SWM · Swanston M',
    dashed: false
  }, {
    id: 'LON',
    x: 380,
    y: 280,
    w: 170,
    h: 110,
    label: 'Z-LON · Lonsdale',
    dashed: false
  }, {
    id: 'FLI',
    x: 580,
    y: 280,
    w: 170,
    h: 110,
    label: 'Z-FLI · Flinders',
    dashed: true
  }];
  const officers = [{
    x: 250,
    y: 175,
    n: '142',
    alert: false
  }, {
    x: 460,
    y: 180,
    n: '118',
    alert: !!alertCode
  }, {
    x: 640,
    y: 195,
    n: '089',
    alert: false
  }, {
    x: 250,
    y: 320,
    n: '211',
    alert: false
  }, {
    x: 460,
    y: 330,
    n: '124',
    alert: false
  }];
  const srs = [{
    x: 520,
    y: 220,
    status: 'DISPATCHED'
  }, {
    x: 320,
    y: 380,
    status: 'RECEIVED'
  }];
  const roadsH = [120, 260, 400, 540].map(t => React.createElement('div', {
    key: 't' + t,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: t,
      height: 3,
      background: 'var(--map-road)'
    }
  }));
  const roadsV = [160, 360, 560, 760].map(l => React.createElement('div', {
    key: 'l' + l,
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: l,
      width: 3,
      background: 'var(--map-road)'
    }
  }));
  const zoneEls = zones.map(z => React.createElement('div', {
    key: z.id,
    style: {
      position: 'absolute',
      left: z.x,
      top: z.y,
      width: z.w,
      height: z.h,
      border: `2px ${z.dashed ? 'dashed' : 'solid'} var(--civic-secondary)`,
      background: 'rgba(26,122,109,.15)',
      borderRadius: 4,
      color: '#fff',
      fontSize: 10,
      fontFamily: 'var(--font-mono)',
      padding: 6
    }
  }, z.label));
  const officerEls = officers.map((o, i) => React.createElement('div', {
    key: 'o' + i,
    style: {
      position: 'absolute',
      left: o.x,
      top: o.y,
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: o.alert ? 'var(--status-emergency)' : 'var(--status-active)',
      border: '2px solid #fff',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: '#fff',
      fontWeight: 700,
      boxShadow: o.alert ? '0 0 0 8px rgba(220,38,38,.3)' : '0 0 0 4px rgba(22,163,74,.2)',
      transform: 'translate(-50%,-50%)'
    }
  }, o.n));
  const srEls = srs.map((s, i) => React.createElement('div', {
    key: 's' + i,
    onClick: () => onCode21Click && onCode21Click(),
    style: {
      position: 'absolute',
      left: s.x,
      top: s.y,
      transform: 'translate(-50%,-50%)',
      cursor: 'pointer'
    }
  }, React.createElement('div', {
    style: {
      width: 22,
      height: 22,
      borderRadius: 4,
      background: s.status === 'RECEIVED' ? 'var(--status-pending)' : 'var(--status-alert)',
      border: '2px solid #fff',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: '#fff',
      fontWeight: 700
    }
  }, 'SR')));
  return React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--map-canvas-deep)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(var(--map-surface) 1px,transparent 1px),linear-gradient(90deg,var(--map-surface) 1px,transparent 1px)',
      backgroundSize: '48px 48px',
      opacity: .5
    }
  }), ...roadsH, ...roadsV, ...zoneEls, ...officerEls, ...srEls, React.createElement('div', {
    key: 'cred',
    style: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      padding: '6px 10px',
      background: 'rgba(15,26,50,.85)',
      color: '#F7F8FA',
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      borderRadius: 6
    }
  }, '© Melbourne CBD · Map ID aadaf0ce47fb616839a32e81'));
}
function Tile({
  label,
  value,
  color
}) {
  return React.createElement('div', {
    style: {
      background: '#fff',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 10,
      padding: '10px 12px'
    }
  }, React.createElement('div', {
    style: {
      fontSize: 11,
      color: 'var(--civic-neutral-500)',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      fontWeight: 600
    }
  }, label), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement('span', {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: color
    }
  }), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: 20,
      color: 'var(--civic-neutral-900)'
    }
  }, value)));
}
function StatusBadge({
  status
}) {
  const map = {
    RECEIVED: ['var(--status-pending-bg)', 'var(--status-pending)', 'Received'],
    DISPATCHED_ACTIVE: ['var(--status-alert-bg)', 'var(--status-alert-strong)', 'Dispatched'],
    IN_PROGRESS: ['var(--status-active-bg)', 'var(--status-active-strong)', 'In Progress'],
    COMPLETED: ['var(--civic-neutral-100)', 'var(--civic-neutral-600)', 'Completed']
  };
  const [bg, fg, label] = map[status] || map.RECEIVED;
  return React.createElement('span', {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      padding: '3px 8px',
      borderRadius: 99,
      background: bg,
      color: fg
    }
  }, label);
}
function DashboardPanel({
  open,
  onToggle,
  onNewSR,
  code21s,
  zones,
  onAssign
}) {
  return React.createElement('div', {
    style: {
      position: 'absolute',
      right: 0,
      top: 0,
      height: '100%',
      width: 360,
      display: 'flex',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform .35s cubic-bezier(.4,0,.2,1)'
    }
  }, React.createElement('button', {
    onClick: onToggle,
    style: {
      position: 'absolute',
      left: -28,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 28,
      height: 72,
      background: '#fff',
      border: '1px solid var(--civic-neutral-200)',
      borderRight: 'none',
      borderRadius: '10px 0 0 10px',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      color: 'var(--civic-neutral-500)',
      boxShadow: 'var(--shadow-md)'
    }
  }, React.createElement(LucideIcon, {
    name: open ? 'ChevronRight' : 'ChevronLeft',
    size: 16
  })), React.createElement('div', {
    style: {
      flex: 1,
      background: '#fff',
      borderLeft: '1px solid var(--civic-neutral-200)',
      overflowY: 'auto',
      boxShadow: 'var(--shadow-xl)'
    }
  }, React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      padding: 14
    }
  }, React.createElement(Tile, {
    label: 'Active zones',
    value: '14/17',
    color: 'var(--status-pending)'
  }), React.createElement(Tile, {
    label: 'Online officers',
    value: '12/14',
    color: 'var(--status-active)'
  }), React.createElement(Tile, {
    label: 'Code 2 logged',
    value: '9',
    color: 'var(--status-issued)'
  }), React.createElement(Tile, {
    label: 'Unassigned C21',
    value: '3',
    color: 'var(--status-emergency)'
  })), React.createElement('div', {
    style: {
      padding: '0 14px 8px'
    }
  }, React.createElement('button', {
    onClick: onNewSR,
    style: {
      width: '100%',
      background: 'var(--civic-primary)',
      color: '#fff',
      border: 'none',
      padding: '10px 12px',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'inherit'
    }
  }, React.createElement(LucideIcon, {
    name: 'Plus',
    size: 16
  }), 'New Code21 (SR)')), React.createElement('div', {
    style: {
      padding: '10px 14px 4px'
    }
  }, React.createElement('h3', {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, 'Zone assignments')), React.createElement('div', {
    style: {
      padding: '6px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, zones.map(z => React.createElement('div', {
    key: z.id,
    style: {
      background: 'var(--civic-surface-raised)',
      borderRadius: 8,
      padding: '8px 10px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minWidth: 0
    }
  }, React.createElement('span', {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: z.color
    }
  }), React.createElement('span', {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--civic-neutral-800)'
    }
  }, z.name)), z.officer ? React.createElement('span', {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: z.online ? 'var(--status-active)' : 'var(--civic-neutral-300)'
    }
  }) : null), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4
    }
  }, z.officer ? React.createElement('span', {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-neutral-500)'
    }
  }, z.officer) : React.createElement('span', {
    style: {
      fontSize: 11,
      color: 'var(--status-alert-strong)',
      fontWeight: 600
    }
  }, 'Unassigned'), React.createElement('button', {
    onClick: () => onAssign(z.id),
    style: {
      fontSize: 10,
      background: z.officer ? 'var(--status-pending-bg)' : 'var(--status-active-bg)',
      color: z.officer ? 'var(--status-pending)' : 'var(--status-active)',
      border: 'none',
      padding: '3px 8px',
      borderRadius: 4,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, z.officer ? 'Reassign' : 'Assign'))))), React.createElement('div', {
    style: {
      padding: '14px 14px 6px'
    }
  }, React.createElement('h3', {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, 'Recent Code21s')), React.createElement('div', {
    style: {
      padding: '6px 14px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, code21s.map(c => React.createElement('div', {
    key: c.id,
    style: {
      background: 'var(--civic-surface-raised)',
      borderRadius: 8,
      padding: '8px 10px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8
    }
  }, React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--civic-neutral-800)'
    }
  }, c.address), React.createElement(StatusBadge, {
    status: c.status
  })), React.createElement('div', {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-neutral-500)',
      marginTop: 3
    }
  }, c.sr + ' · ' + c.time))))));
}
window.MapCanvas = MapCanvas;
window.DashboardPanel = DashboardPanel;
window.StatusBadge = StatusBadge;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/commandmaps/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/commandmaps/LoginPage.jsx
try { (() => {
/* CommandMAPS — Login screen */
const {
  useState: useStateLogin
} = React;
function LoginPage({
  onLogin
}) {
  const [id, setId] = useStateLogin('a.rivera@melbourne.vic.gov.au');
  const [pw, setPw] = useStateLogin('patrol2024');
  const [err, setErr] = useStateLogin('');
  const [loading, setLoading] = useStateLogin(false);
  const submit = e => {
    e.preventDefault();
    if (!id || !pw) return setErr('Email and password required.');
    setErr('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: 'Alex Rivera',
        role: 'COMPLIANCE_LEAD'
      });
    }, 500);
  };
  return React.createElement('div', {
    style: {
      minHeight: '100%',
      background: 'var(--civic-primary-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      position: 'relative',
      overflow: 'hidden'
    }
  },
  // subtle grid backdrop
  React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(44,62,107,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(44,62,107,.35) 1px,transparent 1px)',
      backgroundSize: '40px 40px',
      opacity: .6
    }
  }), React.createElement('div', {
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: 420,
      background: '#fff',
      borderRadius: 14,
      padding: 32,
      boxShadow: 'var(--shadow-xl)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      justifyContent: 'center',
      marginBottom: 4
    }
  }, React.createElement('div', {
    style: {
      width: 34,
      height: 34,
      borderRadius: 8,
      background: 'var(--civic-primary)',
      color: 'var(--civic-accent)',
      display: 'grid',
      placeItems: 'center'
    }
  }, React.createElement(LucideIcon, {
    name: 'Shield',
    size: 20,
    stroke: 2.2
  })), React.createElement('h1', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      color: 'var(--civic-primary)',
      letterSpacing: '-.01em'
    }
  }, 'CommandMAPS')), React.createElement('p', {
    style: {
      textAlign: 'center',
      color: '#636E80',
      margin: '6px 0 24px',
      fontSize: 13
    }
  }, 'Admin dispatch dashboard'), err && React.createElement('div', {
    style: {
      background: 'var(--status-emergency-bg)',
      color: 'var(--status-emergency)',
      border: '1px solid var(--status-emergency-border)',
      padding: '8px 12px',
      borderRadius: 6,
      fontSize: 13,
      marginBottom: 12
    }
  }, err), React.createElement('form', {
    onSubmit: submit,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, React.createElement('div', null, React.createElement('label', {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 500,
      color: '#374151',
      marginBottom: 6
    }
  }, 'Email or badge number'), React.createElement('input', {
    value: id,
    onChange: e => setId(e.target.value),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '10px 12px',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 13
    }
  }), React.createElement('div', {
    style: {
      fontSize: 11,
      color: '#636E80',
      marginTop: 4
    }
  }, 'First login of the day requires email. After that, badge number is accepted.')), React.createElement('div', null, React.createElement('label', {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 500,
      color: '#374151',
      marginBottom: 6
    }
  }, 'Password'), React.createElement('input', {
    type: 'password',
    value: pw,
    onChange: e => setPw(e.target.value),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '10px 12px',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 8,
      fontFamily: 'var(--font-primary)',
      fontSize: 14
    }
  })), React.createElement('button', {
    type: 'submit',
    disabled: loading,
    style: {
      background: 'var(--civic-primary)',
      color: '#fff',
      border: 'none',
      padding: '11px 0',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: 'inherit',
      opacity: loading ? .5 : 1
    }
  }, loading ? 'Signing in…' : 'Sign In')), React.createElement('div', {
    style: {
      marginTop: 18,
      paddingTop: 14,
      borderTop: '1px solid var(--civic-neutral-100)',
      fontSize: 11,
      color: '#636E80',
      fontFamily: 'var(--font-mono)',
      textAlign: 'center'
    }
  }, 'DEMO · patrol2024 · any seeded account')));
}
window.LoginPage = LoginPage;
Object.assign(__ds_scope, { LoginPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/commandmaps/LoginPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/commandmaps/Modals.jsx
try { (() => {
/* CommandMAPS — Modals (New SR / Assign / Code21 detail) */
const {
  useState: useSt
} = React;
function Modal({
  title,
  onClose,
  children,
  accent,
  width = 520
}) {
  return React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--civic-surface-overlay)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 100
    },
    onClick: onClose
  }, React.createElement('div', {
    onClick: e => e.stopPropagation(),
    style: {
      width,
      maxWidth: '92%',
      background: '#fff',
      borderRadius: 12,
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid var(--civic-neutral-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: accent ? `3px solid ${accent}` : 'none'
    }
  }, React.createElement('h3', {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, title), React.createElement('button', {
    onClick: onClose,
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--civic-neutral-400)',
      padding: 4,
      display: 'grid',
      placeItems: 'center'
    }
  }, React.createElement(LucideIcon, {
    name: 'X',
    size: 18
  }))), React.createElement('div', {
    style: {
      padding: 18
    }
  }, children)));
}
function NewSRModal({
  onClose,
  onCreate
}) {
  const [address, setAddress] = useSt('');
  const [desc, setDesc] = useSt('');
  const [priority, setPriority] = useSt('P2');
  const [type, setType] = useSt('PARK_VIOLATION');
  const field = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    border: '1px solid var(--civic-neutral-200)',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'inherit'
  };
  const label = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--civic-neutral-600)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    marginBottom: 4
  };
  return React.createElement(Modal, {
    title: 'New Code21 (service request)',
    onClose,
    accent: 'var(--civic-primary)'
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, React.createElement('div', null, React.createElement('label', {
    style: label
  }, 'Location'), React.createElement('input', {
    style: field,
    value: address,
    onChange: e => setAddress(e.target.value),
    placeholder: 'e.g. 412 Elizabeth St'
  })), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, React.createElement('div', null, React.createElement('label', {
    style: label
  }, 'Type'), React.createElement('select', {
    style: field,
    value: type,
    onChange: e => setType(e.target.value)
  }, React.createElement('option', {
    value: 'PARK_VIOLATION'
  }, 'Parking violation'), React.createElement('option', {
    value: 'ABANDONED'
  }, 'Abandoned vehicle'), React.createElement('option', {
    value: 'OBSTRUCTION'
  }, 'Obstruction'), React.createElement('option', {
    value: 'OVERSTAY'
  }, 'Meter overstay'))), React.createElement('div', null, React.createElement('label', {
    style: label
  }, 'Priority'), React.createElement('select', {
    style: field,
    value: priority,
    onChange: e => setPriority(e.target.value)
  }, React.createElement('option', {
    value: 'P1'
  }, 'P1 — Urgent'), React.createElement('option', {
    value: 'P2'
  }, 'P2 — Standard'), React.createElement('option', {
    value: 'P3'
  }, 'P3 — Low')))), React.createElement('div', null, React.createElement('label', {
    style: label
  }, 'Description'), React.createElement('textarea', {
    style: {
      ...field,
      minHeight: 70,
      fontFamily: 'inherit',
      resize: 'vertical'
    },
    value: desc,
    onChange: e => setDesc(e.target.value),
    placeholder: 'Vehicle obstructing loading zone…'
  })), React.createElement('div', {
    style: {
      padding: '10px 12px',
      background: 'var(--civic-surface-sunken)',
      borderRadius: 6,
      fontSize: 12,
      color: 'var(--civic-neutral-600)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement(LucideIcon, {
    name: 'MapPin',
    size: 14
  }), 'Will auto-assign to nearest available officer in zone.'), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 4
    }
  }, React.createElement('button', {
    onClick: onClose,
    style: {
      background: 'transparent',
      color: 'var(--civic-neutral-600)',
      border: '1px solid var(--civic-neutral-200)',
      padding: '9px 14px',
      borderRadius: 6,
      fontWeight: 500,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Cancel'), React.createElement('button', {
    onClick: () => onCreate({
      address: address || '412 Elizabeth St',
      priority,
      type
    }),
    style: {
      background: 'var(--civic-primary)',
      color: '#fff',
      border: 'none',
      padding: '9px 16px',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Dispatch'))));
}
function AssignModal({
  zoneId,
  onClose,
  onConfirm
}) {
  const officers = [{
    id: 'PCL-142',
    name: 'Alex Rivera',
    zone: 'Z-MAC',
    status: 'active'
  }, {
    id: 'PEO-118',
    name: 'Darren Wells',
    zone: 'Z-ELZ',
    status: 'active'
  }, {
    id: 'PEO-089',
    name: 'Priya Raghavan',
    zone: 'Z-CBN',
    status: 'active'
  }, {
    id: 'PR-211',
    name: 'Jordan Mikolas',
    zone: '—',
    status: 'inactive'
  }, {
    id: 'PEO-124',
    name: 'Elena Ostroff',
    zone: 'Z-LON',
    status: 'active'
  }];
  return React.createElement(Modal, {
    title: 'Assign officer to ' + zoneId,
    onClose
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, officers.map(o => React.createElement('button', {
    key: o.id,
    onClick: () => onConfirm(o),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      background: 'var(--civic-surface-raised)',
      border: '1px solid var(--civic-neutral-100)',
      borderRadius: 8,
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, React.createElement('span', {
    style: {
      width: 10,
      height: 10,
      borderRadius: 99,
      background: o.status === 'active' ? 'var(--status-active)' : 'var(--civic-neutral-300)'
    }
  }), React.createElement('div', {
    style: {
      flex: 1
    }
  }, React.createElement('div', {
    style: {
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--civic-neutral-900)'
    }
  }, o.name), React.createElement('div', {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-neutral-500)'
    }
  }, o.id + ' · currently ' + o.zone)), React.createElement('span', {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      color: 'var(--civic-accent-dark)'
    }
  }, 'Select →')))));
}
function Code21Detail({
  sr,
  onClose
}) {
  return React.createElement(Modal, {
    title: sr.sr + ' — ' + sr.address,
    onClose,
    accent: 'var(--status-alert)'
  }, React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      marginBottom: 14
    }
  }, ['Status', 'Dispatched'].map((_, i) => null), React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600
    }
  }, 'Priority'), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: 14,
      marginTop: 4
    }
  }, 'P2 — Standard')), React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600
    }
  }, 'Assigned'), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: 14,
      marginTop: 4
    }
  }, 'PEO-118')), React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600
    }
  }, 'Received'), React.createElement('div', {
    style: {
      fontSize: 13,
      marginTop: 4
    }
  }, '14:32 AEDT')), React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600
    }
  }, 'Zone'), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      marginTop: 4
    }
  }, 'Z-ELZ · Elizabeth'))), React.createElement('div', {
    style: {
      padding: '10px 12px',
      background: 'var(--civic-surface-sunken)',
      borderRadius: 6,
      fontSize: 12,
      color: 'var(--civic-neutral-700)',
      marginBottom: 14
    }
  }, 'Silver sedan parked across loading zone outside 412 Elizabeth St. Blocking delivery access.'), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 8
    }
  }, React.createElement('button', {
    onClick: onClose,
    style: {
      flex: 1,
      background: 'var(--civic-surface-sunken)',
      color: 'var(--civic-neutral-700)',
      border: 'none',
      padding: '10px',
      borderRadius: 6,
      fontWeight: 500,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Reassign'), React.createElement('button', {
    onClick: onClose,
    style: {
      flex: 1,
      background: 'var(--civic-secondary)',
      color: '#fff',
      border: 'none',
      padding: '10px',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Mark In Progress')));
}
window.NewSRModal = NewSRModal;
window.AssignModal = AssignModal;
window.Code21Detail = Code21Detail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/commandmaps/Modals.jsx", error: String((e && e.message) || e) }); }

// ui_kits/commandmaps/OtherPages.jsx
try { (() => {
/* CommandMAPS — Directory + Audit simple pages */
function DirectoryPage() {
  const rows = [{
    id: 'PCL-142',
    name: 'Alex Rivera',
    role: 'COMPLIANCE_LEAD',
    zone: 'Z-MAC',
    status: 'active',
    last: '14:36'
  }, {
    id: 'PEO-118',
    name: 'Darren Wells',
    role: 'SUPERVISOR',
    zone: 'Z-ELZ',
    status: 'active',
    last: '14:34'
  }, {
    id: 'PEO-089',
    name: 'Priya Raghavan',
    role: 'OFFICER',
    zone: 'Z-CBN',
    status: 'active',
    last: '14:33'
  }, {
    id: 'PR-211',
    name: 'Jordan Mikolas',
    role: 'OFFICER',
    zone: '—',
    status: 'inactive',
    last: '12:10'
  }, {
    id: 'PEO-124',
    name: 'Elena Ostroff',
    role: 'OFFICER',
    zone: 'Z-LON',
    status: 'active',
    last: '14:35'
  }, {
    id: 'DSP-077',
    name: 'Marcus Beaufort',
    role: 'DISPATCH',
    zone: '—',
    status: 'active',
    last: '14:36'
  }, {
    id: 'PEO-206',
    name: 'Anya Kovacs',
    role: 'OFFICER',
    zone: 'Z-SWM',
    status: 'active',
    last: '14:34'
  }, {
    id: 'PEO-163',
    name: 'Rohan Patel',
    role: 'OFFICER',
    zone: 'Z-FLI',
    status: 'active',
    last: '14:30'
  }];
  const roleTag = {
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    letterSpacing: '.04em'
  };
  const roleColor = {
    COMPLIANCE_LEAD: ['var(--role-lead-bg)', 'var(--role-lead)'],
    SUPERVISOR: ['var(--role-supervisor-bg)', 'var(--role-supervisor)'],
    OFFICER: ['var(--role-officer-bg)', 'var(--role-officer)'],
    DISPATCH: ['var(--role-dispatch-bg)', 'var(--role-dispatch)']
  };
  return React.createElement('div', {
    style: {
      padding: 24,
      background: 'var(--civic-surface-raised)',
      flex: 1,
      overflow: 'auto'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, React.createElement('div', null, React.createElement('h2', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, 'Directory'), React.createElement('p', {
    style: {
      margin: '2px 0 0',
      color: 'var(--civic-neutral-500)',
      fontSize: 13
    }
  }, '8 officers · 12 online · 2 offline')), React.createElement('button', {
    style: {
      background: 'var(--civic-primary)',
      color: '#fff',
      border: 'none',
      padding: '8px 14px',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'inherit'
    }
  }, React.createElement(LucideIcon, {
    name: 'Plus',
    size: 14
  }), 'Add officer')), React.createElement('div', {
    style: {
      background: '#fff',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 10,
      overflow: 'hidden'
    }
  }, React.createElement('table', {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, React.createElement('thead', null, React.createElement('tr', {
    style: {
      background: 'var(--civic-neutral-100)',
      textAlign: 'left',
      fontSize: 11,
      color: 'var(--civic-neutral-600)',
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      fontWeight: 600
    }
  }, ['', 'Badge', 'Name', 'Role', 'Assigned zone', 'Last ping'].map((h, i) => React.createElement('th', {
    key: i,
    style: {
      padding: '10px 14px'
    }
  }, h)))), React.createElement('tbody', null, rows.map((r, i) => React.createElement('tr', {
    key: r.id,
    style: {
      borderTop: '1px solid var(--civic-neutral-100)',
      background: i % 2 ? 'var(--civic-surface-raised)' : '#fff'
    }
  }, React.createElement('td', {
    style: {
      padding: '10px 14px',
      width: 20
    }
  }, React.createElement('span', {
    style: {
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: 99,
      background: r.status === 'active' ? 'var(--status-active)' : 'var(--civic-neutral-300)'
    }
  })), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-neutral-900)',
      fontWeight: 600
    }
  }, r.id), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontSize: 13,
      fontWeight: 500
    }
  }, r.name), React.createElement('td', {
    style: {
      padding: '10px 14px'
    }
  }, React.createElement('span', {
    style: {
      ...roleTag,
      background: roleColor[r.role][0],
      color: roleColor[r.role][1]
    }
  }, r.role)), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-neutral-700)'
    }
  }, r.zone), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-neutral-500)'
    }
  }, r.last)))))), React.createElement('div', {
    style: {
      marginTop: 10,
      fontSize: 11,
      color: 'var(--civic-neutral-500)',
      fontFamily: 'var(--font-mono)'
    }
  }, '25 per page · Page 1 of 1'));
}
function AuditPage() {
  const events = [{
    t: '14:36:02',
    actor: 'Alex Rivera',
    action: 'SR_DISPATCHED',
    target: 'SR-2026-0418-042',
    meta: '→ PEO-118'
  }, {
    t: '14:34:55',
    actor: 'System',
    action: 'ZONE_REASSIGNED',
    target: 'Z-ELZ',
    meta: 'PR-211 → PEO-118'
  }, {
    t: '14:33:11',
    actor: 'Priya Raghavan',
    action: 'INFRINGEMENT_ISSUED',
    target: 'INF-8841',
    meta: 'AUD 203.51 · Carlton N'
  }, {
    t: '14:30:28',
    actor: 'Darren Wells',
    action: 'CODE2_LOGGED',
    target: 'Z-ELZ',
    meta: 'Lunch — 30 min'
  }, {
    t: '14:12:10',
    actor: 'Admin',
    action: 'ROLE_CHANGED',
    target: 'PEO-124',
    meta: 'OFFICER → SUPERVISOR'
  }, {
    t: '13:58:00',
    actor: 'Marcus Beaufort',
    action: 'SR_CREATED',
    target: 'SR-2026-0418-041',
    meta: 'Elizabeth St'
  }];
  const actionColor = {
    SR_DISPATCHED: 'var(--status-alert)',
    ZONE_REASSIGNED: 'var(--status-pending)',
    INFRINGEMENT_ISSUED: 'var(--status-issued)',
    CODE2_LOGGED: 'var(--status-active)',
    ROLE_CHANGED: 'var(--civic-accent-dark)',
    SR_CREATED: 'var(--civic-primary)'
  };
  return React.createElement('div', {
    style: {
      padding: 24,
      background: 'var(--civic-surface-raised)',
      flex: 1,
      overflow: 'auto'
    }
  }, React.createElement('h2', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, 'Audit activity'), React.createElement('p', {
    style: {
      margin: '2px 0 16px',
      color: 'var(--civic-neutral-500)',
      fontSize: 13
    }
  }, 'Tuesday 18 April 2026 · AEDT'), React.createElement('div', {
    style: {
      background: '#fff',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 10
    }
  }, events.map((e, i) => React.createElement('div', {
    key: i,
    style: {
      padding: '12px 16px',
      display: 'grid',
      gridTemplateColumns: '86px 1fr 220px',
      gap: 12,
      alignItems: 'center',
      borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none'
    }
  }, React.createElement('div', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-neutral-500)'
    }
  }, e.t), React.createElement('div', null, React.createElement('span', {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      padding: '2px 8px',
      borderRadius: 99,
      background: 'var(--civic-surface-sunken)',
      color: actionColor[e.action] || 'var(--civic-neutral-700)',
      marginRight: 8
    }
  }, e.action.replace(/_/g, ' ')), React.createElement('span', {
    style: {
      fontSize: 13,
      color: 'var(--civic-neutral-900)',
      fontWeight: 500
    }
  }, e.actor), ' ', React.createElement('span', {
    style: {
      fontSize: 12,
      color: 'var(--civic-neutral-500)'
    }
  }, 'on '), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--civic-primary)'
    }
  }, e.target)), React.createElement('div', {
    style: {
      fontSize: 12,
      color: 'var(--civic-neutral-500)',
      textAlign: 'right'
    }
  }, e.meta)))));
}
window.DirectoryPage = DirectoryPage;
window.AuditPage = AuditPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/commandmaps/OtherPages.jsx", error: String((e && e.message) || e) }); }

// ui_kits/commandmaps/Shell.jsx
try { (() => {
/* CommandMAPS — Shell (header + nav) */
const {
  useState
} = React;
function LucideIcon({
  name,
  size = 20,
  stroke = 2
}) {
  // Minimal inline Lucide SVGs used across the kit
  const paths = {
    LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    Users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    Map: 'M1 6v16l7-3 8 3 7-3V3l-7 3-8-3-7 3zM8 3v15M16 6v15',
    Search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    LogOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    Menu: 'M3 6h18M3 12h18M3 18h18',
    Plus: 'M12 5v14M5 12h14',
    ChevronRight: 'M9 18l6-6-6-6',
    ChevronLeft: 'M15 18l-6-6 6-6',
    Siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14M21 12h1M3 12h1M19.07 4.93l.7-.7M4.23 4.93l-.7-.7',
    Radio: 'M4.9 19.1A10 10 0 0 1 1 12M19.1 4.9A10 10 0 0 0 12 2M4.9 4.9A10 10 0 0 0 1 12M19.1 19.1A10 10 0 0 1 12 22M8.5 15.5a3.5 3.5 0 0 1 0-7',
    ClipboardList: 'M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h6M9 8h.01',
    Bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0',
    User: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    Car: 'M7 17h10M5 17l1-6h12l1 6M5 11l1.4-4.2A2 2 0 0 1 8.3 5.5h7.4a2 2 0 0 1 1.9 1.3L19 11M5 11h14v6H5zM7 20v-3M17 20v-3',
    Camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    X: 'M18 6 6 18M6 6l12 12'
  };
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, (paths[name] || '').split(/(?=[MLH])/).map((d, i) => React.createElement('path', {
    key: i,
    d
  })));
}
function Header({
  page,
  onPage,
  user,
  onLogout,
  dispatch
}) {
  const navItems = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard'
  }, {
    id: 'directory',
    label: 'Directory',
    icon: 'Users'
  }, {
    id: 'assignments',
    label: 'Assignments',
    icon: 'Map'
  }, {
    id: 'lookup',
    label: 'Look Up',
    icon: 'Search'
  }, {
    id: 'audit',
    label: 'Audit',
    icon: 'ClipboardList'
  }];
  const bg = dispatch ? 'var(--civic-secondary-dark)' : 'var(--civic-primary)';
  return React.createElement('header', {
    style: {
      background: bg,
      color: '#fff',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, React.createElement('div', {
    style: {
      width: 28,
      height: 28,
      borderRadius: 6,
      background: 'rgba(255,255,255,.08)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--civic-accent)'
    }
  }, React.createElement(LucideIcon, {
    name: 'Shield',
    size: 18,
    stroke: 2.2
  })), React.createElement('h1', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      letterSpacing: '.01em'
    }
  }, dispatch ? 'CommandMAPS · Dispatch' : 'CommandMAPS')), React.createElement('nav', {
    style: {
      display: 'flex',
      gap: 2
    }
  }, navItems.map(item => React.createElement('button', {
    key: item.id,
    onClick: () => onPage(item.id),
    style: {
      background: page === item.id ? 'rgba(255,255,255,.2)' : 'transparent',
      color: page === item.id ? '#fff' : 'rgba(255,255,255,.7)',
      border: 'none',
      padding: '6px 12px',
      borderRadius: 6,
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'inherit'
    }
  }, React.createElement(LucideIcon, {
    name: item.icon,
    size: 14
  }), item.label)))), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement('span', {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-accent)',
      padding: '2px 8px',
      border: '1px solid rgba(212,168,67,.4)',
      borderRadius: 4,
      letterSpacing: '.04em'
    }
  }, user.dept || 'COMPLIANCE 629'), React.createElement('button', {
    onClick: onLogout,
    style: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(255,255,255,.7)',
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'inherit'
    }
  }, React.createElement(LucideIcon, {
    name: 'LogOut',
    size: 14
  }), 'Logout')));
}
window.LucideIcon = LucideIcon;
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/commandmaps/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dispatch/Detail.jsx
try { (() => {
/* Dispatch — Code21 detail drawer (lifecycle + actions) */

function LifecycleTrack({
  current
}) {
  // 11-state lifecycle, server-enforced. Show progress through happy path; branches shown as side states
  const happy = ['RECEIVED', 'DISPATCHED_NOT_ACTIVE', 'DISPATCHED_ACTIVE', 'IN_PROGRESS', 'ATTENDED', 'PIN_ISSUED', 'COMPLETED'];
  const idx = happy.indexOf(current);
  const onPath = idx !== -1;
  return React.createElement('div', null, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0
    }
  }, happy.map((s, i) => {
    const reached = onPath && i <= idx;
    const isCurrent = onPath && i === idx;
    return React.createElement(React.Fragment, {
      key: s
    }, React.createElement('div', {
      title: s,
      style: {
        width: isCurrent ? 16 : 10,
        height: isCurrent ? 16 : 10,
        borderRadius: 99,
        background: reached ? 'var(--civic-secondary)' : 'var(--civic-neutral-200)',
        border: isCurrent ? '3px solid var(--civic-secondary-light)' : 'none',
        flexShrink: 0
      }
    }), i < happy.length - 1 && React.createElement('div', {
      style: {
        flex: 1,
        height: 2,
        background: reached && i < idx ? 'var(--civic-secondary)' : 'var(--civic-neutral-200)'
      }
    }));
  })), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 6,
      fontSize: 9,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, happy.map(s => React.createElement('span', {
    key: s,
    style: {
      textAlign: 'center',
      flex: 1,
      color: s === current ? 'var(--civic-secondary-dark)' : 'var(--civic-neutral-400)',
      fontWeight: s === current ? 700 : 400
    }
  }, s.replace(/_/g, ' ').slice(0, 8)))), !onPath && React.createElement('div', {
    style: {
      marginTop: 8,
      padding: '6px 10px',
      background: 'var(--civic-surface-sunken)',
      borderRadius: 6,
      fontSize: 11,
      color: 'var(--civic-neutral-700)'
    }
  }, 'Branch state: ', React.createElement('strong', {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, current)));
}
function DetailDrawer({
  sr,
  onClose,
  onAdvance
}) {
  if (!sr) return null;
  const m = STATUS_META[sr.status];
  const meta = [['Priority', sr.priority, true], ['Type', sr.type, false], ['Zone', sr.zone, true], ['Officer', sr.officer || 'Unassigned', true], ['ETA', sr.eta, false], ['Received', sr.received + ' AEDT', true]];
  // Next action depends on current status (server enforces transitions)
  const next = {
    RECEIVED: {
      label: 'Dispatch officer',
      to: 'DISPATCHED_NOT_ACTIVE'
    },
    DISPATCHED_NOT_ACTIVE: {
      label: 'Mark active',
      to: 'DISPATCHED_ACTIVE'
    },
    DISPATCHED_ACTIVE: {
      label: 'Mark in progress',
      to: 'IN_PROGRESS'
    },
    IN_PROGRESS: {
      label: 'Mark attended',
      to: 'ATTENDED'
    },
    ATTENDED: {
      label: 'Issue PIN',
      to: 'PIN_ISSUED'
    },
    PIN_ISSUED: {
      label: 'Close',
      to: 'COMPLETED'
    }
  }[sr.status];
  return React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(15,23,42,.45)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 100
    },
    onClick: onClose
  }, React.createElement('div', {
    onClick: e => e.stopPropagation(),
    style: {
      width: 520,
      maxWidth: '92%',
      background: '#fff',
      height: '100%',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slidein .35s cubic-bezier(.4,0,.2,1)'
    }
  }, React.createElement('div', {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid var(--civic-neutral-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: '4px solid var(--civic-secondary)'
    }
  }, React.createElement('div', null, React.createElement('div', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--civic-neutral-500)',
      fontWeight: 600
    }
  }, sr.sr), React.createElement('h3', {
    style: {
      margin: '2px 0 0',
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, sr.addr)), React.createElement('button', {
    onClick: onClose,
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--civic-neutral-400)',
      padding: 4,
      display: 'grid',
      placeItems: 'center'
    }
  }, React.createElement(DispIcon, {
    name: 'X',
    size: 20
  }))), React.createElement('div', {
    style: {
      padding: 18,
      overflowY: 'auto',
      flex: 1
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16
    }
  }, React.createElement(PriorityChip, {
    p: sr.priority
  }), React.createElement(StatusPill, {
    s: sr.status
  })), React.createElement('div', {
    style: {
      background: 'var(--civic-surface-raised)',
      padding: 14,
      borderRadius: 10,
      marginBottom: 16
    }
  }, React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600,
      marginBottom: 8
    }
  }, 'Lifecycle'), React.createElement(LifecycleTrack, {
    current: sr.status
  })), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 16
    }
  }, meta.map(([k, v, mono], i) => React.createElement('div', {
    key: i,
    style: {
      padding: '8px 10px',
      background: 'var(--civic-surface-raised)',
      borderRadius: 6
    }
  }, React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      fontWeight: 600
    }
  }, k), React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--civic-neutral-900)',
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      marginTop: 2
    }
  }, v)))), React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600,
      marginBottom: 6
    }
  }, 'Description'), React.createElement('div', {
    style: {
      padding: '10px 12px',
      background: 'var(--civic-surface-sunken)',
      borderRadius: 6,
      fontSize: 13,
      color: 'var(--civic-neutral-700)',
      lineHeight: 1.5,
      marginBottom: 16
    }
  }, 'Silver sedan parked across loading zone outside ' + sr.addr + '. Reported by business owner. Plate ', React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, '1ABC-234'), '.'), React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600,
      marginBottom: 6
    }
  }, 'Routing'), React.createElement('div', {
    style: {
      padding: '10px 12px',
      background: 'var(--civic-surface-sunken)',
      borderRadius: 6,
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-neutral-700)',
      marginBottom: 16
    }
  }, 'GPS: -37.81423, 144.96326', React.createElement('br'), 'Distance: 480 m · Walk ETA: 6 min · Drive: 3 min')), React.createElement('div', {
    style: {
      padding: 14,
      borderTop: '1px solid var(--civic-neutral-100)',
      display: 'flex',
      gap: 8,
      background: '#fff'
    }
  }, React.createElement('button', {
    onClick: onClose,
    style: {
      background: 'var(--civic-surface-sunken)',
      color: 'var(--civic-neutral-700)',
      border: 'none',
      padding: '10px 16px',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Close'), React.createElement('button', {
    style: {
      background: 'transparent',
      color: 'var(--status-emergency)',
      border: '1px solid var(--status-emergency-border)',
      padding: '10px 14px',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Void'), React.createElement('div', {
    style: {
      flex: 1
    }
  }), next && React.createElement('button', {
    onClick: () => onAdvance(next.to),
    style: {
      background: 'var(--civic-secondary-dark)',
      color: '#fff',
      border: 'none',
      padding: '10px 18px',
      borderRadius: 6,
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'inherit'
    }
  }, next.label, React.createElement(DispIcon, {
    name: 'ChevronRight',
    size: 16
  })))));
}
function CreateSRModal({
  onClose,
  onCreate
}) {
  const [addr, setAddr] = dwS('');
  const [pri, setPri] = dwS('P2');
  const [type, setType] = dwS('PARK');
  const field = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    border: '1px solid var(--civic-neutral-200)',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'inherit'
  };
  const lab = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--civic-neutral-600)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    marginBottom: 4
  };
  return React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--civic-surface-overlay)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 110
    },
    onClick: onClose
  }, React.createElement('div', {
    onClick: e => e.stopPropagation(),
    style: {
      width: 520,
      maxWidth: '92%',
      background: '#fff',
      borderRadius: 12,
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      borderLeft: '4px solid var(--civic-secondary)'
    }
  }, React.createElement('div', {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid var(--civic-neutral-100)',
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, React.createElement('h3', {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 700
    }
  }, 'New Code21 — service request'), React.createElement('button', {
    onClick: onClose,
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--civic-neutral-400)'
    }
  }, React.createElement(DispIcon, {
    name: 'X',
    size: 18
  }))), React.createElement('div', {
    style: {
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, React.createElement('div', null, React.createElement('label', {
    style: lab
  }, 'Location'), React.createElement('input', {
    style: field,
    value: addr,
    onChange: e => setAddr(e.target.value),
    placeholder: '412 Elizabeth St, Melbourne VIC'
  })), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, React.createElement('div', null, React.createElement('label', {
    style: lab
  }, 'Type'), React.createElement('select', {
    style: field,
    value: type,
    onChange: e => setType(e.target.value)
  }, React.createElement('option', {
    value: 'PARK'
  }, 'Parking violation'), React.createElement('option', {
    value: 'OBS'
  }, 'Obstruction'), React.createElement('option', {
    value: 'ABA'
  }, 'Abandoned vehicle'), React.createElement('option', {
    value: 'OVR'
  }, 'Meter overstay'))), React.createElement('div', null, React.createElement('label', {
    style: lab
  }, 'Priority'), React.createElement('select', {
    style: field,
    value: pri,
    onChange: e => setPri(e.target.value)
  }, React.createElement('option', {
    value: 'P1'
  }, 'P1 — Urgent'), React.createElement('option', {
    value: 'P2'
  }, 'P2 — Standard'), React.createElement('option', {
    value: 'P3'
  }, 'P3 — Low')))), React.createElement('div', {
    style: {
      padding: '10px 12px',
      background: 'var(--civic-surface-sunken)',
      borderRadius: 6,
      fontSize: 12,
      color: 'var(--civic-neutral-700)',
      display: 'flex',
      gap: 8
    }
  }, React.createElement(DispIcon, {
    name: 'MapPin',
    size: 14
  }), 'Server will auto-route to the nearest on-shift officer in the resolved zone.'), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8
    }
  }, React.createElement('button', {
    onClick: onClose,
    style: {
      background: 'transparent',
      color: 'var(--civic-neutral-600)',
      border: '1px solid var(--civic-neutral-200)',
      padding: '9px 14px',
      borderRadius: 6,
      fontWeight: 500,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Cancel'), React.createElement('button', {
    onClick: () => onCreate({
      addr: addr || '412 Elizabeth St',
      priority: pri
    }),
    style: {
      background: 'var(--civic-secondary-dark)',
      color: '#fff',
      border: 'none',
      padding: '9px 18px',
      borderRadius: 6,
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Create & dispatch')))));
}
window.DetailDrawer = DetailDrawer;
window.CreateSRModal = CreateSRModal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dispatch/Detail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dispatch/DispatchDashboard.jsx
try { (() => {
/* Dispatch — Code21 Dashboard (queue + filters + detail panel)
   Mirrors the repo's Code21Page dashboard: filterable list, opening detail modal.
   Dispatcher-focused — no admin features.
   (Previously named "Workbench" in this design system; renamed to match the
   real application route, which is Dashboard.) */
const {
  useState: dwS,
  useEffect: dwE
} = React;
const SR_LIFECYCLE = ['RECEIVED', 'DISPATCHED_NOT_ACTIVE', 'DISPATCHED_ACTIVE', 'IN_PROGRESS', 'ATTENDED', 'PIN_ISSUED', 'NO_REPORT', 'COMPLETED', 'VOIDED', 'CANCELLED', 'CLOSED'];
const STATUS_META = {
  RECEIVED: {
    fg: 'var(--status-pending-strong)',
    bg: 'var(--status-pending-bg)',
    label: 'Received',
    icon: 'Inbox'
  },
  DISPATCHED_NOT_ACTIVE: {
    fg: 'var(--status-issued)',
    bg: 'var(--status-issued-bg)',
    label: 'Dispatched',
    icon: 'Clock'
  },
  DISPATCHED_ACTIVE: {
    fg: 'var(--status-alert-strong)',
    bg: 'var(--status-alert-bg)',
    label: 'Dispatched (live)',
    icon: 'Radio'
  },
  IN_PROGRESS: {
    fg: 'var(--status-active-strong)',
    bg: 'var(--status-active-bg)',
    label: 'In Progress',
    icon: 'Radio'
  },
  ATTENDED: {
    fg: 'var(--status-attended)',
    bg: 'var(--status-attended-bg)',
    label: 'Attended',
    icon: 'MapPin'
  },
  PIN_ISSUED: {
    fg: 'var(--status-issued-strong)',
    bg: 'var(--status-issued-bg)',
    label: 'PIN Issued',
    icon: 'ClipboardList'
  },
  NO_REPORT: {
    fg: 'var(--status-issued-deep)',
    bg: 'var(--status-issued-bg)',
    label: 'No Report',
    icon: 'ClipboardList'
  },
  COMPLETED: {
    fg: 'var(--civic-neutral-600)',
    bg: 'var(--civic-neutral-100)',
    label: 'Completed',
    icon: 'ClipboardList'
  },
  VOIDED: {
    fg: 'var(--status-emergency-deep)',
    bg: 'var(--status-emergency-bg)',
    label: 'Voided',
    icon: 'X'
  },
  CANCELLED: {
    fg: 'var(--civic-neutral-500)',
    bg: 'var(--civic-neutral-100)',
    label: 'Cancelled',
    icon: 'X'
  },
  CLOSED: {
    fg: 'var(--civic-neutral-500)',
    bg: 'var(--civic-neutral-100)',
    label: 'Closed',
    icon: 'ClipboardList'
  }
};
function StatusPill({
  s
}) {
  const m = STATUS_META[s] || STATUS_META.RECEIVED;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      borderRadius: 99,
      background: m.bg,
      color: m.fg,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, React.createElement(DispIcon, {
    name: m.icon,
    size: 11,
    stroke: 2.4
  }), m.label);
}
const QUEUE = [{
  sr: 'SR-2026-00871',
  addr: '412 Elizabeth St',
  zone: 'Z-ELZ',
  priority: 'P2',
  status: 'RECEIVED',
  officer: null,
  eta: '—',
  received: '14:32',
  type: 'Parking violation'
}, {
  sr: 'SR-2026-00870',
  addr: '88 Lonsdale St',
  zone: 'Z-LON',
  priority: 'P1',
  status: 'DISPATCHED_ACTIVE',
  officer: 'PEO-118',
  eta: '3 min',
  received: '14:28',
  type: 'Obstruction'
}, {
  sr: 'SR-2026-00869',
  addr: '220 Swanston St',
  zone: 'Z-SWM',
  priority: 'P2',
  status: 'IN_PROGRESS',
  officer: 'PEO-206',
  eta: 'on-scene',
  received: '14:12',
  type: 'Abandoned vehicle'
}, {
  sr: 'SR-2026-00868',
  addr: 'Q.V. Market',
  zone: 'Z-MAC',
  priority: 'P3',
  status: 'ATTENDED',
  officer: 'PCL-142',
  eta: 'on-scene',
  received: '13:55',
  type: 'Meter overstay'
}, {
  sr: 'SR-2026-00867',
  addr: '14 Carlton Pl',
  zone: 'Z-CBN',
  priority: 'P2',
  status: 'PIN_ISSUED',
  officer: 'PEO-089',
  eta: '—',
  received: '13:40',
  type: 'Parking violation'
}, {
  sr: 'SR-2026-00866',
  addr: '66 Flemington Rd',
  zone: 'Z-MAC',
  priority: 'P3',
  status: 'NO_REPORT',
  officer: 'PCL-142',
  eta: '—',
  received: '13:18',
  type: 'Meter overstay'
}, {
  sr: 'SR-2026-00865',
  addr: '301 Flinders Ln',
  zone: 'Z-FLI',
  priority: 'P2',
  status: 'COMPLETED',
  officer: 'PEO-163',
  eta: '—',
  received: '12:48',
  type: 'Parking violation'
}, {
  sr: 'SR-2026-00864',
  addr: '5 Bourke St',
  zone: 'Z-FLI',
  priority: 'P3',
  status: 'CANCELLED',
  officer: null,
  eta: '—',
  received: '12:30',
  type: 'Obstruction'
}];
function PriorityChip({
  p
}) {
  const m = {
    P1: ['var(--status-emergency)', '#fff'],
    P2: ['var(--status-alert)', 'var(--status-alert-text)'],
    P3: ['var(--civic-neutral-200)', 'var(--civic-neutral-700)']
  }[p];
  return React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      background: m[0],
      color: m[1],
      fontSize: 11,
      fontWeight: 800,
      padding: '2px 7px',
      borderRadius: 4,
      letterSpacing: '.04em'
    }
  }, p);
}
function FilterChip({
  active,
  label,
  count,
  onClick
}) {
  return React.createElement('button', {
    onClick,
    style: {
      padding: '6px 12px',
      borderRadius: 99,
      background: active ? 'var(--civic-secondary-dark)' : '#fff',
      color: active ? '#fff' : 'var(--civic-neutral-700)',
      border: '1px solid ' + (active ? 'var(--civic-secondary-dark)' : 'var(--civic-neutral-200)'),
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'inherit'
    }
  }, label, count != null && React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      padding: '1px 5px',
      borderRadius: 99,
      background: active ? 'rgba(255,255,255,.25)' : 'var(--civic-neutral-100)',
      color: active ? '#fff' : 'var(--civic-neutral-600)'
    }
  }, count));
}
function Dashboard({
  onCreate,
  onOpen
}) {
  const [filter, setFilter] = dwS('OPEN');
  const groups = {
    OPEN: ['RECEIVED', 'DISPATCHED_NOT_ACTIVE', 'DISPATCHED_ACTIVE', 'IN_PROGRESS', 'ATTENDED'],
    ALL: SR_LIFECYCLE,
    NEEDS_DISPATCH: ['RECEIVED'],
    P1: null
  };
  const rows = QUEUE.filter(r => {
    if (filter === 'P1') return r.priority === 'P1';
    return (groups[filter] || SR_LIFECYCLE).includes(r.status);
  });
  return React.createElement('div', {
    style: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      background: 'var(--civic-surface-raised)'
    }
  }, React.createElement('div', {
    style: {
      flex: 1,
      padding: 24,
      overflow: 'auto'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, React.createElement('div', null, React.createElement('h2', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, 'Code21 dashboard'), React.createElement('p', {
    style: {
      margin: '2px 0 0',
      color: 'var(--civic-neutral-500)',
      fontSize: 13
    }
  }, QUEUE.filter(r => groups.OPEN.includes(r.status)).length + ' open · ' + QUEUE.filter(r => r.status === 'RECEIVED').length + ' awaiting dispatch')), React.createElement('button', {
    onClick: onCreate,
    style: {
      background: 'var(--civic-secondary-dark)',
      color: '#fff',
      border: 'none',
      padding: '10px 16px',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'inherit'
    }
  }, React.createElement(DispIcon, {
    name: 'Plus',
    size: 16
  }), 'New Code21')), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, React.createElement(FilterChip, {
    active: filter === 'OPEN',
    onClick: () => setFilter('OPEN'),
    label: 'Open',
    count: QUEUE.filter(r => groups.OPEN.includes(r.status)).length
  }), React.createElement(FilterChip, {
    active: filter === 'NEEDS_DISPATCH',
    onClick: () => setFilter('NEEDS_DISPATCH'),
    label: 'Needs dispatch',
    count: QUEUE.filter(r => r.status === 'RECEIVED').length
  }), React.createElement(FilterChip, {
    active: filter === 'P1',
    onClick: () => setFilter('P1'),
    label: 'P1 urgent',
    count: QUEUE.filter(r => r.priority === 'P1').length
  }), React.createElement(FilterChip, {
    active: filter === 'ALL',
    onClick: () => setFilter('ALL'),
    label: 'All',
    count: QUEUE.length
  })), React.createElement('div', {
    style: {
      background: '#fff',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 10,
      overflow: 'hidden'
    }
  }, React.createElement('table', {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, React.createElement('thead', null, React.createElement('tr', {
    style: {
      background: 'var(--civic-neutral-100)',
      textAlign: 'left',
      fontSize: 11,
      color: 'var(--civic-neutral-600)',
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      fontWeight: 600
    }
  }, ['', 'SR', 'Address', 'Zone', 'Type', 'Status', 'Officer', 'ETA', 'Received'].map((h, i) => React.createElement('th', {
    key: i,
    style: {
      padding: '10px 14px',
      whiteSpace: 'nowrap'
    }
  }, h)))), React.createElement('tbody', null, rows.map((r, i) => React.createElement('tr', {
    key: r.sr,
    onClick: () => onOpen(r),
    style: {
      borderTop: '1px solid var(--civic-neutral-100)',
      background: i % 2 ? 'var(--civic-surface-raised)' : '#fff',
      cursor: 'pointer'
    }
  }, React.createElement('td', {
    style: {
      padding: '10px 14px'
    }
  }, React.createElement(PriorityChip, {
    p: r.priority
  })), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-secondary-dark)',
      fontWeight: 700
    }
  }, r.sr), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--civic-neutral-900)'
    }
  }, r.addr), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-neutral-700)'
    }
  }, r.zone), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontSize: 12,
      color: 'var(--civic-neutral-600)'
    }
  }, r.type), React.createElement('td', {
    style: {
      padding: '10px 14px'
    }
  }, React.createElement(StatusPill, {
    s: r.status
  })), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-neutral-700)'
    }
  }, r.officer || '—'), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontSize: 12,
      color: r.eta === 'on-scene' ? 'var(--status-active)' : 'var(--civic-neutral-600)',
      fontWeight: r.eta === 'on-scene' ? 600 : 400
    }
  }, r.eta), React.createElement('td', {
    style: {
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-neutral-500)'
    }
  }, r.received)))))), React.createElement('div', {
    style: {
      marginTop: 10,
      fontSize: 11,
      color: 'var(--civic-neutral-500)',
      fontFamily: 'var(--font-mono)'
    }
  }, '25 per page · Page 1 of 1 · Live via WebSocket')),
  // Right activity rail
  React.createElement('aside', {
    style: {
      width: 320,
      background: '#fff',
      borderLeft: '1px solid var(--civic-neutral-200)',
      overflow: 'auto',
      padding: 18,
      flexShrink: 0
    }
  }, React.createElement('h3', {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      marginBottom: 12
    }
  }, 'Live activity'), [{
    t: '14:36:02',
    text: 'PEO-118 acknowledged ',
    mono: 'SR-2026-00870'
  }, {
    t: '14:35:11',
    text: 'Channel 3 — roster call complete'
  }, {
    t: '14:34:55',
    text: 'Z-ELZ reassigned ',
    mono: 'PR-211 → PEO-118'
  }, {
    t: '14:33:11',
    text: 'Infringement issued ',
    mono: 'INF-8841'
  }, {
    t: '14:32:00',
    text: 'New Code21 ',
    mono: 'SR-2026-00871'
  }].map((e, i) => React.createElement('div', {
    key: i,
    style: {
      padding: '10px 0',
      borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none'
    }
  }, React.createElement('div', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--civic-neutral-400)',
      marginBottom: 2
    }
  }, e.t), React.createElement('div', {
    style: {
      fontSize: 12,
      color: 'var(--civic-neutral-800)'
    }
  }, e.text, e.mono && React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      color: 'var(--civic-secondary-dark)'
    }
  }, e.mono))))));
}
window.STATUS_META = STATUS_META;
window.SR_LIFECYCLE = SR_LIFECYCLE;
window.StatusPill = StatusPill;
window.PriorityChip = PriorityChip;
window.Dashboard = Dashboard;
// Back-compat alias — older references to Workbench still resolve.
window.Workbench = Dashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dispatch/DispatchDashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dispatch/DispatchShell.jsx
try { (() => {
/* Dispatch — Shell (header + nav, teal-accented dispatcher context) */

function DispIcon({
  name,
  size = 20,
  stroke = 2
}) {
  const paths = {
    LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    Map: 'M1 6v16l7-3 8 3 7-3V3l-7 3-8-3-7 3zM8 3v15M16 6v15',
    Search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    LogOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    Plus: 'M12 5v14M5 12h14',
    ChevronRight: 'M9 18l6-6-6-6',
    ChevronLeft: 'M15 18l-6-6 6-6',
    Siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14M21 12h1M3 12h1M19.07 4.93l.7-.7M4.23 4.93l-.7-.7',
    Radio: 'M4.9 19.1A10 10 0 0 1 1 12M19.1 4.9A10 10 0 0 0 12 2M4.9 4.9A10 10 0 0 0 1 12M19.1 19.1A10 10 0 0 1 12 22M8.5 15.5a3.5 3.5 0 0 1 0-7',
    ClipboardList: 'M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h6M9 8h.01',
    MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    Filter: 'M22 3H2l8 9.46V19l4 2v-8.54z',
    Clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    X: 'M18 6 6 18M6 6l12 12',
    Inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    Phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'
  };
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, (paths[name] || '').split(/(?=[MLH])/).map((d, i) => React.createElement('path', {
    key: i,
    d
  })));
}
function DispHeader({
  page,
  onPage,
  user,
  onLogout
}) {
  // DISPATCHER role-restricted nav: no Directory, no Audit, no Settings
  const navItems = [{
    id: 'dashboard',
    label: 'Code21 Dashboard',
    icon: 'Inbox'
  }, {
    id: 'map',
    label: 'Live Map',
    icon: 'LayoutDashboard'
  }, {
    id: 'assignments',
    label: 'Assignments',
    icon: 'Map'
  }, {
    id: 'lookup',
    label: 'Look Up',
    icon: 'Search'
  }];
  return React.createElement('header', {
    style: {
      background: 'var(--civic-secondary-dark)',
      color: '#fff',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      borderBottom: '3px solid var(--civic-secondary)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, React.createElement('div', {
    style: {
      width: 28,
      height: 28,
      borderRadius: 6,
      background: 'rgba(255,255,255,.08)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--civic-accent)'
    }
  }, React.createElement(DispIcon, {
    name: 'Radio',
    size: 18,
    stroke: 2.2
  })), React.createElement('div', null, React.createElement('h1', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      letterSpacing: '.01em'
    }
  }, 'Dispatch'), React.createElement('div', {
    style: {
      fontSize: 10,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-accent-light)',
      letterSpacing: '.06em'
    }
  }, 'CIVIC MAPS · CH 3 ELIZABETH'))), React.createElement('nav', {
    style: {
      display: 'flex',
      gap: 2
    }
  }, navItems.map(item => React.createElement('button', {
    key: item.id,
    onClick: () => onPage(item.id),
    style: {
      background: page === item.id ? 'rgba(255,255,255,.2)' : 'transparent',
      color: page === item.id ? '#fff' : 'rgba(255,255,255,.75)',
      border: 'none',
      padding: '6px 12px',
      borderRadius: 6,
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'inherit'
    }
  }, React.createElement(DispIcon, {
    name: item.icon,
    size: 14
  }), item.label)))), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'rgba(255,255,255,.85)'
    }
  }, React.createElement('span', {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: 'var(--status-active)',
      boxShadow: '0 0 0 3px rgba(22,163,74,.25)'
    }
  }), 'WS LIVE'), React.createElement('span', {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-accent)',
      padding: '2px 8px',
      border: '1px solid rgba(212,168,67,.4)',
      borderRadius: 4,
      letterSpacing: '.04em'
    }
  }, user.dept || 'DISPATCH'), React.createElement('button', {
    onClick: onLogout,
    style: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(255,255,255,.7)',
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'inherit'
    }
  }, React.createElement(DispIcon, {
    name: 'LogOut',
    size: 14
  }), 'Sign off')));
}
window.DispIcon = DispIcon;
window.DispHeader = DispHeader;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dispatch/DispatchShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/enforcementmaps/MobileShell.jsx
try { (() => {
/* EnforcementMAPS — Android mobile UI shared components */

const Icon = window.LucideIcon || function Icon({
  name,
  size = 20,
  stroke = 2
}) {
  const paths = {
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    Radio: 'M4.9 19.1A10 10 0 0 1 1 12M19.1 4.9A10 10 0 0 0 12 2M4.9 4.9A10 10 0 0 0 1 12M19.1 19.1A10 10 0 0 1 12 22M8.5 15.5a3.5 3.5 0 0 1 0-7',
    ClipboardList: 'M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h6M9 8h.01',
    User: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    Check: 'M20 6 9 17l-5-5',
    X: 'M18 6 6 18M6 6l12 12',
    ChevronLeft: 'M15 18l-6-6 6-6',
    ChevronRight: 'M9 18l6-6-6-6',
    Mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8',
    Bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0',
    Siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14M21 12h1M3 12h1M19.07 4.93l.7-.7M4.23 4.93l-.7-.7',
    Signal: 'M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16',
    Battery: 'M20 17H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1zM23 13v-2M7 10v4M11 10v4M15 10v4',
    Wifi: 'M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01',
    Car: 'M7 17h10M5 17l1-6h12l1 6M5 11l1.4-4.2A2 2 0 0 1 8.3 5.5h7.4a2 2 0 0 1 1.9 1.3L19 11M5 11h14v6H5zM7 20v-3M17 20v-3',
    Camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    Receipt: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1zM8 7h8M8 11h8M8 15h5'
  };
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, (paths[name] || '').split(/(?=[MLH])/).map((d, i) => React.createElement('path', {
    key: i,
    d
  })));
};
function StatusBar({
  time = '14:36',
  battery = 72
}) {
  return React.createElement('div', {
    style: {
      height: 28,
      background: 'var(--civic-primary-dark)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 14px',
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      flexShrink: 0
    }
  }, React.createElement('span', null, time), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement(Icon, {
    name: 'Signal',
    size: 12
  }), React.createElement(Icon, {
    name: 'Wifi',
    size: 12
  }), React.createElement('span', {
    style: {
      fontSize: 10
    }
  }, battery + '%'), React.createElement(Icon, {
    name: 'Battery',
    size: 14
  })));
}
function AppHeader({
  title,
  subtitle,
  onBack,
  right
}) {
  return React.createElement('div', {
    style: {
      background: 'var(--civic-primary)',
      color: '#fff',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0
    }
  }, onBack && React.createElement('button', {
    onClick: onBack,
    style: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      padding: 4,
      cursor: 'pointer',
      display: 'grid',
      placeItems: 'center'
    }
  }, React.createElement(Icon, {
    name: 'ChevronLeft',
    size: 22
  })), React.createElement('div', {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement('div', {
    style: {
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'var(--font-display)',
      lineHeight: 1.2
    }
  }, title), subtitle && React.createElement('div', {
    style: {
      fontSize: 11,
      opacity: .8,
      fontFamily: 'var(--font-mono)'
    }
  }, subtitle)), right);
}
function TabBar({
  active,
  onSelect
}) {
  const tabs = [{
    id: 'map',
    label: 'Patrol',
    icon: 'MapPin'
  }, {
    id: 'ptt',
    label: 'PTT',
    icon: 'Radio'
  }, {
    id: 'jobs',
    label: 'Jobs',
    icon: 'ClipboardList'
  }, {
    id: 'profile',
    label: 'Profile',
    icon: 'User'
  }];
  return React.createElement('div', {
    style: {
      background: '#fff',
      borderTop: '1px solid var(--civic-neutral-200)',
      display: 'flex',
      height: 64,
      flexShrink: 0
    }
  }, tabs.map(t => React.createElement('button', {
    key: t.id,
    onClick: () => onSelect(t.id),
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      color: active === t.id ? 'var(--civic-primary)' : 'var(--civic-neutral-400)',
      fontFamily: 'inherit',
      fontSize: 11,
      fontWeight: active === t.id ? 600 : 500
    }
  }, React.createElement(Icon, {
    name: t.icon,
    size: 22,
    stroke: active === t.id ? 2.2 : 2
  }), t.label)));
}
window.EmIcon = Icon;
window.StatusBar = StatusBar;
window.AppHeader = AppHeader;
window.TabBar = TabBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/enforcementmaps/MobileShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/enforcementmaps/OtherScreens.jsx
try { (() => {
/* EnforcementMAPS — PTT, Jobs, Profile screens */
const {
  useState: puS
} = React;
function PTTScreen({
  onCode1
}) {
  const [trans, setTrans] = puS(false);
  return React.createElement('div', {
    style: {
      flex: 1,
      background: 'var(--civic-primary-dark)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: 20
    }
  }, React.createElement('div', {
    style: {
      textAlign: 'center',
      marginBottom: 14
    }
  }, React.createElement('div', {
    style: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '.08em',
      color: 'rgba(255,255,255,.6)',
      fontWeight: 600
    }
  }, 'Active channel'), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 700
    }
  }, 'Channel 3 · Elizabeth'), React.createElement('div', {
    style: {
      fontSize: 12,
      color: 'var(--civic-accent-light)',
      fontFamily: 'var(--font-mono)',
      marginTop: 2
    }
  }, '5 officers online')), React.createElement('div', {
    style: {
      background: 'rgba(255,255,255,.06)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 14
    }
  }, React.createElement('div', {
    style: {
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      color: 'rgba(255,255,255,.55)',
      fontWeight: 600,
      marginBottom: 6
    }
  }, 'Recent traffic'), [{
    id: 'PEO-118',
    t: '14:34',
    msg: 'Copy that, heading to Elizabeth & Lonsdale now.'
  }, {
    id: 'PEO-089',
    t: '14:33',
    msg: 'All clear Carlton North.'
  }, {
    id: 'PCL-142',
    t: '14:32',
    msg: 'Ten-four.'
  }].map((m, i) => React.createElement('div', {
    key: i,
    style: {
      padding: '6px 0',
      borderTop: i ? '1px solid rgba(255,255,255,.06)' : 'none'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      gap: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--civic-accent-light)'
    }
  }, m.id, React.createElement('span', {
    style: {
      color: 'rgba(255,255,255,.4)'
    }
  }, m.t)), React.createElement('div', {
    style: {
      fontSize: 13,
      color: 'rgba(255,255,255,.9)',
      marginTop: 2
    }
  }, m.msg)))), React.createElement('div', {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12
    }
  }, React.createElement('button', {
    onMouseDown: () => setTrans(true),
    onMouseUp: () => setTrans(false),
    onMouseLeave: () => setTrans(false),
    onTouchStart: () => setTrans(true),
    onTouchEnd: () => setTrans(false),
    style: {
      width: 220,
      height: 220,
      borderRadius: '50%',
      background: trans ? 'var(--civic-secondary)' : 'var(--civic-primary)',
      border: `6px solid ${trans ? 'var(--civic-secondary-light)' : 'var(--civic-primary-light)'}`,
      color: '#fff',
      cursor: 'pointer',
      display: 'grid',
      placeItems: 'center',
      boxShadow: trans ? '0 0 0 12px rgba(35,163,146,.25)' : '0 0 0 6px rgba(44,62,107,.3)',
      transition: 'all .15s',
      fontFamily: 'inherit'
    }
  }, React.createElement('div', {
    style: {
      textAlign: 'center'
    }
  }, React.createElement(EmIcon, {
    name: 'Mic',
    size: 56,
    stroke: 1.8
  }), React.createElement('div', {
    style: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '.06em'
    }
  }, trans ? 'TRANSMITTING' : 'HOLD TO TALK'))), React.createElement('div', {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,.5)',
      fontFamily: 'var(--font-mono)'
    }
  }, trans ? '▌▌▌ LIVE' : 'Press and hold')), React.createElement('button', {
    onClick: onCode1,
    style: {
      marginTop: 10,
      background: 'var(--status-emergency)',
      color: '#fff',
      border: 'none',
      padding: '16px',
      borderRadius: 12,
      fontWeight: 800,
      fontSize: 15,
      letterSpacing: '.06em',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'inherit'
    }
  }, React.createElement(EmIcon, {
    name: 'Siren',
    size: 20,
    stroke: 2.2
  }), 'CODE 1 — BROADCAST SOS'));
}
function JobsScreen() {
  const jobs = [{
    sr: 'SR-2026-0418-042',
    addr: '412 Elizabeth St',
    type: 'Parking violation',
    status: 'ACTIVE',
    time: '14:32'
  }, {
    sr: 'SR-2026-0418-038',
    addr: '18 Macaulay Rd',
    type: 'Abandoned vehicle',
    status: 'COMPLETED',
    time: '13:40'
  }, {
    sr: 'SR-2026-0418-031',
    addr: 'Queen Victoria Mkt',
    type: 'Obstruction',
    status: 'COMPLETED',
    time: '12:10'
  }, {
    sr: 'SR-2026-0418-022',
    addr: '66 Flemington Rd',
    type: 'Meter overstay',
    status: 'COMPLETED',
    time: '10:48'
  }];
  const badge = {
    ACTIVE: ['var(--status-alert-bg)', 'var(--status-alert-strong)'],
    COMPLETED: ['var(--civic-neutral-100)', 'var(--civic-neutral-600)']
  };
  return React.createElement('div', {
    style: {
      flex: 1,
      overflow: 'auto',
      background: 'var(--civic-surface-raised)'
    }
  }, React.createElement('div', {
    style: {
      padding: '14px 14px 8px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      gap: 8
    }
  }, ['Active', 'Today', 'Week'].map((l, i) => React.createElement('button', {
    key: l,
    style: {
      padding: '7px 14px',
      background: i === 0 ? 'var(--civic-primary)' : '#fff',
      color: i === 0 ? '#fff' : 'var(--civic-neutral-700)',
      border: '1px solid ' + (i === 0 ? 'var(--civic-primary)' : 'var(--civic-neutral-200)'),
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, l)))), React.createElement('div', {
    style: {
      padding: '6px 14px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, jobs.map(j => React.createElement('div', {
    key: j.sr,
    style: {
      background: '#fff',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 10,
      padding: 12,
      boxShadow: 'var(--shadow-sm)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--civic-neutral-500)',
      fontWeight: 600
    }
  }, j.sr), React.createElement('span', {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 99,
      background: badge[j.status][0],
      color: badge[j.status][1],
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, j.status)), React.createElement('div', {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, j.addr), React.createElement('div', {
    style: {
      fontSize: 12,
      color: 'var(--civic-neutral-500)',
      marginTop: 2
    }
  }, j.type + ' · ' + j.time), j.status === 'ACTIVE' && React.createElement('div', {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10
    }
  }, React.createElement('button', {
    style: {
      flex: 1,
      background: 'var(--civic-surface-sunken)',
      color: 'var(--civic-neutral-700)',
      border: 'none',
      padding: '8px',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      fontFamily: 'inherit'
    }
  }, React.createElement(EmIcon, {
    name: 'Camera',
    size: 14
  }), 'Photo'), React.createElement('button', {
    style: {
      flex: 1,
      background: 'var(--civic-accent)',
      color: 'var(--civic-primary-dark)',
      border: 'none',
      padding: '8px',
      borderRadius: 6,
      fontWeight: 700,
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      fontFamily: 'inherit'
    }
  }, React.createElement(EmIcon, {
    name: 'Receipt',
    size: 14
  }), 'Issue infringement'))))));
}
function ProfileScreen({
  officer,
  onLogout
}) {
  const rows = [['Badge', officer.id], ['Zone', 'Z-MAC · Macaulay'], ['Role', 'Compliance Lead'], ['Shift', '07:00 – 15:00'], ['Channel', 'Ch. 3 · Elizabeth'], ['Device', 'Samsung XCover 7']];
  return React.createElement('div', {
    style: {
      flex: 1,
      overflow: 'auto',
      background: 'var(--civic-surface-raised)'
    }
  }, React.createElement('div', {
    style: {
      background: 'var(--civic-primary)',
      color: '#fff',
      padding: '20px 18px 28px',
      textAlign: 'center'
    }
  }, React.createElement('div', {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: 'var(--civic-primary-light)',
      display: 'grid',
      placeItems: 'center',
      margin: '0 auto 8px',
      fontFamily: 'var(--font-display)',
      fontSize: 26,
      fontWeight: 700
    }
  }, 'SC'), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      fontWeight: 700
    }
  }, officer.name), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--civic-accent-light)',
      marginTop: 3
    }
  }, officer.id), React.createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      background: 'rgba(22,163,74,.2)',
      padding: '4px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700
    }
  }, React.createElement('span', {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: 'var(--status-active)'
    }
  }), 'ON PATROL')), React.createElement('div', {
    style: {
      padding: 14
    }
  }, React.createElement('div', {
    style: {
      background: '#fff',
      borderRadius: 12,
      border: '1px solid var(--civic-neutral-200)',
      overflow: 'hidden'
    }
  }, rows.map((r, i) => React.createElement('div', {
    key: i,
    style: {
      padding: '12px 14px',
      borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none',
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, React.createElement('span', {
    style: {
      fontSize: 13,
      color: 'var(--civic-neutral-500)'
    }
  }, r[0]), React.createElement('span', {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--civic-neutral-900)',
      fontFamily: i === 0 ? 'var(--font-mono)' : 'inherit'
    }
  }, r[1])))), React.createElement('div', {
    style: {
      marginTop: 10,
      background: '#fff',
      borderRadius: 12,
      border: '1px solid var(--civic-neutral-200)'
    }
  }, ['Code 2 · Log lunch break', 'Request zone swap', 'Reset PIN'].map((a, i) => React.createElement('button', {
    key: i,
    style: {
      width: '100%',
      textAlign: 'left',
      padding: '14px',
      background: 'transparent',
      border: 'none',
      borderTop: i ? '1px solid var(--civic-neutral-100)' : 'none',
      fontSize: 13,
      color: 'var(--civic-neutral-800)',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontWeight: 500
    }
  }, a))), React.createElement('button', {
    onClick: onLogout,
    style: {
      width: '100%',
      marginTop: 14,
      background: '#fff',
      color: 'var(--status-emergency)',
      border: '1px solid var(--status-emergency-border)',
      padding: '12px',
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Sign out')));
}
window.PTTScreen = PTTScreen;
window.JobsScreen = JobsScreen;
window.ProfileScreen = ProfileScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/enforcementmaps/OtherScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/enforcementmaps/Patrol.jsx
try { (() => {
/* Authority-Realm content slot (F18) — jurisdiction label is configuration, not code. */
const AUTHORITY_CONTEXT_LABEL = 'Melbourne CBD · Municipal Patrol';

/* EnforcementMAPS — Login & Patrol map screen */
const {
  useState: uS,
  useEffect: uE
} = React;
function Login({
  onLogin
}) {
  const [badge, setBadge] = uS('142');
  const [pw, setPw] = uS('patrol2024');
  const [load, setLoad] = uS(false);
  return React.createElement('div', {
    style: {
      flex: 1,
      background: 'var(--civic-primary-dark)',
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      color: '#fff'
    }
  }, React.createElement('div', {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, React.createElement('div', {
    style: {
      width: 64,
      height: 64,
      borderRadius: 14,
      background: 'var(--civic-primary-light)',
      border: '2px solid var(--civic-accent-light)',
      boxShadow: '0 0 0 4px rgba(232,196,106,.15)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--civic-accent-light)',
      marginBottom: 8
    }
  }, React.createElement(EmIcon, {
    name: 'Shield',
    size: 34,
    stroke: 2
  })), React.createElement('h1', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 24,
      fontWeight: 700
    }
  }, 'EnforcementMAPS'), React.createElement('p', {
    style: {
      margin: 0,
      fontSize: 12,
      color: 'rgba(255,255,255,.85)'
    }
  }, AUTHORITY_CONTEXT_LABEL)), React.createElement('div', {
    style: {
      background: '#fff',
      color: '#1F2937',
      borderRadius: 14,
      padding: 20
    }
  }, React.createElement('div', {
    style: {
      marginBottom: 14
    }
  }, React.createElement('label', {
    style: {
      display: 'block',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600,
      color: '#4A5568',
      marginBottom: 6
    }
  }, 'Badge number'), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 8,
      padding: '0 12px'
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--civic-neutral-400)',
      fontSize: 14,
      marginRight: 2
    }
  }, 'OFC-'), React.createElement('input', {
    value: badge,
    onChange: e => setBadge(e.target.value.replace(/[^0-9]/g, '')),
    inputMode: 'numeric',
    maxLength: 3,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      padding: '12px 0',
      fontFamily: 'var(--font-mono)',
      fontSize: 16,
      background: 'transparent'
    }
  }))), React.createElement('div', {
    style: {
      marginBottom: 14
    }
  }, React.createElement('label', {
    style: {
      display: 'block',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontWeight: 600,
      color: '#4A5568',
      marginBottom: 6
    }
  }, 'Password'), React.createElement('input', {
    type: 'password',
    value: pw,
    onChange: e => setPw(e.target.value),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid var(--civic-neutral-200)',
      borderRadius: 8,
      padding: '12px',
      fontSize: 14,
      fontFamily: 'inherit'
    }
  })), React.createElement('button', {
    onClick: () => {
      setLoad(true);
      setTimeout(() => onLogin({
        id: 'PEO-' + badge.padStart(3, '0'),
        name: 'Alex Rivera',
        zone: 'Z-MAC'
      }), 400);
    },
    disabled: load,
    style: {
      width: '100%',
      background: 'var(--civic-primary)',
      color: '#fff',
      border: 'none',
      padding: '14px',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer',
      fontFamily: 'inherit',
      opacity: load ? .5 : 1
    }
  }, load ? 'Signing in…' : 'Sign in'), React.createElement('div', {
    style: {
      textAlign: 'center',
      marginTop: 12,
      fontSize: 11,
      color: '#636E80',
      fontFamily: 'var(--font-mono)'
    }
  }, 'DEMO · badge 142 · patrol2024')));
}
function PatrolMap({
  zone,
  activeJob,
  onJobTap,
  onCode1
}) {
  return React.createElement('div', {
    style: {
      flex: 1,
      position: 'relative',
      background: 'var(--map-canvas-deep)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(var(--map-surface) 1px,transparent 1px),linear-gradient(90deg,var(--map-surface) 1px,transparent 1px)',
      backgroundSize: '42px 42px',
      opacity: .55
    }
  }), [90, 220, 360, 500].map(t => React.createElement('div', {
    key: t,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: t,
      height: 3,
      background: 'var(--map-road)'
    }
  })), [50, 170, 290].map(l => React.createElement('div', {
    key: 'l' + l,
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: l,
      width: 3,
      background: 'var(--map-road)'
    }
  })),
  // Assigned zone highlight
  React.createElement('div', {
    style: {
      position: 'absolute',
      left: 30,
      top: 120,
      right: 30,
      bottom: 180,
      border: '2px solid var(--civic-secondary)',
      background: 'rgba(26,122,109,.18)',
      borderRadius: 4
    }
  }, React.createElement('div', {
    style: {
      position: 'absolute',
      left: 8,
      top: 8,
      fontSize: 10,
      fontFamily: 'var(--font-mono)',
      color: '#fff',
      background: 'rgba(0,0,0,.4)',
      padding: '3px 6px',
      borderRadius: 4
    }
  }, zone + ' · YOUR ZONE')),
  // Self marker — arrowhead
  React.createElement('div', {
    style: {
      position: 'absolute',
      left: '50%',
      top: 280,
      transform: 'translate(-50%,-50%)'
    }
  }, React.createElement('svg', {
    width: 36,
    height: 36,
    viewBox: '0 0 36 36'
  }, React.createElement('circle', {
    cx: 18,
    cy: 18,
    r: 17,
    fill: 'var(--status-active)',
    fillOpacity: .25
  }), React.createElement('path', {
    d: 'M18 4 L28 26 L18 22 L8 26 Z',
    fill: 'var(--status-active)',
    stroke: '#fff',
    strokeWidth: 2,
    strokeLinejoin: 'round'
  })), React.createElement('div', {
    style: {
      position: 'absolute',
      left: '50%',
      top: '100%',
      transform: 'translateX(-50%)',
      marginTop: 2,
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      color: '#fff',
      background: 'rgba(0,0,0,.5)',
      padding: '1px 6px',
      borderRadius: 4,
      whiteSpace: 'nowrap'
    }
  }, 'OFC-142')),
  // SR pin
  activeJob && React.createElement('button', {
    onClick: onJobTap,
    style: {
      position: 'absolute',
      left: '62%',
      top: 200,
      transform: 'translate(-50%,-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    }
  }, React.createElement('div', {
    style: {
      width: 30,
      height: 30,
      borderRadius: 6,
      background: 'var(--status-alert)',
      border: '2px solid #fff',
      display: 'grid',
      placeItems: 'center',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 800,
      boxShadow: 'var(--shadow-md)'
    }
  }, 'SR')),
  // Code 1 SOS trigger — big red bottom-left
  React.createElement('button', {
    onClick: onCode1,
    style: {
      position: 'absolute',
      right: 14,
      bottom: 14,
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: 'var(--status-emergency)',
      color: '#fff',
      border: '4px solid #fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(220,38,38,.4)',
      fontFamily: 'inherit'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }
  }, React.createElement(EmIcon, {
    name: 'Siren',
    size: 22,
    stroke: 2.2
  }), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '.06em'
    }
  }, 'SOS'))),
  // Zone toggle chip
  React.createElement('div', {
    style: {
      position: 'absolute',
      top: 14,
      left: 14,
      right: 14,
      display: 'flex',
      gap: 8
    }
  }, React.createElement('div', {
    style: {
      flex: 1,
      padding: '8px 12px',
      background: 'rgba(255,255,255,.95)',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: 'var(--shadow-md)'
    }
  }, React.createElement('span', {
    style: {
      width: 10,
      height: 10,
      borderRadius: 99,
      background: 'var(--status-active)'
    }
  }), React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 11,
      color: 'var(--civic-neutral-500)',
      fontWeight: 500
    }
  }, 'On patrol · ' + zone), React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, 'Macaulay')))));
}
function DispatchSheet({
  job,
  onAck,
  onClose
}) {
  return React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(17,24,39,.5)',
      display: 'flex',
      alignItems: 'flex-end'
    },
    onClick: onClose
  }, React.createElement('div', {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      background: '#fff',
      borderRadius: '16px 16px 0 0',
      padding: 18,
      animation: 'slideup .35s cubic-bezier(.4,0,.2,1)',
      boxShadow: 'var(--shadow-xl)'
    }
  }, React.createElement('div', {
    style: {
      width: 40,
      height: 4,
      background: 'var(--civic-neutral-300)',
      borderRadius: 99,
      margin: '0 auto 14px'
    }
  }), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, React.createElement('span', {
    style: {
      background: 'var(--status-alert-bg)',
      color: 'var(--status-alert)',
      padding: '3px 8px',
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '.04em'
    }
  }, 'CODE21 · P2'), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--civic-neutral-500)'
    }
  }, job.sr)), React.createElement('h3', {
    style: {
      margin: '0 0 4px',
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--civic-neutral-900)'
    }
  }, job.address), React.createElement('p', {
    style: {
      margin: '0 0 12px',
      fontSize: 13,
      color: 'var(--civic-neutral-600)',
      lineHeight: 1.5
    }
  }, job.desc), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 16
    }
  }, [['Type', job.type], ['ETA', '3 min walk'], ['Zone', 'Z-ELZ'], ['Dispatched', '14:32']].map(([k, v], i) => React.createElement('div', {
    key: i,
    style: {
      background: 'var(--civic-surface-raised)',
      padding: '8px 10px',
      borderRadius: 8
    }
  }, React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--civic-neutral-500)',
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      fontWeight: 600
    }
  }, k), React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--civic-neutral-900)',
      marginTop: 2
    }
  }, v)))), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 8
    }
  }, React.createElement('button', {
    onClick: onClose,
    style: {
      flex: 1,
      background: 'var(--civic-surface-sunken)',
      color: 'var(--civic-neutral-700)',
      border: 'none',
      padding: '14px',
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, 'Decline'), React.createElement('button', {
    onClick: onAck,
    style: {
      flex: 2,
      background: 'var(--civic-secondary)',
      color: '#fff',
      border: 'none',
      padding: '14px',
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontFamily: 'inherit'
    }
  }, React.createElement(EmIcon, {
    name: 'Check',
    size: 18,
    stroke: 2.4
  }), 'Acknowledge'))));
}
window.EmLogin = Login;
window.PatrolMap = PatrolMap;
window.DispatchSheet = DispatchSheet;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/enforcementmaps/Patrol.jsx", error: String((e && e.message) || e) }); }

__ds_ns.LifecycleStatusPill = __ds_scope.LifecycleStatusPill;

__ds_ns.PresenceIndicator = __ds_scope.PresenceIndicator;

__ds_ns.RadioCodeBadge = __ds_scope.RadioCodeBadge;

__ds_ns.LoginPage = __ds_scope.LoginPage;

})();
