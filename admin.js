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
// AGENDAMENTOS
// ============================================================

async function carregarAgendamentos() {
    const resultado = await supabaseClient.rpc("admin_list_agendamentos");

    if (resultado.error) {
        console.error("ERRO AGENDAMENTOS:", resultado.error);
        mostrarToast("Erro ao carregar agendamentos.");
        return;
    }

    agendamentos = resultado.data || [];

    document.getElementById("totalAgendamentos").textContent =
        agendamentos.length;

    document.getElementById("totalConfirmados").textContent =
        agendamentos.filter(item => item.status !== "cancelado").length;

    document.getElementById("totalCancelados").textContent =
        agendamentos.filter(item => item.status === "cancelado").length;

    renderizarAgendamentos();
}

function renderizarAgendamentos() {
    const tabela = document.getElementById("listaAgendamentos");
    const filtro = document.getElementById("filtroData").value;

    const lista = filtro
        ? agendamentos.filter(item => item.data_agendamento === filtro)
        : agendamentos;

    if (lista.length === 0) {
        tabela.innerHTML =
            "<tr><td colspan='8'>Nenhum agendamento encontrado.</td></tr>";
        return;
    }

    tabela.innerHTML = lista.map(function(item) {
        const cancelado = item.status === "cancelado";

        const acao = cancelado
            ? "—"
            : `<button class="btn-cancelar" onclick="cancelarAgendamento(${Number(item.id)})">❌ Cancelar</button>`;

        return `
            <tr>
                <td>${escaparHTML(item.nome_cliente || "-")}</td>
                <td>${escaparHTML(item.telefone || "-")}</td>
                <td>${escaparHTML(item.servico_nome || "-")}</td>
                <td>${escaparHTML(item.barbeiro_nome || "-")}</td>
                <td>${escaparHTML(formatarData(item.data_agendamento))}</td>
                <td>${escaparHTML(String(item.horario || "-").substring(0, 5))}</td>
                <td><span class="status status-${cancelado ? "cancelado" : "confirmado"}">${escaparHTML(item.status || "-")}</span></td>
                <td>${acao}</td>
            </tr>
        `;
    }).join("");
}

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
                <strong>${escaparHTML(item.nome)}</strong>
                <span>${escaparHTML(item.especialidade || "")}</span>
            </div>
        `;
    }).join("");

    document.getElementById("bloqueioBarbeiro").innerHTML = barbeiros.map(function(item) {
        return `<option value="${Number(item.id)}">${escaparHTML(item.nome)}</option>`;
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

    document.getElementById("listaServicos").innerHTML = (resultado.data || []).map(function(item) {
        return `
            <div>
                <strong>${escaparHTML(item.nome)}</strong>
                <span>R$ ${Number(item.preco).toFixed(2).replace(".", ",")}</span>
            </div>
        `;
    }).join("");
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

    const bloqueios = resultado.data || [];
    const tabela = document.getElementById("listaBloqueios");

    document.getElementById("totalBloqueios").textContent = bloqueios.length;

    if (bloqueios.length === 0) {
        tabela.innerHTML =
            "<tr><td colspan='5'>Nenhum horário bloqueado.</td></tr>";
        return;
    }

    tabela.innerHTML = bloqueios.map(function(item) {
        return `
            <tr>
                <td>${escaparHTML(item.barbeiro_nome || "-")}</td>
                <td>${escaparHTML(formatarData(item.data_bloqueio))}</td>
                <td>${escaparHTML(String(item.horario || "-").substring(0, 5))}</td>
                <td>${escaparHTML(item.motivo || "-")}</td>
                <td>
                    <button class="btn-desbloquear" onclick="desbloquearHorario(${Number(item.id)})">
                        🔓 Desbloquear
                    </button>
                </td>
            </tr>
        `;
    }).join("");
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

    mostrarToast("Horário desbloqueado!");
    carregarBloqueios();
}


iniciarAdmin();
