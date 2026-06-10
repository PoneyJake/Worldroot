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
  let trashModal = null;
  let suppressClickUntil = 0;
  let lastTapActionAt = 0;
  let activePointers = 0;
  let pendingFullRender = false;
  let tapRecord = null;
  let lastSidebarHash = '';
  const TAP_MOVE_PX = 12;
  let detailPanel = null;
  let skillSubTab = 'activity';
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

  const GEAR_STAT_LABELS = {
    strength: 'STR', agility: 'AGI', magic: 'MAG', defence: 'DEF',
    mining_yield: 'Mining Eff', woodcutting_yield: 'WC Eff', fishing_yield: 'Fish Eff',
    mining_speed: 'Mining Speed', woodcutting_speed: 'WC Speed', fishing_speed: 'Fish Speed',
    attack_speed: 'Attack Speed', strength_pct: 'STR', agility_pct: 'AGI', magic_pct: 'MAG',
    carry_capacity: 'Carry Cap', gold_gain: 'Gold', drop_rate: 'Drop Rate', xp_gain: 'XP',
  };

  function formatGearStats(itemId) {
    const stats = C.GEAR_STATS?.[itemId];
    if (!stats) return '';
    const parts = [];
    for (const [key, val] of Object.entries(stats.flat || {})) {
      const label = GEAR_STAT_LABELS[key] || key;
      parts.push(`+${val} ${label}`);
    }
    for (const [key, val] of Object.entries(stats.percent || {})) {
      const label = GEAR_STAT_LABELS[key] || key;
      parts.push(`+${(val * 100).toFixed(0)}% ${label}`);
    }
    return parts.join(' · ');
  }
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
    const ticks = E.gatherIntervalTicks(state, char, char.activity);
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

  function renderTrashZone() {
    return `
      <div class="trash-drop-zone" data-drop-zone="trash" title="Drag items here to delete">
        <span class="trash-icon">🗑️</span>
        <span>Trash</span>
      </div>`;
  }

  function renderSlotGrid(slots, totalSlots, opts = {}) {
    const {
      transferType = null, gridClass = '', start = 0, end = totalSlots,
      holdUse = false, char = null, smeltOrePick = false, dragKind = 'inv',
    } = opts;
    let html = '';
    for (let idx = start; idx < end; idx++) {
      const slot = slots[idx];
      const dropAttrs = ` data-drop-zone="${dragKind}" data-slot="${idx}"`;
      if (!slot) {
        html += `<div class="item-slot empty drag-drop-target"${dropAttrs}><span class="item-slot-empty">+</span></div>`;
      } else {
        const transferAttr = transferType
          ? ` data-transfer-type="${transferType}" data-slot="${idx}"`
          : '';
        const isOre = smeltOrePick && C.SMELT_RECIPES.some((r) => r.ore === slot.resourceId);
        const canLoad = isOre && E.findFirstSmeltSlotForOre(state, slot.resourceId) >= 0;
        const smeltAttr = canLoad ? ` data-action="load-smelt-ore" data-inv="${idx}"` : '';
        const consumable = holdUse && C.CONSUMABLE_ITEMS?.[slot.resourceId];
        const canUse = consumable && consumable.type !== 'pouch' && char && E.canUseConsumable(state, char, slot.resourceId);
        const holdAttr = canUse ? ` data-hold-use="${idx}"` : '';
        const canEquip = transferType === 'inv' && char && E.canEquipItem(char, slot.resourceId);
        const equipAttr = canEquip ? ` data-action="equip-item" data-inv="${idx}"` : '';
        const pouchDef = C.CONSUMABLE_ITEMS?.[slot.resourceId];
        const canEquipPouch = transferType === 'inv' && pouchDef?.type === 'pouch' && activePage === 'equipment';
        const pouchAttr = canEquipPouch
          ? ` data-action="equip-pouch" data-inv="${idx}" data-pouch-category="${pouchDef.category}"`
          : '';
        const tapHint = transferType && activePage === 'storage'
          ? (storageSplitMode ? ' — click: custom amount' : storageQuickTap ? ' — inv→all storage · storage→1 stack' : ' — double-click: move 1 · shift+click: move all')
          : '';
        const holdHint = canUse ? ' · hold 2s to use bag/chest' : (canLoad ? ' — click to load smelter' : (canEquip ? ' — click to equip' : (canEquipPouch ? ' — click to equip pouch' : ' · drag to move')));
        html += `
          <div class="item-slot filled drag-drop-target draggable-item${transferType ? ' transferable' : ''}${canLoad ? ' smelt-ore-pick' : ''}${canUse ? ' hold-use-slot' : ''}${canEquip ? ' equip-item-slot' : ''}${canEquipPouch ? ' equip-pouch-slot' : ''}"
            draggable="true" data-drag-kind="${dragKind}" data-drag-idx="${idx}" title="${resName(slot.resourceId)}${tapHint}${holdHint}"${dropAttrs}${transferAttr}${smeltAttr}${holdAttr}${equipAttr}${pouchAttr}>
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
      ${renderSlotGrid(state.storageSlots, total, { ...opts, start, end, dragKind: 'storage' })}`;
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

  const RIGHT_RAIL_PAGES = new Set(['combat', 'mining', 'woodcutting', 'fishing', 'crafting', 'producing', 'smelting']);
  const TALENT_PAGES = new Set(['combat', 'mining', 'woodcutting', 'fishing', 'producing', 'smelting']);
  /** Pages that do not need a full DOM rebuild every game tick. */
  const IDLE_TICK_PAGES = new Set([
    'settings', 'leaderboard', 'shop', 'quests', 'worldtree',
    'storage', 'equipment', 'inventory', 'crafting', 'characters',
  ]);

  function usesRightRail(pageId = activePage) {
    return RIGHT_RAIL_PAGES.has(pageId);
  }

  function pageNeedsTickRefresh(pageId = activePage) {
    return !IDLE_TICK_PAGES.has(pageId);
  }

  function switchPage(pageId) {
    const item = SIDEBAR_NAV.find((n) => n.id === pageId);
    if (item?.comingSoon) return;
    if (pageId !== 'storage') closeTransferModal();
    activePage = pageId;
    detailPanel = null;
    skillSubTab = 'activity';
    renderSidebar();
    render();
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
      const skillLv = item.type === 'skill' && item.id !== 'crafting'
        ? `<span class="sidebar-skill-lv">Lv ${skillLevelForNav(item.id)}</span>` : '';
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
      { label: 'Defence', value: fmt(E.charDefence(state, char)) },
      { label: 'Accuracy', value: fmt(E.charAccuracy(state, char)) },
      { label: 'Crit Chance', value: pct(E.charEffectBonus(state, char, 'crit_chance', true)) },
      { label: 'Crit Damage', value: pct(E.charEffectBonus(state, char, 'crit_damage', true)) },
      { label: 'Drop Rate', value: pct(E.dropBonus(state, char)) },
      { label: 'Gold Gain', value: pct(E.charEffectBonus(state, char, 'gold_gain', true)) },
      { label: 'Carry Cap.', value: pct(E.charEffectBonus(state, char, 'carry_capacity', true)) },
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
      const xpPct = (E.skillXpBonus(state, sid, char) * 100).toFixed(0);
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
          <p>Drag items to equip, move, or trash · hold bags/chests 2s to expand slots</p>
        </div>
      </header>
      ${pageCharBar()}
      <section class="storage-panel slot-panel-fit">
        <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
        ${renderPagedInventory(char, { transferType: 'inv', gridClass: 'grid-inv-4' })}
        ${renderTrashZone()}
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
          ${renderTrashZone()}
        </section>
      </div>`;
  }

  /* ── Talents ── */

  function renderSkillSubTabs(skillId) {
    if (!TALENT_PAGES.has(skillId)) return '';
    return `<div class="quest-track-tabs">
      <button type="button" class="quest-track-tab${skillSubTab === 'activity' ? ' active' : ''}" data-action="skill-subtab" data-tab="activity">Activity</button>
      <button type="button" class="quest-track-tab${skillSubTab === 'talents' ? ' active' : ''}" data-action="skill-subtab" data-tab="talents">Talents</button>
    </div>`;
  }

  function renderTalentsPanel(skillId) {
    const char = selectedChar();
    if (skillId !== 'smelting' && !char) {
      return '<p class="empty-msg">Select a character to spend talent points.</p>';
    }

    const skill = E.skillForTalents(state, char, skillId);
    if (!skill) return '<p class="empty-msg">No skill data.</p>';

    const treeKey = E.talentTreeKey(skillId);
    const defs = C.TALENT_TREES?.[treeKey] || [];
    const points = skill.talentPoints ?? 0;
    const skillLabel = C.SKILLS[skillId]?.name ?? skillId;

    const maxLv = C.TALENT_MAX_LEVEL ?? 50;

    const cards = defs.map((def) => {
      const lv = skill.talents?.[def.id] ?? 0;
      const total = E.formatTalentTotal(def, lv);
      const atMax = lv >= maxLv;
      const canBuy = points > 0 && !atMax;
      return `
        <article class="activity-card talent-card${atMax ? ' talent-maxed' : ''}">
          <strong>${def.label}</strong>
          <span class="talent-per">${def.perLabel ?? ''}</span>
          <div class="talent-level-row">
            <span>Rank <strong>${lv}</strong> / ${maxLv}</span>
            <span class="talent-total">${total}</span>
          </div>
          <button type="button" class="btn-sm primary" data-action="buy-talent" data-skill="${skillId}" data-talent="${def.id}" ${canBuy ? '' : 'disabled'}>${atMax ? 'Max' : '+1'}</button>
        </article>`;
    }).join('');

    return `
      <div class="talents-panel">
        <p class="talents-points-line"><strong>${fmt(points)}</strong> unspent talent points · ${skillLabel} Lv ${skill.level} · +${C.TALENT_POINTS_PER_LEVEL} pts per level · max rank ${maxLv}</p>
        <div class="activity-grid talent-grid">${cards}</div>
      </div>`;
  }

  /* ── Combat ── */

  function renderCombatDetail(mobId) {
    const mob = C.MONSTERS.find((m) => m.id === mobId);
    if (!mob) return '';
    const char = selectedChar();
    const rateChar = char || state.characters[0];
    const rates = rateChar ? E.getTheoreticalCombatRates(state, rateChar, mob) : { xpHr: 0, killsHr: 0, hitPct: 0 };
    const xpPerKill = rateChar ? E.combatXpPerKill(state, rateChar, mob) : 0;
    const hitPct = rateChar ? (rates.hitPct * 100).toFixed(0) : '0';
    const best = char ? charSkillLevel(char, 'combat') : bestSkillLevel('combat');
    const locked = best < mob.level;

    return `
      <div class="detail-panel-inner">
        <div class="detail-panel-head">
          ${iconHtml(mob.id, 'game-icon xl')}
          <h2>${mob.name}</h2>
          <p class="detail-panel-sub">Lv ${mob.level} monster</p>
        </div>
        <div class="detail-stat-grid">
          <div class="detail-stat"><span>HP</span><strong>${E.mobMaxHp(mob)}</strong></div>
          <div class="detail-stat"><span>Damage</span><strong>${mob.damage}</strong></div>
          <div class="detail-stat"><span>XP / kill</span><strong>${fmt(xpPerKill)}</strong></div>
          <div class="detail-stat"><span>Accuracy req.</span><strong>${mob.accuracy ?? 0}</strong></div>
          <div class="detail-stat"><span>Hit chance</span><strong>${hitPct}%</strong></div>
          <div class="detail-stat"><span>XP / hr</span><strong>${fmt(rates.xpHr)}</strong></div>
          <div class="detail-stat"><span>Kills / hr</span><strong>${fmt(rates.killsHr)}</strong></div>
          <div class="detail-stat"><span>Attack speed</span><strong>${rateChar ? E.combatAttackSec(state, rateChar).toFixed(2) : C.COMBAT_ATTACK_SEC}s</strong></div>
        </div>
        ${renderMobDrops(mob)}
        ${locked ? `<p class="empty-msg">Requires Combat Lv ${mob.level}</p>` : ''}
      </div>`;
  }

  function renderGatherDetail(skillId, veinId) {
    const sk = C.SKILLS[skillId];
    const vein = C.VEINS[skillId]?.find((v) => v.id === veinId);
    if (!vein || !sk) return '';
    const char = selectedChar();
    const labels = gatherStatLabels(skillId);
    const best = char ? charSkillLevel(char, skillId) : bestSkillLevel(skillId);
    const locked = best < vein.minLevel;
    const on = char?.activity === sk.activity && char?.target === vein.id;
    const xpPerAction = char ? E.gatherXpPerAction(state, char, skillId, vein) : (vein.xp ?? 5);
    const catchRaw = char ? E.gatherCatchDisplayPercent(state, char, skillId, vein) : 0;
    const catchPct = catchRaw >= 100 ? catchRaw.toFixed(0) : catchRaw.toFixed(1);
    const thresholds = E.gatherPlusOneThresholds(vein);
    const gatherSec = char ? E.gatherIntervalTicks(state, char, skillId) * (C.TICK_MS / 1000) : 0;
    const eff = char ? E.gatherEfficiency(state, char, skillId) : 0;
    const multiPct = char ? (E.gatherMultiChance(state, char, skillId) * 100).toFixed(1) : '0';
    const resLabel = skillId === 'mining' ? 'ore' : skillId === 'woodcutting' ? 'log' : 'fish';
    const gatherPct = on && char ? Math.min(100, ((char.gatherCd || 0) / E.gatherIntervalTicks(state, char, skillId)) * 100) : 0;

    return `
      <div class="detail-panel-inner">
        <div class="detail-panel-head">
          ${iconHtml(vein.icon, 'game-icon gather')}
          <h2>${vein.name}</h2>
          <p class="detail-panel-sub">${resName(vein.resource)} · Lv ${vein.minLevel}</p>
        </div>
        <div class="detail-stat-grid">
          <div class="detail-stat"><span>XP / gather</span><strong>${fmt(xpPerAction)}</strong></div>
          <div class="detail-stat"><span>Speed</span><strong>${gatherSec}s</strong></div>
          <div class="detail-stat"><span>${labels.eff}</span><strong>${eff}</strong></div>
          <div class="detail-stat"><span>${labels.chance}</span><strong>${catchPct}%</strong></div>
          <div class="detail-stat"><span>${labels.multi}</span><strong>${multiPct}%</strong></div>
          <div class="detail-stat"><span>10% +1 ${resLabel}</span><strong>${fmt(thresholds.effFor10)} eff</strong></div>
          <div class="detail-stat"><span>100% +1 ${resLabel}</span><strong>${fmt(thresholds.effFor100)} eff</strong></div>
        </div>
        ${on ? `<div class="progress-bar"><div class="progress-bar-fill" data-gather-progress data-gather-vein="${vein.id}" style="width:${gatherPct}%"></div></div>` : ''}
        ${locked ? `<p class="empty-msg">Requires ${sk.name} Lv ${vein.minLevel}</p>` : ''}
      </div>`;
  }

  function renderInventoryDetailPanel(opts = {}) {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character.</p>';
    const invOpts = { transferType: 'inv', gridClass: 'grid-inv-4 detail-inv-grid', ...opts };
    return `
      <div class="detail-panel-inner detail-panel-inventory">
        <h2 class="detail-panel-title">Inventory</h2>
        <p class="detail-panel-sub">${charLabel(char)}</p>
        <div class="detail-inventory-wrap">
          ${renderPagedInventory(char, invOpts)}
        </div>
      </div>`;
  }

  function renderDetailPanel() {
    const el = $('panel-detail');
    const split = document.querySelector('.page-body-split');
    if (!el || !split) return;

    if (!usesRightRail()) {
      split.classList.remove('has-right-rail');
      el.classList.add('hidden');
      el.innerHTML = '';
      return;
    }

    split.classList.add('has-right-rail');
    el.classList.remove('hidden');

    if (activePage === 'crafting' || activePage === 'producing') {
      el.className = 'detail-panel detail-panel-fixed';
      el.innerHTML = renderInventoryDetailPanel();
      return;
    }

    if (activePage === 'smelting') {
      el.className = 'detail-panel detail-panel-fixed';
      el.innerHTML = renderInventoryDetailPanel({ smeltOrePick: true });
      return;
    }

    el.className = 'detail-panel';

    if (detailPanel?.kind === 'combat') {
      el.innerHTML = renderCombatDetail(detailPanel.id);
      return;
    }

    if (detailPanel?.kind === 'gather') {
      el.innerHTML = renderGatherDetail(detailPanel.skillId, detailPanel.id);
      return;
    }

    const hint = activePage === 'combat' ? 'monster' : 'resource';
    el.innerHTML = `<div class="detail-panel-empty"><p class="empty-msg">Click a ${hint} to view stats</p></div>`;
  }

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
    const cards = C.MONSTERS.map((mob) => {
      const locked = best < mob.level;
      const on = char?.activity === 'combat' && char?.target === mob.id;
      const selected = detailPanel?.kind === 'combat' && detailPanel.id === mob.id;

      return `
        <article class="activity-card activity-card-compact${locked ? ' locked' : ''}${on ? ' activity-assigned-card' : ''}${selected ? ' detail-selected' : ''}"
          data-action="select-detail" data-detail-kind="combat" data-detail-id="${mob.id}" role="button" tabindex="0">
          <div class="activity-card-head">
            <span class="activity-card-icon">${iconHtml(mob.id, 'game-icon lg')}</span>
            <div class="activity-card-title">
              <strong>${mob.name}</strong>
              <span>Lv ${mob.level}</span>
            </div>
          </div>
          ${locked ? `<p class="empty-msg compact">Lv ${mob.level} req.</p>` : `<div class="activity-card-actions">${renderAssignBtn('combat', mob.id, false)}</div>`}
        </article>`;
    }).join('');

    const combatSkill = char?.skills?.combat;
    const activityBody = `
      ${pageCharBar()}
      ${renderSkillSubTabs('combat')}
      ${skillSubTab === 'talents' ? renderTalentsPanel('combat') : `${arena}<div class="activity-grid activity-grid-compact">${cards}</div>`}`;

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Fight monsters — earn XP, gold, and loot on kills</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Combat Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      ${combatSkill ? renderSkillXpBar(combatSkill, 'Combat XP') : ''}
      ${activityBody}`;
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

    const cards = veins.map((vein) => {
      const locked = best < vein.minLevel;
      const on = char?.activity === sk.activity && char?.target === vein.id;
      const selected = detailPanel?.kind === 'gather' && detailPanel.skillId === sk.id && detailPanel.id === vein.id;

      return `
        <article class="activity-card activity-card-compact${locked ? ' locked' : ''}${on ? ' activity-assigned-card' : ''}${selected ? ' detail-selected' : ''}"
          data-action="select-detail" data-detail-kind="gather" data-detail-skill="${sk.id}" data-detail-id="${vein.id}" role="button" tabindex="0">
          <div class="activity-card-head">
            <span class="activity-card-icon">${iconHtml(vein.icon, 'game-icon gather')}</span>
            <div class="activity-card-title">
              <strong>${vein.name}</strong>
              <span>Lv ${vein.minLevel} · ${resName(vein.resource)}</span>
            </div>
          </div>
          ${locked ? `<p class="empty-msg compact">Lv ${vein.minLevel} req.</p>` : `<div class="activity-card-actions">${renderAssignBtn(sk.activity, vein.id, false)}</div>`}
        </article>`;
    }).join('');

    const gatherSkill = char?.skills?.[sk.id];
    const activityBody = `
      ${pageCharBar()}
      ${renderSkillSubTabs(sk.id)}
      ${skillSubTab === 'talents' ? renderTalentsPanel(sk.id) : `<div class="activity-grid activity-grid-compact">${cards}</div>`}`;

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${sk.desc} · +${C.LEVEL_EFF_BONUS} eff & +${C.LEVEL_MULTI_BONUS * 100}% multi per level</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">${sk.name} Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      ${gatherSkill ? renderSkillXpBar(gatherSkill, `${sk.name} XP`) : ''}
      ${activityBody}`;
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
        <article class="activity-card smelt-drop-zone smelt-slot-compact${selected}" data-drop-zone="smelt" data-smelt-slot="${i}">
          <strong class="smelt-slot-title" data-action="select-smelt-slot" data-slot="${i}">Slot ${i + 1}</strong>
          <div class="smelt-slot-items">${readySlot}</div>
          ${slot.ore ? `<p class="empty-msg smelt-slot-meta">${fmt(slot.oreLoaded || 0)}/${batchCap} · ${recipe?.ticks ?? '?'}s</p>
            <div class="progress-bar compact"><div class="progress-bar-fill" style="width:${pct}%"></div></div>` : '<p class="empty-msg smelt-slot-meta">Load ore →</p>'}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Click ore in inventory to load smelters — max ${batchCap} per slot · click bars to collect</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Smelting Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      ${renderSkillXpBar(state.smelting.skill, 'Smelting XP')}
      ${pageCharBar()}
      ${renderSkillSubTabs('smelting')}
      ${skillSubTab === 'talents' ? renderTalentsPanel('smelting') : `<div class="activity-grid smelt-slots-grid smelt-slots-compact">${slotCards}</div>`}`;
  }

  /* ── Producing ── */

  function renderProducingPage(sk) {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character to produce.</p>';

    const prod = char.producing;
    const lv = prod.skill.level;
    const slotsOpen = E.produceSlotsUnlocked(char);

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
        <article class="activity-card produce-slot-compact${active ? ' activity-assigned-card' : ''}${locked ? ' locked' : ''}">
          <div class="produce-slot-head">
            ${resIcon(def.id, 'game-icon md')}
            <div class="produce-slot-title">
              <strong>${def.name}</strong>
              <span>${def.ticks}s · ${fmt(def.xp)} XP</span>
            </div>
          </div>
          <div class="activity-card-actions">
            <button type="button" class="${btnCls}" data-action="pick-produce" data-slot="${i}">
              ${active ? 'Active ✓' : 'Produce'}
            </button>
            ${active ? `<button type="button" class="btn-sm ghost" data-action="clear-produce">Stop</button>` : ''}
          </div>
          ${active ? `<div class="progress-bar compact"><div class="progress-bar-fill" style="width:${pct}%"></div></div>` : ''}
        </article>`;
    }).join('');

    const activeDef = prod.activeSlot != null ? C.PRODUCE_SLOTS[prod.activeSlot] : null;
    const readySlot = prod.ready > 0 && prod.readyItem
      ? `<div class="produce-ready-slot transferable" data-collect-type="produce" title="Click to collect ${activeDef?.name ?? resName(prod.readyItem)} into inventory">
          <span class="item-slot-icon">${resIcon(prod.readyItem)}</span>
          <span class="item-slot-qty">${fmt(prod.ready)}</span>
        </div>` : '';

    const activityBody = skillSubTab === 'talents'
      ? renderTalentsPanel('producing')
      : `<div class="activity-grid produce-slots-grid produce-slots-compact">${slotCards}</div>
      ${readySlot ? `<div class="produce-ready-wrap compact"><h3 class="storage-half-title">Ready to collect</h3>${readySlot}</div>` : ''}`;

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${charLabel(char)} — one recipe at a time · double-click ready items to collect</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Producing Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      ${renderSkillXpBar(prod.skill, 'Producing XP')}
      ${pageCharBar()}
      ${renderSkillSubTabs('producing')}
      ${activityBody}`;
  }

  function renderEquipSlotBox(item, slotType, slotKey, label) {
    const inner = item ? resIcon(item, 'game-icon xl') : '';
    const dragAttrs = item
      ? ` draggable="true" data-drag-kind="equip" data-slot-type="${slotType}" data-slot-key="${slotKey}" data-action="unequip-zone"`
      : '';
    return `
      <div class="equip-slot-box equip-slot-box-lg drag-drop-target${item ? ' filled draggable-item' : ''}"
        data-drop-zone="equip" data-slot-type="${slotType}" data-slot-key="${slotKey}"${dragAttrs}
        title="${label}${item ? ` — ${resName(item)} · click or drag to unequip` : ' · drag gear here'}">${inner}</div>`;
  }

  function renderCapacitySlotBox(item, category, label) {
    const def = item ? C.CONSUMABLE_ITEMS?.[item] : null;
    const cap = def ? C.POUCH_CAPACITIES[def.tier - 1] : null;
    const inner = item ? resIcon(item, 'game-icon lg') : '';
    const dragAttrs = item
      ? ` draggable="true" data-drag-kind="capacity" data-capacity-category="${category}" data-action="unequip-capacity" data-capacity-category="${category}"`
      : '';
    const capLine = cap ? `<p class="equip-stat-line">${fmt(cap)} / stack</p>` : '';
    return `
      <div class="equip-slot capacity-slot">
        <span class="equip-slot-label">${label}</span>
        <div class="equip-slot-box drag-drop-target${item ? ' filled draggable-item' : ''}"
          data-drop-zone="capacity" data-capacity-category="${category}"${dragAttrs}
          title="${label}${item ? ` — ${resName(item)} · click or drag to unequip` : ' · drag matching pouch here'}">${inner}</div>
        ${capLine}
      </div>`;
  }

  function renderEquipmentPanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character from the Characters page.</p>';
    const eqSlots = (C.EQUIPMENT_SLOTS || []).map((def) => {
      const item = char.equipment?.[def.id];
      const statLine = item ? `<p class="equip-stat-line">${formatGearStats(item)}</p>` : '';
      return `<div class="equip-slot" title="${def.label}">
        <span class="equip-slot-label">${def.label}</span>
        ${renderEquipSlotBox(item, 'equipment', def.id, def.label)}
        ${statLine}
      </div>`;
    }).join('');
    const toolSlots = (C.TOOL_SLOTS || []).map((def) => {
      const item = char.tools?.[def.id];
      const statLine = item ? `<p class="equip-stat-line">${formatGearStats(item)}</p>` : '';
      return `<div class="equip-slot tool-slot" title="${def.label}">
        <span class="equip-slot-label">${def.label}</span>
        ${renderEquipSlotBox(item, 'tool', def.id, def.label)}
        ${statLine}
      </div>`;
    }).join('');
    const capSlots = (C.CAPACITY_SLOTS || []).map((def) =>
      renderCapacitySlotBox(char.capacitySlots?.[def.id], def.id, def.label),
    ).join('');
    return `
      <header class="page-header">
        <span class="page-header-icon">🛡</span>
        <div class="page-header-text"><h1>Equipment</h1><p>${charLabel(char)} — drag gear, pouches, and tools</p></div>
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
          <section class="storage-panel slot-panel-fit">
            <h3 class="storage-half-title">Capacity</h3>
            <div class="capacity-grid">${capSlots}</div>
          </section>
        </section>
        <section class="skill-split-side storage-panel slot-panel-fit">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
          ${renderPagedInventory(char, { transferType: 'inv', gridClass: 'grid-inv-4' })}
          ${renderTrashZone()}
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
      leaderboardLoading = false;
      leaderboardError = 'Leaderboard is still loading. Try again in a moment.';
      if (activePage === 'leaderboard') renderMainPanel();
      return;
    }

    leaderboardLoading = true;
    leaderboardError = null;
    if (activePage === 'leaderboard') renderMainPanel();

    try {
      const session = window.WorldrootSession || {};
      if (session.isCloud && window.WorldrootLeaderboard.sync) {
        await window.WorldrootLeaderboard.sync();
      }
      const result = await window.WorldrootLeaderboard.fetchTop(10);
      leaderboardEntries = result.entries;
      if (result.error) {
        leaderboardError = result.error;
      } else if (!result.cloud && session.isOffline) {
        leaderboardError = 'Play offline hides the online leaderboard. Use Play Worldroot while logged in to rank.';
      } else if (!result.cloud) {
        leaderboardError = 'Could not reach the online leaderboard.';
      }
    } catch (err) {
      leaderboardError = err?.message || 'Leaderboard failed to load.';
      leaderboardEntries = [];
    } finally {
      leaderboardLoading = false;
      if (activePage === 'leaderboard') renderMainPanel();
    }
  }

  function renderShopPanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Create a character first.</p>';
    const items = (C.SHOP_ITEMS || []).map((shop) => {
      const avail = E.shopItemAvailable(state, shop.id);
      const canBuy = avail && state.gold >= shop.gold;
      return `
        <article class="activity-card shop-card${!avail ? ' locked' : ''}">
          <div class="shop-card-icon">${resIcon(shop.id, 'game-icon xl')}</div>
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
      <div class="activity-grid shop-grid shop-grid-lg">${items}</div>`;
  }

  function renderCraftingPage(sk) {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character to craft.</p>';
    const tabs = (C.CRAFT_CATEGORIES || []).map((cat) =>
      `<button type="button" class="quest-track-tab${craftCategory === cat.id ? ' active' : ''}" data-action="craft-category" data-category="${cat.id}">${cat.icon} ${cat.label}</button>`,
    ).join('');
    const filtered = (C.CRAFT_RECIPES || []).filter((r) => r.category === craftCategory);
    const recipes = filtered.map((recipe) => {
      const costs = recipe.costs.map((c) =>
        `<span class="craft-cost-chip compact">${resIcon(c.res, 'game-icon sm')} <strong>${fmt(c.amt)}</strong></span>`,
      ).join('');
      const can = E.canCraft(state, char, recipe.id);
      const canStorage = E.canCraftFromStorage(state, char, recipe.id);
      return `
        <article class="activity-card craft-card craft-card-compact">
          <div class="craft-card-top">
            ${resIcon(recipe.output, 'game-icon lg')}
            <strong>${resName(recipe.output)}</strong>
          </div>
          <div class="craft-cost-row compact">${costs}</div>
          <div class="craft-card-actions compact">
            <button type="button" class="btn-sm primary" data-action="craft-item" data-recipe="${recipe.id}" ${!can ? 'disabled' : ''}>Inv</button>
            <button type="button" class="btn-sm ghost" data-action="craft-item-storage" data-recipe="${recipe.id}" ${!canStorage ? 'disabled' : ''}>Stor</button>
          </div>
        </article>`;
    }).join('');
    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Craft gear — inventory on the right</p></div>
      </header>
      ${pageCharBar()}
      <div class="quest-track-tabs">${tabs}</div>
      <div class="activity-grid craft-grid craft-grid-compact">${recipes || '<p class="empty-msg">No recipes in this category.</p>'}</div>`;
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
            ${session?.isCloud ? `<button type="button" class="btn-sm primary" data-action="upload-cloud-save">Upload to cloud</button>
            <button type="button" class="btn-sm ghost" data-action="download-cloud-save">Download from cloud</button>` : ''}
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

  function sidebarHash() {
    const skillLevels = SIDEBAR_NAV.filter((n) => n.type === 'skill' && n.id !== 'crafting')
      .map((n) => skillLevelForNav(n.id)).join(',');
    const activities = state.characters.map((c) => `${c.activity}:${c.target ?? ''}`).join('|');
    return `${S.accountTotalLevel(state)}|${state.pendingSlot ?? ''}|${activities}|${skillLevels}|${activePage}`;
  }

  function flushPendingRender() {
    if (activePointers === 0 && pendingFullRender) {
      pendingFullRender = false;
      renderInternal();
    }
  }

  function renderInternal() {
    renderHud();
    renderSidebar();
    lastSidebarHash = sidebarHash();
    renderMainPanel();
    renderDetailPanel();
  }

  function renderTick() {
    renderHud();
    if (activePointers > 0) {
      pendingFullRender = true;
      return;
    }
    if (pageNeedsTickRefresh()) {
      renderMainPanel();
      renderDetailPanel();
      const hash = sidebarHash();
      if (hash !== lastSidebarHash) {
        lastSidebarHash = hash;
        renderSidebar();
      }
    }
  }

  function render(opts = {}) {
    if (!opts.force && activePointers > 0) {
      pendingFullRender = true;
      renderHud();
      return;
    }
    pendingFullRender = false;
    renderInternal();
  }

  function markTapHandled() {
    lastTapActionAt = Date.now();
  }

  function dispatchUiAction(e, rootEl) {
    const origin = rootEl || e.target;
    if (origin.closest?.('[data-collect-type]')) return false;
    const equipBtn = origin.closest?.('[data-action="equip-item"]');
    if (equipBtn && !e.shiftKey) {
      e.stopPropagation();
      const char = selectedChar();
      if (char && E.equipFromInventory(state, char, Number(equipBtn.dataset.inv))) {
        addLog('Equipped item.');
      } else addLog('Cannot equip — inventory full.');
      render();
      return;
    }
    const pouchBtn = origin.closest?.('[data-action="equip-pouch"]');
    if (pouchBtn && !e.shiftKey) {
      e.stopPropagation();
      const char = selectedChar();
      if (char && E.equipCapacityPouch(state, char, Number(pouchBtn.dataset.inv), pouchBtn.dataset.pouchCategory)) {
        addLog('Equipped capacity pouch.');
      } else addLog('Cannot equip pouch — wrong type or inventory full.');
      render();
      return;
    }
    const btn = origin.closest?.('[data-action]');
    if (!btn) return false;
    if (btn.disabled) return true;
    const action = btn.dataset.action;

    if (action === 'switch-page') { switchPage(btn.dataset.page); return; }
    if (action === 'close-offline-modal') { closeOfflineModal(); return; }
    if (action === 'close-trash-modal') { closeTrashModal(); return; }
    if (action === 'confirm-trash') { confirmTrashDelete(); return; }
    if (action === 'select-detail') {
      const kind = btn.dataset.detailKind;
      if (kind === 'combat') detailPanel = { kind: 'combat', id: btn.dataset.detailId };
      else if (kind === 'gather') detailPanel = { kind: 'gather', skillId: btn.dataset.detailSkill, id: btn.dataset.detailId };
      render();
      return;
    }
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
    if (action === 'skill-subtab') { skillSubTab = btn.dataset.tab; render(); return; }
    if (action === 'buy-talent') {
      const skillId = btn.dataset.skill;
      const char = skillId === 'smelting' ? selectedChar() : selectedChar();
      if (E.buyTalent(state, char, skillId, btn.dataset.talent)) {
        addLog('Talent upgraded.');
      } else addLog('Cannot upgrade — no points or talent at max rank.');
      render();
      return;
    }
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
    if (action === 'unequip-zone') {
      if (Date.now() < suppressClickUntil) return;
      e.stopPropagation();
      const char = selectedChar();
      if (char && E.unequipSlot(state, char, btn.dataset.slotType, btn.dataset.slotKey)) {
        addLog('Unequipped item.');
      } else addLog('Cannot unequip — inventory full.');
      render();
      return;
    }
    if (action === 'unequip-capacity') {
      if (Date.now() < suppressClickUntil) return;
      e.stopPropagation();
      const char = selectedChar();
      if (char && E.unequipCapacityPouch(state, char, btn.dataset.capacityCategory)) {
        addLog('Unequipped capacity pouch.');
      } else addLog('Cannot unequip pouch — inventory full.');
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
    if (action === 'upload-cloud-save') {
      if (window.WorldrootCloud?.upload) {
        window.WorldrootCloud.upload().then((ok) => {
          state = S.loadState();
          addLog(ok ? 'Uploaded save to cloud.' : 'Could not upload to cloud.');
          render();
        }).catch(() => addLog('Could not upload to cloud.'));
      }
      return;
    }
    if (action === 'download-cloud-save') {
      if (window.WorldrootCloud?.download) {
        window.WorldrootCloud.download().then((result) => {
          state = S.loadState();
          if (result?.ok) {
            addLog(`Downloaded cloud save (Account Lv ${fmt(S.accountTotalLevel(state))}).`);
          } else if (result?.reason === 'empty') {
            addLog('Cloud has no save yet. Upload from your other device first.');
          } else if (result?.reason === 'fetch') {
            addLog('Could not reach cloud — check connection and try again.');
          } else {
            addLog('Could not download from cloud.');
          }
          render({ force: true });
        }).catch(() => {
          addLog('Could not download from cloud.');
          render({ force: true });
        });
      }
      return;
    }
    if (action === 'reset-save') {
      if (confirm('Reset all progress? This will wipe cloud save too when logged in.')) {
        state = S.resetState();
        S.saveState(state);
        addLog('Save cleared.');
        render();
        if (window.WorldrootSession?.isCloud && window.WorldrootCloud?.upload) {
          window.WorldrootCloud.upload().then((ok) => {
            addLog(ok ? 'Reset synced to cloud.' : 'Could not sync reset — tap Upload to cloud.');
            render();
          }).catch(() => addLog('Could not sync reset — tap Upload to cloud.'));
        }
      }
      return;
    }
    if (action === 'go-menu' && window.WorldrootGoMenu) window.WorldrootGoMenu();
    return true;
  }

  function uiActionTarget(origin) {
    if (!origin?.closest) return null;
    if (origin.closest('[data-collect-type]')) return origin;
    if (origin.closest('[data-action="equip-item"]')) return origin;
    if (origin.closest('[data-action="equip-pouch"]')) return origin;
    if (origin.closest('[data-action]')) return origin;
    if (activePage === 'storage' && origin.closest('[data-transfer-type]')) return origin;
    return null;
  }

  function runUiAction(e, rootEl) {
    if (handlePointerSlotFromRoot(rootEl, e, 'click')) return true;
    if (!uiActionTarget(rootEl)) return false;
    dispatchUiAction(e, rootEl);
    return true;
  }

  function handlePointerSlotFromRoot(root, e, type) {
    const collectEl = root.closest?.('[data-collect-type]');
    if (collectEl && type === 'click' && !e.shiftKey) {
      handleCollect(collectEl);
      return true;
    }

    const slotEl = root.closest?.('[data-transfer-type]');
    if (!slotEl || activePage !== 'storage') return false;

    if (type === 'dblclick') {
      handleSlotTransfer(slotEl, false);
      return true;
    }

    if (type === 'click' && e.shiftKey) {
      window.getSelection()?.removeAllRanges();
      handleSlotTransfer(slotEl, true);
      return true;
    }

    if (type === 'click' && activePage === 'storage') {
      const typeName = slotEl.dataset.transferType;
      const idx = Number(slotEl.dataset.slot);
      const char = selectedChar();
      const slot = typeName === 'inv' ? char?.inventorySlots[idx] : state.storageSlots[idx];
      if (!slot) return true;
      if (storageSplitMode) {
        openTransferModal(typeName, idx);
      } else if (storageQuickTap) {
        handleQuickTapTransfer(slotEl);
      } else {
        handleSlotTransfer(slotEl, false);
      }
      return true;
    }
    return false;
  }

  function initTapToAct() {
    document.body.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      activePointers++;
      tapRecord = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        root: e.target,
        moved: false,
      };
    }, true);

    document.body.addEventListener('pointermove', (e) => {
      if (!tapRecord || e.pointerId !== tapRecord.id || tapRecord.moved) return;
      const dx = e.clientX - tapRecord.x;
      const dy = e.clientY - tapRecord.y;
      if (dx * dx + dy * dy > TAP_MOVE_PX * TAP_MOVE_PX) tapRecord.moved = true;
    }, true);

    const finishPointer = (e) => {
      const rec = tapRecord?.id === e.pointerId ? tapRecord : null;
      if (rec) tapRecord = null;
      activePointers = Math.max(0, activePointers - 1);

      if (rec && !rec.moved && Date.now() >= suppressClickUntil) {
        if (runUiAction(e, rec.root)) markTapHandled();
      }
      flushPendingRender();
    };

    document.body.addEventListener('pointerup', finishPointer, true);
    document.body.addEventListener('pointercancel', finishPointer, true);
  }

  function handleClick(e) {
    if (Date.now() - lastTapActionAt < 400) return;
    runUiAction(e, e.target);
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

  function parseDragPayload(e) {
    try {
      const raw = e.dataTransfer.getData('application/worldroot-drag');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function buildDragPayload(el) {
    const kind = el.dataset.dragKind;
    const charIdx = selectedIndex();
    if (kind === 'inv') return { kind: 'inv', idx: Number(el.dataset.dragIdx), charIdx };
    if (kind === 'storage') return { kind: 'storage', idx: Number(el.dataset.dragIdx) };
    if (kind === 'equip') return { kind: 'equip', slotType: el.dataset.slotType, key: el.dataset.slotKey, charIdx };
    if (kind === 'capacity') return { kind: 'capacity', category: el.dataset.capacityCategory, charIdx };
    return null;
  }

  function openTrashModal(payload) {
    if (!payload) return;
    let label = '';
    if (payload.kind === 'inv') {
      const char = state.characters[payload.charIdx];
      const slot = char?.inventorySlots[payload.idx];
      if (!slot) return;
      label = `${fmt(slot.amount)} × ${resName(slot.resourceId)}`;
    } else if (payload.kind === 'storage') {
      const slot = state.storageSlots[payload.idx];
      if (!slot) return;
      label = `${fmt(slot.amount)} × ${resName(slot.resourceId)}`;
    } else if (payload.kind === 'equip') {
      const char = state.characters[payload.charIdx];
      const store = payload.slotType === 'tool' ? char?.tools : char?.equipment;
      const item = store?.[payload.key];
      if (!item) return;
      label = resName(item);
    } else if (payload.kind === 'capacity') {
      const char = state.characters[payload.charIdx];
      const item = char?.capacitySlots?.[payload.category];
      if (!item) return;
      label = resName(item);
    } else return;
    trashModal = payload;
    const modal = $('trash-modal');
    const text = $('trash-modal-label');
    if (text) text.textContent = `Permanently delete ${label}? This cannot be undone.`;
    if (modal) modal.hidden = false;
  }

  function closeTrashModal() {
    trashModal = null;
    const modal = $('trash-modal');
    if (modal) modal.hidden = true;
  }

  function confirmTrashDelete() {
    if (!trashModal) return;
    const payload = trashModal;
    closeTrashModal();
    let ok = false;
    if (payload.kind === 'inv') {
      const char = state.characters[payload.charIdx];
      ok = char && E.destroyInventoryItem(state, char, payload.idx);
    } else if (payload.kind === 'storage') {
      ok = E.destroyStorageItem(state, payload.idx);
    } else if (payload.kind === 'equip') {
      const char = state.characters[payload.charIdx];
      ok = char && E.destroyEquipped(state, char, payload.slotType, payload.key);
    } else if (payload.kind === 'capacity') {
      const char = state.characters[payload.charIdx];
      ok = char && E.destroyCapacityPouch(state, char, payload.category);
    }
    addLog(ok ? 'Item deleted.' : 'Could not delete item.');
    render();
  }

  function handleDragDrop(payload, zone) {
    const dropZone = zone.dataset.dropZone;
    const char = selectedChar();
    if (!payload || !char) return;

    if (dropZone === 'trash') {
      openTrashModal(payload);
      return;
    }

    if (dropZone === 'smelt' && payload.kind === 'inv') {
      selectedSmeltSlot = Number(zone.dataset.smeltSlot);
      loadSmeltFromDrag(payload.idx, zone.dataset.smeltSlot);
      return;
    }

    if (dropZone === 'inv') {
      const toIdx = Number(zone.dataset.slot);
      if (payload.kind === 'inv') {
        if (payload.charIdx === selectedIndex() && S.swapInventorySlots(char, payload.idx, toIdx)) {
          S.saveState(state);
          render();
        }
      } else if (payload.kind === 'equip') {
        if (payload.charIdx === selectedIndex() && E.unequipToInventorySlot(state, char, payload.slotType, payload.key, toIdx)) {
          addLog('Unequipped item.');
          render();
        } else addLog('Cannot unequip — slot occupied or full.');
      } else if (payload.kind === 'capacity') {
        if (payload.charIdx === selectedIndex() && E.unequipCapacityPouch(state, char, payload.category, toIdx)) {
          addLog('Unequipped capacity pouch.');
          render();
        } else addLog('Cannot unequip pouch — slot occupied or full.');
      } else if (payload.kind === 'storage') {
        const moved = S.transferStorageToInvSlot(state, char, payload.idx, toIdx);
        if (moved > 0) {
          addLog(`Moved ${fmt(moved)} to inventory.`);
          render();
        }
      }
      return;
    }

    if (dropZone === 'storage') {
      const toIdx = Number(zone.dataset.slot);
      if (payload.kind === 'storage') {
        if (S.swapStorageSlots(state, payload.idx, toIdx)) {
          S.saveState(state);
          render();
        }
      } else if (payload.kind === 'inv') {
        const moved = S.transferInvToStorageSlot(state, char, payload.idx, toIdx);
        if (moved > 0) {
          addLog(`Moved ${fmt(moved)} to storage.`);
          render();
        }
      }
      return;
    }

    if (dropZone === 'equip' && payload.kind === 'inv') {
      if (E.equipFromInventory(state, char, payload.idx)) {
        addLog('Equipped item.');
        render();
      } else addLog('Cannot equip item.');
      return;
    }

    if (dropZone === 'capacity' && payload.kind === 'inv') {
      const category = zone.dataset.capacityCategory;
      if (E.equipCapacityPouch(state, char, payload.idx, category)) {
        addLog('Equipped capacity pouch.');
        render();
      } else addLog('Cannot equip — wrong pouch type or inventory full.');
    }
  }

  function initDragDrop() {
    document.body.addEventListener('dragstart', (e) => {
      const el = e.target.closest('[data-drag-kind]');
      if (!el || el.getAttribute('draggable') !== 'true') return;
      const payload = buildDragPayload(el);
      if (!payload) return;
      e.dataTransfer.setData('application/worldroot-drag', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
    });

    document.body.addEventListener('dragend', (e) => {
      e.target.closest('.dragging')?.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach((n) => n.classList.remove('drag-over'));
      suppressClickUntil = Date.now() + 300;
      tapRecord = null;
    });

    document.body.addEventListener('dragover', (e) => {
      const zone = e.target.closest('[data-drop-zone]');
      if (!zone) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    document.body.addEventListener('dragleave', (e) => {
      const zone = e.target.closest('[data-drop-zone]');
      if (zone) zone.classList.remove('drag-over');
    });

    document.body.addEventListener('drop', (e) => {
      const zone = e.target.closest('[data-drop-zone]');
      if (!zone) return;
      e.preventDefault();
      zone.classList.remove('drag-over');
      const payload = parseDragPayload(e);
      handleDragDrop(payload, zone);
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
    handlePointerSlotFromRoot(e.target, e, e.type);
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

  function formatOfflineDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${Math.max(1, seconds)}s`;
  }

  function charHadOfflineGains(entry) {
    if (!entry) return false;
    if (entry.gold > 0 || entry.kills > 0 || entry.lost > 0) return true;
    if (Object.keys(entry.xpBySkill).length) return true;
    if (Object.keys(entry.resources).length) return true;
    if (Object.keys(entry.loot).length) return true;
    return false;
  }

  function renderOfflineSummaryHtml(summary) {
    const lines = [];
    lines.push(`<p class="offline-intro">You were away for <strong>${formatOfflineDuration(summary.wallSeconds)}</strong> (progress at <strong>50%</strong> speed while closed).</p>`);

    let anyChar = false;
    (summary.characters || []).forEach((entry) => {
      if (!charHadOfflineGains(entry)) return;
      anyChar = true;
      const parts = [];
      for (const [skillId, xp] of Object.entries(entry.xpBySkill)) {
        const sk = C.SKILLS[skillId];
        parts.push(`${sk?.name ?? skillId} +${fmt(xp)} XP`);
      }
      for (const [resId, amt] of Object.entries(entry.resources)) {
        parts.push(`${fmt(amt)} ${resName(resId)}`);
      }
      if (entry.gold > 0) parts.push(`${fmt(entry.gold)} gold`);
      if (entry.kills > 0) parts.push(`${fmt(entry.kills)} kills`);
      for (const [lootId, amt] of Object.entries(entry.loot)) {
        parts.push(`${fmt(amt)} ${resName(lootId)}`);
      }
      if (entry.lost > 0) parts.push(`${fmt(entry.lost)} lost (inv full)`);
      lines.push(`
        <div class="offline-char-row">
          <strong>${entry.icon} ${entry.name}</strong>
          <span>${parts.join(' · ') || 'No gains'}</span>
        </div>`);
    });

    const sp = summary.smeltProduce;
    if (sp?.smelt) {
      const barParts = Object.entries(sp.smelt.bars).map(([id, n]) => `${fmt(n)} ${resName(id)}`);
      if (barParts.length) {
        anyChar = true;
        lines.push(`<div class="offline-char-row"><strong>🔥 Smelting</strong><span>${barParts.join(' · ')} (collect from smelters)</span></div>`);
      }
      if (sp.smelt.levelUp) {
        anyChar = true;
        lines.push(`<div class="offline-char-row"><strong>🔥 Smelting</strong><span>Reached Lv ${sp.smelt.levelUp}</span></div>`);
      }
    }
    if (sp?.produce) {
      sp.produce.forEach((p, i) => {
        const char = state.characters[i];
        if (!char || (!p.ready && !p.levelUp)) return;
        anyChar = true;
        const cls = C.CLASSES[char.classId];
        const parts = [];
        if (p.ready && p.item) parts.push(`${fmt(p.ready)} ${resName(p.item)} ready`);
        if (p.levelUp) parts.push(`Producing Lv ${p.levelUp}`);
        lines.push(`<div class="offline-char-row"><strong>${cls?.icon ?? '👤'} ${cls?.name ?? 'Hero'}</strong><span>${parts.join(' · ')}</span></div>`);
      });
    }

    if (!anyChar) {
      lines.push('<p class="empty-msg">No progress while away — assign heroes to activities before closing.</p>');
    }
    return lines.join('');
  }

  function showOfflineModal(summary) {
    const modal = $('offline-modal');
    const content = $('offline-modal-content');
    if (!modal || !content || !summary) return;
    content.innerHTML = renderOfflineSummaryHtml(summary);
    modal.hidden = false;
  }

  function closeOfflineModal() {
    const modal = $('offline-modal');
    if (modal) modal.hidden = true;
  }

  function init(initialState) {
    state = initialState;
    state.lastTickAt = state.lastTickAt || Date.now();
    initTapToAct();
    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('dblclick', handlePointerSlot);
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
    const run = async () => {
    try {
      if (!window.WorldrootState || !window.WorldrootEngine) {
        showBootError('Game failed to load. Hard refresh or Play offline from home.');
        return;
      }
      if (window.__worldrootBootGate) await window.__worldrootBootGate;
      if (window.__worldrootBooted) return;
      window.__worldrootBooted = true;
      const loaded = window.WorldrootState.loadState();
      init(loaded);
      const offline = window.WorldrootEngine.catchUpOffline(window.WorldrootUI.getState());
      if (offline) showOfflineModal(offline);
      addLog(state.characters.length ? 'Welcome back to Worldroot.' : 'Welcome to Worldroot. Choose your first class.');
      setInterval(() => {
        window.WorldrootEngine.tick(window.WorldrootUI.getState());
        window.WorldrootState.refreshPendingSlot(window.WorldrootUI.getState());
        renderTick();
      }, C?.TICK_MS ?? 1000);
      window.addEventListener('beforeunload', () => {
        const s = window.WorldrootUI.getState();
        s.lastTickAt = Date.now();
        window.WorldrootState.saveState(s);
        if (window.WorldrootCloud?.flushOnExit) window.WorldrootCloud.flushOnExit();
        else if (window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
      });
    } catch (err) {
      console.error('[Worldroot] boot failed:', err);
      showBootError(`Game error: ${err.message}`);
    }
    };
    run();
  }

  window.__worldrootBootGate = new Promise((resolve) => {
    window.__worldrootReleaseBoot = resolve;
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoBoot);
  else autoBoot();
})();
