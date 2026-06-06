/** Worldroot — DOM rendering and event wiring. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  let state = null;

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    els.accountLevel = $('account-level');
    els.nextUnlock = $('next-unlock');
    els.gold = $('gold-total');
    els.characters = $('characters');
    els.resources = $('resources');
    els.upgrades = $('upgrades');
    els.classModal = $('class-modal');
    els.classModalTitle = $('class-modal-title');
    els.classOptions = $('class-options');
    els.log = $('log');
  }

  function formatNum(n) {
    return Math.floor(n).toLocaleString();
  }

  function skillLabel(skillId) {
    return C.SKILLS[skillId]?.name ?? skillId;
  }

  function resourceName(id) {
    for (const skill of Object.values(C.SKILLS)) {
      const r = skill.resources?.find((x) => x.id === id);
      if (r) return r.name;
    }
    return id;
  }

  function activityLabel(activityId) {
    if (!activityId) return 'Idle';
    return C.ACTIVITIES.find((a) => a.id === activityId)?.label ?? activityId;
  }

  function addLog(text) {
    if (!els.log) return;
    const li = document.createElement('li');
    li.textContent = text;
    els.log.prepend(li);
    while (els.log.children.length > 20) els.log.lastChild?.remove();
  }

  function renderAccount() {
    const account = S.accountTotalLevel(state);
    const maxSlots = S.maxUnlockedSlots(account);
    if (els.accountLevel) {
      els.accountLevel.textContent = formatNum(account);
    }
    if (els.nextUnlock) {
      const next = S.nextSlotUnlock(account);
      if (next && state.characters.length < maxSlots) {
        els.nextUnlock.textContent = `Slot ${next.slot} ready — choose a class below.`;
      } else if (next) {
        els.nextUnlock.textContent = `Next slot (${next.slot}) unlocks at Account Level ${next.at}.`;
      } else {
        els.nextUnlock.textContent = 'All character slots unlocked.';
      }
    }
    if (els.gold) els.gold.textContent = formatNum(state.gold);
  }

  function renderSkillRow(skillId, skill) {
    const need = S.xpForLevel(skill.level);
    return `
      <div class="skill-row">
        <span class="skill-name">${skillLabel(skillId)}</span>
        <span class="skill-level">Lv ${skill.level}</span>
        <span class="skill-xp">${formatNum(skill.xp)} / ${formatNum(need)} XP</span>
      </div>`;
  }

  function renderCharacterCard(char, index) {
    const cls = C.CLASSES[char.classId];
    const total = S.characterTotalLevel(char);
    const active = char.activity;
    const skillsHtml = Object.entries(char.skills)
      .map(([id, sk]) => renderSkillRow(id, sk))
      .join('');

    const buttons = C.ACTIVITIES.map(
      (a) => `
        <button type="button"
          class="btn sm ${active === a.id ? 'active' : ''}"
          data-action="set-activity"
          data-char="${index}"
          data-activity="${a.id}">
          ${a.label}
        </button>`
    ).join('');

    return `
      <article class="char-card" data-class="${char.classId}">
        <header class="char-header">
          <span class="char-icon">${cls.icon}</span>
          <div>
            <h3>${cls.name}</h3>
            <p class="char-desc">${cls.desc}</p>
          </div>
          <span class="char-total">Total Lv ${total}</span>
        </header>
        <p class="char-activity">Activity: <strong>${activityLabel(active)}</strong></p>
        <div class="skills">${skillsHtml}</div>
        <div class="btn-row">${buttons}
          <button type="button" class="btn sm ghost" data-action="stop" data-char="${index}">Stop</button>
        </div>
      </article>`;
  }

  function renderLockedSlot(slotNum, accountLevel) {
    const unlockAt = C.SLOT_UNLOCK_AT[slotNum - 1] ?? 999;
    const locked = accountLevel < unlockAt || state.characters.length < slotNum - 1;
    if (!locked && state.pendingSlot === slotNum) {
      return `
        <article class="char-card locked highlight">
          <h3>Slot ${slotNum}</h3>
          <p class="muted">Unlocked! Choose a class to begin.</p>
          <button type="button" class="btn primary" data-action="open-class" data-slot="${slotNum}">
            Choose class
          </button>
        </article>`;
    }
    if (state.characters.length >= slotNum) return '';

    return `
      <article class="char-card locked">
        <h3>Slot ${slotNum}</h3>
        <p class="muted">Unlocks at Account Level ${unlockAt}</p>
        <div class="lock-icon">🔒</div>
      </article>`;
  }

  function renderCharacters() {
    if (!els.characters) return;
    const account = S.accountTotalLevel(state);
    let html = state.characters.map(renderCharacterCard).join('');
    for (let slot = state.characters.length + 1; slot <= C.SLOT_UNLOCK_AT.length; slot++) {
      html += renderLockedSlot(slot, account);
    }
    els.characters.innerHTML = html;
  }

  function renderResources() {
    if (!els.resources) return;
    const groups = [
      { title: 'Mining', ids: ['coal', 'copper', 'iron', 'gold'] },
      { title: 'Woodcutting', ids: ['oak', 'spruce', 'birch', 'jungle'] },
      { title: 'Fishing', ids: ['shrimp', 'trout', 'salmon', 'lobster'] },
    ];
    els.resources.innerHTML = groups
      .map(
        (g) => `
        <div class="resource-group">
          <h4>${g.title}</h4>
          <div class="resource-grid">
            ${g.ids
              .map(
                (id) => `
              <div class="resource-item">
                <span class="resource-name">${resourceName(id)}</span>
                <span class="resource-amt">${formatNum(state.resources[id] || 0)}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>`
      )
      .join('');
  }

  function renderUpgrades() {
    if (!els.upgrades) return;
    els.upgrades.innerHTML = C.UPGRADES.map((res) => {
      const nodes = res.nodes
        .map((label, i) => {
          const key = E.upgradeKey(res.id, i);
          const level = state.upgrades[key] || 0;
          const cost = E.upgradeCost(res.id, i, level);
          const owned = state.resources[res.id] || 0;
          const canBuy = owned >= cost;
          const bonus = (level * C.UPGRADE_EFFICIENCY_PER_LEVEL * 100).toFixed(0);
          return `
            <div class="upgrade-node">
              <div class="upgrade-head">
                <span class="upgrade-name">${label}</span>
                <span class="upgrade-lvl">Lv ${level}</span>
              </div>
              <p class="upgrade-effect">+${bonus}% ${res.name} efficiency</p>
              <button type="button"
                class="btn sm ${canBuy ? '' : 'disabled'}"
                data-action="buy-upgrade"
                data-resource="${res.id}"
                data-node="${i}"
                ${canBuy ? '' : 'disabled'}>
                Upgrade (${formatNum(cost)} ${res.name})
              </button>
            </div>`;
        })
        .join('');
      return `
        <section class="upgrade-group">
          <h4>${res.name}</h4>
          <div class="upgrade-grid">${nodes}</div>
        </section>`;
    }).join('');
  }

  function renderClassModal() {
    if (!els.classModal) return;
    const show = !!state.pendingSlot;
    els.classModal.hidden = !show;
    if (!show) return;

    els.classModalTitle.textContent = `Choose a class for Slot ${state.pendingSlot}`;
    els.classOptions.innerHTML = Object.values(C.CLASSES)
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

  function render() {
    renderAccount();
    renderCharacters();
    renderResources();
    renderUpgrades();
    renderClassModal();
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === 'pick-class') {
      S.addCharacter(state, btn.dataset.class);
      addLog(`${C.CLASSES[btn.dataset.class].name} joined your party.`);
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
      const act = btn.dataset.activity;
      S.setActivity(state, idx, act);
      const cls = C.CLASSES[state.characters[idx].classId];
      addLog(`${cls.name} started ${activityLabel(act)}.`);
      render();
      return;
    }

    if (action === 'stop') {
      const idx = Number(btn.dataset.char);
      S.stopActivity(state, idx);
      addLog(`${C.CLASSES[state.characters[idx].classId].name} stopped.`);
      render();
      return;
    }

    if (action === 'buy-upgrade') {
      const resId = btn.dataset.resource;
      const node = Number(btn.dataset.node);
      if (E.buyUpgrade(state, resId, node)) {
        const def = C.UPGRADES.find((u) => u.id === resId);
        addLog(`Upgraded ${def.nodes[node]}.`);
        render();
      }
      return;
    }

    if (action === 'reset-save') {
      if (confirm('Reset all progress? This cannot be undone.')) {
        state = S.resetState();
        if (window.WorldrootSession?.isCloud && window.WorldrootCloud?.flush) {
          window.WorldrootCloud.flush();
        }
        addLog('Save cleared. Welcome to Worldroot.');
        render();
      }
      return;
    }

    if (action === 'go-menu') {
      if (window.WorldrootGoMenu) window.WorldrootGoMenu();
      return;
    }
  }

  function setSessionBadge(session) {
    const el = document.getElementById('session-badge');
    if (!el || !session) return;
    if (session.isCloud) {
      el.textContent = `Logged in as ${session.displayName} · Cloud save`;
      el.className = 'session-badge cloud';
    } else {
      el.textContent = 'Offline mode · this device only';
      el.className = 'session-badge offline';
    }
  }

  function init(initialState) {
    state = initialState;
    cacheElements();
    document.body.addEventListener('click', handleClick);
    render();
  }

  function getState() {
    return state;
  }

  function setState(next) {
    state = next;
  }

  function refresh() {
    render();
  }

  window.WorldrootUI = {
    init,
    render,
    refresh,
    addLog,
    getState,
    setState,
    setSessionBadge,
  };
})();
