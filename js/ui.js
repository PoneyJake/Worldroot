/** Worldroot — sidebar Melvor-style UI. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  const SIDEBAR_NAV = C?.SIDEBAR_NAV ?? [];
  const MAX_SLOTS = C?.MAX_SLOTS ?? 3;

  let state = null;
  let activePage = 'characters';
  let selectedSmeltSlot = 0;
  let invPage = 0;
  let storPage = 0;
  let questTrack = 'main';
  let craftCategory = 'armor';
  let storageQuickTap = true;
  let storageSplitMode = false;
  let transferModal = null;
  let leaderboardEntries = null;
  let leaderboardError = null;
  let leaderboardLoading = false;
  let logBuffer = [];
  let holdTimer = null;
  let holdEl = null;

  function $(id) { return document.getElementById(id); }

  function escHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function fmt(n) { return Math.floor(n).toLocaleString(); }
  function resName(id) { return C.RESOURCE_NAMES?.[id] ?? id; }
  function iconSrc(key) {
    const file = C.GAME_ICONS?.[key];
    if (!file) return null;
    return `${C.ICON_BASE}/${file}.png`;
  }
  function iconHtml(key, className = 'game-icon') {
    const src = iconSrc(key);
    if (!src) return `<span class="${className} icon-fallback">?</span>`;
    return `<img class="${className}" src="${src}" alt="" draggable="false" loading="lazy" />`;
  }
  function resTipText(id) {
    return resName(id);
  }

  function resIcon(id, className = 'game-icon') {
    const tip = resTipText(id);
    return `<span class="res-tip-wrap" data-res-tip="${tip}">${iconHtml(id, className)}</span>`;
  }

  function classPortraitHtml(classId, className = 'class-portrait-img') {
    const cls = C.CLASSES[classId];
    const file = cls?.portrait;
    if (!file) return `<span class="${className} fallback">${cls?.icon ?? '?'}</span>`;
    const src = `${C.PORTRAIT_BASE}/${file}.png`;
    return `<img class="${className}" src="${src}" alt="${cls.name}" draggable="false" loading="lazy" />`;
  }
  function skillName(id) { return C.SKILLS[id]?.name ?? id; }

  function renderCharSwitcher() {
    if (!state.characters.length) return '';
    const sel = selectedIndex();
    return `
      <div class="char-switcher">
        ${state.characters.map((c, i) => {
          const cls = C.CLASSES[c.classId];
          return `<button type="button" class="char-switch-btn${i === sel ? ' active' : ''}"
            data-action="select-char" data-char="${i}" title="${cls.name}">
            ${classPortraitHtml(c.classId, 'char-switch-portrait')}
          </button>`;
        }).join('')}
      </div>`;
  }

  function skillLevelForNav(skillId) {
    if (skillId === 'smelting') return state.smelting.skill.level;
    const char = selectedChar();
    if (!char) return 0;
    if (skillId === 'producing') return char.producing?.skill?.level ?? 0;
    return charSkillLevel(char, skillId);
  }

  function pageCharBar() {
    if (!state.characters.length) return '';
    return `<div class="page-char-bar">${renderCharSwitcher()}</div>`;
  }

  function smoothGatherPct(char) {
    if (!char?.activity || !C.VEINS[char.activity]) return 0;
    const ticks = E.gatherIntervalTicks();
    const totalMs = ticks * C.TICK_MS;
    const baseMs = (char.gatherCd || 0) * C.TICK_MS;
    const sinceTick = Date.now() - (state.lastTickAt || Date.now());
    const elapsed = Math.min(totalMs, baseMs + Math.max(0, sinceTick));
    return Math.min(100, (elapsed / totalMs) * 100);
  }

  function updateSmoothGatherBars() {
    const char = selectedChar();
    if (!char) return;
    document.querySelectorAll('[data-gather-progress]').forEach((bar) => {
      const veinId = bar.dataset.gatherVein;
      const on = char.activity === activePage && char.target === veinId;
      bar.style.width = on ? `${smoothGatherPct(char)}%` : '0%';
    });
    requestAnimationFrame(updateSmoothGatherBars);
  }

  function skillActivityBadges(skillId) {
    const chars = state.characters.filter((c) => {
      if (skillId === 'combat') return c.activity === 'combat';
      const sk = C.SKILLS[skillId];
      return sk && c.activity === sk.activity;
    });
    if (!chars.length) return '';
    return `<span class="sidebar-skill-chars">${chars.map((c) => C.CLASSES[c.classId].icon).join('')}</span>`;
  }

  function renderSlotGrid(slots, totalSlots, opts = {}) {
    const {
      transferType = null, gridClass = '', start = 0, end = totalSlots,
      holdUse = false, char = null, smeltOrePick = false,
    } = opts;
    let html = '';
    for (let idx = start; idx < end; idx++) {
      const slot = slots[idx];
      if (!slot) {
        html += `<div class="item-slot empty"><span class="item-slot-empty">+</span></div>`;
      } else {
        const transferAttr = transferType
          ? ` data-transfer-type="${transferType}" data-slot="${idx}"`
          : '';
        const isOre = smeltOrePick && C.SMELT_RECIPES.some((r) => r.ore === slot.resourceId);
        const canLoad = isOre && E.findFirstSmeltSlotForOre(state, slot.resourceId) >= 0;
        const smeltAttr = canLoad ? ` data-action="load-smelt-ore" data-inv="${idx}"` : '';
        const consumable = holdUse && C.CONSUMABLE_ITEMS?.[slot.resourceId];
        const canUse = consumable && char && E.canUseConsumable(state, char, slot.resourceId);
        const holdAttr = canUse ? ` data-hold-use="${idx}"` : '';
        const canEquip = transferType === 'inv' && char && E.canEquipItem(char, slot.resourceId);
        const equipAttr = canEquip ? ` data-action="equip-item" data-inv="${idx}"` : '';
        const tapHint = transferType && activePage === 'storage'
          ? (storageSplitMode ? ' — click: custom amount' : storageQuickTap ? ' — inv→all storage · storage→1 stack' : ' — double-click: move 1 · shift+click: move all')
          : '';
        const holdHint = canUse ? ' · hold 2s to use' : (canLoad ? ' — click to load smelter' : (canEquip ? ' — click to equip' : ''));
        html += `
          <div class="item-slot filled${transferType ? ' transferable' : ''}${canLoad ? ' smelt-ore-pick' : ''}${canUse ? ' hold-use-slot' : ''}${canEquip ? ' equip-item-slot' : ''}" title="${resName(slot.resourceId)}${tapHint}${holdHint}"${transferAttr}${smeltAttr}${holdAttr}${equipAttr}>
            <span class="item-slot-icon">${resIcon(slot.resourceId, 'game-icon')}</span>
            <span class="item-slot-qty">${fmt(slot.amount)}</span>
            ${canUse ? '<span class="hold-use-ring"></span>' : ''}
          </div>`;
      }
    }
    return `<div class="item-slot-grid ${gridClass}">${html}</div>`;
  }

  function renderPageTabs(page, pageCount, action) {
    if (pageCount <= 1) return '';
    return `<div class="slot-page-tabs">${Array.from({ length: pageCount }, (_, i) =>
      `<button type="button" class="slot-page-tab${i === page ? ' active' : ''}" data-action="${action}" data-page="${i}">Page ${i + 1}</button>`,
    ).join('')}</div>`;
  }

  function renderPagedInventory(char, opts = {}) {
    const total = S.inventorySlotCount(char);
    const pageSize = C.INVENTORY_PAGE_SIZE || 16;
    const pages = S.inventoryPageCount(char);
    const start = invPage * pageSize;
    const end = Math.min(start + pageSize, total);
    return `
      ${renderPageTabs(invPage, pages, 'inv-page')}
      ${renderSlotGrid(char.inventorySlots, total, {
        ...opts, start, end, holdUse: true, char,
      })}`;
  }

  function renderPagedStorage(opts = {}) {
    const total = S.storageSlotCount(state);
    const pageSize = C.STORAGE_PAGE_SIZE || 24;
    const pages = S.storagePageCount(state);
    const start = storPage * pageSize;
    const end = Math.min(start + pageSize, total);
    return `
      ${renderPageTabs(storPage, pages, 'stor-page')}
      ${renderSlotGrid(state.storageSlots, total, { ...opts, start, end })}`;
  }

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

  function renderSkillXpBar(skill, label) {
    if (!skill) return '';
    const needed = S.xpForLevel(skill.level);
    const pct = xpProgress(skill);
    return `
      <div class="skill-xp-panel">
        <div class="skill-xp-header">
          <span class="skill-xp-label">${label}</span>
          <span class="skill-xp-level">Lv ${skill.level}</span>
        </div>
        <div class="progress-bar skill-xp-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <span class="skill-xp-text">${fmt(skill.xp)} / ${fmt(needed)} XP to next level</span>
      </div>`;
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
    if (pageId !== 'storage') closeTransferModal();
    activePage = pageId;
    renderSidebar();
    renderMainPanel();
    if (pageId === 'leaderboard') refreshLeaderboard();
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
      const skillChars = item.type === 'skill' ? skillActivityBadges(item.id) : '';
      const skillLv = item.type === 'skill' ? `<span class="sidebar-skill-lv">Lv ${skillLevelForNav(item.id)}</span>` : '';
      const charAlert = item.id === 'characters' && state.pendingSlot ? '<span class="sidebar-alert">!</span>' : '';
      html += `
        <button type="button" class="sidebar-btn${isActive ? ' active' : ''}${soon}"
          data-action="switch-page" data-page="${item.id}" ${item.comingSoon ? 'disabled' : ''}>
          <span class="sidebar-btn-icon">${item.icon}</span>
          <span class="sidebar-btn-label">${item.label}</span>
          ${skillLv}${skillChars}${charAlert}${badge || sel}
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
    const stopBtn = on
      ? `<button type="button" class="btn-sm ghost" data-action="stop-selected">Stop</button>` : '';
    return `<button type="button" class="btn-sm ${on ? 'active' : 'primary'}"
      data-action="assign-selected" data-activity="${activity}" data-target="${targetId}">
      ${on ? 'Active ✓' : `Assign ${charLabel(char)}`}
    </button>${stopBtn}`;
  }

  function renderInlineClassPicker() {
    if (!state.pendingSlot) return '';
    const account = S.accountTotalLevel(state);
    const unlockAt = C.SLOT_UNLOCK_AT[state.pendingSlot - 1] ?? 0;
    if (account < unlockAt) return '';
    const picks = Object.values(C.CLASSES).map((cls) => `
      <button type="button" class="class-pick" data-action="pick-class" data-class="${cls.id}">
        <span class="class-pick-icon">${classPortraitHtml(cls.id, 'class-portrait-img pick')}</span>
        <span class="class-pick-name">${cls.name}</span>
        <span class="class-pick-desc">${cls.desc}</span>
      </button>`).join('');
    return `
      <section class="inline-class-pick">
        <h3>Slot ${state.pendingSlot} ready — choose a class</h3>
        <div class="class-options">${picks}</div>
      </section>`;
  }

  function renderCharStatCells(stats) {
    return stats.map((s) => `
      <div class="char-stat-cell">
        <span class="char-stat-label">${s.label}</span>
        <span class="char-stat-value">${s.value}</span>
      </div>`).join('');
  }

  function renderCharCombatStats(char) {
    const pct = (n) => `${(n * 100).toFixed(1)}%`;
    const stats = [
      { label: 'HP', value: fmt(E.charMaxHp(state, char)) },
      { label: 'MP', value: fmt(E.charMaxMp(state, char)) },
      { label: 'Damage', value: fmt(E.charDamage(state, char)) },
      { label: 'Defence', value: fmt(E.effectBonus(state, 'base_defence')) },
      { label: 'Accuracy', value: fmt(E.effectBonus(state, 'base_accuracy')) },
      { label: 'Crit Chance', value: pct(E.effectBonus(state, 'crit_chance')) },
      { label: 'Crit Damage', value: pct(E.effectBonus(state, 'crit_damage')) },
      { label: 'Drop Rate', value: pct(E.dropBonus(state)) },
      { label: 'Gold Gain', value: pct(E.effectBonus(state, 'gold_gain')) },
      { label: 'Carry Cap.', value: pct(E.effectBonus(state, 'carry_capacity')) },
    ];
    const attrs = [
      { label: 'STR', value: fmt(E.charStat(state, char, 'strength')) },
      { label: 'AGI', value: fmt(E.charStat(state, char, 'agility')) },
      { label: 'MAG', value: fmt(E.charStat(state, char, 'magic')) },
    ];
    return `
      <section class="char-stats-section">
        <h3 class="char-stats-heading">Combat</h3>
        <div class="char-stat-grid">${renderCharStatCells(stats)}</div>
        <div class="char-stat-grid attrs">${renderCharStatCells(attrs)}</div>
      </section>`;
  }

  function renderCharGatherStats(char) {
    const gatherSkills = ['mining', 'woodcutting', 'fishing'];
    const multiLabels = {
      mining: 'Multi-Ore',
      woodcutting: 'Multi-Log',
      fishing: 'Multi-Catch',
    };
    const cards = gatherSkills.map((sid) => {
      const sk = C.SKILLS[sid];
      const lv = charSkillLevel(char, sid);
      const eff = E.gatherEfficiency(state, char, sid);
      const multi = (E.gatherMultiChance(state, char, sid) * 100).toFixed(1);
      const xpPct = (E.skillXpBonus(state, sid) * 100).toFixed(0);
      const carryPct = (E.effectBonus(state, `${sid}_carry`) * 100).toFixed(0);
      return `
        <article class="char-gather-card">
          <div class="char-gather-head">
            <span class="char-gather-icon">${sk.icon}</span>
            <div>
              <strong>${sk.name}</strong>
              <span>Lv ${lv}</span>
            </div>
            <div class="progress-bar mini"><div class="progress-bar-fill" style="width:${xpProgress(char.skills[sid])}%"></div></div>
          </div>
          <div class="char-stat-grid compact">
            ${renderCharStatCells([
              { label: 'Efficiency', value: eff },
              { label: 'Speed', value: `${C.GATHER_RATE_PER_MIN}/min` },
              { label: multiLabels[sid], value: `${multi}%` },
              { label: 'XP Bonus', value: `+${xpPct}%` },
              { label: 'Carry Cap.', value: `+${carryPct}%` },
            ])}
          </div>
        </article>`;
    }).join('');

    return `
      <section class="char-stats-section">
        <h3 class="char-stats-heading">Gathering</h3>
        <div class="char-gather-grid">${cards}</div>
      </section>`;
  }

  function renderMobDrops(mob) {
    const dropPct = (E.dropChance(state) * 100).toFixed(1);
    const goldAmt = mob.goldMin === mob.goldMax
      ? `${mob.goldMin}`
      : `${mob.goldMin}–${mob.goldMax}`;
    const rows = [
      `<div class="mob-drop-row"><span class="mob-drop-item"><span class="mob-drop-gold">🪙</span> Gold</span><span class="mob-drop-pct">×${goldAmt}</span></div>`,
    ];
    if (mob.drop) {
      rows.push(
        `<div class="mob-drop-row"><span class="mob-drop-item">${resIcon(mob.drop.id, 'game-icon lg')} ${resName(mob.drop.id)}</span><span class="mob-drop-pct">${dropPct}%</span></div>`
      );
    }
    return `<div class="mob-drops">${rows.join('')}</div>`;
  }

  function renderSkillStopHeader(extraStopAction) {
    const char = selectedChar();
    const charStop = char?.activity
      ? `<button type="button" class="btn-sm ghost" data-action="stop-selected">Stop ${charLabel(char)}</button>` : '';
    const extra = extraStopAction
      ? `<button type="button" class="btn-sm ghost" data-action="${extraStopAction}">Stop all slots</button>` : '';
    if (!charStop && !extra) return '';
    return `<div class="page-stop-row">${charStop}${extra}</div>`;
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
          <span class="char-rail-icon">${classPortraitHtml(char.classId, 'class-portrait-img sm')}</span>
          <span class="char-rail-name">${cls.name}</span>
          <span class="char-rail-lv">Lv ${S.characterTotalLevel(char)}</span>
        </button>`;
    }).join('');

    const char = selectedChar();
    let detail = '<p class="empty-msg">Choose a class to begin.</p>';
    if (char) {
      const cls = C.CLASSES[char.classId];

      detail = `
        <div class="char-detail-head">
          <div class="char-portrait lg">${classPortraitHtml(char.classId)}</div>
          <div>
            <h2>${cls.name}</h2>
            <p class="char-meta">${cls.desc}</p>
            <div class="char-activity-pill ${char.activity ? 'active' : ''}">▶ ${activityLabel(char)}</div>
          </div>
          <div class="char-total-badge"><span>Total</span><strong>${S.characterTotalLevel(char)}</strong></div>
        </div>
        ${renderCharCombatStats(char)}
        ${renderCharGatherStats(char)}
        <p class="hint-bar">Select this hero, then open a skill page to assign them. Full inventory = lost loot.</p>
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
      ${pageCharBar()}
      <div class="char-layout">
        <aside class="char-rail">${rail || '<p class="empty-msg">No heroes yet</p>'}</aside>
        <section class="char-detail">${detail}</section>
      </div>
      ${renderInlineClassPicker()}
      ${slots.length ? `<div class="slot-row">${slots.join('')}</div>` : ''}`;
  }

  /* ── Inventory & Storage ── */

  function renderInventoryPanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character from the Characters page.</p>';
    return `
      <header class="page-header">
        <span class="page-header-icon">🎒</span>
        <div class="page-header-text">
          <h1>Inventory</h1>
          <p>Hold-click bags & pouches for 2s to use · overflow is lost</p>
        </div>
      </header>
      ${pageCharBar()}
      <section class="storage-panel slot-panel-fit">
        <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
        ${renderPagedInventory(char, { transferType: 'inv', gridClass: 'grid-inv-4' })}
      </section>`;
  }

  function renderStoragePanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Create a character first.</p>';
    return `
      <header class="page-header">
        <span class="page-header-icon">📦</span>
        <div class="page-header-text">
          <h1>Storage</h1>
          <p>${storageSplitMode ? 'Custom transfer: click a stack to choose amount' : storageQuickTap ? 'Quick tap: inventory→all to storage · storage→one stack to inventory' : 'Double-click: move 1 · shift+click: move all'}</p>
        </div>
      </header>
      ${pageCharBar()}
      <div class="storage-actions">
        <button type="button" class="btn-sm primary" data-action="deposit-all">Deposit all to storage</button>
        <button type="button" class="btn-sm${storageQuickTap ? ' active' : ''}" data-action="toggle-quick-tap">Quick tap ${storageQuickTap ? 'ON' : 'OFF'}</button>
        <button type="button" class="btn-sm${storageSplitMode ? ' active' : ''}" data-action="toggle-split-mode">Custom amount ${storageSplitMode ? 'ON' : 'OFF'}</button>
      </div>
      <div class="storage-dual">
        <section class="storage-half storage-panel slot-panel-fit">
          <h3 class="storage-half-title">Storage</h3>
          ${renderPagedStorage({ transferType: 'storage', gridClass: 'grid-storage-6' })}
        </section>
        <section class="storage-half storage-panel slot-panel-fit">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
          ${renderPagedInventory(char, { transferType: 'inv', gridClass: 'grid-inv-4' })}
        </section>
      </div>`;
  }

  /* ── Combat ── */

  function renderCombatArena(char) {
    if (!char || char.activity !== 'combat' || !char.target) return '';
    const monster = C.MONSTERS.find((m) => m.id === char.target);
    if (!monster) return '';
    const cs = char.combatState;
    const cls = C.CLASSES[char.classId];
    const charHp = cs?.charHp ?? E.charMaxHp(state, char);
    const charMax = cs?.charMaxHp ?? E.charMaxHp(state, char);
    const mobHp = cs?.mobHp ?? E.mobMaxHp(monster);
    const mobMax = cs?.mobMaxHp ?? E.mobMaxHp(monster);
    const charPct = charMax ? Math.max(0, (charHp / charMax) * 100) : 0;
    const mobPct = mobMax ? Math.max(0, (mobHp / mobMax) * 100) : 0;
    const respawn = cs?.respawnSec > 0
      ? `<p class="combat-respawn">Respawning in ${Math.ceil(cs.respawnSec)}s…</p>` : '';

    return `
      <div class="combat-arena">
        <div class="combat-fighter player">
          <span class="fighter-icon">${classPortraitHtml(char.classId, 'class-portrait-img arena')}</span>
          <span class="fighter-name">${cls.name}</span>
          <div class="hp-bar"><div class="hp-bar-fill player" style="width:${charPct}%"></div></div>
          <span class="hp-text">${fmt(charHp)} / ${fmt(charMax)} HP · ${E.charDamage(state, char)} dmg</span>
          ${respawn}
        </div>
        <div class="combat-vs">⚔</div>
        <div class="combat-fighter mob">
          <span class="fighter-icon">${iconHtml(monster.id, 'game-icon xxl')}</span>
          <span class="fighter-name">${monster.name}</span>
          <div class="hp-bar"><div class="hp-bar-fill mob" style="width:${mobPct}%"></div></div>
          <span class="hp-text">${fmt(mobHp)} / ${fmt(mobMax)} HP · ${monster.damage} dmg</span>
        </div>
      </div>`;
  }

  function renderCombatPage(sk) {
    const char = selectedChar();
    const best = char ? charSkillLevel(char, 'combat') : bestSkillLevel('combat');
    const arena = renderCombatArena(char);
    const rateChar = char || state.characters[0];
    const cards = C.MONSTERS.map((mob) => {
      const rates = rateChar ? E.getTheoreticalCombatRates(state, rateChar, mob) : { xpHr: 0, killsHr: 0 };
      const xpPerKill = rateChar ? E.combatXpPerKill(state, rateChar, mob) : 0;
      const locked = best < mob.level;
      const on = char?.activity === 'combat' && char?.target === mob.id;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${iconHtml(mob.id, 'game-icon xl')}</span>
            <div class="activity-card-title">
              <strong>${mob.name}</strong>
              <span>Lv ${mob.level} · ${E.mobMaxHp(mob)} HP · ${mob.damage} dmg · ${fmt(xpPerKill)} XP/kill</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat"><span class="activity-stat-label">XP/kill</span><span class="activity-stat-value">${fmt(xpPerKill)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">XP/hr</span><span class="activity-stat-value">${fmt(rates.xpHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Kills/hr</span><span class="activity-stat-value">${fmt(rates.killsHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Attack speed</span><span class="activity-stat-value">${C.COMBAT_ATTACK_SEC}s</span></div>
          </div>
          ${renderMobDrops(mob)}
          ${locked ? `<p class="empty-msg">Requires Combat Lv ${mob.level}</p>` : `<div class="activity-actions">${renderAssignBtn('combat', mob.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Fighting now</strong></p>' : ''}
        </article>`;
    }).join('');

    const combatSkill = char?.skills?.combat;
    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Fight monsters — earn XP, gold, and loot on kills</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Combat Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      ${combatSkill ? renderSkillXpBar(combatSkill, 'Combat XP') : ''}
      ${pageCharBar()}
      ${arena}
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Gathering ── */

  function gatherStatLabels(skillId) {
    if (skillId === 'mining') return { eff: 'Mining Efficiency', multi: 'Multi-Ore', chance: 'Ore Chance' };
    if (skillId === 'woodcutting') return { eff: 'Woodcutting Efficiency', multi: 'Multi-Log', chance: 'Log Chance' };
    return { eff: 'Fishing Efficiency', multi: 'Multi-Catch', chance: 'Catch Chance' };
  }

  function renderGatheringPage(sk) {
    const veins = C.VEINS[sk.id] ?? [];
    const char = selectedChar();
    const best = char ? charSkillLevel(char, sk.id) : bestSkillLevel(sk.id);
    const labels = gatherStatLabels(sk.id);
    const eff = char ? E.gatherEfficiency(state, char, sk.id) : 0;
    const multiPct = char ? (E.gatherMultiChance(state, char, sk.id) * 100).toFixed(1) : '0';
    const gatherSec = E.gatherIntervalTicks() * (C.TICK_MS / 1000);
    const resLabel = sk.id === 'mining' ? 'ore' : sk.id === 'woodcutting' ? 'log' : 'fish';

    const cards = veins.map((vein) => {
      const xpPerAction = char ? E.gatherXpPerAction(state, char, sk.id, vein) : (vein.xp ?? 5);
      const locked = best < vein.minLevel;
      const on = char?.activity === sk.activity && char?.target === vein.id;
      const gatherPct = on ? Math.min(100, ((char.gatherCd || 0) / E.gatherIntervalTicks()) * 100) : 0;
      const catchRaw = char ? E.gatherCatchDisplayPercent(state, char, sk.id, vein) : 0;
      const catchPct = catchRaw >= 100 ? catchRaw.toFixed(0) : catchRaw.toFixed(1);
      const thresholds = E.gatherPlusOneThresholds(vein);

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${iconHtml(vein.icon, 'game-icon gather')}</span>
            <div class="activity-card-title">
              <strong>${vein.name}</strong>
              <span>Lv ${vein.minLevel} · ${resName(vein.resource)} · ${fmt(xpPerAction)} XP/gather</span>
            </div>
          </div>
          <div class="vein-stat-trio">
            <div class="vein-stat-box">
              <span class="vein-stat-label">${labels.chance}</span>
              <span class="vein-stat-value">${catchPct}%</span>
            </div>
            <div class="vein-stat-box">
              <span class="vein-stat-label">10% +1 ${resLabel}</span>
              <span class="vein-stat-value">${fmt(thresholds.effFor10)} eff</span>
            </div>
            <div class="vein-stat-box">
              <span class="vein-stat-label">100% +1 ${resLabel}</span>
              <span class="vein-stat-value">${fmt(thresholds.effFor100)} eff</span>
            </div>
          </div>
          ${on ? `<div class="progress-bar"><div class="progress-bar-fill" data-gather-progress data-gather-vein="${vein.id}" style="width:${gatherPct}%"></div></div>` : ''}
          ${locked ? `<p class="empty-msg">Requires ${sk.name} Lv ${vein.minLevel}</p>` : `<div class="activity-actions">${renderAssignBtn(sk.activity, vein.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Active on selected hero</strong></p>' : ''}
        </article>`;
    }).join('');

    const summaryStats = char ? `
      <div class="gather-summary-stats">
        <div class="gather-summary-stat">
          <span class="gather-summary-label">Speed</span>
          <span class="gather-summary-value">${gatherSec}s</span>
          <span class="gather-summary-sub">per ${resLabel}</span>
        </div>
        <div class="gather-summary-stat">
          <span class="gather-summary-label">${labels.eff}</span>
          <span class="gather-summary-value">${eff}</span>
        </div>
        <div class="gather-summary-stat">
          <span class="gather-summary-label">${labels.multi}</span>
          <span class="gather-summary-value">${multiPct}%</span>
        </div>
      </div>` : '';

    const gatherSkill = char?.skills?.[sk.id];
    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${sk.desc} · +${C.LEVEL_EFF_BONUS} eff & +${C.LEVEL_MULTI_BONUS * 100}% multi per level</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">${sk.name} Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      ${gatherSkill ? renderSkillXpBar(gatherSkill, `${sk.name} XP`) : ''}
      ${pageCharBar()}
      ${summaryStats}
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Smelting ── */

  function renderSmeltingPage(sk) {
    const lv = state.smelting.skill.level;
    const char = selectedChar();
    const slotsOpen = E.smeltSlotsUnlocked(state);
    const batchCap = E.smeltBatchCapacity(state);
    const slotCards = state.smelting.slots.map((slot, i) => {
      const locked = i >= slotsOpen;
      if (locked) return `<div class="activity-card locked"><strong>Slot ${i + 1}</strong><p class="empty-msg">Unlocks at Smelting Lv ${C.SMELT_SLOT_UNLOCKS[i]}</p></div>`;
      const recipe = C.SMELT_RECIPES.find((r) => r.ore === slot.ore);
      const pct = slot.ore && recipe ? Math.min(100, (slot.progress / recipe.ticks) * 100) : 0;
      const selected = i === selectedSmeltSlot ? ' smelt-slot-selected' : '';

      const readySlot = slot.ready > 0
        ? `<div class="smelt-item-wrap">
            <div class="smelt-slot-pair-label">Click to collect</div>
            <div class="produce-ready-slot transferable" data-collect-type="smelt" data-slot="${i}" title="Click to collect ${resName(slot.readyBar)} into inventory">
              <span class="item-slot-icon">${resIcon(slot.readyBar)}</span>
              <span class="item-slot-qty">${fmt(slot.ready)}</span>
            </div>
          </div>` : '';

      return `
        <article class="activity-card smelt-drop-zone${selected}" data-smelt-slot="${i}">
          <strong class="smelt-slot-title" data-action="select-smelt-slot" data-slot="${i}">Smelter Slot ${i + 1}</strong>
          <div class="smelt-slot-items">${readySlot}</div>
          ${slot.ore ? `<p class="empty-msg">${resIcon(slot.ore, 'game-icon')} ${fmt(slot.oreLoaded || 0)} / ${batchCap} · ${recipe?.orePerBar ?? '?'} ore/bar · ${recipe?.ticks ?? '?'}s · ${fmt(recipe?.xp ?? 5)} XP/bar</p>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p class="empty-msg">Smelting ${resName(slot.ore)}…</p>` : '<p class="empty-msg">Click ore in inventory to load</p>'}
        </article>`;
    }).join('');

    const invSection = char
      ? `<section class="skill-split-side storage-panel slot-panel-fit">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
          ${renderPagedInventory(char, { gridClass: 'grid-inv-4', holdUse: true, smeltOrePick: true })}
        </section>`
      : '<section class="skill-split-side storage-panel slot-panel-fit"><p class="empty-msg">Select a character to load ore.</p></section>';

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Click ore to load smelters — max ${batchCap} per slot · click bars to collect</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Smelting Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      ${renderSkillXpBar(state.smelting.skill, 'Smelting XP')}
      ${pageCharBar()}
      <div class="skill-split-layout">
        <section class="skill-split-main">
          <div class="activity-grid smelt-slots-grid">${slotCards}</div>
        </section>
        ${invSection}
      </div>`;
  }

  /* ── Producing ── */

  function renderProducingPage(sk) {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character to produce.</p>';

    const prod = char.producing;
    const lv = prod.skill.level;
    const slotsOpen = E.produceSlotsUnlocked(char);
    const cap = E.produceBatchCapacity(state);

    const slotCards = C.PRODUCE_SLOTS.map((def, i) => {
      const locked = i >= slotsOpen || lv < def.minLevel;
      if (locked) {
        return `<div class="activity-card locked">
          <strong>Slot ${i + 1} — ${def.name}</strong>
          <p class="empty-msg">Unlocks at Producing Lv ${C.UNLOCK_LEVELS[i]}</p>
        </div>`;
      }
      const active = prod.activeSlot === i;
      const pct = active ? Math.min(100, (prod.progress / def.ticks) * 100) : 0;
      const btnCls = active ? 'btn-sm active' : 'btn-sm primary';

      return `
        <article class="activity-card${active ? ' activity-assigned-card' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${resIcon(def.id, 'game-icon')}</span>
            <div class="activity-card-title">
              <strong>Slot ${i + 1} — ${def.name}</strong>
              <span>${def.ticks}s · max ${cap} · ${fmt(def.xp)} XP/batch</span>
            </div>
          </div>
          <div class="activity-actions">
            <button type="button" class="${btnCls}" data-action="pick-produce" data-slot="${i}">
              ${active ? 'Producing ✓' : `Produce ${def.name}`}
            </button>
            ${active ? `<button type="button" class="btn-sm ghost" data-action="clear-produce">Stop</button>` : ''}
          </div>
          ${active ? `<div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>` : ''}
        </article>`;
    }).join('');

    const activeDef = prod.activeSlot != null ? C.PRODUCE_SLOTS[prod.activeSlot] : null;
    const readySlot = prod.ready > 0 && prod.readyItem
      ? `<div class="produce-ready-slot transferable" data-collect-type="produce" title="Click to collect ${activeDef?.name ?? resName(prod.readyItem)} into inventory">
          <span class="item-slot-icon">${resIcon(prod.readyItem)}</span>
          <span class="item-slot-qty">${fmt(prod.ready)} / ${cap}</span>
        </div>` : '';

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${charLabel(char)} — one recipe at a time · double-click ready items to collect</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Producing Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      ${renderSkillXpBar(prod.skill, 'Producing XP')}
      ${pageCharBar()}
      <div class="skill-split-layout">
        <section class="skill-split-main">
          <div class="activity-grid produce-slots-grid">${slotCards}</div>
          ${readySlot ? `<div class="produce-ready-wrap"><h3 class="storage-half-title">Ready to collect</h3>${readySlot}</div>` : ''}
        </section>
        <section class="skill-split-side storage-panel slot-panel-fit">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
          ${renderPagedInventory(char, { transferType: 'inv', gridClass: 'grid-inv-4' })}
        </section>
      </div>`;
  }

  function renderEquipmentPanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character from the Characters page.</p>';
    const eqSlots = (C.EQUIPMENT_SLOTS || []).map((def) => {
      const item = char.equipment?.[def.id];
      const inner = item
        ? resIcon(item, 'game-icon')
        : `<span class="equip-slot-word">${def.label}</span>`;
      const unequip = item
        ? `<button type="button" class="btn-sm ghost equip-unequip-btn" data-action="unequip-gear" data-slot-type="equipment" data-slot-key="${def.id}">Remove</button>`
        : '';
      return `<div class="equip-slot" title="${def.label}">
        <div class="equip-slot-box${item ? ' filled' : ''}">${inner}</div>
        ${unequip}
      </div>`;
    }).join('');
    const toolSlots = (C.TOOL_SLOTS || []).map((def) => {
      const item = char.tools?.[def.id];
      const inner = item
        ? resIcon(item, 'game-icon')
        : `<span class="equip-slot-word">${def.label}</span>`;
      const unequip = item
        ? `<button type="button" class="btn-sm ghost equip-unequip-btn" data-action="unequip-gear" data-slot-type="tool" data-slot-key="${def.id}">Remove</button>`
        : '';
      return `<div class="equip-slot tool-slot" title="${def.label}">
        <div class="equip-slot-box${item ? ' filled' : ''}">${inner}</div>
        ${unequip}
      </div>`;
    }).join('');
    return `
      <header class="page-header">
        <span class="page-header-icon">🛡</span>
        <div class="page-header-text"><h1>Equipment</h1><p>${charLabel(char)} — gear and tools</p></div>
      </header>
      ${pageCharBar()}
      <div class="skill-split-layout equipment-split">
        <section class="skill-split-main">
          <section class="storage-panel slot-panel-fit">
            <h3 class="storage-half-title">Equipment</h3>
            <div class="equipment-grid">${eqSlots}</div>
          </section>
          <section class="storage-panel slot-panel-fit">
            <h3 class="storage-half-title">Tools</h3>
            <div class="tools-grid">${toolSlots}</div>
          </section>
        </section>
        <section class="skill-split-side storage-panel slot-panel-fit">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
          ${renderPagedInventory(char, { transferType: 'inv', gridClass: 'grid-inv-4' })}
        </section>
      </div>`;
  }

  function renderQuestsPanel() {
    const char = selectedChar();
    const tracks = Object.values(C.QUEST_TRACKS || {});
    const tabs = tracks.map((t) =>
      `<button type="button" class="quest-track-tab${questTrack === t.id ? ' active' : ''}" data-action="quest-track" data-track="${t.id}">${t.icon} ${t.label}</button>`,
    ).join('');
    const track = C.QUEST_TRACKS?.[questTrack];
    const cards = track ? track.quests.map((q) => {
      const prog = char ? E.questTrackProgress(char, q.track) : 0;
      const need = q.track.count;
      const pct = Math.min(100, (prog / need) * 100);
      const done = char ? E.questIsComplete(char, q) : false;
      const claimed = char ? E.questIsClaimed(char, q.id) : false;
      const rewards = q.rewards.map((r) => {
        if (r.type === 'gold') return `${fmt(r.amount)} gold`;
        return resIcon(r.id, 'game-icon sm') + ` ${resName(r.id)}`;
      }).join(' · ');
      const claimBtn = done && !claimed && char
        ? `<button type="button" class="btn-sm primary" data-action="claim-quest" data-quest="${q.id}">Claim reward</button>`
        : claimed ? '<span class="quest-claimed">Claimed ✓</span>' : '';
      return `
        <article class="activity-card quest-card">
          <strong>${q.title}</strong>
          <p class="empty-msg">${q.desc}</p>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          <p class="quest-progress-text">${fmt(prog)} / ${fmt(need)}</p>
          <p class="quest-rewards">Reward: ${rewards}</p>
          ${claimBtn}
        </article>`;
    }).join('') : '';
    return `
      <header class="page-header">
        <span class="page-header-icon">📜</span>
        <div class="page-header-text"><h1>Quests</h1><p>${char ? `${charLabel(char)} — per-character progress and rewards` : 'Select a character'}</p></div>
      </header>
      ${pageCharBar()}
      <div class="quest-track-tabs">${tabs}</div>
      <div class="activity-grid quest-grid">${cards}</div>`;
  }

  function renderLeaderboardPanel() {
    const session = window.WorldrootSession || {};
    const myLevel = S.accountTotalLevel(state);
    const charCount = state.characters.length;

    if (leaderboardLoading) {
      return `
        <header class="page-header">
          <span class="page-header-icon">🏆</span>
          <div class="page-header-text"><h1>Leaderboard</h1><p>Top accounts by total hero level</p></div>
        </header>
        <p class="empty-msg">Loading leaderboard…</p>`;
    }

    const rows = (leaderboardEntries || []).map((entry, i) => {
      const isMe = session.userId && entry.user_id === session.userId;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      return `
        <tr class="leaderboard-row${isMe ? ' leaderboard-row-self' : ''}">
          <td class="leaderboard-rank">${medal}</td>
          <td class="leaderboard-name">${escHtml(entry.username)}</td>
          <td class="leaderboard-level">${fmt(entry.total_level)}</td>
          <td class="leaderboard-chars">${entry.character_count}</td>
        </tr>`;
    }).join('');

    const tableBody = rows || '<tr><td colspan="4" class="empty-msg">No ranked accounts yet. Cloud saves update the board automatically.</td></tr>';
    const youLine = session.isCloud
      ? `<p class="leaderboard-you">Your account · <strong>${session.displayName}</strong> · Level <strong>${fmt(myLevel)}</strong> · ${charCount} hero${charCount === 1 ? '' : 'es'}</p>`
      : `<p class="leaderboard-you">Offline mode · your total level is <strong>${fmt(myLevel)}</strong>. Log in with a cloud account to rank.</p>`;
    const errLine = leaderboardError ? `<p class="empty-msg" style="color:#e8a0a0">${leaderboardError}</p>` : '';

    return `
      <header class="page-header">
        <span class="page-header-icon">🏆</span>
        <div class="page-header-text">
          <h1>Leaderboard</h1>
          <p>Top 10 accounts — total level is the sum of every hero's skill levels</p>
        </div>
        <button type="button" class="btn-sm ghost" data-action="refresh-leaderboard">Refresh</button>
      </header>
      ${youLine}
      ${errLine}
      <div class="leaderboard-wrap">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Total Level</th>
              <th>Heroes</th>
            </tr>
          </thead>
          <tbody>${tableBody}</tbody>
        </table>
      </div>`;
  }

  async function refreshLeaderboard() {
    if (!window.WorldrootLeaderboard?.fetchTop) {
      leaderboardError = 'Leaderboard is still loading. Try again in a moment.';
      if (activePage === 'leaderboard') renderMainPanel();
      return;
    }
    leaderboardLoading = true;
    leaderboardError = null;
    if (activePage === 'leaderboard') renderMainPanel();
    const result = await window.WorldrootLeaderboard.fetchTop(10);
    leaderboardEntries = result.entries;
    leaderboardError = result.error ?? null;
    leaderboardLoading = false;
    if (activePage === 'leaderboard') renderMainPanel();
  }

  function renderShopPanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Create a character first.</p>';
    const items = (C.SHOP_ITEMS || []).map((shop) => {
      const avail = E.shopItemAvailable(state, shop.id);
      const canBuy = avail && state.gold >= shop.gold;
      return `
        <article class="activity-card shop-card${!avail ? ' locked' : ''}">
          <div class="shop-card-icon">${resIcon(shop.id, 'game-icon')}</div>
          <strong>${resName(shop.id)}</strong>
          <p class="empty-msg">${avail ? `${fmt(shop.gold)} gold` : 'Already used — unavailable'}</p>
          <button type="button" class="btn-sm primary" data-action="buy-shop" data-item="${shop.id}" ${!canBuy ? 'disabled' : ''}>Buy</button>
        </article>`;
    }).join('');
    return `
      <header class="page-header">
        <span class="page-header-icon">🛒</span>
        <div class="page-header-text"><h1>Shop</h1><p>${charLabel(char)} receives purchased items</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Gold</span><span class="page-header-stat-value">${fmt(state.gold)}</span></div>
      </header>
      ${pageCharBar()}
      <div class="activity-grid shop-grid">${items}</div>`;
  }

  function renderCraftingPage(sk) {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character to craft.</p>';
    const cls = C.CLASSES[char.classId];
    const tabs = (C.CRAFT_CATEGORIES || []).map((cat) =>
      `<button type="button" class="quest-track-tab${craftCategory === cat.id ? ' active' : ''}" data-action="craft-category" data-category="${cat.id}">${cat.icon} ${cat.label}</button>`,
    ).join('');
    const filtered = (C.CRAFT_RECIPES || []).filter((r) => r.category === craftCategory);
    const recipes = filtered.map((recipe) => {
      const costs = recipe.costs.map((c) => `${resIcon(c.res, 'game-icon sm')} ${fmt(c.amt)}`).join(' ');
      const can = E.canCraft(state, char, recipe.id);
      const canStorage = E.canCraftFromStorage(state, char, recipe.id);
      const eqDef = C.EQUIP_ITEM_SLOTS?.[recipe.output];
      const classNote = eqDef?.classId ? `<p class="craft-class-note">${C.CLASSES[eqDef.classId]?.name} only</p>` : '';
      return `
        <article class="activity-card craft-card">
          <div class="shop-card-icon">${resIcon(recipe.output, 'game-icon')}</div>
          <strong>${resName(recipe.output)}</strong>
          ${classNote}
          <p class="empty-msg">Costs: ${costs}</p>
          <div class="craft-card-actions">
            <button type="button" class="btn-sm primary" data-action="craft-item" data-recipe="${recipe.id}" ${!can ? 'disabled' : ''}>Craft (inventory)</button>
            <button type="button" class="btn-sm ghost" data-action="craft-item-storage" data-recipe="${recipe.id}" ${!canStorage ? 'disabled' : ''}>Craft (storage)</button>
          </div>
        </article>`;
    }).join('');
    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${cls.name} — craft gear then click items in inventory to equip</p></div>
      </header>
      ${pageCharBar()}
      <div class="quest-track-tabs">${tabs}</div>
      <div class="activity-grid craft-grid">${recipes || '<p class="empty-msg">No recipes in this category.</p>'}</div>`;
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
    if (skillId === 'crafting') return renderCraftingPage(sk);
    return renderGatheringPage(sk);
  }

  /* ── World Tree ── */

  function renderWorldTreePanel() {
    const branches = C.WORLD_TREE_BRANCHES.map((branch) => {
      const cards = branch.nodes.map((node) => {
        const lv = E.upgradeLevel(state, node.id);
        const maxLv = E.upgradeMaxLevel(state, node.id);
        const bonus = E.upgradeBonusDisplay(state, node);
        const bonusClass = bonus.isPercent ? 'upgrade-card-bonus' : 'upgrade-card-bonus flat';
        const needsUnlock = E.upgradeNeedsUnlock(state, node.id);
        const canBuy = E.canAffordUpgrade(state, node.id);
        const atMax = lv >= C.UPGRADE_MAX_LEVEL;

        let costLine = '';
        let actionLabel = '';
        if (atMax) {
          actionLabel = 'Max level';
        } else if (needsUnlock) {
          const tierIdx = E.upgradeTierCount(state, node.id);
          const unlock = E.upgradeUnlockCosts(node.id, tierIdx);
          const targetMax = E.upgradeUnlockTargetMax(tierIdx);
          if (unlock) {
            const owned = S.maxCharInventoryResource(state, unlock.resource);
            const resMet = owned >= unlock.resourceAmt ? 'met' : 'unmet';
            costLine = `<span class="upgrade-card-cost ${resMet}">${resIcon(unlock.resource, 'game-icon lg')} ${fmt(owned)}/${fmt(unlock.resourceAmt)}</span>`;
            actionLabel = `Unlock → Lv ${targetMax}`;
          }
        } else {
          const goldCost = E.upgradeLevelGoldCost(state, node.id);
          if (goldCost != null) {
            const goldMet = state.gold >= goldCost ? 'met' : 'unmet';
            costLine = `<span class="upgrade-card-cost ${goldMet}"><span class="mob-drop-gold">🪙</span> ${fmt(state.gold)}/${fmt(goldCost)}</span>`;
          }
          actionLabel = `Upgrade → Lv ${lv + 1}`;
        }

        return `
          <button type="button" class="upgrade-card${canBuy ? ' can-buy' : ''}${atMax ? ' maxed' : ''}" data-action="buy-upgrade" data-upgrade="${node.id}" title="${node.desc}"${atMax ? ' disabled' : ''}>
            <span class="upgrade-card-name">${node.name}</span>
            <span class="upgrade-card-level">Lv ${lv}${atMax ? '' : ` / ${maxLv || '—'}`}</span>
            <span class="${bonusClass}">${bonus.text}</span>
            <span class="upgrade-card-action">${actionLabel}</span>
            ${costLine ? `<span class="upgrade-card-costs">${costLine}</span>` : ''}
          </button>`;
      }).join('');
      return `<section class="branch-section"><div class="branch-header"><span class="branch-icon">${branch.icon}</span><h2>${branch.name}</h2></div><div class="upgrade-grid">${cards}</div></section>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">🌳</span>
        <div class="page-header-text"><h1>World Tree</h1><p>Uses one hero's inventory (best stack shown) · resources unlock tiers, gold levels up</p></div>
      </header>
      ${pageCharBar()}
      <div class="branch-grid">${branches}</div>`;
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
      ${pageCharBar()}
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
    else if (activePage === 'equipment') el.innerHTML = renderEquipmentPanel();
    else if (activePage === 'quests') el.innerHTML = renderQuestsPanel();
    else if (activePage === 'shop') el.innerHTML = renderShopPanel();
    else if (activePage === 'leaderboard') el.innerHTML = renderLeaderboardPanel();
    else if (activePage === 'worldtree') el.innerHTML = renderWorldTreePanel();
    else if (activePage === 'settings') { el.innerHTML = renderSettingsPanel(); renderLogEl(); }
    else if (skill && !skill.comingSoon) el.innerHTML = renderSkillPage(activePage);
    else if (skill?.comingSoon) el.innerHTML = renderComingSoon(skill);
    else el.innerHTML = '<p class="empty-msg">Select a page.</p>';
  }

  function render() {
    renderHud();
    renderSidebar();
    renderMainPanel();
  }

  function handleClick(e) {
    if (e.target.closest('[data-collect-type]')) return;
    const equipBtn = e.target.closest('[data-action="equip-item"]');
    if (equipBtn && !e.shiftKey) {
      e.stopPropagation();
      const char = selectedChar();
      if (char && E.equipFromInventory(state, char, Number(equipBtn.dataset.inv))) {
        addLog('Equipped item.');
      } else addLog('Cannot equip — wrong class or inventory full.');
      render();
      return;
    }
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
    if (action === 'open-class') {
      state.pendingSlot = Number(btn.dataset.slot);
      switchPage('characters');
      return;
    }
    if (action === 'select-smelt-slot') {
      selectedSmeltSlot = Number(btn.dataset.slot);
      render();
      return;
    }
    if (action === 'inv-page') { invPage = Number(btn.dataset.page); render(); return; }
    if (action === 'stor-page') { storPage = Number(btn.dataset.page); render(); return; }
    if (action === 'quest-track') { questTrack = btn.dataset.track; render(); return; }
    if (action === 'claim-quest') {
      const ok = E.claimQuest(state, btn.dataset.quest, selectedIndex());
      if (ok) addLog('Quest reward claimed.');
      else addLog('Could not claim — complete quest and have inventory space.');
      render();
      return;
    }
    if (action === 'buy-shop') {
      const char = selectedChar();
      if (char && E.buyShopItem(state, char, btn.dataset.item)) {
        addLog(`Bought ${resName(btn.dataset.item)}.`);
      } else addLog('Cannot buy — not enough gold, inventory full, or item unavailable.');
      render();
      return;
    }
    if (action === 'craft-category') { craftCategory = btn.dataset.category; render(); return; }
    if (action === 'unequip-gear') {
      const char = selectedChar();
      if (char && E.unequipSlot(state, char, btn.dataset.slotType, btn.dataset.slotKey)) {
        addLog('Unequipped item.');
      } else addLog('Cannot unequip — inventory full.');
      render();
      return;
    }
    if (action === 'craft-item') {
      const char = selectedChar();
      if (char && E.craftItem(state, char, btn.dataset.recipe)) {
        addLog(`Crafted ${resName(btn.dataset.recipe)} from inventory.`);
      } else addLog('Cannot craft — missing materials in inventory or inventory full.');
      render();
      return;
    }
    if (action === 'craft-item-storage') {
      const char = selectedChar();
      if (char && E.craftItemFromStorage(state, char, btn.dataset.recipe)) {
        addLog(`Crafted ${resName(btn.dataset.recipe)} from storage.`);
      } else addLog('Cannot craft — missing materials in storage or inventory full.');
      render();
      return;
    }
    if (action === 'toggle-quick-tap') {
      storageQuickTap = !storageQuickTap;
      render();
      return;
    }
    if (action === 'toggle-split-mode') {
      storageSplitMode = !storageSplitMode;
      render();
      return;
    }
    if (action === 'refresh-leaderboard') {
      refreshLeaderboard();
      return;
    }
    if (action === 'close-transfer-modal') {
      closeTransferModal();
      return;
    }
    if (action === 'confirm-transfer') {
      confirmTransferAmount();
      return;
    }
    if (action === 'deposit-all') {
      const char = selectedChar();
      const n = char ? S.depositAllToStorage(state, char) : 0;
      if (n > 0) addLog(`Deposited ${n} items to storage.`);
      else addLog('Nothing to deposit.');
      render();
      return;
    }
    if (action === 'load-smelt-ore') {
      const char = selectedChar();
      const n = char ? E.loadOreStackFromInv(state, char, Number(btn.dataset.inv)) : 0;
      if (n > 0) addLog(`Loaded ${n} ore into smelter.`);
      else addLog('No smelter space available for that ore.');
      render();
      return;
    }
    if (action === 'load-smelt') {
      loadSmeltFromDrag(btn.dataset.inv, btn.dataset.smelt);
      return;
    }
    if (action === 'stop-all-smelt') {
      S.stopAllSmelting(state);
      addLog('Stopped all smelting slots.');
      render();
      return;
    }
    if (action === 'stop-all-produce') {
      S.stopAllProducing(state);
      addLog('Stopped all producing slots.');
      render();
      return;
    }
    if (action === 'assign-selected') {
      assignSelected(btn.dataset.activity, btn.dataset.target); return;
    }
    if (action === 'stop-selected') {
      const idx = selectedIndex();
      S.stopActivity(state, idx);
      addLog(`${charLabel(state.characters[idx])} stopped.`);
      render(); return;
    }
    if (action === 'buy-upgrade') {
      const nodeId = btn.dataset.upgrade;
      const found = E.findUpgradeNode(nodeId);
      if (!found) return;
      const wasUnlock = E.upgradeNeedsUnlock(state, nodeId);
      if (E.buyUpgrade(state, nodeId)) {
        const newLv = E.upgradeLevel(state, nodeId);
        if (wasUnlock) {
          addLog(`Unlocked ${found.node.name} — can now reach Lv ${E.upgradeMaxLevel(state, nodeId)}.`);
        } else {
          addLog(`Upgraded ${found.node.name} to Lv ${newLv}.`);
        }
        render();
      } else if (wasUnlock) {
        addLog(`Not enough ${C.RESOURCE_NAMES[found.node.costRes] || 'resources'} in inventory to unlock ${found.node.name}.`);
      } else {
        addLog(`Not enough gold to upgrade ${found.node.name}, or it is at its current tier cap.`);
      }
      return;
    }

    if (action === 'pick-smelt') {
      selectedSmeltSlot = Number(btn.dataset.slot);
      E.setSmeltSlot(state, Number(btn.dataset.slot), btn.dataset.ore);
      render();
      return;
    }

    if (action === 'pick-produce') {
      if (btn.disabled) return;
      E.setProduceSlot(state, selectedIndex(), Number(btn.dataset.slot));
      render();
      return;
    }
    if (action === 'clear-produce') {
      E.clearProduceSlot(state, selectedIndex());
      addLog('Stopped producing.');
      render();
      return;
    }
    if (action === 'clear-smelt') {
      E.clearSmeltSlot(state, Number(btn.dataset.slot));
      addLog(`Stopped smelter slot ${Number(btn.dataset.slot) + 1}.`);
      render();
      return;
    }
    if (action === 'reset-save') {
      if (confirm('Reset all progress?')) {
        state = S.resetState();
        if (window.WorldrootSession?.isCloud && window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
        addLog('Save cleared.');
        render();
      }
      return;
    }
    if (action === 'go-menu' && window.WorldrootGoMenu) window.WorldrootGoMenu();
  }

  function loadSmeltFromDrag(invIdx, smeltIdx) {
    const char = selectedChar();
    const cap = E.smeltBatchCapacity(state);
    const n = char && S.loadOreToSmelt(state, char, Number(invIdx), Number(smeltIdx), cap);
    if (n > 0) {
      addLog(`Loaded ${n} ore into smelter slot ${Number(smeltIdx) + 1}.`);
      render();
    }
  }

  function initDragDrop() {
    document.body.addEventListener('dragstart', (e) => {
      const el = e.target.closest('[data-drag-type="smelt-ore"]');
      if (!el || el.getAttribute('draggable') !== 'true') return;
      e.dataTransfer.setData('application/worldroot-smelt', JSON.stringify({
        inv: el.dataset.inv,
        resource: el.dataset.resource,
      }));
      e.dataTransfer.effectAllowed = 'move';
    });

    document.body.addEventListener('dragover', (e) => {
      if (e.target.closest('.smelt-drop-zone')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    });

    document.body.addEventListener('drop', (e) => {
      const zone = e.target.closest('.smelt-drop-zone');
      if (!zone) return;
      e.preventDefault();
      try {
        const raw = e.dataTransfer.getData('application/worldroot-smelt');
        if (!raw) return;
        const { inv } = JSON.parse(raw);
        selectedSmeltSlot = Number(zone.dataset.smeltSlot);
        loadSmeltFromDrag(inv, zone.dataset.smeltSlot);
      } catch { /* ignore */ }
    });
  }

  function handleSlotTransfer(el, all, amount = null) {
    const type = el.dataset.transferType;
    const slotIdx = Number(el.dataset.slot);
    if (type === 'inv') {
      const char = selectedChar();
      const transferAmt = amount ?? (all ? null : 1);
      if (char && S.transferInvToStorage(state, char, slotIdx, transferAmt)) {
        addLog(transferAmt == null ? 'Moved stack to storage.' : `Moved ${transferAmt} to storage.`);
        render();
      }
      return;
    }
    if (type === 'storage') {
      const char = selectedChar();
      const slot = state.storageSlots[slotIdx];
      const transferAmt = amount ?? (all ? null : 1);
      if (char && slot && S.transferStorageToInv(state, char, slotIdx, transferAmt)) {
        addLog(transferAmt == null ? 'Moved stack to inventory.' : `Moved ${transferAmt} to inventory.`);
      } else {
        addLog('Inventory full — could not take item.');
      }
      render();
    }
  }

  function handleQuickTapTransfer(el) {
    const type = el.dataset.transferType;
    const slotIdx = Number(el.dataset.slot);
    const char = selectedChar();
    if (type === 'inv') {
      if (char && S.transferInvToStorage(state, char, slotIdx, null)) {
        addLog('Moved full stack to storage.');
        render();
      }
      return;
    }
    if (type === 'storage') {
      const slot = state.storageSlots[slotIdx];
      if (!slot || !char) return;
      const stackCap = S.stackCapacityForResource(state, slot.resourceId, char);
      const transferAmt = Math.min(slot.amount, stackCap);
      if (S.transferStorageToInv(state, char, slotIdx, transferAmt)) {
        addLog(`Moved ${transferAmt} to inventory.`);
      } else {
        addLog('Inventory full — could not take items.');
      }
      render();
    }
  }

  function openTransferModal(type, idx) {
    const char = selectedChar();
    const slot = type === 'inv' ? char?.inventorySlots[idx] : state.storageSlots[idx];
    if (!slot?.amount) return;
    transferModal = { type, idx, max: slot.amount };
    const modal = $('transfer-modal');
    const input = $('transfer-amount-input');
    const label = $('transfer-modal-label');
    const dir = type === 'inv' ? 'to storage' : 'to inventory';
    if (label) label.textContent = `${resName(slot.resourceId)} — transfer ${dir} (max ${fmt(slot.amount)})`;
    if (input) {
      input.value = String(slot.amount);
      input.max = String(slot.amount);
      input.min = '1';
    }
    if (modal) modal.hidden = false;
  }

  function closeTransferModal() {
    transferModal = null;
    const modal = $('transfer-modal');
    if (modal) modal.hidden = true;
  }

  function confirmTransferAmount() {
    if (!transferModal) return;
    const input = $('transfer-amount-input');
    const amt = Math.min(transferModal.max, Math.max(1, Math.floor(Number(input?.value) || 0)));
    const char = selectedChar();
    const { type, idx } = transferModal;
    let ok = false;
    if (type === 'inv') {
      ok = char && S.transferInvToStorage(state, char, idx, amt);
    } else {
      ok = char && S.transferStorageToInv(state, char, idx, amt);
    }
    closeTransferModal();
    if (ok) addLog(`Transferred ${amt} items.`);
    else addLog('Transfer failed — not enough items or inventory full.');
    render();
  }

  function handleCollect(el) {
    const type = el.dataset.collectType;
    const slotIdx = el.dataset.slot != null ? Number(el.dataset.slot) : -1;
    if (type === 'produce') {
      const result = E.collectProduce(state, selectedIndex());
      if (result.collected > 0) {
        addLog(`Collected ${result.collected} items into inventory.`);
        if (result.lost > 0) addLog(`${result.lost} items lost — inventory full.`);
      }
      render();
      return;
    }
    if (type === 'smelt') {
      const result = E.collectSmelt(state, slotIdx, selectedIndex());
      if (result.collected > 0) {
        addLog(`Collected ${result.collected} bars into inventory.`);
        if (result.lost > 0) addLog(`${result.lost} bars lost — inventory full.`);
      }
      render();
      return;
    }
    if (type === 'smelt-ore') {
      const n = E.unloadSmeltOre(state, slotIdx, selectedIndex());
      if (n > 0) addLog(`Returned ${n} ore to inventory.`);
      render();
    }
  }

  function handlePointerSlot(e) {
    const collectEl = e.target.closest('[data-collect-type]');
    if (collectEl && e.type === 'click' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleCollect(collectEl);
      return;
    }

    const slotEl = e.target.closest('[data-transfer-type]');
    if (!slotEl) return;

    if (e.type === 'dblclick') {
      e.preventDefault();
      handleSlotTransfer(slotEl, false);
      return;
    }

    if (e.type === 'click' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      window.getSelection()?.removeAllRanges();
      handleSlotTransfer(slotEl, true);
      return;
    }

    if (e.type === 'click' && activePage === 'storage') {
      e.preventDefault();
      e.stopPropagation();
      const type = slotEl.dataset.transferType;
      const idx = Number(slotEl.dataset.slot);
      const char = selectedChar();
      const slot = type === 'inv' ? char?.inventorySlots[idx] : state.storageSlots[idx];
      if (!slot) return;
      if (storageSplitMode) {
        openTransferModal(type, idx);
      } else if (storageQuickTap) {
        handleQuickTapTransfer(slotEl);
      } else {
        handleSlotTransfer(slotEl, false);
      }
    }
  }

  function cancelHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    if (holdEl) {
      holdEl.classList.remove('hold-charging');
      holdEl = null;
    }
  }

  function initHoldUse() {
    const ms = C.HOLD_USE_MS || 2000;
    document.body.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('[data-hold-use]');
      if (!el || e.button !== 0) return;
      cancelHold();
      holdEl = el;
      el.classList.add('hold-charging');
      const invIdx = Number(el.dataset.holdUse);
      holdTimer = setTimeout(() => {
        const char = selectedChar();
        const resId = char?.inventorySlots[invIdx]?.resourceId;
        if (char && E.useConsumableFromSlot(state, char, invIdx)) {
          addLog(`Used ${resName(resId || 'item')}.`);
          render();
        } else addLog('Cannot use this item.');
        cancelHold();
      }, ms);
    });
    document.body.addEventListener('pointerup', cancelHold);
    document.body.addEventListener('pointercancel', cancelHold);
    document.body.addEventListener('pointerleave', (e) => {
      if (holdEl && e.target === holdEl) cancelHold();
    });
  }

  function initResourceTooltips() {
    let tip = document.getElementById('res-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'res-tooltip';
      tip.className = 'res-tooltip-float';
      tip.hidden = true;
      document.body.appendChild(tip);
    }

    document.body.addEventListener('mouseover', (e) => {
      const wrap = e.target.closest('[data-res-tip]');
      if (!wrap) {
        tip.hidden = true;
        return;
      }
      tip.textContent = wrap.dataset.resTip;
      tip.hidden = false;
    });

    document.body.addEventListener('mousemove', (e) => {
      if (tip.hidden) return;
      tip.style.left = `${e.clientX + 14}px`;
      tip.style.top = `${e.clientY + 14}px`;
    });
  }

  function init(initialState) {
    state = initialState;
    state.lastTickAt = state.lastTickAt || Date.now();
    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('dblclick', handlePointerSlot);
    document.body.addEventListener('click', handlePointerSlot, true);
    initDragDrop();
    initHoldUse();
    initResourceTooltips();
    document.body.addEventListener('mousedown', (e) => {
      if (e.shiftKey && e.target.closest('[data-transfer-type]')) e.preventDefault();
    });
    requestAnimationFrame(updateSmoothGatherBars);
    renderSidebar();
    switchPage('characters');
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
