const SUPABASE_URL = "https://frskwpajcsysaehrfbxl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc2t3cGFqY3N5c2FlaHJmYnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODAxOTYsImV4cCI6MjEwNTg1NjE5Nn0.0KaTP0WXzeZxEAt03Y_3GUvb3fPjCEKNOKCiEc5D9ZE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("ADMIN OK");
async function carregarAgendamentos() {
    const resultado = await supabaseClient.rpc(
        "admin_list_agendamentos"
    );

    if (resultado.error) {
        console.error("ERRO AGENDAMENTOS:", resultado.error);
        return;
    }

    const agendamentos = resultado.data || [];

    const tabela = document.querySelectorAll("table")[0]
        .querySelector("tbody");

    if (!tabela) {
        console.error("Não encontrei o tbody da tabela.");
        return;
    }

    if (agendamentos.length === 0) {
        tabela.innerHTML =
            "<tr><td colspan='8'>Nenhum agendamento encontrado.</td></tr>";
        return;
    }

    tabela.innerHTML = agendamentos.map(function(item) {

        let acao;

        if (item.status === "cancelado") {
            acao = "Cancelado";
        } else {
            acao = `
                <button onclick="cancelarAgendamento(${item.id})">
                    ❌ Cancelar
                </button>
            `;
        }

        return `
            <tr>
                <td>${item.nome_cliente || "-"}</td>
                <td>${item.telefone || "-"}</td>
                <td>${item.servico_nome || "-"}</td>
                <td>${item.barbeiro_nome || "-"}</td>
                <td>${item.data_agendamento || "-"}</td>
                <td>${item.horario || "-"}</td>
                <td>${item.status || "-"}</td>
                <td>${acao}</td>
            </tr>
        `;

    }).join("");

    console.log(
        "Agendamentos carregados:",
        agendamentos.length
    );
}

carregarAgendamentos();
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

    const lista = document.getElementById("listaBarbeiros");

    if (lista) {
        lista.innerHTML = barbeiros.map(function(item) {
            return `
                <div>
                    <strong>${item.nome}</strong>
                    <span>${item.especialidade || ""}</span>
                </div>
            `;
        }).join("");
    }

    const seletor = document.getElementById("bloqueioBarbeiro");

    if (seletor) {
        seletor.innerHTML = barbeiros.map(function(item) {
            return `
                <option value="${item.id}">
                    ${item.nome}
                </option>
            `;
        }).join("");
    }

    console.log("Barbeiro carregado:", barbeiros);
}

carregarBarbeiros();
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

    const lista = document.getElementById("listaServicos");

    if (!lista) {
        console.error("Não encontrei listaServicos.");
        return;
    }

    lista.innerHTML = resultado.data.map(function(item) {
        return `
            <div>
                <strong>${item.nome}</strong>
                <span>R$ ${Number(item.preco).toFixed(2).replace(".", ",")}</span>
            </div>
        `;
    }).join("");

    console.log("Serviços carregados:", resultado.data);
}

carregarServicos();
async function carregarBloqueios() {
    const resultado = await supabaseClient.rpc(
        "admin_listar_bloqueios"
    );

    if (resultado.error) {
        console.error("ERRO BLOQUEIOS:", resultado.error);
        return;
    }

    const bloqueios = resultado.data || [];
console.table(bloqueios);

    const tabela = document.querySelectorAll("table")[1]
        .querySelector("tbody");

    if (!tabela) {
        console.error("Não encontrei o tbody dos bloqueios.");
        return;
    }

    if (bloqueios.length === 0) {
        tabela.innerHTML =
            "<tr><td colspan='5'>Nenhum horário bloqueado.</td></tr>";
        return;
    }

    tabela.innerHTML = bloqueios.map(function(item) {
        return `
            <tr>
                <td>${item.barbeiro_nome || "-"}</td>
                <td>${item.data_bloqueio || "-"}</td>
                <td>${item.horario || "-"}</td>
                <td>${item.motivo || "-"}</td>
                <td>
                    <button onclick="desbloquearHorario(${item.id})">
                        🔓 Desbloquear
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    console.log(
        "Bloqueios carregados:",
        bloqueios.length
    );
}

carregarBloqueios();
async function carregarBloqueios() {
    const resultado = await supabaseClient.rpc(
        "admin_listar_bloqueios"
    );

    if (resultado.error) {
        console.error("ERRO BLOQUEIOS:", resultado.error);
        return;
    }

    const bloqueios = resultado.data || [];

    const tabela = document.querySelectorAll("table")[1]
        ?.querySelector("tbody");

    if (!tabela) {
        console.error("Não encontrei o tbody dos bloqueios.");
        return;
    }

    if (bloqueios.length === 0) {
        tabela.innerHTML =
            "<tr><td colspan='5'>Nenhum horário bloqueado.</td></tr>";
        return;
    }

    tabela.innerHTML = bloqueios.map(function(item) {
        return `
            <tr>
                <td>${item.barbeiro_nome || "-"}</td>
                <td>${item.data_bloqueio || "-"}</td>
                <td>${item.horario || "-"}</td>
                <td>${item.motivo || "-"}</td>
                <td>
                    <button onclick="desbloquearHorario(${item.id})">
                        🔓 Desbloquear
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    console.log(
        "Bloqueios carregados:",
        bloqueios.length
    );
}

carregarBloqueios();

async function cancelarAgendamento(id) {
    const confirmar = confirm(
        "Tem certeza que deseja cancelar este agendamento?"
    );

    if (!confirmar) {
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_cancelar_agendamento",
        {
            p_id: id
        }
    );

    if (resultado.error) {
        console.error(
            "ERRO AO CANCELAR:",
            resultado.error
        );

        alert("Erro ao cancelar o agendamento.");
        return;
    }

    alert("Agendamento cancelado!");

    carregarAgendamentos();
}
async function cancelarAgendamento(id) {
    const confirmar = confirm("Tem certeza que deseja cancelar este agendamento?");

    if (!confirmar) {
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_cancelar_agendamento",
        { p_id: id }
    );

    if (resultado.error) {
        console.error("ERRO AO CANCELAR:", resultado.error);
        alert("Erro ao cancelar.");
        return;
    }

    alert("Agendamento cancelado!");
    carregarAgendamentos();
}
document.querySelectorAll("button").forEach(function(botao, index) {
    console.log(
        "BOTÃO " + index,
        "texto:",
        botao.innerText,
        "ID:",
        botao.id
    );
});
async function bloquearHorario() {
    const barbeiro = document.getElementById("bloqueioBarbeiro").value;
    const data = document.getElementById("bloqueioData").value;
    const horario = document.getElementById("bloqueioHorario").value;
    const motivo = document.getElementById("bloqueioMotivo").value;

    if (!barbeiro || !data || !horario) {
        alert("Preencha barbeiro, data e horário.");
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
        alert("Erro ao bloquear: " + resultado.error.message);
        return;
    }

    alert("Horário bloqueado com sucesso!");

    document.getElementById("bloqueioMotivo").value = "";

    carregarBloqueios();
}
async function desbloquearHorario(id) {
    const confirmar = confirm(
        "Deseja desbloquear este horário?"
    );

    if (!confirmar) {
        return;
    }

    const resultado = await supabaseClient.rpc(
        "admin_desbloquear_horario",
        {
            p_id: id
        }
    );

    if (resultado.error) {
        console.error(
            "ERRO AO DESBLOQUEAR:",
            resultado.error
        );

        alert("Erro ao desbloquear.");
        return;
    }

    alert("Horário desbloqueado!");

    carregarBloqueios();
}