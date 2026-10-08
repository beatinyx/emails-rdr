// E-mail 02 "Vamos conhecer as opções?" (Ofertão RDR): 3 versões por empreendimento + sem produto.
import {
  EMPREENDIMENTOS, FONTE_TEXTO, FONTE_DISPLAY, IMG, RDR, TRACO_TRES,
  p, blocoBannerOfertao, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const DATAS = ['15', '22', '29'];

const BASE = {
  email: '02 · Vamos conhecer as opções? (Ofertão RDR)',
  fonte: 'scripts/emails/02-vamos-conhecer-as-opcoes.mjs',
  variaveis: ['{{NOME}}', '{{LINK_HORARIO}}', '{{LINK_DESCADASTRO}}'],
  titulo: 'Vamos conhecer as opções?',
  assunto: 'Vamos conhecer as opções?',
  preheader: 'O Ofertão RDR acontece em 15, 22 e 29/10. Escolha uma data para conversar com um corretor.',
  botao: { texto: 'Quero escolher um horário', link: '{{LINK_HORARIO}}', larguraVml: 340 },
  // datas cabem lado a lado no celular; só a caixa encolhe o respiro
  cssMobile: `
      .rdr-datas  { padding:22px 18px 24px 18px !important; }
      .rdr-dia    { width:64px !important; }`,
};

// Caixa de datas: Azul Profundo, ícone de calendário e as três datas em destaque.
function blocoDatas() {
  const dia = (d, ultimo) => `
                        <td class="rdr-dia" width="72" align="center" valign="middle" style="width:72px; padding:10px 0 9px 0; background-color:#0E3A6E; border-top:3px solid ${RDR.ceu};">
                          <span style="display:block; font-family:${FONTE_DISPLAY}; font-size:32px; line-height:34px; font-weight:bold; color:#FFFFFF;">${d}</span>
                          <span style="display:block; font-family:${FONTE_TEXTO}; font-size:11px; line-height:14px; font-weight:bold; letter-spacing:1.5px; color:${RDR.ceu};">OUT</span>
                        </td>${ultimo ? '' : `
                        <td width="8" style="width:8px; font-size:0; line-height:0;">&nbsp;</td>`}`;
  return `
              <!-- Caixa de datas do Ofertão -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px 0;">
                <tr>
                  <td class="rdr-datas" style="padding:28px 28px 30px 28px; background-color:${RDR.profundo};">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="48" valign="middle" style="width:48px; padding:0 14px 0 0;">
                          <img src="${IMG}/icone-calendario.png" width="44" height="44" alt="Calendário" style="display:block; width:44px; height:44px; border:0;" />
                        </td>${DATAS.map((d, i) => dia(d, i === DATAS.length - 1)).join('')}
                      </tr>
                    </table>
                    <p style="margin:22px 0 0 0; font-family:${FONTE_TEXTO}; font-size:18px; line-height:28px; color:#FFFFFF;">O Ofertão acontece nos dias <strong style="color:${RDR.ceu}; white-space:nowrap;">15, 22 e 29/10</strong>. Escolha o empreendimento e uma data para conferir o local e os horários de atendimento.</p>
                  </td>
                </tr>
              </table>`;
}

const corpo =
  p('A RDR está preparando um encontro para você conhecer as opções e esclarecer suas dúvidas com um corretor.') +
  blocoDatas();


const versoes = Object.values(EMPREENDIMENTOS).map((e) => ({
  arquivo: `${e.slug}.html`,
  rotulo: e.nome,
  html: documento({
    ...BASE,
    cabecalho: `       Versão:      ${e.nome}
       Assunto:     ${BASE.assunto}
       Específicas: nenhuma`,
    banner: blocoBannerOfertao(e.banner, e.alt) + blocoTraco([[e.acento, 600]]),
    corpo,
    legais: [e.legal],
  }),
}));

versoes.push({
  arquivo: 'sem-produto.html',
  rotulo: 'Sem produto identificado',
  html: documento({
    ...BASE,
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
    corpo,
    legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  }),
});

gravar('02-vamos-conhecer-as-opcoes', '02 · Vamos conhecer as opções?', versoes);
