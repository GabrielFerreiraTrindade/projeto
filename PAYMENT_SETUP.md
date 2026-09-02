# Configuração de pagamentos (PneuMinas)

Este documento explica como configurar o gateway de pagamento usado no checkout.
**Não contém nenhuma credencial real** — apenas instruções de onde obter e onde
colocar cada valor.

O checkout inteiro roda dentro do domínio da loja (`/checkout`). O cliente nunca
é redirecionado para uma página externa do gateway — nem no Pix, nem no cartão.

## 1. Arquitetura (para trocar de gateway no futuro)

Toda a integração passa por uma camada de abstração em `src/lib/payment/`:

- `payment-types.ts` — tipos comuns (entrada/saída independentes do gateway).
- `payment-provider.ts` — interface `PaymentProvider` (`createPayment`,
  `getPayment`, `cancelPayment`, `refundPayment`, `processWebhook`) e a fábrica
  `getPaymentProvider()`, que escolhe a implementação pela variável de ambiente
  `PAYMENT_PROVIDER`.
- `providers/pagarme.ts` — cartão de crédito e Pix.
- `providers/payonpag.ts` — só Pix (a API do PayOnPag hoje não documenta
  cartão de crédito — ver seção 9).
- `providers/mercadopago.ts`, `providers/picpay.ts` — apenas esqueleto
  (lançam erro se chamados). Não foram implementados porque a documentação
  oficial de cada um não foi consultada ainda (ver regra do projeto: nunca
  inventar endpoint/parâmetro/resposta de API).

Nenhum código do checkout (`src/app/checkout/`) conhece detalhes do Pagar.me —
ele só fala com `PaymentProvider`. Trocar de gateway no futuro significa:
implementar um novo arquivo em `providers/`, registrá-lo em
`payment-provider.ts`, e mudar `PAYMENT_PROVIDER` no `.env`. O checkout não
precisa ser reescrito.

## 2. Criar a conta no Pagar.me

1. Acesse https://pagar.me e crie uma conta (ou use a conta Stone, que é a
   mesma infraestrutura).
2. No painel, ative o **ambiente de testes (sandbox)** antes de mexer em
   produção — o Pagar.me mantém chaves separadas para teste e produção.
3. Vá em **Configurações → Chaves de API** (o nome exato do menu pode variar
   conforme atualizações do painel).

Você vai precisar de duas chaves:

- **Chave secreta** (`secret key`) — usada apenas no servidor, nunca no
  navegador.
- **Chave pública** (`public key`) — usada no navegador só para tokenizar o
  cartão (transformar o número do cartão em um token, sem que o número chegue
  ao nosso servidor).

## 3. Onde colocar cada variável

Copie `.env.example` para `.env` (se ainda não tiver feito) e preencha:

| Variável | Onde usar | Onde obter |
|---|---|---|
| `PAYMENT_PROVIDER` | Servidor | Deixe `pagarme` |
| `PAGARME_API_KEY` | Servidor (nunca frontend) | Chave secreta do painel Pagar.me |
| `NEXT_PUBLIC_PAGARME_PUBLIC_KEY` | Navegador (tokenização) | Chave pública do painel Pagar.me |
| `PAGARME_WEBHOOK_USER` / `PAGARME_WEBHOOK_PASSWORD` | Servidor | Definidos por você mesmo (ver seção 4) |
| `NEXT_PUBLIC_MAX_INSTALLMENTS` | Navegador (só exibição) | Quantidade de parcelas configurada na sua conta |

**Nunca** commite o `.env` com valores reais. Ele já está no `.gitignore`.

## 4. Configurar o webhook

O Pagar.me confirma pagamentos via webhook — é isso que marca um pedido como
pago de verdade (o frontend nunca decide isso sozinho).

1. No painel Pagar.me, vá em **Configurações → Webhooks**.
2. Cadastre a URL: `https://SEU_DOMINIO/api/webhooks/payment`
   (em desenvolvimento local isso não é alcançável pelo Pagar.me — use uma
   ferramenta de túnel como `ngrok` apontando para `localhost:3000` para testar
   webhooks reais).
3. O Pagar.me autentica webhooks com **HTTP Basic Auth na própria URL**
   (`https://usuario:senha@seudominio/...`) — na documentação atual não existe
   assinatura HMAC para verificação de payload. Defina um usuário/senha fortes
   ali no painel e coloque os mesmos valores em `PAGARME_WEBHOOK_USER` /
   `PAGARME_WEBHOOK_PASSWORD` no `.env`. Isso é o que
   `src/lib/payment/providers/pagarme.ts` valida em `processWebhook`.
4. Assine pelo menos os eventos de pedido (`order.paid`, `order.payment_failed`,
   `order.canceled` ou equivalentes) — os nomes exatos dependem da versão do
   evento configurada no painel.

## 5. Testar o Pix

1. Com `PAGARME_API_KEY` de teste configurada, finalize um pedido escolhendo
   Pix no checkout.
2. O QR code e o código copia-e-cola aparecem na página de sucesso
   (`/pedido/[id]/sucesso`), sem sair do site.
3. No **ambiente de testes** do Pagar.me, existe um mecanismo do próprio
   painel para simular a confirmação de um Pix de teste (verifique a seção de
   sandbox da documentação atual do Pagar.me, pois isso muda com frequência).
4. Ao confirmar, o webhook chega em `/api/webhooks/payment`, o servidor valida
   e marca o pedido como `PAID` — a página de sucesso atualiza sozinha (via
   polling em `/api/orders/[id]/status`), sem precisar recarregar.
5. Para testar expiração, use um Pix de teste e aguarde o tempo configurado em
   `PIX_EXPIRATION_SECONDS` (`src/lib/services/checkout-service.ts`) ou o
   evento de cancelamento do painel.

## 6. Testar o cartão de crédito

1. Com `NEXT_PUBLIC_PAGARME_PUBLIC_KEY` de teste configurada, o formulário de
   cartão do checkout tokeniza os dados diretamente no navegador
   (`src/lib/payment/client/tokenize-card.ts`), chamando a API pública do
   Pagar.me. **Nenhum dado de cartão passa pelo nosso servidor.**
2. Use os **cartões de teste** documentados pelo Pagar.me no painel de sandbox
   (números fictícios que simulam aprovação/recusa). Não use dados de cartão
   reais em ambiente de teste.
3. Parcelas: as opções mostradas no checkout (1x a 12x, configurável via
   `NEXT_PUBLIC_MAX_INSTALLMENTS`) são uma estimativa de exibição — o valor
   final de cada parcela (com ou sem juros) é decidido pela configuração da
   sua conta Pagar.me, confirmada na resposta da própria cobrança.

## 7. Indo para produção

1. Troque `PAGARME_API_KEY` e `NEXT_PUBLIC_PAGARME_PUBLIC_KEY` pelas chaves de
   **produção** (painel Pagar.me, fora do modo sandbox).
2. Recadastre a URL do webhook de produção com um usuário/senha novos (não
   reaproveite os de teste).
3. Confirme com o Pagar.me quais taxas/parcelamento estão habilitados na conta
   de produção antes de anunciar parcelamento ao cliente.

## 9. PayOnPag (Pix)

Alternativa ao Pagar.me, mas **só processa Pix** — a documentação oficial
(`api.payonpag.io/integration/docs/api`) diz literalmente "método de
pagamento (atualmente apenas PIX)". Por isso o checkout desativa a aba de
cartão quando esse provider está ativo (`CARD_PAYMENTS_ENABLED = false` em
`src/app/checkout/step-payment.tsx` — reverta pra `true` só quando o cartão
tiver um gateway real configurado).

1. No painel do PayOnPag, vá em **Integrações → Chaves de API** e gere/copie
   uma chave.
2. Variáveis de ambiente:

   | Variável | Onde usar | Onde obter |
   |---|---|---|
   | `PAYMENT_PROVIDER` | Servidor | `payonpag` |
   | `PAYONPAG_API_SECRET` | Servidor (nunca frontend) | Chave de API do painel |
   | `PAYONPAG_WEBHOOK_SECRET` | Servidor | Qualquer valor aleatório forte, definido por você (ver abaixo) |

3. **Webhook**: o PayOnPag não documenta assinatura de payload nem um
   endpoint de webhook fixo por conta — a URL é enviada por nós em cada
   transação (`webhook_url` no corpo da requisição). Por isso a
   autenticidade é validada embutindo `PAYONPAG_WEBHOOK_SECRET` na própria
   URL (`.../api/webhooks/payment?secret=...`), não por um header do
   PayOnPag — ver `assertWebhookAuthenticity` em
   `src/lib/payment/providers/payonpag.ts`. Não precisa cadastrar nada no
   painel deles pra isso funcionar.
4. Endpoints usados (confirmados na documentação oficial, não inventados):
   `POST /v1/transactions` (criar Pix) e `GET /v1/transactions/{id}`
   (consultar status). **Não existe** endpoint documentado de
   cancelamento/estorno de uma transação específica — só um `/v1/cashout`
   pra sacar saldo da própria conta, que é outra coisa. `cancelPayment` e
   `refundPayment` lançam erro nesse provider.

## 8. Limitações já identificadas (não inventadas, verificadas na documentação)

- **Webhook (Pagar.me)**: o Pagar.me não documenta assinatura HMAC de
  payload; a autenticidade é validada só por Basic Auth na URL do webhook.
  Isso já está implementado assim propositalmente.
- **Webhook (PayOnPag)**: mesma situação, sem assinatura documentada — ver
  seção 9 para como a autenticidade é validada nesse caso (segredo na query
  string da webhook_url).
- **PayOnPag não tem cartão de crédito** nem cancelamento/estorno
  documentados — ver seção 9.
- **Mercado Pago e PicPay**: ainda não têm implementação real — os arquivos em
  `src/lib/payment/providers/mercadopago.ts` e `picpay.ts` lançam erro se
  usados. Antes de ativá-los, é necessário consultar a documentação oficial de
  cada um (endpoints, tokenização, formato de webhook), o que não foi feito
  ainda.
