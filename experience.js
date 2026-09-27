(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const precise = matchMedia('(hover: hover) and (pointer: fine)');
  const animate = (el, frames, options) => reduced.matches ? null : el.animate(frames, options);
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.append(progress);
  const dock = document.createElement('aside'); dock.className = 'quick-dock'; dock.setAttribute('aria-label', 'Atalhos da página');
  dock.innerHTML = '<a href="#cuidados">Cuidados</a><a href="#prepare-se">Sua consulta</a><a href="#duvidas">Dúvidas</a><a class="dock-book" href="https://wa.me/557998393797?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Gimus." target="_blank" rel="noopener noreferrer">Agendar ↗</a><a class="dock-top" href="#inicio" aria-label="Voltar ao início">↑</a>';
  dock.hidden = true; document.body.append(dock);
  let queued = false;
  const syncScroll = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1,scrollY/max) : 0})`;
    const visible = scrollY > document.querySelector('.hero').offsetHeight * .65;
    if (dock.hidden === visible) { dock.hidden = !visible; if(visible) animate(dock,[{opacity:0,transform:'translate(-50%,18px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:300,easing:'ease-out'}); }
  };
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(syncScroll)}},{passive:true});addEventListener('resize',syncScroll);syncScroll();
  const reveal = new IntersectionObserver(entries => entries.forEach(({isIntersecting,target})=>{
    if (!isIntersecting) return; reveal.unobserve(target);
    animate(target,[{opacity:.2,translate:'0 24px'},{opacity:1,translate:'0 0'}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'});
  }), {threshold:.12});
  document.querySelectorAll('.section-head,.about>div,.cards article,.reasons-intro,.reason-list article,.steps li,.prepare-heading,.prepare-list>div,.faq-heading,.faq-list,.contact>div').forEach(el=>reveal.observe(el));
  document.querySelectorAll('.cards article').forEach(card=>{
    let frame=0;
    card.addEventListener('pointermove',e=>{if(!precise.matches||reduced.matches)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=card.getBoundingClientRect();card.style.setProperty('--glow-x',`${e.clientX-r.left}px`);card.style.setProperty('--glow-y',`${e.clientY-r.top}px`);});});
    card.addEventListener('pointerleave',()=>cancelAnimationFrame(frame));
  });
  document.querySelectorAll('.faq-list details').forEach(details=>{
    const summary=details.querySelector('summary');let animation=null;
    summary.addEventListener('click',e=>{
      if(reduced.matches)return;
      e.preventDefault();if(animation)return;
      const opening=!details.open, start=details.offsetHeight;
      if(opening)details.open=true;
      const end=opening?details.offsetHeight:summary.offsetHeight;
      details.style.overflow='hidden';
      animation=details.animate([{height:`${start}px`},{height:`${end}px`}],{duration:280,easing:'cubic-bezier(.2,.7,.3,1)'});
      const finish=()=>{details.open=opening;details.style.overflow='';animation=null;};animation.onfinish=finish;animation.oncancel=finish;
    });
  });
  const list=document.querySelector('.prepare-list');
  const status=document.createElement('p');status.className='check-status';status.setAttribute('aria-live','polite');
  document.querySelector('.prepare-note').textContent='Marque o que você já organizou para a consulta.';
  list.querySelectorAll(':scope > div').forEach((row,index)=>{
    const old=row.querySelector(':scope > span'),button=document.createElement('button');
    button.type='button';button.className='prepare-check';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`Marcar como organizado: ${row.querySelector('h3').textContent}`);button.innerHTML='<span aria-hidden="true">✓</span>';old.replaceWith(button);
    button.addEventListener('click',()=>{const done=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(done));row.classList.toggle('is-prepared',done);const count=list.querySelectorAll('[aria-pressed="true"]').length;status.textContent=count===4?'Tudo organizado. Você pode rever sua lista quando quiser.':`${count} de 4 itens organizados`;if(done)animate(button,[{scale:1},{scale:1.14},{scale:1}],{duration:260});});
  });
  status.textContent='0 de 4 itens organizados';list.append(status);
  const sections=[...document.querySelectorAll('main > section[id]')];
  const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;dock.querySelectorAll('a[href^="#"]').forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}),{rootMargin:'-15% 0px -55% 0px'});sections.forEach(el=>navObserver.observe(el));
  reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(a=>a.finish());});
})();
