/** Worldroot — sidebar Melvor-style UI. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  const SIDEBAR_NAV = C?.SIDEBAR_NAV ?? [];
  const MAX_SLOTS = C?.MAX_SLOTS ?? 3;

  let state = null;
  let activePage = 'characters';
  let selectedUpgradeId = null;
  let logBuffer = [];

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Math.floor(n).toLocaleString(); }
  function resName(id) { return C.RESOURCE_NAMES?.[id] ?? id; }
  function skillName(id) { return C.SKILLS[id]?.name ?? id; }

  function selectedIndex() {
    return state?.selectedCharIndex ?? 0;
  }

  function selectedChar() {
    return S.getSelectedCharacter(state);
  }

  function charLabel(char) {
    const cls = C.CLASSES[char.classId];
    return cls ? `${cls.icon} ${cls.name}` : 'Character';
  }

  function activityLabel(char) {
    if (!char?.activity) return 'Idle';
    const act = C.ACTIVITIES.find((a) => a.id === char.activity);
    if (!act) return 'Idle';
    if (char.activity === 'combat' && char.target) {
      const mob = C.MONSTERS.find((m) => m.id === char.target);
      return mob ? `Fighting ${mob.name}` : act.label;
    }
    const veins = C.VEINS[char.activity];
    const vein = veins?.find((v) => v.id === char.target);
    return vein ? vein.name : act.label;
  }

  function bestSkillLevel(skillId) {
    if (!state.characters.length) return 0;
    return Math.max(...state.characters.map((c) => c.skills[skillId]?.level ?? 0));
  }

  function charSkillLevel(char, skillId) {
    return char?.skills[skillId]?.level ?? 0;
  }

  function xpProgress(skill) {
    const needed = S.xpForLevel(skill.level);
    return needed ? Math.min(100, (skill.xp / needed) * 100) : 0;
  }

  function addLog(text) {
    logBuffer.unshift(text);
    if (logBuffer.length > 20) logBuffer.length = 20;
    const log = $('activity-log');
    if (log) log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  function renderLogEl() {
    const log = $('activity-log');
    if (log) log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  /* ── Navigation ── */

  function switchPage(pageId) {
    const item = SIDEBAR_NAV.find((n) => n.id === pageId);
    if (item?.comingSoon) return;
    activePage = pageId;
    renderSidebar();
    renderMainPanel();
  }

  function renderSidebar() {
    const el = $('sidebar');
    if (!el) return;
    let html = '';
    let section = '';
    for (const item of SIDEBAR_NAV) {
      if (item.type === 'section') {
        section = item.label;
        html += `<div class="sidebar-section-label">${item.label}</div>`;
        continue;
      }
      if (item.type === 'divider') {
        html += '<div class="sidebar-divider"></div>';
        continue;
      }
      const isActive = item.id === activePage;
      const soon = item.comingSoon ? ' coming-soon' : '';
      const badge = item.comingSoon ? '<span class="sidebar-btn-badge">Soon</span>' : '';
      const sel = item.id === 'characters' && selectedChar()
        ? `<span class="sidebar-btn-badge">${charLabel(selectedChar()).split(' ')[0]}</span>` : '';
      html += `
        <button type="button" class="sidebar-btn${isActive ? ' active' : ''}${soon}"
          data-action="switch-page" data-page="${item.id}" ${item.comingSoon ? 'disabled' : ''}>
          <span class="sidebar-btn-icon">${item.icon}</span>
          <span class="sidebar-btn-label">${item.label}</span>
          ${badge || sel}
        </button>`;
    }
    el.innerHTML = html;
  }

  function renderHud() {
    const acct = $('account-level');
    const gold = $('gold-total');
    const notif = $('notification-count');
    if (acct) acct.textContent = fmt(S.accountTotalLevel(state));
    if (gold) gold.textContent = fmt(state.gold);
    if (notif) notif.textContent = state.pendingSlot ? '1' : '0';
  }

  function assignSelected(activity, targetId) {
    const idx = selectedIndex();
    if (!state.characters[idx]) return;
    S.setActivity(state, idx, activity, targetId);
    addLog(`${charLabel(state.characters[idx])} → ${activityLabel(state.characters[idx])}`);
    render();
  }

  function renderAssignBtn(activity, targetId, locked) {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character first.</p>';
    if (locked) return '';
    const on = char.activity === activity && char.target === targetId;
    return `<button type="button" class="btn-sm ${on ? 'active' : 'primary'}"
      data-action="assign-selected" data-activity="${activity}" data-target="${targetId}">
      ${on ? 'Active ✓' : `Assign ${charLabel(char)}`}
    </button>`;
  }

  /* ── Characters ── */

  function renderCharactersPanel() {
    const sel = selectedIndex();
    const rail = state.characters.map((char, i) => {
      const cls = C.CLASSES[char.classId];
      const active = i === sel;
      return `
        <button type="button" class="char-rail-btn${active ? ' active' : ''}"
          data-action="select-char" data-char="${i}">
          <span class="char-rail-icon">${cls.icon}</span>
          <span class="char-rail-name">${cls.name}</span>
          <span class="char-rail-lv">Lv ${S.characterTotalLevel(char)}</span>
        </button>`;
    }).join('');

    const char = selectedChar();
    let detail = '<p class="empty-msg">Choose a class to begin.</p>';
    if (char) {
      const cls = C.CLASSES[char.classId];
      const skills = ['combat', 'mining', 'woodcutting', 'fishing'].map((sid) => {
        const sk = C.SKILLS[sid];
        const lv = charSkillLevel(char, sid);
        return `
          <div class="char-skill-item">
            <span class="char-skill-icon">${sk.icon}</span>
            <span class="char-skill-name">${sk.name}</span>
            <span class="char-skill-lv">${lv}</span>
            <div class="progress-bar mini"><div class="progress-bar-fill" style="width:${xpProgress(char.skills[sid])}%"></div></div>
          </div>`;
      }).join('');

      detail = `
        <div class="char-detail-head">
          <div class="char-portrait lg">${cls.icon}</div>
          <div>
            <h2>${cls.name}</h2>
            <p class="char-meta">${cls.desc}</p>
            <div class="char-activity-pill ${char.activity ? 'active' : ''}">▶ ${activityLabel(char)}</div>
          </div>
          <div class="char-total-badge"><span>Total</span><strong>${S.characterTotalLevel(char)}</strong></div>
        </div>
        <div class="char-skills-grid">${skills}</div>
        <p class="hint-bar">Select this hero, then open a skill page to assign them to an activity.</p>
        <button type="button" class="btn-xs ghost" data-action="stop-selected">Stop activity</button>`;
    }

    const account = S.accountTotalLevel(state);
    const slots = [];
    for (let slot = 1; slot <= MAX_SLOTS; slot++) {
      if (state.characters.length >= slot) continue;
      const unlockAt = C.SLOT_UNLOCK_AT[slot - 1] ?? 999;
      const ready = account >= unlockAt && state.characters.length === slot - 1;
      slots.push(ready && state.pendingSlot === slot
        ? `<div class="slot-locked slot-ready"><span>Slot ${slot}</span>
            <button type="button" class="btn-xs primary" data-action="open-class" data-slot="${slot}">Choose class</button></div>`
        : `<div class="slot-locked"><span>🔒 Slot ${slot}</span><span class="slot-req">Acct Lv ${unlockAt}</span></div>`);
    }

    return `
      <header class="page-header">
        <span class="page-header-icon">👥</span>
        <div class="page-header-text"><h1>Characters</h1><p>Select a hero to control their activities</p></div>
      </header>
      <div class="char-layout">
        <aside class="char-rail">${rail || '<p class="empty-msg">No heroes yet</p>'}</aside>
        <section class="char-detail">${detail}</section>
      </div>
      ${slots.length ? `<div class="slot-row">${slots.join('')}</div>` : ''}`;
  }

  /* ── Inventory & Storage ── */

  function renderInventoryPanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character from the Characters page.</p>';
    const cap = S.inventoryCapacity(state);
    const used = S.inventoryUsed(char);
    const items = Object.entries(char.inventory)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => `<div class="res-item"><span>${resName(id)}</span><strong>${fmt(n)}</strong></div>`)
      .join('') || '<p class="empty-msg">Inventory is empty.</p>';

    return `
      <header class="page-header">
        <span class="page-header-icon">🎒</span>
        <div class="page-header-text">
          <h1>${charLabel(char)}'s Inventory</h1>
          <p>${used} / ${cap} items carried · overflow goes to Storage</p>
        </div>
      </header>
      <div class="res-grid">${items}</div>`;
  }

  function renderStoragePanel() {
    const groups = C.STORAGE_GROUPS.map((g) => {
      const items = g.ids.map((id) =>
        `<div class="res-item"><span>${resName(id)}</span><strong>${fmt(state.storage[id] || 0)}</strong></div>`
      ).join('');
      return `<section class="res-section"><h3>${g.title}</h3><div class="res-grid">${items}</div></section>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">📦</span>
        <div class="page-header-text"><h1>Storage</h1><p>Shared resources for all characters</p></div>
      </header>
      ${groups}`;
  }

  /* ── Combat ── */

  function renderCombatPage(sk) {
    const char = selectedChar();
    const best = char ? charSkillLevel(char, 'combat') : bestSkillLevel('combat');
    const cards = C.MONSTERS.map((mob) => {
      const xpHr = E.getRatePerHour(state, 'xp', 'combat');
      const killsHr = E.getRatePerHour(state, 'kills', mob.id);
      const lootHr = mob.drop ? E.getRatePerHour(state, 'loot', mob.drop.id) : 0;
      const locked = best < mob.level;
      const on = char?.activity === 'combat' && char?.target === mob.id;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${mob.icon}</span>
            <div class="activity-card-title">
              <strong>${mob.name}</strong>
              <span>Lv ${mob.level}${mob.drop ? ` · ${mob.drop.name}` : ''}</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat"><span class="activity-stat-label">XP/hr</span><span class="activity-stat-value">${fmt(xpHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Kills/hr</span><span class="activity-stat-value">${fmt(killsHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Loot/hr</span><span class="activity-stat-value">${fmt(lootHr)}</span></div>
          </div>
          ${locked ? `<p class="empty-msg">Requires Combat Lv ${mob.level}</p>` : `<div class="activity-actions">${renderAssignBtn('combat', mob.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Active on selected hero</strong></p>' : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${sk.desc}</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Combat Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Gathering ── */

  function renderGatheringPage(sk) {
    const veins = C.VEINS[sk.id] ?? [];
    const char = selectedChar();
    const best = char ? charSkillLevel(char, sk.id) : bestSkillLevel(sk.id);
    const speed = char ? E.skillSpeed(state, sk.id, char) : 1;

    const cards = veins.map((vein) => {
      const xpHr = E.getRatePerHour(state, 'xp', sk.id);
      const resHr = E.getRatePerHour(state, 'resources', vein.resource);
      const locked = best < vein.minLevel;
      const on = char?.activity === sk.activity && char?.target === vein.id;
      const pct = char ? xpProgress(char.skills[sk.id]) : 0;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${vein.icon}</span>
            <div class="activity-card-title">
              <strong>${vein.name}</strong>
              <span>${resName(vein.resource)} · Lv ${vein.minLevel}</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat"><span class="activity-stat-label">${sk.name} Speed</span><span class="activity-stat-value">${speed.toFixed(2)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">XP/hr</span><span class="activity-stat-value">${fmt(xpHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">${resName(vein.resource)}/hr</span><span class="activity-stat-value">${fmt(resHr)}</span></div>
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          ${locked ? `<p class="empty-msg">Requires ${sk.name} Lv ${vein.minLevel}</p>` : `<div class="activity-actions">${renderAssignBtn(sk.activity, vein.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Active on selected hero</strong></p>' : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${sk.desc}</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">${sk.name} Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Smelting ── */

  function renderSmeltingPage(sk) {
    const lv = state.smelting.skill.level;
    const slotsOpen = E.smeltSlotsUnlocked(state);
    const slotCards = state.smelting.slots.map((slot, i) => {
      const locked = i >= slotsOpen;
      if (locked) return `<div class="activity-card locked"><strong>Slot ${i + 1}</strong><p class="empty-msg">Unlocks at Smelting Lv ${C.SMELT_SLOT_UNLOCKS[i]}</p></div>`;
      const recipe = C.SMELT_RECIPES.find((r) => r.ore === slot.ore);
      const pct = slot.ore ? Math.min(100, (slot.progress / C.SMELT_TICKS_PER_ORE) * 100) : 0;
      const oreOpts = C.SMELT_RECIPES.map((r) =>
        `<option value="${r.ore}" ${slot.ore === r.ore ? 'selected' : ''}>${r.name}</option>`
      ).join('');

      return `
        <article class="activity-card">
          <strong>Smelter Slot ${i + 1}</strong>
          <select class="slot-select" data-action="set-smelt" data-slot="${i}">
            <option value="">— Select ore —</option>${oreOpts}
          </select>
          ${slot.ore ? `<div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p class="empty-msg">Smelting ${recipe?.name ?? slot.ore}…</p>
            <button type="button" class="btn-xs ghost" data-action="clear-smelt" data-slot="${i}">Clear</button>` : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Smelt ore into bars — runs passively while heroes work elsewhere</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Smelting Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      <div class="activity-grid">${slotCards}</div>`;
  }

  /* ── Producing ── */

  function renderProducingPage(sk) {
    const lv = state.producing.skill.level;
    const slotsOpen = E.produceSlotsUnlocked(state);
    const slotCards = state.producing.slots.map((slot, i) => {
      const locked = i >= slotsOpen;
      if (locked) return `<div class="activity-card locked"><strong>Slot ${i + 1}</strong><p class="empty-msg">Unlocks at Producing Lv ${C.UNLOCK_LEVELS[i]}</p></div>`;
      const def = C.PRODUCE_ITEMS.find((p) => p.id === slot.item);
      const pct = slot.item && def ? Math.min(100, (slot.progress / def.ticks) * 100) : 0;
      const itemOpts = C.PRODUCE_ITEMS.map((p) => {
        const ok = lv >= p.minLevel;
        return `<option value="${p.id}" ${slot.item === p.id ? 'selected' : ''} ${ok ? '' : 'disabled'}>${p.name} (Lv ${p.minLevel})</option>`;
      }).join('');

      return `
        <article class="activity-card">
          <strong>Producer Slot ${i + 1}</strong>
          <select class="slot-select" data-action="set-produce" data-slot="${i}">
            <option value="">— Select product —</option>${itemOpts}
          </select>
          ${slot.item ? `<div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p class="empty-msg">Producing ${def?.name ?? slot.item}…</p>
            <button type="button" class="btn-xs ghost" data-action="clear-produce" data-slot="${i}">Clear</button>` : ''}
        </article>`;
    }).join('');

    const products = C.PRODUCE_ITEMS.map((p) =>
      `<div class="res-item"><span>${p.icon} ${p.name}</span><strong>${fmt(state.storage[p.id] || 0)}</strong></div>`
    ).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Passive production — heroes can work other skills simultaneously</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Producing Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      <div class="activity-grid">${slotCards}</div>
      <section class="detail-box" style="margin-top:16px"><h3>Stored Products</h3><div class="res-grid">${products}</div></section>`;
  }

  function renderComingSoon(sk) {
    return `<div class="coming-soon-panel"><span class="coming-soon-icon">${sk.icon}</span><h2>${sk.name}</h2><p>${sk.desc}</p><p style="margin-top:12px">Coming in a future update.</p></div>`;
  }

  function renderSkillPage(skillId) {
    const sk = C.SKILLS[skillId];
    if (!sk) return '<p class="empty-msg">Unknown skill.</p>';
    if (sk.comingSoon) return renderComingSoon(sk);
    if (skillId === 'combat') return renderCombatPage(sk);
    if (skillId === 'smelting') return renderSmeltingPage(sk);
    if (skillId === 'producing') return renderProducingPage(sk);
    return renderGatheringPage(sk);
  }

  /* ── World Tree ── */

  function renderWorldTreePanel() {
    const branches = C.WORLD_TREE_BRANCHES.map((branch) => {
      const cards = branch.nodes.map((node) => {
        const lv = E.upgradeLevel(state, node.id);
        const bonus = E.upgradeBonusPercent(state, node.id).toFixed(0);
        return `
          <button type="button" class="upgrade-card" data-action="open-upgrade" data-upgrade="${node.id}">
            <span class="upgrade-card-name">${node.name}</span>
            <span class="upgrade-card-level">Lv ${lv}</span>
            <span class="upgrade-card-bonus">+${bonus}%</span>
          </button>`;
      }).join('');
      return `<section class="branch-section"><div class="branch-header"><span class="branch-icon">${branch.icon}</span><h2>${branch.name}</h2></div><div class="upgrade-grid">${cards}</div></section>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">🌳</span>
        <div class="page-header-text"><h1>World Tree</h1><p>Each upgrade costs a single resource type</p></div>
      </header>
      <div class="branch-grid">${branches}</div>`;
  }

  function renderUpgradeModal() {
    const modal = $('upgrade-modal');
    const content = $('upgrade-modal-content');
    if (!modal || !content || !selectedUpgradeId) { if (modal) modal.hidden = true; return; }

    const found = E.findUpgradeNode(selectedUpgradeId);
    if (!found) { modal.hidden = true; return; }
    const { branch, node } = found;
    const lv = E.upgradeLevel(state, node.id);
    const costs = E.upgradeCosts(node.id, lv);
    const canBuy = E.canAffordUpgrade(state, node.id);
    const currentBonus = E.upgradeBonusPercent(state, node.id).toFixed(0);
    const nextBonus = ((lv + 1) * C.UPGRADE_BONUS_PER_LEVEL * 100).toFixed(0);

    const reqList = Object.entries(costs).map(([res, amt]) => {
      const owned = state.storage[res] || 0;
      return `<li class="${owned >= amt ? 'met' : 'unmet'}"><span>${resName(res)}</span><span>${fmt(owned)} / ${fmt(amt)}</span></li>`;
    }).join('');

    content.innerHTML = `
      <div class="upgrade-modal-head"><h2>${node.name}</h2><p>${branch.name} · ${node.desc}</p></div>
      <div class="upgrade-detail-row"><span class="upgrade-detail-label">Current Level</span><span class="upgrade-detail-value">${lv}</span></div>
      <div class="upgrade-detail-row"><span class="upgrade-detail-label">Current Bonus</span><span class="upgrade-detail-value bonus">+${currentBonus}%</span></div>
      <div class="upgrade-detail-row"><span class="upgrade-detail-label">Next Level Bonus</span><span class="upgrade-detail-value bonus">+${nextBonus}%</span></div>
      <div class="upgrade-requirements"><h3>Requirement</h3><ul class="req-list">${reqList}</ul></div>
      <div class="upgrade-modal-actions">
        <button type="button" class="btn-sm primary ${canBuy ? '' : 'disabled'}" data-action="buy-upgrade" data-upgrade="${node.id}" ${canBuy ? '' : 'disabled'}>Upgrade</button>
        <button type="button" class="btn-sm ghost" data-action="close-upgrade-modal">Close</button>
      </div>`;
    modal.hidden = false;
  }

  /* ── Settings ── */

  function renderSettingsPanel() {
    const session = window.WorldrootSession;
    const sessionText = session?.isCloud ? `Cloud save · ${session.displayName}` : 'Offline · this device only';
    return `
      <header class="page-header">
        <span class="page-header-icon">⚙</span>
        <div class="page-header-text"><h1>Settings</h1><p>Save data and account options</p></div>
      </header>
      <div class="settings-grid">
        <section class="detail-box"><h3>Save</h3><p class="settings-line">${sessionText}</p>
          <div class="btn-row">
            <button type="button" class="btn-sm ghost" data-action="go-menu">Main menu</button>
            <button type="button" class="btn-sm danger" data-action="reset-save">Reset save</button>
          </div>
        </section>
        <section class="detail-box"><h3>Account</h3>
          <p class="settings-line">Account Level: <strong>${fmt(S.accountTotalLevel(state))}</strong></p>
          <p class="settings-line">Characters: <strong>${state.characters.length} / ${MAX_SLOTS}</strong></p>
        </section>
        <section class="detail-box"><h3>Activity log</h3><ul id="activity-log" class="log"></ul></section>
      </div>`;
  }

  function renderMainPanel() {
    const el = $('panel-main');
    if (!el) return;
    const skill = C.SKILLS[activePage];
    if (activePage === 'characters') el.innerHTML = renderCharactersPanel();
    else if (activePage === 'inventory') el.innerHTML = renderInventoryPanel();
    else if (activePage === 'storage') el.innerHTML = renderStoragePanel();
    else if (activePage === 'worldtree') el.innerHTML = renderWorldTreePanel();
    else if (activePage === 'settings') { el.innerHTML = renderSettingsPanel(); renderLogEl(); }
    else if (skill && !skill.comingSoon) el.innerHTML = renderSkillPage(activePage);
    else if (skill?.comingSoon) el.innerHTML = renderComingSoon(skill);
    else el.innerHTML = '<p class="empty-msg">Select a page.</p>';
  }

  function renderClassModal() {
    const modal = $('class-modal');
    if (!modal) return;
    modal.hidden = !state.pendingSlot;
    if (!state.pendingSlot) return;
    $('class-modal-title').textContent = `Choose a class — Slot ${state.pendingSlot}`;
    $('class-options').innerHTML = Object.values(C.CLASSES).map((cls) => `
      <button type="button" class="class-pick" data-action="pick-class" data-class="${cls.id}">
        <span class="class-pick-icon">${cls.icon}</span>
        <span class="class-pick-name">${cls.name}</span>
        <span class="class-pick-desc">${cls.desc}</span>
      </button>`).join('');
  }

  function render() {
    renderHud();
    renderSidebar();
    renderMainPanel();
    renderClassModal();
    renderUpgradeModal();
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'switch-page') { switchPage(btn.dataset.page); return; }
    if (action === 'select-char') { S.selectCharacter(state, Number(btn.dataset.char)); render(); return; }
    if (action === 'pick-class') {
      S.addCharacter(state, btn.dataset.class);
      addLog(`${C.CLASSES[btn.dataset.class].name} joined.`);
      render(); return;
    }
    if (action === 'open-class') { state.pendingSlot = Number(btn.dataset.slot); renderClassModal(); return; }
    if (action === 'assign-selected') {
      assignSelected(btn.dataset.activity, btn.dataset.target); return;
    }
    if (action === 'stop-selected') {
      const idx = selectedIndex();
      S.stopActivity(state, idx);
      addLog(`${charLabel(state.characters[idx])} stopped.`);
      render(); return;
    }
    if (action === 'open-upgrade') { selectedUpgradeId = btn.dataset.upgrade; renderUpgradeModal(); return; }
    if (action === 'close-upgrade-modal') { selectedUpgradeId = null; renderUpgradeModal(); return; }
    if (action === 'buy-upgrade') {
      const found = E.findUpgradeNode(btn.dataset.upgrade);
      if (found && E.buyUpgrade(state, btn.dataset.upgrade)) {
        addLog(`Upgraded ${found.node.name} to Lv ${E.upgradeLevel(state, btn.dataset.upgrade)}.`);
        render();
      }
      return;
    }
    if (action === 'reset-save') {
      if (confirm('Reset all progress?')) {
        state = S.resetState();
        selectedUpgradeId = null;
        if (window.WorldrootSession?.isCloud && window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
        addLog('Save cleared.');
        render();
      }
      return;
    }
    if (action === 'go-menu' && window.WorldrootGoMenu) window.WorldrootGoMenu();
  }

  function handleChange(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if (el.dataset.action === 'set-smelt') {
      const idx = Number(el.dataset.slot);
      const ore = el.value || null;
      if (ore) E.setSmeltSlot(state, idx, ore);
      else E.clearSmeltSlot(state, idx);
      render();
    }
    if (el.dataset.action === 'set-produce') {
      const idx = Number(el.dataset.slot);
      const item = el.value || null;
      if (item) E.setProduceSlot(state, idx, item);
      else E.clearProduceSlot(state, idx);
      render();
    }
  }

  function init(initialState) {
    state = initialState;
    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('change', handleChange);
    renderSidebar();
    switchPage(state.characters.length ? 'characters' : 'combat');
    if (!state.characters.length) renderClassModal();
  }

  window.WorldrootUI = {
    init, render, refresh: render, addLog,
    getState: () => state,
    setState: (next) => { state = next; },
    setSessionBadge: () => { if (activePage === 'settings') renderMainPanel(); },
  };

  function showBootError(msg) {
    const panel = $('panel-main');
    if (panel) panel.innerHTML = `<p class="empty-msg" style="color:#e8a0a0">${msg}</p>`;
  }

  function autoBoot() {
    try {
      if (!window.WorldrootState || !window.WorldrootEngine) {
        showBootError('Game failed to load. Hard refresh or Play offline from home.');
        return;
      }
      const mode = sessionStorage.getItem('worldroot_play_mode');
      window.WorldrootState.setPlayMode(mode === 'cloud' ? 'cloud' : 'offline');
      window.WorldrootSession = window.WorldrootSession || { isCloud: mode === 'cloud', isOffline: mode !== 'cloud', displayName: 'Offline' };
      if (window.__worldrootBooted) return;
      window.__worldrootBooted = true;
      init(window.WorldrootState.loadState());
      addLog(state.characters.length ? 'Welcome back to Worldroot.' : 'Welcome to Worldroot. Choose your first class.');
      setInterval(() => {
        window.WorldrootEngine.tick(window.WorldrootUI.getState());
        window.WorldrootState.refreshPendingSlot(window.WorldrootUI.getState());
        window.WorldrootUI.refresh();
      }, C?.TICK_MS ?? 1000);
      window.addEventListener('beforeunload', () => {
        window.WorldrootState.saveState(window.WorldrootUI.getState());
        if (window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
      });
    } catch (err) {
      console.error('[Worldroot] boot failed:', err);
      showBootError(`Game error: ${err.message}`);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoBoot);
  else autoBoot();
})();
