let gData = {};

let r_s; // render started - for dateAdded comparing
let rid; // root id
let last;
let rcFN, rcBN; // right click - folder/bookmark node

let scr; // scroll object
let scrTO; // scroll timeout
let dURLs = [],
  folders = [];
let lastClick = !1;

//let testDrop = 0, tdr = 0;
let cutB = [],
  copyB = [];

let dzzd = 1; //za drag preko foldera zoom
let dzzd_mY = 1; // za drag preko foldera.... množitelj za 12, polovicu visine
let OF; // open folders
//let lSel;
let sepBkm = { b: "#C0C0C0", h: 4, m: 10 }; // separator default
let SF = {}; // single folder
let kbHelper = !1;
let dgEnter = 0; // drag enter - opens folder after 1 sec
let gTO; // timeout for saving gData when panel is zoomed with mouse wheel + ctrl
let zTO; // to clear zoom indicator after 2 sec
let cWin; // current window id
let ctxScroll = null; // flag for scroll to remove menu
let frScr = 0; // first scroll
let rN = {}; // root names for search - reveal in bookmarks
let lA = 0; // panel anim
//let bkmIdCnt = 0; // bookmarks Id counter - for flat search nodes, there can be multiple with the same id

let fc_ =
  '<div style="position:absolute;top:5px;left:3px;height:12px;width:17px;background-color:#999999;border:1px solid #4D4D4D;pointer-events:none;"></div>';
let fo_ =
  '<div style="position:absolute;top:5px;left:3px;height:12px;width:17px;background-color:#B4DAF2;border:1px solid #4D4D4D;pointer-events:none;"></div><div style="position:absolute;top:13px;left:6px;height:4px;width:17px;background-color:#4D4D4D;border:1px solid #4D4D4D;-webkit-transform:skew(-40deg);pointer-events:none;"></div>';

let isValidDrag = 0;
let flagAdded = 0; // flag za uklanjanje listenera za top toolbar

let focusOn = null; // srollTo newest node

let rcSafe = {
  bookmark: 170,
  searchBkm: 172,
  searchFol: 172,
  folder: 172,
  panel: 135,
  trash: 120,
  separator: 88,
  multiSel: 170,
  altMenu: 150,
  topM: "80px",
};

("use_strict");

/* 

	*******dzzd obnovi kada je ctrl zoom
	*******scroll opet nevalja...poremeti se kada se prebaciva sa panela...nakon recent
	*******arrows moras popraviti - nema vise left right isto (samo ako je izbačeno unsorted i imported)
	*******animacije za delete ide u pogrešnu lokaciju...mora biti ljevo
	*******save session animaciju izbaci...na ctx je
	*******save session ako je "all bookmarks" aktivan treba da ode u scroll na top...
	*******save session u local string
	*******sort nevalja... abecedno ne prepoznaje naše znakove
	*******otvori extenziju sa recent da je prvi, paste u search (flat) klikni X....error...nema rid!!!!!
	*******sort na optionsima popravi
	*******del key na recent i search ne radi...
	*******ctx za locals - safe za ctx menu za lokalne jezike provjeriti
	*******top i bottom meni mora imati logiku...skače nekad ako se klikne ponovo na strelicu da se zatvori
	*******zoom kontole na bottom
	*******search na tree nije promjenjen - moraš projeriti funkcije...
	*******zatvori sidebar kada u optionsima promjenis
	*******animacija headera ??? moždaje bolje u css
	*******i18n options
	*******ctx za flat search
	---------NEMOŽE!!!!!! očisti search kada je drag over gornjih buttons -  jer će search opaliti < 1 logiku
	---------NEMOŽE!!!!!! zamjeniti getBoundingClientRect().top sa element.offsetTop;
	******* (ostavljeno kako je) zoom na per-origin provjeri dali ima sa iste domene i prebaci ih
	*******nemoj zaboraviti tree search prepraviti... revela i ostalo
	*******na search nađi root ako ga nema _rev funkcija
	*******scope poruka na sve prozore
	---------NEMOŽE!!!!! new folder after nije scrollao na new target ako je ispod ekrana - 
	*******desni klik na search bookmark --> edit nevalja
	*******sort moraš sredit... provjeri koji je panel prvo
	---------NEMOŽE!!!!! (prepravio na čisti id) u tree search stavi isto bookmarkse i foldere sa _32642384
	
	
	
	*******openSel funkcija...grupiraj slične kod otvarnja u jednu ...middle klik, drag out, desni klik open....
	*******test === !!1 ... za pitanja middle click i drag out i sa desnog klika...sve utrpaj u jednu funkciju _dg_h
	
	*******_dgEnd prepravi ...svaki kreirani tab je aktivan...samo aktiviraj prvi
	*******separator u trashu zajeb...provjeri na aktivaciju
	
	*******ako bookmark nema title "  - url"
	
	*******probaj izbaciti one funkcije addBtnL....možda kada je na header drag enter da ih dodaš
	******* je trash prije searcha - ostane clear trash aktivan
	*******search bookmark folder drag start napravi
	*******delete bookmark search nema animaciju tree
	*******kada se trash aktivira scroll treba biti 0
	*******recent ne smije prikazivati trash... na refresh ga obnovi samo
	*******start samo na bb i all
	---------NEMOŽE!!!!!! cut paste animacija??? refreša se

	*******del animacija za folder i listu
	*******undelete - ako je trash ostao prazan nema bg
	*******RECENT BOOKMARKS SE NEMOGU OBRISATI... NEMOJ REFRESH VEČ SAMO MAKNI
	*******klik na ikonu foldera ne otvori sve
	
	*******settings...ako je prozor uži od 1144 makni social
	save session on speed dial or all bookmarks
	*******recent- tree search - close search...nevalja ...vrati na unsorted umjesto na recent
	*******zatvori roots na tree search, stiliziraj ih--- na hover, liste animacija cursor itd
	*******unsorted istestiraj sa recent sve varijante....sa searcha sa reveal....
	******* ne!!! ime separatora u prazan string
	aktivni buttoni...nešto drugo
	makni brojeve iz msg
	
	
	*******na bookmark all tabs moraš otvoriti folder i spremit taj otvoreni!!!!!!!!
	*******ne radi scroll na nove bookmarkse...treba napraviti
	*******desni klik + kontrol ne označi
	*******recent bookmarks - trash popravi..ne prikazuj iz trasha
	probaj update napraviti
	*******svi datumi na novu foru
	---------NE!!!!!!alt meni na spearator
*/

const prva = () => {
  lA = 1;

  let getS = document.getElementById("tcss");
  if (getS) document.head.removeChild(getS);

  chrome.storage.local.get(
    ["folders", "scr", "last", "OF", /* 'lSel', */ "sep", "SF", "gData"],
    r => {
      (last = r.last),
        (scr = r.scr),
        (folders = r.folders),
        (OF = r.OF),
        /* lSel = r.lSel, */ (sepBkm = r.sep),
        (SF = r.SF);

      gData = r.gData;
      let wT;

      if (gData.t_ === "td2.css") wT = "bkm2.css";
      else wT = "bkm.css";

      setTheme(wT);

      if (gData.scope !== "per-origin")
        zS.style.backgroundImage = 'url("img/per_tab.svg")';

      if (gData.uns) {
        recent.style.display = "none";
        unsorted.style.display = "block";
      }

      if (last === "recent") _recBkm();
      else {
        if (last === "trash" || last === "other") last = "user_root";

        chrome.bookmarks.getRootByName(last, root => {
          rid = root.id;
          makeRoot();
          document.getElementById(last).className = "hbN hbA";
        });
      }

      setTimeout(() => {
        hT.style.display = "block";
        btmT.style.display = "block";
        panel.style.display = "block";

        panel.scrollTop = frScr;

        if (gData.sr === 1) {
          d_d_x.style.top = 60 + "px";

          if (gData.srEnt) {
            sbk.addEventListener("input", e_BSI_f);
            sbk.addEventListener("keydown", entSrt_f);
          } else sbk.addEventListener("input", BSI_f);
        } else {
          d_d_x.style.top = 87 + "px";

          if (gData.srEnt) {
            sbk.addEventListener("input", e_BSI);
            sbk.addEventListener("keydown", entSrt);
          } else sbk.addEventListener("input", BSI);
        }
      }, 50);
    }
  );
};

const makeRoot = (a, b) => {
  focusOn = null;

  chrome.bookmarks.getSubTree(rid, sub => {
    if (chrome.runtime.lastError) console.log(chrome.runtime.lastError.message);

    let rt = sub[0].children;
    let rl = document.createElement("div");

    panel.innerHTML = "";
    r_s = Date.now();

    rl.id = "li" + rid;
    if (lA) rl.className = "anim";
    rl.style.paddingLeft = 5 + "px";
    panel.appendChild(rl);

    rl.style.zoom = gData.zoom + "%";

    dzzd = gData.zoom / 100;
    dzzd_mY = Math.floor(12 * dzzd);

    if (rt.length) {
      if (last === "trash") {
        _ctn(rt);

        trashClear.style.display = "block";
      } else {
        if (gData.folCh) _cn(rt, 1, 1, 1);
        else _cn(rt, 1, 0, 1);

        if (!OF) _of();
        else _osf();

        trashClear.style.display = "none";
      }
    } else {
      let pzbg = document.createElement("div");
      pzbg.id = "trashpzbg";
      panel.appendChild(pzbg);

      let pz = document.createElement("div");
      pz.id = "trashBg";
      pz.className = "bg_img";
      if (last === "trash") pz.style.backgroundImage = "url('/img/trash.svg')";
      else if (last === "user_root")
        pz.style.backgroundImage = "url('/img/myFolders.svg')";
      else if (last === "bookmarks_bar")
        pz.style.backgroundImage = "url('/img/bkmBar.svg')";
      else if (last === "unsorted")
        pz.style.backgroundImage = "url('/img/unsorted.svg')";
      else if (last === "other")
        pz.style.backgroundImage = "url('/img/imp.svg')";
      pzbg.appendChild(pz);

      trashClear.style.display = "none";
    }

    if (last === "speed_dial") {
      try {
        rl.childNodes[0].getElementsByClassName("fav")[0].innerHTML = fo_;
        rl.childNodes[1].style.display = "block";
      } catch (e) {}
    }

    if (a) _revSel(a);
    else if (focusOn) {
      if (!b) panel.scrollTop = focusOn.offsetTop * dzzd - 150;
    }

    lA = 0;

    setTimeout(_f, 800);
  });
};

/*************** MAKE NODES **************************/

const _cn = (a, b, c, d) => {
  // create nodes
  for (let j = 0, d = a.length; j < d; j++) {
    if (a[j].children) {
      _mfn(a[j], b, c);
      _cn(a[j].children, b, c, d);
    } else if (!a[j].url.startsWith("v7")) _mbn(a[j], d);
    else _msn(a[j]);
  }
};

const _ctn = a => {
  // create trash nodes
  for (let j = 0, d = a.length; j < d; j++) {
    if (a[j].children) {
      _mfn(a[j], 0, 1);
      _ctn(a[j].children);
    } else _mbn(a[j]);
  }
};

const _mfn = (a, b, c) => {
  // make folder node
  let f = document.createElement("div");
  f.className = "fNor";
  f.id = a.id;
  f.index = a.index;
  f.parentId = a.parentId;

  let fi = document.createElement("div");
  fi.className = "fav";
  fi.innerHTML = fc_;
  f.appendChild(fi);

  let ft = document.createElement("div");
  ft.className = "bT";
  ft.textContent = a.title;

  if (c) {
    let chNmb = document.createElement("div");
    chNmb.className = "fch";
    chNmb.textContent = a.children.length;
    ft.style.right = 34 + "px";
    /* 		if (a.children.length > 999) ft.style.right = 42+'px';
		else if (a.children.length > 99) ft.style.right = 34+'px';
		else if (a.children.length > 9) ft.style.right = 26+'px'; */

    f.appendChild(chNmb);
  } else ft.style.right = 0 + "px";

  f.appendChild(ft);

  let fl = document.createElement("div");
  fl.id = "li" + a.id;
  fl.style.display = "none";
  fl.className = "baseL";

  let p = document.getElementById("li" + a.parentId);
  p.appendChild(f);
  p.appendChild(fl);

  f.addEventListener("mouseup", _f_mu);
  f.addEventListener("dragend", _dgEnd);

  if (b) {
    f.addEventListener("dragstart", _f_ds);
    f.addEventListener("dragenter", _f_de);
    f.addEventListener("dragover", _f_do);
    f.addEventListener("dragleave", _f_dl);
    f.addEventListener("drop", _f_dd);

    if (r_s - a.dateAdded < 2000) {
      focusOn = f;
      _nN(f);
    }
  }
};

const _mbn = (a, b) => {
  // make bookmark node
  let bn = document.createElement("div");
  bn.className = "bNor";
  bn.id = a.id;
  bn.url = a.url;
  bn.index = a.index;
  bn.parentId = a.parentId;
  if (gData.tt) bn.title = a.url;

  let fi = document.createElement("div");
  fi.className = "fav";
  fi.style.backgroundImage = "url(chrome://favicon/" + a.url + ")";
  bn.appendChild(fi);

  let bt = document.createElement("div");
  bt.className = "bT";
  if (a.title === "") {
    bt.innerText = "\u00a0\u00a0\u00a0 ...  " + a.url;
    bt.style.opacity = "0.8";
    //bt.textContent = a.url;
    //bt.style.color = '#808080';
    /* bt.style.fontSize = '11px'; */
    /* bt.style.paddingLeft = '20px'; */
  } else bt.textContent = a.title;
  bn.appendChild(bt);

  document.getElementById("li" + a.parentId).appendChild(bn);

  //bn.addEventListener('dblclick', bkmDblClick);
  bn.addEventListener("mouseup", _b_mu);
  bn.addEventListener("dragend", _dgEnd);

  if (b) {
    bn.addEventListener("dragstart", _b_ds);
    bn.addEventListener("dragenter", _b_de);
    bn.addEventListener("dragover", _b_do);
    bn.addEventListener("dragleave", _b_dl);
    bn.addEventListener("drop", _b_dd);

    if (r_s - a.dateAdded < 2000) {
      focusOn = bn;
      _nN(bn);
    }
  }
};

const _msn = a => {
  // make separator node
  let sn = document.createElement("div");
  sn.className = "sepNor";
  sn.id = a.id;
  sn.url = a.url;
  sn.index = a.index;
  sn.parentId = a.parentId;

  let h1 = sepBkm.m * 2 + ~~sepBkm.h;
  sn.style.height = h1 + "px";

  let iB = document.createElement("div");
  iB.className = "iBclass";
  iB.style.height = sepBkm.h + "px";
  iB.style.backgroundColor = sepBkm.b;
  iB.style.top = sepBkm.m + "px";
  sn.appendChild(iB);

  document.getElementById("li" + a.parentId).appendChild(sn);

  sn.addEventListener("mouseup", _s_mu);
  sn.addEventListener("dragstart", _s_ds);
  sn.addEventListener("dragenter", _s_de);
  sn.addEventListener("dragover", _s_do);
  sn.addEventListener("dragleave", _s_dl);
  sn.addEventListener("drop", _s_dd);
  sn.addEventListener("dragend", _dgEnd);
};

/* open folders */
const _of = () => {
  // open folders
  if (last === "bookmarks_bar") {
    let tmp = folders.bookmarks_bar;
    _fopHelper(tmp, "bookmarks_bar");
  } else if (last === "user_root") {
    let tmp = folders.user_root;
    _fopHelper(tmp, "user_root");
  } else if (last === "unsorted") {
    let tmp = folders.unsorted;
    _fopHelper(tmp, "unsorted");
  } else if (last === "other") {
    let tmp = folders.other;
    _fopHelper(tmp, "other");
  }
};

const _fopHelper = (a, b) => {
  // open folders helper part 2
  for (let i = a.length; i--; ) {
    let f1 = document.getElementById(a[i]);

    if (f1) {
      f1.getElementsByClassName("fav")[0].innerHTML = fo_;
      f1.nextSibling.style.display = "block";
    } else a.splice(i, 1);
  }

  frScr = scr[b];
  if (!focusOn) panel.scrollTop = frScr;
};

const _osf = () => {
  // open single folder
  if (
    last === "bookmarks_bar" ||
    last === "user_root" ||
    last === "unsorted" ||
    last === "other"
  ) {
    let f1 = document.getElementById(SF[last]);

    if (f1) {
      f1.getElementsByClassName("fav")[0].innerHTML = fo_;
      f1.nextSibling.style.display = "block";

      let pl = f1.parentNode;
      while (pl.className === "baseL") {
        pl.style.display = "block";
        pl.previousSibling.getElementsByClassName("fav")[0].innerHTML = fo_;
        pl = pl.parentNode;
      }
    }

    panel.scrollTop = scr[last];
  }
};

const _st = () => {
  // switch theme
  let getS = document.getElementById("tcss");
  if (getS) document.head.removeChild(getS);

  let s = document.createElement("link");
  s.rel = "stylesheet";
  s.id = "tcss";
  s.type = "text/css";
  s.href = chrome.extension.getURL(gData.t_);
  document.head.appendChild(s);

  if (gData.t_ === "tl.css")
    d_d_9.textContent = chrome.i18n.getMessage("theme");
  else d_d_9.textContent = chrome.i18n.getMessage("theme_");
};

const _saveG = () => {
  // save general settings storage timeout
  chrome.storage.local.set({ gData: gData });
};

const _ur = a => {
  // user root
  let pr = document.getElementsByClassName("hbN hbA")[0];
  if (pr) pr.className = "hbN";

  user_root.className = "hbN hbA";

  chrome.bookmarks.getRootByName("user_root", r => {
    (rid = r.id), (last = "user_root");
    makeRoot(a);
  });

  chrome.storage.local.set({ last: "user_root" });

  kbHelper = !1;
};

const _bb = a => {
  // bookmarks bar
  let pr = document.getElementsByClassName("hbN hbA")[0];
  if (pr) pr.className = "hbN";

  bookmarks_bar.className = "hbN hbA";

  chrome.bookmarks.getRootByName("bookmarks_bar", r => {
    (rid = r.id), (last = "bookmarks_bar");
    makeRoot(a);
  });

  chrome.storage.local.set({ last: "bookmarks_bar" });

  kbHelper = !1;
};

const _uns = a => {
  // unsorted
  let pr = document.getElementsByClassName("hbN hbA")[0];
  if (pr) pr.className = "hbN";

  if (gData.uns) unsorted.className = "hbN hbA";

  chrome.bookmarks.getRootByName("unsorted", r => {
    (rid = r.id), (last = "unsorted");
    makeRoot(a);
  });

  chrome.storage.local.set({ last: "unsorted" });

  kbHelper = !1;
};

const _sd = a => {
  // speed dial
  let pr = document.getElementsByClassName("hbN hbA")[0];
  if (pr) pr.className = "hbN";

  speed_dial.className = "hbN hbA";

  chrome.bookmarks.getRootByName("speed_dial", r => {
    (rid = r.id), (last = "speed_dial");
    makeRoot(a);
  });

  chrome.storage.local.set({ last: "speed_dial" });

  kbHelper = !1;
};

const _oth = a => {
  // other
  let pr = document.getElementsByClassName("hbN hbA")[0];
  if (pr) pr.className = "hbN";

  //other.className = 'hbN hbA';

  chrome.bookmarks.getRootByName("other", r => {
    (rid = r.id), (last = "other");
    makeRoot(a);
  });

  chrome.storage.local.set({ last: "other" });

  kbHelper = !1;
};

const _tr = a => {
  // trash
  let pr = document.getElementsByClassName("hbN hbA")[0];
  if (pr) pr.className = "hbN";

  trash.className = "hbN hbA";

  chrome.bookmarks.getRootByName("trash", r => {
    (rid = r.id), (last = "trash");
    makeRoot(a);
    panel.scrollTop = 0;
  });

  chrome.storage.local.set({ last: "trash" });

  kbHelper = !1;
};

const _D = (sr, bk) => {
  // delete function main
  let del_id = [];

  if (sr) {
    if (bk) {
      // delete bookmark from search
      m2t([rcBN.id], 1);

      _del_anim(rcBN);
    } else {
      //delete folder from search
      del_id.push(rcFN.id);

      rcFN.nextSibling.style.opacity = "0";

      _del_anim(rcFN, rcFN.nextSibling);

      m2t(del_id, 1);

      if (sbk.value !== "") {
        // pronađi svu djecu obrisanog foldera i makni ih
        let test = sbk.value.toLowerCase();

        chrome.bookmarks.getSubTree(rcFN.id, st => {
          let rs = st[0].children;
          let remI = [];

          const delSub = a => {
            for (let j = 0, d = a.length; j < d; j++) {
              if (a[j].url) {
                let t_ = (a[j].title + " " + a[j].url).toLowerCase();
                if (t_.indexOf(test) > -1) remI.push(a[j].id);
              } else if (a[j].children) {
                if (a[j].title.toLowerCase().indexOf(test) > -1)
                  remI.push(a[j].id);
                delSub(a[j].children);
              }
            }
          };

          delSub(rs);

          for (let k = remI.length; k--; ) {
            let gn = document.getElementById(remI[k]);
            if (gn) gn.parentNode.removeChild(gn);
          }

          rcFN = null;
        });
      }

      kbHelper = !1;

      setTimeout(_flashBtn, 700, "trash");
    }
  } else {
    // delete selected from any other panel than search
    let f = document.getElementsByClassName("fSel");
    let b = document.getElementsByClassName("bSel");
    let s = document.getElementsByClassName("sepSel");

    for (let i = f.length; i--; ) {
      del_id.push(f[i].id);

      f[i].nextSibling.style.opacity = "0";

      _del_anim(f[i], f[i].nextSibling);
    }

    for (let g = s.length; g--; ) {
      del_id.push(s[g].id);

      s[g].parentNode.removeChild(s[g]);
    }

    for (let j = b.length; j--; ) {
      del_id.push(b[j].id);

      _del_anim(b[j]);
    }

    kbHelper = !1;

    if (f.length + b.length > 0) setTimeout(_flashBtn, 700, "trash");

    m2t(del_id);
  }
};

const _d_cb = () => {
  // delete ctx base
  let c = ctxB.children;
  for (let i = c.length; i--; ) c[i].style.display = "none";

  ctxB.style.display = "none";

  window.removeEventListener("blur", _d_cb);
  document.removeEventListener("keydown", keyContext);
  document.addEventListener("keydown", tDel);
};

/***************   SEARCH    **************************/

/*************** TREE SEARCH **************************/

/* function BSF(e) {
	let t = document.getElementById('Spanel');
	if (!t && (this.value !== '')) makeSN();
} */

function entSrt(e) {
  /*THIS*/ //.... keydown listener kada je enter uključen
  if (13 === e.keyCode) {
    if (this.value.length > 1) BSS(this.value);
  }
}

function e_BSI(e) {
  /*THIS*/ //.... input listener kada je enter uključen
  let pc = document.getElementsByClassName("hbN hbA")[0];
  if (pc) pc.className = "hbN";

  if (this.value.length < 1) _sr_0();
}

function BSI(e) {
  /*THIS*/
  let pc = document.getElementsByClassName("hbN hbA")[0];
  if (pc) pc.className = "hbN";

  if (this.value.length > 1) BSS(this.value);
  else if (this.value.length === 1) makeSN();
  else if (this.value.length < 1) _sr_0();
}

const BSS = q => {
  // search - prepare
  kbHelper = !1;

  let getBN = document.querySelectorAll(".bNor, .bSel"),
    b1 = getBN.length;
  while (b1--) getBN[b1].parentNode.removeChild(getBN[b1]);

  let getAF = document.querySelectorAll(".fNor, .fSel, .baseL, .rF"),
    b3 = getAF.length;
  while (b3--) getAF[b3].style.display = "none";

  let getSP = document.getElementById("Spanel");

  if (!getSP) makeSN(q);
  else _bs(q);
};

const makeSN = a => {
  // create search panel and folders on "VALUE = 1" or if there is no "Spanel"
  panel.innerHTML = "";

  let sPanel = document.createElement("div");
  sPanel.id = "Spanel";
  sPanel.style.zoom = gData.zoom + "%";
  panel.appendChild(sPanel);

  trashClear.style.display = "none";

  chrome.bookmarks.getTree(tree => {
    let srRes = tree[0].children;

    for (let j = 0, d = srRes.length; j < d; j++) {
      let r = document.createElement("div");
      r.className = "rF";
      r.id = srRes[j].id;
      r.textContent = srRes[j].title;
      r.style.display = "none";
      sPanel.appendChild(r);

      let rL = document.createElement("div");
      rL.id = "li" + srRes[j].id;
      rL.className = "baseL";
      rL.root = srRes[j].id;
      rL.style.display = "none";
      sPanel.appendChild(rL);

      r.addEventListener("click", rootCl);

      let rFl = srRes[j].id;

      const prSearch = (ba, p) => {
        let pa = document.getElementById(p);

        for (let i = 0, l = ba.length; i < l; i++) {
          if (ba[i].children) {
            let f = document.createElement("div");
            f.className = "fNor";
            f.id = ba[i].id;
            f.root = rFl;
            f.style.display = "none";

            let sb = document.createElement("div");
            sb.className = "srBtn";
            f.appendChild(sb);

            let fi = document.createElement("div");
            fi.className = "fav";
            fi.style.pointerEvents = "none";
            fi.title = chrome.i18n.getMessage("reveal");
            fi.innerHTML = fo_;
            sb.appendChild(fi);

            let ft = document.createElement("div");
            ft.className = "bT";
            ft.textContent = ba[i].title;
            f.appendChild(ft);

            let bl = document.createElement("div");
            bl.id = "li" + ba[i].id;
            bl.style.display = "none";
            bl.root = rFl;
            bl.className = "baseL";

            pa.appendChild(f);
            pa.appendChild(bl);

            f.addEventListener("mouseup", _sr_f_mu);
            f.addEventListener("dragend", _dgEnd);

            prSearch(ba[i].children, bl.id);
          }
        }
      };

      prSearch(srRes[j].children, rL.id);
    }

    if (a) _bs(a);
  });
};

const _bs = g => {
  // tree search - render results

  chrome.bookmarks.getTree(tree => {
    let r = tree[0].children;
    let root;
    let ra_ = [];
    let a = g.toLowerCase();

    for (let i = 0, l = r.length; i < l; i++) {
      let c_ = r[i].children;

      root = r[i].id;

      const _rtt = c => {
        for (let j = 0, d = c.length; j < d; j++) {
          if (c[j].children) {
            let a_ = c[j].title.toLowerCase();

            if (a_.indexOf(a) > -1) {
              let tn = Object.assign({}, c[j]);
              tn.root = root;
              ra_.push(tn);
            }

            _rtt(c[j].children);
          } else {
            if (!c[j].url.startsWith("v7")) {
              let t_u = (c[j].title + " " + c[j].url).toLowerCase();

              if (t_u.indexOf(a) > -1) {
                let tn = Object.assign({}, c[j]);
                tn.root = root;
                ra_.push(tn);
              }
            }
          }
        }
      };

      _rtt(c_);
    }

    if (ra_.length) {
      let pL = {};

      for (let i = 0, l = ra_.length; i < l; i++) {
        if (ra_[i].url) {
          //bookmark
          if (!ra_[i].url.startsWith("v7")) {
            let b = document.createElement("div");
            b.className = "bNor";
            b.id = ra_[i].id;
            b.url = ra_[i].url;
            if (gData.tt) b.title = ra_[i].url + "\n" + ra_[i].url;

            let sb = document.createElement("div");
            sb.className = "srBtn";
            b.appendChild(sb);

            let fi = document.createElement("div");
            fi.className = "fav";
            fi.style.backgroundImage =
              "url(chrome://favicon/" + ra_[i].url + ")";
            fi.title = chrome.i18n.getMessage("reveal");
            sb.appendChild(fi);

            let bt = document.createElement("div");
            bt.className = "bT";
            if (ra_[i].title === "") {
              bt.innerText = "\u00a0\u00a0\u00a0 ...  " + ra_[i].url;
              bt.style.opacity = "0.8";
            } else bt.textContent = ra_[i].title;
            b.appendChild(bt);

            let pf = document.getElementById("li" + ra_[i].parentId);

            pf.appendChild(b);

            pL[pf.id] = 1;

            b.addEventListener("mouseup", _sr_b_mu);
            b.addEventListener("dragstart", _b_ds);
            b.addEventListener("dragend", _dgEnd);
          }
        } else {
          //folder
          let tf = document.getElementById(ra_[i].id);
          tf.style.display = "block";

          let pf = tf.parentNode;

          pL[pf.id] = 1;
        }
      }

      let gL = document.getElementsByClassName("baseL"),
        j = gL.length;

      while (j--) {
        let tg = gL[j].id;
        if (pL[tg]) {
          gL[j].style.display = "block";
          gL[j].previousSibling.style.display = "block";

          let np = gL[j].parentNode;

          while (np.id !== "Spanel") {
            np.style.display = "block";
            np.previousSibling.style.display = "block";
            np = np.parentNode;
          }
        }
      }

      let gtp = document.getElementById("sBg");
      if (gtp) gtp.parentNode.removeChild(gtp);
    } else {
      let pz = document.createElement("div");
      pz.id = "sBg";
      pz.className = "bg_img";
      pz.style.backgroundImage = "url('/img/noSr.svg')";
      panel.appendChild(pz);
    }
  });
};

function rootCl(e) {
  /*THIS*/
  if (e.button === 0) {
    let l = document.getElementById("li" + this.id);

    if (l.style.display === "block")
      l.animate([{ maxHeight: "100%" }, { maxHeight: "0%" }], {
        duration: 200,
        steps: 2,
        webkitAnimationTimingFunction: "ease-out",
      }).onfinish = () => {
        l.style.display = "none";
      };
    else {
      l.style.display = "block";

      l.animate([{ maxHeight: "0%" }, { maxHeight: "100%" }], {
        duration: 200,
        steps: 2,
        webkitAnimationTimingFunction: "ease-out",
      });
    }
  }
}

/***************** FLAT SEARCH ************************/

/* function BSF_f(e) {
	let t = document.getElementById('Spanel');
	if (!t && (this.value !== '')) makeSN_(1);
} */

function entSrt_f(e) {
  /*THIS*/ //.... keydown listener kada je enter uključen
  if (13 === e.keyCode) {
    if (this.value.length > 1) {
      let gp = document.getElementById("SpanelF");
      if (gp) _bs_f(this.value, gp);
      else makeSN_f(this.value);
    }
  }
}

function e_BSI_f(e) {
  /*THIS*/ //.... input listener kada je enter uključen
  let pc = document.getElementsByClassName("hbN hbA")[0];
  if (pc) pc.className = "hbN";
  if (this.value.length < 1) _sr_0();
}

function BSI_f(e) {
  /*THIS*/
  let pc = document.getElementsByClassName("hbN hbA")[0];
  if (pc) pc.className = "hbN";

  if (this.value.length > 1) {
    let gp = document.getElementById("SpanelF");
    if (gp) _bs_f(this.value, gp);
    else makeSN_f(this.value);
  } else if (this.value.length === 1) makeSN_f();
  else if (this.value.length < 1) _sr_0();
}

const makeSN_f = a => {
  // make search panel - FLAT -  and continue if passed argument
  panel.innerHTML = "";

  let sPanel = document.createElement("div");
  sPanel.id = "SpanelF";
  sPanel.style.paddingLeft = 5 + "px";
  sPanel.style.zoom = gData.zoom + "%";
  panel.appendChild(sPanel);

  trashClear.style.display = "none";

  if (a) _bs_f(a, sPanel);
};

const _bs_f = (g, b) => {
  // pronađi rezultate
  b.innerHTML = "";

  chrome.bookmarks.getTree(tree => {
    let r = tree[0].children;
    let root;
    let ra_ = [];
    let a = g.toLowerCase();

    for (let i = 0, l = r.length; i < l; i++) {
      let c_ = r[i].children;

      root = r[i].id;

      const _rt = c => {
        for (let j = 0, d = c.length; j < d; j++) {
          if (c[j].children) {
            let a_ = c[j].title.toLowerCase();

            if (a_.indexOf(a) > -1) {
              let tn = Object.assign({}, c[j]);
              tn.root = root;
              ra_.push(tn);
            }

            _rt(c[j].children);
          } else {
            if (!c[j].url.startsWith("v7")) {
              let t_u = (c[j].title + " " + c[j].url).toLowerCase();

              if (t_u.indexOf(a) > -1) {
                let tn = Object.assign({}, c[j]);
                tn.root = root;
                ra_.push(tn);
              }
            }
          }
        }
      };

      _rt(c_);
    }

    if (ra_.length) {
      for (let k = 0, m = ra_.length; k < m; k++) _r_sn(ra_[k], b, ra_[k].root);

      let gtp = document.getElementById("sBg");
      if (gtp) gtp.parentNode.removeChild(gtp);
    } else {
      let pz = document.createElement("div");
      pz.id = "sBg";
      pz.className = "bg_img";
      pz.style.backgroundImage = "url('/img/noSr.svg')";
      panel.appendChild(pz);
    }
  });
};

const _r_sn = (a, p_, r_) => {
  // render search node
  if (a.url) {
    //bookmark
    let b = document.createElement("div");
    b.className = "bNor";
    b.id = a.id;
    b.url = a.url;
    b.p = a.parentId;
    b.root = r_;
    if (gData.tt) b.title = a.url + "\n" + a.url;

    let sb = document.createElement("div");
    sb.className = "srBtn";

    b.appendChild(sb);

    let f = document.createElement("div");
    f.className = "fav";
    f.style.backgroundImage = "url(chrome://favicon/" + a.url + ")";
    f.title = chrome.i18n.getMessage("reveal");
    sb.appendChild(f);

    let t = document.createElement("div");
    t.className = "bT";
    if (a.title === "") {
      t.innerText = "\u00a0\u00a0\u00a0 ...  " + a.url; //t.textContent = a.url;
      t.style.opacity = "0.8";
    } else t.textContent = a.title;
    b.appendChild(t);

    p_.appendChild(b);

    b.addEventListener("mouseup", _sr_b_mu);
    b.addEventListener("dragstart", _b_ds);
    b.addEventListener("dragend", _dgEnd);
  } else {
    //folder
    let f = document.createElement("div");
    f.className = "fNor";
    f.id = a.id;
    f.index = a.index;
    f.parentId = a.parentId;
    f.root = r_;

    let sb = document.createElement("div");
    sb.className = "srBtn";
    f.appendChild(sb);

    let fi = document.createElement("div");
    fi.className = "fav";
    fi.style.pointerEvents = "none";
    fi.title = chrome.i18n.getMessage("reveal");
    fi.innerHTML = fc_;
    sb.appendChild(fi);

    let ft = document.createElement("div");
    ft.className = "bT";
    ft.textContent = a.title;
    f.appendChild(ft);

    /* 		let fl = document.createElement('div');
		fl.id = 'li' + f.id;
		fl.style.display = 'none';
		fl.className = 'baseL'; */

    p_.appendChild(f);
    //p_.appendChild(fl);

    f.addEventListener("mouseup", _sr_f_mu);
    f.addEventListener("dragend", _dgEnd);

    /* 	f.addEventListener('dragstart', _f_ds);
			f.addEventListener('dragenter', _f_de);				
			f.addEventListener('dragover', _f_do);
			f.addEventListener('dragleave', _f_dl);
			f.addEventListener('drop', _f_dd); */
  }
};

/**************** ZAJEDNIČKE FUNKCIJE ************************/

function _sr_f_mu(e) {
  /*THIS*/ // folder search mouse up - flat & tree
  if (e.button === 0 && e.detail === 1) {
    if (e.target.className === "srBtn") _rev(this.root, this.id);
    else {
      _dSel(1);

      this.className = "fSel";

      let fl = document.getElementById("li" + this.id);

      if (fl) {
        let _f = this.getElementsByClassName("fav")[0];

        if (fl.style.display === "none") {
          _f.innerHTML = fo_;

          fl.style.display = "block";

          fl.animate([{ maxHeight: "0%" }, { maxHeight: "100%" }], {
            duration: 150,
            steps: 2,
            webkitAnimationTimingFunction: "ease-out",
          });
        } else {
          fl.animate([{ maxHeight: "100%" }, { maxHeight: "0%" }], {
            duration: 200,
            steps: 2,
            webkitAnimationTimingFunction: "ease-out",
          }).onfinish = () => {
            fl.style.display = "none";
            _f.innerHTML = fc_;
          };
        }
      }
    }
  } else if (e.button === 1) {
    _dSel(1);

    this.className = "fSel";

    openT(this.id);
  } else if (e.button === 2) {
    _dSel(1);

    this.className = "fSel";

    rcFN = this;

    _sr_f_ctx(e.pageX, e.pageY);
  }

  kbHelper = this.id;
}

const _sr_f_ctx = (a, b) => {
  // create ctx menu for folder on search panel
  let rx = a,
    ry = b;

  if (rx + rcSafe.searchFol > document.body.clientWidth)
    rx = document.body.clientWidth - rcSafe.searchFol;
  if (ry + 340 > document.body.clientHeight)
    ry = document.body.clientHeight - 340;

  r_fs.style.top = ry + "px";
  r_fs.style.left = rx + "px";
  r_fs.style.display = "block";

  r_fs.addEventListener("click", _sr_f_ctx_L);

  _aL();
};

const _sr_f_ctx_L = e => {
  // FOLDER search ctx menu click listener
  if (e.button === 0) {
    if (e.target.id === "r_fs_1") openSel("t", !1, 1, 1);
    else if (e.target.id === "r_fs_2") openSel("w", !1, 1, 1);
    else if (e.target.id === "r_fs_3") openSel("w", !!1, 1, 1);
    else if (e.target.id === "r_fs_9") {
      let f = document.getElementsByClassName("fSel")[0];

      if (f) {
        chrome.tabs.query({ currentWindow: !!1, active: !!1 }, t => {
          chrome.bookmarks.create({
            parentId: f.id,
            index: 0,
            title: t[0].title,
            url: t[0].url,
          });
        });
      }
    } else if (e.target.id === "r_fs_10") {
      (cutB = []), (copyB = []);

      let f = document.getElementsByClassName("fSel")[0];

      if (f) cutB.push(f.id);
    } else if (e.target.id === "r_fs_12") {
      e.stopPropagation();

      r_fs.style.display = "none";

      p_nf.style.display = "block";

      p_nf_1.value = rcFN.getElementsByClassName("bT")[0].textContent;

      p_nf_1.select();

      p_nf.version = 2;

      p_nf.addEventListener("click", bkmFP_Cl);
    } else if (e.target.id === "r_fs_13") _D(1);
  }
};

function _sr_b_mu(e) {
  /*THIS*/ // bookmark search mouse up - flat & tree
  if (e.button === 0) {
    if (e.target.className === "fav") {
      let r = this.root || this.parentNode.root;

      _rev(r, this.id);
    } else {
      if (e.detail === 2) {
        let tUrl = this.url;

        chrome.tabs.query({ currentWindow: !!1, active: !!1 }, tabs => {
          chrome.tabs.update({ url: tUrl });
          if (gData.wClose) window.close();
        });
      } else {
        if (e.ctrlKey && gData.CAT) {
          chrome.tabs.create({ url: this.url, active: !!1 });

          if (gData.wClose) window.close();
        } else {
          _dSel(1);

          this.className = "bSel";

          if (gData.sCl) {
            chrome.tabs.update({ url: this.url });
            if (gData.wClose) window.close();
          }
        }
      }
    }
  } else if (e.button === 1) {
    _dSel(1);

    chrome.tabs.create({ url: this.url, active: !1 });

    this.className = "bSel";
  } else if (e.button === 2) {
    rcBN = this;

    _sr_b_ctx(this, e.pageX, e.pageY);
  }

  kbHelper = this.id;
}

const _sr_b_ctx = (n, a, b) => {
  // create ctx menu for bookmark on search panel
  let rx = a,
    ry = b;

  if (rx + rcSafe.searchBkm > document.body.clientWidth)
    rx = document.body.clientWidth - rcSafe.searchBkm;

  if (ry + 210 > document.body.clientHeight)
    ry = document.body.clientHeight - 210;

  if (n.className == "bNor") {
    _dSel(1);
    n.className = "bSel";
  }

  r_sm.style.top = ry + "px";
  r_sm.style.left = rx + "px";
  r_sm.style.display = "block";

  r_sm.addEventListener("click", _sr_b_ctx_L);

  _aL();
};

const _sr_b_ctx_L = e => {
  // BOOKMARK search ctx menu click listener
  let id_ = e.target.id;

  if (id_ === "r_sm_1") openSel("t", !1, 1);
  /* popravljeno u openSel */ else if (id_ === "r_sm_2") openSel("w", !1, 1);
  /* popravljeno u openSel */ else if (id_ === "r_sm_3") openSel("w", !!1, 1);
  /* popravljeno u openSel */ else if (id_ === "r_sm_4") {
    /* popravljeno */
    (cutB = []), (copyB = []);

    cutB.push(rcBN.id);
  } else if (id_ === "r_sm_5") {
    /* popravljeno */
    (cutB = []), (copyB = []);
    let _urls = "";
    let tmpBkm = { t: "", u: rcBN.url };

    let tmpT = rcBN.getElementsByClassName("bT")[0];
    if (tmpT.innerText.startsWith("\u00a0")) tmpBkm.t = "";
    else tmpBkm.t = tmpT.textContent;

    copyB.push(tmpBkm);

    if (gData.rcCopy) {
      let shadowIn = document.createElement("textarea");
      shadowIn.type = "text";
      shadowIn.className = "shadowIn";
      shadowIn.value = rcBN.url;
      document.body.appendChild(shadowIn);
      shadowIn.select();
      document.execCommand("Copy", !1, null);
      document.body.removeChild(shadowIn);
    }
  } else if (id_ === "r_sm_6") {
    /* popravljeno u bkmBP_CL */
    e.stopPropagation();

    r_bm.style.display = "none";
    r_sm.style.display = "none";

    let tmpT = rcBN.getElementsByClassName("bT")[0];
    if (tmpT.innerText.startsWith("\u00a0")) p_eb_2.value = "";
    else p_eb_2.value = tmpT.textContent;

    p_eb_2.select();
    p_eb_3.value = rcBN.url;

    p_eb.style.display = "block";

    p_eb.addEventListener("click", bkmBP_CL);
  } else if (id_ === "r_sm_7") _D(1, 1);
};

const _sr_0 = () => {
  //when search value is 0, go to previous root
  lA = 1;

  if (last === "recent") {
    _recBkm();
    _flashBtn("recent");
  } else {
    if (!last || last === "search") last = "user_root";

    chrome.bookmarks.getRootByName(last, r => {
      rid = r.id;
      makeRoot();
      _flashBtn(last);
    });
  }

  document.getElementById(last).className = "hbN hbA";
};

/************************************************/

window.onload = () => {
  prva();
  panel.addEventListener("scroll", _p_sc);
  panel.addEventListener("mousewheel", _p_wh);
  document.addEventListener("contextmenu", e => {
    e.preventDefault();
  });
  hT.addEventListener("click", _h_cl);
  setTimeout(tmo, 700);
  btmT.addEventListener("mouseup", _b_cl);

  fa.o = dd.o = trash.o = 0;
};

const tmo = () => {
  // time out
  document.addEventListener("keydown", tDel);

  sbk.addEventListener("contextmenu", e => {
    e.stopPropagation();
  });

  panel.addEventListener("mousedown", _p_md);
  panel.addEventListener("dragover", e => {
    e.preventDefault();
  });
  panel.addEventListener("drop", _p_d);

  ctxB.addEventListener("click", _d_cb);

  hT.addEventListener("dragenter", _h_de);

  let thgz = document.querySelectorAll("[data-i18n]");
  for (let i = thgz.length; i--; )
    thgz[i].textContent = chrome.i18n.getMessage(
      thgz[i].getAttribute("data-i18n")
    );

  let tl = chrome.i18n.getUILanguage();

  if (tl === "ru") {
    rcSafe = {
      bookmark: 184,
      searchBkm: 184,
      searchFol: 186,
      folder: 227,
      panel: 144,
      trash: 167,
      separator: 96,
      multiSel: 185,
      altMenu: 216,
      topM: "55px",
    };
  } else if (tl === "ja") {
    rcSafe = {
      bookmark: 205,
      searchBkm: 205,
      searchFol: 205,
      folder: 258,
      panel: 165,
      trash: 120,
      separator: 75,
      multiSel: 218,
      altMenu: 172,
      topM: "80px",
    };
  } else if (tl === "de") {
    rcSafe = {
      bookmark: 170,
      searchBkm: 165,
      searchFol: 168,
      folder: 253,
      panel: 158,
      trash: 167,
      separator: 95,
      multiSel: 165,
      altMenu: 178,
      topM: "40px",
    };
  } else if (tl === "hr") {
    rcSafe = {
      bookmark: 187,
      searchBkm: 190,
      searchFol: 190,
      folder: 190,
      panel: 135,
      trash: 122,
      separator: 88,
      multiSel: 190,
      altMenu: 135,
      topM: "80px",
    };
  } else if (tl === "pt-BR") {
    rcSafe = {
      bookmark: 183,
      searchBkm: 183,
      searchFol: 183,
      folder: 183,
      panel: 135,
      trash: 120,
      separator: 88,
      multiSel: 182,
      altMenu: 163,
      topM: "80px",
    };
  } else if (tl === "sr") {
    rcSafe = {
      bookmark: 227,
      searchBkm: 227,
      searchFol: 227,
      folder: 229,
      panel: 158,
      trash: 159,
      separator: 103,
      multiSel: 227,
      altMenu: 155,
      topM: "55px",
    };
  } else if (tl === "zh-CN") {
    rcSafe = {
      bookmark: 133,
      searchBkm: 126,
      searchFol: 140,
      folder: 166,
      panel: 115,
      trash: 120,
      separator: 75,
      multiSel: 125,
      altMenu: 143,
      topM: "80px",
    };
  } else if (tl === "it") {
    rcSafe = {
      bookmark: 210,
      searchBkm: 210,
      searchFol: 210,
      folder: 261,
      panel: 150,
      trash: 170,
      separator: 95,
      multiSel: 210,
      altMenu: 145,
      topM: "40px",
    };
  } else if (tl === "pl") {
    rcSafe = {
      bookmark: 183,
      searchBkm: 183,
      searchFol: 185,
      folder: 208,
      panel: 136,
      trash: 141,
      separator: 76,
      multiSel: 185,
      altMenu: 156,
      topM: "80px",
    };
  }

  chrome.bookmarks.getRootByName("bookmarks_bar", r => {
    rN[r.id] = "bookmarks_bar"; //rN.bookmarks_bar = r.id;
    bookmarks_bar.title = r.title;
  });

  chrome.bookmarks.getRootByName("other", r => {
    rN[r.id] = "other"; //rN.other = r.id;

    d_d_11.textContent = r.title;
  });

  chrome.bookmarks.getRootByName("speed_dial", r => {
    rN[r.id] = "speed_dial"; //rN.speed_dial = r.id;
    speed_dial.title = r.title;
  });

  chrome.bookmarks.getRootByName("trash", r => {
    rN[r.id] = "trash"; //rN.trash = r.id;
    //trash.title = r.title;
  });

  chrome.bookmarks.getRootByName("unsorted", r => {
    rN[r.id] = "unsorted"; //rN.unsorted = r.id;
    unsorted.title = r.title;
    if (gData.uns) d_d_10.textContent = chrome.i18n.getMessage("recent");
    else d_d_10.textContent = r.title;
  });

  chrome.bookmarks.getRootByName("user_root", r => {
    rN[r.id] = "user_root"; //rN.user_root = r.id;
    user_root.title = r.title;
  });

  trashClear.title = chrome.i18n.getMessage("RC_T1");
  recent.title = chrome.i18n.getMessage("recent");

  chrome.bookmarks.onImportEnded.addListener(makeRoot);

  chrome.bookmarks.onCreated.addListener(() => {
    clearTimeout(cr_TO);

    cr_TO = setTimeout(_cr, 1000);
  });

  chrome.bookmarks.onRemoved.addListener(() => {
    clearTimeout(rem_TO);

    rem_TO = setTimeout(_rem, 1000);
  });

  chrome.bookmarks.onChanged.addListener((a, b) => {
    clearTimeout(ch_TO);

    ch_TO = setTimeout(_ch, 1000, a, b);
  });

  chrome.bookmarks.onMoved.addListener(() => {
    clearTimeout(mov_TO);

    mov_TO = setTimeout(_mov, 1000);
  });

  /* 	chrome.bookmarks.onChildrenReordered.addListener((a, b) => {
		console.log(a);
		console.log(b);
	}); */

  if (gData.t_ === "td.css" || gData.t_ === "td2.css")
    d_d_9.textContent = chrome.i18n.getMessage("theme_");

  r_srt_1.innerHTML =
    '<span style="font-size:16px;">&#8664;&nbsp;&nbsp; </span>' +
    r_srt_1.textContent;
  r_srt_2.innerHTML =
    '<span style="font-size:16px;">&#8663;&nbsp;&nbsp; </span>' +
    r_srt_2.textContent;
  r_srt_3.innerHTML =
    '<span style="font-size:16px;">&#8664;&nbsp;&nbsp; </span>' +
    r_srt_3.textContent;
  r_srt_4.innerHTML =
    '<span style="font-size:16px;">&#8663;&nbsp;&nbsp; </span>' +
    r_srt_4.textContent;
  r_srt_5.innerHTML =
    '<span style="font-size:16px;">&#8664;&nbsp;&nbsp; </span>' +
    r_srt_5.textContent;
  r_srt_6.innerHTML =
    '<span style="font-size:16px;">&#8663;&nbsp;&nbsp; </span>' +
    r_srt_6.textContent;
};

let mov_TO;

const _mov = () => {
  let q = Date.now();

  if (q - r_s > 2000) {
    let _id = panel.firstChild.id;

    if (last === "trash") _tr();
    else if (_id !== "li_recent" && _id !== "SpanelF" && _id !== "Spanel")
      makeRoot();
  }
};

let ch_TO;

const _ch = (a, b) => {
  let q = Date.now();

  if (q - r_s > 2000) {
    let tg = document.getElementById(a);

    if (tg) {
      if (b.url) {
        tg.url = b.url;
        let t0 = tg.getElementsByClassName("bT")[0];

        if (b.title === "") {
          t0.innerText = "\u00a0\u00a0\u00a0 ...  " + b.url;
          t0.style.opacity = "0.8";

          if (gData.tt) tg.title = b.url;
        } else {
          t0.textContent = b.title;
          t0.style.opacity = "1";
        }
      } else tg.getElementsByClassName("bT")[0].textContent = b.title;
    }
  }
};

let rem_TO;

const _rem = () => {
  let q = Date.now();

  if (q - r_s > 2000) {
    chrome.bookmarks.getRootByName("trash", t => {
      let tl = "li" + t.id;

      if (tl === panel.firstChild.id) makeRoot();
    });
  }
};

let cr_TO;

const _cr = () => {
  let q = Date.now();

  if (q - r_s > 2000) {
    if (panel.firstChild.id !== "SpanelF" && panel.firstChild.id !== "Spanel") {
      if (panel.firstChild.id === "li_recent") _recBkm();
      else makeRoot();
    }
  }
};

/*****************   FOLDER   ******************************/

function _f_mu(e) {
  /*THIS*/ // folder mouse up
  if (e.button === 0) {
    if (e.ctrlKey) {
      let a = this.parentNode.id;

      while (a) {
        let pf = a.replace("li", "");
        let getPF = document.getElementById(pf);
        if (getPF) {
          let newA = [getPF];

          f_de_sel(newA);

          a = document.getElementById(a).parentNode.id;
        } else a = !1;
      }

      let tl = document.getElementById("li" + this.id);

      _dSel(null, tl);

      let newA_ = [this];

      if (this.className === "fNor") f_sel([this]);
      else f_de_sel(newA_);
    } else if (e.shiftKey) {
      _s_sel(this);

      f_sel([this]);
    } else {
      _dSel();

      let temp_ul = document.getElementById("li" + this.id);

      if (!OF) {
        if (temp_ul.style.display === "none") {
          temp_ul.style.display = "block";

          this.getElementsByClassName("fav")[0].innerHTML = fo_;

          temp_ul.animate([{ maxHeight: "0%" }, { maxHeight: "100%" }], {
            duration: 150,
            steps: 2,
            webkitAnimationTimingFunction: "ease-out",
          });

          if (last === "bookmarks_bar") {
            folders.bookmarks_bar.push(this.id);
            chrome.storage.local.set({ folders: folders });
          } else if (last === "user_root") {
            folders.user_root.push(this.id);
            chrome.storage.local.set({ folders: folders });
          } else if (last === "unsorted") {
            folders.unsorted.push(this.id);
            chrome.storage.local.set({ folders: folders });
          } else if (last === "other") {
            folders.other.push(this.id);
            chrome.storage.local.set({ folders: folders });
          }

          if (e.target.className === "fav") setTimeout(_clFi, 50, temp_ul, 1);
        } else {
          _clL(temp_ul);

          if (e.target.className === "fav") setTimeout(_clFi, 50, temp_ul);

          _sf(this.id);
        }
      } else {
        if (temp_ul.style.display === "none") {
          let OFobjList = {};

          OFobjList[temp_ul.id] = 1;

          let a = temp_ul.parentNode;

          while (a) {
            if (a.id !== "panel") {
              OFobjList[a.id] = 1;
              a = a.parentNode;
            } else a = !1;
          }

          let gal = document.getElementsByClassName("baseL");

          for (let s1 = gal.length; s1--; ) {
            if (gal[s1].style.display === "block") {
              if (!OFobjList[gal[s1].id]) {
                gal[s1].style.display = "none";
                gal[s1].previousSibling.getElementsByClassName(
                  "fav"
                )[0].innerHTML = fc_;
              }
            }
          }

          temp_ul.style.display = "block";

          this.getElementsByClassName("fav")[0].innerHTML = fo_;

          temp_ul.animate([{ maxHeight: "0%" }, { maxHeight: "100%" }], {
            duration: 150,
            steps: 2,
            webkitAnimationTimingFunction: "ease-out",
          });

          if (
            last === "bookmarks_bar" ||
            last === "user_root" ||
            last === "unsorted" ||
            last === "other"
          ) {
            SF[last] = this.id;
            chrome.storage.local.set({ SF: SF });
          }

          if (this.getBoundingClientRect().top * dzzd < 35 * dzzd)
            this.scrollIntoView(!!1);

          if (e.target.className === "fav") setTimeout(_clFi, 50, temp_ul, 1);
        } else {
          _clL(temp_ul);

          if (e.target.className === "fav") setTimeout(_clFi, 50, temp_ul);

          if (
            last === "bookmarks_bar" ||
            last === "user_root" ||
            last === "unsorted" ||
            last === "other"
          ) {
            SF[last] = 0;
            chrome.storage.local.set({ SF: SF });
          }
        }
      }

      f_sel([this]);
    }

    lastClick = this.id;
  } else if (e.button === 1) {
    _dSel();

    f_sel([this]);

    openT(this.id);
  } else if (e.button === 2) {
    rcFN = this;

    if (last === "trash") rc_und(this, e.pageX, e.pageY);
    else _f_ctx(this, e.pageX, e.pageY, e.ctrlKey);
  }

  kbHelper = this.id;
}

function _f_ds(e) {
  /*THIS*/ // folder drag start
  let dIDs = [];

  if (this.className === "fSel") {
    let colAll = document.querySelectorAll(".fSel, .bSel, .sepSel");

    for (let j = 0, d = colAll.length; j < d; j++) dIDs.push(colAll[j].id);

    e.dataTransfer.setData("dragID", dIDs);

    if (dIDs.length > 1) {
      let img = document.createElement("img");
      img.src =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAUCAIAAAC/CtwvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAABFSURBVFhH7dTBDQAgCMBA13MhBmNBffBjAoslNwBNCGtHDmMSwTdJBzJt7eLhEZhE4HsgMInA9/DYtLWLh0dgEsG4pMgL7LnmUdAvTmwAAAAASUVORK5CYII=";
      e.dataTransfer.setDragImage(img, -10, -5);
    }
  } else {
    _dSel();

    f_sel([this]);

    e.dataTransfer.setData("dragID", this.id);
  }

  kbHelper = this.id;

  isValidDrag = 1;
  //addBtnL();
}

function _f_de(e) {
  /*THIS*/ // folder drag enter
  e.preventDefault();

  if (this.className === "fNor") dgEnter = Date.now();
}

function _f_do(e) {
  /*THIS*/ // folder drag over
  e.preventDefault();

  if (this.className === "fNor") {
    let mY = e.pageY - Math.floor(this.getBoundingClientRect().top * dzzd);

    if (mY > dzzd_mY) {
      this.style.backgroundColor = "";
      this.style.borderBottom = "4px solid #1BE529";
    } else {
      this.style.borderBottom = "";
      this.style.backgroundColor = "#1BE529";

      let dgOver = Date.now();

      if (dgOver - dgEnter > 1000) {
        dgEnter = 5000000000000;
        this.getElementsByClassName("fav")[0].innerHTML = fo_;

        document.getElementById("li" + this.id).style.display = "block";

        if (last === "unsorted") folders.unsorted.push(this.id);
        else if (last === "bookmarks_bar") folders.bookmarks_bar.push(this.id);
        else if (last === "other") folders.other.push(this.id);
        else if (last === "user_root") folders.user_root.push(this.id);

        if (!OF) chrome.storage.local.set({ folders: folders });
      }
    }
  }
}

function _f_dl(e) {
  /*THIS*/ // folder drag leave
  e.preventDefault();
  this.style.backgroundColor = "";
  this.style.borderBottom = "";
}

function _f_dd(e) {
  /*THIS*/ // drop na folder
  this.style.borderBottom = "";
  this.style.backgroundColor = "";

  let vu = e.dataTransfer.getData("URL");

  if (vu) {
    if (
      last === "bookmarks_bar" ||
      last === "user_root" ||
      last === "unsorted" ||
      last === "speed_dial" ||
      last === "other"
    ) {
      let mY = e.pageY - Math.floor(this.getBoundingClientRect().top * dzzd);

      if (mY > dzzd_mY) {
        chrome.tabs.query({}, tabs => {
          let f = !0,
            i = tabs.length,
            tl = null;

          while (i--) {
            if (tabs[i].url === vu) {
              f = !1;
              tl = tabs[i].title;
              break;
            }
          }

          chrome.bookmarks.create(
            {
              parentId: this.parentId,
              index: this.index + 1,
              url: vu,
              title: tl,
            },
            btn => {
              makeRoot(null, 1);
              rep = 1;
              if (f) _getT(vu, btn.id);
            }
          );
        });
      } else {
        let that = this;

        chrome.tabs.query({}, tabs => {
          let f = !0,
            i = tabs.length,
            tl = null;

          while (i--) {
            if (tabs[i].url === vu) {
              f = !1;
              tl = tabs[i].title;
              break;
            }
          }

          chrome.bookmarks.create(
            { parentId: that.id, index: 0, url: vu, title: tl },
            btn => {
              if (!OF) {
                if (last === "unsorted") folders.unsorted.push(that.id);
                else if (last === "bookmarks_bar")
                  folders.bookmarks_bar.push(that.id);
                else if (last === "other") folders.other.push(that.id);
                else if (last === "user_root") folders.user_root.push(that.id);

                chrome.storage.local.set({ folders: folders });
              } else {
                SF[last] = that.id;
                chrome.storage.local.set({ SF: SF });
              }

              makeRoot(null, 1);
              rep = 1;
              if (f) _getT(vu, btn.id);
            }
          );
        });
      }
    }
  } else if (this.className === "fNor") {
    let ts1 = e.dataTransfer.getData("dragID");

    if (ts1) {
      if (
        last === "bookmarks_bar" ||
        last === "user_root" ||
        last === "unsorted" ||
        last === "speed_dial" ||
        last === "other"
      ) {
        let mba = ts1.split(",");
        let mY = e.pageY - Math.floor(this.getBoundingClientRect().top * dzzd);

        if (mY > dzzd_mY) {
          let prt = this.parentId,
            ind = this.index;

          chrome.bookmarks.get(mba, res => {
            for (let i = res.length; i--; ) {
              if (res[i].parentId !== prt)
                chrome.bookmarks.move(res[i].id, {
                  parentId: prt,
                  index: ind + 1,
                });
              else {
                if (res[i].index > ind)
                  chrome.bookmarks.move(res[i].id, {
                    parentId: prt,
                    index: ind + 1,
                  });
                else {
                  chrome.bookmarks.move(res[i].id, {
                    parentId: prt,
                    index: ind + 1,
                  });
                  ind--;
                }
              }
            }

            makeRoot();
          });
        } else {
          for (let i = mba.length; i--; )
            chrome.bookmarks.move(mba[i], { parentId: this.id, index: 0 });
          if (!OF) {
            if (last === "unsorted") folders.unsorted.push(this.id);
            else if (last === "bookmarks_bar")
              folders.bookmarks_bar.push(this.id);
            else if (last === "other") folders.other.push(this.id);
            else if (last === "user_root") folders.user_root.push(this.id);

            chrome.storage.local.set({ folders: folders });
          } else {
            SF[last] = this.id;
            chrome.storage.local.set({ SF: SF });
          }

          makeRoot();
        }
      }
    }
  }
}

const _f_ctx = (node, a, b, ctrl) => {
  // create ctx menu on folder
  let rx = a,
    ry = b,
    c = 0;

  let PSBF = document.getElementsByClassName("fSel"),
    PSB = document.getElementsByClassName("bSel"),
    PSS = document.getElementsByClassName("sepSel");
  let summ = PSBF.length + PSB.length + PSS.length;

  if (node.className === "fNor" || (node.className === "fSel" && summ === 1)) {
    f_de_sel(PSBF);

    for (let i = PSB.length; i--; ) PSB[i].className = "bNor";
    for (let j = PSS.length; j--; ) PSS[j].className = "sepNor";

    f_sel([node]);

    if (ctrl) _rc_alt(a, b);
    else {
      if (cutB.length || copyB.length) {
        r_bf_11.style.display = "block";
        c = 25;
      } else r_bf_11.style.display = "none";

      if (ry + 370 + c > document.body.clientHeight)
        ry = document.body.clientHeight - 370 - c;
      if (rx + rcSafe.folder > document.body.clientWidth)
        rx = document.body.clientWidth - rcSafe.folder;

      r_bf.style.top = ry + "px";
      r_bf.style.left = rx + "px";
      r_bf.style.display = "block";

      r_bf.addEventListener("click", rc_f);
    }
  } else if (node.className === "fSel" && summ > 1) {
    //više selektiranih
    if (ctrl) _rc_alt(a, b);
    else _rc_multi_(rx, ry, PSBF.length);
  }

  _aL();
};

const rc_f = e => {
  //folder context menu CLICK LISTENER
  e.stopPropagation();

  if (e.target.id === "r_bf_4") {
    if (!OF) {
      if (last === "unsorted") folders.unsorted.push(rcFN.id);
      else if (last === "bookmarks_bar") folders.bookmarks_bar.push(rcFN.id);
      else if (last === "other") folders.other.push(rcFN.id);
      else if (last === "user_root") folders.user_root.push(rcFN.id);

      chrome.storage.local.set({ folders: folders });
    } else {
      SF[last] = rcFN.id;
      chrome.storage.local.set({ SF: SF });
    }

    _d_cb();

    chrome.tabs.query({ currentWindow: !!1, active: !!1 }, tabs => {
      chrome.bookmarks.create(
        { parentId: rcFN.id, index: 0, title: tabs[0].title, url: tabs[0].url },
        () => {
          makeRoot(null, 1);
        }
      );
    });
  } else if (e.target.id === "r_bf_5") {
    _d_cb();
    chrome.tabs.query({ currentWindow: !!1, active: !!1 }, tabs => {
      chrome.bookmarks.create(
        {
          parentId: rcFN.parentId,
          index: rcFN.index + 1,
          title: tabs[0].title,
          url: tabs[0].url,
        },
        () => {
          makeRoot(null, 1);
        }
      );
    });
  } else if (
    e.target.id === "r_bf_6" ||
    e.target.id === "r_bf_7" ||
    e.target.id === "r_bf_12"
  ) {
    r_bf.style.display = "none";

    p_nf.style.display = "block";

    if (e.target.id === "r_bf_12") {
      p_nf_1.value = rcFN.getElementsByClassName("bT")[0].textContent;
      p_nf.version = 2;
    } else {
      p_nf_1.value = chrome.i18n.getMessage("RC_M2");

      if (e.target.id === "r_bf_6") p_nf.version = 3;
      else p_nf.version = 4;
    }

    p_nf_1.select();

    p_nf.addEventListener("click", bkmFP_Cl);
  } /* else if (e.target.id === 'r_bf_7') {
		r_bf.style.display = 'none';

		p_nf.style.display = 'block';
		
		p_nf_1.value = chrome.i18n.getMessage('RC_M2');
		p_nf_1.select();
		p_nf.version = 4;
		p_nf.addEventListener('click', bkmFP_Cl);

	} */ else if (
    e.target.id === "r_bf_1"
  )
    openSel("t", !1);
  else if (e.target.id === "r_bf_2") openSel("w", !1);
  else if (e.target.id === "r_bf_3") openSel("w", !!1);
  else if (e.target.id === "r_bf_9") {
    //_d_cb();
    //_s_f();
    let b = r_bf.getBoundingClientRect();
    let _x = b.left;
    let _y = b.top;

    r_srt.style.left = _x + "px";
    r_srt.style.top = _y + 20 + "px";

    r_bf.style.display = "none";
    r_srt.style.display = "block";

    r_srt.addEventListener("click", rc_srt);
  } else if (e.target.id === "r_bf_10") {
    _d_cb();
    _c_cut();
  } else if (e.target.id === "r_bf_11") {
    _d_cb();
    _c_paste_f(rcFN.id);
  } else if (e.target.id === "r_bf_8") {
    _d_cb();
    addSep(rcFN.id);
  } /*  else if (e.target.id === 'r_bf_12') {
		r_bf.style.display = 'none';

		p_nf.style.display = 'block';
		p_nf_1.value = rcFN.getElementsByClassName('bT')[0].textContent;
		p_nf_1.select();
		p_nf.version = 2;
		p_nf.addEventListener('click', bkmFP_Cl);
		
	} */ else if (
    e.target.id === "r_bf_13"
  ) {
    _d_cb();
    _D();
  } else if (e.target.id === "r_bf_14") {
    _d_cb();
    setTimeout(_ss2, 100, rcFN.id);
  }
};

const _s_f = a => {
  // sort inside folder
  chrome.bookmarks.getSubTree(rcFN.id, _c => {
    let bA = [],
      fA = [];

    if (a === 1 || a === 2) {
      const _cF = ad => {
        for (let i = 0, l = ad.length; i < l; i++) {
          if (ad[i].url) {
            if (ad[i].title === "") {
              let tul = ad[i].url.toLowerCase();
              let tO = { i: ad[i].id, t: tul };
              bA.push(tO);
            } else {
              let ttl = ad[i].title.toLowerCase();
              let tO = { i: ad[i].id, t: ttl };
              bA.push(tO);
            }
          } else {
            let ttl = ad[i].title.toLowerCase();
            let tO = { i: ad[i].id, t: ttl };
            fA.push(tO);
          }
        }
      };

      _cF(_c[0].children);

      bA.sort((a, b) => a.t.localeCompare(b.t));
      fA.sort((a, b) => a.t.localeCompare(b.t));

      if (a === 2) {
        bA.reverse();
        fA.reverse();
      }
    } else if (a === 3 || a === 4) {
      const _cF = ad => {
        for (let i = 0, l = ad.length; i < l; i++) {
          let tO = { i: ad[i].id, a: ad[i].dateAdded };

          if (ad[i].url) bA.push(tO);
          else fA.push(tO);
        }
      };

      _cF(_c[0].children);

      bA.sort(function (a, b) {
        return a.a - b.a;
      });
      fA.sort(function (a, b) {
        return a.a - b.a;
      });

      if (a === 4) {
        bA.reverse();
        fA.reverse();
      }
    } else if (a === 5 || a === 6) {
      const _cF = ad => {
        for (let i = 0, l = ad.length; i < l; i++) {
          let tO = { i: ad[i].id },
            s;

          if (ad[i].url) {
            /* 						


						let matches = ad[i].url.match(/^https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i);
						let domain = matches && matches[1]; */

            let u = ad[i].url;

            if (u.startsWith("chrome")) tO.o = u;
            else {
              tO.o = new URL(ad[i].url).hostname;
              tO.o = tO.o.replace("www.", "");
              s = tO.o.split(".");

              if (s.length > 2) {
                s.shift();
                tO.o = s.join(".");
              }
            }

            bA.push(tO);

            /* 						if (ad[i].url.includes('://')) tO.o = ad[i].url.split('/')[2];
						else tO.o = ad[i].url.split('/')[0];
						tO.o = tO.o.split(':')[0].replace('www.', '');
						bA.push(tO); */
          } else fA.push(tO);
        }
      };

      _cF(_c[0].children);

      bA.sort((a, b) => a.o.localeCompare(b.o));

      if (a === 6) bA.reverse();
    }

    let rA = fA.concat(bA),
      j = rA.length;

    while (j--) {
      (jo => {
        chrome.bookmarks.move(rA[jo].i, { parentId: rcFN.id, index: 0 }, () => {
          if (jo === 0) {
            rA = null;
            bA = null;
            fA = null;
            makeRoot();
          }
        });
      })(j);
    }
  });
};

const _eca = a => {
  // EXPAND / CLOSE all folders
  let gl = document.getElementsByClassName("baseL");
  let ta = [];
  let tf = 0;

  if (a) {
    for (let i = gl.length; i--; ) {
      if (gl[i].style.display === "none") {
        gl[i].style.display = "block";
        gl[i].previousSibling.getElementsByClassName("fav")[0].innerHTML = fo_;
        let psid = gl[i].previousSibling.id;
        ta.push(psid);
      }
    }
  } else {
    for (let i = gl.length; i--; ) {
      if (gl[i].style.display === "block") {
        gl[i].style.display = "none";
        gl[i].previousSibling.getElementsByClassName("fav")[0].innerHTML = fc_;
      }
    }
  }

  if (last === "bookmarks_bar") {
    folders.bookmarks_bar = ta;
    tf = 1;
  } else if (last === "user_root") {
    folders.user_root = ta;
    tf = 1;
  } else if (last === "unsorted") {
    folders.unsorted = ta;
    tf = 1;
  } else if (last === "other") {
    folders.other = ta;
    tf = 1;
  }

  if (tf) chrome.storage.local.set({ folders: folders });
};

const _sf = a => {
  // splice id from folders array and save it
  if (last === "bookmarks_bar") {
    for (let i = folders.bookmarks_bar.length; i--; ) {
      if (folders.bookmarks_bar[i] === a) folders.bookmarks_bar.splice(i, 1);
    }
  } else if (last === "user_root") {
    for (let i = folders.user_root.length; i--; ) {
      if (folders.user_root[i] === a) folders.user_root.splice(i, 1);
    }
  } else if (last === "unsorted") {
    for (let i = folders.unsorted.length; i--; ) {
      if (folders.unsorted[i] === a) folders.unsorted.splice(i, 1);
    }
  } else if (last === "other") {
    for (let i = folders.other.length; i--; ) {
      if (folders.other[i] === a) folders.other.splice(i, 1);
    }
  }

  chrome.storage.local.set({ folders: folders });
};

function bkmFP_Cl(e) {
  /*THIS*/ // "folder name" prompt click listener
  e.stopPropagation();

  if (e.target.id === "p_nf_2") _sfnv(this.version);
  else if (e.target.id === "p_nf_3") {
    if (this.version !== 1) rcFN.className = "fNor";

    _d_cb();
  }
}

const _clFi = (a, c) => {
  // open/close all children on favico click
  let b = a || document;
  let ai = b.querySelectorAll(".fNor, .fSel");
  let al = b.getElementsByClassName("baseL");

  if (c) {
    for (let i = al.length; i--; ) al[i].style.display = "block";
    for (let j = ai.length; j--; )
      ai[j].getElementsByClassName("fav")[0].innerHTML = fo_;
  } else {
    for (let i = al.length; i--; ) al[i].style.display = "none";
    for (let j = ai.length; j--; )
      ai[j].getElementsByClassName("fav")[0].innerHTML = fc_;
  }
};

const rc_srt = e => {
  //sort context menu CLICK LISTENER
  e.stopPropagation();

  if (e.target.id === "r_srt_1") {
    _d_cb();
    _s_f(1);
  } else if (e.target.id === "r_srt_2") {
    _d_cb();
    _s_f(2);
  } else if (e.target.id === "r_srt_3") {
    _d_cb();
    _s_f(3);
  } else if (e.target.id === "r_srt_4") {
    _d_cb();
    _s_f(4);
  } else if (e.target.id === "r_srt_5") {
    _d_cb();
    _s_f(5);
  } else if (e.target.id === "r_srt_6") {
    _d_cb();
    _s_f(6);
  }
};

/*****************   BOOKMARK   ****************************/

function _b_mu(e) {
  /*THIS*/ // bookmark mouse up
  if (e.button === 0) {
    if (e.detail === 2) {
      chrome.tabs.update({ url: this.url });
      if (gData.wClose) window.close();
    } else {
      if (e.ctrlKey) {
        if (gData.CAT) {
          if (e.shiftKey) {
            let a = this.parentNode.id;

            while (a) {
              let pFolder = a.replace("li", "");
              let getPF = document.getElementById(pFolder);

              if (getPF) {
                let nA = [getPF];
                f_de_sel(nA);
                a = document.getElementById(a).parentNode.id;
              } else a = !1;
            }

            if (this.className === "bSel") this.className = "bNor";
            else this.className = "bSel";
          } else {
            chrome.tabs.create({ url: this.url, active: !!1 });
            if (gData.wClose) window.close();
          }
        } else {
          let a = this.parentNode.id;
          while (a) {
            let pFolder = a.replace("li", "");
            let getPF = document.getElementById(pFolder);

            if (getPF) {
              let nA = [getPF];
              f_de_sel(nA);
              a = document.getElementById(a).parentNode.id;
            } else a = !1;
          }

          if (this.className === "bSel") this.className = "bNor";
          else this.className = "bSel";
        }
      } else if (e.shiftKey) {
        _s_sel(this);

        this.className = "bSel";
      } else {
        _dSel();

        this.className = "bSel";

        if (gData.sCl) {
          chrome.tabs.update({ url: this.url });
          if (gData.wClose) window.close();
        }
      }

      lastClick = this.id;
    }
  } else if (e.button === 1) {
    _dSel();

    chrome.tabs.create({ url: this.url, active: !1 });

    this.className = "bSel";
  } else if (e.button === 2) {
    rcBN = this;

    if (last === "trash") rc_und(this, e.pageX, e.pageY);
    else _b_ctx(this, e.pageX, e.pageY, e.ctrlKey);
  }

  kbHelper = this.id;
}

function _b_ds(e) {
  /*THIS*/ // bookmark drag start
  dURLs = [];

  let dIDs = [];

  if (this.className === "bSel") {
    let ga = document.querySelectorAll(".fSel, .bSel, .sepSel");

    for (let j = 0, d = ga.length; j < d; j++) {
      dIDs.push(ga[j].id);

      if (ga[j].className === "bSel") dURLs.push(ga[j].url);
    }

    e.dataTransfer.setData("dragID", dIDs);

    if (dIDs.length > 1) {
      let img = document.createElement("img");
      img.src =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAUCAIAAAC/CtwvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAABFSURBVFhH7dTBDQAgCMBA13MhBmNBffBjAoslNwBNCGtHDmMSwTdJBzJt7eLhEZhE4HsgMInA9/DYtLWLh0dgEsG4pMgL7LnmUdAvTmwAAAAASUVORK5CYII=";
      e.dataTransfer.setDragImage(img, -10, -5);
    }
  } else {
    _dSel();

    dURLs.push(this.url);

    e.dataTransfer.setData("dragID", this.id);

    this.className = "bSel";
  }

  kbHelper = this.id;

  isValidDrag = 1;
  //addBtnL();
}

const _b_de = e => {
  // bookmark drag enter
  e.preventDefault();
};

function _b_do(e) {
  /*THIS*/ // bookmark drag over
  e.preventDefault();
  this.style.borderBottom = "4px solid #1BE529";
}

function _b_dl(e) {
  /*THIS*/ // bookmark drag leave
  e.preventDefault();
  this.style.borderBottom = "";
}

function _b_dd(e) {
  /*THIS*/ // bookmark drop on
  this.style.borderBottom = "";

  let vu = e.dataTransfer.getData("URL");

  if (vu) {
    if (
      last === "bookmarks_bar" ||
      last === "user_root" ||
      last === "unsorted" ||
      last === "speed_dial" ||
      last === "other"
    ) {
      chrome.tabs.query({}, tabs => {
        let f = !0,
          i = tabs.length,
          tl = null;

        while (i--) {
          if (tabs[i].url === vu) {
            f = !1;
            tl = tabs[i].title;
            break;
          }
        }

        chrome.bookmarks.create(
          {
            parentId: this.parentId,
            index: this.index + 1,
            url: vu,
            title: tl,
          },
          btn => {
            makeRoot(null, 1);
            rep = 1;
            if (f) setTimeout(_getT, 600, vu, btn.id);
          }
        );
      });
    }
  } else if (this.className === "bNor") {
    let ts1 = e.dataTransfer.getData("dragID");

    if (ts1) {
      if (
        last === "bookmarks_bar" ||
        last === "user_root" ||
        last === "unsorted" ||
        last === "speed_dial" ||
        last === "other"
      ) {
        let mba = ts1.split(",");
        let prt = this.parentId;
        let ind = this.index;

        chrome.bookmarks.get(mba, res => {
          for (let i = res.length; i--; ) {
            if (res[i].parentId !== prt)
              chrome.bookmarks.move(res[i].id, {
                parentId: prt,
                index: ind + 1,
              });
            else {
              if (res[i].index > ind)
                chrome.bookmarks.move(res[i].id, {
                  parentId: prt,
                  index: ind + 1,
                });
              else {
                chrome.bookmarks.move(res[i].id, {
                  parentId: prt,
                  index: ind + 1,
                });
                ind--;
              }
            }
          }

          makeRoot();
        });
      }
    }
  }
}

const _b_ctx = (n, a, b, ctrl) => {
  // create ctx menu for NORMAL BOOKMARK
  let rx = a,
    ry = b,
    c = 0;

  let PSBF = document.getElementsByClassName("fSel"),
    PSB = document.getElementsByClassName("bSel"),
    PSS = document.getElementsByClassName("sepSel");

  let summ = PSBF.length + PSB.length + PSS.length;

  if (n.className == "bNor" || (n.className === "bSel" && summ === 1)) {
    if (rx + rcSafe.bookmark > document.body.clientWidth)
      rx = document.body.clientWidth - rcSafe.bookmark;

    f_de_sel(PSBF);

    for (let i = PSB.length; i--; ) PSB[i].className = "bNor";
    for (let j = PSS.length; j--; ) PSS[j].className = "sepNor";

    n.className = "bSel";

    if (ctrl) _rc_alt(a, b);
    else {
      if (cutB.length || copyB.length) {
        r_bm_9.style.display = "block";
        c = 25;
      } else r_bm_9.style.display = "none";

      if (ry + 290 + c > document.body.clientHeight)
        ry = document.body.clientHeight - 290 - c;

      r_bm.style.top = ry + "px";
      r_bm.style.left = rx + "px";
      r_bm.style.display = "block";

      r_bm.addEventListener("click", rc_b);
    }
  } else if (n.className === "bSel" && summ > 1) {
    //više selektiranih
    if (ctrl) _rc_alt(a, b);
    else _rc_multi_(rx, ry, PSBF.length);
  }

  _aL();
};

const rc_b = e => {
  // bookmark context menu CLICK LISTENER
  e.stopPropagation();

  if (e.target.id === "r_bm_1") openSel("t", !1);
  else if (e.target.id === "r_bm_2") openSel("w", !1);
  else if (e.target.id === "r_bm_3") openSel("w", !!1);
  else if (e.target.id === "r_bm_4") {
    // kreira novi bookmark
    _d_cb();

    chrome.tabs.query({ currentWindow: !!1, active: !!1 }, t => {
      chrome.bookmarks.create(
        {
          parentId: rcBN.parentId,
          index: rcBN.index + 1,
          title: t[0].title,
          url: t[0].url,
        },
        () => {
          makeRoot(null, 1);
        }
      );
    });
  } else if (e.target.id === "r_bm_5") {
    // kreira novi folder - otvori prompt

    r_bm.style.display = "none";

    p_nf.style.display = "block";

    p_nf_1.value = chrome.i18n.getMessage("RC_M2");
    p_nf_1.select();
    p_nf.version = 1;
    p_nf.addEventListener("click", bkmFP_Cl);
  } else if (e.target.id === "r_bm_6") {
    // kreira novi separator
    _d_cb();
    addSep(rcBN.id);
  } else if (e.target.id === "r_bm_7") {
    // cut
    _d_cb();
    _c_cut();
  } else if (e.target.id === "r_bm_8") {
    // copy
    _d_cb();
    _c_copy();
  } else if (e.target.id === "r_bm_9") {
    // paste
    _d_cb();
    _c_paste_b(rcBN.parentId, rcBN.index + 1);
  } else if (e.target.id === "r_bm_10") {
    // edit bookmark - otvori prompt
    r_bm.style.display = "none";
    r_sm.style.display = "none";
    p_eb.style.display = "block";

    let tmpT = rcBN.getElementsByClassName("bT")[0];
    if (tmpT.innerText.startsWith("\u00a0")) p_eb_2.value = "";
    else p_eb_2.value = tmpT.textContent;

    //p_eb_2.value = rcBN.textContent;
    p_eb_2.select();
    p_eb_3.value = rcBN.url;

    p_eb.addEventListener("click", bkmBP_CL);
  } else if (e.target.id === "r_bm_11") {
    // delete bookmark
    _D();
    _d_cb();
  }
};

const _sfnv = a => {
  // save Folder Name  - verzije
  if (a === 1) {
    //kreiraj novi folder nakon ovoga bookmarka
    _d_cb();

    chrome.bookmarks.create(
      {
        parentId: rcBN.parentId,
        index: rcBN.index + 1,
        title: p_nf_1.value,
        url: null,
      },
      () => {
        makeRoot(null, 1);
      }
    );
  } else if (a === 2) {
    //edit folder name... već postojeći folder
    _d_cb();

    //rcFN.className = 'fNor';
    rcFN.getElementsByClassName("bT")[0].textContent = p_nf_1.value;

    r_s = Date.now();

    chrome.bookmarks.update(rcFN.id, { title: p_nf_1.value });

    //makeRoot();
  } else if (a === 3) {
    //kreiraj novi folder UNUTAR ovoga
    if (!OF) {
      if (last === "unsorted") folders.unsorted.push(rcFN.id);
      else if (last === "bookmarks_bar") folders.bookmarks_bar.push(rcFN.id);
      else if (last === "other") folders.other.push(rcFN.id);
      else if (last === "user_root") folders.user_root.push(rcFN.id);

      chrome.storage.local.set({ folders: folders });
    } else {
      SF[last] = rcFN.id;
      chrome.storage.local.set({ SF: SF });
    }

    _d_cb();

    chrome.bookmarks.create(
      { parentId: rcFN.id, index: 0, title: p_nf_1.value, url: null },
      () => {
        makeRoot(null, 1);
      }
    );
  } else if (a === 4) {
    //kreiraj novi folder nakon ovoga foldera
    _d_cb();

    chrome.bookmarks.create(
      {
        parentId: rcFN.parentId,
        index: rcFN.index + 1,
        title: p_nf_1.value,
        url: null,
      },
      () => {
        makeRoot(null, 1);
      }
    );
  }
};

const bkmBP_CL = e => {
  //edit bookmark prompt click listener
  e.stopPropagation();

  if (e.target.id === "p_eb_4") _sbe();
  else if (e.target.id === "p_eb_5") _d_cb();
};

const _sbe = () => {
  // save bookmark edit
  _d_cb();

  r_s = Date.now();

  chrome.bookmarks.update(
    rcBN.id,
    { title: p_eb_2.value, url: p_eb_3.value },
    () => {
      if (
        chrome.runtime.lastError &&
        chrome.runtime.lastError.message === "Invalid URL."
      )
        alert(chrome.runtime.lastError.message);
      else {
        rcBN.url = p_eb_3.value;
        rcBN.title = p_eb_2.value;

        let tmpT = rcBN.getElementsByClassName("bT")[0];

        if (p_eb_2.value !== "") {
          tmpT.textContent = p_eb_2.value;
          tmpT.style.opacity = "1";
        } else {
          tmpT.innerText = "\u00a0\u00a0\u00a0 ...  " + p_eb_3.value;
          tmpT.style.opacity = "0.8";
        }
      }
    }
  );
};

/*************** PANEL **************************/

function _p_sc(e) {
  /*THIS*/ // panel scroll listener
  clearTimeout(scrTO);
  let tsc = this.scrollTop,
    tFlag = !1;

  scrTO = setTimeout(
    () => {
      if (last === "bookmarks_bar") {
        tFlag = !!1;
        scr.bookmarks_bar = tsc;
      } else if (last === "user_root") {
        tFlag = !!1;
        scr.user_root = tsc;
      } else if (last === "unsorted") {
        tFlag = !!1;
        scr.unsorted = tsc;
      } else if (last === "other") {
        tFlag = !!1;
        scr.other = tsc;
      }

      if (tFlag) chrome.storage.local.set({ scr: scr });
    },
    400,
    tsc
  );
}

const _p_wh = e => {
  // panel mouse wheel listener
  if (ctxScroll) {
    let gm = document.getElementById(ctxScroll);

    ctxScroll = null;

    gm.blur();
  }

  if (e.ctrlKey) {
    clearTimeout(gTO);

    if (e.wheelDelta > 0 && gData.zoom < 160) gData.zoom += 5;
    else if (e.wheelDelta < 0 && gData.zoom > 70) gData.zoom -= 5;

    panel.childNodes[0].style.zoom = gData.zoom + "%";

    gTO = setTimeout(_saveG, 500);

    chrome.runtime.sendMessage({ intZoom: gData.zoom, w: cWin });

    clearTimeout(zTO);

    zi.textContent = gData.zoom + " %";
    zi.style.display = "block";
    zTO = setTimeout(_zF, 2000);
  }
};

function _p_md(e) {
  /*THIS*/ // bookmarks panel mouse down
  let rx = e.pageX,
    ry = e.pageY;

  if (e.button === 0) {
    if (e.target === this || e.target.id.indexOf("li") > -1) {
      if (rx < panel.clientWidth) {
        _dSel();

        kbHelper = !1;
      }
    }
  } else if (e.button === 1) {
    e.preventDefault();
    e.stopPropagation();
  } else if (e.button === 2) {
    let tc = this.childNodes[0].id;

    if (tc === "Spanel" || tc === "SpanelF") return;
    else {
      if (e.target.id === this.id && rx < panel.clientWidth) {
        if (
          last === "unsorted" ||
          last === "bookmarks_bar" ||
          last === "user_root" ||
          last === "speed_dial" ||
          last === "other"
        ) {
          _dSel();
          let c = 0;
          kbHelper = !1;

          // moras uračunati paste
          if (rx + rcSafe.panel > document.body.clientWidth)
            rx = document.body.clientWidth - rcSafe.panel;

          if (cutB.length || copyB.length) {
            r_bp_3.style.display = "block";
            c = 25;
          } else r_bp_3.style.display = "none";

          if (ry + 65 + c > document.body.clientHeight)
            ry = document.body.clientHeight - 65 - c;

          r_bp.style.top = ry + "px";
          r_bp.style.left = rx + "px";
          r_bp.style.display = "block";

          r_bp.addEventListener("click", _p_L);

          _aL();
        }
      }
    }
  }
}

const _p_d = e => {
  // drop na panel
  if (e.target.id === "panel") {
    let vu = e.dataTransfer.getData("URL");
    let ts1 = e.dataTransfer.getData("dragID");

    if (vu) {
      if (
        last === "bookmarks_bar" ||
        last === "user_root" ||
        last === "unsorted" ||
        last === "speed_dial" ||
        last === "other"
      ) {
        chrome.tabs.query({}, tabs => {
          let f = !0,
            i = tabs.length,
            tl = null;

          while (i--) {
            if (tabs[i].url === vu) {
              f = !1;
              tl = tabs[i].title;
              break;
            }
          }

          chrome.bookmarks.getSubTree(rid, ch => {
            let indCalc = ch[0].children.length;

            chrome.bookmarks.create(
              { parentId: rid, index: indCalc, url: vu, title: tl },
              btn => {
                makeRoot(null, 1);
                rep = 1;
                if (f) _getT(vu, btn.id);
              }
            );
          });
        });
      }
    } else if (ts1) {
      let mba = ts1.split(",");

      if (
        last === "bookmarks_bar" ||
        last === "user_root" ||
        last === "unsorted" ||
        last === "speed_dial" ||
        last === "other"
      ) {
        chrome.bookmarks.getSubTree(rid, ch => {
          let indCalc = ch[0].children.length;

          for (let i = 0, l = mba.length; i < l; i++)
            chrome.bookmarks.move(mba[i], {
              parentId: rid,
              index: indCalc + i,
            });

          makeRoot();
        });
      }
    }
  }
};

const _p_L = e => {
  // panel context menu CLICK LISTENER
  chrome.bookmarks.getChildren(rid, children => {
    let cl = children.length;

    if (e.target.id === "r_bp_1") {
      chrome.tabs.query({ active: !!1 }, tabs => {
        chrome.bookmarks.create(
          { parentId: rid, index: cl, title: tabs[0].title, url: tabs[0].url },
          () => {
            makeRoot(null, 1);
          }
        );
      });
    } else if (e.target.id === "r_bp_2") {
      chrome.tabs.query({ active: !!1 }, tabs => {
        chrome.bookmarks.create(
          {
            parentId: rid,
            index: cl,
            title: chrome.i18n.getMessage("RC_M2"),
            url: null,
          },
          () => {
            makeRoot(null, 1);
          }
        );
      });
    } else if (e.target.id === "r_bp_3") _c_paste_p(rid, cl);
  });
};

/****************** SEPARATOR **************************/

const addSep = a => {
  // create separator AFTER clicked node
  chrome.bookmarks.get(a, b => {
    let tmpU = "v7bookmarks://separator" + Date.now();
    chrome.bookmarks.create(
      {
        parentId: b[0].parentId,
        index: b[0].index + 1,
        title:
          "¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤",
        url: tmpU,
      },
      () => {
        makeRoot();
      }
    );
  });
};

function _s_mu(e) {
  /*THIS*/ // separator mouse up
  if (e.button === 0) {
    if (e.ctrlKey) {
      if (gData.CAT) {
        if (e.shiftKey) {
          let a = this.parentNode.id;

          while (a) {
            let pFolder = a.replace("li", "");
            let tmpPF = document.getElementById(pFolder);

            if (tmpPF) {
              let nA = [tmpPF];
              f_de_sel(nA);
              a = document.getElementById(a).parentNode.id;
            } else a = !1;
          }

          if (this.className === "sepSel") this.className = "sepNor";
          else this.className = "sepSel";
        }
      } else {
        let a = this.parentNode.id;

        while (a) {
          let pFolder = a.replace("li", "");
          let tmpPF = document.getElementById(pFolder);

          if (tmpPF) {
            let nA = [tmpPF];
            f_de_sel(nA);
            a = document.getElementById(a).parentNode.id;
          } else a = !1;
        }

        if (this.className === "sepSel") this.className = "sepNor";
        else this.className = "sepSel";
      }
    } else if (e.shiftKey) {
      _s_sel(this);

      this.className = "sepSel";
    } else {
      _dSel();

      this.className = "sepSel";
    }

    lastClick = this.id;
  } else if (e.button === 2) {
    if (last !== "trash") {
      rcBN = this;

      sepRC(this, e.pageX, e.pageY);
    }
  }

  kbHelper = this.id;
}

function _s_ds(e) {
  /*THIS*/ // separator drag start
  dURLs = [];

  let dIDs = [];

  if (this.className === "sepSel") {
    let colAll = document.querySelectorAll(".fSel, .bSel, .sepSel");

    for (let j = 0, d = colAll.length; j < d; j++) {
      dIDs.push(colAll[j].id);

      if (colAll[j].className === "bSel") dURLs.push(colAll[j].url);
    }

    e.dataTransfer.setData("dragID", dIDs);

    if (dIDs.length > 1) {
      let img = document.createElement("img");
      img.src =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAUCAIAAAC/CtwvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAABFSURBVFhH7dTBDQAgCMBA13MhBmNBffBjAoslNwBNCGtHDmMSwTdJBzJt7eLhEZhE4HsgMInA9/DYtLWLh0dgEsG4pMgL7LnmUdAvTmwAAAAASUVORK5CYII=";
      e.dataTransfer.setDragImage(img, -10, -5);
    }
  } else {
    _dSel();

    e.dataTransfer.setData("dragID", this.id);

    this.className = "sepSel";
  }

  kbHelper = this.id;
}

const _s_de = e => {
  // separator drag enter
  e.preventDefault();
};

function _s_do(e) {
  /*THIS*/ // separator drag over
  this.style.borderBottom = "4px solid #1BE529";
}

function _s_dl(e) {
  /*THIS*/ // separator drag leave
  this.style.borderBottom = "";
}

function _s_dd(e) {
  /*THIS*/ // separator drop on
  this.style.borderBottom = "";

  let vu = e.dataTransfer.getData("URL");

  if (vu) {
    if (
      last === "bookmarks_bar" ||
      last === "user_root" ||
      last === "unsorted" ||
      last === "speed_dial" ||
      last === "other"
    ) {
      chrome.tabs.query({}, tabs => {
        let f = !0,
          i = tabs.length,
          tl = null;

        while (i--) {
          if (tabs[i].url === vu) {
            f = !1;
            tl = tabs[i].title;
            break;
          }
        }

        chrome.bookmarks.create(
          {
            parentId: this.parentId,
            index: this.index + 1,
            url: vu,
            title: tl,
          },
          btn => {
            makeRoot(null, 1);
            rep = 1;
            if (f) _getT(vu, btn.id);
          }
        );
      });
    }
  } else if (this.className === "sepNor") {
    let ts1 = e.dataTransfer.getData("dragID");

    if (ts1) {
      if (
        last === "bookmarks_bar" ||
        last === "user_root" ||
        last === "unsorted" ||
        last === "speed_dial" ||
        last === "other"
      ) {
        let mba = ts1.split(",");
        let prt = this.parentId;
        let ind = this.index;

        chrome.bookmarks.get(mba, res => {
          for (let i = res.length; i--; ) {
            if (res[i].parentId !== prt)
              chrome.bookmarks.move(res[i].id, {
                parentId: prt,
                index: ind + 1,
              });
            else {
              if (res[i].index > ind)
                chrome.bookmarks.move(res[i].id, {
                  parentId: prt,
                  index: ind + 1,
                });
              else {
                chrome.bookmarks.move(res[i].id, {
                  parentId: prt,
                  index: ind + 1,
                });
                ind--;
              }
            }
          }

          makeRoot();
        });
      }
    }
  }
}

const sepRC = (n, a, b) => {
  // desni klik na separator
  let f = document.getElementsByClassName("fSel");
  let bk = document.getElementsByClassName("bSel");
  let s = document.getElementsByClassName("sepSel");

  let summ = f.length + bk.length + s.length;

  if (n.className === "sepNor" || (n.className === "sepSel" && summ === 1)) {
    f_de_sel(f);

    for (let i = bk.length; i--; ) bk[i].className = "bNor";
    for (let j = s.length; j--; ) s[j].className = "sepNor";

    n.className = "sepSel";

    if (a + rcSafe.separator > document.body.clientWidth)
      a = document.body.clientWidth - rcSafe.separator;

    r_bsp.style.top = b + "px";
    r_bsp.style.left = a + "px";
    r_bsp.style.display = "block";

    r_bsp.addEventListener("click", r_sc);
  } else if (n.className === "sepSel" && summ > 1) {
    if (f.length + bk.length === 0) {
      if (a + rcSafe.separator > document.body.clientWidth)
        a = document.body.clientWidth - rcSafe.separator;

      r_bsp.style.top = b + "px";
      r_bsp.style.left = a + "px";
      r_bsp.style.display = "block";

      r_bsp.addEventListener("click", r_sc);
    } else {
      let rx = a,
        ry = b;
      if (rx + rcSafe.bookmark > document.body.clientWidth)
        rx = document.body.clientWidth - rcSafe.bookmark;

      _rc_multi_(rx, ry, f.length);
    }
  }

  _aL();
};

const r_sc = e => {
  //only separator selected - rc - click listener (delete)
  _D();
  _d_cb();
};

/****************** RECENT BOOKMARKS **************************/

const _unsrt = a => {
  // if user choose unsorted instead of recent
  let pr = document.getElementsByClassName("hbN hbA")[0];
  if (pr) pr.className = "hbN";

  recent.className = "hbN hbA";
  trashClear.style.display = "none";
  lA = 1;
  chrome.bookmarks.getRootByName("unsorted", r => {
    (rid = r.id), (last = "recent");
    makeRoot(a);
  });

  //_dSel(1);

  sbk.value = "";

  chrome.storage.local.set({ last: "recent" });

  kbHelper = !1;

  setTimeout(_f, 800);

  lA = 0;
};

const _recBkm = () => {
  // recent bookmarks
  let prClass = document.getElementsByClassName("hbN hbA")[0];
  if (prClass) prClass.className = "hbN";

  r_s = Date.now();

  recent.className = "hbN hbA";
  panel.innerHTML = "";
  trashClear.style.display = "none";

  let root = document.createElement("div");
  root.id = "li_recent";
  root.style.paddingLeft = 5 + "px";
  root.style.zoom = gData.zoom + "%";
  if (lA) root.className = "anim";
  panel.appendChild(root);

  root.style.zoom = gData.zoom + "%";
  dzzd = gData.zoom / 100;

  let danas = new Date().toLocaleDateString(),
    dani = {};

  chrome.bookmarks.getRootByName("trash", t => {
    chrome.bookmarks.getSubTree(t.id, sub => {
      let sc = sub[0].children,
        tTr = {},
        t100 = 0;

      const rSub = s => {
        for (let j = 0, d = s.length; j < d; j++) {
          if (s[j].children) rSub(s[j].children);
          else tTr[s[j].id] = 1;
        }
      };

      rSub(sc);

      chrome.bookmarks.getRecent(200, r => {
        for (let i = 0, l = r.length; i < l; i++) {
          if (t100 > 100) break;

          if (!r[i].url.startsWith("v7")) {
            if (!tTr[r[i].id]) {
              t100++;

              if (r[i].dateAdded) {
                let d3 = new Date(r[i].dateAdded);
                let bd = d3.toLocaleString(navigator.language, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                });

                if (!dani[bd]) {
                  let nd = document.createElement("div");
                  nd.className = "drb";

                  if (bd !== danas) nd.textContent = bd;
                  else nd.textContent = chrome.i18n.getMessage("today");

                  root.appendChild(nd);

                  dani[bd] = 1;
                }
              } else {
                if (!dani["nema"]) {
                  let nd = document.createElement("div");
                  nd.className = "drb";
                  nd.textContent = chrome.i18n.getMessage("ud");

                  root.appendChild(nd);

                  dani["nema"] = 1;
                }
              }

              let bn = document.createElement("div");
              bn.className = "bNor";
              bn.id = r[i].id;
              bn.url = r[i].url;
              bn.date = r[i].dateAdded;
              bn.index = r[i].index;
              bn.parentId = r[i].parentId;
              if (gData.tt) bn.title = r[i].title + "\n" + r[i].url;

              let sb = document.createElement("div");
              sb.className = "srBtn";
              bn.appendChild(sb);

              let f = document.createElement("div");
              f.className = "fav";
              f.style.backgroundImage =
                "url(chrome://favicon/" + r[i].url + ")";
              f.title = chrome.i18n.getMessage("reveal");
              sb.appendChild(f);

              let bt = document.createElement("div");
              bt.className = "bT";
              if (r[i].title === "") {
                bt.innerText = "\u00a0\u00a0\u00a0 ...  " + r[i].url; //bt.textContent = r[i].url;
                bt.style.opacity = "0.8";
              } else bt.textContent = r[i].title;
              bn.appendChild(bt);

              root.appendChild(bn);

              bn.addEventListener("mouseup", _rec_mu);
              bn.addEventListener("dragstart", _rec_ds);
              bn.addEventListener("dragend", _dgEnd);
            }
          }
        }

        _dSel(1); // ?????????????? zašto deselect kada je panel ispražnjen

        sbk.value = "";

        last = "recent";

        chrome.storage.local.set({ last: "recent" });

        kbHelper = !1;

        setTimeout(_f, 800);

        lA = 0;
      });
    });
  });
};

function _rec_mu(e) {
  /*THIS*/ // recent bookmark mouse up
  if (e.button === 0) {
    if (e.target.className === "fav") {
      e.stopPropagation();
      _rec_rev(this.id);
    } else {
      if (e.detail === 2) {
        let tUrl = this.url;

        chrome.tabs.query({ currentWindow: !!1, active: !!1 }, tabs => {
          chrome.tabs.update({ url: tUrl });
          if (gData.wClose) window.close();
        });
      } else {
        if (e.ctrlKey) {
          if (gData.CAT) {
            if (e.shiftKey) {
              if (this.className === "bSel") this.className = "bNor";
              else this.className = "bSel";
            } else {
              chrome.tabs.create({ url: this.url, active: !!1 });

              if (gData.wClose) window.close();
            }
          } else {
            let a = this.parentNode.id;

            while (a) {
              let pFolder = a.replace("li", "");

              if (document.getElementById(pFolder)) {
                document.getElementById(pFolder).className = "fNor";
                a = document.getElementById(a).parentNode.id;
              } else a = !1;
            }

            if (this.className === "bSel") this.className = "bNor";
            else this.className = "bSel";
          }
        } else {
          _nfoD(this);

          if (gData.sCl) {
            let tUrl = this.url;

            chrome.tabs.update({ url: this.url });
            if (gData.wClose) window.close();
          }
        }
      }
    }
  } else if (e.button === 1) {
    _nfoD(this);

    chrome.tabs.create({ url: this.url, active: !1 });
  } else if (e.button === 2) {
    rcBN = this;

    let rx = e.pageX,
      ry = e.pageY;

    if (rx + rcSafe.bookmark > document.body.clientWidth)
      rx = document.body.clientWidth - rcSafe.bookmark;

    let b = document.getElementsByClassName("bSel");

    if (
      this.className === "bNor" ||
      (this.className === "bSel" && b.length === 1)
    ) {
      _nfoD(this);

      if (ry + 205 > document.body.clientHeight)
        ry = document.body.clientHeight - 205;

      r_br.style.top = ry + "px";
      r_br.style.left = rx + "px";
      r_br.style.display = "block";

      r_br.addEventListener("click", rc_rec);
    } else if (this.className === "bSel" && b.length > 1) _rc_multi_(rx, ry, 0); //više selektiranih na RECENT panelu

    _aL();
  }

  kbHelper = this.id;
}

const _nfoD = a => {
  // deselect other bookmarks on recent panel
  let b = document.getElementsByClassName("bSel"),
    i = b.length;

  while (i--) b[i].className = "bNor";

  a.className = "bSel";
};

const rc_rec = e => {
  // RECENT context menu CLICK LISTENER
  e.stopPropagation();

  if (e.target.id === "r_br_1") openSel("t", !1);
  else if (e.target.id === "r_br_2") openSel("w", !1);
  else if (e.target.id === "r_br_3") openSel("w", !!1);
  else if (e.target.id === "r_br_4") {
    _d_cb();
    _c_cut();
  } else if (e.target.id === "r_br_5") {
    _d_cb();
    _c_copy();
  } else if (e.target.id === "r_br_6") {
    r_br.style.display = "none";
    p_eb.style.display = "block";

    let tmpT = rcBN.getElementsByClassName("bT")[0];
    if (tmpT.innerText.startsWith("\u00a0")) p_eb_2.value = "";
    else p_eb_2.value = tmpT.textContent;

    //p_eb_2.value = rcBN.textContent;
    p_eb_2.select();
    p_eb_3.value = rcBN.url;

    p_eb.addEventListener("click", bkmBP_CL);
  } else if (e.target.id === "r_br_7") {
    let prSelBkm = document.getElementsByClassName("bSel"),
      del_id = []; /* , tmpRecId = '' */
    _d_cb();

    for (let j = 0, d = prSelBkm.length; j < d; j++) {
      del_id.push(prSelBkm[j].id);
      _del_anim(prSelBkm[j]);
    }

    setTimeout(_flashBtn, 700, "trash");

    chrome.bookmarks.getRootByName("trash", rf => {
      // nemoj obnoviti već makni nodes
      for (let k = 0, m = del_id.length; k < m; k++)
        chrome.bookmarks.move(del_id[k], { parentId: rf.id, index: 0 });
    });
  }
};

function _rec_ds(e) {
  /*THIS*/ // recent bookmark drag start
  dURLs = [];

  let dIDs = [];

  if (this.className === "bSel") {
    let colAll = document.getElementsByClassName("bSel");

    for (let j = 0, d = colAll.length; j < d; j++) {
      dIDs.push(colAll[j].id);
      dURLs.push(colAll[j].url);
    }

    e.dataTransfer.setData("dragID", dIDs);

    if (dIDs.length > 1) {
      let img = document.createElement("img");
      img.src =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAUCAIAAAC/CtwvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAABFSURBVFhH7dTBDQAgCMBA13MhBmNBffBjAoslNwBNCGtHDmMSwTdJBzJt7eLhEZhE4HsgMInA9/DYtLWLh0dgEsG4pMgL7LnmUdAvTmwAAAAASUVORK5CYII=";
      e.dataTransfer.setDragImage(img, -10, -5);
    }
  } else {
    let b = document.getElementsByClassName("bSel"),
      recID = this.id.split("_")[1],
      j = b.length;

    while (j--) b[j].className = "bNor";

    dURLs.push(this.url);

    e.dataTransfer.setData("dragID", this.id);

    this.className = "bSel";
  }
}

const _rec_rev = a => {
  // reveal click on recent - find target root
  chrome.bookmarks.getTree(t => {
    let t_ = t[0].children;
    let c = 0;
    let r = null;
    let o = 1;

    for (let i = 0, d = t_.length; i < d; i++) {
      const _gr = b => {
        for (let j = 0, l = b.length; j < l; j++) {
          if (!b[j].children) {
            if (b[j].id === a) {
              r = b[j].id;
              c = t_[i].id;
              o = !1;
              break;
            }
          } else _gr(b[j].children);
        }
      };

      if (o) _gr(t_[i].children);
    }

    if (r) _rev(c, r);
  });
};

/****************** TRASH **************************/

const tpbg = () => {
  // show trash panel background - if empty
  panel.innerHTML = "";

  let pzbg = document.createElement("div");
  pzbg.id = "trashpzbg";
  panel.appendChild(pzbg);

  let p = document.createElement("div");
  p.id = "trashBg";
  p.className = "bg_img";
  p.style.backgroundImage = "url('/img/trash.svg')";
  pzbg.appendChild(p);
};

const rc_und = (n, a, b) => {
  // create ctx menu for undelete on trash panel
  let rx = a;

  if (rx + rcSafe.trash > document.body.clientWidth)
    rx = document.body.clientWidth - rcSafe.trash;

  let f = document.getElementsByClassName("fSel");
  let bk = document.getElementsByClassName("bSel");

  let summ = f.length + bk.length;

  if (
    n.className == "bNor" ||
    n.className == "fNor" ||
    (n.className === "bSel" && summ === 1) ||
    (n.className === "fSel" && summ === 1)
  ) {
    f_de_sel(f);
    let i = bk.length;

    while (i--) bk[i].className = "bNor";

    if (n.className === "bNor") n.className = "bSel";
    else if (n.className === "fNor") n.className = "fSel";
  }

  r_tr_.style.top = b + "px";
  r_tr_.style.left = rx + "px";
  r_tr_.style.display = "block";

  r_tr_.addEventListener("click", r_tr_u);

  _aL();
};

const m2t = (b, c) => {
  //move to trash
  chrome.bookmarks.getRootByName("trash", rf => {
    //for (let k = 0, m = b.length; k < m; k++) chrome.bookmarks.move(b[k], { parentId: rf.id, index: 0 });
    b.map(x => chrome.bookmarks.move(x, { parentId: rf.id, index: 0 }));

    if (!c) {
      setTimeout(() => {
        if (last === "recent") _recBkm();
        else makeRoot();
      }, 900);
    }

    chrome.bookmarks.getSubTree(rf.id, kt => {
      let resK = kt[0].children;

      const delS = a => {
        for (let i = 0, l = a.length; i < l; i++) {
          if (a[i].url && a[i].url.startsWith("v7"))
            chrome.bookmarks.remove(a[i].id);
          else if (a[i].children) delS(a[i].children);
        }
      };

      delS(resK);
    });
  });
};

const et = () => {
  // empty trash
  _d_cb();

  chrome.bookmarks.getRootByName("trash", tr => {
    let l = document.getElementById("li" + tr.id);

    if (l) {
      while (l.lastChild) l.removeChild(l.lastChild);
    }

    if (last === "trash") tpbg();

    trashClear.style.display = "none";

    chrome.bookmarks.getSubTree(tr.id, s => {
      let sc = s[0].children;

      for (let j = 0, d = sc.length; j < d; j++) {
        if (sc[j].children) chrome.bookmarks.removeTree(sc[j].id);
        else chrome.bookmarks.remove(sc[j].id);
      }
    });
  });
};

const r_tr_u = () => {
  // Trash undelete click
  undelete();
  _d_cb();
};

const undelete = () => {
  let f = document.querySelectorAll(".fSel");
  let b = document.querySelectorAll(".bSel");
  let idA = [];

  for (let i = 0, l = f.length; i < l; i++) {
    idA.push(f[i].id);

    _del_anim(f[i], f[i].nextSibling);
  }

  for (let j = 0, l1 = b.length; j < l1; j++) {
    idA.push(b[j].id);

    _del_anim(b[j]);
  }

  setTimeout(_flashBtn, 700, "user_root");

  chrome.bookmarks.getRootByName("user_root", mf => {
    //let k = idA.length;
    //while (k--) chrome.bookmarks.move(idA[k], { parentId: mf.id, index: 0 });
    idA.map(x => chrome.bookmarks.move(x, { parentId: mf.id, index: 0 }));

    chrome.bookmarks.getRootByName("trash", tr => {
      chrome.bookmarks.getSubTree(tr.id, gc => {
        let ca = gc[0].children;

        if (!ca.length) setTimeout(tpbg, 700);
        else {
          const _fl = a => {
            for (let m = 0, ml = a.length; m < ml; m++) {
              if (a[m].children) {
                let q = document.getElementById(a[m].id);
                if (q)
                  q.getElementsByClassName("fch")[0].textContent =
                    a[m].children.length;

                _fl(a[m].children);
              }
            }
          };

          _fl(ca);
        }
      });
    });
  });
};

const _tr2 = () => {
  // righ click on trash button
  if (trash.o === 0) {
    document.removeEventListener("keydown", tDel);

    r_TR.style.display = "block";
    r_TR.addEventListener("blur", helper_blur_trash);

    r_TR.onclick = () => {
      r_TR.blur();
      et();
    };

    ctxScroll = "r_TR";

    r_TR.focus();
  }
};

/****************** KEYBOARD NAVIGATION **************************/

const _LA = () => {
  // left arrow
  if (panel.children[0].id === "Spanel" || panel.children[0].id === "li_recent")
    return;
  else {
    let getSel = document.querySelectorAll(".fSel, .bSel, .sepSel");

    if (getSel.length === 1) {
      let prCh = getSel[0];

      if (
        prCh.className === "fSel" &&
        prCh.nextSibling.style.display === "block"
      ) {
        prCh.nextSibling.style.display = "none";

        prCh.getElementsByClassName("fav")[0].innerHTML = fc_;

        kbHelper = prCh.id;

        if (OF) {
          if (
            last === "bookmarks_bar" ||
            last === "user_root" ||
            last === "unsorted" ||
            last === "other"
          ) {
            SF[last] = 0;
            chrome.storage.local.set({ SF: SF });
          }
        } else _sf(prCh.id);

        if (prCh.getBoundingClientRect().top * dzzd < 35 * dzzd)
          prCh.scrollIntoView(!!1);
      } else if (prCh.parentNode.className === "baseL") {
        let glavniF = prCh.parentNode.previousSibling;

        glavniF.getElementsByClassName("fav")[0].innerHTML = fc_;

        f_sel([glavniF]);

        kbHelper = glavniF.id;

        prCh.parentNode.style.display = "none";

        if (prCh.className === "fSel") {
          let nA = [prCh];
          f_de_sel(nA);
        } else if (prCh.className === "bSel") prCh.className = "bNor";
        else if (prCh.className === "sepSel") prCh.className = "sepNor";

        if (OF) {
          if (
            last === "bookmarks_bar" ||
            last === "user_root" ||
            last === "unsorted" ||
            last === "other"
          ) {
            SF[last] = 0;
            chrome.storage.local.set({ SF: SF });
          }
        } else _sf(glavniF.id);

        if (glavniF.getBoundingClientRect().top * dzzd < 35 * dzzd)
          glavniF.scrollIntoView(!!1);
      }
    }
  }
};

const _RA = () => {
  // right arrow
  if (
    panel.firstElementChild.id !== "Spanel" ||
    panel.firstElementChild.id !== "li_recent"
  ) {
    let getSel = document.getElementsByClassName("fSel");

    if (getSel.length === 1) {
      let thisID = getSel[0].id;
      let thisList = getSel[0].nextSibling;

      getSel[0].getElementsByClassName("fav")[0].innerHTML = fo_;
      getSel[0].nextSibling.style.display = "block";

      if (getSel[0].nextSibling.children.length) {
        let gsnsc = getSel[0].nextSibling.children[0];

        if (gsnsc.className === "fNor") f_sel([gsnsc]);
        else if (gsnsc.className === "bNor") gsnsc.className = "bSel";
        else if (gsnsc.className === "sepNor") gsnsc.className = "sepSel";

        kbHelper = gsnsc.id;

        let nA = [getSel[0]];

        f_de_sel(nA);
      } else kbHelper = getSel[0].id;

      if (OF) {
        let OFobjList = {},
          a = thisList.parentNode;

        OFobjList[thisList.id] = 1;

        while (a.id !== "panel") {
          OFobjList[a.id] = 1;
          a = a.parentNode;
        }

        let getAllList = document.getElementsByClassName("baseL");

        for (let s1 = getAllList.length; s1--; ) {
          if (getAllList[s1].style.display === "block") {
            if (!OFobjList[getAllList[s1].id]) {
              getAllList[s1].style.display = "none";
              getAllList[s1].previousSibling.getElementsByClassName(
                "fav"
              )[0].innerHTML = fc_;
            }
          }
        }

        if (
          last === "bookmarks_bar" ||
          last === "user_root" ||
          last === "unsorted" ||
          last === "other"
        ) {
          SF[last] = thisID;
          chrome.storage.local.set({ SF: SF });
        }
      } else {
        if (last === "bookmarks_bar") {
          folders.bookmarks_bar.push(thisID);
          chrome.storage.local.set({ folders: folders });
        } else if (last === "user_root") {
          folders.user_root.push(thisID);
          chrome.storage.local.set({ folders: folders });
        } else if (last === "unsorted") {
          folders.unsorted.push(thisID);
          chrome.storage.local.set({ folders: folders });
        } else if (last === "other") {
          folders.other.push(thisID);
          chrome.storage.local.set({ folders: folders });
        }
      }
    }
  }
};

const _e = () => {
  // e for EDIT
  let getSel = document.querySelectorAll(".fSel, .bSel, .sepSel");

  if (getSel.length === 1) {
    if (getSel[0].className === "fSel") {
      rcFN = getSel[0];

      _aL();

      p_nf.style.display = "block";
      p_nf_1.value = rcFN.getElementsByClassName("bT")[0].textContent;
      p_nf_1.select();
      p_nf.version = 2;
      p_nf.addEventListener("click", bkmFP_Cl);
    } else if (getSel[0].className === "bSel") {
      rcBN = getSel[0];

      _aL();

      let tmpT = rcBN.getElementsByClassName("bT")[0];
      if (tmpT.innerText.startsWith("\u00a0")) p_eb_2.value = "";
      else p_eb_2.value = tmpT.textContent;

      p_eb.style.display = "block";
      p_eb_2.select();
      p_eb_3.value = rcBN.url;

      p_eb.addEventListener("click", bkmBP_CL);
    }
  }
};

const _f = () => {
  // f for FOCUS SEARCH FIELD
  if (window.innerWidth > 155) sbk.focus();
};

const _a = () => {
  // a for SELECT ALL
  if (panel.children[0].id === "Spanel" || panel.children[0].id === "li_recent")
    return;

  let getSel = document.querySelectorAll(".fSel, .bSel, .sepSel");

  if (getSel.length) {
    if (getSel.length === 1) {
      let pc = getSel[0].parentNode.children;

      for (let j = 0, l = pc.length; j < l; j++) {
        if (pc[j].className === "fNor" || pc[j].className === "fSel") {
          pc[j].getElementsByClassName("fav")[0].innerHTML = fc_;
          pc[j].nextSibling.style.display = "none";
          f_sel([pc[j]]);
        } else if (pc[j].className === "bNor") pc[j].className = "bSel";
        else if (pc[j].className === "selNor") pc[j].className = "selSel";
      }
    } else {
      let p_id = getSel[0].parentNode.id,
        pFlag = !!1;

      for (let i = getSel.length; i--; ) {
        if (getSel[i].parentNode.id !== p_id) {
          pFlag = !1;
          break;
        }
      }

      if (pFlag) {
        let pc = document.getElementById(p_id).children;

        for (let j = pc.length; j--; ) {
          if (pc[j].className === "fNor" || pc[j].className === "fSel") {
            pc[j].getElementsByClassName("fav")[0].innerHTML = fc_;
            pc[j].nextSibling.style.display = "none";
            f_sel([pc[j]]);
          } else if (pc[j].className === "bNor") pc[j].className = "bSel";
          else if (pc[j].className === "selNor") pc[j].className = "selSel";
        }
      }
    }
  } else {
    let svi = panel.children[0].childNodes,
      baseId = panel.children[0].id;

    for (let i = svi.length; i--; ) {
      if (baseId === svi[i].parentNode.id) {
        if (svi[i].className === "fNor") f_sel([svi[i]]);
        else if (svi[i].className === "bNor") svi[i].className = "bSel";
        else if (svi[i].className === "sepNor") svi[i].className = "sepSel";
      }
    }
  }
};

const _DA = () => {
  // down arrow
  if (
    panel.firstElementChild.id === "Spanel" ||
    panel.firstElementChild.id === "li_recent"
  ) {
    let pivotNode = document.getElementById(kbHelper);

    if (kbHelper) {
      let pivotNode = document.getElementById(kbHelper);

      if (pivotNode) {
        let allNodes = document.querySelectorAll(".bSel, .bNor"),
          hFlag = !!1;

        pivotFlag = !1;

        l = allNodes.length;

        for (let i = 0; i < l; i++) {
          if (pivotFlag) {
            if (allNodes[i].offsetParent) {
              let getB = document.getElementsByClassName("bSel");

              for (let m = getB.length; m--; ) getB[m].className = "bNor";

              allNodes[i].className = "bSel";

              kbHelper = allNodes[i].id;

              hFlag = !1;

              if (
                allNodes[i].getBoundingClientRect().bottom * dzzd >
                window.innerHeight - 50
              )
                allNodes[i].scrollIntoView(!1);

              break;
            }
          } else if (allNodes[i].id === kbHelper) pivotFlag = !!1;
        }

        if (hFlag) _sPrvi_s_r();
      } else _sPrvi_s_r();
    } else _sPrvi_s_r();
  } else {
    if (kbHelper) {
      let pivotNode = document.getElementById(kbHelper);
      if (pivotNode) {
        let allNodes = document.querySelectorAll(
          ".fSel, .bSel, .sepSel, .fNor, .bNor, .sepNor"
        );
        let l = allNodes.length;
        let hFlag = !!1;
        let pivotFlag = !1;

        for (let i = 0; i < l; i++) {
          if (pivotFlag) {
            if (allNodes[i].offsetParent) {
              _dSel();

              if (allNodes[i].className === "fNor") f_sel([allNodes[i]]);
              else if (allNodes[i].className === "bNor")
                allNodes[i].className = "bSel";
              else if (allNodes[i].className === "sepNor")
                allNodes[i].className = "sepSel";

              (kbHelper = allNodes[i].id), (hFlag = !1);

              if (
                allNodes[i].getBoundingClientRect().bottom * dzzd >
                window.innerHeight - 50 * dzzd
              )
                allNodes[i].scrollIntoView(!1);

              break;
            }
          } else if (allNodes[i].id === kbHelper) pivotFlag = !!1;
        }

        if (hFlag) _sPrvi();
      } else _sPrvi();
    } else _sPrvi();
  }
};

const _UA = () => {
  // up arrow
  if (
    panel.firstElementChild.id === "Spanel" ||
    panel.firstElementChild.id === "li_recent"
  ) {
    let pivotNode = document.getElementById(kbHelper);

    if (kbHelper) {
      let pivotNode = document.getElementById(kbHelper);

      if (pivotNode) {
        let allNodes = document.querySelectorAll(".bSel, .bNor"),
          hFlag = !!1;
        pivotFlag = !1;

        for (let i = allNodes.length; i--; ) {
          if (pivotFlag) {
            if (allNodes[i].offsetParent) {
              let getB = document.getElementsByClassName("bSel");

              for (let m = getB.length; m--; ) getB[m].className = "bNor";

              allNodes[i].className = "bSel";

              kbHelper = allNodes[i].id;

              hFlag = !1;

              if (allNodes[i].getBoundingClientRect().top * dzzd < 35 * dzzd)
                allNodes[i].scrollIntoView(!!1);

              break;
            }
          } else if (allNodes[i].id === kbHelper) pivotFlag = !!1;
        }

        if (hFlag) _sZadnji_s_r();
      } else _sZadnji_s_r();
    } else _sZadnji_s_r();
  } else {
    if (kbHelper) {
      let pivotNode = document.getElementById(kbHelper);
      if (pivotNode) {
        let allNodes = document.querySelectorAll(
            ".fSel, .bSel, .sepSel, .fNor, .bNor, .sepNor"
          ),
          hFlag = !!1;
        pivotFlag = !1;

        for (let i = allNodes.length; i--; ) {
          if (pivotFlag) {
            if (allNodes[i].offsetParent) {
              _dSel();

              if (allNodes[i].className === "fNor") f_sel([allNodes[i]]);
              else if (allNodes[i].className === "bNor")
                allNodes[i].className = "bSel";
              else if (allNodes[i].className === "sepNor")
                allNodes[i].className = "sepSel";

              (kbHelper = allNodes[i].id), (hFlag = !1);

              if (allNodes[i].getBoundingClientRect().top * dzzd < 35 * dzzd)
                allNodes[i].scrollIntoView(!!1);

              break;
            }
          } else if (allNodes[i].id === kbHelper) {
            if (i !== 0) pivotFlag = !!1;
            else {
              break;
            }
          }
        }

        if (hFlag) _sZadnji();
      } else _sZadnji();
    } else _sZadnji();
  }
};

const _sPrvi = () => {
  // select first (for keyboard navigation with arrows)
  _dSel();

  let _prvi = panel.children[0].children[0];

  if (_prvi.className === "fNor") f_sel([_prvi]);
  else if (_prvi.className === "bNor") _prvi.className = "bSel";
  else if (_prvi.className === "sepNor") _prvi.className = "sepSel";

  panel.scrollTop = 0;

  kbHelper = _prvi.id;
};

const _sZadnji = () => {
  // select last (for keyboard navigation with arrows)
  let k,
    m,
    n,
    svi,
    zadnji = null,
    i;

  _dSel();

  svi = document.querySelectorAll(".fNor, .bNor, .sepNor");

  if (svi.length) {
    for (i = svi.length; i--; ) {
      if (svi[i].offsetParent) {
        zadnji = svi[i];
        break;
      }
    }

    if (zadnji) {
      if (zadnji.className === "fNor") f_sel([zadnji]);
      else if (zadnji.className === "bNor") zadnji.className = "bSel";
      else if (zadnji.className === "sepNor") zadnji.className = "sepSel";

      if (
        zadnji.getBoundingClientRect().bottom * dzzd >
        window.innerHeight - 50
      )
        zadnji.scrollIntoView(!1);

      kbHelper = zadnji.id;
    }
  }
};

const _sPrvi_s_r = () => {
  // select first SEARCH (for keyboard navigation with arrows)
  let getB = document.getElementsByClassName("bSel");
  for (let m = getB.length; m--; ) getB[m].className = "bNor";

  let getNor = document.getElementsByClassName("bNor");
  let prvi = getNor[0];

  if (prvi) {
    prvi.className = "bSel";
    if (prvi.getBoundingClientRect().bottom * dzzd < 35 * dzzd)
      prvi.scrollIntoView(!!1);
  }

  kbHelper = prvi.id;
};

const _sZadnji_s_r = () => {
  // select last SEARCH (for keyboard navigation with arrows)
  let g = document.getElementsByClassName("bSel");
  for (let m = g.length; m--; ) g[m].className = "bNor";

  let n = document.getElementsByClassName("bNor");
  let z = n[n.length - 1];

  if (z) {
    z.className = "bSel";
    if (
      z.getBoundingClientRect().bottom * dzzd >
      window.innerHeight - 50 * dzzd
    )
      z.scrollIntoView(!1);
  }

  kbHelper = z.id;
};

const keyContext = e => {
  //keyboard listener for prompts
  if (e.keyCode === 13) {
    //enter
    if (p_nf.style.display === "block") _sfnv(p_nf.version);
    else {
      if (p_eb.style.display === "block") _sbe();
      //else if (p_s.style.display ==='block') sortPanel();
    }
  } else if (e.keyCode === 27) _d_cb();
};

const tDel = e => {
  // main keyboard listener
  if (e.keyCode === 46) {
    //delete
    //e.preventDefault();
    //_D();

    if (document.activeElement.id === "sbk") return;
    else _D();
  } else if (e.keyCode === 13) {
    //ENTER
    if (document.activeElement.id === "sbk") return;
    else {
      let getSel = document.querySelectorAll(".fSel, .bSel, .sepSel");
      if (getSel.length === 1) {
        if (getSel[0].className === "fSel") {
          if (e.ctrlKey) openSel("t", !1);
          else if (e.shiftKey) openSel("w", !1);
        } else if (getSel[0].className === "bSel") {
          if (e.ctrlKey) chrome.tabs.create({ url: getSel[0].url });
          else if (e.shiftKey)
            chrome.tabs.create({ url: getSel[0].url, active: !1 });
          else chrome.tabs.update({ url: getSel[0].url });
        }
      }
    }
  } else if (e.keyCode === 69) {
    //e slovo za EDIT
    if (e.ctrlKey) {
      e.preventDefault();
      _e();
    }
  } else if (e.keyCode === 113) {
    //F2 za EDIT
    //e.preventDefault();
    _e();
  } else if (e.keyCode === 70) {
    //f slovo za FOCUS SEARCH FIELD
    if (e.ctrlKey) {
      e.preventDefault();
      _f();
    }
  } else if (e.keyCode === 65) {
    //a slovo za SELECT ALL
    if (e.ctrlKey) {
      e.preventDefault();
      _a();
    }
  } else if (e.keyCode === 39) {
    //right arrow
    e.preventDefault();

    if (e.ctrlKey) {
      if (last === "speed_dial") {
        /* if (gData.uns) _unsrt();
				else _recBkm(); */
        _recBkm();
      } else if (last === "user_root") _bb();
      else if (last === "recent") _tr();
      else if (last === "trash") _ur();
      else if (last === "bookmarks_bar") _sd();
      else _ur();
      sbk.value = "";
    } else _RA();
  } else if (e.keyCode === 37) {
    //left arrow
    e.preventDefault();

    if (e.ctrlKey) {
      if (last === "speed_dial") _bb();
      else if (last === "user_root") _tr();
      else if (last === "recent") _sd();
      else if (last === "trash") {
        /* if (gData.uns) _unsrt();
				else _recBkm(); */
        _recBkm();
      } else if (last === "bookmarks_bar") _ur();
      else _ur();
      sbk.value = "";
    } else _LA();
  } else if (e.keyCode === 40) {
    //down arrow
    e.preventDefault();
    _DA();
  } else if (e.keyCode === 38) {
    //up arrow
    e.preventDefault();
    _UA();
  }
};

/***************************** ZOOM PAGE ********************************/

chrome.tabs.getZoom(z => {
  //inicijalni zoom
  zR.textContent = Math.round(z * 100) + "%";
});

chrome.tabs.onZoomChange.addListener(i => {
  chrome.tabs.get(i.tabId, t => {
    if (t.active && cWin === t.windowId)
      zR.textContent = Math.round(i.newZoomFactor * 100) + "%";
  });
});

chrome.tabs.onActivated.addListener(a => {
  if (a.windowId === cWin) {
    chrome.tabs.getZoom(z => {
      zR.textContent = Math.round(z * 100) + "%";
    });
  }
});

chrome.tabs.onUpdated.addListener((i, c, t) => {
  if (c.title) {
    if (t.windowId === cWin && t.active)
      chrome.tabs.getZoom(z => {
        zR.textContent = Math.round(z * 100) + "%";
      });
  }
});

const _z_t = a => {
  // zoom -/+

  let z_ = [
    5,
    3.999,
    3,
    2.5,
    2,
    1.746,
    1.5,
    1.25,
    1.1,
    1,
    0.9,
    0.8,
    0.75,
    0.6666,
    0.5,
    0.33334,
    0.25,
  ];
  let f = 1;

  chrome.tabs.getZoom(z => {
    if (!a) {
      if (z > 0.25) {
        for (let i = 17; i--; ) {
          if (z <= z_[i]) {
            f = 0;
            _zFin(z_[i + 1]);

            break;
          }
        }

        if (f) _zFin(4.999);
      }
    } else {
      z_[5] = 1.7455;

      if (z < 4.99) {
        for (let i = 0, l = 17; i < l; i++) {
          if (z >= z_[i]) {
            f = 0;
            _zFin(z_[i - 1]);

            break;
          }
        }

        if (f) _zFin(0.25);
      }
    }
  });
};

const _zFin = a => {
  chrome.tabs.setZoomSettings({ scope: gData.scope }, () => {
    if (chrome.runtime.lastError) console.log(chrome.runtime.lastError.message);

    chrome.tabs.setZoom(null, a, () => {
      if (chrome.runtime.lastError)
        console.log(chrome.runtime.lastError.message);
    });
  });
};

const zoomSc = a => {
  // zoom scope
  if (gData.scope === "per-tab") {
    gData.scope = "per-origin";
    zS.style.backgroundImage = 'url("img/per_origin.svg")'; //chrome.extension.getURL('img/per_origin.svg');//'url("img/per-origin.svg")';
  } else {
    gData.scope = "per-tab";
    zS.style.backgroundImage = 'url("img/per_tab.svg")'; //chrome.extension.getURL('img/per_tab.svg');//'url("img/per-tab.svg")';
  }
  // dali da provrti sve tabove i postavi zoomSettings na odabrabno???
  if (!a) {
    chrome.storage.local.set({ gData: gData });
    chrome.runtime.sendMessage({ gD: gData, s_: "x", w_: cWin }); // popravi da svi prozori i options preprave scope
  }
};

/***************************ANIMATIONS*********************************/

const _nN = a => {
  // animation for new node (previously created)
  a.parentNode.style.display = "block";
  let p = document.getElementById(a.parentId);
  if (p) p.getElementsByClassName("fav")[0].innerHTML = fo_;

  a.animate(
    [
      { backgroundColor: "rgba(220, 0, 220, 1)" },
      { backgroundColor: "rgba(0, 0, 0, 0)" },
    ],
    {
      duration: 1000,
      steps: 2,
      webkitAnimationTimingFunction: "ease-in",
    }
  ).onfinish = () => {
    a.style.backgroundColor = "";
  };
};

const _zF = () => {
  // zoom indicator clear animation
  zi.animate(
    [
      { transform: "translateY(0px)", opacity: "1" },
      { transform: "translateY(50px)", opacity: "0" },
    ],
    {
      duration: 100,
      steps: 2,
      webkitAnimationTimingFunction: "ease-in",
    }
  ).onfinish = () => {
    zi.style.display = "none";
    dzzd = gData.zoom / 100;
    dzzd_mY = Math.floor(12 * dzzd);
  };
};

const _del_anim = (a, q) => {
  // delete animation main
  a.animate(
    [
      { transform: "translateX(0)", opacity: "1" },
      { transform: "translateX(-10px)", opacity: "1" },
      { transform: "translateX(-15px)", opacity: "1" },
      { transform: "translateX(-20px)", opacity: "1" },
      { transform: "translateX(100px)", opacity: "0" },
    ],
    {
      duration: 500,
      steps: 5,
      webkitAnimationTimingFunction: "ease-in",
    }
  ).onfinish = () => {
    a.parentNode.removeChild(a);
  };

  if (q) _del_anim(q);
};

const _clL = a => {
  // close list anim
  a.animate([{ maxHeight: "100%" }, { maxHeight: "0%" }], {
    duration: 200,
    steps: 2,
    webkitAnimationTimingFunction: "ease-out",
  }).onfinish = () => {
    a.style.display = "none";
    a.previousSibling.getElementsByClassName("fav")[0].innerHTML = fc_;
  };
};

/*************************** TOOLBAR MENUS *********************************/

const _m_t = e => {
  // show top drop-down menu
  /* let pc = panel.children[0].id, klassa = 'ctxN_';
console.log('ide dropdown')
dd.o = 1;

if (pc === 'li_recent' || pc === 'Spanel' || pc === 'SpanelF') klassa = 'ctxN_ ctxN_S';

document.removeEventListener('keydown', tDel);
ctxScroll = 'd_d';
		
		
let dropDown = document.createElement('div');
dropDown.id = 'd_d'
dropDown.className = 'ctxM_'
dropDown.tabIndex = 1;
dropDown.style.left = rcSafe.topM;
dropDown.innerHTML = `
	<div id="d_d_10" class="ctxN_"></div>
	<div id="d_d_11" class="ctxN_"></div>		
	<div class="r_sep"></div>
	<div id="d_d_x"></div>
	<div id="d_d_7" class="ctxN_" data-i18n="RC_D3"></div>	
	<div id="d_d_8" class="ctxN_" data-i18n="RC_D4"></div>
	<div class="r_sep"></div>
	<div id="d_d_1" class="ctxN_" data-i18n="RC_D1"></div>
	<div id="d_d_2" class="ctxN_" data-i18n="RC_D2"></div>		
	<div class="r_sep"></div>
	<div id="f_a_3" class="ctxN_" data-i18n="ss"></div>
	<div class="r_sep"></div>
	<div id="f_a_2" class="${klassa}" data-i18n="sort_m"></div>
`;
		
dropDown.focus();

dropDown.addEventListener('blur', () => { console.log('dropdown Blur')
	dd.o = 1;
	ctxScroll = null;
	
	document.addEventListener('keydown', tDel);
	this.parentNode.removeChild(this)
});

dropDown.addEventListener('click', d_d_);

document.body.appendChild(dropDown) */

  if (dd.o === 0) {
    dd.o = 1;
    let pc = panel.children[0].id;

    if (pc === "li_recent" || pc === "Spanel" || pc === "SpanelF")
      f_a_2.classList.add("ctxN_S");
    else f_a_2.classList.remove("ctxN_S");

    d_d.style.left = rcSafe.topM;
    d_d.style.display = "block";

    document.removeEventListener("keydown", tDel);

    ctxScroll = "d_d";

    d_d.focus();
    /* d_d.addEventListener('blur', () =>  _mB('translateY(-200px)', 'd_d', 'dd', 200) ); */
    d_d.addEventListener("blur", helper_blur_dropDown);

    d_d.addEventListener("click", d_d_);
  }
};

const helper_blur_dropDown = () => _mB("translateY(-200px)", "d_d", "dd", 200);

const helper_blur_flyOut = () => _mB("translateY(200px)", "f_a", "fa", 200);

const helper_blur_trash = () => _mB("translateY(30px)", "r_TR", "trash", 100);

const _m_b = e => {
  // show bottom fly-out menu
  if (fa.o === 0) {
    fa.o = 1;

    f_a.style.display = "block";

    document.removeEventListener("keydown", tDel);

    ctxScroll = "f_a";

    f_a.focus();

    f_a.addEventListener("blur", helper_blur_flyOut);

    f_a.addEventListener("click", f_a_);
  }
};

const _mB = (a, b, c, d) => {
  // drop/flyout menu blur
  let t = document.getElementById(b);
  t.style.display = "none";
  document.getElementById(c).o = 0;
  if (b === "d_d") t.removeEventListener("blur", helper_blur_dropDown);
  else if (b === "f_a") t.removeEventListener("blur", helper_blur_flyOut);
  else if (b === "r_TR") t.removeEventListener("blur", helper_blur_trash);

  //t.style.display = 'none';
  /* 	t.animate([
		{transform: 'translateY(0px)'},
		{transform: a}
	], {
		duration: d,
		steps: 2,
		webkitAnimationTimingFunction: 'ease-in',
	}).onfinish = () => {
		t.style.display = 'none';
		document.getElementById(c).o = 0;
	} */

  ctxScroll = null;

  document.addEventListener("keydown", tDel);
};

function d_d_(e) {
  /*THIS*/ // drop down menu click listener
  this.blur();

  if (e.button === 0) {
    let id = e.target.id;

    setTimeout(() => {
      if (id === "d_d_1") _eca(1);
      else if (id === "d_d_2") _eca();
      else if (id === "d_d_3") chrome.runtime.sendMessage({ s: "x" });
      else if (id === "d_d_7") {
        if (gData.sr === 2) {
          sbk.removeEventListener("keydown", entSrt);
          sbk.removeEventListener("keydown", entSrt_f);
          sbk.removeEventListener("input", BSI);
          sbk.removeEventListener("input", BSI_f);
          sbk.removeEventListener("input", e_BSI);
          sbk.removeEventListener("input", e_BSI_f);

          gData.sr = 1;
          d_d_x.style.top = 60 + "px";

          if (gData.srEnt) {
            sbk.addEventListener("input", e_BSI_f);
            sbk.addEventListener("keydown", entSrt_f);
          } else sbk.addEventListener("input", BSI_f);

          chrome.storage.local.set({ gData: gData });

          if (sbk.value) makeSN_f(sbk.value);
        }
      } else if (id === "d_d_8") {
        if (gData.sr === 1) {
          sbk.removeEventListener("keydown", entSrt);
          sbk.removeEventListener("keydown", entSrt_f);
          sbk.removeEventListener("input", BSI);
          sbk.removeEventListener("input", BSI_f);
          sbk.removeEventListener("input", e_BSI);
          sbk.removeEventListener("input", e_BSI_f);

          gData.sr = 2;
          d_d_x.style.top = 87 + "px";

          if (gData.srEnt) {
            sbk.addEventListener("input", e_BSI);
            sbk.addEventListener("keydown", entSrt);
          } else sbk.addEventListener("input", BSI);

          chrome.storage.local.set({ gData: gData });

          if (sbk.value) makeSN(sbk.value);
        }
      } /*  else if (id === 'd_d_9') {
				if (gData.t_ === 'tl.css') {
					gData.t_ = 'td.css';

					chrome.storage.local.set({ 'gData': gData }, () => {
						chrome.runtime.sendMessage({ th: 'td.css' });
						setTimeout(_st, 300);
						//window.close();
					});

				} else {
					gData.t_ = 'tl.css';
					
					chrome.storage.local.set({ 'gData': gData }, () => {
						chrome.runtime.sendMessage({ th: 'tl.css' });
						setTimeout(_st, 300);
						//window.close();
					});
				}
			
			} */ else if (
        id === "d_d_10"
      ) {
        lA = 1;

        if (gData.uns) _recBkm();
        else _uns();
      } else if (id === "d_d_11") {
        lA = 1;
        _oth();
      } else if (id === "f_a_2") sortPanel();
      else if (id === "f_a_3") setTimeout(_ss, 300);
    }, 200);
  }
}

function f_a_(e) {
  /*THIS*/ // fly out menu click listener
  this.blur();

  if (e.button === 0) {
    let id = e.target.id;

    setTimeout(() => {
      if (id === "f_a_1") setCl();
      else if (id === "f_a_4") chrome.runtime.sendMessage({ s: "x" });
      else if (id === "d_d_9") {
        if (gData.t_ === "tl.css") {
          let a = "td.css";

          if (gData.t_2) a = "td2.css";

          gData.t_ = a;

          chrome.storage.local.set({ gData: gData }, () => {
            chrome.runtime.sendMessage({ th: a });
            setTimeout(_st, 300);
            //window.close();
          });
        } else {
          gData.t_ = "tl.css";

          chrome.storage.local.set({ gData: gData }, () => {
            chrome.runtime.sendMessage({ th: "tl.css" });
            setTimeout(_st, 300);
            //window.close();
          });
        }
      } else if (id === "d_d_4")
        chrome.tabs.create({ url: "opera://settings/importData" });
      else if (id === "d_d_5") chrome.runtime.sendMessage({ nf: "x" });
      else if (id === "d_d_6") chrome.runtime.sendMessage({ bf: "x" });
      //else if (id === 'f_a_5') { lA = 1; _uns(); }

      //else if (id === 'f_a_6') { lA = 1; _oth(); }
    }, 200);
  }
}

/*************************** RC MENUS *********************************/

/****************** SVAŠTA **************************/

const _h_de = e => {
  if (isValidDrag) {
    flagAdded = 1;
    addBtnL();
  }
};

function _h_cl(e) {
  /*THIS*/ // header click listener
  if (e.button === 0) {
    if (e.target === this) {
      //očisti search
    } else if (e.target.id === "bookmarks_bar") {
      sbk.value = "";
      lA = 1;
      _bb();
    } else if (e.target.id === "user_root") {
      sbk.value = "";
      lA = 1;
      _ur();
    } else if (e.target.id === "speed_dial") {
      sbk.value = "";
      lA = 1;
      _sd();
    } else if (e.target.id === "unsorted") {
      sbk.value = "";
      lA = 1;
      _uns();
    } else if (e.target.id === "recent") {
      sbk.value = "";
      lA = 1;
      _recBkm();
      /* if (gData.uns) _unsrt();
			else _recBkm(); */
    } else if (e.target.id === "dd") _m_t();
  }
}

const _b_cl = e => {
  // bottom click listener
  sbk.value = "";
  if (e.button === 2) {
    if (e.target.id === "trash") _tr2();
  } else if (e.button === 0) {
    if (e.target.id === "trash") {
      lA = 1;
      _tr();
    } else if (e.target.id === "trashClear") et();
    else if (e.target.id === "fa") _m_b();
    else if (e.target.id === "zD") _z_t();
    else if (e.target.id === "zR") _zFin(1);
    else if (e.target.id === "zU") _z_t(1);
    else if (e.target.id === "zS") zoomSc();
  }
};

const setCl = () => {
  // settings click
  let opt = chrome.extension.getViews({ type: "tab" });

  if (opt.length) {
    let t = 1;

    for (let i = opt.length; i--; ) {
      if (opt[i].location.href.indexOf("options.html") > -1) {
        t = 0;
        opt[i].chrome.tabs.getCurrent(tab => {
          chrome.tabs.update(tab.id, { selected: !!1 });
          chrome.windows.update(tab.windowId, { focused: !!1 });
        });

        break;
      }
    }

    if (t) chrome.tabs.create({ url: "options.html" });
  } else chrome.tabs.create({ url: "options.html" });
};

const _c_cut = () => {
  // ctx menu - cut click
  (cutB = []), (copyB = []);

  let cAll = document.querySelectorAll(".fSel, .bSel, .sepSel");

  for (let i = 0, l = cAll.length; i < l; i++) cutB.push(cAll[i].id);
};

const _c_copy = () => {
  // ctx menu - copy click
  (cutB = []), (copyB = []);
  let _urls = "";
  let cBkm = document.getElementsByClassName("bSel");

  for (let j = 0, d = cBkm.length; j < d; j++) {
    let tmpBkm = { t: cBkm[j].textContent, u: cBkm[j].url };
    copyB.push(tmpBkm);
    _urls += cBkm[j].url + "\n";
  }

  if (gData.rcCopy) {
    let shadowIn = document.createElement("textarea");
    shadowIn.type = "text";
    shadowIn.className = "shadowIn";
    shadowIn.value = _urls;
    document.body.appendChild(shadowIn);
    shadowIn.select();
    document.execCommand("Copy", !1, null);
    document.body.removeChild(shadowIn);
  }
};

const _c_paste_p = (a, b) => {
  // ctx menu - paste on panel
  let iCt = b;

  if (cutB.length) {
    chrome.bookmarks.get(cutB, res => {
      for (let i = 0, l = res.length; i < l; i++) {
        if (res[i].parentId === a)
          chrome.bookmarks.move(res[i].id, { parentId: a, index: iCt });
        else {
          chrome.bookmarks.move(res[i].id, { parentId: a, index: iCt });
          iCt++;
        }
      }

      makeRoot();

      cutB = [];
    });
  } else if (copyB.length) {
    for (let i = 0, l = copyB.length; i < l; i++) {
      chrome.bookmarks.create({
        parentId: a,
        index: iCt,
        title: copyB[i].t,
        url: copyB[i].u,
      });
      iCt++;
    }

    makeRoot(null, 1);
  }
};

const _c_paste_f = a => {
  // ctx menu - paste on folder
  if (cutB.length) {
    for (let i = cutB.length; i--; )
      chrome.bookmarks.move(cutB[i], { parentId: a, index: 0 }, () => {
        if (chrome.runtime.lastError)
          console.log(
            chrome.runtime.lastError.message + " ...deleted in the meantime?"
          );
      });

    makeRoot();

    cutB = [];
  } else if (copyB.length) {
    for (let i = copyB.length; i--; )
      chrome.bookmarks.create({
        parentId: a,
        index: 0,
        title: copyB[i].t,
        url: copyB[i].u,
      });

    makeRoot(null, 1);
  }
};

const _c_paste_b = (_p, _i) => {
  // ctx menu - paste on bookmark
  let ind = _i;

  if (cutB.length) {
    chrome.bookmarks.get(cutB, res => {
      for (let i = res.length; i--; ) {
        if (res[i].parentId !== _p)
          chrome.bookmarks.move(res[i].id, { parentId: _p, index: ind });
        else {
          if (res[i].index > ind)
            chrome.bookmarks.move(res[i].id, { parentId: _p, index: ind });
          else {
            chrome.bookmarks.move(res[i].id, { parentId: _p, index: ind });
            ind--;
          }
        }
      }

      makeRoot();

      cutB = [];
    });
  } else if (copyB.length) {
    for (let i = copyB.length; i--; )
      chrome.bookmarks.create({
        parentId: _p,
        index: ind,
        title: copyB[i].t,
        url: copyB[i].u,
      });

    makeRoot(null, 1);
  }
};

const rc_s = e => {
  // multi selection click listener
  if (e.target.id === "r_bs_1") openSel("t", !1);
  else if (e.target.id === "r_bs_2") openSel("w", !1);
  else if (e.target.id === "r_bs_3") openSel("w", !!1);
  else if (e.target.id === "r_bs_4") _c_cut();
  else if (e.target.id === "r_bs_5") _c_copy();
  else if (e.target.id === "r_bs_6") _D();
};

const openSel = (_t, _in, _sr, _fr) => {
  //rc open
  let selBkm = [];

  if (_sr) {
    if (_fr) {
      let pf = document.getElementsByClassName("fSel")[0];

      if (pf) {
        if (_t === "t") openT(pf.id);
        else openW(pf.id, _in);
      }
    } else {
      if (_t === "t")
        chrome.tabs.query({ currentWindow: !!1, active: !!1 }, t => {
          chrome.tabs.create({
            url: rcBN.url,
            active: !1,
            index: t[0].index + 1,
          });
        });
      else
        chrome.windows.create({ url: rcBN.url, focused: !!1, incognito: _in });
    }
  } else {
    let pb = document.getElementsByClassName("bSel");
    for (let k = 0, d = pb.length; k < d; k++) selBkm.push(pb[k].url);

    let pf = document.getElementsByClassName("fSel");

    for (let i = 0, l = pf.length; i < l; i++) {
      let lc = document.getElementById("li" + pf[i].id).children;

      for (let h = 0, z = lc.length; h < z; h++) {
        if (lc[h].url && !lc[h].url.startsWith("v7")) selBkm.push(lc[h].url);
      }
    }

    if (selBkm.length > 9 && gData.TC) {
      let test = confirm(
        chrome.i18n.getMessage("pr_10") +
          selBkm.length +
          chrome.i18n.getMessage("pr_10_")
      );

      if (test === !!1) {
        if (_t === "t")
          chrome.tabs.query({ currentWindow: !!1, active: !!1 }, t => {
            for (let j = selBkm.length; j--; )
              chrome.tabs.create({
                url: selBkm[j],
                active: !1,
                index: t[0].index + 1,
              });
          });
        else
          chrome.windows.create({ url: selBkm, focused: !!1, incognito: _in });
      }
    } else {
      if (_t === "t")
        chrome.tabs.query({ currentWindow: !!1, active: !!1 }, t => {
          for (let j = selBkm.length; j--; )
            chrome.tabs.create({
              url: selBkm[j],
              active: !1,
              index: t[0].index + 1,
            });
        });
      else chrome.windows.create({ url: selBkm, focused: !!1, incognito: _in });
    }
  }

  _d_cb();
};

const openT = a => {
  // open in tabs - from folder
  chrome.tabs.query({ currentWindow: !!1, active: !!1 }, t => {
    chrome.bookmarks.getSubTree(a, b => {
      let bfc = b[0].children;
      let ua = [];

      for (let i = 0, l = bfc.length; i < l; i++) {
        if (bfc[i].url && !bfc[i].url.startsWith("v7")) ua.push(bfc[i].url);
      }

      if (ua.length > 9 && gData.TC) {
        let test = confirm(
          chrome.i18n.getMessage("pr_10") +
            ua.length +
            chrome.i18n.getMessage("pr_10_")
        );

        if (test) _op_t_hp(ua, t[0].index + 1);
      } else _op_t_hp(ua, t[0].index + 1);
    });
  });
};

const _op_t_hp = (a, b) => {
  //open in tabs helper
  for (let j = a.length; j--; )
    chrome.tabs.create({ url: a[j], active: !1, index: b });
};

const openW = (a, b) => {
  // open in window  from folder
  chrome.bookmarks.getSubTree(a, c => {
    let bfc = c[0].children;
    let ua = [];

    for (let i = 0, l = bfc.length; i < l; i++) {
      if (bfc[i].url && !bfc[i].url.startsWith("v7")) ua.push(bfc[i].url);
    }

    if (ua.length > 9 && gData.TC) {
      let test = confirm(
        chrome.i18n.getMessage("pr_10") +
          ua.length +
          chrome.i18n.getMessage("pr_10_")
      );

      if (test) chrome.windows.create({ url: ua, focused: !!1, incognito: b });
    } else chrome.windows.create({ url: selBkm, focused: !!1, incognito: b });
  });
};

const _dgEnd = e => {
  // DRAG END - drag-out test
  if (window.innerWidth < e.clientX) {
    chrome.tabs.query({ currentWindow: !!1, active: !!1 }, tab => {
      if (e.target) {
        if (e.target.className === "fSel" || e.target.className === "fNor") {
          chrome.bookmarks.getSubTree(e.target.id, bf => {
            let bfc = bf[0].children;
            let u = [];

            for (let i = 0; i < bfc.length; i++) {
              if (bfc[i].url) u.push(bfc[i].url);
            }

            if (u.length > 9 && gData.TC) {
              let test = confirm(
                chrome.i18n.getMessage("pr_10") +
                  u.length +
                  chrome.i18n.getMessage("pr_10_")
              );

              if (test) _dg_h(bfc, tab[0].index + 1);
            } else _dg_h(bfc, tab[0].index + 1);
          });
        } else {
          let cnt = dURLs.length;

          for (let i = dURLs.length; i--; ) {
            chrome.tabs.create(
              { url: dURLs[i], active: !1, index: tab[0].index + 1 },
              t => {
                cnt--;
                if (!cnt && gData.dgOut)
                  chrome.tabs.update(t.id, { active: !!1 });
              }
            );
          }
        }
      }
    });
  }

  if (flagAdded) {
    remBtnL();
    flagAdded = 0;
  }

  isValidDrag = 0;
};

const _dg_h = (a, b) => {
  // drag-out helper
  if (gData.dgOut) {
    let cnt = a.length;

    for (let j = a.length; j--; ) {
      chrome.tabs.create({ url: a[j].url, active: !1, index: b }, () => {
        cnt--;

        if (!cnt) {
          chrome.tabs.query({ currentWindow: !!1 }, t => {
            let i = t.length;

            while (i--) {
              if (t[i].index === b) {
                chrome.tabs.update(t[i].id, { active: !!1 });
                break;
              }
            }
          });
        }
      });
    }
  } else {
    let j = a.length;

    while (j--) chrome.tabs.create({ url: a[j].url, active: !1, index: b });
  }
};

/* function cSortClick() { // PROMPT for sorting panel!!! izbačeno

	_aL();
	
	chrome.bookmarks.getRootByName(last, function(mb) {
		document.getElementById('p_s_1').innerHTML = chrome.i18n.getMessage('st3') + ' "' + mb.title + '" ?';
		p_s.style.display = 'block';	
		p_s.addEventListener('click', sortP_CL);
	});

} */

const _getT = (u, b) => {
  // fetch - get title from html
  fetch(u)
    .then(r => {
      if (r.status !== 200) {
        console.log("status error: " + r.status);
        return;
      }

      r.text().then(txt => {
        try {
          let t1 = txt
            .split("</title>")[0]
            .split("<title")[1]
            .split(">")[1]
            .trim();

          if (t1) {
            let txt = document.createElement("textarea");
            txt.innerHTML = t1;
            let t = txt.value;

            chrome.bookmarks.update(b, { title: t });

            r_s = Date.now();

            let up = document.getElementById(b);

            if (up) {
              let bt = up.getElementsByClassName("bT")[0];

              bt.textContent = t;
              bt.style.opacity = "1";
            }
          }
        } catch (e) {
          if (rep) {
            if (e instanceof TypeError) {
              if (
                txt.startsWith(
                  "<script>window.googleJavaScriptRedirect=1</script>"
                )
              ) {
                let t2 = txt.split("URL='")[1].split("'")[0];
                rep = 0;
                _getT(t2, b);
              } else if (
                txt.startsWith(
                  '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">'
                )
              ) {
                let t2 = txt.split("URL='")[1].split("'")[0];
                rep = 0;
                _getT(t2, b);
              }
            }
          }
        }
      });
    })
    .catch(err => {
      console.log("fetch error: ", err);
    });
};

const _rc_multi_ = (a, b, c) => {
  // right click on multi selection
  if (a + rcSafe.multiSel > document.body.clientWidth)
    a = document.body.clientWidth - rcSafe.multiSel;
  let c_ = 180;

  if (!c) r_bs_5.style.display = "block";
  else {
    c_ = 155;
    r_bs_5.style.display = "none";
  }

  if (b + c_ > document.body.clientHeight) b = document.body.clientHeight - c_;

  r_ms.style.top = b + "px";
  r_ms.style.left = a + "px";
  r_ms.style.display = "block";

  r_ms.addEventListener("click", rc_s);
};

const _rc_alt = (a, b) => {
  let rx = a,
    ry = b;

  if (ry + 90 > document.body.clientHeight)
    ry = document.body.clientHeight - 90;
  if (rx + rcSafe.altMenu > document.body.clientWidth)
    rx = document.body.clientWidth - rcSafe.altMenu;

  r_alt.style.top = ry + "px";
  r_alt.style.left = rx + "px";
  r_alt.style.display = "block";

  r_alt.addEventListener("click", _rc_altM);
};

const _rc_altM = e => {
  //alternative context menu (CTRL) CLICK LISTENER
  e.stopPropagation();

  let id_ = [];

  [...document.querySelectorAll(".bSel, .fSel")].map(x => id_.push(x.id));

  if (e.target.id === "r_alt_1") chrome.runtime.sendMessage({ saveC: id_ });
  else if (e.target.id === "r_alt_2") chrome.runtime.sendMessage({ expC: id_ });

  _d_cb();
};

function _hbde(e) {
  /*THIS*/ // header button drag enter
  if (this.className === "hbN") {
    dgEnter = Date.now();
    this.style.backgroundColor = "#1BE529";
    this.style.opacity = 1;
  }
}

function _hbdo(e) {
  /*THIS*/ // header button drag over
  e.preventDefault();

  if (this.className === "hbN") {
    let dgOver = Date.now();

    if (dgOver - dgEnter > 1000) {
      dgEnter = 5000000000000;

      let prClass = document.getElementsByClassName("hbN hbA")[0];
      if (prClass) prClass.className = "hbN";

      this.className = "hbN hbA";

      if (this.id === "user_root") {
        chrome.bookmarks.getRootByName("user_root", r => {
          rid = r.id;
          last = "user_root";
          lA = 1;
          makeRoot();
        });
      } else if (this.id === "bookmarks_bar") {
        chrome.bookmarks.getRootByName("bookmarks_bar", r => {
          rid = r.id;
          last = "bookmarks_bar";
          lA = 1;
          makeRoot();
        });
      } else if (this.id === "speed_dial") {
        chrome.bookmarks.getRootByName("speed_dial", r => {
          rid = r.id;
          last = "speed_dial";
          lA = 1;
          makeRoot();
        });
      }
    }
  }
}

function _hbdl(e) {
  /*THIS*/ // header button drag leave
  this.style.backgroundColor = "";
  this.style.opacity = "";
}

function _hbdr(e) {
  /*THIS*/ // header button drop on
  this.style.backgroundColor = "";
  this.style.opacity = "";

  let trdr = e.dataTransfer.getData("dragID").split(",");

  if (trdr[0] !== "") {
    if (this.id === "unsorted") {
      chrome.bookmarks.getRootByName("unsorted", uf => {
        for (let i = trdr.length; i--; )
          chrome.bookmarks.move(trdr[i], { parentId: uf.id, index: 0 });
        makeRoot();
      });
    } else if (this.id === "bookmarks_bar") {
      chrome.bookmarks.getRootByName("bookmarks_bar", bbf => {
        for (let i = trdr.length; i--; )
          chrome.bookmarks.move(trdr[i], { parentId: bbf.id, index: 0 });
        makeRoot();
      });
    } else if (this.id === "user_root") {
      chrome.bookmarks.getRootByName("user_root", mf => {
        for (let i = trdr.length; i--; )
          chrome.bookmarks.move(trdr[i], { parentId: mf.id, index: 0 });
        makeRoot();
      });
    } else if (this.id === "speed_dial") {
      chrome.bookmarks.getRootByName("speed_dial", sdf => {
        chrome.bookmarks.getChildren(sdf.id, c => {
          let sd0 = c[0].id;

          for (let i = trdr.length; i--; )
            chrome.bookmarks.move(trdr[i], { parentId: sd0, index: 0 });

          makeRoot();
        });
      });
    }
  }
}

function hbdrTR(e) {
  /*THIS*/ // TRASH button drop on
  this.style.backgroundColor = "";
  this.style.opacity = "";
  let trdr = e.dataTransfer.getData("dragID").split(",");

  chrome.bookmarks.getRootByName("trash", rf => {
    for (let i = 0, l = trdr.length; i < l; i++)
      chrome.bookmarks.move(trdr[i], { parentId: rf.id, index: 0 });
    makeRoot();
  });
}

const _ss = () => {
  // save session - first check if V7 session is enabled
  if (gData.sessions) {
    chrome.management.getAll(ei => {
      let t = 1;

      for (let i = ei.length; i--; ) {
        if (ei[i].id === "khmbgihnlknbjgjhmekjeoidpfimabpp") {
          if (ei[i].enabled) {
            t = 0;
            /* if (a === 2) chrome.runtime.sendMessage('khmbgihnlknbjgjhmekjeoidpfimabpp', { 'saveSession': 'current' });
						else  */ chrome.runtime.sendMessage(
              "khmbgihnlknbjgjhmekjeoidpfimabpp",
              { saveSession: "all" }
            );
          }

          break;
        }
      }

      if (t) _ss2();
    });
  } else _ss2();
};

const _ss2 = a => {
  // save session nastavak - ako nije poslano u V7 sessions ili ako nema V7 sessions
  let d = new Date(),
    n = d.toLocaleString();

  let sName = prompt(chrome.i18n.getMessage("RC_EF1"), n);

  if (sName != null) {
    chrome.tabs.query({}, t => {
      if (a) {
        chrome.bookmarks.create(
          { parentId: a, title: sName, index: 0, url: null },
          f => {
            let fid = f.id;

            for (let i = t.length; i--; ) {
              if (!t[i].incognito) {
                let tmp = { t: t[i].title, u: t[i].url, i: i, f: fid };

                (c => {
                  chrome.bookmarks.create(
                    { parentId: c.f, title: c.t, index: 0, url: c.u },
                    () => {
                      if (c.i === 0) makeRoot(null, 1);
                    }
                  );
                })(tmp);
              }
            }
          }
        );
      } else
        chrome.bookmarks.getRootByName("user_root", p => {
          chrome.bookmarks.create(
            { parentId: p.id, title: sName, index: 0, url: null },
            f => {
              let fid = f.id;

              for (let i = t.length; i--; ) {
                if (!t[i].incognito) {
                  let tmp = { t: t[i].title, u: t[i].url, i: i, f: fid };

                  (c => {
                    chrome.bookmarks.create(
                      { parentId: c.f, title: c.t, index: 0, url: c.u },
                      () => {
                        if (c.i === 0) {
                          _flashBtn("user_root", 1);

                          if (last === "user_root") makeRoot(null, 1);
                        }
                      }
                    );
                  })(tmp);
                }
              }
            }
          );
        });
    });
  }
};

const addBtnL = () => {
  // add header buttons listeners when drag starts
  bookmarks_bar.addEventListener("dragenter", _hbde);
  bookmarks_bar.addEventListener("dragover", _hbdo);
  bookmarks_bar.addEventListener("dragleave", _hbdl);
  bookmarks_bar.addEventListener("drop", _hbdr);

  user_root.addEventListener("dragenter", _hbde);
  user_root.addEventListener("dragover", _hbdo);
  user_root.addEventListener("dragleave", _hbdl);
  user_root.addEventListener("drop", _hbdr);

  speed_dial.addEventListener("dragenter", _hbde);
  speed_dial.addEventListener("dragover", _hbdo);
  speed_dial.addEventListener("dragleave", _hbdl);
  speed_dial.addEventListener("drop", _hbdr);

  unsorted.addEventListener("dragenter", _hbde);
  unsorted.addEventListener("dragover", _hbdo);
  unsorted.addEventListener("dragleave", _hbdl);
  unsorted.addEventListener("drop", _hbdr);

  trash.addEventListener("dragenter", _hbde);
  trash.addEventListener("dragover", e => {
    e.preventDefault();
  });
  trash.addEventListener("dragleave", _hbdl);
  trash.addEventListener("drop", hbdrTR);
};

const remBtnL = () => {
  // remove header buttons listeners when drag ends
  bookmarks_bar.removeEventListener("dragenter", _hbde);
  bookmarks_bar.removeEventListener("dragover", _hbdo);
  bookmarks_bar.removeEventListener("dragleave", _hbdl);
  bookmarks_bar.removeEventListener("drop", _hbdr);

  user_root.removeEventListener("dragenter", _hbde);
  user_root.removeEventListener("dragover", _hbdo);
  user_root.removeEventListener("dragleave", _hbdl);
  user_root.removeEventListener("drop", _hbdr);

  speed_dial.removeEventListener("dragenter", _hbde);
  speed_dial.removeEventListener("dragover", _hbdo);
  speed_dial.removeEventListener("dragleave", _hbdl);
  speed_dial.removeEventListener("drop", _hbdr);

  trash.removeEventListener("dragenter", _hbde);
  trash.removeEventListener("dragover", e => {
    e.preventDefault();
  });
  trash.removeEventListener("dragleave", _hbdl);
  trash.removeEventListener("drop", hbdrTR);
};

/* function sortP_CL(e) {
	e.stopPropagation();
	
	if (e.target.id === 'p_s_2') sortPanel();
	else if (e.target.id === 'p_s_3') _d_cb();
} */

const sortPanel = () => {
  // "sort this panel" from top menu
  // provjeri kada se pokaže menu dali je panel sortabilan (all bkm, bb, unsorted, imported i Speed dial - posebno speed dial)
  if (!f_a_2.classList.contains("ctxN_S")) {
    chrome.bookmarks.getRootByName(last, r => {
      /* 			let b = d_d.getBoundingClientRect();
			let _x = b.left;
			let _y = b.top; */

      r_srt.style.left = 100 + "px";
      r_srt.style.top = 100 + "px";
      rcFN = { id: r.id };

      r_srt.style.display = "block";

      _aL();

      r_srt.addEventListener("click", rc_srt);

      /* 			chrome.bookmarks.getSubTree(r.id, s => {
				let bA = [], fA = [];	
				
				const _sB = ad => {
					for (let i = 0, l = ad.length; i < l; i++) {
						if (ad[i].url) bA.push({ i: ad[i].id, p: ad[i].parentId, t: ad[i].title });
						else {
							fA.push({ i: ad[i].id, p: ad[i].parentId, t: ad[i].title });
							
							_sB(ad[i].children);
						}
					}
				}
				
				_sB(s[0].children);

				bA.sort((a, b) => a.t.localeCompare(b.t));
				fA.sort((a, b) => a.t.localeCompare(b.t));
				
				let rA = fA.concat(bA);
				let j = rA.length;
				
				while (j--) {
					(jo => {
						chrome.bookmarks.move(rA[jo].i, { parentId: rA[jo].p, index: 0 }, () => {
							if (jo === 0) {
								rA = bA = fA = null;
								
								_d_cb();
								
								makeRoot();
							}
						});						
					})(j);			}
			});	 */
    });
  }
};

const _dSel = (a, c) => {
  // deselect nodes
  let d = c || document;

  let f = d.getElementsByClassName("fSel");
  let b = d.getElementsByClassName("bSel");
  let s = d.getElementsByClassName("sepSel");

  if (!a) f_de_sel(f);
  else {
    for (let k = f.length; k--; ) f[k].className = "fNor";
  }

  for (let i = b.length; i--; ) b[i].className = "bNor";

  for (let j = s.length; j--; ) s[j].className = "sepNor";
};

const f_sel = a => {
  // select folders
  if (gData.folCh) {
    for (let i = a.length; i--; ) {
      a[i].getElementsByClassName("fch")[0].style.color = "#404040";
      a[i].getElementsByClassName("fch")[0].style.backgroundColor = "#ffffff";

      a[i].className = "fSel";
    }
  } else {
    for (let i = a.length; i--; ) a[i].className = "fSel";
  }
};

const f_de_sel = a => {
  // deselect folders
  if (gData.folCh) {
    for (let i = a.length; i--; ) {
      a[i].getElementsByClassName("fch")[0].style.color = "";
      a[i].getElementsByClassName("fch")[0].style.backgroundColor = "";

      a[i].className = "fNor";
    }
  } else {
    for (let i = a.length; i--; ) a[i].className = "fNor";
  }
};

const _aL = () => {
  // add listeners for ctx base
  ctxB.style.display = "block";

  document.removeEventListener("keydown", tDel);
  document.addEventListener("keydown", keyContext);
  window.addEventListener("blur", _d_cb);
};

const _rev = (a, b) => {
  // reveal in bookmarks
  let ro = rN[a];

  lA = 1;

  if (ro === "bookmarks_bar") _bb(b);
  else if (ro === "unsorted") _uns(b);
  else if (ro === "user_root") _ur(b);
  else if (ro === "other") _oth(b);
  else if (ro === "speed_dial") _sd(b);
  else if (ro === "trash") _tr(b);

  setTimeout(_flashBtn, 1000, ro);
};

const _revSel = a => {
  // reveal target
  sbk.value = "";

  let tg = document.getElementById(a);

  if (tg) {
    let pl = tg.parentNode.id;

    while (pl) {
      let pFolder = pl.replace("li", "");
      let getPF = document.getElementById(pFolder);

      if (getPF) {
        getPF.getElementsByClassName("fav")[0].innerHTML = fo_;
        getPF.nextSibling.style.display = "block";
        pl = getPF.parentNode.id;
      } else pl = !1;
    }

    //let gb = tg.getBoundingClientRect().top;
    panel.scrollTop = tg.offsetTop * dzzd - 150;

    tg.style.color = "#ffffff";

    tg.animate(
      [
        { backgroundColor: "rgba(0, 0, 0, 0)" },
        { backgroundColor: "rgba(109, 138, 175, 1)" },
      ],
      {
        duration: 800,
        steps: 2,
        webkitAnimationTimingFunction: "ease-out",
      }
    ).onfinish = () => {
      if (tg.className === "bNor") tg.className = "bSel";
      else if (tg.className === "fNor") tg.className = "fSel";

      tg.style.backgroundColor = "";
      tg.style.color = "";
    };
  }
};

const _flashBtn = (a, b) => {
  let tg = document.getElementById(a);
  if (b && a === "user_root" && user_root.className === "hbN hbA")
    panel.scrollTop = 0;

  tg.animate(
    [
      { backgroundColor: "rgba(255, 174, 0, 1)" },
      { backgroundColor: "rgba(255, 174, 0, 0)" },
      { backgroundColor: "rgba(255, 174, 0, 1)" },
      { backgroundColor: "rgba(255, 174, 0, 0)" },
      { backgroundColor: "rgba(255, 174, 0, 1)" },
      { backgroundColor: "rgba(255, 174, 0, 0)" },
      { backgroundColor: "rgba(255, 174, 0, 1)" },
      { backgroundColor: "rgba(255, 174, 0, 0)" },
    ],
    {
      duration: 700,
      steps: 6,
      webkitAnimationTimingFunction: "ease-out",
    }
  ).onfinish = () => {
    tg.style.backgroundColor = "";
  };
};

const _s_sel = a => {
  // shift select helper
  _dSel();

  if (lastClick && a.id !== lastClick) {
    let bp = document.getElementById(a.parentNode.id);
    let lcbr = document.getElementById(lastClick).getBoundingClientRect();
    let tcbr = a.getBoundingClientRect();
    let xTop, xBottom;

    if (tcbr.top > lcbr.top) {
      xTop = lcbr.top;
      xBottom = tcbr.top;
    } else if (tcbr.top < lcbr.top) {
      xTop = tcbr.top;
      xBottom = lcbr.top;
    }

    let acn = bp.childNodes;

    for (let s = 0, p = acn.length; s < p; s++) {
      if (
        acn[s].getBoundingClientRect().top >= xTop &&
        acn[s].getBoundingClientRect().top <= xBottom
      ) {
        if (acn[s].id.indexOf("li") > -1) continue;
        else if (acn[s].className === "fNor") f_sel([acn[s]]);
        else if (acn[s].className === "sepNor") acn[s].className = "sepSel";
        else acn[s].className = "bSel";
      }
    }
  }
};

chrome.windows.getCurrent(w => {
  // za window id
  cWin = w.id;
});

chrome.runtime.onMessage.addListener(m => {
  if (m.obnovi) makeRoot();
  else if (m.zoom) {
    panel.childNodes[0].style.zoom = m.zoom + "%";
    gData.zoom = ~~m.zoom;
    dzzd = gData.zoom / 100;
    dzzd_mY = Math.floor(12 * dzzd);
  } else if (m.sep) {
    sepBkm = m.sep;

    let getSep = document.querySelectorAll(".sepNor, .sepSel");

    for (let i = getSep.length; i--; ) {
      let h1 = sepBkm.m * 2 + ~~sepBkm.h;
      getSep[i].style.height = h1 + "px";
      getSep[i].children[0].style.top = sepBkm.m + "px";
      getSep[i].children[0].style.height = sepBkm.h + "px";
      getSep[i].children[0].style.backgroundColor = sepBkm.b;
    }
  } else if (m.close) window.close();
  else if (m.intZoom) {
    if (cWin !== m.w) {
      zoomInp.value = m.intZoom;
      zoomNmb.innerText = m.intZoom + "%";
    }
  } else if (m.th) {
    if (m.w) {
      // provjera prozora
    }

    gData.t_ = m.th;
    let wT;

    if (gData.t_ === "td2.css") wT = "bkm2.css";
    else wT = "bkm.css";
    setTheme(wT);

    _st();
  } else if (m.gD) {
    if (cWin !== m.w_) {
      if (m.s_) zoomSc(1);
    }
  }
});

const setTheme = a => {
  console.log(a);
  let s = document.createElement("link");
  s.rel = "stylesheet";
  s.id = "tcss";
  s.type = "text/css";
  s.href = chrome.extension.getURL(a);
  document.head.appendChild(s);
};
