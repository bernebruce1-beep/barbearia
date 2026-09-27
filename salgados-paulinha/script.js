// ======= CONFIGURAÇÃO — edite aqui =======
const WHATSAPP = '5512996317709';

// Preços: "un" = unidade tamanho normal | "cento" = cento de mini (null = não vendido como mini)
const PRODUTOS = [
  { cat:'fritos', nome:'Coxinha de frango', img:'fotos/bolinhas.webp', desc:'Frango desfiado com catupiry, massa macia e casquinha crocante.', un:6.5, cento:75, tag:'Campeã',
    foto:'coxinha dourada partida ao meio, recheio de frango cremoso escorrendo' },
  { cat:'fritos', nome:'Risole de carne', img:'fotos/quibes-risoles.webp', desc:'Carne moída temperadinha, empanado sequinho.', un:6, cento:75,
    foto:'risoles em formato de meia-lua empilhados num prato branco' },
  { cat:'fritos', nome:'Bolinha de queijo', img:'fotos/bolinhas.webp', desc:'Puxa-puxa de muçarela derretida em cada mordida.', un:6, cento:75,
    foto:'bolinha de queijo aberta com queijo esticando em fio' },
  { cat:'fritos', nome:'Quibe', img:'fotos/quibes-risoles.webp', desc:'Trigo e carne bem temperados, com hortelã fresquinha.', un:6.5, cento:75,
    foto:'quibes dourados com rodela de limão e folhas de hortelã' },
  { cat:'fritos', nome:'Enroladinho de queijo e presunto', desc:'Massa macia enrolada com presunto e queijo derretido.', un:5.5, cento:75,
    foto:'enroladinhos de presunto e queijo abertos mostrando o queijo derretido' },
  { cat:'empadao', nome:'Empadão de frango com catupiry', desc:'Tamanho família, massa amanteigada que desmancha e frango cremoso com catupiry.', un:0, cento:null, tag:'Sob encomenda',
    img:'fotos/empadao.webp', foto:'empadão de frango com catupiry inteiro, dourado e brilhante' },
  { cat:'doces', nome:'Trufas', desc:'Chocolate cremoso por dentro e casquinha que derrete na boca. Pergunte os sabores do dia!', un:0, cento:null,
    foto:'trufas de chocolate embrulhadas em papel colorido, uma mordida mostrando o recheio cremoso' },
  { cat:'bebidas', nome:'Refrigerantes', desc:'Lata ou 2 litros, sempre geladinho para acompanhar os salgados.', un:0, cento:null,
    foto:'refrigerantes gelados em lata e garrafa de 2 litros com gotinhas' },
];
const CATS = { fritos:'Fritos', empadao:'Empadão', doces:'Doces', bebidas:'Bebidas' };
// =========================================

const brl = v => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const wppLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

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
    ${p.img
      ? `<div class="card__foto">${p.tag ? `<span class="tag">${p.tag}</span>` : ''}<img src="${p.img}" alt="${p.foto}" loading="lazy" width="800" height="570"></div>`
      : `<div class="ph" role="img" aria-label="Foto: ${p.foto}">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
      <span>📸 FOTO: ${p.foto}</span>
    </div>`}
    <div class="card__corpo">
      <h3>${p.nome}</h3>
      <p>${p.desc}</p>
      <div class="card__rodape">
        <span class="preco">${p.un ? `${brl(p.un)} <small>/un</small>` : '<small>Consulte</small>'}</span>
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
const disponiveis = () => PRODUTOS.map((p, i) => ({ ...p, i })).filter(p => modo() === 'un' ? p.un : p.cento);

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
  const env = document.getElementById('calcEnviar');
  env.setAttribute('aria-disabled', !itens.length);
  env.href = wppLink(mensagemPedido());
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

function mensagemPedido() {
  const itens = itensPedido();
  const total = itens.reduce((s, x) => s + x.sub, 0);
  const nome = document.getElementById('calcNome').value.trim();
  const entrega = document.getElementById('calcEntrega').value;
  const data = document.getElementById('calcData').value.trim();
  const tipo = modo() === 'un' ? 'tamanho normal' : 'mini salgados para festa';
  return [
    `Oi Paulinha! ${nome ? `Aqui é ${nome}. ` : ''}Quero fazer este pedido (${tipo}):`, '',
    ...itens.map(x => `• ${x.q}x ${x.nome} — ${brl(x.sub)}`), '',
    `*Total: ${brl(total)}*`,
    `${entrega}${data ? ` para ${data}` : ''}`, '',
    'Pode confirmar pra mim? 😋',
  ].join('\n');
}
const enviar = document.getElementById('calcEnviar');
const atualizarLinkEnvio = () => { enviar.href = wppLink(mensagemPedido()); };
['calcNome', 'calcEntrega', 'calcData'].forEach(id => document.getElementById(id).addEventListener('input', atualizarLinkEnvio));
enviar.addEventListener('click', e => { if (enviar.getAttribute('aria-disabled') === 'true') e.preventDefault(); else atualizarLinkEnvio(); });

renderLista(); atualizarResumo();

// Animações ao rolar
const io = 'IntersectionObserver' in window && new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); } });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('visivel'));

document.getElementById('ano').textContent = new Date().getFullYear();
