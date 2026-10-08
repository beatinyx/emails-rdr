// E-mail 09 "Venha encontrar uma opção para seus planos" (Ofertão RDR · Feirão de imóveis): versão única.
// Banner do Feirão (Ofertão + "Feirão de imóveis" + assinatura RDR); caixa Azul Profundo com o evento.
import {
  EMPREENDIMENTOS, FONTE_TEXTO, FONTE_DISPLAY, IMG, RDR,
  p, documento, gravar,
} from '../lib/base.mjs';

const EVENTO = {
  datas: '22 a 29/10', // período do Ofertão (o mesmo do e-mail 06)
  local: '{{LOCAL_OFERTAO}}',
  horarios: '{{HORARIOS_OFERTAO}}',
};

const banner = `
          <!-- ============ BANNER: OFERTÃO · FEIRÃO DE IMÓVEIS ============ -->
          <tr>
            <td style="padding:0; background-color:#FFFFFF;">
              <img class="rdr-full" src="${IMG}/banner-ofertao-feirao.jpg" width="600" height="350" alt="Ofertão RDR · Feirão de imóveis · RDR Engenharia" style="display:block; width:600px; max-width:100%; height:auto; border:0;" />
            </td>
          </tr>`;

// Linha do evento: ícone, rótulo (Datas, Local, Atendimento) e a informação em destaque.
const linha = (icone, rotulo, valor, ultima) => `
                      <tr>
                        <td width="48" valign="top" style="width:48px; padding:2px 14px ${ultima ? 0 : 18}px 0;">
                          <img src="${IMG}/${icone}" width="34" height="34" alt="" style="display:block; width:34px; height:34px; border:0;" />
                        </td>
                        <td valign="top" style="padding:0 0 ${ultima ? 0 : 18}px 0;">
                          <p style="margin:0; font-family:${FONTE_TEXTO}; font-size:15px; line-height:20px; color:${RDR.ceu};">${rotulo}</p>
                          <p class="rdr-destaque" style="margin:2px 0 0 0; font-family:${FONTE_DISPLAY}; font-size:22px; line-height:28px; font-weight:bold; color:#FFFFFF;">${valor}</p>
                        </td>
                      </tr>`;

const caixaEvento = `
              <!-- Caixa do evento -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px 0;">
                <tr>
                  <td class="rdr-datas" style="padding:28px 28px 30px 28px; background-color:${RDR.profundo}; border-top:4px solid ${RDR.ceu};">
                    <p style="margin:0 0 22px 0; font-family:${FONTE_DISPLAY}; font-size:24px; line-height:30px; font-weight:300; text-transform:uppercase; color:#FFFFFF;">Programe sua visita</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">${linha('icone-calendario.png', 'Datas', EVENTO.datas)}${linha('icone-local.png', 'Local', EVENTO.local)}${linha('icone-horario.png', 'Atendimento', EVENTO.horarios, true)}
                    </table>
                  </td>
                </tr>
              </table>`;

const titulo = 'Venha encontrar uma opção para seus planos';

const html = documento({
  email: '09 · Venha encontrar uma opção para seus planos (Ofertão RDR · Feirão de imóveis)',
  fonte: 'scripts/emails/09-feirao-ofertao.mjs',
  variaveis: ['{{NOME}}', EVENTO.local, EVENTO.horarios, '{{LINK_OFERTAO}}', '{{LINK_DESCADASTRO}}'],
  titulo,
  assunto: titulo,
  preheader: 'A RDR vai realizar o Ofertão, um feirão de ofertas para quem está buscando um imóvel.',
  cabecalho: `       Versão:      única
       Assunto:     ${titulo}
       Específicas: ${EVENTO.local} · ${EVENTO.horarios}`,
  banner,
  saudacao: 'Olá, {{NOME}}, tudo bem?',
  corpo:
    p('A RDR vai realizar o Ofertão, um feirão de ofertas para quem está buscando um imóvel.') +
    p('Você poderá conhecer melhor nossos empreendimentos, comparar as opções e conversar com a equipe sobre valores, entrada e possibilidades de financiamento.') +
    p('É uma oportunidade para esclarecer suas dúvidas e conferir quais opções de compra fazem sentido para você.', ' margin-bottom:24px;') +
    caixaEvento,
  botao: { texto: 'Quero participar do Ofertão', link: '{{LINK_OFERTAO}}', larguraVml: 340 },
  legais: Object.values(EMPREENDIMENTOS).map((e) => e.legal),
  cssMobile: `
      .rdr-datas    { padding:22px 18px 24px 18px !important; }
      .rdr-destaque { font-size:19px !important; line-height:25px !important; }`,
});

gravar('09-feirao-ofertao', '09 · Venha encontrar uma opção para seus planos', [
  { arquivo: 'email.html', rotulo: 'Versão única', html },
]);
