(function(){
  'use strict';

  try{
    if(localStorage.getItem('fsp-theme')==='dark') document.documentElement.setAttribute('data-theme','dark');
  }catch(e){}

  function currentFile(){
    var p=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    return p || 'index.html';
  }

  function setActiveNav(){
    var file=currentFile();
    document.querySelectorAll('.site-nav a').forEach(function(a){
      a.classList.toggle('active',(a.getAttribute('href')||'').toLowerCase()===file);
    });
  }

  function setMode(mode){
    var body=document.body;
    if(!body) return;
    body.classList.remove('full-mode','initial-mode','blank-mode');
    body.classList.add(mode+'-mode');
    document.querySelectorAll('.mode-switch [data-mode]').forEach(function(btn){
      btn.classList.toggle('active',btn.dataset.mode===mode);
    });
  }

  function initModeSwitch(){
    var mode=document.querySelector('.mode-switch');
    if(!mode) return;
    mode.classList.add('floating-control');
    if(mode.parentElement!==document.body) document.body.appendChild(mode);
    mode.querySelectorAll('[data-mode]').forEach(function(btn){
      btn.addEventListener('click',function(){ setMode(btn.dataset.mode); });
    });
    setMode('full');
  }

  function initTheme(){
    var b=document.getElementById('themeToggle');
    if(!b) return;
    b.classList.add('floating-control');
    if(b.parentElement!==document.body) document.body.appendChild(b);
    function sync(){
      var dark=document.documentElement.getAttribute('data-theme')==='dark';
      var label=dark?'Normal theme':'Dark theme';
      b.setAttribute('aria-label',label);
      b.setAttribute('title',label);
    }
    /* All content pages already have their own theme listener. Lerntimer does not. */
    if(document.body.classList.contains('fsp-timer-page')){
      b.addEventListener('click',function(){
        var dark=document.documentElement.getAttribute('data-theme')==='dark';
        if(dark) document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme','dark');
        try{localStorage.setItem('fsp-theme',dark?'light':'dark')}catch(e){}
        sync();
      });
    }else{
      b.addEventListener('click',function(){setTimeout(sync,0)});
    }
    sync();
  }

  function wrapCaseSelector(select){
    if(!select) return null;
    var existing=select.closest('.case-select-control,.case-tools,.fsp-select-control');
    if(existing) return existing;
    var wrapper=document.createElement('div');
    wrapper.className='fsp-select-control';
    var label=document.querySelector('label[for="'+select.id+'"]');
    if(label && label.parentElement) label.parentElement.insertBefore(wrapper,label);
    else select.parentElement.insertBefore(wrapper,select);
    if(label) wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
  }

  function toolbarItemCleanup(item){
    if(!item) return;
    item.classList.remove('floating-control');
    item.style.left='';item.style.right='';item.style.top='';item.style.bottom='';item.style.width='';
  }

  function initGlobalToolbar(){
    var main=document.querySelector('main');
    if(!main) return;
    var caseSelect=document.getElementById('caseSelect');
    var caseControl=wrapCaseSelector(caseSelect);
    var sectionSelect=document.getElementById('comparisonSectionSelect');
    var sectionControl=sectionSelect ? (sectionSelect.closest('.comparison-select-control') || wrapCaseSelector(sectionSelect)) : null;
    var copyControl=document.getElementById('simulationCopyTools');
    if(!copyControl){
      var copyBtn=document.getElementById('copySimulationCaseBtn');
      if(copyBtn){
        copyControl=document.createElement('div');
        copyControl.className='simulation-copy-tools';
        copyBtn.parentElement.insertBefore(copyControl,copyBtn);
        copyControl.appendChild(copyBtn);
      }
    }
    if(!caseControl && !sectionControl && !copyControl) return;

    var toolbar=document.createElement('div');
    toolbar.className='fsp-content-toolbar';
    main.insertBefore(toolbar,main.firstChild);

    [caseControl,sectionControl,copyControl].forEach(function(item){
      if(!item) return;
      toolbarItemCleanup(item);
      toolbar.appendChild(item);
    });

    document.querySelectorAll('.tools').forEach(function(tools){
      if(!tools.children.length) tools.remove();
    });
  }

  function maskTextNode(node){
    var text=node.nodeValue;
    if(!text || !/[\p{L}\p{N}]/u.test(text)) return;
    var tokens=text.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu) || [];
    var frag=document.createDocumentFragment();
    tokens.forEach(function(token){
      if(/^[\p{L}\p{N}]+$/u.test(token)){
        var word=document.createElement('span');word.className='word';
        var first=document.createElement('span');first.className='first-letter';first.textContent=token.charAt(0);
        var hidden=document.createElement('span');hidden.className='hidden-part';hidden.textContent=token.slice(1);
        word.appendChild(first);word.appendChild(hidden);frag.appendChild(word);
      }else{
        var punct=document.createElement('span');punct.className='punctuation';punct.textContent=token;frag.appendChild(punct);
      }
    });
    node.parentNode.replaceChild(frag,node);
  }

  function maskRoot(root){
    if(!root || root.classList.contains('fsp-mask-ready')) return;
    root.classList.add('fsp-mask-target','fsp-mask-ready');
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
      var p=node.parentElement;
      if(!p) return NodeFilter.FILTER_REJECT;
      if(p.closest('script,style,template,button,input,select,option,.word')) return NodeFilter.FILTER_REJECT;
      return /[\p{L}\p{N}]/u.test(node.nodeValue||'') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }});
    var nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(maskTextNode);
  }

  function initGenericMasking(){
    var page=document.body.dataset.page||'';
    if(page==='anamnese-faelle'){
      document.querySelectorAll('.case-card li,.case-card p').forEach(maskRoot);
    }else if(page==='begriffe'){
      document.querySelectorAll('#glossary td.lay,#glossary td.medical,#glossary td.meaning').forEach(maskRoot);
    }
  }

  document.addEventListener('DOMContentLoaded',function(){
    setActiveNav();
    initModeSwitch();
    initTheme();
    initGlobalToolbar();
    initGenericMasking();
  });
})();
