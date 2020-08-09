let gData = {},
  OF = false;
let sep = {};
let zi;
let resizeT;

const mdf = da => {
  let n_ = [];

  const _b = s => {
    for (let j = 0, d = s.length; j < d; j++) {
      if (s[j].children) {
        let fNam = { id: s[j].id, title: s[j].title };

        n_.unshift(fNam);

        _b(s[j].children);
      }
    }
  };

  _b(da);

  let ko = {},
    k1 = n_.length;

  while (k1--) {
    if (ko[n_[k1].title]) {
      ((mvX, prX) => {
        chrome.bookmarks.getChildren(mvX, c1 => {
          for (let k = 0, h1 = c1.length; k < h1; k++) {
            ((a, b, c, d, f) => {
              chrome.bookmarks.move(c1[k].id, { parentId: prX }, () => {
                if (c === d - 1) chrome.bookmarks.remove(f);
              });
            })(c1[k].id, prX, k, h1, mvX);
          }
        });
      })(n_[k1].id, ko[n_[k1].title]);
    } else ko[n_[k1].title] = n_[k1].id;
  }

  let oD = [],
    idA = [];

  chrome.bookmarks.getRootByName("other", ob => {
    idA.push(ob.id);

    chrome.bookmarks.getRootByName("unsorted", ub => {
      idA.push(ub.id);

      chrome.bookmarks.getRootByName("user_root", mb => {
        idA.push(mb.id);

        chrome.bookmarks.getRootByName("bookmarks_bar", bb => {
          idA.push(bb.id);

          let m = idA.length;

          while (m--) {
            (i_ => {
              chrome.bookmarks.getSubTree(idA[i_], _c => {
                oD = oD.concat(_c[0].children);

                if (!i_) dBkm2(oD);
              });
            })(j);
          }
        });
      });
    });
  });
};

const dBkm2 = dA => {
  let kontr = {},
    dId = [];

  const db2 = a => {
    for (let j = 0, d = a.length; j < d; j++) {
      if (a[j].url) {
        if (kontr[a[j].url] !== 1) kontr[a[j].url] = 1;
        else dId.push(a[j].id);
      } else db2(a[j].children);
    }
  };

  db2(dA);

  if (dId.length) {
    let txtPart,
      i = dId.length;

    if (dId.length === 1) txtPart = " duplicate bookmark.\nMove it to trash?";
    //i18n
    else txtPart = " duplicate bookmarks.\nMove them to trash?";

    let test = confirm(
      dId.length +
        chrome.i18n.getMessage("dupeBkm") +
        "\n" +
        chrome.i18n.getMessage("dupeMove")
    );

    if (test) {
      chrome.bookmarks.getRootByName("trash", rs => {
        while (i--) {
          chrome.bookmarks.move(dId[i], { parentId: rs.id, index: 0 });

          chrome.runtime.sendMessage({ obnovi: "x" });
        }
      });
    }
  } else {
    chrome.runtime.sendMessage({ obnovi: "x" });
    alert(chrome.i18n.getMessage("dupe"));
  }
};

const dBkm = () => {
  let oD = [],
    idA = [];

  chrome.bookmarks.getRootByName("other", ob => {
    idA.push(ob.id);

    chrome.bookmarks.getRootByName("unsorted", ub => {
      idA.push(ub.id);

      chrome.bookmarks.getRootByName("user_root", mb => {
        idA.push(mb.id);

        chrome.bookmarks.getRootByName("bookmarks_bar", bb => {
          idA.push(bb.id);
          let j = idA.length;

          while (j--) {
            (i => {
              chrome.bookmarks.getSubTree(idA[i], _c => {
                oD = oD.concat(_c[0].children);

                if (!i) {
                  if (lcDnD7.className === "boxA boxC") mdf(oD);
                  else dBkm2(oD);
                }
              });
            })(j);
          }
        });
      });
    });
  });
};

setTimeout(() => {
  chrome.storage.local.get(["gData", "OF", "sep"], r => {
    gData = r.gData;
    OF = r.OF;
    sep = r.sep;

    if (gData.tt) lcDnD1.className = "boxA boxC";
    if (gData.sCl) lcDnD2.className = "boxA boxC";
    if (gData.rcCopy) lcDnD3.className = "boxA boxC";
    if (gData.CAT) lcDnD4.className = "boxA boxC";
    if (gData.TC) lcDnD5.className = "boxA boxC";
    if (gData.dgOut) lcDnD6.className = "boxA boxC";

    if (gData.sessions) lcDnD8.className = "boxA boxC";
    if (OF) lcDnD10.className = "boxA boxC";
    if (gData.wClose) lcDnD11.className = "boxA boxC";
    // if (gData.t_2) lcDnD15.className = "boxA boxC";
    // if (gData.t_ === "td.css" || gData.t_ === "td2.css")
    //   lcDnD12.className = "boxA boxC";
    if (gData.folCh) lcDnD13.className = "boxA boxC";
    if (gData.uns) lcDnD14.className = "boxA boxC";
    if (gData.srEnt) lcDnD16.className = "boxA boxC";

    boxBase.addEventListener("click", boxClick);

    lcDnD7.addEventListener("click", l7_click);

    zoomInp.value = gData.zoom;
    zoomNmb.innerText = gData.zoom + "%";
    zoomInp.addEventListener("input", zIn);

    kbs.addEventListener("click", kbs_click);
    _kbs.addEventListener("click", kbs_click);
    kb_div.addEventListener("click", kb_click);

    nmbTS.options[sep.h - 2].selected = !!1;
    nmbAS.options[sep.m / 2 - 1].selected = !!1;
    nmbAS.addEventListener("change", nbmASfn);
    nmbTS.addEventListener("change", nbmASfn);
    sColor.style.backgroundColor = sep.b;

    scm1.style.backgroundColor = "#FFFFFF";
    scm2.style.backgroundColor = "#C0C0C0";
    scm3.style.backgroundColor = "#00BE7D";
    scm4.style.backgroundColor = "#00D5E8";
    scm5.style.backgroundColor = "#C900FF";
    scm6.style.backgroundColor = "#FF0000";
    scm7.style.backgroundColor = "#404040";
  });
}, 500);

function nbmASfn() {
  // separator spacing and thickness
  let tOpt = this.options,
    l = tOpt.length;

  for (let i = 0; i < l; i++) {
    if (tOpt[i].selected) {
      if (this.id === "nmbAS") sep.m = tOpt[i].value;
      else sep.h = tOpt[i].value;

      chrome.storage.local.set({ sep: sep });
      chrome.runtime.sendMessage({ sep: sep });

      break;
    }
  }
}

function zIn(e) {
  // zoom slider on imput
  clearTimeout(zi);

  zoomNmb.innerText = this.value + "%";

  gData.zoom = ~~this.value;

  zi = setTimeout(sGd, 500);

  chrome.runtime.sendMessage({ zoom: gData.zoom });
}

const boxClick = e => {
  // click listener for all checkboxes
  if (e.target.id === "lcDnD10") {
    if (e.target.className === "boxA boxE") {
      e.target.className = "boxA boxC";
      OF = true;
    } else {
      e.target.className = "boxA boxE";
      OF = false;
    }

    let folders = { bookmarks_bar: [], user_root: [], unsorted: [], other: [] };

    chrome.storage.local.set({ folders: folders });
    chrome.storage.local.set({ OF: OF });
  } else {
    if (e.target.id === "lcDnD1") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.tt = true;
      } else {
        e.target.className = "boxA boxE";
        gData.tt = false;
      }
    } else if (e.target.id === "lcDnD2") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.sCl = true;
      } else {
        e.target.className = "boxA boxE";
        gData.sCl = false;
      }
    } else if (e.target.id === "lcDnD3") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.rcCopy = true;
      } else {
        e.target.className = "boxA boxE";
        gData.rcCopy = false;
      }
    } else if (e.target.id === "lcDnD4") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.CAT = true;
      } else {
        e.target.className = "boxA boxE";
        gData.CAT = false;
      }
    } else if (e.target.id === "lcDnD5") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.TC = true;
      } else {
        e.target.className = "boxA boxE";
        gData.TC = false;
      }
    } else if (e.target.id === "lcDnD6") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.dgOut = true;
      } else {
        e.target.className = "boxA boxE";
        gData.dgOut = false;
      }
    } else if (e.target.id === "lcDnD8") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.sessions = true;
      } else {
        e.target.className = "boxA boxE";
        gData.sessions = false;
      }
    } else if (e.target.id === "lcDnD11") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.wClose = true;
      } else {
        e.target.className = "boxA boxE";
        gData.wClose = false;
      }
    } else if (e.target.id === "lcDnD12") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";

        if (gData.t_2) gData.t_ = "td2.css";
        else gData.t_ = "td.css";
      } else {
        e.target.className = "boxA boxE";
        gData.t_ = "tl.css";
      }
    } else if (e.target.id === "lcDnD13") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.folCh = 1;
      } else {
        e.target.className = "boxA boxE";
        gData.folCh = 0;
      }
    } else if (e.target.id === "lcDnD14") {
      if (e.target.className === "boxA boxE") {
        e.target.className = "boxA boxC";
        gData.uns = 1;
      } else {
        e.target.className = "boxA boxE";
        gData.uns = !1;
      }
    } else if (e.target.id === "lcDnD15") {
      if (lcDnD15.className === "boxA boxE") {
        lcDnD15.className = "boxA boxC";
        gData.t_2 = 1;
        gData.t_ = "td2.css";
      } else {
        lcDnD15.className = "boxA boxE";
        gData.t_2 = !1;
        gData.t_ = "td.css";
      }

      chrome.runtime.sendMessage({ media: "q", super: gData.t_2 });
    } else if (e.target.id === "lcDnD16") {
      if (lcDnD16.className === "boxA boxE") {
        lcDnD16.className = "boxA boxC";
        gData.srEnt = 1;
      } else {
        lcDnD16.className = "boxA boxE";
        gData.srEnt = !1;
      }
    }

    chrome.storage.local.set({ gData: gData });
  }

  chrome.runtime.sendMessage({ close: "x" });
};

function l7_click() {
  if (this.className === "boxA boxE") this.className = "boxA boxC";
  else this.className = "boxA boxE";
}

const kbs_click = () => {
  kb_div.style.display = "block";
  main.scrollTop = 0;
};

function kb_click(e) {
  if (e.target === this) {
    let tDiv = this,
      wh = window.innerHeight * 0.6,
      wd = (window.innerHeight - wh) / 2;

    tDiv.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 100,
      steps: 2,
      webkitAnimationTimingFunction: "ease-out"
    }).onfinish = () => {
      kb_div.style.display = "none";
    };
  }
}

const sColor_ = () => {
  let getSCM = document.defaultView
    .getComputedStyle(sColorMenu, null)
    .getPropertyValue("display");

  if (getSCM === "none") sColorMenu.style.display = "block";
  else {
    sColorMenu.animate(
      [
        { opacity: "1", transform: "translateX(0px)" },
        { opacity: "1", transform: "translateX(40px)" },
        { opacity: "0", transform: "translateX(-80px)" }
      ],
      {
        duration: 300,
        steps: 2,
        webkitAnimationTimingFunction: "cubic-bezier(0.25,0.1,0.25,1)"
      }
    ).onfinish = () => {
      sColorMenu.style.display = "none";
    };
  }
};

const sColorMenu_ = e => {
  if (e.target.style.backgroundColor) {
    sep.b = e.target.style.backgroundColor;

    sColorMenu.animate(
      [
        { opacity: "1", transform: "translateX(0px)" },
        { opacity: "1", transform: "translateX(30px)" },
        { opacity: "0", transform: "translateX(-80px)" }
      ],
      {
        duration: 300,
        steps: 2,
        webkitAnimationTimingFunction: "cubic-bezier(0.25,0.1,0.25,1)"
      }
    ).onfinish = () => {
      sColor.style.backgroundColor = sep.b;

      sColorMenu.style.display = "none";

      chrome.storage.local.set({ sep: sep }, () => {
        chrome.runtime.sendMessage({ sep: sep });
      });
    };
  }
};

const LMCl = e => {
  if (e.target.id === "o_btn")
    chrome.tabs.create({
      url: "https://addons.opera.com/extensions/details/v7-bookmarks/",
      active: !!1
    });
  else if (e.target.id === "f_btn")
    chrome.tabs.create({
      url: "https://www.facebook.com/V7-apps-1575838779402126/",
      active: !!1
    });
  else if (e.target.id === "t_btn")
    chrome.tabs.create({ url: "https://twitter.com/v7_apps", active: !!1 });
};

const mCl = e => {
  // menu click
  if (e.target.id === "m5") {
    chrome.tabs.query({}, t => {
      let f = 1;
      let i = t.length;

      while (i--) {
        if (
          t[i].url ===
          "https://addons.opera.com/search/?type=extensions&developer=vux777"
        ) {
          f = 0;
          chrome.tabs.update(t[i].id, { active: !!1 });
          break;
        }
      }

      if (f)
        chrome.tabs.create({
          url:
            "https://addons.opera.com/search/?type=extensions&developer=vux777",
          active: !!1
        });
    });
  } else {
    content.scrollTop = 0;

    let getChM = menu.children,
      i = getChM.length;
    while (i--) getChM[i].className = "mBtn";

    let getChP = pan.children,
      j = getChP.length;
    while (j--) getChP[j].style.display = "none";

    if (e.target.id === "m1") {
      document.getElementById("settings").style.display = "block";
      m1.className = "mBtn mBtnA";
    } else if (e.target.id === "m2") {
      m2.className = "mBtn mBtnA";
      document.getElementById("log").style.display = "block";
    } else if (e.target.id === "m3") {
      m3.className = "mBtn mBtnA";
      document.getElementById("how").style.display = "block";
    } else if (e.target.id === "m4") {
      m4.className = "mBtn mBtnA";
      document.getElementById("cred").style.display = "block";
    } else if (e.target.id === "m6") {
      m6.className = "mBtn mBtnA";
      document.getElementById("donate").style.display = "block";
    }
  }
};

const cs = () => {
  if (content.scrollTop > 0) {
    podloga.style.boxShadow = "0 0 10px 3px rgba(0,0,0,0.4)";
    podloga.style.borderBottom = "4px solid #8494A5";
  } else {
    podloga.style.boxShadow = "";
    podloga.style.borderBottom = "";
  }
};

const wr = () => {
  clearTimeout(resizeT);

  resizeT = setTimeout(() => {
    let wih = window.innerWidth;

    if (wih > 1015) {
      let w1 = (wih - 620) / 2;

      menu.style.left = w1 - 200 + "px";
      menu.style.display = "block";
      pan.style.left = w1 + "px";
      pan.style.display = "block";
    } else {
      menu.style.left = 0 + "px";
      menu.style.display = "block";
      pan.style.left = 200 + "px";
      pan.style.display = "block";
    }

    let wt = wih - 310;

    if (wt > 0) {
      wt /= 2;
      box_t.style.left = wt + "px";
      box_t.style.display = "block";
    } else {
      box_t.style.left = 0 + "px";
      box_t.style.display = "block";
    }

    if (wih < 1130) {
      LM.animate(
        [{ transform: "translateX(0px)" }, { transform: "translateX(-80px)" }],
        {
          duration: 200,
          steps: 2,
          webkitAnimationTimingFunction: "ease-out"
        }
      ).onfinish = () => {
        LM.style.display = "none";
      };
    } else LM.style.display = "block";
  }, 200);
};

document.addEventListener("DOMContentLoaded", () => {
  let ww = window.innerWidth,
    wt = ww - 310;

  if (ww > 1015) {
    let w1 = (ww - 620) / 2;

    menu.style.left = w1 - 200 + "px";
    menu.style.display = "block";
    pan.style.left = w1 + "px";
    pan.style.display = "block";
  } else {
    menu.style.left = 0 + "px";
    menu.style.display = "block";
    pan.style.left = 200 + "px";
    pan.style.display = "block";
  }

  if (wt > 0) {
    wt /= 2;
    box_t.style.left = wt + "px";
    box_t.style.display = "block";
  } else {
    box_t.style.left = 0 + "px";
    box_t.style.display = "block";
  }

  LM.addEventListener("click", LMCl);
  menu.addEventListener("click", mCl);

  let upd = location.href.split("#");

  if (upd[1]) m2.click();
  else m1.click();

  let di = document.querySelectorAll("[data-i18n]"),
    i = di.length;
  while (i--)
    di[i].textContent = chrome.i18n.getMessage(di[i].getAttribute("data-i18n"));

  setTimeout(() => {
    impInternal.onclick = () => {
      chrome.tabs.create({ url: "opera://settings/importData" });
    };

    exp.onclick = () => {
      chrome.runtime.sendMessage({ bf: "x" });
    };

    expNF.onclick = () => {
      chrome.runtime.sendMessage({ nf: "x" });
    };

    dupe.onclick = dBkm;

    stats.onclick = () => {
      chrome.runtime.sendMessage({ s: "x" });
    };

    kratice.onclick = () => {
      chrome.tabs.create({ url: "opera://settings/configureCommands" });
    };

    sColor.addEventListener("click", sColor_);
    sColorMenu.addEventListener("click", sColorMenu_);

    content.addEventListener("scroll", cs);

    window.addEventListener("resize", wr);

    pp_link.addEventListener("click", () => {
      chrome.tabs.create({
        url:
          "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4LFHZT6R4K6CA",
        active: !0
      });
    });
    pp_link1.addEventListener("click", () => {
      chrome.tabs.create({
        url:
          "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4LFHZT6R4K6CA",
        active: !0
      });
    });

    let npp = document.getElementById("npp");
    npp.innerHTML =
      chrome.i18n.getMessage("npp") +
      ' <a href="https://notepad-plus-plus.org/" target="_blank">Notepad++</a>' +
      " (pure JS, no libraries)";

    let pnink = document.getElementById("pnink");
    pnink.innerHTML =
      chrome.i18n.getMessage("pnink") +
      ' <a href="http://www.getpaint.net/index.html" target="_blank">Paint.NET</a> & <a href="https://inkscape.org/en/" target="_blank">Inkscape</a>';

    if (ww > 1130) LM.style.display = "block";
  }, 500);
});

chrome.runtime.onMessage.addListener(m => {
  if (m.intZoom) {
    zoomInp.value = m.intZoom;
    zoomNmb.innerText = m.intZoom + "%";
    gData.zoom = ~~m.intZoom;
  } else if (m.th) {
    gData.t_ = m.th;

    if (m.th === "td.css" || m.th === "td2.css")
      lcDnD12.className = "boxA boxC";
    else lcDnD12.className = "boxA boxE";
  }
});

const sGd = () => {
  chrome.storage.local.set({ gData: gData });
};
