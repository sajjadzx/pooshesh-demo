// محاسبه‌گر حجم بتن و آنالیز مصالح (BOM) مطابق استاندارد ملی ایران ISIRI 6044
(function () {
  var activeTab = "foundation";

  // مشخصات رده‌های بتن و طرح اختلاط استاندارد در هر متر مکعب
  var mixDesigns = {
    "magar": { name: "بتن مگر (عیار ۱۵۰)", cement: 150, sand: 950, gravel: 1100, wc: 0.60, superplast: 0, silica: 0, cementType: "تیپ ۲" },
    "c20": { name: "C20/25 (عیار ۳۰۰)", cement: 300, sand: 880, gravel: 1020, wc: 0.50, superplast: 2.5, silica: 0, cementType: "تیپ ۲" },
    "c25": { name: "C25/30 (عیار ۳۵۰ - استاندارد سازه)", cement: 350, sand: 840, gravel: 1010, wc: 0.45, superplast: 3.5, silica: 0, cementType: "تیپ ۲" },
    "c30": { name: "C30/37 (عیار ۴۰۰ - ستون و دیوار برشی)", cement: 400, sand: 810, gravel: 990, wc: 0.42, superplast: 4.2, silica: 0, cementType: "تیپ ۲" },
    "c35": { name: "C35/45 (عیار ۴۵۰ - سازه سنگین)", cement: 450, sand: 780, gravel: 970, wc: 0.38, superplast: 5.0, silica: 0, cementType: "تیپ ۲" },
    "waterproof": { name: "بتن آب‌بند مخازن آب و فاضلاب (عیار ۴۰۰ - تیپ ۵)", cement: 400, sand: 820, gravel: 980, wc: 0.38, superplast: 4.5, silica: 32, cementType: "تیپ ۵ ضد سولفات" }
  };

  // مدیریت تب‌ها
  var tabs = document.querySelectorAll(".calc-tab");
  var panels = document.querySelectorAll(".calc-panel");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (btn) { btn.classList.remove("active"); });
      panels.forEach(function (p) { p.classList.remove("active"); });
      t.classList.add("active");
      activeTab = t.getAttribute("data-tab");
      var targetPanel = document.getElementById("panel-" + activeTab);
      if (targetPanel) targetPanel.classList.add("active");
      calculate();
    });
  });

  // المان‌های ورودی
  var form = document.getElementById("concrete-calculator-form");
  if (!form) return;

  var inputs = form.querySelectorAll("input, select");
  inputs.forEach(function (inp) {
    inp.addEventListener("input", calculate);
    inp.addEventListener("change", calculate);
  });

  function getVal(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(el.value);
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function formatNum(n) {
    return Math.round(n).toLocaleString("fa-IR");
  }

  function formatDec(n, d) {
    return Number(n.toFixed(d || 2)).toLocaleString("fa-IR");
  }

  function calculate() {
    var rawVolume = 0;
    var selectedMember = "";

    if (activeTab === "foundation") {
      var fType = document.getElementById("f-type").value;
      if (fType === "strip") {
        // فونداسیون نواری: طول * عرض * ارتفاع
        var l = getVal("f-strip-l");
        var w = getVal("f-strip-w");
        var h = getVal("f-strip-h");
        rawVolume = l * w * h;
        selectedMember = "فونداسیون نواری";
      } else if (fType === "raft") {
        // فونداسیون گسترده / رادیه: طول * عرض * ضخامت
        var rl = getVal("f-raft-l");
        var rw = getVal("f-raft-w");
        var rh = getVal("f-raft-h");
        rawVolume = rl * rw * rh;
        selectedMember = "فونداسیون گسترده (رادیه)";
      } else if (fType === "isolated") {
        // فونداسیون منفرد و شناژ
        var count = getVal("f-iso-count");
        var il = getVal("f-iso-l");
        var iw = getVal("f-iso-w");
        var ih = getVal("f-iso-h");
        var tieL = getVal("f-tie-l");
        var tieW = getVal("f-tie-w");
        var tieH = getVal("f-tie-h");
        rawVolume = (count * il * iw * ih) + (tieL * tieW * tieH);
        selectedMember = "فونداسیون منفرد با شناژ";
      }
    } else if (activeTab === "roof") {
      var rType = document.getElementById("r-type").value;
      var area = getVal("r-area");
      if (rType === "joist") {
        // تیرچه بلوک/یونولیت: به ازای هر متر مربع معمولاً ۰.۱۵ تا ۰.۱۸ متر مکعب
        var jThick = getVal("r-joist-thick") || 0.16;
        rawVolume = area * jThick;
        selectedMember = "سقف تیرچه و بلوک";
      } else if (rType === "slab") {
        // دال بتنی: مساحت * ضخامت
        var sThick = getVal("r-slab-thick");
        rawVolume = area * sThick;
        selectedMember = "سقف دال بتنی";
      } else if (rType === "waffle") {
        // سقف وافل: میانگین ۰.۲۴ متر مکعب به ازای هر متر مربع
        var wFactor = getVal("r-waffle-factor") || 0.24;
        rawVolume = area * wFactor;
        selectedMember = "سقف وافل";
      } else if (rType === "deck") {
        // عرشه فولادی: میانگین ۰.۱۱ متر مکعب به ازای هر متر مربع
        var dFactor = getVal("r-deck-factor") || 0.11;
        rawVolume = area * dFactor;
        selectedMember = "سقف عرشه فولادی";
      }
    } else if (activeTab === "column") {
      var cType = document.getElementById("c-type").value;
      if (cType === "rect") {
        var count = getVal("c-count");
        var cl = getVal("c-l");
        var cw = getVal("c-w");
        var ch = getVal("c-h");
        rawVolume = count * cl * cw * ch;
        selectedMember = "ستون مستطیلی/مربعی";
      } else if (cType === "circle") {
        var countCir = getVal("c-cir-count");
        var dia = getVal("c-cir-dia");
        var chCir = getVal("c-cir-h");
        var radius = dia / 2;
        rawVolume = countCir * Math.PI * radius * radius * chCir;
        selectedMember = "ستون دایره‌ای";
      } else if (cType === "wall") {
        var wCount = getVal("w-count") || 1;
        var wl = getVal("w-l");
        var wt = getVal("w-t");
        var wh = getVal("w-h");
        rawVolume = wCount * wl * wt * wh;
        selectedMember = "دیوار برشی";
      }
    } else if (activeTab === "tank") {
      var tType = document.getElementById("t-type").value;
      if (tType === "rect") {
        // مخزن مکعبی آب و فاضلاب:
        // ابعاد خارجی L, W, H
        var tl = getVal("t-l");
        var tw = getVal("t-w");
        var th = getVal("t-h");
        var tBase = getVal("t-base-t");
        var tWall = getVal("t-wall-t");
        var tRoof = getVal("t-roof-t");

        // حجم بتن = حجم کلی خارجی منهای حجم فضای خالی داخلی
        var inL = Math.max(0, tl - (2 * tWall));
        var inW = Math.max(0, tw - (2 * tWall));
        var inH = Math.max(0, th - tBase - tRoof);
        var totalOuter = tl * tw * th;
        var totalInner = inL * inW * inH;
        rawVolume = Math.max(0, totalOuter - totalInner);
        selectedMember = "مخزن مکعبی آب و فاضلاب";
      } else if (tType === "cylinder") {
        var diaExt = getVal("t-cyl-dia");
        var rExt = diaExt / 2;
        var hExt = getVal("t-cyl-h");
        var cBase = getVal("t-cyl-base");
        var cWall = getVal("t-cyl-wall");
        var cRoof = getVal("t-cyl-roof");

        var rInt = Math.max(0, rExt - cWall);
        var hInt = Math.max(0, hExt - cBase - cRoof);
        var volExt = Math.PI * rExt * rExt * hExt;
        var volInt = Math.PI * rInt * rInt * hInt;
        rawVolume = Math.max(0, volExt - volInt);
        selectedMember = "مخزن استوانه‌ای آب و فاضلاب";
      }
    }

    // ضریب پرت کارگاهی (Wastage)
    var wastagePercent = getVal("calc-wastage") || 5;
    var finalVolume = rawVolume * (1 + (wastagePercent / 100));

    // رده انتخابی و طرح اختلاط
    var gradeKey = document.getElementById("calc-grade").value || "c25";
    if (activeTab === "tank" && gradeKey !== "waterproof") {
      // پیشنهاد خودکار بتن آب‌بند برای مخازن
      var tankNote = document.getElementById("calc-tank-recommendation");
      if (tankNote) tankNote.style.display = "block";
    } else {
      var tankNote = document.getElementById("calc-tank-recommendation");
      if (tankNote) tankNote.style.display = "none";
    }

    var mix = mixDesigns[gradeKey] || mixDesigns["c25"];

    // تعداد سرویس تراک میکسر (میانگین ۷.۵ متر مکعب)
    var mixerLoads = finalVolume > 0 ? Math.ceil(finalVolume / 7.5) : 0;

    // محاسبات BOM مصالح
    var totalCementKg = finalVolume * mix.cement;
    var totalCementBags = totalCementKg / 50;
    var totalCementTon = totalCementKg / 1000;
    var totalSandKg = finalVolume * mix.sand;
    var totalSandTon = totalSandKg / 1000;
    var totalGravelKg = finalVolume * mix.gravel;
    var totalGravelTon = totalGravelKg / 1000;
    var totalWaterLtr = totalCementKg * mix.wc;
    var totalSuperplastKg = finalVolume * mix.superplast;
    var totalSilicaKg = finalVolume * mix.silica;

    // نمایش در خروجی
    document.getElementById("res-raw-vol").textContent = formatDec(rawVolume, 2) + " متر مکعب";
    document.getElementById("res-final-vol").textContent = formatDec(finalVolume, 2) + " متر مکعب";
    document.getElementById("res-mixer-loads").textContent = mixerLoads > 0 ? formatNum(mixerLoads) + " سرویس میکسر" : "۰ سرویس";
    document.getElementById("res-grade-name").textContent = mix.name;

    // مقادیر BOM
    document.getElementById("bom-cement").textContent = formatNum(totalCementKg) + " کیلوگرم (" + formatDec(totalCementTon, 1) + " تن - معادل " + formatNum(totalCementBags) + " پاکت ۵۰kg)";
    document.getElementById("bom-sand").textContent = formatNum(totalSandKg) + " کیلوگرم (" + formatDec(totalSandTon, 1) + " تن)";
    document.getElementById("bom-gravel").textContent = formatNum(totalGravelKg) + " کیلوگرم (" + formatDec(totalGravelTon, 1) + " تن)";
    document.getElementById("bom-water").textContent = formatNum(totalWaterLtr) + " لیتر";
    document.getElementById("bom-superplast").textContent = totalSuperplastKg > 0 ? formatDec(totalSuperplastKg, 1) + " کیلوگرم (پلی‌کربوکسیلات)" : "بدون نیاز / اختیاری";

    var silicaRow = document.getElementById("bom-silica-row");
    if (silicaRow) {
      if (totalSilicaKg > 0) {
        silicaRow.style.display = "table-row";
        document.getElementById("bom-silica").textContent = formatDec(totalSilicaKg, 1) + " کیلوگرم (ژل میکروسیلیس آب‌بند)";
      } else {
        silicaRow.style.display = "none";
      }
    }

    // ذخیره جهت انتقال به فرم سفارش
    var orderBtn = document.getElementById("btn-transfer-order");
    if (orderBtn) {
      orderBtn.onclick = function (e) {
        e.preventDefault();
        var params = new URLSearchParams();
        params.set("volume", Math.ceil(finalVolume));
        params.set("grade", gradeKey);
        params.set("member", selectedMember);
        window.location.href = "order.html?" + params.toString();
      };
    }
  }

  // سوئیچ فرم‌های داخلی تب‌ها
  function setupSubSelectors() {
    var subMap = [
      { selectId: "f-type", groups: ["f-strip-group", "f-raft-group", "f-iso-group"], prefix: "f-" },
      { selectId: "r-type", groups: ["r-joist-group", "r-slab-group", "r-waffle-group", "r-deck-group"], prefix: "r-" },
      { selectId: "c-type", groups: ["c-rect-group", "c-circle-group", "w-wall-group"], prefix: "" },
      { selectId: "t-type", groups: ["t-rect-group", "t-cyl-group"], prefix: "t-" }
    ];

    subMap.forEach(function (item) {
      var sel = document.getElementById(item.selectId);
      if (!sel) return;
      sel.addEventListener("change", function () {
        item.groups.forEach(function (gId) {
          var el = document.getElementById(gId);
          if (el) el.style.display = "none";
        });
        var activeGroup = document.getElementById(item.prefix + sel.value + "-group") || document.getElementById(sel.value + "-group");
        if (activeGroup) activeGroup.style.display = "block";
        calculate();
      });
    });
  }

  setupSubSelectors();
  calculate();
})();
