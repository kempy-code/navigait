// Navigait storage system — the single source of truth for progress and rewards.
(function () {
  "use strict";
  const STORAGE_KEY = "navigaitUser";
  const MODULE_SECTIONS = 8;
  const defaultModule = { title: "What is Artificial Intelligence?", progress: 0, currentSection: 0, completedSections: [], completedActivities: [], reflections: {}, completed: false, xpEarned: 0 };
  const defaultUser = { name: "Student", xp: 0, level: 1, badges: [], streak: 0, activity: [], awardedRewards: [], modules: { module1: defaultModule }, games: { promptWars: { entries: [] } } };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const safeArray = (value) => Array.isArray(value) ? value : [];
  const calculateLevel = (xp) => Math.floor(Math.max(0, xp) / 250) + 1;

  function migrateUser(saved) {
    const old = saved && typeof saved === "object" ? saved : {};
    const oldModule = old.modules && old.modules.module1 ? old.modules.module1 : {};
    const user = Object.assign(clone(defaultUser), old);
    user.name = typeof old.name === "string" && old.name.trim() ? old.name.trim() : defaultUser.name;
    user.xp = Number.isFinite(Number(old.xp)) ? Math.max(0, Number(old.xp)) : 0;
    user.level = calculateLevel(user.xp);
    user.badges = safeArray(old.badges);
    user.activity = safeArray(old.activity).slice(0, 30);
    user.awardedRewards = safeArray(old.awardedRewards);
    user.streak = Number.isFinite(Number(old.streak)) ? Math.max(0, Number(old.streak)) : 0;
    user.modules = old.modules && typeof old.modules === "object" ? old.modules : {};
    user.modules.module1 = Object.assign(clone(defaultModule), oldModule);
    user.games = old.games && typeof old.games === "object" ? old.games : {};
    user.games.promptWars = Object.assign({ entries: [] }, user.games.promptWars || {});
    user.games.promptWars.entries = safeArray(user.games.promptWars.entries).slice(-30);
    const module = user.modules.module1;
    const migratedSections = safeArray(oldModule.completedSections);
    const inferredSections = migratedSections.length ? migratedSections : Array.from({ length: Math.max(0, Number(oldModule.currentSection) || 0) }, (_, index) => index);
    module.completedSections = [...new Set(inferredSections.map(Number).filter((value) => value >= 0 && value < MODULE_SECTIONS))];
    module.completedActivities = [...new Set(safeArray(oldModule.completedActivities))];
    module.reflections = oldModule.reflections && typeof oldModule.reflections === "object" ? oldModule.reflections : {};
    module.currentSection = Math.min(MODULE_SECTIONS - 1, Math.max(0, Number(oldModule.currentSection) || 0));
    module.completed = Boolean(oldModule.completed);
    module.progress = module.completed ? 100 : Math.round((module.completedSections.length / MODULE_SECTIONS) * 100);
    module.xpEarned = Number(oldModule.xpEarned) || 0;
    return user;
  }

  function saveUserData(user) {
    const cleanUser = migrateUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanUser));
    return cleanUser;
  }

  function getUserData() {
    let parsed = null;
    try { parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch (error) { console.warn("Navigait repaired an unreadable save."); }
    const user = migrateUser(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  function addActivityToUser(user, message, type, amount, rewardKey) {
    user.activity.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type: type || "Learning", message, amount: amount || 0, rewardKey: rewardKey || "", date: new Date().toISOString() });
    user.activity = user.activity.slice(0, 30);
  }

  function addActivity(activity) {
    const user = getUserData();
    addActivityToUser(user, activity.message || "Learning activity", activity.type, activity.amount);
    return saveUserData(user);
  }

  function awardXP(rewardKey, amount, reason) {
    const user = getUserData();
    if (!rewardKey || user.awardedRewards.includes(rewardKey)) return { awarded: false, user };
    user.awardedRewards.push(rewardKey);
    user.xp += amount;
    user.level = calculateLevel(user.xp);
    if (rewardKey.startsWith("module1:")) user.modules.module1.xpEarned += amount;
    addActivityToUser(user, reason || `Earned ${amount} XP`, "XP", amount, rewardKey);
    return { awarded: true, user: saveUserData(user) };
  }

  function addXP(amount, reason, rewardKey) { return awardXP(rewardKey || `legacy:${reason}:${amount}`, amount, reason); }

  function unlockBadge(name, reason) {
    const user = getUserData();
    if (user.badges.includes(name)) return false;
    user.badges.push(name);
    addActivityToUser(user, reason || `Unlocked ${name}`, "Badge", 0);
    saveUserData(user);
    return true;
  }

  function completeActivity(moduleName, activityId, xp, reason, badge) {
    const user = getUserData();
    const module = user.modules[moduleName];
    if (!module || module.completedActivities.includes(activityId)) return false;
    module.completedActivities.push(activityId);
    saveUserData(user);
    awardXP(`${moduleName}:activity:${activityId}`, xp, reason);
    if (badge) unlockBadge(badge);
    return true;
  }

  function saveReflection(moduleName, id, value) {
    const user = getUserData();
    user.modules[moduleName].reflections[id] = value;
    saveUserData(user);
  }

  function completeLesson(moduleName, section) {
    const user = getUserData();
    const module = user.modules[moduleName];
    if (!module || module.completedSections.includes(section)) return false;
    module.completedSections.push(section);
    module.completedSections.sort((a, b) => a - b);
    module.currentSection = Math.min(section + 1, MODULE_SECTIONS - 1);
    module.progress = Math.round((module.completedSections.length / MODULE_SECTIONS) * 100);
    saveUserData(user);
    awardXP(`${moduleName}:section:${section}`, 25, `Completed ${section === MODULE_SECTIONS - 1 ? "the final mission" : `section ${section + 1}`}`);
    return true;
  }

  function updateModuleProgress(moduleName, progress, section) {
    const user = getUserData();
    if (!user.modules[moduleName]) user.modules[moduleName] = clone(defaultModule);
    user.modules[moduleName].progress = Math.max(0, Math.min(100, Number(progress) || 0));
    user.modules[moduleName].currentSection = Math.max(0, Number(section) || 0);
    return saveUserData(user);
  }

  function finishModule(moduleName) {
    const user = getUserData();
    const module = user.modules[moduleName];
    if (module.completed) return false;
    module.completed = true; module.progress = 100; module.currentSection = MODULE_SECTIONS - 1;
    saveUserData(user);
    awardXP(`${moduleName}:complete`, 100, "Completed AI Foundations");
    unlockBadge("AI Foundations", "Earned the AI Foundations badge");
    return true;
  }

  function resetModule(moduleName) {
    const user = getUserData();
    const removedXP = user.modules[moduleName] ? Number(user.modules[moduleName].xpEarned) || 0 : 0;
    user.xp = Math.max(0, user.xp - removedXP); user.level = calculateLevel(user.xp);
    user.awardedRewards = user.awardedRewards.filter((key) => !key.startsWith(`${moduleName}:`));
    user.badges = user.badges.filter((badge) => !["First Steps", "AI Spotter", "AI Trainer", "Fact Checker", "Bias Detective", "AI Foundations"].includes(badge));
    user.activity = user.activity.filter((item) => !String(item.rewardKey || "").startsWith(`${moduleName}:`));
    user.modules[moduleName] = clone(defaultModule);
    addActivityToUser(user, "Reset Module 1 progress", "System", 0);
    return saveUserData(user);
  }

  function resetEverything() { localStorage.removeItem(STORAGE_KEY); return getUserData(); }
  function savePromptWarsEntry(entry) {
    const user = getUserData();
    const saved = Object.assign({ id: `prompt-wars-${Date.now()}`, date: new Date().toISOString() }, entry);
    user.games.promptWars.entries = [...user.games.promptWars.entries, saved].slice(-30);
    addActivityToUser(user, `Finished Prompt Wars as ${saved.nickname}`, "Game", 0);
    saveUserData(user);
    return saved;
  }
  window.NavigaitStorage = { getUserData, saveUserData, addActivity, awardXP, addXP, unlockBadge, completeActivity, saveReflection, completeLesson, updateModuleProgress, finishModule, resetModule, resetEverything, savePromptWarsEntry, calculateLevel, totalSections: MODULE_SECTIONS };
  Object.assign(window, window.NavigaitStorage);
})();
