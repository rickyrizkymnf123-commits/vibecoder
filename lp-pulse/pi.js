(function(){
var PI=window.PI||{};
var cs=document.currentScript;var PI_BASE=(cs&&cs.src&&/\/lp-pulse\//.test(cs.src))?cs.src.replace(/[^\/]*$/,''):'https://cdn.jsdelivr.net/gh/rickyrizkymnf123-commits/vibecoder@44446481db94c9347388c21a1fb089558f598181/lp-pulse/';
var root=document.getElementById('pi-root');
var T="<div id=\"lp-root\" class=\"min-h-screen overflow-x-hidden\">\n\n<!-- Tips Notification -->\n<div id=\"sales-notification\" class=\"glass-strong rounded-xl p-3 md:p-4 gradient-border shadow-2xl\" style=\"max-width:280px\">\n  <div class=\"flex items-center gap-3\">\n    <div id=\"notif-icon\" class=\"w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 text-sm md:text-base\" style=\"background:hsl(var(--h1) 85% 60%/0.2)\">\ud83d\udcca</div>\n    <div>\n      <p class=\"text-xs md:text-sm font-medium\" id=\"notif-title\">Tips Pulse Insight</p>\n      <p class=\"text-[10px] md:text-xs\" style=\"color:hsl(var(--hb) 10% 55%)\" id=\"notif-text\"></p>\n    </div>\n  </div>\n</div>\n\n<!-- ===== HERO ===== -->\n<section class=\"relative min-h-screen flex flex-col items-center justify-center pt-12 pb-0 overflow-hidden bg-gradient-hero\">\n  <div class=\"absolute top-20 left-10 w-72 h-72 rounded-full blur-[120px] animate-float\" style=\"background:hsl(var(--h1) 85% 60%/0.1)\"></div>\n  <div class=\"absolute bottom-40 right-10 w-96 h-96 rounded-full blur-[150px] animate-float\" style=\"background:hsl(var(--h2) 80% 65%/0.1);animation-delay:3s\"></div>\n\n  <div class=\"container relative z-10 text-center px-4\">\n    <div class=\"inline-flex items-center gap-2 glass px-5 py-2 rounded-full mb-8\">\n      <span class=\"text-sm font-medium\" style=\"color:hsl(var(--hb) 10% 55%)\">{{BADGE}}</span>\n    </div>\n\n    <h1 class=\"text-4xl md:text-5xl lg:text-7xl font-heading font-bold leading-tight mb-6 max-w-5xl mx-auto\">\n      {{H1A}} <span id=\"typing-text\" class=\"text-gradient-primary inline-block min-w-[200px] md:min-w-[320px]\">{{W0}}</span>\n      <br>\n      {{H1B}}\n    </h1>\n\n    <p class=\"text-lg md:text-xl max-w-2xl mx-auto mb-10\" style=\"color:hsl(var(--hb) 10% 55%)\">{{SUB}}</p>\n\n    <a href=\"https://foovl.myscalev.com/checkout-flow-baru\">\n      <button class=\"btn-primary glow-primary w-full max-w-sm md:max-w-none md:w-auto\">\n        Lihat Cara Kerjanya \u2014 Gampang Banget \ud83d\udc47\n      </button>\n    </a>\n    <div class=\"flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\">\n      <span>\u2713 Dashboard bahasa Indonesia</span><span>\u2713 Sekali bayar</span><span>\u2713 Setup 5 menit</span>\n    </div>\n    <div class=\"max-w-5xl mx-auto mt-12 rounded-2xl overflow-hidden border glow-primary animate-float\" style=\"border-color:hsl(var(--hb) 20% 18%);background:hsl(var(--hb) 25% 14%)\">\n      <div class=\"flex items-center gap-2 px-4 py-2.5\" style=\"border-bottom:1px solid hsl(var(--hb) 20% 18%)\"><span class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(0 84% 60%)\"></span><span class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(45 90% 55%)\"></span><span class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(145 65% 50%)\"></span><span class=\"text-[11px] font-mono ml-2\" style=\"color:hsl(var(--hb) 10% 55%)\">pulseinsight.my.id/dashboard</span></div>\n      <img class=\"pi-img w-full block\" data-img=\"ringkasan\" alt=\"Dashboard Ringkasan Pulse Insight\" style=\"aspect-ratio:1400/893\">\n    </div>\n\n  <!-- Marquee -->\n  <div class=\"w-full mt-16 py-6 border-y\" style=\"background:hsl(var(--hb) 25% 14%/0.3);border-color:hsl(var(--hb) 20% 18%/0.3)\">\n    <div class=\"space-y-4\">\n      <div class=\"flex overflow-hidden\"><div class=\"flex gap-3 animate-marquee\" id=\"marquee1\"></div></div>\n      <div class=\"flex overflow-hidden\"><div class=\"flex gap-3 animate-marquee-reverse\" id=\"marquee2\"></div></div>\n    </div>\n  </div>\n</section>\n\n<!-- ===== DASHBOARD SIMULATION ===== -->\n<section id=\"dashboard-simulation\" class=\"relative py-16 md:py-20 overflow-hidden\" style=\"background:hsl(var(--hb) 25% 14%/0.3)\">\n  <div class=\"container relative z-10\">\n    <div class=\"text-center mb-10\">\n      <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 leading-tight\">\n        Lihat Cara Kerja <span class=\"text-gradient-primary\">Pulse Insight</span>\n      </h2>\n      <p class=\"text-lg max-w-2xl mx-auto\" style=\"color:hsl(var(--hb) 10% 55%)\">Dari pasang script sampai tau masalah LP kamu \u2014 semua otomatis dengan AI</p>\n    </div>\n\n    <div class=\"max-w-3xl mx-auto\">\n      <div class=\"rounded-2xl overflow-hidden border glow-primary\" id=\"sim-container\" style=\"border-color:hsl(var(--hb) 20% 18%);background:hsl(var(--hb) 25% 14%);cursor:pointer\">\n        <div class=\"flex items-center justify-between px-4 py-2\" style=\"border-bottom:1px solid hsl(var(--hb) 20% 18%);background:hsl(var(--hb) 20% 15%/0.5)\">\n          <div class=\"flex items-center gap-2\">\n            <div class=\"flex gap-1.5\">\n              <div class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(0 84% 60%/0.6)\"></div>\n              <div class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(45 90% 55%/0.6)\"></div>\n              <div class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(145 65% 50%/0.6)\"></div>\n            </div>\n            <span class=\"text-[10px] font-mono ml-2\" id=\"sim-url\" style=\"color:hsl(var(--hb) 10% 55%)\">app.pulseinsight.id/dashboard</span>\n          </div>\n          <span class=\"text-[10px]\" id=\"sim-status\" style=\"color:hsl(var(--hb) 10% 55%)\">\u25b6 Simulasi</span>\n        </div>\n        <div class=\"px-4 py-2 flex items-center justify-between\" style=\"border-bottom:1px solid hsl(var(--hb) 20% 18%)\">\n          <div class=\"flex items-center gap-2\">\n            <div class=\"w-7 h-7 rounded-lg flex items-center justify-center\" style=\"background:hsl(var(--h1) 85% 60%)\"><span class=\"text-white text-xs\">\ud83d\udcca</span></div>\n            <h3 class=\"text-xs font-bold\">Pulse <span style=\"color:hsl(var(--h1) 85% 60%)\">Insight</span></h3>\n          </div>\n          <div class=\"flex items-center gap-1\">\n            <div class=\"w-6 h-6 rounded-md flex items-center justify-center\" style=\"background:hsl(var(--hb) 20% 15%/0.5)\"><span class=\"text-[10px]\" style=\"color:hsl(var(--hb) 10% 55%)\">\ud83d\udd14</span></div>\n            <div class=\"w-6 h-6 rounded-md flex items-center justify-center\" style=\"background:hsl(var(--hb) 20% 15%/0.5)\"><span class=\"text-[10px]\" style=\"color:hsl(var(--hb) 10% 55%)\">\u2600\ufe0f</span></div>\n          </div>\n        </div>\n        <div class=\"px-4 pt-2\">\n          <div class=\"flex gap-1 pb-0\" style=\"border-bottom:1px solid hsl(var(--hb) 20% 18%)\">\n            <div class=\"flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold -mb-px\" style=\"border-bottom:2px solid hsl(var(--h1) 85% 60%);color:hsl(var(--h1) 85% 60%)\">\ud83d\udcca Dashboard</div>\n          </div>\n        </div>\n        <div id=\"sim-screen\" class=\"min-h-[340px]\" style=\"transition:opacity 0.3s\"></div>\n        <div class=\"flex items-center justify-center gap-1.5 py-3\" id=\"sim-dots\" style=\"border-top:1px solid hsl(var(--hb) 20% 18%);background:hsl(var(--hb) 20% 15%/0.3)\"></div>\n      </div>\n      <p class=\"text-center text-xs mt-3\" id=\"sim-label\" style=\"color:hsl(var(--hb) 10% 55%)\"></p>\n      <div class=\"mt-3 flex items-center justify-center gap-2 flex-wrap\">\n        <button id=\"sim-jump-heatmap\" type=\"button\" class=\"px-3 py-1.5 rounded-lg text-[11px] font-semibold border\" style=\"border-color:hsl(var(--h1) 85% 60% / 0.35);background:hsl(var(--h1) 85% 60% / 0.1);color:hsl(var(--h1) 85% 60%)\">Lompat ke Heatmap</button>\n        <button id=\"sim-jump-replay\" type=\"button\" class=\"px-3 py-1.5 rounded-lg text-[11px] font-semibold border\" style=\"border-color:hsl(var(--h1) 85% 60% / 0.35);background:hsl(var(--h1) 85% 60% / 0.1);color:hsl(var(--h1) 85% 60%)\">Lompat ke Rekaman</button>\n        <button id=\"sim-restart\" type=\"button\" class=\"px-3 py-1.5 rounded-lg text-[11px] font-semibold border\" style=\"border-color:hsl(var(--hb) 20% 18%);background:hsl(var(--hb) 20% 15% / 0.6);color:hsl(var(--hb) 10% 70%)\">Ulang dari awal</button>\n      </div>\n    </div>\n  </div>\n</section>\n\n<!-- ===== DASHBOARD ASLI ===== -->\n<section class=\"relative py-20 md:py-28 overflow-hidden bg-gradient-section\" id=\"dashboard-asli\">\n  <div class=\"container relative z-10 px-4\">\n    <div class=\"text-center mb-4\">\n      <span class=\"text-sm font-semibold uppercase tracking-wider\" style=\"color:hsl(var(--h1) 85% 60%)\">\ud83d\udc40 Bukan Mockup</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-4 leading-tight\">Ini Tampilan <span class=\"text-gradient-primary\">Dashboard Aslinya</span></h2>\n    <p class=\"text-center max-w-2xl mx-auto mb-10\" style=\"color:hsl(var(--hb) 10% 55%)\">Screenshot langsung dari Pulse Insight yang lagi melacak landing page beneran. Klik tab buat lihat tiap fitur.</p>\n    <div class=\"max-w-5xl mx-auto\">\n      <div class=\"flex gap-2 overflow-x-auto pb-3 mb-4 justify-start md:justify-center\" id=\"gal-tabs\" style=\"scrollbar-width:none\"></div>\n      <div class=\"rounded-2xl overflow-hidden border glow-primary\" style=\"border-color:hsl(var(--hb) 20% 18%);background:hsl(var(--hb) 25% 14%)\">\n        <div class=\"flex items-center gap-2 px-4 py-2.5\" style=\"border-bottom:1px solid hsl(var(--hb) 20% 18%)\">\n          <span class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(0 84% 60%)\"></span><span class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(45 90% 55%)\"></span><span class=\"w-2.5 h-2.5 rounded-full\" style=\"background:hsl(145 65% 50%)\"></span>\n          <span class=\"text-[11px] font-mono ml-2\" style=\"color:hsl(var(--hb) 10% 55%)\" id=\"gal-url\">pulseinsight.my.id/dashboard</span>\n        </div>\n        <img id=\"gal-img\" alt=\"\" class=\"w-full block\" style=\"aspect-ratio:1400/885;object-fit:cover;object-position:top;transition:opacity .25s\" >\n      </div>\n      <p class=\"text-center text-sm mt-4\" id=\"gal-cap\" style=\"color:hsl(var(--hb) 10% 70%)\"></p>\n    </div>\n  </div>\n</section>\n\n<!-- ===== PROBLEM ===== -->\n<section class=\"relative py-20 md:py-28 overflow-hidden\" id=\"problem\">\n  <div class=\"container relative z-10\">\n    <div class=\"flex justify-center mb-6\">\n      <span class=\"glass px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase\" style=\"color:hsl(var(--h1) 85% 60%)\">\u26a0\ufe0f Masalah Nyata</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight\">\ud83d\ude31 Pernah Ngalamin Ini? Pasti Frustasi...</h2>\n    <div class=\"max-w-2xl mx-auto glass rounded-2xl p-8 gradient-border\">\n      <p class=\"mb-4\" style=\"color:hsl(var(--hb) 10% 55%)\">Lo udah spend jutaan buat ads, tapi <strong style=\"color:hsl(0 0% 95%)\">gak tau kenapa landing page gak convert</strong>.</p>\n      <p class=\"mb-6\" style=\"color:hsl(var(--hb) 10% 55%)\">Traffic masuk banyak, tapi <strong style=\"color:hsl(0 0% 95%)\">conversion rate tetap jeblok \u2014 dan gak tau harus fix apa.</strong></p>\n      <ul class=\"space-y-3 mb-6\">\n        <li class=\"flex items-start gap-3\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u26a0</span> Google Analytics cuma kasih angka, gak kasih tau masalahnya di mana.</li>\n        <li class=\"flex items-start gap-3\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u26a0</span> Tools luar harga ratusan ribu per bulan, ribet setupnya.</li>\n        <li class=\"flex items-start gap-3\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u26a0</span> A/B testing tanpa data = tebak-tebakan buta.</li>\n      </ul>\n      <div class=\"flex items-center gap-3 p-4 rounded-xl\" style=\"background:hsl(0 84% 60%/0.1);border:1px solid hsl(0 84% 60%/0.2)\">\n        <span style=\"color:hsl(0 84% 60%)\">\u23f3</span>\n        <p class=\"text-sm\">Setiap hari LP lo gak optimal = duit ads yang kebuang sia-sia dan potential revenue yang hilang.</p>\n      </div>\n    </div>\n  </div>\n</section>\n\n<!-- ===== SOLUTION ===== -->\n<section class=\"relative py-16 md:py-20 overflow-hidden bg-gradient-section\" id=\"solution\">\n  <div class=\"container relative z-10 text-center\">\n    <div class=\"flex justify-center mb-6\">\n      <span class=\"glass px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase\" style=\"color:hsl(var(--h1) 85% 60%)\">\ud83d\ude80 Solusi Lo Ada Di Sini</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight\">Ini Dia, <span class=\"text-gradient-primary\">Pulse Insight</span></h2>\n    <p class=\"text-center text-lg max-w-2xl mx-auto\" style=\"color:hsl(var(--hb) 10% 55%)\">Platform analitik AI yang menunjukkan <strong style=\"color:hsl(0 0% 95%)\">persis di mana pengunjung klik, scroll, dan berhenti</strong> \u2014 tanpa coding, langsung actionable.</p>\n  </div>\n</section>\n\n<!-- ===== FEATURES ===== -->\n<section class=\"relative py-20 md:py-28 overflow-hidden\" id=\"features\">\n  <div class=\"container relative z-10\">\n    <div class=\"flex justify-center mb-6\">\n      <span class=\"glass px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase\" style=\"color:hsl(var(--h1) 85% 60%)\">\ud83c\udfaf Fitur Unggulan</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight\">Semua yang Kamu Butuhkan untuk <span class=\"text-gradient-primary\">Optimasi LP</span> \ud83d\udd25</h2>\n    <p class=\"text-center text-lg max-w-2xl mx-auto mb-12\" style=\"color:hsl(var(--hb) 10% 55%)\">Dari tracking klik hingga AI insight, semua otomatis. <strong style=\"color:hsl(0 0% 95%)\">Kamu hanya perlu pasang script dan lihat data.</strong></p>\n    <div class=\"space-y-10 max-w-5xl mx-auto\" id=\"features-container\"></div>\n  </div>\n</section>\n\n<!-- ===== STEPS ===== -->\n<section class=\"relative py-20 md:py-28 overflow-hidden bg-gradient-section\" id=\"steps\">\n  <div class=\"container relative z-10\">\n    <div class=\"flex justify-center mb-6\">\n      <span class=\"glass px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase\" style=\"color:hsl(var(--h1) 85% 60%)\">\u26a1 5 Langkah Mudah</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight\">Setup 5 Menit, Langsung Lihat Data \ud83e\udd2b</h2>\n    <p class=\"text-center text-lg max-w-2xl mx-auto mb-12\" style=\"color:hsl(var(--hb) 10% 55%)\">Serius, cuma ikutin 5 langkah \u2192 data langsung masuk \u2192 AI kasih insight.</p>\n    <div class=\"max-w-3xl mx-auto relative\" id=\"steps-container\">\n      <div class=\"absolute left-[19px] md:left-[24px] top-0 bottom-0 w-[2px] z-0 rounded-full\" style=\"background:hsl(var(--hb) 20% 18%/0.2)\">\n        <div class=\"step-line-fill w-full rounded-full\" style=\"background:linear-gradient(to bottom, hsl(var(--h1) 85% 60%), hsl(var(--h2) 80% 65%), hsl(var(--h1) 85% 60%))\"></div>\n      </div>\n      <div class=\"space-y-5 md:space-y-6 relative z-10\" id=\"steps-list\"></div>\n    </div>\n  </div>\n</section>\n\n<!-- ===== COMPARISON ===== -->\n<section class=\"relative py-20 md:py-28 overflow-hidden\" id=\"comparison\">\n  <div class=\"container relative z-10\">\n    <div class=\"flex justify-center mb-6\">\n      <span class=\"glass px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase\" style=\"color:hsl(var(--h1) 85% 60%)\">\ud83d\udca1 Bandingkan Sendiri</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight\">Lo Mau Tebak-Tebakan? Atau Pakai Data? \ud83e\udde0</h2>\n    <p class=\"text-center text-lg max-w-2xl mx-auto mb-12\" style=\"color:hsl(var(--hb) 10% 55%)\">Bandingkan sendiri mana yang paling hemat waktu, biaya, dan tenaga.</p>\n    <div id=\"comparison-grid\" class=\"space-y-4 max-w-3xl mx-auto\">\n      <div class=\"glass rounded-2xl p-6\">\n        <h3 class=\"font-heading font-bold text-lg mb-4\">\u274c Tools Luar (Hotjar, dll)</h3>\n        <ul class=\"space-y-3\">\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Harga mulai $39-99/bulan (600rb-1.5jt/bulan)</li>\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Dashboard berbahasa Inggris, susah dipahami tim lokal</li>\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Data cuma angka, gak kasih rekomendasi actionable</li>\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Limit sesi recording per bulan</li>\n        </ul>\n      </div>\n      <div class=\"glass rounded-2xl p-6\">\n        <h3 class=\"font-heading font-bold text-lg mb-4\">\u274c Google Analytics Doang</h3>\n        <ul class=\"space-y-3\">\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Cuma kasih bounce rate & traffic, gak visual</li>\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Gak bisa lihat di mana orang klik di halaman</li>\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Gak ada rekaman sesi pengunjung</li>\n          <li class=\"flex items-start gap-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\"><span style=\"color:hsl(0 84% 60%)\">\u2715</span> Setup event tracking ribet dan butuh developer</li>\n        </ul>\n      </div>\n      <div class=\"glass rounded-2xl p-6 gradient-border glow-primary relative\">\n        <div class=\"absolute -top-3 left-1/2 -translate-x-1/2\">\n          <span class=\"px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1\" style=\"background:hsl(var(--h1) 85% 60%);color:white\">\ud83c\udfc6 PILIHAN TERBAIK</span>\n        </div>\n        <h3 class=\"font-heading font-bold text-lg mb-4 text-gradient-primary\">\ud83c\udfc6 Pulse Insight</h3>\n        <ul class=\"space-y-3\">\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> Heatmap klik, scroll, dan area dalam satu dashboard</li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> Rekaman sesi pengunjung secara real-time</li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> AI Sinyal: deteksi rage click, dead click, quick back otomatis</li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> Dashboard bahasa Indonesia, mudah dipahami</li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> Analisis section per bagian LP</li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> Bayar sekali, akses selamanya + update gratis</li>\n        </ul>\n      </div>\n    </div>\n  </div>\n</section>\n\n<!-- ===== PRICING ===== -->\n<section class=\"relative py-20 md:py-28 overflow-hidden bg-gradient-section\" id=\"pricing\">\n  <div class=\"container relative z-10\">\n    <div class=\"flex justify-center mb-6\">\n      <span class=\"glass px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase\" style=\"color:hsl(var(--h1) 85% 60%)\">\ud83d\udd25 Penawaran Terbatas</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight\">Sekali Bayar, Data LP Lo Ngalir Selamanya \ud83d\udcb0</h2>\n    <p class=\"text-center text-lg max-w-2xl mx-auto mb-12\" style=\"color:hsl(var(--hb) 10% 55%)\">Lebih murah dari satu bulan Hotjar. Serius ini gak masuk akal murahnya.</p>\n\n    <div class=\"flex items-center justify-center gap-2 md:gap-3 mb-6\">\n      <span class=\"text-xs md:text-sm font-medium\" style=\"color:hsl(var(--hb) 10% 55%)\">\u23f0 Promo berakhir dalam:</span>\n      <div class=\"flex gap-1.5 md:gap-2\">\n        <div class=\"glass rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 text-center min-w-[40px] md:min-w-[48px]\">\n          <div class=\"text-base md:text-xl font-heading font-bold text-gradient-primary\" id=\"cd-min\">10</div>\n          <div class=\"text-[10px] md:text-xs\" style=\"color:hsl(var(--hb) 10% 55%)\">Mnt</div>\n        </div>\n        <div class=\"glass rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 text-center min-w-[40px] md:min-w-[48px]\">\n          <div class=\"text-base md:text-xl font-heading font-bold text-gradient-primary\" id=\"cd-sec\">00</div>\n          <div class=\"text-[10px] md:text-xs\" style=\"color:hsl(var(--hb) 10% 55%)\">Dtk</div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"max-w-lg mx-auto glass rounded-3xl p-8 md:p-10 gradient-border glow-primary relative\">\n      <div class=\"absolute -top-4 left-1/2 -translate-x-1/2\">\n        <span class=\"px-6 py-2 rounded-full text-sm font-bold animate-pulse-glow\" style=\"background:hsl(var(--h1) 85% 60%);color:white\">BEST DEAL \ud83c\udfc6</span>\n      </div>\n      <div class=\"text-center mb-8\">\n        <h3 class=\"font-heading text-2xl font-bold mb-3\">Pulse Insight Lifetime</h3>\n        <p class=\"text-sm mb-1\" style=\"color:hsl(var(--hb) 10% 55%)\">Dari Harga</p>\n        <div class=\"flex items-center justify-center gap-3 mb-1\">\n          <span class=\"text-2xl line-through\" style=\"color:hsl(var(--hb) 10% 55%)\">Rp 997.000</span>\n          <span class=\"text-sm font-bold px-3 py-1 rounded-full\" style=\"background:hsl(145 65% 50%/0.2);color:hsl(145 65% 50%)\">Hemat 84%</span>\n        </div>\n        <p class=\"text-sm mt-3 mb-0\" style=\"color:hsl(var(--hb) 10% 55%)\">Jadi</p>\n        <div class=\"text-3xl md:text-4xl font-heading font-bold mb-3\" style=\"color:hsl(0 0% 95%)\"><span class=\"line-through\">Rp 497.000</span></div>\n        <div class=\"p-3 rounded-xl mb-3\" style=\"background:hsl(var(--h1) 85% 60%/0.05);border:1px solid hsl(var(--h1) 85% 60%/0.2)\">\n          <p class=\"text-sm mb-1\" style=\"color:hsl(var(--hb) 10% 55%)\">Pakai Kode Voucher</p>\n          <span class=\"inline-block font-heading font-bold text-lg px-4 py-1 rounded-lg tracking-wider\" style=\"background:hsl(var(--h1) 85% 60%/0.2);color:hsl(var(--h1) 85% 60%)\">\"PULSEINSIGHT\"</span>\n          <p class=\"text-sm mt-2\" style=\"color:hsl(var(--hb) 10% 55%)\">Ada Potongan Harga Jadi</p>\n        </div>\n        <div class=\"text-5xl md:text-6xl font-heading font-bold text-gradient-primary\">Rp 159.000</div>\n        <p class=\"text-sm mt-2\" style=\"color:hsl(var(--hb) 10% 55%)\">Hemat <span class=\"line-through\" style=\"color:hsl(0 84% 60%/0.7)\">Rp 838.000</span> \u00b7 Akses selamanya \u00b7 Unlimited tracking</p>\n      </div>\n      <div class=\"mb-6\">\n        <h4 class=\"font-heading font-bold text-sm mb-3 uppercase tracking-wider\" style=\"color:hsl(var(--hb) 10% 55%)\">\ud83c\udf81 Yang Lo Dapet:</h4>\n        <ul class=\"space-y-2.5\">\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Heatmap Klik, Scroll, dan Area dalam satu dashboard.</span></li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Rekaman Sesi: Putar ulang setiap kunjungan pengunjung.</span></li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">AI Sinyal: Deteksi rage click, dead click, quick back otomatis.</span></li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Analisis Section: Breakdown performa per bagian LP.</span></li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(145 65% 50%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Traffic Source: Tau dari mana pengunjung terbaik datang.</span></li>\n        </ul>\n      </div>\n      <div class=\"mb-8 p-4 rounded-xl\" style=\"background:hsl(45 90% 55%/0.05);border:1px solid hsl(45 90% 55%/0.2)\">\n        <h4 class=\"font-heading font-bold text-sm mb-3\" style=\"color:hsl(45 90% 55%)\">\u2728 Bonus Spesial:</h4>\n        <ul class=\"space-y-2\">\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(45 90% 55%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Grup WA VIP Eksklusif</span></li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(45 90% 55%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Video Tutorial Lengkap</span></li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(45 90% 55%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Panduan Optimasi LP dari Data</span></li>\n          <li class=\"flex items-start gap-2 text-sm\"><span style=\"color:hsl(45 90% 55%)\">\u2713</span> <span style=\"color:hsl(var(--hb) 10% 55%)\">Update & Fitur Baru Gratis Selamanya</span></li>\n        </ul>\n      </div>\n      <a id=\"cta-secondary-link\" href=\"https://foovl.myscalev.com/checkout-flow-baru\" class=\"block w-full\" style=\"text-decoration:none\"><button class=\"btn-primary glow-primary w-full justify-center\">\u26a1 AMANKAN AKSES SEKARANG</button></a>\n      <div class=\"flex items-center justify-center gap-2 mt-4 text-xs\" style=\"color:hsl(var(--hb) 10% 55%)\">\ud83d\udd12 Transaksi 100% Aman & Terenkripsi</div>\n    </div>\n  </div>\n</section>\n\n<!-- ===== FAQ ===== -->\n<section class=\"relative py-20 md:py-28 overflow-hidden\" id=\"faq\">\n  <div class=\"container relative z-10\">\n    <div class=\"flex justify-center mb-6\">\n      <span class=\"glass px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase\" style=\"color:hsl(var(--h1) 85% 60%)\">Q&A</span>\n    </div>\n    <h2 class=\"text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight\">\u2753 Masih Ada Keraguan? Baca Ini Dulu</h2>\n    <div class=\"max-w-2xl mx-auto space-y-3\" id=\"faq-container\"></div>\n  </div>\n</section>\n\n<!-- ===== FINAL CTA ===== -->\n<section class=\"relative py-24 overflow-hidden\">\n  <div class=\"absolute inset-0 bg-gradient-hero\"></div>\n  <div class=\"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]\" style=\"background:hsl(var(--h1) 85% 60%/0.15)\"></div>\n  <div class=\"container relative z-10 text-center\">\n    <h2 class=\"text-3xl md:text-5xl font-heading font-bold mb-6 leading-tight max-w-3xl mx-auto\">\ud83d\udd25 Coba Bayangin Ini...</h2>\n    <p class=\"text-lg max-w-2xl mx-auto mb-4\" style=\"color:hsl(var(--hb) 10% 55%)\">Malam ini, lo pasang script di LP. <strong style=\"color:hsl(0 0% 95%)\">Besok pagi data udah masuk</strong>, lo bisa lihat persis <strong style=\"color:hsl(0 0% 95%)\">di mana orang stuck dan gak klik</strong>.</p>\n    <p class=\"text-xl font-heading font-bold text-gradient-primary mb-10\">Besok siang, LP lo udah di-fix berdasarkan data nyata.</p>\n    <div class=\"grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-12\">\n      <div class=\"glass rounded-2xl p-6 text-left\">\n        <h3 class=\"font-heading font-bold mb-3\" style=\"color:hsl(0 84% 60%)\">\u274c Cara Lama</h3>\n        <ul class=\"space-y-2 text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\">\n          <li>\u2022 Tebak-tebakan kenapa LP gak convert</li>\n          <li>\u2022 Bayar tools luar ratusan ribu per bulan</li>\n          <li>\u2022 Duit ads kebuang tanpa tau masalahnya</li>\n        </ul>\n      </div>\n      <div class=\"glass rounded-2xl p-6 text-left gradient-border glow-sm\">\n        <h3 class=\"font-heading font-bold text-gradient-primary mb-3\">\u26a1 Cara Lo Sekarang</h3>\n        <ul class=\"space-y-2 text-sm\">\n          <li>\u2022 Lihat heatmap & rekaman, langsung tau masalah</li>\n          <li>\u2022 AI kasih rekomendasi fix yang actionable</li>\n          <li>\u2022 Unlimited tracking, bayar sekali selamanya</li>\n        </ul>\n      </div>\n    </div>\n    <p class=\"mb-8 max-w-xl mx-auto\" style=\"color:hsl(var(--hb) 10% 55%)\">\ud83d\udc8e <strong style=\"color:hsl(0 0% 95%)\">Ini Bukan Pengeluaran \u2014 Ini Investasi.</strong> Satu kali bayar hari ini = data pengunjung yang bisa lo pakai selamanya.</p>\n    <a id=\"cta-final-link\" href=\"https://foovl.myscalev.com/checkout-flow-baru\" class=\"block w-full max-w-sm md:max-w-none md:w-auto mx-auto\" style=\"text-decoration:none\">\n      <button class=\"btn-primary glow-primary w-full md:w-auto\">\ud83d\udcca MULAI TRACKING SEKARANG \u2192</button>\n    </a>\n    <p class=\"text-sm mt-6\" style=\"color:hsl(var(--hb) 10% 55%)\">Setiap hari tanpa data = duit ads yang terbuang sia-sia \ud83d\ude80</p>\n  </div>\n</section>\n\n<!-- ===== FOOTER ===== -->\n<footer class=\"py-8\" style=\"border-top:1px solid hsl(var(--hb) 20% 18%/0.3)\">\n  <div class=\"container text-center\">\n    <p class=\"text-sm\" style=\"color:hsl(var(--hb) 10% 55%)\">\u00a9 2026 Pulse Insight. All rights reserved.</p>\n  </div>\n</footer>\n</div>\n";
function esc(s){return String(s);}
T=T.replace('{{H1A}}',PI.h1a).replace('{{H1B}}',PI.h1b).replace('{{W0}}',PI.words[0]).replace('{{SUB}}',PI.sub).replace('{{BADGE}}',PI.badge);
if(PI.cta){T=T.split('https://foovl.myscalev.com/checkout-flow-baru').join(PI.cta);}
root.innerHTML=T;
window.toggleFaq=function(i){toggleFaq(i)};
// === Typing Text ===
(function(){
  var words=PI.words;
  var wi=0,ci=0,del=false;
  var el=document.getElementById('typing-text');
  function tick(){
    var w=words[wi];
    if(!del){ci++;if(ci>w.length){setTimeout(function(){del=true;tick()},1800);return;}}
    else{ci--;if(ci<0){ci=0;del=false;wi=(wi+1)%words.length;}}
    el.innerHTML=w.slice(0,ci)+'<span style="display:inline-block;width:3px;height:0.8em;background:hsl(var(--h1) 85% 60%);margin-left:4px;vertical-align:middle;border-radius:9999px;animation:blink 1s infinite"></span>';
    setTimeout(tick,del?40:80);
  }
  setTimeout(tick,2000);
})();

// === Countdown ===
(function(){
  var s=600;
  setInterval(function(){
    s=s<=0?600:s-1;
    document.getElementById('cd-min').textContent=String(Math.floor(s/60)).padStart(2,'0');
    document.getElementById('cd-sec').textContent=String(s%60).padStart(2,'0');
  },1000);
})();

// === Tips Notification ===
(function(){
  var tips=[["🔥","Heatmap klik","Lihat elemen mana yang paling sering diklik pengunjung."],["📹","Rekaman sesi","Putar ulang kunjungan: gerakan mouse, klik, dan scroll."],["🧠","Sinyal masalah","Rage click, dead click & quick back terdeteksi otomatis."],["📉","Funnel konversi","Tau di tahap mana pengunjung paling banyak hilang."],["🔗","Sumber traffic","Bandingkan kualitas pengunjung dari tiap sumber."]];
  var el=document.getElementById('sales-notification'),i=0;
  function show(){var t=tips[i++%tips.length];document.getElementById('notif-icon').textContent=t[0];document.getElementById('notif-title').textContent=t[1];document.getElementById('notif-text').textContent=t[2];el.classList.add('show');setTimeout(function(){el.classList.remove('show')},4000);}
  setTimeout(show,5000);setInterval(show,12000);
})();

// === Static images ===
document.querySelectorAll('.pi-img').forEach(function(im){im.src=PI_BASE+'img/'+im.getAttribute('data-img')+'.webp';});

// === Gallery ===
(function(){
  var G=[["ringkasan","📊 Ringkasan","Ringkasan: pengunjung, sesi, durasi, bounce rate, scroll depth & funnel dalam satu layar.","dashboard"],["heatmap","🔥 Heatmap","Heatmap: lihat langsung di LP-mu elemen mana yang paling banyak diklik.","dashboard/heatmap"],["rekaman","📹 Rekaman Sesi","Rekaman Sesi: putar ulang kunjungan per pengunjung, lengkap dengan device & sumbernya.","dashboard/recordings"],["section","📐 Analisis Section","Analisis Section: persen dilihat, jumlah klik & tingkat keluar tiap bagian LP.","dashboard/sections"],["funnel","📉 Funnel","Funnel Konversi: dari landing, scroll, klik CTA, sampai checkout.","dashboard/funnel"],["sinyal","⚠️ Sinyal Masalah","Sinyal Masalah: rage click, dead click, quick back & scroll berhenti.","dashboard/signals"],["traffic","🔗 Sumber Traffic","Sumber Traffic: bandingkan scroll, durasi & klik CTA per sumber.","dashboard/traffic"]];
  var tabs=document.getElementById('gal-tabs'),img=document.getElementById('gal-img'),cap=document.getElementById('gal-cap'),url=document.getElementById('gal-url');if(!tabs) return;
  var cur=0,auto=true;
  function set(i){cur=i;img.style.opacity=0;setTimeout(function(){img.src=PI_BASE+'img/'+G[i][0]+'.webp';img.alt=G[i][1];img.style.opacity=1;},150);cap.textContent=G[i][2];url.textContent='pulseinsight.my.id/'+G[i][3];
    Array.prototype.forEach.call(tabs.children,function(b,j){b.style.background=j===i?'hsl(var(--h1) 85% 60%)':'hsl(var(--hb) 25% 14%)';b.style.color=j===i?'var(--bt,#fff)':'hsl(var(--hb) 10% 70%)';});}
  G.forEach(function(g,i){var b=document.createElement('button');b.type='button';b.className='shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-semibold border';b.style.borderColor='hsl(var(--hb) 20% 18%)';b.textContent=g[1];b.onclick=function(){auto=false;set(i);};tabs.appendChild(b);});
  set(0);setInterval(function(){if(auto)set((cur+1)%G.length);},5000);
})();

// === Marquee ===
(function(){
  var r1=["🔥 Heatmap Klik & Scroll","📹 Rekaman Sesi Real-time","🧠 AI Sinyal Otomatis","📊 Analisis Section","✅ Setup 5 Menit","💰 Bayar Sekali Selamanya","📱 Mobile & Desktop","🎯 Rage Click Detection"];
  var r2=["🔍 Dead Click Finder","📈 Conversion Optimizer","🗂️ Multi Project","⚡ Real-time Data","🛡️ Privacy First","🇮🇩 Dashboard Indonesia","💎 Lifetime Access","🔗 Traffic Source Tracking"];
  function fill(id,items){
    var c=document.getElementById(id);if(!c) return;c.innerHTML='';
    items.concat(items).forEach(function(t){var s=document.createElement('span');s.className='glass-strong px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap';s.textContent=t;c.appendChild(s);});
  }
  fill('marquee1',r1);fill('marquee2',r2);
})();

// === Features ===
(function(){
  var groups=[
    {emoji:"📊",title:"Heatmap & Visual Analytics",items:[
      {icon:"🔥",title:"Click Heatmap",desc:"Lihat persis di mana pengunjung paling sering klik. Identifikasi area yang menarik dan yang diabaikan."},
      {icon:"📜",title:"Scroll Heatmap",desc:"Tau sampai mana pengunjung scroll. Deteksi di mana mereka berhenti dan konten apa yang di-skip."},
      {icon:"🎯",title:"Area Heatmap",desc:"Analisis engagement per area halaman. Lihat zona panas dan zona dingin dalam satu pandangan."},
      {icon:"👆",title:"Touch Heatmap",desc:"Khusus mobile — lihat di mana pengguna tap dan interaksi di layar sentuh."},
      {icon:"📐",title:"Section Analysis",desc:"Breakdown performa per section LP: view rate, click rate, dan scroll stop."},
      {icon:"📱",title:"Device Comparison",desc:"Bandingkan perilaku Desktop vs Mobile vs Tablet secara visual."},
    ]},
    {emoji:"🧠",title:"AI & Insight Engine",items:[
      {icon:"📹",title:"Session Recording",desc:"Putar ulang setiap kunjungan. Lihat gerakan mouse, klik, scroll, dan navigasi secara real-time."},
      {icon:"😤",title:"Rage Click Detection",desc:"AI mendeteksi klik berulang frustasi — indikasi UX bermasalah yang perlu segera diperbaiki."},
      {icon:"💀",title:"Dead Click Finder",desc:"Temukan elemen yang diklik tapi tidak responsif. Pengunjung mengira itu tombol padahal bukan."},
      {icon:"⚡",title:"Quick Back Alert",desc:"Deteksi pengunjung yang langsung pergi dalam 3 detik — tanda LP gagal memberi first impression."},
    ]},
  ];
  var c=document.getElementById('features-container');if(!c) return;c.innerHTML='';
  groups.forEach(function(g){
    var h='<h3 class="font-heading font-bold text-lg md:text-2xl mb-4 md:mb-5 flex items-center gap-2"><span class="text-xl md:text-2xl">'+g.emoji+'</span> '+g.title+'</h3>';
    h+='<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">';
    g.items.forEach(function(f){
      h+='<div class="glass rounded-xl md:rounded-2xl p-4 md:p-5 gradient-border cursor-default hover:-translate-y-1 transition-transform">';
      h+='<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-xl" style="background:hsl(var(--h1) 85% 60%/0.1)">'+f.icon+'</div>';
      h+='<h4 class="font-heading font-bold text-sm md:text-base mb-1">'+f.title+'</h4>';
      h+='<p class="text-xs md:text-sm" style="color:hsl(var(--hb) 10% 55%)">'+f.desc+'</p></div>';
    });
    h+='</div>';
    var d=document.createElement('div');d.innerHTML=h;c.appendChild(d);
  });
})();

// === Steps ===
(function(){
  var steps=[
    {num:1,title:"Buat Project",desc:"Daftarkan domain LP kamu dan dapatkan API key unik untuk tracking."},
    {num:2,title:"Pasang Script",desc:"Copy-paste satu baris script ke LP kamu. Gak perlu coding — 30 detik selesai."},
    {num:3,title:"Data Masuk Otomatis",desc:"Pengunjung datang → klik, scroll, dan interaksi langsung terekam secara real-time."},
    {num:4,title:"Lihat Heatmap & Rekaman",desc:"Buka dashboard, lihat heatmap visual dan putar ulang rekaman sesi pengunjung."},
    {num:5,title:"AI Kasih Insight",desc:"AI mendeteksi masalah (rage click, dead click, quick back) dan kasih rekomendasi fix."},
  ];
  var list=document.getElementById('steps-list');if(!list) return;list.innerHTML='';
  steps.forEach(function(s){
    var d=document.createElement('div');d.className='relative';
    d.innerHTML='<div class="absolute left-0 top-4 md:top-5 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-heading font-bold text-sm md:text-base glow-sm z-20 -translate-x-[1px]" style="border-color:hsl(var(--h1) 85% 60%);background:hsl(var(--hb) 30% 5%);color:hsl(var(--h1) 85% 60%)">'+s.num+'</div>'
    +'<div class="glass rounded-xl md:rounded-2xl p-4 md:p-5 gradient-border ml-14 md:ml-16">'
    +'<h3 class="font-heading font-bold text-base md:text-lg">'+s.title+'</h3>'
    +'<p class="text-xs md:text-sm" style="color:hsl(var(--hb) 10% 55%)">'+s.desc+'</p></div>';
    list.appendChild(d);
  });
  var container=document.getElementById('steps-container');
  var line=container.querySelector('.step-line-fill');
  window.addEventListener('scroll',function(){
    var rect=container.getBoundingClientRect();var vh=window.innerHeight;
    var start=rect.top-vh/2;var end=rect.bottom-vh/2;var total=end-start;
    var progress=Math.max(0,Math.min(1,(-start)/total));
    line.style.height=(progress*100)+'%';
  });
})();

// === FAQ ===
(function(){
  var faqs=[
    {q:"Pulse Insight itu apa sih sebenarnya?",a:"Pulse Insight adalah platform analitik khusus landing page yang menampilkan heatmap klik & scroll, rekaman sesi pengunjung, dan AI yang mendeteksi masalah UX secara otomatis."},
    {q:"Apakah ini berlangganan bulanan?",a:"Tidak. Ini pembayaran satu kali (one-time payment) dengan akses seumur hidup (lifetime access). Semua update dan fitur baru gratis selamanya."},
    {q:"Berapa banyak LP yang bisa saya tracking?",a:"Unlimited project. Mau tracking 10, 50, bahkan 100 LP? Silakan. Tidak ada batasan."},
    {q:"Apakah script tracking-nya bikin LP jadi lemot?",a:"Tidak. Script kami sangat ringan (< 5KB gzipped) dan dimuat async, tidak mempengaruhi loading time LP kamu."},
    {q:"Apakah data pengunjung saya aman?",a:"100% aman. Data disimpan di server terenkripsi. Kami tidak menjual atau membagikan data ke pihak ketiga."},
    {q:"Bisa lihat rekaman sesi pengunjung?",a:"Ya! Setiap kunjungan direkam otomatis. Kamu bisa memutar ulang gerakan mouse, klik, scroll, dan navigasi pengunjung secara detail."},
    {q:"Bagaimana proses pengiriman aksesnya?",a:"Instan dan otomatis. Begitu pembayaran terkonfirmasi, sistem langsung mengirimkan link akses ke email kamu — dalam hitungan detik."},
  ];
  var c=document.getElementById('faq-container');if(!c) return;c.innerHTML='';
  faqs.forEach(function(f,i){
    var div=document.createElement('div');div.className='glass rounded-xl px-6 gradient-border';
    div.innerHTML='<button class="w-full flex items-center justify-between py-5 text-left font-heading font-semibold text-sm md:text-base" onclick="toggleFaq('+i+')">'+f.q+'<span class="faq-chevron" id="faq-chev-'+i+'">▼</span></button>'
    +'<div class="faq-answer text-sm pb-0" id="faq-ans-'+i+'" style="color:hsl(var(--hb) 10% 55%)"><div class="pb-5">'+f.a+'</div></div>';
    c.appendChild(div);
  });
})();
function toggleFaq(i){
  var ans=document.getElementById('faq-ans-'+i);var chev=document.getElementById('faq-chev-'+i);
  ans.classList.toggle('open');chev.classList.toggle('open');
  document.querySelectorAll('.faq-answer').forEach(function(el,j){
    if(j!==i){el.classList.remove('open');document.getElementById('faq-chev-'+j).classList.remove('open');}
  });
}

// === Lock stacked layout ===
(function(){
  ['comparison-grid','testimonials-grid'].forEach(function(id){
    var el=document.getElementById(id);if(!el) return;
    el.style.setProperty('display','flex','important');
    el.style.setProperty('flex-direction','column','important');
    el.style.setProperty('gap','1rem','important');
    el.style.setProperty('width','100%','important');
    el.style.setProperty('max-width','48rem','important');
    el.style.setProperty('margin','0 auto','important');
    Array.from(el.children).forEach(function(child){
      child.style.setProperty('width','100%','important');
      child.style.setProperty('margin','0','important');
    });
  });
})();

// === Dashboard Simulation ===
(function(){
  var container=document.getElementById('sim-container');
  var screenWrap=document.getElementById('sim-screen');
  var dots=document.getElementById('sim-dots');
  var label=document.getElementById('sim-label');
  var urlEl=document.getElementById('sim-url');
  var statusEl=document.getElementById('sim-status');
  if(!container||!screenWrap||!dots||!label||!urlEl||!statusEl) return;

  screenWrap.style.position='relative';screenWrap.style.overflow='hidden';
  screenWrap.innerHTML='<div id="sim-content" style="height:100%;min-height:340px"></div>';
  var contentEl=document.getElementById('sim-content');

  var cursorEl=document.createElement('div');
  cursorEl.style.cssText='position:absolute;left:50%;top:50%;z-index:40;pointer-events:none;transition:left .42s cubic-bezier(.16,1,.3,1),top .42s cubic-bezier(.16,1,.3,1);transform:translate(-3px,-3px);';
  cursorEl.innerHTML='<div style="width:22px;height:22px"><svg viewBox="0 0 24 24" fill="none" style="filter:dropshadow(0 2px 4px rgba(0,0,0,0.4))"><path d="M5.65 2.93L19.07 12.02L12.41 12.97L9.29 20.07L5.65 2.93Z" fill="hsl(var(--h1) 85% 60%)" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg><span id="sim-cursor-ripple" style="position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:9999px;border:2px solid hsl(var(--h1) 85% 60% / 0.65);opacity:0"></span></div>';
  screenWrap.appendChild(cursorEl);

  var trailEl=document.createElement('div');
  trailEl.style.cssText='position:absolute;left:50%;top:50%;z-index:35;pointer-events:none;width:14px;height:14px;border-radius:9999px;background:hsl(var(--h1) 85% 60% / 0.35);filter:blur(1px);opacity:0;transform:translate(-50%,-50%) scale(1);transition:opacity .25s ease,transform .25s ease,left .25s ease,top .25s ease;';
  screenWrap.appendChild(trailEl);

  var state={index:0,paused:false,timer:null,typingTimer:null,typedFinal:'',lastScreen:''};

  var timeline=[
    {screen:'dashboard',label:'📊 Dashboard Overview',url:'dashboard',dur:1800,cursor:{x:49,y:30},action:'idle'},
    {screen:'dashboard',label:'⚡ Hover Buat Project',url:'dashboard',dur:900,cursor:{x:37,y:74},action:'hover-create',highlight:'create'},
    {screen:'dashboard',label:'⚡ Klik Buat Project',url:'dashboard',dur:700,cursor:{x:37,y:74},action:'click-create',highlight:'create',click:true},
    {screen:'project',label:'📝 Input domain LP',url:'projects',dur:900,cursor:{x:50,y:55},action:'focus'},
    {screen:'project',label:'⌨️ User mengetik domain',url:'projects',dur:2500,cursor:{x:56,y:55},action:'typing',typingText:'tokobaju.com'},
    {screen:'project',label:'🚀 Simpan Project',url:'projects',dur:700,cursor:{x:75,y:75},action:'send',click:true},
    {screen:'script',label:'📋 Copy Script Tracking',url:'projects',dur:2000,cursor:{x:50,y:60},action:'copy',click:true},
    {screen:'waiting',label:'⏳ Menunggu data masuk...',url:'dashboard',dur:1800,cursor:{x:50,y:50},action:'generating'},
    {screen:'heatmap-click',label:'🔥 Heatmap — Mode Klik',url:'heatmap',dur:2200,cursor:{x:52,y:35},action:'idle'},
    {screen:'heatmap-click',label:'🔥 Hover area panas',url:'heatmap',dur:1200,cursor:{x:35,y:42},action:'hover',click:true},
    {screen:'heatmap-scroll',label:'📜 Heatmap — Mode Scroll',url:'heatmap',dur:2000,cursor:{x:50,y:50},action:'idle'},
    {screen:'sessions',label:'📹 Daftar Rekaman Sesi',url:'sessions',dur:1800,cursor:{x:50,y:38},action:'idle'},
    {screen:'sessions',label:'📹 Klik sesi untuk putar',url:'sessions',dur:800,cursor:{x:50,y:42},action:'hover',click:true},
    {screen:'replay',label:'🎬 Playback Rekaman',url:'sessions',dur:2800,cursor:{x:40,y:45},action:'playing'},
    {screen:'signals',label:'🧠 AI Sinyal Terdeteksi',url:'signals',dur:2200,cursor:{x:50,y:45},action:'idle'},
    {screen:'sections',label:'📐 Analisis Section',url:'sections',dur:2200,cursor:{x:50,y:50},action:'idle'},
    {screen:'done',label:'✅ Semua Data Siap!',url:'dashboard',dur:2200,cursor:{x:50,y:50},action:'done'},
  ];

  function escapeHtml(v){return String(v).replace(/[&<>"]/g,function(s){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[s]||s;});}
  function pulseClick(){var r=document.getElementById('sim-cursor-ripple');if(!r||!r.animate)return;r.animate([{transform:'scale(0.25)',opacity:1},{transform:'scale(2.2)',opacity:0}],{duration:430,easing:'cubic-bezier(.16,1,.3,1)'});}
  function moveCursor(pos){if(!pos)return;trailEl.style.left=cursorEl.style.left||'50%';trailEl.style.top=cursorEl.style.top||'50%';trailEl.style.opacity='0.55';trailEl.style.transform='translate(-50%,-50%) scale(1)';requestAnimationFrame(function(){trailEl.style.opacity='0';trailEl.style.transform='translate(-50%,-50%) scale(1.9)';});cursorEl.style.left=pos.x+'%';cursorEl.style.top=pos.y+'%';}
  function badge(t){return '<span class="px-2 py-0.5 rounded-full text-[9px] font-medium" style="background:hsl(var(--h1) 85% 60% / 0.15);color:hsl(var(--h1) 85% 60%)">'+t+'</span>';}
  function heatDot(x,y,sz,op){return '<div style="position:absolute;left:'+x+'%;top:'+y+'%;width:'+sz+'px;height:'+sz+'px;border-radius:9999px;background:radial-gradient(circle,hsl(0 84% 60%/'+op+'),hsl(45 90% 55%/'+op*0.5+'),transparent);transform:translate(-50%,-50%);pointer-events:none"></div>';}

  function renderScreen(step){
    if(step.screen==='dashboard'){
      var g=step.highlight==='create'?'box-shadow:0 0 20px hsl(var(--h1) 85% 60%/0.45);':'';
      return '<div class="px-4 sm:px-6 py-4 space-y-4"><div><h3 class="text-base font-bold mb-1">Selamat datang, Ahmad! 👋</h3><p class="text-[11px]" style="color:hsl(var(--hb) 10% 55%)">Pantau performa landing page kamu.</p></div>'
        +'<div class="grid grid-cols-3 gap-2"><div class="p-2.5 rounded-xl" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%)"><p class="text-sm font-bold">1,247</p><p class="text-[9px]" style="color:hsl(var(--hb) 10% 55%)">Pengunjung</p></div><div class="p-2.5 rounded-xl" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%)"><p class="text-sm font-bold">3,891</p><p class="text-[9px]" style="color:hsl(var(--hb) 10% 55%)">Total Klik</p></div><div class="p-2.5 rounded-xl" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%)"><p class="text-sm font-bold">67%</p><p class="text-[9px]" style="color:hsl(var(--hb) 10% 55%)">Avg Scroll</p></div></div>'
        +'<div class="p-3 rounded-xl" style="background:linear-gradient(to right,hsl(var(--h1) 85% 60%/0.18),hsl(var(--h2) 80% 65%/0.08));border:1px solid hsl(var(--h1) 85% 60%/0.3);'+g+'"><h4 class="text-xs font-bold mb-1">Buat Project Baru</h4><p class="text-[10px] mb-2" style="color:hsl(var(--hb) 10% 55%)">Mulai tracking landing page baru.</p><span class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style="background:hsl(var(--h1) 85% 60%);color:white">➕ Buat Project</span></div></div>';
    }
    if(step.screen==='project'){
      var ia=step.action==='focus'||step.action==='typing';
      var ut='';
      if(step.action==='typing') ut='<span id="sim-typed-text"></span><span id="sim-typing-caret" style="display:inline-block;width:2px;height:12px;background:hsl(var(--h1) 85% 60%);margin-left:2px;border-radius:9999px;animation:blink .55s infinite"></span>';
      else if(state.typedFinal) ut=escapeHtml(state.typedFinal);
      return '<div class="px-4 sm:px-6 py-4 space-y-3"><h3 class="text-sm font-bold">Buat Project Baru</h3>'
        +'<div><label class="text-[10px] font-medium block mb-1" style="color:hsl(var(--hb) 10% 55%)">Nama Project</label><div class="rounded-lg px-3 py-2 text-[11px]" style="border:1px solid hsl(var(--hb) 20% 18%);background:hsl(var(--hb) 30% 5%);color:hsl(0 0% 80%)">Toko Baju Online</div></div>'
        +'<div><label class="text-[10px] font-medium block mb-1" style="color:hsl(var(--hb) 10% 55%)">Domain LP</label><div class="rounded-lg px-3 py-2 text-[11px]" style="border:1px solid '+(ia?'hsl(var(--h1) 85% 60%)':'hsl(var(--hb) 20% 18%)')+';box-shadow:'+(ia?'0 0 0 2px hsl(var(--h1) 85% 60%/0.2)':'none')+';background:hsl(var(--hb) 30% 5%);color:hsl(0 0% 90%)">'+(ut||'<span style="color:hsl(var(--hb) 10% 45%)">contoh: tokobaju.com</span>')+'</div></div>'
        +'<div class="flex justify-end"><span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium" style="background:hsl(var(--h1) 85% 60%);color:white">💾 Simpan</span></div></div>';
    }
    if(step.screen==='script'){
      return '<div class="px-4 sm:px-6 py-4 space-y-3"><div class="flex items-center gap-2 mb-2"><span class="text-lg">✅</span><h3 class="text-sm font-bold">Project Berhasil Dibuat!</h3></div>'
        +'<p class="text-[10px]" style="color:hsl(var(--hb) 10% 55%)">Pasang script ini di halaman LP kamu:</p>'
        +'<div class="rounded-lg p-3 font-mono text-[9px] leading-relaxed" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%);color:hsl(var(--h1) 85% 60%)">&lt;script src="https://app.pulseinsight.id/tracker.js"<br/>&nbsp;&nbsp;data-key="pi_abc123xyz"&gt;&lt;/script&gt;</div>'
        +'<div class="flex justify-end"><span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium" style="background:hsl(145 65% 50%);color:white">📋 Copied!</span></div></div>';
    }
    if(step.screen==='waiting'){
      return '<div class="px-4 sm:px-6 py-6 text-center"><div class="w-8 h-8 rounded-full mx-auto mb-3" style="border:3px solid hsl(var(--h1) 85% 60%);border-top-color:transparent;animation:spin .8s linear infinite"></div><h3 class="text-sm font-bold">Menunggu data pengunjung...</h3><p class="text-[10px] mt-1" style="color:hsl(var(--hb) 10% 55%)">Script sudah aktif, data akan masuk saat ada pengunjung.</p><div class="mt-3 flex justify-center gap-2">'+badge('Script Active')+badge('Listening...')+'</div></div>';
    }
    if(step.screen==='heatmap-click'){
      return '<div class="px-4 sm:px-6 py-3 space-y-2"><div class="flex items-center justify-between"><h3 class="text-sm font-bold">🔥 Heatmap Klik</h3><div class="flex gap-1">'+badge('Klik')+badge('Desktop')+'</div></div>'
        +'<div class="rounded-xl overflow-hidden relative" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%);height:220px">'
        +'<div class="px-3 py-2" style="background:hsl(var(--hb) 20% 15%/0.6)"><div class="flex items-center gap-2"><div class="w-6 h-2 rounded" style="background:hsl(var(--h1) 85% 60%)"></div><div class="w-16 h-2 rounded" style="background:hsl(var(--hb) 20% 18%)"></div><div class="w-10 h-2 rounded" style="background:hsl(var(--hb) 20% 18%)"></div><div class="w-12 h-2 rounded ml-auto" style="background:hsl(var(--h1) 85% 60%/0.3)"></div></div></div>'
        +'<div class="px-4 py-3"><div class="w-32 h-3 rounded mb-2" style="background:hsl(var(--hb) 20% 18%)"></div><div class="w-48 h-2 rounded mb-3" style="background:hsl(var(--hb) 20% 18%/0.5)"></div><div class="w-20 h-6 rounded" style="background:hsl(var(--h1) 85% 60%/0.4)"></div></div>'
        +heatDot(35,42,50,0.8)+heatDot(38,44,35,0.6)+heatDot(52,68,40,0.7)+heatDot(70,35,25,0.5)+heatDot(25,80,30,0.4)+heatDot(60,55,45,0.75)
        +'</div></div>';
    }
    if(step.screen==='heatmap-scroll'){
      return '<div class="px-4 sm:px-6 py-3 space-y-2"><div class="flex items-center justify-between"><h3 class="text-sm font-bold">📜 Heatmap Scroll</h3><div class="flex gap-1">'+badge('Scroll')+badge('Desktop')+'</div></div>'
        +'<div class="rounded-xl overflow-hidden relative" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%);height:220px">'
        +'<div style="position:absolute;inset:0;background:linear-gradient(to bottom,hsl(0 84% 60%/0.3) 0%,hsl(45 90% 55%/0.25) 30%,hsl(145 65% 50%/0.2) 60%,hsl(200 80% 50%/0.15) 80%,hsl(var(--hb) 60% 50%/0.1) 100%)"></div>'
        +'<div style="position:absolute;right:8px;top:8px;bottom:8px;width:24px;border-radius:12px;background:hsl(var(--hb) 20% 15%/0.8);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:6px 0;font-size:8px;color:hsl(var(--hb) 10% 55%)"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>'
        +'<div class="px-4 py-3 relative z-10"><div class="w-32 h-3 rounded mb-2" style="background:hsl(var(--hb) 20% 18%)"></div><div class="w-48 h-2 rounded mb-4" style="background:hsl(var(--hb) 20% 18%/0.5)"></div><div class="text-[9px] font-bold" style="color:hsl(45 90% 55%)">— 67% pengunjung sampai sini</div></div></div></div>';
    }
    if(step.screen==='sessions'){
      var rows=[{id:'#s-001',dev:'📱 Mobile',pg:5,dur:'2m 34s',sig:'😤 Rage'},{id:'#s-002',dev:'🖥 Desktop',pg:3,dur:'1m 12s',sig:'—'},{id:'#s-003',dev:'📱 Mobile',pg:8,dur:'4m 51s',sig:'💀 Dead'}];
      var rh=rows.map(function(r){return '<div class="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%)"><span class="font-mono" style="color:hsl(var(--h1) 85% 60%)">'+r.id+'</span><span style="color:hsl(var(--hb) 10% 55%)">'+r.dev+'</span><span style="color:hsl(var(--hb) 10% 55%)">'+r.pg+' hal</span><span style="color:hsl(var(--hb) 10% 55%)">'+r.dur+'</span><span class="ml-auto">'+r.sig+'</span></div>';}).join('');
      return '<div class="px-4 sm:px-6 py-3 space-y-2"><div class="flex items-center justify-between"><h3 class="text-sm font-bold">📹 Rekaman Sesi</h3>'+badge('3 sesi baru')+'</div><div class="space-y-1.5">'+rh+'</div></div>';
    }
    if(step.screen==='replay'){
      return '<div class="px-4 sm:px-6 py-3 space-y-2"><div class="flex items-center justify-between"><h3 class="text-sm font-bold">🎬 Playback Sesi #s-001</h3>'+badge('▶ Playing')+'</div>'
        +'<div class="rounded-xl overflow-hidden relative" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%);height:200px">'
        +'<div class="px-3 py-2" style="background:hsl(var(--hb) 20% 15%/0.6)"><div class="flex items-center gap-2"><div class="w-6 h-2 rounded" style="background:hsl(var(--h1) 85% 60%)"></div><div class="w-16 h-2 rounded" style="background:hsl(var(--hb) 20% 18%)"></div></div></div>'
        +'<div class="px-4 py-3"><div class="w-32 h-3 rounded mb-2" style="background:hsl(var(--hb) 20% 18%)"></div><div class="w-48 h-2 rounded mb-3" style="background:hsl(var(--hb) 20% 18%/0.5)"></div></div>'
        +'<div style="position:absolute;left:45%;top:55%;width:14px;height:14px;border-radius:9999px;background:hsl(var(--h1) 85% 60%);opacity:0.8;animation:float 1.5s ease-in-out infinite;box-shadow:0 0 12px hsl(var(--h1) 85% 60%/0.5)"></div>'
        +'<div style="position:absolute;left:42%;top:53%;width:4px;height:4px;border-radius:9999px;background:hsl(var(--h1) 85% 60%/0.4)"></div>'
        +'<div style="position:absolute;left:39%;top:50%;width:3px;height:3px;border-radius:9999px;background:hsl(var(--h1) 85% 60%/0.25)"></div></div>'
        +'<div class="flex items-center gap-2 mt-1"><div class="flex-1 h-1.5 rounded-full" style="background:hsl(var(--hb) 20% 15%)"><div class="h-1.5 rounded-full" style="background:hsl(var(--h1) 85% 60%);width:62%"></div></div><span class="text-[9px]" style="color:hsl(var(--hb) 10% 55%)">1:34 / 2:34</span></div></div>';
    }
    if(step.screen==='signals'){
      return '<div class="px-4 sm:px-6 py-3 space-y-2"><h3 class="text-sm font-bold">🧠 AI Sinyal Terdeteksi</h3><div class="space-y-1.5">'
        +'<div class="flex items-center gap-2 p-2.5 rounded-lg" style="background:hsl(0 84% 60%/0.08);border:1px solid hsl(0 84% 60%/0.2)"><span>😤</span><div><p class="text-[10px] font-bold">Rage Click — 12 kejadian</p><p class="text-[9px]" style="color:hsl(var(--hb) 10% 55%)">Tombol "Beli Sekarang" di hero diklik berulang tanpa respons</p></div></div>'
        +'<div class="flex items-center gap-2 p-2.5 rounded-lg" style="background:hsl(45 90% 55%/0.08);border:1px solid hsl(45 90% 55%/0.2)"><span>💀</span><div><p class="text-[10px] font-bold">Dead Click — 8 kejadian</p><p class="text-[9px]" style="color:hsl(var(--hb) 10% 55%)">Gambar produk di testimoni diklik tapi bukan link</p></div></div>'
        +'<div class="flex items-center gap-2 p-2.5 rounded-lg" style="background:hsl(var(--h2) 80% 65%/0.08);border:1px solid hsl(var(--h2) 80% 65%/0.2)"><span>⚡</span><div><p class="text-[10px] font-bold">Quick Back — 5 kejadian</p><p class="text-[9px]" style="color:hsl(var(--hb) 10% 55%)">Pengunjung dari Instagram pergi dalam 3 detik</p></div></div></div></div>';
    }
    if(step.screen==='sections'){
      var secs=[{n:'Hero',v:'98%',c:45,q:'Sangat Baik'},{n:'Fitur',v:'82%',c:23,q:'Baik'},{n:'Testimoni',v:'64%',c:12,q:'Sedang'},{n:'Harga',v:'51%',c:34,q:'Baik'},{n:'FAQ',v:'38%',c:8,q:'Rendah'}];
      var sh=secs.map(function(s){var cl=s.q==='Sangat Baik'?'hsl(145 65% 50%)':s.q==='Baik'?'hsl(var(--h1) 85% 60%)':s.q==='Sedang'?'hsl(45 90% 55%)':'hsl(0 84% 60%)';return '<div class="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]" style="background:hsl(var(--hb) 30% 5%);border:1px solid hsl(var(--hb) 20% 18%)"><span class="font-bold w-16">'+s.n+'</span><span style="color:hsl(var(--hb) 10% 55%)">👁 '+s.v+'</span><span style="color:hsl(var(--hb) 10% 55%)">👆 '+s.c+'</span><span class="ml-auto px-2 py-0.5 rounded-full text-[8px] font-bold" style="background:'+cl+'/0.15;color:'+cl+'">'+s.q+'</span></div>';}).join('');
      return '<div class="px-4 sm:px-6 py-3 space-y-2"><h3 class="text-sm font-bold">📐 Analisis Section</h3><div class="space-y-1.5">'+sh+'</div></div>';
    }
    if(step.screen==='done'){
      return '<div class="px-4 sm:px-6 py-6 text-center"><div style="font-size:34px">✅</div><h3 class="text-sm font-bold mt-1">Semua Data Siap!</h3><p class="text-[10px]" style="color:hsl(var(--hb) 10% 55%)">Heatmap, rekaman sesi, dan AI sinyal sudah aktif.</p><div class="flex justify-center gap-2 mt-2">'+badge('Heatmap')+badge('Recording')+badge('AI Signals')+'</div></div>';
    }
    return '';
  }

  function renderDots(){
    dots.innerHTML='';
    timeline.forEach(function(_,i){
      var dot=document.createElement('button');
      dot.style.cssText='height:6px;border:none;border-radius:9999px;cursor:pointer;transition:all .25s;'+(i===state.index?'width:26px;background:hsl(var(--h1) 85% 60%)':i<state.index?'width:8px;background:hsl(var(--h1) 85% 60%/0.45)':'width:8px;background:hsl(var(--hb) 10% 55%/0.3)');
      dot.onclick=function(e){e.stopPropagation();state.index=i;show();};
      dots.appendChild(dot);
    });
  }

  function startTyping(text,dur){
    clearInterval(state.typingTimer);var target=document.getElementById('sim-typed-text');if(!target)return;target.textContent='';
    var i=0;var ms=Math.max(18,Math.floor(dur/Math.max(1,text.length)));
    state.typingTimer=setInterval(function(){
      i+=Math.random()>0.72?2:1;
      if(i>=text.length){i=text.length;clearInterval(state.typingTimer);state.typedFinal=text;var c=document.getElementById('sim-typing-caret');if(c)c.style.display='none';}
      target.textContent=text.slice(0,i);
    },ms);
  }

  function next(){
    clearTimeout(state.timer);if(state.paused)return;
    state.timer=setTimeout(function(){
      state.index+=1;
      if(state.index>=timeline.length){statusEl.textContent='✅ Selesai';label.textContent='🎉 Demo lengkap · restart otomatis';setTimeout(function(){state.index=0;show();},900);return;}
      show();
    },timeline[state.index].dur);
  }

  function show(){
    clearInterval(state.typingTimer);var step=timeline[state.index];
    contentEl.innerHTML=renderScreen(step);
    if(state.lastScreen&&state.lastScreen!==step.screen&&contentEl.animate){contentEl.animate([{opacity:0.7,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:210,easing:'cubic-bezier(.16,1,.3,1)'});}
    state.lastScreen=step.screen;
    moveCursor(step.cursor);
    if(step.click){setTimeout(pulseClick,90);}
    if(step.action==='typing'){startTyping(step.typingText||'',step.dur-200);}
    urlEl.textContent='app.pulseinsight.id/'+step.url;
    statusEl.textContent=state.paused?'⏸ Paused':'▶ Simulasi';
    label.textContent=step.label+' · Klik untuk '+(state.paused?'lanjut':'pause');
    renderDots();next();
  }

  container.onclick=function(){state.paused=!state.paused;statusEl.textContent=state.paused?'⏸ Paused':'▶ Simulasi';label.textContent=timeline[state.index].label+' · Klik untuk '+(state.paused?'lanjut':'pause');if(!state.paused)next();};

  var jh=document.getElementById('sim-jump-heatmap');
  if(jh){jh.onclick=function(e){e.stopPropagation();var t=timeline.findIndex(function(i){return i.screen==='heatmap-click';});if(t>=0){state.paused=false;state.index=t;show();}};}
  var jr=document.getElementById('sim-jump-replay');
  if(jr){jr.onclick=function(e){e.stopPropagation();var t=timeline.findIndex(function(i){return i.screen==='replay';});if(t>=0){state.paused=false;state.index=t;show();}};}
  var rb=document.getElementById('sim-restart');
  if(rb){rb.onclick=function(e){e.stopPropagation();state.paused=false;state.index=0;show();};}

  var booted=false;
  function boot(){if(booted)return;booted=true;show();}
  if('IntersectionObserver' in window){var obs=new IntersectionObserver(function(e){if(e[0].isIntersecting){boot();obs.disconnect();}},{rootMargin:'120px'});obs.observe(container);}
  setTimeout(boot,220);
})();
window.toggleFaq=toggleFaq;
})();
