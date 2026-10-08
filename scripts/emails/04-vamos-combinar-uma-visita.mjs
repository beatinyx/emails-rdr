// E-mail 04 "Vamos combinar uma visita?" (Ofertão RDR): 3 versões por empreendimento + sem produto.
// Reaproveita o banner do Ofertão e a caixa Azul Profundo do convite (e-mail 02).
import {
  EMPREENDIMENTOS, FONTE_TEXTO, FONTE_DISPLAY, IMG, RDR, TRACO_TRES,
  p, blocoBannerOfertao, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const DATA = '29/10'; // data do Ofertão
const LOCAL = '{{LOCAL_ATENDIMENTO}}';

const BASE = {
  email: '04 · Vamos combinar uma visita? (Ofertão RDR)',
  fonte: 'scripts/emails/04-vamos-combinar-uma-visita.mjs',
  titulo: 'Vamos combinar uma visita?',
  assunto: 'Vamos combinar uma visita?',
  botao: { texto: 'Quero escolher um horário', link: '{{LINK_HORARIO}}', larguraVml: 340 },
  cssMobile: `
      .rdr-datas  { padding:22px 18px 24px 18px !important; }
      .rdr-destaque { font-size:20px !important; line-height:26px !important; }`,
};

const destaque = (txt) => `<strong style="color:${RDR.ceu};">${txt}</strong>`;

// Linha da caixa: ícone + informação em destaque (data ou local).
const linha = (icone, alt, valor, ultima) => `
                      <tr>
                        <td width="48" valign="middle" style="width:48px; padding:0 14px ${ultima ? 0 : 14}px 0;">
                          <img src="${IMG}/${icone}" width="34" height="34" alt="${alt}" style="display:block; width:34px; height:34px; border:0;" />
                        </td>
                        <td class="rdr-destaque" valign="middle" style="padding:0 0 ${ultima ? 0 : 14}px 0; font-family:${FONTE_DISPLAY}; font-size:24px; line-height:30px; font-weight:bold; color:#FFFFFF;">${valor}</td>
                      </tr>`;

// Caixa Azul Profundo: data (e local, quando há produto) em evidência, depois o parágrafo.
function caixaEncontro(linhas, texto) {
  return `
              <!-- Caixa do encontro do Ofertão -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px 0;">
                <tr>
                  <td class="rdr-datas" style="padding:28px 28px 30px 28px; background-color:${RDR.profundo}; border-top:4px solid ${RDR.ceu};">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">${linhas}
                    </table>
                    <p style="margin:22px 0 0 0; font-family:${FONTE_TEXTO}; font-size:18px; line-height:28px; color:#FFFFFF;">${texto}</p>
                  </td>
                </tr>
              </table>`;
}

const versoes = Object.values(EMPREENDIMENTOS).map((e) => ({
  arquivo: `${e.slug}.html`,
  rotulo: e.nome,
  html: documento({
    ...BASE,
    variaveis: ['{{NOME}}', LOCAL, '{{LINK_HORARIO}}', '{{LINK_DESCADASTRO}}'],
    preheader: `Conheça o ${e.nome} no próximo encontro da RDR e tire suas dúvidas com um corretor.`,
    cabecalho: `       Versão:      ${e.nome}
       Assunto:     ${BASE.assunto}
       Específicas: ${LOCAL} (local do atendimento deste empreendimento)`,
    banner: blocoBannerOfertao(e.banner, e.alt) + blocoTraco([[e.acento, 600]]),
    corpo:
      caixaEncontro(
        linha('icone-calendario.png', 'Data', DATA) + linha('icone-local.png', 'Local', LOCAL, true),
        `O próximo encontro da RDR será em ${destaque(DATA)}, em ${destaque(LOCAL)}. Você pode conhecer o ${e.nome} e tirar suas dúvidas com um corretor.`,
      ) +
      '\n              ' +
      p('Venha conferir nossas opções, escolha um horário para o atendimento.', ' margin-bottom:12px;'),
    legais: [e.legal],
  }),
}));

versoes.push({
  arquivo: 'sem-produto.html',
  rotulo: 'Sem produto identificado',
  html: documento({
    ...BASE,
    variaveis: ['{{NOME}}', '{{LINK_HORARIO}}', '{{LINK_DESCADASTRO}}'],
    preheader: 'Conheça as opções da RDR no próximo encontro e tire suas dúvidas com um corretor.',
    cabecalho: `       Versão:      sem produto identificado (Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     ${BASE.assunto}
       Específicas: nenhuma`,
    banner:
      blocoBannerOfertao(
        'banner-rdr-opcoes.jpg',
        'fachadas do Soul Fonseca, no Fonseca; do Sun In, no Ingá; e do Novo Enredo, em Vila Isabel',
      ) +
      blocoTraco(TRACO_TRES) +
      blocoLegendas(),
    corpo:
      caixaEncontro(
        linha('icone-calendario.png', 'Data', DATA, true),
        `O próximo encontro da RDR será em ${destaque(DATA)}. Você pode conhecer nossas opções e tirar suas dúvidas com um corretor.`,
      ) +
      '\n              ' +
      p('Escolha o empreendimento para conferir o local e os horários de atendimento.', ' margin-bottom:12px;'),
    legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  }),
});

gravar('04-vamos-combinar-uma-visita', '04 · Vamos combinar uma visita?', versoes);
