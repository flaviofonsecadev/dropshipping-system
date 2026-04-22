# Integração Asaas: Contas (Fornecedor/Revendedor) + Split Automático Spec

## Why
Para que o split funcione na prática, o sistema precisa ter as credenciais/identificadores corretos das contas Asaas do fornecedor (principal) e dos revendedores (subcontas ou contas existentes), e usar esses dados para emitir cobranças com split na hora da venda.

## What Changes
- Criar um fluxo de configuração do Asaas:
  - Fornecedor: configurar a conta principal (API Key e walletId).
  - Revendedor: criar subconta via API **ou** conectar uma conta Asaas existente; em ambos os casos salvar walletId e credenciais necessárias.
- Persistir dados do Asaas por usuário (supplier e reseller) de forma segura.
- Atualizar o checkout para criar cobrança no Asaas com split:
  - custo do produto + envio -> fornecedor
  - lucro -> revendedor (ficando como “saldo remanescente” na conta emissora)

## Impact
- Affected specs: checkout/pedidos, configuração do revendedor/fornecedor, integração Asaas, segurança de credenciais
- Affected code: dashboard supplier/reseller (settings), API routes de checkout, utilitários server-side de integração Asaas
- Affected data: novas colunas/tabelas para armazenar `walletId`, `accountId` e API keys (criptografadas)

## ADDED Requirements
### Requirement: Armazenamento seguro de credenciais
O sistema SHALL armazenar credenciais do Asaas (API key) apenas de forma criptografada no banco e SHALL usar uma chave de criptografia no servidor para criptografar/descriptografar.

#### Scenario: Proteger segredo (sucesso)
- **WHEN** uma API key é salva
- **THEN** o valor persistido no banco não pode estar em texto puro e não pode ser retornado pela UI.

### Requirement: Fornecedor configura conta principal
O sistema SHALL permitir que o fornecedor configure a conta Asaas principal informando API key.
O sistema SHALL validar a API key consultando o walletId no Asaas e salvar:
- `asaas_api_key_encrypted`
- `asaas_wallet_id`
- `asaas_env` (sandbox/production) quando aplicável

#### Scenario: Configurar com sucesso
- **WHEN** o fornecedor salva a API key válida
- **THEN** o sistema armazena a key criptografada e o walletId retornado, e exibe status “Conectado”.

### Requirement: Revendedor cria subconta via plataforma
O sistema SHALL permitir que o revendedor crie uma subconta Asaas vinculada à conta principal do fornecedor via API.
- O sistema SHALL coletar os dados obrigatórios exigidos pelo endpoint de criação de subconta.
- O sistema SHALL salvar o `accountId`, `walletId` e a `apiKey` retornada (criptografada), pois não é recuperável posteriormente.

#### Scenario: Criar subconta (sucesso)
- **WHEN** o revendedor preenche os dados e confirma
- **THEN** a subconta é criada e o revendedor fica com status “Conta criada e conectada”.

### Requirement: Revendedor conecta conta Asaas existente
O sistema SHALL permitir que o revendedor conecte uma conta Asaas existente informando sua API key.
- O sistema SHALL consultar o walletId e salvar `asaas_wallet_id` e `asaas_api_key_encrypted`.

#### Scenario: Conectar conta existente (sucesso)
- **WHEN** o revendedor informa uma API key válida
- **THEN** o walletId é obtido e a conta fica com status “Conectado”.

### Requirement: Split de pagamento na venda
O sistema SHALL criar a cobrança na conta do revendedor e configurar o split para repassar ao fornecedor um valor fixo equivalente a:
- soma dos custos base dos itens
- + frete/envio calculado
O lucro do revendedor SHALL ser a diferença líquida que permanecer na conta emissora da cobrança.

#### Scenario: Venda com split (sucesso)
- **WHEN** uma compra é iniciada na loja pública do revendedor
- **THEN** o sistema cria uma cobrança no Asaas usando a API key do revendedor e configura o split para o `walletId` do fornecedor com `fixedValue` = custo+envio.

#### Scenario: Pré-condições inválidas (falha)
- **WHEN** faltar walletId/API key do fornecedor ou do revendedor
- **THEN** o checkout deve falhar com mensagem clara e sem vazar segredos.

## MODIFIED Requirements
### Requirement: Checkout Asaas atual (simulado)
O endpoint de checkout do Asaas SHALL deixar de ser apenas simulação e SHALL suportar modo sandbox/produção, com criação real de cobrança e split quando configurado.

## REMOVED Requirements
### Requirement: Split com placeholders
**Reason**: Precisamos usar `walletId` reais e credenciais reais.
**Migration**: Introduzir telas de configuração e persistência de dados, e atualizar o checkout para consumir esses dados.

