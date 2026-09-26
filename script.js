// ============================================================
// BARBEARIA DO GNOMO'Z
// SCRIPT PRINCIPAL
// ============================================================

const SUPABASE_URL = "https://frskwpajcsysaehrfbxl.supabase.co";

// COLOQUE SUA CHAVE ANON/PUBLISHABLE AQUI
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc2t3cGFqY3N5c2FlaHJmYnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODAxOTYsImV4cCI6MjEwNTg1NjE5Nn0.0KaTP0WXzeZxEAt03Y_3GUvb3fPjCEKNOKCiEc5D9ZE";


// ============================================================
// SUPABASE
// ============================================================

let supabaseClient = null;

try {

    if (!window.supabase) {
        throw new Error(
            "Biblioteca do Supabase não foi carregada."
        );
    }

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log(
        "✅ Cliente Supabase criado."
    );

} catch (erro) {

    console.error(
        "❌ Erro ao criar cliente Supabase:",
        erro
    );

}


// ============================================================
// VARIÁVEIS
// ============================================================

let barbeiroAtual = null;

let servicos = [];

let servicosSelecionados = [];

let horarioSelecionado = null;

// Horários ocupados da data escolhida (para recalcular
// sem buscar de novo quando os serviços mudam).

let ultimosOcupados = null;


// ============================================================
// ELEMENTOS
// ============================================================

const bookingForm =
    document.getElementById("bookingForm");

const servicosContainer =
    document.getElementById("servicosContainer");

const totalContainer =
    document.getElementById("totalContainer");

const totalValor =
    document.getElementById("totalValor");

const barbeiroSelect =
    document.getElementById("barbeiro");

const dataInput =
    document.getElementById("data");

const horariosContainer =
    document.getElementById("horarios");

const horarioInput =
    document.getElementById("horario");

const nomeInput =
    document.getElementById("nome");

const telefoneInput =
    document.getElementById("telefone");

const bookingMessage =
    document.getElementById("bookingMessage");


// ============================================================
// VERIFICAÇÃO DOS ELEMENTOS
// ============================================================

console.log("🚀 Script iniciado.");

console.log(
    "🔎 Campo barbeiro:",
    barbeiroSelect
);

console.log(
    "🔎 Container serviços:",
    servicosContainer
);

console.log(
    "🔎 Formulário:",
    bookingForm
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarSite
);


async function iniciarSite() {

    console.log(
        "🚀 Iniciando Barbearia do GNOMO'Z..."
    );

    if (!supabaseClient) {

        configurarMenu();

        configurarGaleria();

        mostrarErroBarbeiro(
            "Supabase não carregado"
        );

        return;
    }


    configurarMenu();

    configurarGaleria();

    configurarDataMinima();

    configurarTelefone();

    configurarFormulario();

    preencherCliente();


    // Carrega serviços e barbeiro
    // separadamente para um erro não impedir o outro.

    await carregarServicos();

    await carregarBarbeiro();


    console.log(
        "✅ Inicialização concluída."
    );

}


// ============================================================
// CARREGAR BARBEIRO
// ============================================================

async function carregarBarbeiro() {

    console.log(
        "🔎 PROCURANDO BARBEIRO..."
    );


    if (!barbeiroSelect) {

        console.error(
            "❌ #barbeiro não existe no HTML."
        );

        return;
    }


    // Estado inicial

    barbeiroSelect.disabled = true;

    barbeiroSelect.innerHTML = `
        <option value="">
            Carregando barbeiro...
        </option>
    `;


    try {

        console.log(
            "📡 Consultando tabela barbeiros..."
        );


        const resultado =
            await supabaseClient
                .from("barbeiros")
                .select(
                    "id,nome,especialidade"
                )
                .eq(
                    "ativo",
                    true
                )
                .order(
                    "id",
                    {
                        ascending: true
                    }
                )
                .limit(1);


        console.log(
            "📦 Resposta do Supabase:",
            resultado
        );


        const data =
            resultado.data;

        const error =
            resultado.error;


        if (error) {

            console.error(
                "❌ ERRO AO BUSCAR BARBEIRO:",
                error
            );

            barbeiroAtual = null;

            mostrarErroBarbeiro(
                "Erro ao carregar barbeiro"
            );

            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            console.warn(
                "⚠️ Nenhum barbeiro ativo encontrado."
            );

            barbeiroAtual = null;

            mostrarErroBarbeiro(
                "Nenhum barbeiro disponível"
            );

            return;
        }


        // ====================================================
        // BARBEIRO ENCONTRADO
        // ====================================================

        barbeiroAtual =
            data[0];


        console.log(
            "✅ BARBEIRO ENCONTRADO:",
            barbeiroAtual
        );


        // Limpa select

        barbeiroSelect.innerHTML = "";


        // Cria opção

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(
                barbeiroAtual.id
            );


        option.textContent =
            barbeiroAtual.nome;


        option.selected =
            true;


        barbeiroSelect.appendChild(
            option
        );


        // Garante valor

        barbeiroSelect.value =
            String(
                barbeiroAtual.id
            );


        // Libera select

        barbeiroSelect.disabled =
            false;


        const barberName =
            document.getElementById("barberName");

        if (barberName) {
            barberName.textContent =
                barbeiroAtual.nome.toUpperCase();
        }


        console.log(
            "👤 BARBEIRO SELECIONADO:",
            barbeiroAtual.nome
        );

        console.log(
            "🆔 ID:",
            barbeiroAtual.id
        );


        // Se já escolheu data
        // carrega horários.

        if (
            dataInput &&
            dataInput.value
        ) {

            await carregarHorarios();

        }

    } catch (erro) {

        console.error(
            "❌ ERRO AO CARREGAR BARBEIRO:",
            erro
        );

        barbeiroAtual = null;

        mostrarErroBarbeiro(
            "Erro ao carregar barbeiro"
        );

    }

}


// ============================================================
// ERRO BARBEIRO
// ============================================================

function mostrarErroBarbeiro(
    mensagem
) {

    if (!barbeiroSelect) return;


    barbeiroSelect.innerHTML = `
        <option value="">
            ${mensagem}
        </option>
    `;


    barbeiroSelect.disabled =
        true;

}


// ============================================================
// SERVIÇOS
// ============================================================

async function carregarServicos() {

    console.log(
        "🔎 Carregando serviços..."
    );


    if (!servicosContainer) {

        console.error(
            "❌ #servicosContainer não encontrado."
        );

        return;
    }


    servicosContainer.innerHTML = `
        <div class="loading-servicos">
            Carregando serviços...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("servicos")
                .select(
                    "id,nome,descricao,preco,duracao"
                )
                .eq(
                    "ativo",
                    true
                )
                .order(
                    "id"
                );


        if (error) {

            console.error(
                "❌ Erro nos serviços:",
                error
            );

            servicosContainer.innerHTML = `
                <div class="erro-servicos">
                    Erro ao carregar serviços.
                </div>
            `;

            return;
        }


        servicos =
            data || [];


        console.log(
            "📦 Serviços do banco:",
            servicos
        );




        renderizarServicos();


    } catch (erro) {

        console.error(
            "❌ Erro serviços:",
            erro
        );

    }

}


// ============================================================
// RENDERIZAR SERVIÇOS
// ============================================================

function renderizarServicos() {

    servicosContainer.innerHTML = "";


    servicos.forEach(
        servico => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "service-option";


            label.dataset.id =
                servico.id;


            const preco =
                Number(
                    servico.preco || 0
                );


            label.innerHTML = `

                <input
                    type="checkbox"
                    value="${servico.id}"
                >

                <span class="service-option-info">

                    <strong>
                        ${escaparHTML(
                            servico.nome
                        )}
                    </strong>

                    ${
                        servico.descricao
                            ? `
                                <small>
                                    ${escaparHTML(
                                        servico.descricao
                                    )}
                                </small>
                            `
                            : ""
                    }

                </span>

                <span class="service-option-price">${formatarPreco(preco)} 

                    <small class="service-option-time">
                        ${duracaoServico(servico)} min
                    </small>

                </span>

            `;


            const checkbox =
                label.querySelector(
                    "input"
                );


            checkbox.addEventListener(
                "change",
                () => {

                    label.classList.toggle(
                        "selecionado",
                        checkbox.checked
                    );


                    atualizarServicosSelecionados();

                }
            );


            servicosContainer.appendChild(
                label
            );

        }
    );


    atualizarTotal();

}


// ============================================================
// SERVIÇOS SELECIONADOS
// ============================================================

function atualizarServicosSelecionados() {

    const selecionados =
        servicosContainer.querySelectorAll(
            'input[type="checkbox"]:checked'
        );


    servicosSelecionados =
        Array.from(
            selecionados
        )
        .map(
            checkbox => {

                return servicos.find(
                    servico =>
                        String(
                            servico.id
                        ) ===
                        String(
                            checkbox.value
                        )
                );

            }
        )
        .filter(Boolean);


    atualizarTotal();

}


// ============================================================
// TOTAL
// ============================================================

function ehCorte(servico) {
    return /corte/i.test(servico?.nome || "");
}

function ehSobrancelha(servico) {
    return /sobrancelha/i.test(servico?.nome || "");
}


// Promoção: corte + outro serviço (ex.: barba)
// = sobrancelha grátis.

function ganhouPromocao(lista) {
    return lista.some(ehCorte) &&
        lista.filter(servico => !ehSobrancelha(servico)).length >= 2;
}

function promocaoAtiva() {
    return ganhouPromocao(servicosSelecionados) &&
        servicosSelecionados.some(ehSobrancelha);
}

function precoServico(servico) {

    if (ehSobrancelha(servico) && promocaoAtiva()) {
        return 0;
    }

    return Number(servico.preco || 0);

}

function duracaoServico(servico) {
    return Number(servico.duracao) > 0
        ? Number(servico.duracao)
        : 30;
}

function calcularDuracao() {
    return servicosSelecionados.reduce(
        (total, servico) => total + duracaoServico(servico),
        0
    );
}

function formatarPreco(valor) {
    return `R$ ${Number(valor)
        .toFixed(2)
        .replace(".", ",")}`;
}

function formatarDuracao(minutos) {

    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    if (!horas) return `${resto} min`;

    return resto
        ? `${horas}h${String(resto).padStart(2, "0")}`
        : `${horas}h`;

}

function calcularTotal() {

    return servicosSelecionados.reduce(
        (total, servico) => total + precoServico(servico),
        0
    );

}


function atualizarTotal() {

    if (totalValor) {
        totalValor.textContent =
            formatarPreco(calcularTotal());
    }


    const totalDuracao =
        document.getElementById("totalDuracao");

    if (totalDuracao) {
        totalDuracao.textContent =
            servicosSelecionados.length
                ? `· ${formatarDuracao(calcularDuracao())}`
                : "";
    }


    if (totalContainer) {

        totalContainer.classList.toggle(
            "visivel",
            servicosSelecionados.length > 0
        );

    }


    // Preço da sobrancelha vira GRÁTIS na promoção.

    servicosContainer
        ?.querySelectorAll(".service-option")
        .forEach(label => {

            const servico = servicos.find(
                item => String(item.id) === label.dataset.id
            );

            const preco =
                label.querySelector(".service-option-price");

            if (!servico || !preco || !preco.firstChild) return;

            const gratis =
                ehSobrancelha(servico) && promocaoAtiva();

            preco.firstChild.textContent = gratis
                ? "GRÁTIS "
                : `${formatarPreco(servico.preco)} `;

            preco.classList.toggle("gratis", gratis);

        });


    const promoHint =
        document.getElementById("promoHint");

    if (promoHint) {

        const temCorte =
            servicosSelecionados.some(ehCorte);

        promoHint.hidden = !temCorte;

        promoHint.textContent = promocaoAtiva()
            ? "🎁 Promoção aplicada: sua sobrancelha sai grátis!"
            : ganhouPromocao(servicosSelecionados)
                ? "🎁 Você ganhou a sobrancelha grátis! É só marcar ela acima."
                : "🎁 Escolha mais um serviço com o corte (ex.: barba) e ganhe a sobrancelha grátis!";

    }


    // A duração muda quais horários cabem.

    if (ultimosOcupados) {
        renderizarHorarios(ultimosOcupados);
    }

}


// ============================================================
// DATA
// ============================================================

function configurarDataMinima() {

    if (!dataInput) return;


    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoje.getDate()
        ).padStart(
            2,
            "0"
        );


    dataInput.min =
        `${ano}-${mes}-${dia}`;


    dataInput.addEventListener(
        "change",
        carregarHorarios
    );

}


// ============================================================
// HORÁRIOS
// ============================================================

// Terça a sábado: 09:00–12:00 e 14:00–18:00
// (o último horário de cada turno termina no fechamento).

const HORARIOS_DISPONIVEIS = [

    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30"

];


// 0 = domingo, 1 = segunda

const DIAS_FECHADOS = [0, 1];


// ============================================================
// CARREGAR HORÁRIOS
// ============================================================

async function carregarHorarios() {

    if (!horariosContainer)
        return;


    horarioSelecionado =
        null;

    ultimosOcupados =
        null;


    if (horarioInput) {
        horarioInput.value = "";
    }


    const data =
        dataInput?.value;


    if (!data) {

        horariosContainer.innerHTML = `
            <p>
                Escolha uma data.
            </p>
        `;

        return;
    }


    const diaSemana =
        new Date(`${data}T12:00:00`).getDay();

    if (DIAS_FECHADOS.includes(diaSemana)) {

        horariosContainer.innerHTML = `
            <p>
                Fechado aos domingos e segundas.
                Atendemos de terça a sábado.
            </p>
        `;

        return;
    }


    if (!barbeiroAtual) {

        horariosContainer.innerHTML = `
            <p>
                Carregando barbeiro...
            </p>
        `;

        return;
    }


    horariosContainer.innerHTML = `
        <p>
            Verificando horários...
        </p>
    `;


    try {

        const {
            data: ocupados,
            error
        } =
            await supabaseClient.rpc(
                "get_booked_slots",
                {
                    p_data:
                        data,

                    p_barbeiro_id:
                        Number(
                            barbeiroAtual.id
                        )
                }
            );


        if (error) {

            console.error(
                "❌ Erro horários:",
                error
            );

            horariosContainer.innerHTML = `
                <p>
                    Erro ao carregar horários.
                </p>
            `;

            return;
        }


        const horariosOcupados =
            new Set(
                (
                    ocupados || []
                ).map(
                    item =>
                        String(
                            item.horario
                        ).substring(
                            0,
                            5
                        )
                )
            );


        ultimosOcupados =
            horariosOcupados;

        renderizarHorarios(
            horariosOcupados
        );


    } catch (erro) {

        console.error(
            "❌ Erro inesperado horários:",
            erro
        );

    }

}


// ============================================================
// RENDERIZAR HORÁRIOS
// ============================================================

function renderizarHorarios(
    ocupados
) {

    horariosContainer.innerHTML = "";


    // Mantém o horário escolhido só se ele ainda couber.

    const selecionadoAntes =
        horarioSelecionado;

    horarioSelecionado =
        null;


    let disponiveis =
        0;


    // Se a data é hoje, horários que já passaram
    // não podem ser escolhidos.

    const agora =
        new Date();

    const ehHoje =
        dataInput?.value === dataInput?.min;

    const minutosAgora =
        agora.getHours() * 60 + agora.getMinutes();


    HORARIOS_DISPONIVEIS.forEach(
        horario => {

            const [hora, minuto] =
                horario.split(":").map(Number);

            const passou =
                ehHoje &&
                hora * 60 + minuto <= minutosAgora;

            // O atendimento precisa caber inteiro:
            // todos os blocos de 30 min livres e
            // antes do fim do turno.

            const inicio =
                hora * 60 + minuto;

            const blocos =
                Math.max(1, Math.ceil(calcularDuracao() / 30));

            const indice =
                HORARIOS_DISPONIVEIS.indexOf(horario);

            let cabe = true;

            for (let b = 0; b < blocos; b++) {

                const proximo =
                    HORARIOS_DISPONIVEIS[indice + b];

                if (!proximo) { cabe = false; break; }

                const [h2, m2] =
                    proximo.split(":").map(Number);

                if (
                    h2 * 60 + m2 !== inicio + b * 30 ||
                    ocupados.has(proximo)
                ) {
                    cabe = false;
                    break;
                }

            }

            const ocupado =
                passou ||
                !cabe;


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "horario-btn";


            button.textContent =
                passou
                    ? "Encerrado"
                    : ocupados.has(horario)
                        ? "Ocupado"
                        : horario;


            if (ocupado && !passou && !ocupados.has(horario)) {

                button.classList.add("nao-cabe");

                button.title =
                    "Não há tempo para os serviços escolhidos neste horário";

            }


            if (ocupado) {

                button.disabled =
                    true;

                button.classList.add(
                    "ocupado"
                );

            } else {

                disponiveis++;


                button.addEventListener(
                    "click",
                    () => {

                        selecionarHorario(
                            horario,
                            button
                        );

                    }
                );

            }


            horariosContainer.appendChild(
                button
            );

        }
    );


    const aindaLivre =
        Array.from(
            horariosContainer.querySelectorAll(".horario-btn:not(:disabled)")
        ).find(btn => btn.textContent === selecionadoAntes);

    if (aindaLivre) {
        selecionarHorario(selecionadoAntes, aindaLivre);
    } else if (horarioInput) {
        horarioInput.value = "";
    }


    if (
        disponiveis === 0
    ) {

        horariosContainer.innerHTML = `
            <p>
                Nenhum horário disponível nesta data.
            </p>
        `;

    }

}


// ============================================================
// SELECIONAR HORÁRIO
// ============================================================

function selecionarHorario(
    horario,
    botao
) {

    horarioSelecionado =
        horario;


    if (horarioInput) {

        horarioInput.value =
            horario;

    }


    horariosContainer
        .querySelectorAll(
            ".horario-btn"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selecionado"
                );

            }
        );


    botao.classList.add(
        "selecionado"
    );

}


// ============================================================
// FORMULÁRIO
// ============================================================

function configurarFormulario() {

    if (!bookingForm)
        return;


    bookingForm.addEventListener(
        "submit",
        enviarAgendamento
    );

}


// ============================================================
// ENVIAR AGENDAMENTO
// ============================================================

async function enviarAgendamento(
    event
) {

    event.preventDefault();


    limparMensagem();


    const nome =
        nomeInput?.value.trim();


    const telefone =
        telefoneInput?.value.trim();


    const data =
        dataInput?.value;


    const horario =
        horarioSelecionado ||
        horarioInput?.value;


    if (!nome) {

        mostrarMensagem(
            "Digite seu nome.",
            "erro"
        );

        return;
    }


    if (!telefone) {

        mostrarMensagem(
            "Digite seu WhatsApp.",
            "erro"
        );

        return;
    }


    const digitosTelefone =
        telefone.replace(/\D/g, "");

    if (
        digitosTelefone.length < 10 ||
        digitosTelefone.length > 11
    ) {

        mostrarMensagem(
            "Digite um WhatsApp válido com DDD.",
            "erro"
        );

        return;
    }


    if (!barbeiroAtual) {

        mostrarMensagem(
            "Barbeiro ainda não foi carregado.",
            "erro"
        );

        return;
    }


    if (
        servicosSelecionados.length === 0
    ) {

        mostrarMensagem(
            "Selecione um serviço.",
            "erro"
        );

        return;
    }


    if (!data) {

        mostrarMensagem(
            "Selecione uma data.",
            "erro"
        );

        return;
    }


    if (!horario) {

        mostrarMensagem(
            "Selecione um horário.",
            "erro"
        );

        return;
    }


    // Somente IDs reais do banco

    const servicosReais =
        servicosSelecionados.filter(
            servico =>
                Number.isFinite(
                    Number(
                        servico.id
                    )
                )
        );


    const servicoIds =
        servicosReais.map(
            servico =>
                Number(
                    servico.id
                )
        );


    if (
        servicoIds.length === 0
    ) {

        mostrarMensagem(
            "Selecione um serviço válido.",
            "erro"
        );

        return;
    }


    const botao =
        bookingForm.querySelector(
            'button[type="submit"]'
        );


    const texto =
        botao?.innerHTML;


    if (botao) {

        botao.disabled =
            true;

        botao.innerHTML =
            "AGENDANDO...";

    }


    try {

        const {
            data: novoId,
            error
        } =
            await supabaseClient.rpc(
                "create_booking_multi",
                {

                    p_nome_cliente:
                        nome,

                    p_telefone:
                        telefone,

                    p_barbeiro_id:
                        Number(
                            barbeiroAtual.id
                        ),

                    p_servico_ids:
                        servicoIds,

                    p_data:
                        data,

                    p_horario:
                        horario

                }
            );


        if (error) {

            console.error(
                "❌ Erro agendamento:",
                error
            );


            mostrarMensagem(
                error.message ||
                "Não foi possível realizar o agendamento.",
                "erro"
            );


            await carregarHorarios();

            return;
        }


        console.log(
            "✅ Agendamento criado:",
            novoId
        );


        salvarCliente(nome, telefone);


        mostrarConfirmacao({
            nome,
            data,
            horario,
            servicos: servicosSelecionados.slice(),
            total: calcularTotal(),
            duracao: calcularDuracao(),
            linkWhatsApp: montarLinkWhatsApp(
                nome,
                telefone,
                data,
                horario,
                servicosSelecionados
            )
        });


        bookingForm.reset();

        preencherCliente();


        servicosSelecionados =
            [];

        horarioSelecionado =
            null;

        ultimosOcupados =
            null;


        document
            .querySelectorAll(
                ".service-option.selecionado"
            )
            .forEach(
                item =>
                    item.classList.remove(
                        "selecionado"
                    )
            );


        atualizarTotal();


        if (horarioInput) {
            horarioInput.value = "";
        }


        horariosContainer.innerHTML = `
            <p>
                Escolha uma data.
            </p>
        `;


    } catch (erro) {

        console.error(
            "❌ Erro inesperado:",
            erro
        );


        mostrarMensagem(
            "Ocorreu um erro. Tente novamente.",
            "erro"
        );


    } finally {

        if (botao) {

            botao.disabled =
                false;

            botao.innerHTML =
                texto;

        }

    }

}


// ============================================================
// LEMBRAR CLIENTE
// ============================================================

const CHAVE_CLIENTE =
    "gnomoz_cliente";

function salvarCliente(nome, telefone) {

    try {
        localStorage.setItem(
            CHAVE_CLIENTE,
            JSON.stringify({ nome, telefone })
        );
    } catch (erro) {
        // Navegador sem armazenamento: só não lembra.
    }

}

function preencherCliente() {

    try {

        const salvo = JSON.parse(
            localStorage.getItem(CHAVE_CLIENTE) || "null"
        );

        if (!salvo) return;

        if (nomeInput && !nomeInput.value) {
            nomeInput.value = salvo.nome || "";
        }

        if (telefoneInput && !telefoneInput.value) {
            telefoneInput.value = salvo.telefone || "";
        }

    } catch (erro) {
        // Ignora dado inválido.
    }

}


// ============================================================
// CONFIRMAÇÃO
// ============================================================

function mostrarConfirmacao(info) {

    const nomesDias = [
        "Domingo", "Segunda", "Terça", "Quarta",
        "Quinta", "Sexta", "Sábado"
    ];

    const diaSemana =
        nomesDias[new Date(`${info.data}T12:00:00`).getDay()];

    const lista = info.servicos
        .map(servico => {

            const preco = precoServicoNaLista(servico, info.servicos);

            return `
                <li>
                    <span>${escaparHTML(servico.nome)}</span>
                    <strong>${preco === 0 ? "GRÁTIS" : formatarPreco(preco)}</strong>
                </li>
            `;

        })
        .join("");


    limparMensagem();

    bookingMessage.className =
        "booking-message sucesso booking-confirmacao";

    bookingMessage.innerHTML = `

        <div class="confirmacao-icone">✓</div>

        <h3>Agendado, ${escaparHTML(info.nome.split(" ")[0])}!</h3>

        <p class="confirmacao-quando">
            ${diaSemana}, ${formatarData(info.data)} às ${info.horario}
            <small>Duração aproximada: ${formatarDuracao(info.duracao)}</small>
        </p>

        <ul class="confirmacao-lista">
            ${lista}
        </ul>

        <div class="confirmacao-total">
            <span>TOTAL</span>
            <strong>${formatarPreco(info.total)}</strong>
        </div>

        <div class="confirmacao-acoes">

            <a class="btn btn-primary" target="_blank" rel="noopener noreferrer" data-acao="whatsapp">
                ENVIAR NO WHATSAPP <span>↗</span>
            </a>

            <button type="button" class="btn btn-secondary" data-acao="agenda">
                ADICIONAR À AGENDA
            </button>

            <button type="button" class="confirmacao-novo" data-acao="novo">
                Fazer outro agendamento
            </button>

        </div>

    `;

    bookingMessage.querySelector('[data-acao="whatsapp"]').href =
        info.linkWhatsApp;

    bookingMessage
        .querySelector('[data-acao="agenda"]')
        .addEventListener("click", () => baixarEventoAgenda(info));

    bookingMessage
        .querySelector('[data-acao="novo"]')
        .addEventListener("click", () => {
            bookingForm.classList.remove("confirmado");
            limparMensagem();
            bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
        });


    bookingMessage.style.display =
        "block";

    bookingForm.classList.add("confirmado");

    bookingMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// Na confirmação os serviços já foram limpos,
// então a promoção é recalculada a partir da lista.

function precoServicoNaLista(servico, lista) {

    const promo =
        ganhouPromocao(lista) && lista.some(ehSobrancelha);

    return ehSobrancelha(servico) && promo
        ? 0
        : Number(servico.preco || 0);

}


function baixarEventoAgenda(info) {

    const [ano, mes, dia] = info.data.split("-").map(Number);
    const [hora, minuto] = info.horario.split(":").map(Number);

    const inicio = new Date(ano, mes - 1, dia, hora, minuto);
    const fim = new Date(inicio.getTime() + info.duracao * 60000);

    const formatar = d =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}` +
        `T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;

    const servicosTexto =
        info.servicos.map(servico => servico.nome).join(", ");

    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Barbearia do GNOMO'Z//Agendamento//PT",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@gnomoz`,
        `DTSTAMP:${formatar(new Date())}`,
        `DTSTART:${formatar(inicio)}`,
        `DTEND:${formatar(fim)}`,
        "SUMMARY:Barbearia do GNOMO'Z",
        `DESCRIPTION:${servicosTexto}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT1H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Seu horário na Barbearia do GNOMO'Z",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const url = URL.createObjectURL(
        new Blob([ics], { type: "text/calendar" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "agendamento-gnomoz.ics";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

}


// ============================================================
// WHATSAPP
// ============================================================

function montarLinkWhatsApp(
    nome,
    telefone,
    data,
    horario,
    servicos
) {

    const numero =
        "5512997194383";


    const lista =
        servicos
            .map(
                servico => {

                    if (
                        precoServico(servico) === 0
                    ) {

                        return `• ${servico.nome} — GRÁTIS`;

                    }


                    return `• ${servico.nome}`;

                }
            )
            .join(
                "\n"
            );


    const mensagem =
`✂️ *NOVO AGENDAMENTO - BARBEARIA DO GNOMO'Z*

👤 *Cliente:* ${nome}
📱 *WhatsApp:* ${telefone}

💈 *Barbeiro:* ${
    barbeiroAtual?.nome ||
    "Douglas"
}

⏱️ *Duração:* ${formatarDuracao(calcularDuracao())}

📅 *Data:* ${
    formatarData(data)
}

⏰ *Horário:* ${horario}

🛎️ *Serviços:*
${lista}

💰 *Total:* R$ ${
    calcularTotal()
        .toFixed(2)
        .replace(
            ".",
            ","
        )
}

Agendamento realizado pelo site.`;


    return `https://wa.me/${numero}?text=${
        encodeURIComponent(
            mensagem
        )
    }`;

}


// ============================================================
// MENU MOBILE
// ============================================================

function configurarMenu() {

    const toggle =
        document.getElementById("menuToggle");

    const nav =
        document.getElementById("navPrincipal");

    if (!toggle || !nav || toggle.dataset.pronto)
        return;

    toggle.dataset.pronto = "1";


    function definirAberto(aberto) {

        nav.classList.toggle("nav-open", aberto);

        toggle.classList.toggle("active", aberto);

        toggle.setAttribute(
            "aria-expanded",
            String(aberto)
        );

    }


    toggle.addEventListener(
        "click",
        () => definirAberto(
            !nav.classList.contains("nav-open")
        )
    );


    nav.querySelectorAll("a").forEach(
        link => link.addEventListener(
            "click",
            () => definirAberto(false)
        )
    );

}


// ============================================================
// GALERIA
// ============================================================

function configurarGaleria() {

    const dialog =
        document.getElementById("galleryDialog");

    if (!dialog || dialog.dataset.pronto)
        return;

    dialog.dataset.pronto = "1";


    const imagem =
        dialog.querySelector("img");


    document
        .querySelectorAll(".gallery-item")
        .forEach(
            item => item.addEventListener(
                "click",
                () => {

                    const foto =
                        item.querySelector("img");

                    imagem.src = item.dataset.src;
                    imagem.alt = foto.alt;

                    dialog.showModal();

                }
            )
        );


    // Fecha no botão ou clicando fora da foto.

    dialog.addEventListener(
        "click",
        event => {

            if (event.target !== imagem) {
                dialog.close();
            }

        }
    );

}


// ============================================================
// TELEFONE
// ============================================================

function configurarTelefone() {

    if (!telefoneInput)
        return;


    telefoneInput.addEventListener(
        "input",
        () => {

            let valor =
                telefoneInput.value
                    .replace(
                        /\D/g,
                        ""
                    );


            valor =
                valor.substring(
                    0,
                    11
                );


            if (
                valor.length <= 10
            ) {

                valor =
                    valor.replace(
                        /^(\d{2})(\d)/,
                        "($1) $2"
                    );

                valor =
                    valor.replace(
                        /(\d{4})(\d)/,
                        "$1-$2"
                    );

            } else {

                valor =
                    valor.replace(
                        /^(\d{2})(\d)/,
                        "($1) $2"
                    );

                valor =
                    valor.replace(
                        /(\d{5})(\d)/,
                        "$1-$2"
                    );

            }


            telefoneInput.value =
                valor;

        }
    );

}


// ============================================================
// MENSAGENS
// ============================================================

function mostrarMensagem(
    mensagem,
    tipo
) {

    if (!bookingMessage)
        return;


    bookingMessage.textContent =
        mensagem;


    bookingMessage.className =
        `booking-message ${tipo}`;


    bookingMessage.style.display =
        "block";

}


function limparMensagem() {

    if (!bookingMessage)
        return;


    bookingMessage.textContent =
        "";


    bookingMessage.className =
        "booking-message";


    bookingMessage.style.display =
        "none";

}


// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(
    data
) {

    if (!data)
        return "";


    const partes =
        data.split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return `${
        partes[2]
    }/${
        partes[1]
    }/${
        partes[0]
    }`;

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// FINAL
// ============================================================

console.log(
    "📌 script.js carregado."
);
