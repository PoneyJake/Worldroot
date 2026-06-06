/** Worldroot — sidebar Melvor-style UI. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  const SIDEBAR_NAV = C?.SIDEBAR_NAV ?? [];
  const SKILL_ORDER = C?.SKILL_ORDER ?? ['combat', 'mining', 'woodcutting', 'fishing'];
  const MAX_SLOTS = C?.MAX_SLOTS ?? 3;

  let state = null;
  let activePage = 'combat';
  let selectedUpgradeId = null;
  let logBuffer = [];

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
    if (C.LOOT_NAMES?.[id]) return C.LOOT_NAMES[id];
    for (const sk of Object.values(C.SKILLS)) {
      const r = sk.resources?.find((x) => x.id === id);
      if (r) return r.name;
    }
    return id;
  }

  function activityLabel(char) {
    if (!char.activity) return 'Idle';
    const act = C.ACTIVITIES.find((a) => a.id === char.activity);
    if (!act) return 'Idle';
    if (char.activity === 'combat' && char.target) {
      const mob = C.MONSTERS.find((m) => m.id === char.target);
      return mob ? `Fighting ${mob.name}` : act.label;
    }
    if (char.target) {
      const veins = C.VEINS[char.activity];
      const vein = veins?.find((v) => v.id === char.target);
      if (vein) return vein.name;
    }
    return act.label;
  }

  function charLabel(char) {
    const cls = C.CLASSES[char.classId];
    return cls ? `${cls.icon} ${cls.name}` : 'Character';
  }

  function bestSkillLevel(skillId) {
    if (!state.characters.length) return 1;
    return Math.max(...state.characters.map((c) => c.skills[skillId]?.level ?? 1));
  }

  function charsOnTarget(activity, targetId) {
    return state.characters
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.activity === activity && c.target === targetId);
  }

  function xpProgress(skill) {
    const needed = S.xpForLevel(skill.level);
    return Math.min(100, (skill.xp / needed) * 100);
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

    let html = '<div class="sidebar-section-label">Skills</div>';
    for (const item of SIDEBAR_NAV) {
      if (item.type === 'divider') {
        html += '<div class="sidebar-divider"></div><div class="sidebar-section-label">Menu</div>';
        continue;
      }
      const isActive = item.id === activePage;
      const soon = item.comingSoon ? ' coming-soon' : '';
      const badge = item.comingSoon ? '<span class="sidebar-btn-badge">Soon</span>' : '';
      html += `
        <button type="button" class="sidebar-btn${isActive ? ' active' : ''}${soon}"
          data-action="switch-page" data-page="${item.id}" ${item.comingSoon ? 'disabled' : ''}>
          <span class="sidebar-btn-icon">${item.icon}</span>
          <span class="sidebar-btn-label">${item.label}</span>
          ${badge}
        </button>`;
    }
    el.innerHTML = html;
  }

  /* ── Top Bar ── */

  function renderHud() {
    const acct = $('account-level');
    const gold = $('gold-total');
    const notif = $('notification-count');
    if (acct) acct.textContent = fmt(S.accountTotalLevel(state));
    if (gold) gold.textContent = fmt(state.gold);
    if (notif) notif.textContent = state.pendingSlot ? '1' : '0';
  }

  /* ── Skill Pages ── */

  function renderSkillPage(skillId) {
    const sk = C.SKILLS[skillId];
    if (!sk) return '<p class="empty-msg">Unknown skill.</p>';
    if (sk.comingSoon) return renderComingSoon(sk);

    if (skillId === 'combat') return renderCombatPage(sk);
    return renderGatheringPage(sk);
  }

  function renderComingSoon(sk) {
    return `
      <div class="coming-soon-panel">
        <span class="coming-soon-icon">${sk.icon}</span>
        <h2>${sk.name}</h2>
        <p>${sk.desc}</p>
        <p style="margin-top:12px;font-size:0.85rem">Coming in a future update.</p>
      </div>`;
  }

  function renderCombatPage(sk) {
    const best = bestSkillLevel('combat');
    const cards = C.MONSTERS.map((mob) => {
      const assigned = charsOnTarget('combat', mob.id);
      const xpHr = E.getRatePerHour(state, 'xp', 'combat');
      const killsHr = E.getRatePerHour(state, 'kills', mob.id);
      const lootHr = mob.drop ? E.getRatePerHour(state, 'loot', mob.drop.id) : 0;
      const locked = best < mob.level;

      const assignBtns = state.characters.length
        ? state.characters
            .map((char, i) => {
              const on = char.activity === 'combat' && char.target === mob.id;
              return `<button type="button" class="btn-xs ${on ? 'active' : ''}"
                data-action="assign" data-char="${i}" data-activity="combat" data-target="${mob.id}">
                ${charLabel(char)}${on ? ' ✓' : ''}
              </button>`;
            })
            .join('')
        : '';

      const assignedNames = assigned.length
        ? assigned.map(({ c }) => charLabel(c)).join(', ')
        : 'None';

      return `
        <article class="activity-card ${mob.boss ? 'boss' : ''} ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${mob.icon}</span>
            <div class="activity-card-title">
              <strong>${mob.name}</strong>
              <span>Level ${mob.level}${mob.drop ? ` · Drops ${mob.drop.name}` : ''}</span>
            </div>
            ${mob.boss ? '<span class="activity-card-badge">BOSS</span>' : ''}
          </div>
          <div class="activity-stats">
            <div class="activity-stat">
              <span class="activity-stat-label">XP/hr</span>
              <span class="activity-stat-value">${fmt(xpHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Kills/hr</span>
              <span class="activity-stat-value">${fmt(killsHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Loot/hr</span>
              <span class="activity-stat-value">${fmt(lootHr)}</span>
            </div>
          </div>
          <p class="activity-assigned">Assigned: <strong>${assignedNames}</strong></p>
          ${locked
            ? `<p class="empty-msg">Requires Combat Level ${mob.level}</p>`
            : `<div class="activity-actions">${assignBtns}</div>`}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text">
          <h1>${sk.name}</h1>
          <p>${sk.desc}</p>
        </div>
        <div class="page-header-stat">
          <span class="page-header-stat-label">Combat Level</span>
          <span class="page-header-stat-value">${best}</span>
        </div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  function renderGatheringPage(sk) {
    const veins = C.VEINS[sk.id] ?? [];
    const best = bestSkillLevel(sk.id);

    const cards = veins.map((vein) => {
      const assigned = charsOnTarget(sk.activity, vein.id);
      const xpHr = E.getRatePerHour(state, 'xp', sk.id);
      const resHr = E.getRatePerHour(state, 'resources', vein.resource);
      const locked = best < vein.minLevel;
      const owned = state.resources[vein.resource] || 0;

      const assignBtns = state.characters.length
        ? state.characters
            .map((char, i) => {
              const on = char.activity === sk.activity && char.target === vein.id;
              return `<button type="button" class="btn-xs ${on ? 'active' : ''}"
                data-action="assign" data-char="${i}" data-activity="${sk.activity}" data-target="${vein.id}">
                ${charLabel(char)}${on ? ' ✓' : ''}
              </button>`;
            })
            .join('')
        : '';

      const assignedNames = assigned.length
        ? assigned.map(({ c }) => charLabel(c)).join(', ')
        : 'None';

      const progressPct = assigned.length
        ? xpProgress(assigned[0].c.skills[sk.id])
        : 0;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${vein.icon}</span>
            <div class="activity-card-title">
              <strong>${vein.name}</strong>
              <span>${resName(vein.resource)} · Lv ${vein.minLevel} required</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat">
              <span class="activity-stat-label">XP/hr</span>
              <span class="activity-stat-value">${fmt(xpHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">${resName(vein.resource)}/hr</span>
              <span class="activity-stat-value">${fmt(resHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Owned</span>
              <span class="activity-stat-value">${fmt(owned)}</span>
            </div>
          </div>
          <div class="progress-bar" title="XP progress">
            <div class="progress-bar-fill" style="width:${progressPct}%"></div>
          </div>
          <p class="activity-assigned">Assigned: <strong>${assignedNames}</strong></p>
          ${locked
            ? `<p class="empty-msg">Requires ${sk.name} Level ${vein.minLevel}</p>`
            : `<div class="activity-actions">${assignBtns}</div>`}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text">
          <h1>${sk.name}</h1>
          <p>${sk.desc}</p>
        </div>
        <div class="page-header-stat">
          <span class="page-header-stat-label">${sk.name} Level</span>
          <span class="page-header-stat-value">${best}</span>
        </div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Characters Page ── */

  function renderCharactersPanel() {
    const account = S.accountTotalLevel(state);
    const next = S.nextSlotUnlock(account);
    let unlockHint = '';
    if (next) {
      unlockHint = `<p class="hint-bar">Next slot unlocks at Account Level <strong>${next.at}</strong></p>`;
    }

    const cards = state.characters.map((char, i) => {
      const cls = C.CLASSES[char.classId];
      const total = S.characterTotalLevel(char);
      const combatLv = char.skills.combat?.level ?? 1;

      const skillItems = [
        { id: 'combat', icon: '🗡' },
        { id: 'mining', icon: '⛏' },
        { id: 'woodcutting', icon: '🪓' },
        { id: 'fishing', icon: '🎣' },
      ]
        .map(
          (s) => `
          <div class="char-skill-item">
            <span class="char-skill-icon">${s.icon}</span>
            <span class="char-skill-name">${skillName(s.id)}</span>
            <span class="char-skill-lv">${char.skills[s.id]?.level ?? 1}</span>
          </div>`
        )
        .join('');

      return `
        <article class="char-card" data-class="${char.classId}">
          <div class="char-card-top">
            <div class="char-portrait">${cls.icon}</div>
            <div class="char-card-title">
              <strong>${cls.name}</strong>
              <span class="char-meta">${cls.desc}</span>
            </div>
            <div class="char-total-badge">
              <span>Total</span>
              <strong>${total}</strong>
            </div>
          </div>
          <div class="char-activity-pill ${char.activity ? 'active' : ''}">
            ${char.activity ? '▶' : '○'} ${activityLabel(char)}
          </div>
          <div class="char-skills-grid">${skillItems}</div>
          <div style="font-size:0.78rem;color:#6a7a66;margin-bottom:10px">
            Combat Level: <strong style="color:#a8d5a2">${combatLv}</strong>
          </div>
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

    return `
      <header class="page-header">
        <span class="page-header-icon">👥</span>
        <div class="page-header-text">
          <h1>Characters</h1>
          <p>Manage your party and view skill levels</p>
        </div>
        <div class="page-header-stat">
          <span class="page-header-stat-label">Party</span>
          <span class="page-header-stat-value">${state.characters.length}/${MAX_SLOTS}</span>
        </div>
      </header>
      ${unlockHint}
      <div class="char-grid">${cards.join('') || '<p class="empty-msg">Choose a class to begin your party.</p>'}</div>
      ${slots.length ? `<div class="slot-row">${slots.join('')}</div>` : ''}`;
  }

  /* ── World Tree ── */

  function renderWorldTreePanel() {
    const branches = C.WORLD_TREE_BRANCHES.map((branch) => {
      const cards = branch.nodes
        .map((node) => {
          const lv = E.upgradeLevel(state, node.id);
          const bonus = E.upgradeBonusPercent(state, node.id).toFixed(0);
          return `
            <button type="button" class="upgrade-card" data-action="open-upgrade" data-upgrade="${node.id}">
              <span class="upgrade-card-name">${node.name}</span>
              <span class="upgrade-card-level">Level ${lv}</span>
              <span class="upgrade-card-bonus">+${bonus}%</span>
            </button>`;
        })
        .join('');

      return `
        <section class="branch-section">
          <div class="branch-header">
            <span class="branch-icon">${branch.icon}</span>
            <h2>${branch.name}</h2>
          </div>
          <div class="upgrade-grid">${cards}</div>
        </section>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">🌳</span>
        <div class="page-header-text">
          <h1>World Tree</h1>
          <p>Grow the ancient tree to unlock powerful bonuses across all skills</p>
        </div>
      </header>
      <div class="branch-grid">${branches}</div>`;
  }

  function renderUpgradeModal() {
    const modal = $('upgrade-modal');
    const content = $('upgrade-modal-content');
    if (!modal || !content) return;

    if (!selectedUpgradeId) {
      modal.hidden = true;
      return;
    }

    const found = E.findUpgradeNode(selectedUpgradeId);
    if (!found) {
      modal.hidden = true;
      return;
    }

    const { branch, node } = found;
    const lv = E.upgradeLevel(state, node.id);
    const currentBonus = E.upgradeBonusPercent(state, node.id).toFixed(0);
    const nextBonus = ((lv + 1) * C.UPGRADE_BONUS_PER_LEVEL * 100).toFixed(0);
    const costs = E.upgradeCosts(node.id, lv);
    const canBuy = E.canAffordUpgrade(state, node.id);

    const reqList = Object.entries(costs)
      .map(([res, amt]) => {
        const owned = state.resources[res] || 0;
        const met = owned >= amt;
        return `<li class="${met ? 'met' : 'unmet'}">
          <span>${resName(res)}</span>
          <span>${fmt(owned)} / ${fmt(amt)}</span>
        </li>`;
      })
      .join('');

    content.innerHTML = `
      <div class="upgrade-modal-head">
        <h2>${node.name}</h2>
        <p>${branch.name} · ${node.desc}</p>
      </div>
      <div class="upgrade-detail-row">
        <span class="upgrade-detail-label">Current Level</span>
        <span class="upgrade-detail-value">${lv}</span>
      </div>
      <div class="upgrade-detail-row">
        <span class="upgrade-detail-label">Current Bonus</span>
        <span class="upgrade-detail-value bonus">+${currentBonus}%</span>
      </div>
      <div class="upgrade-detail-row">
        <span class="upgrade-detail-label">Next Level Bonus</span>
        <span class="upgrade-detail-value bonus">+${nextBonus}%</span>
      </div>
      <div class="upgrade-requirements">
        <h3>Requirements</h3>
        <ul class="req-list">${reqList || '<li>No cost defined</li>'}</ul>
      </div>
      <div class="upgrade-modal-actions">
        <button type="button" class="btn-sm primary ${canBuy ? '' : 'disabled'}"
          data-action="buy-upgrade" data-upgrade="${node.id}" ${canBuy ? '' : 'disabled'}>
          Upgrade
        </button>
        <button type="button" class="btn-sm ghost" data-action="close-upgrade-modal">Close</button>
      </div>`;

    modal.hidden = false;
  }

  /* ── Settings ── */

  function renderSettingsPanel() {
    const session = window.WorldrootSession;
    const sessionText = session?.isCloud
      ? `Cloud save · ${session.displayName}`
      : 'Offline · this device only';

    return `
      <header class="page-header">
        <span class="page-header-icon">⚙</span>
        <div class="page-header-text">
          <h1>Settings</h1>
          <p>Save data and account options</p>
        </div>
      </header>
      <div class="settings-grid">
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
          <p class="settings-line">Gold: <strong>${fmt(state.gold)}</strong></p>
        </section>
        <section class="detail-box">
          <h3>Activity log</h3>
          <ul id="activity-log" class="log"></ul>
        </section>
      </div>`;
  }

  /* ── Main Panel ── */

  function renderMainPanel() {
    const el = $('panel-main');
    if (!el) return;

    const skill = C.SKILLS[activePage];
    if (skill && !skill.comingSoon) {
      el.innerHTML = renderSkillPage(activePage);
    } else if (activePage === 'characters') {
      el.innerHTML = renderCharactersPanel();
    } else if (activePage === 'worldtree') {
      el.innerHTML = renderWorldTreePanel();
    } else if (activePage === 'settings') {
      el.innerHTML = renderSettingsPanel();
      renderLogEl();
    } else if (skill?.comingSoon) {
      el.innerHTML = renderComingSoon(skill);
    } else {
      el.innerHTML = '<p class="empty-msg">Select a page from the sidebar.</p>';
    }
  }

  /* ── Class Modal ── */

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

  function render() {
    renderHud();
    renderSidebar();
    renderMainPanel();
    renderClassModal();
    renderUpgradeModal();
  }

  /* ── Events ── */

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'switch-page') {
      switchPage(btn.dataset.page);
      return;
    }

    if (action === 'pick-class') {
      S.addCharacter(state, btn.dataset.class);
      addLog(`${C.CLASSES[btn.dataset.class].name} joined the party.`);
      render();
      return;
    }

    if (action === 'open-class') {
      state.pendingSlot = Number(btn.dataset.slot);
      renderClassModal();
      return;
    }

    if (action === 'assign') {
      const idx = Number(btn.dataset.char);
      S.setActivity(state, idx, btn.dataset.activity, btn.dataset.target);
      addLog(`${charLabel(state.characters[idx])} → ${activityLabel(state.characters[idx])}`);
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

    if (action === 'open-upgrade') {
      selectedUpgradeId = btn.dataset.upgrade;
      renderUpgradeModal();
      return;
    }

    if (action === 'close-upgrade-modal') {
      selectedUpgradeId = null;
      renderUpgradeModal();
      return;
    }

    if (action === 'buy-upgrade') {
      const nodeId = btn.dataset.upgrade;
      const found = E.findUpgradeNode(nodeId);
      if (found && E.buyUpgrade(state, nodeId)) {
        addLog(`Upgraded ${found.node.name} to level ${E.upgradeLevel(state, nodeId)}.`);
        render();
      }
      return;
    }

    if (action === 'reset-save') {
      if (confirm('Reset all progress? This cannot be undone.')) {
        state = S.resetState();
        selectedUpgradeId = null;
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

  function setSessionBadge() {
    if (activePage === 'settings') renderMainPanel();
  }

  function init(initialState) {
    state = initialState;
    document.body.addEventListener('click', handleClick);
    renderSidebar();
    switchPage('combat');

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
    const panel = document.getElementById('panel-main');
    if (panel) {
      panel.innerHTML = `<p class="empty-msg" style="color:#e8a0a0">${msg}</p>`;
    }
  }

  function autoBoot() {
    try {
      const St = window.WorldrootState;
      const En = window.WorldrootEngine;
      if (!St || !En) {
        showBootError('Game failed to load. Hard refresh (Ctrl+Shift+R) or try Play offline from the home page.');
        return;
      }

      const mode = sessionStorage.getItem('worldroot_play_mode');
      St.setPlayMode(mode === 'cloud' ? 'cloud' : 'offline');

      window.WorldrootSession = window.WorldrootSession || {
        isCloud: mode === 'cloud',
        isOffline: mode !== 'cloud',
        displayName: 'Offline',
      };

      if (window.__worldrootBooted) return;
      window.__worldrootBooted = true;

      const gameState = St.loadState();
      init(gameState);

      if (!gameState.characters.length) {
        addLog('Welcome to Worldroot. Choose your first class.');
      } else {
        addLog('Welcome back to Worldroot.');
      }

      setInterval(() => {
        En.tick(getState());
        St.refreshPendingSlot(getState());
        refresh();
      }, C?.TICK_MS ?? 1000);

      window.addEventListener('beforeunload', () => {
        St.saveState(getState());
        if (window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
      });
    } catch (err) {
      console.error('[Worldroot] boot failed:', err);
      showBootError(`Game error: ${err.message}. Try Reset save in Settings or clear browser data for this site.`);
    }
  }

  function getState() {
    return window.WorldrootUI.getState();
  }

  function refresh() {
    window.WorldrootUI.refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot);
  } else {
    autoBoot();
  }
})();
