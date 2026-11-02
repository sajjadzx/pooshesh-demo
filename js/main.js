(function () {
  var S = window.SITE || {};
  if (S.demo) document.body.classList.add("is-demo");

  // لوگو
  document.querySelectorAll(".js-logo").forEach(function (i) { i.src = S.logo || "images/logo.svg"; });

  // تلفن و واتساپ
  var tel = S.phone ? "tel:" + S.phone : "#contact";
  document.querySelectorAll(".js-phone-link").forEach(function (a) { a.href = tel; });
  document.querySelectorAll(".js-phone-text").forEach(function (e) { e.textContent = S.phoneDisplay || S.phone; });
  document.querySelectorAll(".js-wa").forEach(function (a) {
    if (S.whatsapp) a.href = "https://wa.me/" + S.whatsapp; else a.style.display = "none";
  });

  // تصویر جا افتاده → پس‌زمینه خنثی (سایت خراب دیده نشود)
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { img.style.visibility = "hidden"; });
  });

  // منوی آبشاری (Dropdown)
  var navItems = document.querySelectorAll(".nav-item.has-dropdown");
  navItems.forEach(function (item) {
    var trigger = item.querySelector(".nav-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasOpen = item.classList.contains("open");
      navItems.forEach(function (other) { other.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item")) {
      navItems.forEach(function (item) { item.classList.remove("open"); });
    }
  });

  // منوی موبایل
  var b = document.querySelector(".burger"), n = document.querySelector(".nav");
  if (b && n) {
    b.addEventListener("click", function () { n.classList.toggle("open"); });
    n.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        n.classList.remove("open");
        navItems.forEach(function (item) { item.classList.remove("open"); });
      }
    });
  }

  // فرم (نمایشی)
  var f = document.getElementById("quote-form"), m = document.getElementById("form-msg");
  if (f) f.addEventListener("submit", function (e) {
    e.preventDefault();
    m.style.display = "block";
    m.textContent = "نسخه نمایشی: فرم فعلاً به هیچ سرور یا شماره‌ای متصل نیست و اطلاعات ارسال نمی‌شود. در نسخه نهایی، درخواست‌ها به ایمیل/واتساپ/پیامک شرکت می‌رسد.";
    m.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
