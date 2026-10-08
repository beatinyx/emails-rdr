// E-mail 01 "Veja as opções": 6 versões por empreendimento (com e sem novidade) + sem produto.
import {
  EMPREENDIMENTOS, FONTE_TEXTO, TRACO_TRES,
  p, blocoBanner, blocoLegendas, blocoTraco, documento, gravar,
} from '../lib/base.mjs';

const BASE = {
  email: '01 · Veja as opções',
  fonte: 'scripts/emails/01-veja-as-opcoes.mjs',
  variaveis: ['{{NOME}}', '{{LINK_SIMULACAO}}', '{{LINK_DESCADASTRO}}'],
  titulo: 'Veja as opções',
  assunto: 'Veja as opções',
  botao: { texto: 'Quero uma simulação', link: '{{LINK_SIMULACAO}}' },
};

function blocoCaixa(e, modo) {
  const c = e.caixa;
  const frase =
    modo === 'atualizacao'
      ? `Temos uma informação sobre o ${e.nome} para compartilhar com você: {{ATUALIZACAO_PRODUTO}}`
      : `Vale conhecer este ponto do ${e.nome}: ${e.argumento}`;
  return `
              <!-- Caixa do empreendimento: cor de apoio do KV ${e.nome} -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px 0;">
                <tr>
                  <td width="6" style="width:6px; background-color:${c.barra}; font-size:0; line-height:0;">&nbsp;</td>
                  <td class="rdr-caixa" style="padding:24px 28px 26px 24px; background-color:${c.fundo};">
                    <p style="margin:0; font-family:${FONTE_TEXTO}; font-size:18px; line-height:28px; color:${c.texto};">${frase}</p>
                  </td>
                </tr>
              </table>`;
}

const versoes = [];

for (const e of Object.values(EMPREENDIMENTOS)) {
  for (const modo of ['atualizacao', 'argumento']) {
    const comNovidade = modo === 'atualizacao';
    versoes.push({
      arquivo: `${e.slug}-${comNovidade ? 'com-novidade' : 'sem-novidade'}.html`,
      rotulo: `${e.nome} · ${comNovidade ? 'com novidade confirmada' : 'sem novidade (argumento)'}`,
      html: documento({
        ...BASE,
        preheader: comNovidade
          ? `Uma informação sobre o ${e.nome} para você.`
          : `Um ponto do ${e.nome} que vale conhecer.`,
        cabecalho: `       Versão:      ${e.nome} — ${comNovidade ? 'com novidade confirmada' : 'sem novidade confirmada (argumento do produto)'}
       Assunto:     Veja as opções
       Específicas: ${comNovidade ? '{{ATUALIZACAO_PRODUTO}}' : e.argumento.startsWith('{{') ? e.argumento : '(argumento já preenchido)'}${e.legal.startsWith('{{') ? ' · ' + e.legal : ''}`,
        banner: blocoBanner({ src: e.banner, alt: e.alt }) + blocoTraco([[e.acento, 600]]),
        corpo:
          blocoCaixa(e, modo) +
          '\n              ' +
          p('Se fizer sentido para seus planos, você pode pedir uma simulação e conferir os valores com um corretor.', ' margin-bottom:12px;'),
        legais: [e.legal],
      }),
    });
  }
}

versoes.push({
  arquivo: 'sem-produto.html',
  rotulo: 'Sem produto identificado',
  html: documento({
    ...BASE,
    preheader: 'Opções da RDR no Fonseca, no Ingá e em Vila Isabel.',
    cabecalho: `       Versão:      sem produto identificado (Soul Fonseca, Sun In e Novo Enredo)
       Assunto:     Veja as opções
       Específicas: nenhuma`,
    banner:
      blocoBanner({
        src: 'banner-rdr-opcoes.jpg',
        alt: 'Fachadas dos empreendimentos da RDR Engenharia: Soul Fonseca, no Fonseca; Sun In, no Ingá; e Novo Enredo, em Vila Isabel',
      }) +
      blocoTraco(TRACO_TRES) +
      blocoLegendas(),
    corpo: p(
      'A RDR tem opções no Fonseca, no Ingá e em Vila Isabel. Você pode escolher qual quer conhecer e pedir uma simulação para conferir os valores e vantagens.',
      ' margin-bottom:12px;',
    ),
    legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  }),
});

gravar('01-veja-as-opcoes', '01 · Veja as opções', versoes);
