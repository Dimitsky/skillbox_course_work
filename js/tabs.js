/*



*/

function tabs(options) {
  //Options
  const name = options.name || 'tabs';
  const tabSelected = options.tabSelected || 0;

  //Elems
  const tabs = document.querySelectorAll('.' + name + ' .tabs__button');
  const panels = document.querySelectorAll('.' + name + ' .tabs__panel');
  const tablist = document.querySelector('.' + name + ' .tabs__tablist');

  //functions
  function toHidePanels() {
    const panels = document.querySelectorAll('.' + name + ' .tabs__panel');

    panels.forEach(p => {
      p.style = 'display: none;';
      p.classList.remove('tabs__panel--active');
    });
  }
  function addAria() {
    //tablist
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Entertainment');
    //tabs
    tabs.forEach( function(t, i) {
      tablist.setAttribute('role', 'tab');
      if (i === tabSelected) t.setAttribute('aria-selected', 'true');
      else t.setAttribute('aria-selected', 'false');
      t.setAttribute('aria-controls', t.id + '-tab');
      t.setAttribute('id', t.id);
    } );
    //panels
    panels.forEach( function(p, i) {
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'tabpanel');console.log(tabs[i])
      p.setAttribute('id', tabs[i].id + '-tab');
      p.setAttribute('aria-labelledby', tabs[i].id);
    } );
  }
  function listener(e, num = 0) {
    if (!e) {
      const panelElem = panels[num];

      toHidePanels();
      panelElem.style = 'display: block';
      setTimeout( () => panelElem.classList.add('tabs__panel--active') );

      return;
    }

    const panelName = e.currentTarget.getAttribute('aria-controls');
    const panelElem = document.querySelector(`[id=${panelName}]`);

    toHidePanels();
    panelElem.style = 'display: block;';
    setTimeout( () => panelElem.classList.add('tabs__panel--active') );
  }

  addAria();
  listener(null, tabSelected);
  tabs.forEach( b => b.addEventListener('click', listener) );
}