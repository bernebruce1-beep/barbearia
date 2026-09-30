const SUPABASE_URL = "https://frskwpajcsysaehrfbxl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc2t3cGFqY3N5c2FlaHJmYnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODAxOTYsImV4cCI6MjEwNTg1NjE5Nn0.0KaTP0WXzeZxEAt03Y_3GUvb3fPjCEKNOKCiEc5D9ZE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let agendamentos = [];


// ============================================================
// LOGIN
// ============================================================

async function iniciarAdmin() {
    const { data } = await supabaseClient.auth.getSession();

    mostrarTela(Boolean(data.session));

    if (data.session) {
        carregarTudo();
    }
}

function mostrarTela(logado) {
    document.getElementById("telaLogin").hidden = logado;
    document.getElementById("telaPainel").hidden = !logado;
    document.getElementById("topoAcoes").hidden = !logado;
}

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const resultado = await supabaseClient.auth.signInWithPassword({
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginSenha").value
    });

    if (resultado.error) {
        mostrarToast("E-mail ou senha inválidos.");
        return;
    }

    document.getElementById("loginSenha").value = "";
    mostrarTela(true);
    carregarTudo();
});

async function sair() {
    await supabaseClient.auth.signOut();
    mostrarTela(false);
}


// ============================================================
// UTILITÁRIOS
// ============================================================

function escaparHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatarData(data) {
    const partes = String(data || "").split("-");
    return partes.length === 3
        ? `${partes[2]}/${partes[1]}/${partes[0]}`
        : (data || "-");
}

function mostrarToast(mensagem) {
    const toast = document.getElementById("toast");

    toast.textContent = mensagem;
    toast.classList.add("mostrar");

    clearTimeout(mostrarToast.timer);
    mostrarToast.timer = setTimeout(function() {
        toast.classList.remove("mostrar");
    }, 3000);
}

function carregarTudo() {
    carregarAgendamentos();
    carregarBloqueios();
    carregarBarbeiros();
    carregarServicos();
}


// ============================================================
// AGENDA
// ============================================================

// Mesmos horários do site (terça a sexta).

const HORARIOS = [
    "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const NOMES_DIAS = [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
];

let abaAtual = "hoje";

function dataISO(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function hojeISO() {
    return dataISO(new Date());
}

function amanhaISO() {
    const data = new Date();
    data.setDate(data.getDate() + 1);
    return dataISO(data);
}

function tituloDia(iso) {
    const dia = NOMES_DIAS[new Date(`${iso}T12:00:00`).getDay()];

    if (iso === hojeISO()) return `Hoje · ${dia}, ${formatarData(iso)}`;
    if (iso === amanhaISO()) return `Amanhã · ${dia}, ${formatarData(iso)}`;

    return `${dia}, ${formatarData(iso)}`;
}

function linkLembrete(item) {

    let numero = String(item.telefone || "").replace(/\D/g, "");

    if (numero.length === 10 || numero.length === 11) {
        numero = "55" + numero;
    }

    const primeiroNome = String(item.nome_cliente || "").trim().split(" ")[0];
    const hora = String(item.horario || "").substring(0, 5);

    const quando = item.data_agendamento === hojeISO()
        ? `hoje às ${hora}`
        : `${tituloDia(item.data_agendamento).replace(/^(Hoje|Amanhã) · /, "").toLowerCase()} às ${hora}`;

    const mensagem =
`Olá, ${primeiroNome}! 💈

Passando para lembrar do seu horário ${quando} na *Barbearia do GNOMO'Z*.

✂️ ${item.servico_nome || "Atendimento"}

Te esperamos! Se precisar remarcar, é só responder esta mensagem.`;

    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

async function carregarAgendamentos() {
    const resultado = await supabaseClient.rpc("admin_list_agendamentos");

    if (resultado.error) {
        console.error("ERRO AGENDAMENTOS:", resultado.error);
        mostrarToast("Erro ao carregar agendamentos.");
        return;
    }

    agendamentos = resultado.data || [];

    const hoje = hojeISO();
    const ativos = agendamentos.filter(item => item.status !== "cancelado");

    document.getElementById("totalAgendamentos").textContent =
        ativos.filter(item => item.data_agendamento === hoje).length;

    document.getElementById("totalConfirmados").textContent =
        ativos.filter(item => item.data_agendamento >= hoje).length;

    document.getElementById("totalCancelados").textContent =
        agendamentos.filter(item => item.status === "cancelado").length;

    renderizarAgendamentos();
}

function renderizarAgendamentos() {
    const container = document.getElementById("listaAgendamentos");
    const filtro = document.getElementById("filtroData").value;
    const hoje = hojeISO();

    let lista;

    if (filtro) {
        lista = agendamentos.filter(item => item.data_agendamento === filtro);
    } else if (abaAtual === "hoje") {
        lista = agendamentos.filter(item => item.data_agendamento === hoje);
    } else if (abaAtual === "amanha") {
        lista = agendamentos.filter(item => item.data_agendamento === amanhaISO());
    } else if (abaAtual === "proximos") {
        lista = agendamentos.filter(item => item.data_agendamento >= hoje && item.status !== "cancelado");
    } else {
        lista = agendamentos.slice().reverse();
    }

    if (lista.length === 0) {
        container.innerHTML = `<p class="vazio">Nenhum cliente agendado ${filtro ? "nesse dia" : abaAtual === "hoje" ? "para hoje" : abaAtual === "amanha" ? "para amanhã" : ""}.</p>`;
        return;
    }

    // Agrupa por dia.

    const dias = [];

    lista.forEach(item => {
        let grupo = dias.find(dia => dia.data === item.data_agendamento);

        if (!grupo) {
            grupo = { data: item.data_agendamento, itens: [] };
            dias.push(grupo);
        }

        grupo.itens.push(item);
    });

    container.innerHTML = dias.map(dia => {

        const ativos = dia.itens.filter(item => item.status !== "cancelado").length;

        return `
            <div class="dia">
                <h3 class="dia-titulo">
                    ${escaparHTML(tituloDia(dia.data))}
                    <span>${ativos} ${ativos === 1 ? "cliente" : "clientes"}</span>
                </h3>

                ${dia.itens.map(item => {

                    const cancelado = item.status === "cancelado";

                    return `
                        <div class="agendamento ${cancelado ? "cancelado" : ""}">

                            <div class="agendamento-hora">
                                ${escaparHTML(String(item.horario || "").substring(0, 5))}
                            </div>

                            <div class="agendamento-info">
                                <strong>${escaparHTML(item.nome_cliente || "-")}</strong>
                                <span>${escaparHTML(item.servico_nome || "-")}</span>
                                <small>${escaparHTML(item.telefone || "")}${cancelado ? " · <b>Cancelado</b>" : ""}</small>
                            </div>

                            <div class="agendamento-acoes">
                                ${cancelado ? "" : `
                                    <a class="btn-lembrar" href="${linkLembrete(item)}" target="_blank" rel="noopener noreferrer">📲 Lembrar</a>
                                    <button class="btn-cancelar" onclick="cancelarAgendamento(${Number(item.id)})">Cancelar</button>
                                `}
                            </div>

                        </div>
                    `;

                }).join("")}
            </div>
        `;

    }).join("");
}

document.querySelectorAll(".aba").forEach(aba => {
    aba.addEventListener("click", () => {
        abaAtual = aba.dataset.aba;

        document.querySelectorAll(".aba").forEach(outra =>
            outra.classList.toggle("ativa", outra === aba)
        );

        document.getElementById("filtroData").value = "";
        renderizarAgendamentos();
    });
});

document.getElementById("filtroData").addEventListener("change", () => {
    document.querySelectorAll(".aba").forEach(aba => aba.classList.remove("ativa"));
    renderizarAgendamentos();
});

async function cancelarAgendamento(id) {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) {
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_cancelar_agendamento",
        { p_id: id }
    );

    if (resultado.error) {
        console.error("ERRO AO CANCELAR:", resultado.error);
        mostrarToast("Erro ao cancelar.");
        return;
    }

    mostrarToast("Agendamento cancelado!");
    carregarAgendamentos();
}


// ============================================================
// BARBEIROS E SERVIÇOS
// ============================================================

async function carregarBarbeiros() {
    const resultado = await supabaseClient
        .from("barbeiros")
        .select("*")
        .eq("ativo", true)
        .order("id")
        .limit(1);

    if (resultado.error) {
        console.error("ERRO BARBEIRO:", resultado.error);
        return;
    }

    const barbeiros = resultado.data || [];

    document.getElementById("listaBarbeiros").innerHTML = barbeiros.map(function(item) {
        return `
            <div>
                <strong style="text-transform: capitalize">${escaparHTML(item.nome)}</strong>
                <span>${escaparHTML(item.especialidade || "")}</span>
            </div>
        `;
    }).join("");

    document.getElementById("bloqueioBarbeiro").innerHTML = barbeiros.map(function(item) {
        return `<option value="${Number(item.id)}">${escaparHTML(item.nome.charAt(0).toUpperCase() + item.nome.slice(1))}</option>`;
    }).join("");
}

async function carregarServicos() {
    const resultado = await supabaseClient
        .from("servicos")
        .select("*")
        .eq("ativo", true)
        .order("id");

    if (resultado.error) {
        console.error("ERRO SERVIÇOS:", resultado.error);
        return;
    }

    const servicosAtivos = (resultado.data || [])
        .filter(item => !/outro servi[cç]o|gr[aá]tis/i.test(item.nome || ""));

    document.getElementById("novoServicos").innerHTML = servicosAtivos.map(item => `
        <label class="novo-servico">
            <input type="checkbox" value="${Number(item.id)}">
            <span>${escaparHTML(item.nome)}</span>
            <small>${Number(item.duracao) || 30} min</small>
        </label>
    `).join("");

    document.getElementById("listaServicos").innerHTML = servicosAtivos.map(function(item) {
        return `
            <div>
                <strong style="text-transform: capitalize">${escaparHTML(item.nome)}</strong>
                <span>R$ ${Number(item.preco).toFixed(2).replace(".", ",")}</span>
            </div>
        `;
    }).join("");
}


// ============================================================
// NOVO AGENDAMENTO (PELO PAINEL)
// ============================================================

async function criarAgendamento() {
    const nome = document.getElementById("novoNome").value.trim();
    const telefone = document.getElementById("novoTelefone").value.trim();
    const data = document.getElementById("novoData").value;
    const horario = document.getElementById("novoHorario").value;
    const barbeiro = document.getElementById("bloqueioBarbeiro").value;

    const servicoIds = Array.from(
        document.querySelectorAll("#novoServicos input:checked")
    ).map(input => Number(input.value));

    if (!nome || !data || !horario || servicoIds.length === 0) {
        mostrarToast("Preencha nome, data, horário e pelo menos um serviço.");
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_criar_agendamento",
        {
            p_nome_cliente: nome,
            p_telefone: telefone,
            p_barbeiro_id: Number(barbeiro),
            p_servico_ids: servicoIds,
            p_data: data,
            p_horario: horario
        }
    );

    if (resultado.error) {
        console.error("ERRO AO AGENDAR:", resultado.error);
        mostrarToast(resultado.error.message || "Erro ao agendar.");
        return;
    }

    mostrarToast("Cliente agendado!");

    document.getElementById("novoNome").value = "";
    document.getElementById("novoTelefone").value = "";
    document.getElementById("novoHorario").value = "";
    document.querySelectorAll("#novoServicos input").forEach(input => input.checked = false);

    // Mostra o dia do agendamento na agenda.

    document.getElementById("filtroData").value = data;
    document.querySelectorAll(".aba").forEach(aba => aba.classList.remove("ativa"));

    await carregarAgendamentos();

    document.getElementById("listaAgendamentos")
        .scrollIntoView({ behavior: "smooth", block: "start" });
}


// ============================================================
// BLOQUEIOS
// ============================================================

async function carregarBloqueios() {
    const resultado = await supabaseClient.rpc("admin_listar_bloqueios");

    if (resultado.error) {
        console.error("ERRO BLOQUEIOS:", resultado.error);
        mostrarToast("Erro ao carregar bloqueios.");
        return;
    }

    const hoje = hojeISO();

    const bloqueios = (resultado.data || [])
        .filter(item => item.data_bloqueio >= hoje);

    const container = document.getElementById("listaBloqueios");

    document.getElementById("totalBloqueios").textContent = bloqueios.length;

    if (bloqueios.length === 0) {
        container.innerHTML = `<p class="vazio">Nenhum bloqueio daqui pra frente.</p>`;
        return;
    }

    // Agrupa por dia e barbeiro.

    const grupos = [];

    bloqueios.forEach(item => {
        const chave = `${item.data_bloqueio}|${item.barbeiro_id}`;
        let grupo = grupos.find(g => g.chave === chave);

        if (!grupo) {
            grupo = { chave, data: item.data_bloqueio, barbeiroId: item.barbeiro_id, barbeiro: item.barbeiro_nome, itens: [] };
            grupos.push(grupo);
        }

        grupo.itens.push(item);
    });

    container.innerHTML = grupos.map(grupo => {

        const horas = grupo.itens.map(item => String(item.horario).substring(0, 5));
        const diaInteiro = HORARIOS.every(hora => horas.includes(hora));

        return `
            <div class="bloqueio">
                <div class="agendamento-info">
                    <strong>${escaparHTML(tituloDia(grupo.data))}</strong>
                    <span>${diaInteiro ? "🚫 Dia inteiro bloqueado" : "Horários: " + escaparHTML(horas.join(", "))}</span>
                    <small>${escaparHTML(grupo.itens[0].motivo || "")}</small>
                </div>

                <div class="agendamento-acoes">
                    ${diaInteiro || grupo.itens.length > 1
                        ? `<button class="btn-desbloquear" onclick="desbloquearDia(${Number(grupo.barbeiroId)}, '${grupo.data}')">🔓 Liberar o dia</button>`
                        : `<button class="btn-desbloquear" onclick="desbloquearHorario(${Number(grupo.itens[0].id)})">🔓 Liberar</button>`}
                </div>
            </div>
        `;

    }).join("");
}

async function bloquearDia() {
    const barbeiro = document.getElementById("bloqueioBarbeiro").value;
    const data = document.getElementById("bloqueioData").value;
    const motivo = document.getElementById("bloqueioMotivo").value;

    if (!barbeiro || !data) {
        mostrarToast("Escolha o barbeiro e a data.");
        return;
    }

    if (!confirm(`Bloquear o dia ${formatarData(data)} inteiro?`)) {
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_bloquear_dia",
        {
            p_barbeiro_id: Number(barbeiro),
            p_data: data,
            p_horarios: HORARIOS,
            p_motivo: motivo || "Folga"
        }
    );

    if (resultado.error) {
        console.error("ERRO AO BLOQUEAR DIA:", resultado.error);
        mostrarToast("Erro ao bloquear o dia.");
        return;
    }

    const info = (resultado.data || [])[0] || {};

    document.getElementById("bloqueioMotivo").value = "";

    carregarBloqueios();

    if (info.agendamentos_no_dia > 0) {
        alert(
            `Dia bloqueado. Atenção: já existem ${info.agendamentos_no_dia} cliente(s) agendado(s) nesse dia. ` +
            `Veja na agenda e avise ou cancele.`
        );
        document.getElementById("filtroData").value = data;
        document.querySelectorAll(".aba").forEach(aba => aba.classList.remove("ativa"));
        renderizarAgendamentos();
        document.getElementById("listaAgendamentos").scrollIntoView({ behavior: "smooth" });
    } else {
        mostrarToast("Dia bloqueado! Ninguém consegue agendar.");
    }
}

async function desbloquearDia(barbeiroId, data) {
    if (!confirm(`Liberar o dia ${formatarData(data)} para agendamentos?`)) {
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_desbloquear_dia",
        { p_barbeiro_id: barbeiroId, p_data: data }
    );

    if (resultado.error) {
        console.error("ERRO AO LIBERAR DIA:", resultado.error);
        mostrarToast("Erro ao liberar o dia.");
        return;
    }

    mostrarToast("Dia liberado!");
    carregarBloqueios();
}

async function bloquearHorario() {
    const barbeiro = document.getElementById("bloqueioBarbeiro").value;
    const data = document.getElementById("bloqueioData").value;
    const horario = document.getElementById("bloqueioHorario").value;
    const motivo = document.getElementById("bloqueioMotivo").value;

    if (!barbeiro || !data || !horario) {
        mostrarToast("Preencha barbeiro, data e horário.");
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_bloquear_horario",
        {
            p_barbeiro_id: Number(barbeiro),
            p_data: data,
            p_horario: horario,
            p_motivo: motivo || "Bloqueado pelo administrador"
        }
    );

    if (resultado.error) {
        console.error("ERRO AO BLOQUEAR:", resultado.error);
        mostrarToast("Erro ao bloquear: " + resultado.error.message);
        return;
    }

    mostrarToast("Horário bloqueado com sucesso!");
    document.getElementById("bloqueioMotivo").value = "";
    carregarBloqueios();
}

async function desbloquearHorario(id) {
    if (!confirm("Deseja desbloquear este horário?")) {
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_desbloquear_horario",
        { p_id: id }
    );

    if (resultado.error) {
        console.error("ERRO AO DESBLOQUEAR:", resultado.error);
        mostrarToast("Erro ao desbloquear.");
        return;
    }

    mostrarToast("Horário liberado!");
    carregarBloqueios();
}


// Permite instalar o painel como aplicativo no celular.

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("admin-sw.js").catch(() => {});
}


// Android/Chrome: mostra o botão "Instalar app" quando dá para instalar.

let pedidoInstalacao = null;

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    pedidoInstalacao = event;
    document.getElementById("btnInstalar").hidden = false;
});

document.getElementById("btnInstalar").addEventListener("click", async () => {
    if (!pedidoInstalacao) return;

    pedidoInstalacao.prompt();
    await pedidoInstalacao.userChoice;

    pedidoInstalacao = null;
    document.getElementById("btnInstalar").hidden = true;
});


iniciarAdmin();
