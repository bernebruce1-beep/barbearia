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


        // ====================================================
        // ADICIONA A PROMOÇÃO
        // ====================================================

        servicos.push({

            id: "promocao",

            nome:
                "Corte + outro serviço",

            descricao:
                "Faça seu corte e ganhe a sobrancelha grátis.",

            preco: 0,

            duracao: 0,

            promocao: true

        });


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


            const promocao =
                servico.promocao === true;


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

                <span class="service-option-price">

                    ${
                        promocao
                            ? "GRÁTIS"
                            : `R$ ${preco
                                .toFixed(2)
                                .replace(
                                    ".",
                                    ","
                                )}`
                    }

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

function calcularTotal() {

    return servicosSelecionados.reduce(
        (
            total,
            servico
        ) => {

            if (
                servico.promocao
            ) {
                return total;
            }


            return total +
                Number(
                    servico.preco || 0
                );

        },
        0
    );

}


function atualizarTotal() {

    const total =
        calcularTotal();


    if (totalValor) {

        totalValor.textContent =
            `R$ ${total
                .toFixed(2)
                .replace(
                    ".",
                    ","
                )}`;

    }


    if (totalContainer) {

        totalContainer.classList.toggle(
            "visivel",
            servicosSelecionados.length > 0
        );

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

            const ocupado =
                passou ||
                ocupados.has(
                    horario
                );


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
                    : ocupado
                        ? "Ocupado"
                        : horario;


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


        mostrarMensagem(
            "Agendamento realizado com sucesso! 🎉",
            "sucesso"
        );


        // O link é mostrado na mensagem porque
        // window.open depois de um await costuma
        // ser bloqueado pelo navegador.

        const linkWhatsApp =
            document.createElement("a");

        linkWhatsApp.href =
            montarLinkWhatsApp(
                nome,
                telefone,
                data,
                horario,
                servicosSelecionados
            );

        linkWhatsApp.target =
            "_blank";

        linkWhatsApp.rel =
            "noopener noreferrer";

        linkWhatsApp.className =
            "booking-whatsapp-link";

        linkWhatsApp.textContent =
            "Enviar confirmação no WhatsApp ↗";

        bookingMessage.append(
            document.createElement("br"),
            linkWhatsApp
        );


        bookingForm.reset();


        servicosSelecionados =
            [];


        horarioSelecionado =
            null;


        atualizarTotal();


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
                        servico.promocao
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
