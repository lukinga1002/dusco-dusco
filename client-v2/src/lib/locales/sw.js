// Kiswahili.
//
// Must contain exactly the same keys as en.js — lib/i18n.jsx compares the two
// at startup in development and reports any gap, because a missing key is what
// produces a half-English screen.
//
// Product nouns stay in Kiswahili in both languages and are NOT translated
// further here: bahasha, akiba, karo, safari, kikoba, VICOBA. They are what
// people actually call these things.
//
// NOTE: this wording should be reviewed by a native Kiswahili speaker before
// the pilot, particularly the financial terms (ada, salio, amana).

export const sw = {
  // ── Common ──────────────────────────────────────────────
  "common.getStarted": "Anza sasa",
  "common.login": "Ingia",
  "common.continue": "Endelea",
  "common.back": "Rudi",
  "common.language": "Lugha",

  // ── Landing: header & hero ──────────────────────────────
  "landing.operatedBy": "Inaendeshwa na Larson Consulting",
  "landing.hero.title1": "Akiba Yako,",
  "landing.hero.title2": "Kwa Urahisi.",
  "landing.hero.body":
    "Dhibiti akiba yako kwa namba yako ya Dusco inayopokea pesa kutoka akaunti au pochi yoyote na kuzigawa kwenye bahasha zako za akiba, kiotomatiki.",
  "landing.hero.seeHow": "Ona jinsi inavyofanya kazi",
  "landing.hero.demoNote": "Mazingira ya majaribio · pesa za kuigiza · hakuna fedha halisi",

  // ── Landing: problem ────────────────────────────────────
  "landing.problem.1.title": "Akiba imetawanyika",
  "landing.problem.1.body":
    "Pesa zipo kwenye mitandao na mifuko tofauti, zimegawanywa kwa matumizi — ni vigumu kuona hali halisi.",
  "landing.problem.2.title": "Mitandao haiongei",
  "landing.problem.2.body":
    "Kupokea kutoka M-Pesa, Airtel au benki kunahitaji kushughulika na ada na kumbukumbu kwa kila muamala.",
  "landing.problem.3.title": "Vikundi vinatumia karatasi",
  "landing.problem.3.body":
    "Kikoba na VICOBA huandika michango kwenye daftari na masanduku ya pesa — hakuna daftari la wazi la wanachama.",

  // ── Landing: how it works ───────────────────────────────
  "landing.how.title": "Inavyofanya kazi",
  "landing.how.subtitle": "Hatua tatu, kisha inajiendesha yenyewe.",
  "landing.how.1.title": "Weka bahasha zako",
  "landing.how.1.body":
    "Zipe majina bahasha zako — akiba, karo, safari — na uchague asilimia ya kila malipo yanayoingia.",
  "landing.how.2.title": "Sambaza namba yako ya Dusco",
  "landing.how.2.body":
    "Unapata namba moja, kama DUS-A3K9M2. Isambaze kama unavyosambaza namba ya simu.",
  "landing.how.3.title": "Pesa zinajigawa zenyewe",
  "landing.how.3.body":
    "Pesa zinapoingia zinagawanyika kwenye bahasha zako papo hapo. Hakuna kuhamisha kwa mkono.",

  // ── Landing: features ───────────────────────────────────
  "landing.features.title": "Imetengenezwa kwa jinsi unavyoweka akiba",
  "landing.features.1.title": "Mgawanyo wa kiotomatiki",
  "landing.features.1.body":
    "Kila malipo yanayoingia yanagawanyika kwenye bahasha zako kwa asilimia ulizoweka.",
  "landing.features.2.title": "Pokea kutoka mtandao wowote",
  "landing.features.2.body": "M-Pesa, Airtel, Tigo, benki — namba moja inapokea zote.",
  "landing.features.3.title": "Malengo na kufunga",
  "landing.features.3.body":
    "Weka lengo kwenye bahasha yoyote, au ifunge hadi tarehe fulani ili kuepuka kuitumia.",
  "landing.features.4.title": "Akiba ya kikundi",
  "landing.features.4.body":
    "Endesha kikoba kwa namba ya kikundi, daftari la wanachama, na hisa pamoja na mfuko wa jamii.",
  "landing.features.5.title": "Faragha kiotomatiki",
  "landing.features.5.body":
    "Salio limefichwa hadi ubofye kuliona — salama mahali penye watu wengi.",
  "landing.features.6.title": "Ada zilizo wazi",
  "landing.features.6.body": "Kila ada inaonyeshwa kabla pesa hazijahama. Hakuna mshangao.",

  // ── Landing: groups ─────────────────────────────────────
  "landing.groups.eyebrow": "Kwa vikundi · Kikoba / VICOBA",
  "landing.groups.title": "Sanduku la pesa la kidijitali",

  // ── Landing: trust ──────────────────────────────────────
  "landing.trust.title": "Uaminifu na uwazi",
  "landing.trust.fee.depositSame": "Kuweka (mtandao huohuo)",
  "landing.trust.fee.depositCross": "Kuweka (mtandao tofauti)",
  "landing.trust.fee.withdrawal": "Kutoa",
  "landing.trust.fee.withdrawal90": "Kutoa baada ya siku 90",
  "landing.trust.fee.earlyUnlock": "Faini ya kufungua mapema",
  "landing.trust.fee.free": "Bure",
  "landing.trust.fee.crossValue": "1% · chini TZS 500",
  "landing.trust.fee.withdrawalValue": "1% · TZS 500–5,000",
  "landing.trust.fee.earlyUnlockValue": "2% ya salio",

  "landing.groups.body":
    "Kipe chama chako namba yake ya Dusco. Fuatilia michango ya kila mwanachama, tenganisha hisa na mfuko wa jamii, na uone jumla ya kikundi kwa mtazamo mmoja.",
  "landing.groups.cta": "Anzisha kikundi",
  "landing.groups.shares": "Hisa",
  "landing.groups.socialFund": "Mfuko wa jamii",
  "landing.trust.body":
    "Dusco inaendeshwa na Larson Consulting, kampuni iliyosajiliwa. Pesa za wateja zimepangwa kuhifadhiwa kwenye taasisi ya fedha yenye leseni. Kila ada inaonyeshwa kabla ya muamala — hakuna kinachofichwa.",
  "landing.trust.disclaimer":
    "Dusco haihifadhi pesa za wateja yenyewe na si benki yenye leseni. Haya ni mazingira ya majaribio yenye pesa za kuigiza.",
  "landing.trust.feesTitle": "Ada, kwa uwazi",

  // ── Landing: FAQ ────────────────────────────────────────
  "landing.faq.title": "Maswali",
  "landing.faq.1.q": "Bahasha ni nini?",
  "landing.faq.1.a":
    "Bahasha ni pochi la akiba — pesa ulizotenga kwa matumizi maalum, kama karo au dharura. Wewe huamua asilimia ya kila malipo yanayoingia yanayoenda kwenye kila bahasha.",
  "landing.faq.2.q": "Je, nahitaji namba mpya ya simu?",
  "landing.faq.2.a":
    "Hapana. Unapata namba moja ya Dusco (kama DUS-A3K9M2). Watu wanatuma pesa hapo kutoka mtandao au benki yoyote, nazo zinaingia kwenye bahasha zako.",
  "landing.faq.3.q": "Je, pesa zangu ziko salama?",
  "landing.faq.3.a":
    "Dusco inaendeshwa na Larson Consulting, na pesa za wateja zimepangwa kuhifadhiwa kwenye taasisi ya fedha yenye leseni. Jaribio hili linatumia pesa za kuigiza — hakuna fedha halisi zinazohama.",
  "landing.faq.4.q": "Je, naweza kufunga akiba yangu?",
  "landing.faq.4.a":
    "Ndiyo. Funga bahasha hadi tarehe ya baadaye ili isiguswe. Kuifungua kabla ya wakati kunatoza faini ya 2% ya salio; kuifungua baada ya tarehe ni bure.",

  // ── Landing: footer ─────────────────────────────────────
  "landing.footer.privacy": "Taarifa ya Faragha",
  "landing.footer.terms": "Masharti",

  "landing.footer.copyright": "© {year} Larson Consulting. Dusco ni bidhaa ya majaribio. Uhamishaji wa pesa ni wa kuigiza.",

  "landing.hero.sentTo": "Imetumwa kwa {number}",
  "landing.groups.demoName": "Kikundi cha Akiba cha Umoja",
  "auth.otp.error.length": "Andika msimbo wa tarakimu 4",
  "auth.otp.error.failed": "Imeshindikana kuthibitisha. Jaribu tena.",

  // ── Auth: register ──────────────────────────────────────
  "auth.register.title": "Fungua akaunti yako ya Dusco",
  "auth.register.subtitle": "Pata namba ya Dusco na uanzishe bahasha zako za akiba.",
  "auth.register.name": "Jina kamili",
  "auth.register.namePlaceholder": "Amani Mushi",
  "auth.register.phone": "Namba ya simu",
  "auth.register.password": "Nenosiri",
  "auth.register.passwordPlaceholder": "Angalau herufi 6",
  "auth.register.submit": "Fungua akaunti",
  "auth.register.haveAccount": "Tayari una akaunti?",
  "auth.register.languageLabel": "Chagua lugha yako",
  "auth.register.languageHelp": "Unaweza kubadilisha hii baadaye kwenye Mipangilio.",
  "auth.register.error.name": "Andika jina lako",
  "auth.register.error.phone": "Tumia namba ya Tanzania, mfano 0712345678",
  "auth.register.error.password": "Angalau herufi 6",

  // ── Auth: consent ───────────────────────────────────────
  "auth.consent.heading": "Ridhaa yako",
  "auth.consent.operate":
    "Ninakubali Dusco kushughulikia taarifa zangu za fedha na miamala ili kuendesha akaunti yangu ya akiba.",
  "auth.consent.operateHelp":
    "Inahitajika ili huduma ifanye kazi — kugawa malipo, kuonyesha salio, na kuhifadhi miamala.",
  "auth.consent.marketing": "Nitumie taarifa za huduma mpya na vidokezo vya kuweka akiba.",
  "auth.consent.marketingHelp": "Si lazima. Unaweza kuiondoa wakati wowote kwenye Mipangilio.",
  "auth.consent.reviewPrefix": "Unaweza kusoma jinsi taarifa zako zinavyotumika kwenye",
  "auth.consent.reviewLink": "Taarifa ya Faragha",
  "auth.consent.error.operate": "Tunahitaji hii ili kuendesha akaunti yako",

  // ── Auth: login ─────────────────────────────────────────
  "auth.login.title": "Karibu tena",
  "auth.login.subtitle": "Ingia kwenye bahasha zako.",
  "auth.login.phone": "Namba ya simu",
  "auth.login.password": "Nenosiri",
  "auth.login.passwordPlaceholder": "Nenosiri lako",
  "auth.login.submit": "Ingia",
  "auth.login.noAccount": "Ni mgeni Dusco?",
  "auth.login.createAccount": "Fungua akaunti",
  "auth.login.waking": "Tunaamsha seva salama…",

  // ── Auth: OTP ───────────────────────────────────────────
  "auth.otp.title": "Thibitisha namba yako",
  "auth.otp.sentTo": "Tumetuma msimbo kwenda {phone}.",
  "auth.otp.yourNumber": "NAMBA YAKO YA DUSCO",
  "auth.otp.shareNote": "Hii ndiyo utambulisho wako Dusco. Isambaze ili upokee pesa.",
  "auth.otp.demoNote": "Jaribio: msimbo ni wa kuigiza — andika tarakimu 4 zozote ili kuendelea.",
  "auth.otp.submit": "Thibitisha na uendelee",
  "auth.otp.wrongNumber": "Namba si sahihi?",
  "auth.otp.startOver": "Anza upya",
};
