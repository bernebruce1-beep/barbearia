# Uplay São José dos Pinhais – site one-page

Arquivo único: `index.html` (HTML, CSS e JS puro). Abra direto no navegador ou publique a pasta inteira.

## Fotos

Coloque as fotos em `fotos/` com exatamente estes nomes. Enquanto um arquivo não existir, aparece um placeholder com o nome dele.

| Arquivo | Onde aparece | Status |
|---|---|---|
| `foto-musculacao.jpg` | Hero (cortada pela seta) | incluída |
| `foto-salao.jpg` | Galeria (destaque) | incluída |
| `foto-peso-livre.jpg` | Galeria | incluída (site uplaysjp.com.br) |
| `foto-cardio.jpg` | Galeria | incluída |
| `foto-aula-coletiva.jpg` | Por que Uplay – 04 e galeria | incluída (sala vazia; troque por foto de aula quando tiver) |
| `foto-musculacao-2.jpg` | Galeria | incluída (site uplaysjp.com.br) |
| `foto-recepcao.jpg` | Galeria | incluída (site uplaysjp.com.br) |
| `foto-mezanino.jpg` | Galeria | incluída (site uplaysjp.com.br) |
| `foto-mobilidade.jpg` | Galeria | incluída |
| `foto-funcional.jpg` | Galeria | incluída |
| `post-totalpass.jpg` | Bloco TotalPass no plano | incluída |
| `foto-professor.jpg` | Por que Uplay – 01 (Prof. Gi Ferreira) | incluída |
| `post-estacionamento.jpg` | Por que Uplay – 02 (post "Nosso estacionamento mudou") | incluída; o fundo parece ilustração, troque por foto real do pátio quando tiver |
| `foto-espaco-kids.jpg` | Por que Uplay – 03 e galeria | falta |
| `foto-fachada.jpg` | Prévia de link / futura galeria | falta |
| `foto-depoimento-1.jpg` … `-3.jpg` | Depoimentos (quadradas) | falta |
| `og-uplay-sjp.jpg` | Prévia ao compartilhar o link (1200×630) | falta |

As fotos incluídas saíram de posts e stories do @uplay.sjp: legendas e marcas d'água foram cortadas ou removidas, e as imagens passaram por upscale 4x (EDSR).

Use JPG com cerca de 1600 px no lado maior (a do hero pode ter 2000 px).

## O que falta preencher

- **Aulas coletivas**: a grade já está preenchida, conforme o destaque do Instagram. Quando mudar, edite a seção `#aulas`.
- **Depoimentos**: troque `[DEPOIMENTO REAL]`, `[NOME DO ALUNO]`, `[@usuario]`, `[DATA]`, `[ANO]` e `[HH:MM]`.
- **Plano**: confira se todos os itens da lista "O que está incluso" valem para o plano anual.
- **Feriados**: a lista `FIXED` no script tem os feriados nacionais (e ainda Sexta-feira Santa e Corpus Christi). Acrescente os feriados municipais de São José dos Pinhais.
- **Logo**: o logo é uma recriação simples (seta + "UPLAY"). Troque pelo SVG oficial.
- **Domínio**: `canonical` e `og:url` apontam para `https://www.uplaysjp.com.br/`. Ajuste se o site ficar em outro endereço.
