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
  let logBuffer = [];

  function $(id) { return document.getElementById(id); }
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
            <span class="char-switch-icon">${cls.icon}</span>
          </button>`;
        }).join('')}
      </div>`;
  }

  function skillLevelForNav(skillId) {
    if (skillId === 'producing') return state.producing.skill.level;
    if (skillId === 'smelting') return state.smelting.skill.level;
    return bestSkillLevel(skillId);
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

  function renderSlotGrid(slots, maxSlots, opts = {}) {
    const { transferType = null, gridClass = '' } = opts;
    let html = '';
    for (let i = 0; i < maxSlots; i++) {
      const slot = slots[i];
      if (!slot) {
        html += `<div class="item-slot empty"><span class="item-slot-empty">+</span></div>`;
      } else {
        const transferAttr = transferType
          ? ` data-transfer-type="${transferType}" data-slot="${i}"`
          : '';
        html += `
          <div class="item-slot filled${transferType ? ' transferable' : ''}" title="${resName(slot.resourceId)}${transferType ? ' — double-click: move 1 · shift+click: move all' : ''}"${transferAttr}>
            <span class="item-slot-qty">${fmt(slot.amount)}</span>
            <span class="item-slot-icon">${resIcon(slot.resourceId, 'game-icon')}</span>
            <span class="item-slot-name">${resName(slot.resourceId)}</span>
          </div>`;
      }
    }
    return `<div class="item-slot-grid ${gridClass}">${html}</div>`;
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
    const slotCount = S.inventorySlotCount(char);
    const filled = char.inventorySlots.filter(Boolean).length;
    return `
      <header class="page-header">
        <span class="page-header-icon">🎒</span>
        <div class="page-header-text">
          <h1>Inventory</h1>
          <p>${filled} / ${slotCount} slots · overflow is lost</p>
        </div>
      </header>
      ${renderCharSwitcher()}
      <p class="hint-bar">${charLabel(char)} — double-click to move 1 to storage · shift+click to move all</p>
      ${renderSlotGrid(char.inventorySlots, slotCount, { transferType: 'inv', gridClass: 'grid-inv-4' })}`;
  }

  function renderStoragePanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Create a character first.</p>';
    const invCount = S.inventorySlotCount(char);
    const invFilled = char.inventorySlots.filter(Boolean).length;
    const storFilled = state.storageSlots.filter(Boolean).length;

    return `
      <header class="page-header">
        <span class="page-header-icon">📦</span>
        <div class="page-header-text">
          <h1>Storage</h1>
          <p>Double-click to move 1 · shift+click to move all</p>
        </div>
      </header>
      ${renderCharSwitcher()}
      <div class="storage-dual">
        <section class="storage-half">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory <span>${invFilled}/${invCount}</span></h3>
          ${renderSlotGrid(char.inventorySlots, invCount, { transferType: 'inv', gridClass: 'grid-inv-4' })}
        </section>
        <section class="storage-half">
          <h3 class="storage-half-title">Storage <span>${storFilled}/${state.storageSlots.length} · ∞ per resource</span></h3>
          ${renderSlotGrid(state.storageSlots, state.storageSlots.length, { transferType: 'storage', gridClass: 'grid-storage-6' })}
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
      const locked = best < mob.level;
      const on = char?.activity === 'combat' && char?.target === mob.id;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${iconHtml(mob.id, 'game-icon xl')}</span>
            <div class="activity-card-title">
              <strong>${mob.name}</strong>
              <span>Lv ${mob.level} · ${E.mobMaxHp(mob)} HP · ${mob.damage} dmg</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat"><span class="activity-stat-label">XP/hr</span><span class="activity-stat-value">${fmt(rates.xpHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Kills/hr</span><span class="activity-stat-value">${fmt(rates.killsHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Attack speed</span><span class="activity-stat-value">${C.COMBAT_ATTACK_SEC}s</span></div>
          </div>
          ${renderMobDrops(mob)}
          ${locked ? `<p class="empty-msg">Requires Combat Lv ${mob.level}</p>` : `<div class="activity-actions">${renderAssignBtn('combat', mob.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Fighting now</strong></p>' : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Fight monsters — earn XP, gold, and loot on kills</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Combat Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      ${renderSkillStopHeader()}
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

    const cards = veins.map((vein) => {
      const locked = best < vein.minLevel;
      const on = char?.activity === sk.activity && char?.target === vein.id;
      const pct = char ? xpProgress(char.skills[sk.id]) : 0;
      const threshold = E.veinEffThreshold(vein);
      const success = char ? E.gatherSuccessChance(state, char, sk.id, vein).toFixed(0) : 0;
      const xpHr = char && on ? Math.floor(C.GATHER_RATE_PER_MIN * 60 * C.BASE_XP_PER_TICK * (1 + E.skillXpBonus(state, sk.id))) : 0;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${iconHtml(vein.icon, 'game-icon gather')}</span>
            <div class="activity-card-title">
              <strong>${vein.name}</strong>
              <span>Lv ${vein.minLevel}</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat"><span class="activity-stat-label">Speed</span><span class="activity-stat-value">${C.GATHER_RATE_PER_MIN}/min</span></div>
            <div class="activity-stat"><span class="activity-stat-label">${labels.eff}</span><span class="activity-stat-value">${eff}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">${labels.chance}</span><span class="activity-stat-value">${success}%</span></div>
            <div class="activity-stat"><span class="activity-stat-label">100% at</span><span class="activity-stat-value">${threshold} eff</span></div>
            <div class="activity-stat"><span class="activity-stat-label">${labels.multi}</span><span class="activity-stat-value">${multiPct}%</span></div>
            ${on ? `<div class="activity-stat"><span class="activity-stat-label">XP/hr</span><span class="activity-stat-value">${fmt(xpHr)}</span></div>` : ''}
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          ${locked ? `<p class="empty-msg">Requires ${sk.name} Lv ${vein.minLevel}</p>` : `<div class="activity-actions">${renderAssignBtn(sk.activity, vein.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Active on selected hero</strong></p>' : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${sk.desc} · +${C.LEVEL_EFF_BONUS} eff & +${C.LEVEL_MULTI_BONUS * 100}% multi per level</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">${sk.name} Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      ${renderSkillStopHeader()}
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Smelting ── */

  function renderInventoryForSmelt(char) {
    if (!char) return '';
    const slotCount = S.inventorySlotCount(char);
    const cap = E.smeltBatchCapacity(state);
    const smeltSlot = state.smelting.slots[selectedSmeltSlot];
    let html = '';
    for (let i = 0; i < slotCount; i++) {
      const slot = char.inventorySlots[i];
      if (!slot) {
        html += `<div class="item-slot empty"><span class="item-slot-empty">+</span></div>`;
        continue;
      }
      const isOre = C.SMELT_RECIPES.some((r) => r.ore === slot.resourceId);
      const oreMatch = !smeltSlot?.ore || slot.resourceId === smeltSlot.ore;
      const canLoad = isOre && oreMatch && (smeltSlot?.oreLoaded || 0) < cap;
      const loadBtn = canLoad
        ? `<button type="button" class="slot-action-btn" data-action="load-smelt" data-inv="${i}" data-smelt="${selectedSmeltSlot}">→ Smelter</button>`
        : '';
      const dragAttr = canLoad ? 'true' : 'false';
      html += `
        <div class="item-slot filled smelt-drag-source${canLoad ? ' can-drag' : ''}" draggable="${dragAttr}"
          data-drag-type="smelt-ore" data-inv="${i}" data-resource="${slot.resourceId}"
          title="${resName(slot.resourceId)}${canLoad ? ' — drag to smelter' : ''}">
          <span class="item-slot-qty">${fmt(slot.amount)}</span>
          <span class="item-slot-icon">${resIcon(slot.resourceId, 'game-icon')}</span>
          <span class="item-slot-name">${resName(slot.resourceId)}</span>
          ${loadBtn}
        </div>`;
    }
    return `<div class="item-slot-grid grid-inv-4">${html}</div>`;
  }

  function renderSmeltingPage(sk) {
    const lv = state.smelting.skill.level;
    const char = selectedChar();
    const slotsOpen = E.smeltSlotsUnlocked(state);
    const batchCap = E.smeltBatchCapacity(state);
    const slotCards = state.smelting.slots.map((slot, i) => {
      const locked = i >= slotsOpen;
      if (locked) return `<div class="activity-card locked"><strong>Slot ${i + 1}</strong><p class="empty-msg">Unlocks at Smelting Lv ${C.SMELT_SLOT_UNLOCKS[i]}</p></div>`;
      const recipe = C.SMELT_RECIPES.find((r) => r.ore === slot.ore);
      const pct = slot.ore ? Math.min(100, (slot.progress / C.SMELT_TICKS_PER_ORE) * 100) : 0;
      const oreBtns = C.SMELT_RECIPES.map((r) =>
        `<button type="button" class="btn-xs picker-btn${slot.ore === r.ore ? ' active' : ''}"
          data-action="pick-smelt" data-slot="${i}" data-ore="${r.ore}">${r.name}</button>`
      ).join('');
      const selected = i === selectedSmeltSlot ? ' smelt-slot-selected' : '';

      const readySlot = slot.ready > 0
        ? `<div class="produce-ready-slot transferable" data-collect-type="smelt" data-slot="${i}" title="Double-click to collect all into storage">
            <span class="item-slot-qty">${fmt(slot.ready)}</span>
            <span class="item-slot-icon">${resIcon(slot.readyBar)}</span>
            <span class="item-slot-name">${resName(slot.readyBar)}</span>
          </div>` : '';

      return `
        <article class="activity-card smelt-drop-zone${selected}" data-action="select-smelt-slot" data-slot="${i}" data-smelt-slot="${i}">
          <strong>Smelter Slot ${i + 1}</strong>
          <div class="picker-row">${oreBtns}</div>
          ${slot.ore ? `<p class="empty-msg">Ore loaded: ${fmt(slot.oreLoaded || 0)} / ${batchCap} — drag ore here</p>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p class="empty-msg">Smelting ${recipe?.name ?? slot.ore}…</p>` : '<p class="empty-msg">Pick ore type, then drag from inventory</p>'}
          ${readySlot}
          ${slot.ore ? `<button type="button" class="btn-xs ghost" data-action="clear-smelt" data-slot="${i}">Stop slot</button>` : ''}
        </article>`;
    }).join('');

    const invSection = char
      ? `<section class="storage-half" style="margin-top:16px">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory <span>Load ore into Slot ${selectedSmeltSlot + 1}</span></h3>
          ${renderCharSwitcher()}
          ${renderInventoryForSmelt(char)}
        </section>` : '<p class="empty-msg">Select a character to load ore.</p>';

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Load ore from inventory into smelters — double-click ready bars to collect</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Smelting Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      ${renderSkillStopHeader('stop-all-smelt')}
      <div class="activity-grid">${slotCards}</div>
      ${invSection}`;
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
      const itemBtns = C.PRODUCE_ITEMS.map((p) => {
        const ok = lv >= p.minLevel;
        const cls = slot.item === p.id ? ' active' : '';
        const dis = ok ? '' : ' disabled';
        return `<button type="button" class="btn-xs picker-btn${cls}" data-action="pick-produce"
          data-slot="${i}" data-item="${p.id}"${dis}>${p.name}</button>`;
      }).join('');

      const readySlot = slot.ready > 0
        ? `<div class="produce-ready-slot transferable" data-collect-type="produce" data-slot="${i}" title="Double-click to collect all into inventory">
            <span class="item-slot-qty">${fmt(slot.ready)}</span>
            <span class="item-slot-icon">${resIcon(slot.item)}</span>
            <span class="item-slot-name">${def?.name ?? resName(slot.item)}</span>
          </div>` : '';

      return `
        <article class="activity-card">
          <strong>Producer Slot ${i + 1}</strong>
          <div class="picker-row">${itemBtns}</div>
          ${slot.item ? `<div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p class="empty-msg">Producing ${def?.name ?? slot.item}…</p>` : ''}
          ${readySlot}
          ${slot.item ? `<button type="button" class="btn-xs ghost" data-action="clear-produce" data-slot="${i}">Stop slot</button>` : ''}
        </article>`;
    }).join('');

    const char = selectedChar();
    const invSection = char
      ? `<section class="storage-half" style="margin-top:16px">
          <h3 class="storage-half-title">${charLabel(char)}'s Inventory</h3>
          ${renderCharSwitcher()}
          ${renderSlotGrid(char.inventorySlots, S.inventorySlotCount(char), { isInventory: true, gridClass: 'grid-inv-4' })}
        </section>` : '';

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Passive production — double-click ready items to collect into inventory</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Producing Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      ${renderSkillStopHeader('stop-all-produce')}
      <div class="activity-grid">${slotCards}</div>
      ${invSection}`;
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
        const bonus = E.upgradeBonusDisplay(state, node);
        const bonusClass = bonus.isPercent ? 'upgrade-card-bonus' : 'upgrade-card-bonus flat';
        const costs = E.upgradeCosts(node.id, lv);
        const canBuy = E.canAffordUpgrade(state, node.id);
        const costLine = Object.entries(costs).map(([res, amt]) => {
          const owned = S.countInSlots(state.storageSlots, res);
          const met = owned >= amt ? 'met' : 'unmet';
          return `<span class="upgrade-card-cost ${met}">${resIcon(res, 'game-icon lg')} ${fmt(owned)}/${fmt(amt)}</span>`;
        }).join('');
        return `
          <button type="button" class="upgrade-card${canBuy ? ' can-buy' : ''}" data-action="buy-upgrade" data-upgrade="${node.id}" title="${node.desc}">
            <span class="upgrade-card-name">${node.name}</span>
            <span class="upgrade-card-level">Lv ${lv}</span>
            <span class="${bonusClass}">${bonus.text}</span>
            <span class="upgrade-card-costs">${costLine}</span>
          </button>`;
      }).join('');
      return `<section class="branch-section"><div class="branch-header"><span class="branch-icon">${branch.icon}</span><h2>${branch.name}</h2></div><div class="upgrade-grid">${cards}</div></section>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">🌳</span>
        <div class="page-header-text"><h1>World Tree</h1><p>Click an upgrade when you have enough resources in storage</p></div>
      </header>
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

  function render() {
    renderHud();
    renderSidebar();
    renderMainPanel();
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
      const found = E.findUpgradeNode(btn.dataset.upgrade);
      if (found && E.buyUpgrade(state, btn.dataset.upgrade)) {
        addLog(`Upgraded ${found.node.name} to Lv ${E.upgradeLevel(state, btn.dataset.upgrade)}.`);
        render();
      } else if (found) {
        addLog(`Not enough resources for ${found.node.name}.`);
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
      E.setProduceSlot(state, Number(btn.dataset.slot), btn.dataset.item);
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

  function handleSlotTransfer(el, all) {
    const type = el.dataset.transferType;
    const slotIdx = Number(el.dataset.slot);
    if (type === 'inv') {
      const char = selectedChar();
      if (char && S.transferInvToStorage(state, char, slotIdx, all ? null : 1)) {
        addLog(all ? 'Moved stack to storage.' : 'Moved 1 to storage.');
        render();
      }
      return;
    }
    if (type === 'storage') {
      const char = selectedChar();
      if (char && S.transferStorageToInv(state, char, slotIdx, all ? null : 1)) {
        addLog(all ? 'Moved stack to inventory.' : 'Moved 1 to inventory.');
        render();
      } else {
        addLog('Inventory full — could not take item.');
      }
      render();
    }
  }

  function handleCollectDbl(el) {
    const type = el.dataset.collectType;
    const slotIdx = Number(el.dataset.slot);
    if (type === 'produce') {
      const result = E.collectProduce(state, slotIdx, selectedIndex());
      if (result.collected > 0) {
        addLog(`Collected ${result.collected} items into inventory.`);
        if (result.lost > 0) addLog(`${result.lost} items lost — inventory full.`);
      }
      render();
      return;
    }
    if (type === 'smelt') {
      const n = E.collectSmelt(state, slotIdx);
      if (n > 0) addLog(`Collected ${n} bars into storage.`);
      render();
    }
  }

  function handlePointerSlot(e) {
    const collectEl = e.target.closest('[data-collect-type]');
    if (collectEl && e.type === 'dblclick') {
      e.preventDefault();
      handleCollectDbl(collectEl);
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
      handleSlotTransfer(slotEl, true);
    }
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
    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('dblclick', handlePointerSlot);
    document.body.addEventListener('click', handlePointerSlot, true);
    initDragDrop();
    initResourceTooltips();
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
