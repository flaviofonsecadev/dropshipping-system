# Tasks
- [x] Task 1: Banco de Dados e Storage
  - [x] SubTask 1.1: Criar migration no Supabase para alterar a tabela `products` (remover a coluna `image_url`, adicionar colunas `images TEXT[] NOT NULL DEFAULT '{}'` e `videos TEXT[]`).
  - [x] SubTask 1.2: Atualizar os tipos gerados (`types.ts` ou Database definitions) no frontend para refletir as colunas `images` e `videos`.
  - [x] SubTask 1.3: Criar o bucket público `product-media` no Supabase Storage.
  - [x] SubTask 1.4: Configurar Políticas RLS no bucket `product-media` permitindo que apenas Supplier e Admin façam insert/update/delete e que todos possam ler (select).

- [x] Task 2: Componente de Upload e Links Externos
  - [x] SubTask 2.1: Criar um componente de Formulário de Mídias (`ProductMediaForm`) que aceite até 5 imagens. O usuário deve poder colar URLs ou fazer upload direto para o Supabase.
  - [x] SubTask 2.2: Adicionar campo opcional para 1 vídeo. O usuário deve poder colar URL (ex: YouTube, Vimeo, Drive) ou fazer upload.
  - [x] SubTask 2.3: Implementar validação de tamanho para os uploads diretos (Máx 2MB por imagem, 15MB por vídeo).
  - [x] SubTask 2.4: Mostrar preview local das imagens adicionadas (seja por link ou upload) e permitir removê-las antes de salvar.

- [x] Task 3: Criação/Edição de Produto (Fornecedor)
  - [x] SubTask 3.1: Atualizar o formulário em `/supplier/products/new` para integrar os dados do produto (nome, custo, margem, frete) com as mídias (arrays `images` e `videos`).
  - [x] SubTask 3.2: Lidar com upload dos arquivos para o bucket `product-media` no frontend (via Supabase JS) e resgatar as URLs públicas.
  - [x] SubTask 3.3: Implementar a Server Action `createProductAction` (e `updateProductAction` futuramente) para receber os arrays de URLs e salvar na tabela `products`.

- [x] Task 4: Atualização da Listagem Interna do Catálogo
  - [x] SubTask 4.1: Atualizar o painel de produtos do Fornecedor (`/supplier/products`) para usar a primeira imagem do array (`images[0]`) como capa do item (thumbnail).
  - [x] SubTask 4.2: Atualizar o Catálogo do Revendedor (`/reseller/store` e `/reseller/products`) para também usar a primeira imagem (`images[0]`) como capa na listagem.

- [x] Task 5: Página de Detalhes e Edição de Produto
  - [x] SubTask 5.1: Criar/Atualizar a página de Detalhes ou a modal de Edição do produto (`/supplier/products/[id]` e afins) para permitir que o usuário veja as demais imagens além da capa.
  - [x] SubTask 5.2: Adicionar um player ou link clicável para o vídeo cadastrado (seja via upload no storage ou link do YouTube/Vimeo) nas telas de detalhes.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]