// ======= CONFIGURAÇÃO — edite aqui =======
const WHATSAPP = '5512996317709';

// Preços: "un" = unidade tamanho normal | "cento" = cento de mini (null = não vendido como mini)
const PRODUTOS = [
  { cat:'fritos', nome:'Coxinha de frango', desc:'Frango desfiado com catupiry, massa macia e casquinha crocante.', un:6.5, cento:70, tag:'Campeã',
    foto:'coxinha dourada partida ao meio, recheio de frango cremoso escorrendo' },
  { cat:'fritos', nome:'Risole de carne', desc:'Carne moída temperadinha, empanado sequinho.', un:6, cento:65,
    foto:'risoles em formato de meia-lua empilhados num prato branco' },
  { cat:'fritos', nome:'Bolinha de queijo', desc:'Puxa-puxa de muçarela derretida em cada mordida.', un:6, cento:65,
    foto:'bolinha de queijo aberta com queijo esticando em fio' },
  { cat:'fritos', nome:'Kibe', desc:'Trigo e carne bem temperados, com hortelã fresquinha.', un:6.5, cento:70,
    foto:'kibes dourados com rodela de limão e folhas de hortelã' },
  { cat:'fritos', nome:'Enroladinho de salsicha', desc:'Aquele clássico de festa que todo mundo ama.', un:5.5, cento:60,
    foto:'enroladinhos de salsicha em cestinha forrada com papel' },
  { cat:'assados', nome:'Esfiha de carne', desc:'Massa fofinha, carne temperada com tomate e cebola.', un:7, cento:80,
    foto:'esfihas abertas de carne saindo do forno em assadeira' },
  { cat:'assados', nome:'Empada de frango', desc:'Massa que desmancha na boca, recheio cremoso com azeitona.', un:7.5, cento:90,
    foto:'empadinhas douradas em forminhas, uma aberta mostrando o recheio' },
  { cat:'assados', nome:'Pastel de forno', desc:'Massa podre caseira com recheio de palmito ou frango.', un:7, cento:85,
    foto:'pastéis de forno pincelados com gema, brilhantes, sobre pano xadrez' },
  { cat:'especiais', nome:'Coxinha de costela', desc:'Costela desfiada no bafo com requeijão. Só às sextas!', un:9, cento:null, tag:'Especial',
    foto:'coxinha grande aberta com costela desfiada suculenta' },
  { cat:'especiais', nome:'Bolinho de bacalhau', desc:'Receita portuguesa da família, crocante e leve.', un:9.5, cento:120,
    foto:'bolinhos de bacalhau em formato oval com azeite e salsinha' },
  { cat:'especiais', nome:'Coxinha de camarão', desc:'Camarão refogado com catupiry. Para quem se ama.', un:10, cento:null,
    foto:'coxinha de camarão aberta com camarões inteiros no recheio' },
  { cat:'bebidas', nome:'Refrigerante lata', desc:'Coca-Cola, Guaraná ou Fanta, 350 ml geladinho.', un:6, cento:null,
    foto:'latas de refrigerante geladas com gotas, em balde de gelo' },
  { cat:'bebidas', nome:'Suco natural 500 ml', desc:'Laranja, maracujá ou limão, feito na hora.', un:9, cento:null,
    foto:'copos de suco de laranja e maracujá com canudo de papel' },
  { cat:'bebidas', nome:'Café passado', desc:'Cafezinho coado na hora para acompanhar.', un:4, cento:null,
    foto:'xícara de café fumegante ao lado de uma coxinha' },
];
const CATS = { fritos:'Fritos', assados:'Assados', especiais:'Especiais', bebidas:'Bebidas' };
// =========================================

const brl = v => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const wppLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const abrirWpp = msg => window.open(wppLink(msg), '_blank', 'noopener');

// Todos os links com data-wpp viram links de WhatsApp com mensagem pronta
document.querySelectorAll('[data-wpp]').forEach(el => {
  el.href = wppLink(el.dataset.wpp);
  el.target = '_blank';
  el.rel = 'noopener';
});

// Menu mobile
const menu = document.getElementById('menu');
const toggle = document.getElementById('menuToggle');
toggle.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  toggle.setAttribute('aria-expanded', aberto);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('aberto')));

// Cardápio
const cards = document.getElementById('cards');
cards.innerHTML = PRODUTOS.map(p => `
  <article class="card" data-cat="${p.cat}">
    <div class="ph" role="img" aria-label="Foto: ${p.foto}">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
      <span>📸 FOTO: ${p.foto}</span>
    </div>
    <div class="card__corpo">
      <h3>${p.nome}</h3>
      <p>${p.desc}</p>
      <div class="card__rodape">
        <span class="preco">${brl(p.un)} <small>/un</small></span>
        <a class="btn btn--wpp btn--sm" target="_blank" rel="noopener"
           href="${wppLink(`Oi Paulinha! Quero pedir ${p.nome} 😋`)}">Pedir</a>
      </div>
    </div>
  </article>`).join('');

document.getElementById('abas').addEventListener('click', e => {
  const btn = e.target.closest('.aba'); if (!btn) return;
  document.querySelectorAll('.aba').forEach(b => b.classList.toggle('ativa', b === btn));
  const cat = btn.dataset.cat;
  cards.querySelectorAll('.card').forEach(c => { c.hidden = cat !== 'todos' && c.dataset.cat !== cat; });
});

// Calculadora
const lista = document.getElementById('calcLista');
const qtds = PRODUTOS.map(() => 0);
const modo = () => document.querySelector('input[name="tam"]:checked').value;
const disponiveis = () => PRODUTOS.map((p, i) => ({ ...p, i })).filter(p => modo() === 'un' || p.cento);

function renderLista() {
  let html = '', ultima = '';
  disponiveis().forEach(p => {
    if (p.cat !== ultima) { html += `<div class="calc__cat">${CATS[p.cat]}</div>`; ultima = p.cat; }
    const preco = modo() === 'un' ? `${brl(p.un)} /un` : `${brl(p.cento)} o cento`;
    const passo = modo() === 'un' ? 1 : 25;
    html += `<div class="linha">
      <div><div class="linha__nome">${p.nome}</div><div class="linha__preco">${preco}</div></div>
      <div class="qtd" data-i="${p.i}" data-passo="${passo}">
        <button type="button" data-d="-1" aria-label="Diminuir ${p.nome}">−</button>
        <input type="number" min="0" inputmode="numeric" value="${qtds[p.i]}" aria-label="Quantidade de ${p.nome}">
        <button type="button" data-d="1" aria-label="Aumentar ${p.nome}">+</button>
      </div></div>`;
  });
  lista.innerHTML = html;
}

function itensPedido() {
  const m = modo();
  return disponiveis().filter(p => qtds[p.i] > 0).map(p => {
    const q = qtds[p.i];
    const sub = m === 'un' ? q * p.un : q / 100 * p.cento;
    return { nome: p.nome, q, sub };
  });
}

function atualizarResumo() {
  const itens = itensPedido();
  const total = itens.reduce((s, x) => s + x.sub, 0);
  const ul = document.getElementById('calcItens');
  ul.innerHTML = itens.length
    ? itens.map(x => `<li><span>${x.q}x ${x.nome}</span><span>${brl(x.sub)}</span></li>`).join('')
    : '<li class="vazio">Nenhum item ainda. Bora escolher? 😋</li>';
  document.getElementById('calcTotal').textContent = brl(total);
  document.getElementById('calcEnviar').disabled = !itens.length;
}

lista.addEventListener('click', e => {
  const b = e.target.closest('button[data-d]'); if (!b) return;
  const box = b.parentElement, i = +box.dataset.i, passo = +box.dataset.passo;
  qtds[i] = Math.max(0, qtds[i] + passo * +b.dataset.d);
  box.querySelector('input').value = qtds[i];
  atualizarResumo();
});
lista.addEventListener('input', e => {
  if (e.target.tagName !== 'INPUT') return;
  qtds[+e.target.parentElement.dataset.i] = Math.max(0, parseInt(e.target.value, 10) || 0);
  atualizarResumo();
});
document.querySelectorAll('input[name="tam"]').forEach(r => r.addEventListener('change', () => {
  qtds.fill(0); renderLista(); atualizarResumo();
}));
document.getElementById('calcLimpar').addEventListener('click', () => { qtds.fill(0); renderLista(); atualizarResumo(); });

document.getElementById('calcEnviar').addEventListener('click', () => {
  const itens = itensPedido(); if (!itens.length) return;
  const total = itens.reduce((s, x) => s + x.sub, 0);
  const nome = document.getElementById('calcNome').value.trim();
  const entrega = document.getElementById('calcEntrega').value;
  const data = document.getElementById('calcData').value.trim();
  const tipo = modo() === 'un' ? 'tamanho normal' : 'mini salgados para festa';
  const msg = [
    `Oi Paulinha! ${nome ? `Aqui é ${nome}. ` : ''}Quero fazer este pedido (${tipo}):`, '',
    ...itens.map(x => `• ${x.q}x ${x.nome} — ${brl(x.sub)}`), '',
    `*Total: ${brl(total)}*`,
    `${entrega}${data ? ` para ${data}` : ''}`, '',
    'Pode confirmar pra mim? 😋',
  ].join('\n');
  abrirWpp(msg);
});

renderLista(); atualizarResumo();

// Animações ao rolar
const io = 'IntersectionObserver' in window && new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); } });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('visivel'));

document.getElementById('ano').textContent = new Date().getFullYear();
