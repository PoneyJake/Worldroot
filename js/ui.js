/** Worldroot — tabbed Melvor-style UI. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  const TABS = C?.TABS ?? [
    { id: 'characters', label: 'Characters' },
    { id: 'skills', label: 'Skills' },
    { id: 'resources', label: 'Resources' },
    { id: 'worldroot', label: 'Worldroot' },
    { id: 'settings', label: 'Settings' },
  ];
  const SKILL_ORDER = C?.SKILL_ORDER ?? ['combat', 'mining', 'woodcutting', 'fishing'];
  const MAX_SLOTS = C?.MAX_SLOTS ?? 3;

  let state = null;
  let activeTab = 'characters';
  let selectedSkillId = null;
  let logBuffer = [];

  const panels = {};

  function $(id) {
    return document.getElementById(id);
  }

  function fmt(n) {
    return Math.floor(n).toLocaleString();
  }

  function skillName(id) {
    return C.SKILLS[id]?.name ?? id;
  }

  function resName(id) {
    for (const sk of Object.values(C.SKILLS)) {
      const r = sk.resources?.find((x) => x.id === id);
      if (r) return r.name;
    }
    return id;
  }

  function activityLabel(id) {
    if (!id) return 'Idle';
    return C.ACTIVITIES.find((a) => a.id === id)?.label ?? id;
  }

  function charLabel(char) {
    const cls = C.CLASSES[char.classId];
    return cls ? `${cls.icon} ${cls.name}` : 'Character';
  }

  function bestSkillLevel(skillId) {
    if (!state.characters.length) return 1;
    return Math.max(...state.characters.map((c) => c.skills[skillId]?.level ?? 1));
  }

  function charsOnSkill(skillId) {
    const skill = C.SKILLS[skillId];
    const act = skill?.activity;
    return state.characters
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.activity === act);
  }

  function addLog(text) {
    logBuffer.unshift(text);
    if (logBuffer.length > 15) logBuffer.length = 15;
    const log = $('activity-log');
    if (!log) return;
    log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  function renderLogEl() {
    const log = $('activity-log');
    if (!log) return;
    log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  /* ── Tab navigation ── */

  function switchTab(tabId) {
    activeTab = tabId;
    if (tabId !== 'skills') selectedSkillId = null;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    Object.entries(panels).forEach(([id, el) => {
      el.classList.toggle('hidden', id !== tabId);
    });
    renderActivePanel();
  }

  function renderTabBar() {
    const bar = $('tab-bar');
    if (!bar) return;
    bar.innerHTML = TABS.map(
      (t) =>
        `<button type="button" class="tab-btn ${t.id === activeTab ? 'active' : ''}" data-action="switch-tab" data-tab="${t.id}">${t.label}</button>`
    ).join('');
  }

  /* ── HUD ── */

  function renderHud() {
    const acct = $('account-level');
    const gold = $('gold-total');
    if (acct) acct.textContent = fmt(S.accountTotalLevel(state));
    if (gold) gold.textContent = fmt(state.gold);
  }

  /* ── Characters tab ── */

  function renderCharactersPanel() {
    const el = panels.characters;
    if (!el) return;

    const account = S.accountTotalLevel(state);
    const next = S.nextSlotUnlock(account);
    let unlockHint = '';
    if (next) {
      unlockHint = `<p class="hint-bar">Next slot unlocks at Account Level <strong>${next.at}</strong></p>`;
    }

    const cards = state.characters.map((char, i) => {
      const cls = C.CLASSES[char.classId];
      const total = S.characterTotalLevel(char);
      const skills = SKILL_ORDER.map((sid) => {
        const lv = char.skills[sid]?.level ?? 1;
        return `<span class="char-stat"><em>${skillName(sid).slice(0, 3)}</em> ${lv}</span>`;
      }).join('');

      return `
        <article class="char-card" data-class="${char.classId}">
          <div class="char-card-top">
            <span class="char-icon">${cls.icon}</span>
            <div class="char-card-title">
              <strong>${cls.name}</strong>
              <span class="char-meta">${cls.desc}</span>
            </div>
            <span class="char-total">Lv ${total}</span>
          </div>
          <div class="char-activity-pill ${char.activity ? 'active' : ''}">
            ${activityLabel(char.activity)}
          </div>
          <div class="char-stats-row">${skills}</div>
          <button type="button" class="btn-xs ghost" data-action="stop" data-char="${i}">Stop activity</button>
        </article>`;
    });

    const slots = [];
    for (let slot = 1; slot <= MAX_SLOTS; slot++) {
      if (state.characters.length >= slot) continue;
      const unlockAt = C.SLOT_UNLOCK_AT[slot - 1] ?? 999;
      const ready = account >= unlockAt && state.characters.length === slot - 1;

      if (ready && state.pendingSlot === slot) {
        slots.push(`
          <div class="slot-locked slot-ready">
            <span>Slot ${slot} ready</span>
            <button type="button" class="btn-xs primary" data-action="open-class" data-slot="${slot}">Choose class</button>
          </div>`);
      } else {
        slots.push(`
          <div class="slot-locked">
            <span>🔒 Slot ${slot}</span>
            <span class="slot-req">Acct Lv ${unlockAt}</span>
          </div>`);
      }
    }

    el.innerHTML = `
      ${unlockHint}
      <div class="char-grid">${cards.join('') || '<p class="empty-msg">Choose a class to begin your party.</p>'}</div>
      ${slots.length ? `<div class="slot-row">${slots.join('')}</div>` : ''}`;
  }

  /* ── Skills tab ── */

  function renderSkillsPanel() {
    const el = panels.skills;
    if (!el) return;

    if (selectedSkillId) {
      renderSkillDetail(el, selectedSkillId);
      return;
    }

    el.innerHTML = `
      <p class="panel-intro">Select a skill to view resources and assign characters.</p>
      <div class="skill-grid">
        ${SKILL_ORDER.map((sid) => {
          const sk = C.SKILLS[sid];
          const best = bestSkillLevel(sid);
          const assigned = charsOnSkill(sid);
          return `
            <button type="button" class="skill-card" data-action="open-skill" data-skill="${sid}">
              <span class="skill-card-icon">${sk.icon}</span>
              <span class="skill-card-name">${sk.name}</span>
              <span class="skill-card-lv">Best Lv ${best}</span>
              <span class="skill-card-sub">${assigned.length} active</span>
            </button>`;
        }).join('')}
      </div>`;
  }

  function renderSkillDetail(el, skillId) {
    const sk = C.SKILLS[skillId];
    const best = bestSkillLevel(skillId);
    const assigned = charsOnSkill(skillId);

    const tiers = sk.resources.length
      ? sk.resources
          .map((r) => {
            const ok = best >= r.minLevel;
            return `<li class="${ok ? 'unlocked' : 'locked'}">
              <span>${r.name}</span>
              <span>Lv ${r.minLevel}${ok ? '' : ' required'}</span>
            </li>`;
          })
          .join('')
      : `<li class="unlocked"><span>Gold</span><span>Always</span></li>
         <li class="locked"><span>Mob drops</span><span>Coming soon</span></li>`;

    const assignBtns = state.characters.length
      ? state.characters
          .map((char, i) => {
            const on = char.activity === sk.activity;
            return `
              <button type="button" class="btn-sm ${on ? 'active' : ''}"
                data-action="set-activity" data-char="${i}" data-activity="${sk.activity}">
                ${charLabel(char)}${on ? ' ✓' : ''}
              </button>`;
          })
          .join('')
      : '<p class="empty-msg">Unlock a character first.</p>';

    const assignedList = assigned.length
      ? assigned.map(({ c }) => charLabel(c)).join(', ')
      : 'None';

    el.innerHTML = `
      <button type="button" class="back-btn" data-action="close-skill">← Skills</button>
      <header class="skill-detail-head">
        <span class="skill-detail-icon">${sk.icon}</span>
        <div>
          <h2>${sk.name}</h2>
          <p>${sk.desc}</p>
        </div>
        <span class="skill-detail-lv">Best Lv ${best}</span>
      </header>

      <div class="detail-grid">
        <section class="detail-box">
          <h3>Resources</h3>
          <ul class="tier-list">${tiers}</ul>
        </section>
        <section class="detail-box">
          <h3>Assigned</h3>
          <p class="assigned-text">${assignedList}</p>
        </section>
      </div>

      <section class="detail-box">
        <h3>Assign characters</h3>
        <div class="btn-row">${assignBtns}</div>
      </section>`;
  }

  /* ── Resources tab ── */

  function renderResourcesPanel() {
    const el = panels.resources;
    if (!el) return;

    const groups = [
      { title: 'Mining', icon: '⛏', ids: ['coal', 'copper', 'iron', 'gold'] },
      { title: 'Woodcutting', icon: '🪓', ids: ['oak', 'spruce', 'birch', 'jungle'] },
      { title: 'Fishing', icon: '🎣', ids: ['shrimp', 'trout', 'salmon', 'lobster'] },
      {
        title: 'Combat',
        icon: '🗡',
        custom: `
          <div class="res-item"><span>Gold</span><strong>${fmt(state.gold)}</strong></div>
          <div class="res-item res-placeholder"><span>Mob drops</span><strong>—</strong></div>`,
      },
    ];

    el.innerHTML = groups
      .map((g) => {
        const items = g.custom
          ? g.custom
          : g.ids
              .map(
                (id) =>
                  `<div class="res-item"><span>${resName(id)}</span><strong>${fmt(state.resources[id] || 0)}</strong></div>`
              )
              .join('');
        return `
          <section class="res-section">
            <h3>${g.icon} ${g.title}</h3>
            <div class="res-grid">${items}</div>
          </section>`;
      })
      .join('');
  }

  /* ── Worldroot tab ── */

  function renderWorldrootPanel() {
    const el = panels.worldroot;
    if (!el) return;

    el.innerHTML = `
      <p class="panel-intro">Spend resources to grow the Worldroot. Each node levels infinitely.</p>
      ${C.UPGRADES.map((res) => {
        const nodes = res.nodes
          .map((node, i) => {
            const lv = E.nodeLevel(state, res.id, i);
            const pct = E.nodeBonusPercent(state, res.id, i).toFixed(0);
            const cost = E.upgradeCost(res.id, i, lv);
            const owned = state.resources[res.id] || 0;
            const can = owned >= cost;
            return `
              <div class="upgrade-row">
                <div class="upgrade-info">
                  <strong>${node.name}</strong>
                  <span>Lv ${lv} · +${pct}% · ${node.desc.split(' per')[0]}</span>
                </div>
                <button type="button" class="btn-sm ${can ? '' : 'disabled'}"
                  data-action="buy-upgrade" data-resource="${res.id}" data-node="${i}"
                  ${can ? '' : 'disabled'}>
                  ${fmt(cost)} ${res.name}
                </button>
              </div>`;
          })
          .join('');
        return `
          <section class="upgrade-section">
            <h3>${res.name}</h3>
            ${nodes}
          </section>`;
      }).join('')}`;
  }

  /* ── Settings tab ── */

  function renderSettingsPanel() {
    const el = panels.settings;
    if (!el) return;

    const session = window.WorldrootSession;
    const sessionText = session?.isCloud
      ? `Cloud save · ${session.displayName}`
      : 'Offline · this device only';

    el.innerHTML = `
      <section class="detail-box">
        <h3>Save</h3>
        <p class="settings-line">${sessionText}</p>
        <div class="btn-row">
          <button type="button" class="btn-sm ghost" data-action="go-menu">Main menu</button>
          <button type="button" class="btn-sm danger" data-action="reset-save">Reset save</button>
        </div>
      </section>
      <section class="detail-box">
        <h3>Account</h3>
        <p class="settings-line">Account Level: <strong>${fmt(S.accountTotalLevel(state))}</strong></p>
        <p class="settings-line">Characters: <strong>${state.characters.length} / ${MAX_SLOTS}</strong></p>
      </section>
      <section class="detail-box">
        <h3>Activity log</h3>
        <ul id="activity-log" class="log"></ul>
      </section>`;
    renderLogEl();
  }

  /* ── Class modal ── */

  function renderClassModal() {
    const modal = $('class-modal');
    if (!modal) return;
    const show = !!state.pendingSlot;
    modal.hidden = !show;
    if (!show) return;

    $('class-modal-title').textContent = `Choose a class — Slot ${state.pendingSlot}`;
    $('class-options').innerHTML = Object.values(C.CLASSES)
      .map(
        (cls) => `
        <button type="button" class="class-pick" data-action="pick-class" data-class="${cls.id}">
          <span class="class-pick-icon">${cls.icon}</span>
          <span class="class-pick-name">${cls.name}</span>
          <span class="class-pick-desc">${cls.desc}</span>
        </button>`
      )
      .join('');
  }

  /* ── Render orchestration ── */

  function renderActivePanel() {
    switch (activeTab) {
      case 'characters':
        renderCharactersPanel();
        break;
      case 'skills':
        renderSkillsPanel();
        break;
      case 'resources':
        renderResourcesPanel();
        break;
      case 'worldroot':
        renderWorldrootPanel();
        break;
      case 'settings':
        renderSettingsPanel();
        break;
      default:
        break;
    }
  }

  function render() {
    renderHud();
    renderTabBar();
    renderActivePanel();
    renderClassModal();
  }

  /* ── Events ── */

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'switch-tab') {
      switchTab(btn.dataset.tab);
      return;
    }

    if (action === 'open-skill') {
      selectedSkillId = btn.dataset.skill;
      renderSkillsPanel();
      return;
    }

    if (action === 'close-skill') {
      selectedSkillId = null;
      renderSkillsPanel();
      return;
    }

    if (action === 'pick-class') {
      S.addCharacter(state, btn.dataset.class);
      addLog(`${C.CLASSES[btn.dataset.class].name} joined.`);
      render();
      return;
    }

    if (action === 'open-class') {
      state.pendingSlot = Number(btn.dataset.slot);
      renderClassModal();
      return;
    }

    if (action === 'set-activity') {
      const idx = Number(btn.dataset.char);
      S.setActivity(state, idx, btn.dataset.activity);
      addLog(`${charLabel(state.characters[idx])} → ${activityLabel(btn.dataset.activity)}`);
      render();
      return;
    }

    if (action === 'stop') {
      const idx = Number(btn.dataset.char);
      S.stopActivity(state, idx);
      addLog(`${charLabel(state.characters[idx])} stopped.`);
      render();
      return;
    }

    if (action === 'buy-upgrade') {
      const resId = btn.dataset.resource;
      const node = Number(btn.dataset.node);
      const def = C.UPGRADES.find((u) => u.id === resId);
      if (E.buyUpgrade(state, resId, node)) {
        addLog(`Upgraded ${def.nodes[node].name}.`);
        render();
      }
      return;
    }

    if (action === 'reset-save') {
      if (confirm('Reset all progress? This cannot be undone.')) {
        state = S.resetState();
        selectedSkillId = null;
        if (window.WorldrootSession?.isCloud && window.WorldrootCloud?.flush) {
          window.WorldrootCloud.flush();
        }
        addLog('Save cleared.');
        render();
      }
      return;
    }

    if (action === 'go-menu') {
      if (window.WorldrootGoMenu) window.WorldrootGoMenu();
    }
  }

  function setSessionBadge(session) {
    /* session info lives in Settings tab now */
    if (session && activeTab === 'settings') renderSettingsPanel();
  }

  function init(initialState) {
    state = initialState;
    TABS.forEach((t) => {
      panels[t.id] = $(`panel-${t.id}`);
    });
    document.body.addEventListener('click', handleClick);
    renderTabBar();
    switchTab('characters');

    if (!state.characters.length) {
      renderClassModal();
    }
  }

  window.WorldrootUI = {
    init,
    render,
    refresh: render,
    addLog,
    getState: () => state,
    setState: (next) => {
      state = next;
    },
    setSessionBadge,
  };

  function showBootError(msg) {
    const panel = document.getElementById('panel-characters');
    if (panel) {
      panel.classList.remove('hidden');
      panel.innerHTML = `<p class="empty-msg" style="color:#e8a0a0">${msg}</p>`;
    }
    const bar = document.getElementById('tab-bar');
    if (bar) bar.innerHTML = '<button type="button" class="tab-btn active" disabled>Error</button>';
  }

  /** Boot game immediately — do not wait for auth module. */
  function autoBoot() {
    try {
      const S = window.WorldrootState;
      const E = window.WorldrootEngine;
      if (!S || !E) {
        showBootError('Game failed to load. Hard refresh (Ctrl+Shift+R) or try Play offline from the home page.');
        return;
      }

      const mode = sessionStorage.getItem('worldroot_play_mode');
      S.setPlayMode(mode === 'cloud' ? 'cloud' : 'offline');

      window.WorldrootSession = window.WorldrootSession || {
        isCloud: mode === 'cloud',
        isOffline: mode !== 'cloud',
        displayName: 'Offline',
      };

      if (window.__worldrootBooted) return;
      window.__worldrootBooted = true;

      const gameState = S.loadState();
      init(gameState);

      if (!gameState.characters.length) {
        addLog('Welcome to Worldroot. Choose your first class.');
      } else {
        addLog('Welcome back to Worldroot.');
      }

      setInterval(() => {
        E.tick(getState());
        S.refreshPendingSlot(getState());
        refresh();
      }, C?.TICK_MS ?? 1000);

      window.addEventListener('beforeunload', () => {
        S.saveState(getState());
        if (window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
      });
    } catch (err) {
      console.error('[Worldroot] boot failed:', err);
      showBootError(`Game error: ${err.message}. Try Reset save in Settings or clear browser data for this site.`);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot);
  } else {
    autoBoot();
  }
})();
