document.addEventListener('DOMContentLoaded', () => {
	w1.textContent = chrome.i18n.getMessage('w1');
	w2.textContent = chrome.i18n.getMessage('w2');
	w3.textContent = chrome.i18n.getMessage('w3');
	cl.textContent = chrome.i18n.getMessage('cl');
	st();
});

const st = () => {
	chrome.bookmarks.getTree(t => {
		let d = t[0].children, o = {}, _b = 0, _f = 0, i = d.length;;
		
		while (i--) {
			let n = d[i].title, b = 0, f = 0, a_ = d[i].children;
			o[n] = {};
			
			const _r = a => {
				for (let j = 0, l = a.length; j < l; j++) {
					if (!a[j].children) b++;
					else {
						f++;
						_r(a[j].children);
					}
				}
			}

			_r(a_);
			
			_b += b;
			_f += f;
			
			o[n] = {b, f};
		}
		
		let o_ = Object.keys(o), k, ld = o_.length;
		
		o_.sort();

		bn.innerHTML = '<b>' + _b + '</b>&nbsp;&nbsp;  ' + chrome.i18n.getMessage('w2');
		fn.innerHTML = '<b>' + _f + '</b>&nbsp;&nbsp;  ' + chrome.i18n.getMessage('w3');;
		
		let tb = document.getElementsByTagName('tbody')[0];
		
		for (k = 0; k < ld; k++) {
			let g = o_[k];

			let _tr = document.createElement('tr');
			_tr.className = 'trc'

			let _td1 = document.createElement('td');
			_td1.textContent = g;

			let _td2 = document.createElement('td');
			_td2.textContent = o[g].b;

			let _td3 = document.createElement('td');
			_td3.textContent = o[g].f;

			_tr.appendChild(_td1);
			_tr.appendChild(_td2);
			_tr.appendChild(_td3);			
			tb.appendChild(_tr);
		}
		
		cl.addEventListener('click', () => { window.close(); });
	});
}


