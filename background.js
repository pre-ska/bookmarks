let noF, bh, bb, d_, tr, cnt;

chrome.runtime.onInstalled.addListener(d => {
  let scr = { bookmarks_bar: 0, user_root: 0, user_root: 0, other: 0 };
  let folders = { bookmarks_bar: [], user_root: [], unsorted: [], other: [] };
  let gData = {
    rcCopy: !1,
    tt: !1,
    sCl: !1,
    CAT: !1,
    TC: true,
    dgOut: !1,
    zoom: 100,
    sessions: !1,
    scope: "per-origin",
    wClose: !1,
    t_: "tl.css",
    t_2: !1,
    folCh: 1,
    sr: 2,
    uns: !1,
    srEnt: !1,
  };
  let sep = { b: "#999999", h: 4, m: 6 };
  let _sf = { bookmarks_bar: 0, user_root: 0, unsorted: 0, other: 0 };

  if (d.reason === "install") {
    chrome.storage.local.set({ folders: folders }, () => {
      chrome.storage.local.set({ scr: scr }, () => {
        chrome.storage.local.set({ last: "user_root" }, () => {
          chrome.storage.local.set({ gData: gData }, () => {
            chrome.storage.local.set({ OF: !1 }, () => {
              chrome.storage.local.set({ SF: _sf }, () => {
                chrome.storage.local.set({ sep: sep }, () => {
                  chrome.tabs.create({ url: "options.html" });
                });
              });
            });
          });
        });
      });
    });
  } else if (d.reason === "update") {
    chrome.tabs.create({ url: "options.html#update" });
  }
});

chrome.runtime.onMessage.addListener(m => {
  if (m.s) {
    chrome.bookmarks.getTree(t => {
      let d = t[0].children.length;
      let v = d * 45 + 310;

      chrome.windows.create({
        url: "w.html",
        type: "popup",
        left: 320,
        width: 965,
        height: v,
        top: 50,
        focused: !!1,
        incognito: !1,
      });
    });
  } else if (m.nf) _get(1);
  //_e();
  else if (m.bf) _get(2);
  //_e(1);
  else if (m.expC) _get(3, m.expC);
  //export collection to HTML - part
  else if (m.saveC) _get(4, m.saveC); //save collection
});

const _get = (a, b) => {
  // get default data
  chrome.runtime.getPackageDirectoryEntry(r => {
    r.getFile("d", {}, fe => {
      fe.file(f => {
        let fr = new FileReader();

        fr.onloadend = () => {
          d_ = JSON.parse(fr.result);

          noF = d_.b;

          chrome.bookmarks.getTree(tr_ => {
            tr = tr_[0].children;

            //for (let k = tr.length; k--;) if (!tr[k].children.length) tr.splice(k, 1); // ??? zašto sam ovo stavio?

            chrome.bookmarks.getRootByName("bookmarks_bar", bb_ => {
              bb = bb_.id;

              if (a === 1) _e_h(tr);
              else if (a === 2) _u_all();
              else if (a === 3) _coll(b, 1);
              else if (a === 4) _coll(b);
            });
          });
        };

        fr.readAsText(f);
      });
    });
  });
};

const _u_all = () => {
  // find fav url's for export to HTML - all
  let u = [];

  const vb = t_ => {
    for (let j = 0, d = t_.length; j < d; j++) {
      if (t_[j].children) vb(t_[j].children);
      else u.push(t_[j].url);
    }
  };

  vb(tr);

  cnt = u.length;

  _fav(u).then(_f => {
    _e_h(tr, _f);
  });
};

const _coll = (a, b) => {
  //
  let u = [];
  let ea = [];

  for (let i = 0, l = a.length; i < l; i++) {
    let tg = a[i];

    const fF = t_ => {
      for (let j = 0, d = t_.length; j < d; j++) {
        if (t_[j].id === tg) {
          ea.push(t_[j]);
          break;
        } else if (t_[j].children) fF(t_[j].children);
      }
    };

    fF(tr);
  }

  const oF = t_ => {
    let j = t_.length;

    while (j--) {
      if (t_[j].children) oF(t_[j].children);
      else {
        if (t_[j].url.startsWith("javascript")) t_.splice(j, 1);
        else u.push(t_[j].url);
      }
    }
  };

  oF(ea);

  cnt = u.length;

  let d3 = new Date();
  let d1 = d3.toLocaleString(navigator.language, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  let main = [{ title: d1, id: "-1", children: ea }];

  _fav(u).then(_f => {
    if (b) _e_h(main, _f);
    else _e_f(main, _f);
  });
};

const _fav = u => {
  // make favicons
  return new Promise(r => {
    let c_ = document.createElement("canvas");
    (c_.width = 16), (c_.height = 16);

    let ctx = c_.getContext("2d");
    let fo = {};
    let i = u.length;

    while (i--) {
      (a => {
        let img = new Image();

        img.onload = () => {
          ctx.clearRect(0, 0, 16, 16);
          ctx.drawImage(img, 0, 0, 16, 16);

          let dt = c_.toDataURL("image/png");

          cnt--;

          if (dt !== noF) {
            if (!fo[a]) fo[a] = dt;
          }

          if (!cnt) r(fo);
        };

        img.src = "chrome://favicon/" + a;
      })(u[i]);
    }
  });
};

const _e_h = (a, g) => {
  //  glavni export u HTML
  let a_ = "\t";
  bh = d_.a;

  const rt = t => {
    for (let i = 0, l = t.length; i < l; i++) {
      if (t[i].children) {
        if (t[i].title === "") t[i].title = "-";

        let ptf = '">',
          lm = '" LAST_MODIFIED="' + 0,
          ad = '<DT><H3 ADD_DATE="' + 0;

        if (t[i].id === bb) ptf = '" PERSONAL_TOOLBAR_FOLDER="true">';

        if (t[i].dateGroupModified) {
          let m = Math.floor(t[i].dateGroupModified / 1000);
          lm = '" LAST_MODIFIED="' + m;
        }

        if (t[i].dateAdded) {
          let da = Math.floor(t[i].dateAdded / 1000);
          ad = '<DT><H3 ADD_DATE="' + da;
        }

        bh += a_ + ad + lm + ptf + t[i].title + "</H3>\n" + a_ + "<DL><p>\n";

        a_ += "\t";

        rt(t[i].children);

        a_ = a_.slice(0, -1);

        bh += a_ + "</DL><p>\n";
      } else {
        let bf = '">',
          da = '" ADD_DATE="' + 0;

        if (g && g[t[i].url]) bf = '" ICON="' + g[t[i].url] + '">';

        if (t[i].dateAdded) {
          let d = Math.floor(t[i].dateAdded / 1000);
          da = '" ADD_DATE="' + d;
        }

        bh += a_ + '<DT><A HREF="' + t[i].url + da + bf + t[i].title + "</A>\n";
      }
    }
  };

  rt(a);

  bh = bh + "</DL><p>";

  _dl(bh, "op");
};

const _e_f = (a, g) => {
  // export folder u HTML
  const enc = c => {
    for (let j = 0, d = c.length; j < d; j++) {
      if (c[j].children) {
        c[j].title = escape(c[j].title);
        enc(c[j].children);
      } else {
        c[j].url = encodeURIComponent(c[j].url);
        c[j].title = escape(c[j].title);
      }
    }
  };

  enc(a); // escape/encode

  let d0 =
    "let _f_ = '" +
    JSON.stringify(g) +
    "'; let _b_ = '" +
    JSON.stringify(a) +
    "';";

  let cf = d_.c + d0 + d_.d;

  _dl(cf, "bkmColl");
};

const _dl = (a, b) => {
  // download

  let euc = "data:text/html;charset=utf-8," + encodeURIComponent(a);
  chrome.downloads.download({ url: euc, filename: chrome.i18n.getMessage(b) });
};
