/* Skova Fitness — on-site assistant.
   Runs entirely in the browser: answers come from js/config.js (hours, prices, timetable, products)
   and the fixed facts below. No server, no API key. Anything it cannot answer is handed to WhatsApp.
   Depends on js/config.js and js/site.js. */
window.SkovaChat = (function(){
  var S = window.Skova, esc = S.esc, pick = S.pick;
  var DAYS = ["sun","mon","tue","wed","thu","fri","sat"];
  var DAY_NAMES = { sun:"Sunday", mon:"Monday", tue:"Tuesday", wed:"Wednesday", thu:"Thursday", fri:"Friday", sat:"Saturday" };
  var onHome = !!document.getElementById("membership");
  function link(hash, text){ return "<a href='" + (onHome ? "" : "index.html") + "#" + hash + "'>" + text + "</a>"; }
  function shopLink(text, cat){ return "<a href='shop.html" + (cat ? "#" + cat : "") + "'>" + text + "</a>"; }
  function fmtTime(t){ var p = t.split(":"); var h = +p[0], m = p[1]; var ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + (m === "00" ? "" : ":" + m) + ap; }
  function toMins(t){ var p = t.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function nowAtGym(){
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: SITE.timezone, weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function(p){ o[p.type] = p.value; });
      var h = parseInt(o.hour, 10); if (h === 24) h = 0;
      return { day: o.weekday.toLowerCase().slice(0,3), mins: h * 60 + parseInt(o.minute, 10) };
    } catch (e) { var d = new Date(); return { day: DAYS[d.getDay()], mins: d.getHours() * 60 + d.getMinutes() }; }
  }
  function sampleNote(p){ return p.sample ? " <em class='chat-sample'>(sample figure on this preview, not the gym's real one)</em>" : ""; }
  function waHandoff(text){
    if (SITE.whatsapp) return "<a href='" + S.wa(text) + "' target='_blank' rel='noopener'>Message the desk on WhatsApp</a>";
    return "message <a href='https://www.instagram.com/skova_fitness/' target='_blank' rel='noopener'>@skova_fitness on Instagram</a>";
  }

  /* ---------- answers ---------- */
  var A = {
    greet: function(){ return "Hi, I am the Skova assistant. I can tell you about opening hours, membership, the four training zones, the timetable and the shop, or book you a free visit. What do you need?"; },
    hours: function(text){
      var h = pick("hours"); if (!h.data) return "I do not have the opening hours on file yet. For today's hours, " + waHandoff("Hi Skova, what are your opening hours today?") + ".";
      var now = nowAtGym(), today = h.data[now.day], lead;
      var asked = null, t = " " + String(text || "").toLowerCase() + " ";
      DAYS.forEach(function(d){ if (t.indexOf(DAY_NAMES[d].toLowerCase()) > -1) asked = d; });
      if (t.indexOf("tomorrow") > -1) asked = DAYS[(DAYS.indexOf(now.day) + 1) % 7];
      if (asked && asked !== now.day) { var x = h.data[asked]; return (x ? "On " + DAY_NAMES[asked] + " we are open " + fmtTime(x[0]) + " to " + fmtTime(x[1]) + "." : "We are closed on " + DAY_NAMES[asked] + ".") + (h.sample ? " <em class='chat-sample'>(sample hours on this preview)</em>" : ""); }
      if (today && now.mins >= toMins(today[0]) && now.mins < toMins(today[1])) lead = "We are <b>open now</b>, until " + fmtTime(today[1]) + ".";
      else if (today && now.mins < toMins(today[0])) lead = "We are closed right now and open today at " + fmtTime(today[0]) + ".";
      else { var nd = null; for (var i = 1; i <= 7; i++) { var d = DAYS[(DAYS.indexOf(now.day) + i) % 7]; if (h.data[d]) { nd = d; break; } } lead = "We are closed right now." + (nd ? " We open " + DAY_NAMES[nd] + " at " + fmtTime(h.data[nd][0]) + "." : ""); }
      var rows = DAYS.map(function(d){ var x = h.data[d]; return DAY_NAMES[d].slice(0,3) + " " + (x ? fmtTime(x[0]) + "–" + fmtTime(x[1]) : "closed"); }).join(" · ");
      return lead + "<br><small>" + rows + "</small>" + (h.sample ? " <em class='chat-sample'>(sample hours on this preview)</em>" : "");
    },
    location: function(){
      if (SITE.address) return "We are at <b>" + esc(SITE.address) + "</b>. <a href='https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Skova Fitness " + SITE.address) + "' target='_blank' rel='noopener'>Open in Google Maps</a>. There is bike parking right out front.";
      return "I do not have the address on file yet. For directions, " + waHandoff("Hi Skova, where are you located?") + ". There is bike parking right out front.";
    },
    price: function(){
      var p = pick("prices"); if (!p.data) return "Rates are set at the desk and change with promotions. For today's rate, " + waHandoff("Hi Skova, what are today's membership rates?") + ". Every plan covers all four zones on both levels.";
      var rows = [1,3,6,12].filter(function(k){ return p.data[k]; }).map(function(k){ return "<b>" + k + " month" + (k > 1 ? "s" : "") + ":</b> " + esc(S.npr(p.data[k])); }).join("<br>");
      return "Every plan covers all four zones on both levels. Longer terms cost less per month." + "<br>" + rows + sampleNote(p) + "<br>See " + link("membership", "membership") + ".";
    },
    trial: function(){ return "Yes. You can book a free visit, walk both levels, try a station and decide afterwards. Want me to book one for you? Just say <b>book a visit</b>."; },
    zones: function(){ return "There are four zones under one roof: <b>weight training</b> on the ground floor, a <b>boxing and combat zone</b>, a <b>calisthenics rig</b> with bars and rings on the turf upstairs, and a <b>cardio deck</b>. Every membership covers all of them. " + link("zones", "See the zones") + "."; },
    weights: function(){ return "The ground floor is the weight-training floor: plate-loaded and pin-loaded machines, racks, benches, cables and a dumbbell wall. " + link("zones", "See the zones") + "."; },
    boxing: function(){ return "There is a dedicated boxing and combat zone for bag work, pads and conditioning rounds. Bring your own hand wraps; ask at the desk about borrowing gloves for your first session. Wraps and gloves are also in the " + shopLink("shop", "gear") + "."; },
    calisthenics: function(){ return "The calisthenics rig is on the upper floor, set on turf: pull-up bars, rings and a dip station, with room for muscle-ups and levers."; },
    cardio: function(){ return "The cardio deck has machines for warm-ups, intervals and recovery days. It is included in every plan."; },
    timetable: function(){
      var t = pick("timetable"); if (!t.data) return "The class timetable is not published yet. For this week's sessions, " + waHandoff("Hi Skova, what sessions are on this week?") + ".";
      var now = nowAtGym(), row = t.data.filter(function(r){ return r.day === now.day; })[0];
      if (!row) return "Nothing is listed for today. See the full " + link("timetable", "timetable") + ".";
      var parts = ["morning","afternoon","evening"].map(function(k){ var s = (row[k] || []).map(function(x){ return esc(x.name) + (x.time ? " " + esc(x.time) : ""); }).join(", "); return s ? "<b>" + k.charAt(0).toUpperCase() + k.slice(1) + ":</b> " + s : ""; }).filter(Boolean).join("<br>");
      return "Today (" + DAY_NAMES[now.day] + "):<br>" + parts + (t.sample ? " <em class='chat-sample'>(sample timetable on this preview)</em>" : "") + "<br>Full week: " + link("timetable", "timetable") + ".";
    },
    coach: function(){ return "Coaches run the inductions, the coached sessions and personal training. Personal training is booked in session packs on top of any plan. Ask at the desk which coach fits your goal, or " + waHandoff("Hi Skova, I would like to ask about personal training.") + "."; },
    beginner: function(){ return "Beginners are welcome. A new membership includes an induction: a walk through every zone and every machine, so your first week is about training, not guessing."; },
    bring: function(){ return "Bring clean indoor training shoes, a towel and a water bottle. For the combat zone, bring hand wraps."; },
    parking: function(){ return "There is space for motorbikes and scooters right in front of the building. Ask at the desk about cars."; },
    freeze: function(){ return "Freezing or transferring a membership depends on the plan you are on. The desk will tell you what applies before you sign."; },
    pay: function(){ return "Plans are paid at the desk. For the payment options this month, " + waHandoff("Hi Skova, what payment options do you accept?") + "."; },
    shop: function(){
      var p = pick("products"); if (!p.data) return "The shop is being stocked. Ask at the desk for what is available today.";
      var cats = { supplements: [], gear: [], merch: [] }; p.data.forEach(function(x){ if (cats[x.cat]) cats[x.cat].push(x.name); });
      return "The shop has " + shopLink("supplements", "supplements") + " (" + esc(cats.supplements.slice(0,3).join(", ")) + "), " + shopLink("gear", "gear") + " (" + esc(cats.gear.slice(0,3).join(", ")) + ") and " + shopLink("merch", "merch") + " (" + esc(cats.merch.slice(0,3).join(", ")) + "). You order on WhatsApp and pick up at the desk." + (p.sample ? " <em class='chat-sample'>(sample catalogue on this preview)</em>" : "");
    },
    product: function(item, p){ return "<b>" + esc(item.name) + "</b> is " + esc(S.npr(item.price)) + ". " + esc(item.blurb) + sampleNote(p) + "<br>" + shopLink("Open it in the shop", item.cat) + "."; },
    contact: function(){ return "The quickest way to reach a person is WhatsApp: " + waHandoff("Hi Skova, I have a question.") + (SITE.phone ? ". You can also call " + esc(SITE.phone) : "") + "."; },
    thanks: function(){ return "Any time. See you on the floor."; },
    bye: function(){ return "Train hard. Come back if you need anything."; },
    human: function(){ return "I am an automated assistant, so for anything I cannot answer, " + waHandoff("Hi Skova, I have a question.") + " and a person at the desk will reply."; },
    fallback: function(){ return "I am not sure about that one. I can help with hours, membership, the zones, today's timetable, the shop or booking a free visit. For anything else, " + waHandoff("Hi Skova, I have a question.") + "."; }
  };

  /* ---------- intent matching ---------- */
  var INTENTS = [
    ["book",        ["book a visit","book a free visit","book visit","book me","book a session","book","booking","reserve","appointment","schedule a visit","sign me up","join now","i want to join","want to join","register","enrol","enroll"]],
    ["trial",       ["trial","free visit","try","look around","tour","demo","visit first","before i pay","free session","free day"]],
    ["hours",       ["hour","open","close","closing","opening","timing","timings","what time","when are you","today open","saturday","sunday","holiday"]],
    ["location",    ["where","address","location","located","direction","map","how to get","find you","near"]],
    ["freeze",      ["freeze","pause","hold","transfer","cancel","refund"]],
    ["pay",         ["pay","payment","esewa","khalti","cash","card","fonepay","bank"]],
    ["price",       ["price","cost","fee","fees","rate","rates","how much","membership","plan","plans","monthly","yearly","annual","package","discount","offer","charges","npr","rs"]],
    ["timetable",   ["timetable","schedule","class","classes","session today","sessions","what is on","whats on","today"]],
    ["boxing",      ["box","boxing","combat","kickbox","mma","punch","bag work","fight","muay"]],
    ["calisthenics",["calisthenic","pull up","pullup","pull-up","rings","muscle up","bodyweight","dip","rig"]],
    ["cardio",      ["cardio","treadmill","running","bike","cycle","rower","rowing"]],
    ["weights",     ["weight","weights","lifting","machines","dumbbell","barbell","squat rack","bench","deadlift","strength"]],
    ["zones",       ["zone","zones","facilities","facility","equipment","what do you have","what do you offer","amenities"]],
    ["coach",       ["coach","trainer","personal training","pt","instructor","one on one"]],
    ["beginner",    ["beginner","new to gym","never been","first time","no experience","start","starting","newbie"]],
    ["bring",       ["bring","wear","shoes","towel","what do i need","carry"]],
    ["parking",     ["park","parking","bike parking","car"]],
    ["shop",        ["shop","store","buy","supplement","supplements","protein","merch","gear","sell","products","order"]],
    ["contact",     ["contact","phone","call","number","whatsapp","email","reach","instagram","tiktok"]],
    ["human",       ["human","person","real person","agent","staff","talk to someone","are you a bot","robot","are you real","ai"]],
    ["thanks",      ["thank","thanks","thx","appreciate","great","cool","nice","ok","okay"]],
    ["bye",         ["bye","goodbye","see you","later"]],
    ["greet",       ["hi","hello","hey","namaste","yo","good morning","good evening","sup"]]
  ];
  function norm(t){ return " " + String(t).toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim() + " "; }
  function classify(text){
    var t = norm(text), best = null, bestScore = 0;
    INTENTS.forEach(function(row, idx){
      var score = 0;
      row[1].forEach(function(k){
        var kk = " " + k;
        if (k.indexOf(" ") > -1 ? t.indexOf(kk) > -1 : (t.indexOf(kk + " ") > -1 || t.indexOf(kk + "s ") > -1 || (k.length > 4 && t.indexOf(kk) > -1))) score += k.indexOf(" ") > -1 ? 3 : (k.length > 4 ? 2 : 1.5);
      });
      score -= idx * 0.001; // earlier intents win ties
      if (score > bestScore) { bestScore = score; best = row[0]; }
    });
    return bestScore >= 1.4 ? best : null;
  }
  function findProduct(text){
    var p = pick("products"); if (!p.data) return null;
    var t = norm(text), hit = null, hitLen = 0;
    p.data.forEach(function(item){
      var words = norm(item.name).trim().split(" ").filter(function(w){ return w.length > 3 && !/^\d/.test(w) && w !== "skova"; });
      words.forEach(function(w){ if (t.indexOf(" " + w) > -1 && w.length > hitLen) { hit = item; hitLen = w.length; } });
    });
    return hit ? { item: hit, p: p } : null;
  }

  /* ---------- booking flow ---------- */
  var flow = null; // { step, name, phone, when }
  function bookingStep(text){
    var v = String(text).trim();
    if (/^(cancel|stop|never mind|nevermind|no)$/i.test(v)) { flow = null; return { html: "No problem, booking cancelled. Anything else?", chips: DEFAULT_CHIPS }; }
    if (flow.step === "name") { if (v.length < 2) return { html: "What name should I put the visit under?" }; flow.name = v; flow.step = "phone"; return { html: "Thanks, " + esc(flow.name.split(" ")[0]) + ". What phone or WhatsApp number can the desk reach you on?" }; }
    if (flow.step === "phone") { var digits = v.replace(/\D/g, ""); if (digits.length < 7) return { html: "That number looks short. Please type it with the area or country code." }; flow.phone = v; flow.step = "when"; return { html: "When would you like to come in?", chips: ["Morning","Afternoon","Evening","Any time"] }; }
    if (flow.step === "when") {
      flow.when = v; var msg = "Hi Skova, I would like to book a free visit.\nName: " + flow.name + "\nPhone: " + flow.phone + "\nBest time: " + flow.when;
      var done = flow; flow = null;
      if (SITE.whatsapp) return { html: "All set. Tap below to send it to the desk and they will confirm a time.<br><a class='chat-cta' href='" + S.wa(msg) + "' target='_blank' rel='noopener'>Send booking on WhatsApp</a>", chips: DEFAULT_CHIPS };
      return { html: "Here is your booking request for <b>" + esc(done.name) + "</b>, " + esc(done.when.toLowerCase()) + ". This preview is not connected to the gym's WhatsApp yet, so nothing was sent. You can also use the " + link("visit", "booking form") + ".", chips: DEFAULT_CHIPS };
    }
  }

  var DEFAULT_CHIPS = ["Opening hours","Membership prices","Book a free visit","What zones do you have?","Shop"];
  function reply(text){
    if (flow) return bookingStep(text);
    var intent = classify(text);
    if (intent === "book") { flow = { step: "name" }; return { html: "Let us book your free visit. It takes three quick questions; type <b>cancel</b> any time. What is your name?" }; }
    var prod = findProduct(text);
    if (prod && (!intent || intent === "shop" || intent === "price")) return { html: A.product(prod.item, prod.p), chips: ["Shop","Membership prices","Book a free visit"] };
    if (intent && A[intent]) {
      var chips = intent === "trial" ? ["Book a free visit","Opening hours"] : intent === "price" ? ["Book a free visit","Can I try first?","Opening hours"] : intent === "greet" ? DEFAULT_CHIPS : ["Book a free visit","Membership prices","Shop"];
      return { html: A[intent](text), chips: chips };
    }
    return { html: A.fallback(), chips: DEFAULT_CHIPS };
  }

  /* ---------- UI ---------- */
  var root, panel, list, input, chipsEl, launcher, opened = false, history = [];
  function save(){ try { sessionStorage.setItem("skova-chat", JSON.stringify(history.slice(-40))); } catch (e) {} }
  function bubble(who, html, skipSave){
    var el = document.createElement("div"); el.className = "chat-msg " + who; el.innerHTML = html; list.appendChild(el); list.scrollTop = list.scrollHeight;
    if (!skipSave) { history.push({ who: who, html: html }); save(); }
    return el;
  }
  function setChips(chips){
    chipsEl.innerHTML = "";
    (chips || []).forEach(function(c){ var b = document.createElement("button"); b.type = "button"; b.className = "chat-chip"; b.textContent = c; b.addEventListener("click", function(){ send(c); }); chipsEl.appendChild(b); });
  }
  function send(text){
    text = String(text || "").trim(); if (!text) return;
    bubble("user", esc(text)); setChips([]); input.value = "";
    var r = reply(text);
    var typing = bubble("bot typing", "<span></span><span></span><span></span>", true);
    setTimeout(function(){ typing.remove(); bubble("bot", r.html); setChips(r.chips); }, S.reduce ? 0 : 450 + Math.min(700, r.html.length * 4));
  }
  function open(){
    if (!opened) {
      opened = true;
      var stored = []; try { stored = JSON.parse(sessionStorage.getItem("skova-chat") || "[]"); } catch (e) {}
      if (stored.length) { history = stored; stored.forEach(function(m){ bubble(m.who, m.html, true); }); setChips(DEFAULT_CHIPS); }
      else { bubble("bot", A.greet()); setChips(DEFAULT_CHIPS); }
    }
    root.classList.add("open"); launcher.setAttribute("aria-expanded", "true"); panel.setAttribute("aria-hidden", "false");
    var tease = root.querySelector(".chat-tease"); if (tease) tease.remove();
    setTimeout(function(){ if (window.matchMedia("(pointer:fine)").matches) input.focus(); }, 300);
  }
  function close(){ root.classList.remove("open"); launcher.setAttribute("aria-expanded", "false"); panel.setAttribute("aria-hidden", "true"); launcher.focus(); }

  function init(){
    root = document.createElement("div"); root.className = "chat";
    root.innerHTML =
      "<button class='chat-launch' type='button' aria-label='Open the Skova assistant' aria-expanded='false' aria-controls='chat-panel'>" +
        "<svg class='ico-open' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'><path d='M4 12a8 8 0 1 1 3.6 6.7L4 20l1.2-3.7A8 8 0 0 1 4 12z'/><path d='M9 11h6M9 14h4'/></svg>" +
        "<svg class='ico-close' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><path d='M3 3l10 10M13 3L3 13'/></svg>" +
      "</button>" +
      "<section class='chat-panel' id='chat-panel' role='dialog' aria-label='Skova assistant' aria-hidden='true'>" +
        "<header class='chat-head'><span class='chat-avatar'><img src='img/logo-avatar.png' alt=''></span>" +
          "<div><b>Skova assistant</b><small>Automated answers · hands off to the desk</small></div>" +
          "<button type='button' class='chat-x' aria-label='Close the assistant'><svg viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><path d='M3 3l10 10M13 3L3 13'/></svg></button></header>" +
        "<div class='chat-list' role='log' aria-live='polite'></div>" +
        "<div class='chat-chips'></div>" +
        "<form class='chat-form' autocomplete='off'><label class='sr' for='chat-input'>Your message</label><input id='chat-input' type='text' placeholder='Ask about hours, prices, zones…' maxlength='300'><button type='submit' aria-label='Send'><svg viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'><path d='M2 8h11M9 4l4 4-4 4'/></svg></button></form>" +
      "</section>";
    document.body.appendChild(root);
    launcher = root.querySelector(".chat-launch"); panel = root.querySelector(".chat-panel"); list = root.querySelector(".chat-list"); input = root.querySelector("#chat-input"); chipsEl = root.querySelector(".chat-chips");
    launcher.addEventListener("click", function(){ root.classList.contains("open") ? close() : open(); });
    root.querySelector(".chat-x").addEventListener("click", close);
    root.querySelector(".chat-form").addEventListener("submit", function(e){ e.preventDefault(); send(input.value); });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape" && root.classList.contains("open")) close(); });
    // one quiet teaser per session
    var seen = false; try { seen = sessionStorage.getItem("skova-chat-tease") === "1"; } catch (e) {}
    if (!seen && !S.reduce) setTimeout(function(){
      if (root.classList.contains("open")) return;
      var t = document.createElement("button"); t.type = "button"; t.className = "chat-tease"; t.textContent = "Questions? Ask me."; t.addEventListener("click", open); root.appendChild(t);
      try { sessionStorage.setItem("skova-chat-tease", "1"); } catch (e) {}
      setTimeout(function(){ if (t.parentNode) t.remove(); }, 9000);
    }, 7000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  return { open: open, close: close, send: send, ask: function(t){ return reply(t).html; }, classify: classify };
})();
