// Module 1 interaction engine. Plain JavaScript, intentionally readable.
(function () {
  "use strict";
  const MODULE = "module1";
  const titles = ["Meet AI", "AI vs software", "How AI learns", "Generative AI", "AI Detective", "Bias & privacy", "Responsible use", "Final mission"];
  let state;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  document.addEventListener("DOMContentLoaded", initialise);

  function initialise() {
    state = getUserData();
    buildNavigation(); restoreSavedWork(); setupQuizzes(); setupSorter(); setupTrainer();
    setupPromptBuilder(); setupMultiChoice(); setupScenarios(); setupReflections(); setupNavigation(); setupReset(); setupMenu();
    showCurrentSection();
  }

  function moduleData() { return getUserData().modules[MODULE]; }
  function activityComplete(id) { return moduleData().completedActivities.includes(id); }
  function toast(message) {
    const item = document.createElement("div"); item.className = "xp-toast"; item.textContent = message;
    $(".toast-region").append(item); setTimeout(() => item.remove(), 2400);
  }
  function markComplete(activity) {
    const id = activity.dataset.id;
    if (activityComplete(id)) { activity.classList.add("is-complete"); updateContinue(activity.closest(".module-section")); return; }
    const awarded = completeActivity(MODULE, id, Number(activity.dataset.xp) || 20, `Completed ${id.replaceAll("-", " ")}`, activity.dataset.badge);
    activity.classList.add("is-complete");
    if (awarded) {
      toast(`+${activity.dataset.xp || 20} XP · Activity complete`);
      if (!getUserData().badges.includes("First Steps")) unlockBadge("First Steps", "Unlocked First Steps");
    }
    updateContinue(activity.closest(".module-section")); updateHeader();
  }
  function showFeedback(activity, correct, text) {
    const feedback = $(".feedback", activity); feedback.className = `feedback ${correct ? "success" : "error"}`; feedback.textContent = text;
  }

  function buildNavigation() {
    const nav = $("#sectionNav");
    titles.forEach((title, index) => { const button = document.createElement("button"); button.dataset.section = index; button.innerHTML = `<span class="nav-state"></span><span>${title}</span>`; nav.append(button); });
    nav.addEventListener("click", (event) => {
      const button = event.target.closest("button"); if (!button || button.disabled) return;
      const target = Number(button.dataset.section); const module = moduleData();
      if (target <= module.currentSection || module.completedSections.includes(target)) { module.currentSection = target; const user = getUserData(); user.modules[MODULE].currentSection = target; saveUserData(user); showCurrentSection(); }
    });
  }

  function showCurrentSection() {
    const module = moduleData();
    if (module.completed) { showCompletion(); return; }
    $$(".module-section").forEach((section, index) => section.classList.toggle("active", index === module.currentSection));
    updateNavigation(); updateHeader(); restoreActivityStates();
    const current = $(`.module-section[data-section="${module.currentSection}"]`); updateContinue(current);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateNavigation() {
    const module = moduleData();
    $$("#sectionNav button").forEach((button, index) => {
      const done = module.completedSections.includes(index), current = index === module.currentSection;
      button.className = done ? "complete" : current ? "current" : "locked"; button.disabled = !done && !current;
      $(".nav-state", button).textContent = done ? "✓" : current ? "→" : "🔒";
      if (current) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
    });
  }

  function updateHeader() {
    const user = getUserData(), module = user.modules[MODULE];
    $("#moduleProgress").style.width = `${module.progress}%`; $("#progressText").textContent = `${module.progress}% complete`; $("#xpDisplay").textContent = `${user.xp} XP`;
  }

  function restoreActivityStates() {
    const completed = moduleData().completedActivities;
    $$(".activity").forEach((activity) => { if (completed.includes(activity.dataset.id)) { activity.classList.add("is-complete"); showFeedback(activity, true, "✓ Completed — XP already awarded."); } });
  }

  function updateContinue(section) {
    if (!section) return; const activities = $$(".activity", section); const ready = activities.every((item) => activityComplete(item.dataset.id));
    const button = $(".next-section", section); button.disabled = !ready; button.title = ready ? "" : "Complete the activities above first";
  }

  function setupNavigation() {
    $$(".next-section").forEach((button) => button.addEventListener("click", () => {
      const section = button.closest(".module-section"), index = Number(section.dataset.section);
      if (button.disabled) return;
      const firstTime = completeLesson(MODULE, index); if (firstTime) toast("+25 XP · Section complete");
      if (index === titles.length - 1) { finishModule(MODULE); toast("+100 XP · Module complete"); showCompletion(); }
      else showCurrentSection();
    }));
  }

  function setupQuizzes() {
    $$(".quiz").forEach((activity) => $$("button", activity).forEach((button) => button.addEventListener("click", () => {
      if (activityComplete(activity.dataset.id)) return;
      $$("button", activity).forEach((item) => item.classList.remove("incorrect"));
      if (button.dataset.value === activity.dataset.answer) { button.classList.add("correct"); showFeedback(activity, true, `Correct. ${activity.dataset.explanation}`); markComplete(activity); }
      else { button.classList.add("incorrect"); showFeedback(activity, false, `Not quite. ${activity.dataset.explanation} Try again.`); }
    })));
  }

  function setupSorter() {
    const activity = $(".sort-activity"); if (!activity) return;
    const examples = [{ text: "ChatGPT", answer: "ai" }, { text: "Netflix recommendations", answer: "ai" }, { text: "Calculator", answer: "not" }, { text: "Alarm clock", answer: "not" }, { text: "Face recognition", answer: "ai" }, { text: "Traffic prediction", answer: "ai" }];
    const bank = $(".sort-bank", activity); let selected = null, placed = 0;
    examples.forEach((example) => { const button = document.createElement("button"); button.textContent = example.text; button.draggable = true; button.dataset.answer = example.answer; bank.append(button); button.addEventListener("click", () => { if (button.disabled) return; $$(".sort-bank button").forEach((x) => x.classList.remove("selected")); selected = button; button.classList.add("selected"); }); button.addEventListener("dragstart", () => { selected = button; }); });
    $$(".sort-zone", activity).forEach((zone) => { zone.addEventListener("dragover", (e) => e.preventDefault()); zone.addEventListener("drop", () => place(zone)); zone.addEventListener("click", () => place(zone)); });
    function place(zone) { if (!selected) { showFeedback(activity, false, "Select an example first."); return; } const right = selected.dataset.answer === zone.dataset.zone; selected.classList.add(right ? "sorted-correct" : "sorted-wrong"); if (right) { selected.disabled = true; placed += 1; selected = null; showFeedback(activity, true, "Correct — AI learns patterns or makes predictions; fixed-rule tools do not."); if (placed === examples.length) markComplete(activity); } else showFeedback(activity, false, "Try the other category. Ask: does it learn patterns, or only follow fixed rules?"); }
  }

  function setupTrainer() {
    const activity = $(".trainer"); if (!activity) return; let count = 0;
    const samples = [{e:"🍎",c:"red and round",a:"apple"},{e:"🍌",c:"yellow and long",a:"banana"},{e:"🍏",c:"green and round",a:"apple"},{e:"🍌",c:"yellow and curved",a:"banana"},{e:"🍎",c:"red with a stem",a:"apple"},{e:"🍌",c:"soft and yellow",a:"banana"}];
    $$("[data-label]", activity).forEach((button) => button.addEventListener("click", () => { if (count >= samples.length || activityComplete(activity.dataset.id)) return; const correct = button.dataset.label === samples[count].a; if (!correct) { showFeedback(activity, false, "Check the colour and shape, then label it again."); return; } count++; const confidence = Math.min(92, 20 + count * 12); $("#trainingFill").style.width = `${confidence}%`; $("#trainingStatus").textContent = `${count} examples labelled · confidence ${confidence}%`; if (count < samples.length) { $("#sampleEmoji").textContent = samples[count].e; $("#sampleClue").textContent = samples[count].c; } if (count >= 4) $(".test-model", activity).disabled = false; showFeedback(activity, true, "Label added. Balanced examples help the model find a better pattern."); }));
    $(".test-model", activity).addEventListener("click", () => { $("#sampleEmoji").textContent = "🍏"; $("#sampleClue").textContent = "new: green and round"; showFeedback(activity, true, "Prediction: apple · The model used the patterns in your labelled examples. Confidence is useful, but it is not a guarantee."); markComplete(activity); });
  }

  function setupPromptBuilder() {
    const activity = $(".prompt-builder"); let useful = 0;
    $$("button", activity).forEach((button) => button.addEventListener("click", () => { if (activityComplete(activity.dataset.id) || button.classList.contains("selected")) return; if (button.dataset.useful === "true") { button.classList.add("selected"); useful++; showFeedback(activity, true, "Useful detail added: task, audience, format and constraints make prompts clearer."); if (useful === 3) markComplete(activity); } else { button.classList.add("incorrect"); showFeedback(activity, false, "That phrase is vague. Choose a concrete topic, audience, length or format."); } }));
  }

  function setupMultiChoice() {
    $$(".multi-choice").forEach((activity) => { const choices = $$('button[data-value]', activity); choices.forEach((button) => button.addEventListener("click", () => button.classList.toggle("selected"))); $(".check-selection", activity).addEventListener("click", () => { const selected = choices.filter((button) => button.classList.contains("selected")).map((button) => button.dataset.value).sort().join(","); const correct = activity.dataset.correct.split(",").sort().join(","); if (selected === correct) { choices.forEach((button) => button.classList.toggle("correct", button.classList.contains("selected"))); showFeedback(activity, true, "Correct. Use relevant information, exclude sensitive or unfair factors, and keep a human review."); markComplete(activity); } else { choices.forEach((button) => button.classList.toggle("incorrect", button.classList.contains("selected") && !activity.dataset.correct.split(",").includes(button.dataset.value))); showFeedback(activity, false, "Review your choices. Is each item necessary, fair and safe to share?"); } }); });
  }

  function setupScenarios() {
    const activity = $(".scenarios"); let solved = 0;
    $$(".scenario", activity).forEach((scenario) => $$("button", scenario).forEach((button) => button.addEventListener("click", () => { if (scenario.classList.contains("solved")) return; if (button.dataset.correct === "true") { button.classList.add("correct"); scenario.classList.add("solved"); solved++; showFeedback(activity, true, `${solved} of 3 decisions complete. Keep human judgement and seek qualified help for high-stakes choices.`); if (solved === 3) markComplete(activity); } else { button.classList.add("incorrect"); showFeedback(activity, false, "That choice gives AI too much control or could cause harm. Try again."); } })));
  }

  function setupReflections() {
    $$(".reflection, .final-plan").forEach((activity) => { const fields = $$('textarea', activity); fields.forEach((field) => { field.value = moduleData().reflections[field.dataset.reflection] || ""; field.addEventListener("input", () => { saveReflection(MODULE, field.dataset.reflection, field.value); const counter = $(".character-count", activity); if (counter) counter.textContent = `${field.value.trim().length} / 30 characters`; validate(); }); }); function validate() { const valid = fields.every((field) => field.value.trim().length >= Number(field.minLength)); if (valid) { showFeedback(activity, true, "Saved on this device. Thoughtful response complete."); markComplete(activity); } else showFeedback(activity, false, "Keep going — complete each response with a clear, specific idea."); } if (fields.some((f) => f.value)) validate(); });
  }

  function restoreSavedWork() { /* Reflection values are restored when their controls are initialised. */ }
  function showCompletion() { $$(".module-section").forEach((section) => section.classList.remove("active")); $(".completion-screen").hidden = false; $("#finalXP").textContent = getUserData().xp; updateHeader(); }
  function setupReset() { const dialog = $("#resetDialog"); $("#resetModule").addEventListener("click", () => dialog.showModal()); $("#cancelReset").addEventListener("click", () => dialog.close()); $("#confirmReset").addEventListener("click", () => { resetModule(MODULE); location.reload(); }); }
  function setupMenu() { $("#menuButton").addEventListener("click", () => { const sidebar = $("#moduleSidebar"), open = sidebar.classList.toggle("open"); $("#menuButton").setAttribute("aria-expanded", String(open)); }); }
})();
