# Catálogo de Produtos e Mídias Spec

## Why
O fornecedor precisa cadastrar produtos de forma profissional no sistema, incluindo múltiplas imagens e a possibilidade de adicionar vídeo, fornecendo material rico para que os revendedores possam vender.

## Limites e Custos de Storage (Supabase Free vs Pro)
A hospedagem de imagens e vídeos no próprio banco de dados consome duas métricas: **Storage** (espaço em disco) e **Bandwidth** (banda de transferência/download).

- **Plano Gratuito (Free):** 1 GB de Storage e 2 GB de Bandwidth mensal.
- **Plano Pago (Pro - $25/mês):** 5 GB de Storage e 50 GB de Bandwidth.
  - Custo Adicional Storage: $0.021 por GB.
  - Custo Adicional Bandwidth: $0.09 por GB.

**Cálculo de Consumo Estimado:**
- Se o Fornecedor cadastrar **1.000 produtos** fazendo upload direto no Supabase (estimando 5 fotos otimizadas = 5MB + 1 vídeo = 15MB, total 20MB por produto):
  - **Storage:** 20.000 MB (20 GB). O plano Pro cobre 5 GB, os 15 GB extras custariam ~$0.31 centavos. Custo total do mês = $25.31.
  - **Bandwidth (O verdadeiro gargalo):** Se a loja escalar e esses vídeos de 15MB forem assistidos 1.000 vezes por dia pelos clientes finais, o consumo será de 15 GB/dia (450 GB/mês). O plano Pro cobre 50 GB, os 400 GB extras custariam ~$36.00/mês só em banda.

**Estratégia Adotada:**
Para evitar altos custos de infraestrutura e otimizar a plataforma, a adição de mídias será **híbrida**. O Fornecedor poderá:
1. Fazer o upload do arquivo diretamente (com limites: Imagem máx 2MB, Vídeo máx 15MB).
2. Ou **colar um link externo** (Ex: link do YouTube, Vimeo, Google Drive, Imgur, Cloudinary) para imagens e vídeos, zerando o custo de Storage e Bandwidth no Supabase.

## What Changes
- Atualização da tabela `products` no banco de dados para suportar arrays de URLs de imagens e vídeos (`images text[]`, `videos text[]`), removendo a antiga coluna única `image_url`.
- Criação de um formulário de mídias no cadastro/edição de produtos (`/supplier/products/new`).
- O Catálogo interno (listagem) do Fornecedor e Revendedor será mantido simples, exibindo apenas a foto de capa. Ao abrir os detalhes ou a edição do produto, todas as fotos e o vídeo poderão ser visualizados. A vitrine da Loja Final (onde o cliente do revendedor comprará) terá uma visualização ainda mais rica futuramente.
- **BREAKING**: A coluna `image_url` será removida da tabela `products`.

## Impact
- Affected specs: `init-dropshipping-system`, `precificacao-split-asaas`
- Affected code:
  - `supabase/migrations/` (Nova migration)
  - `src/app/supplier/products/` (Form de criação com URLs/Upload)
  - `src/app/reseller/products/` e `src/app/reseller/store/` (Catálogo Interno Simplificado)

## ADDED Requirements
### Requirement: Cadastro de Mídias Híbrido
O sistema DEVE permitir que o fornecedor adicione mídias para o produto.
- **Regra de Quantidade:** O sistema permite **até no máximo 5 imagens** e o **vídeo é opcional** (máximo 1).
- **Regra de Fonte:** O usuário pode escolher fazer upload do arquivo ou colar a URL externa.
- **Regra de Tamanho (Upload):** O sistema DEVE bloquear o upload de arquivos de imagem > 2MB e vídeos > 15MB no frontend.

#### Scenario: Sucesso no Cadastro com Links e Uploads
- **WHEN** o fornecedor insere 3 links externos de fotos, faz upload de 1 foto e insere 1 link do YouTube.
- **THEN** o sistema salva a URL do upload e os links externos nos arrays `images` e `videos` do banco de dados.

## MODIFIED Requirements
### Requirement: Visualização Interna de Produtos
O catálogo interno do Fornecedor e do Revendedor (tela de listagem/grid) DEVE exibir apenas a primeira imagem do array `images` como miniatura/capa do produto. Ao acessar a tela de **detalhes** ou **edição** do produto, o sistema DEVE permitir a visualização de todas as fotos cadastradas e a exibição ou link do vídeo anexado.