# Tasks
- [x] Task 1: Revisar fluxo de autenticação (login e criar conta)
  - [x] SubTask 1.1: Auditar `loginAction` e `signupAction` para padronizar retorno de estado (erro/sucesso/pendente).
  - [x] SubTask 1.2: Ajustar a tela `/login` para exibir feedback claro por ação sem conflito entre botões.
  - [x] SubTask 1.3: Validar comportamento de `formAction` nos botões para evitar erros de submit.

- [x] Task 2: Implementar regra de autorização por role nas rotas
  - [x] SubTask 2.1: Revisar `middleware` para redirecionar usuário não autenticado para `/login`.
  - [x] SubTask 2.2: Aplicar mapeamento de acesso por role (`supplier`, `reseller`, `admin`) com fallback seguro.
  - [x] SubTask 2.3: Garantir redirecionamento pós-login para rota inicial correta por role.

- [x] Task 3: Atualizar navegação, nomenclatura e visualização
  - [x] SubTask 3.1: Levantar lista de labels atuais de menu, títulos e botões nas áreas Supplier/Reseller.
  - [x] SubTask 3.2: Aplicar renomeações aprovadas para navegação principal e ações prioritárias.
  - [x] SubTask 3.3: Harmonizar títulos/CTAs e consistência visual entre telas principais.

- [x] Task 4: Verificação funcional e técnica
  - [x] SubTask 4.1: Executar lint e build para validar tipagem e integridade.
  - [x] SubTask 4.2: Testar manualmente cenários de login, cadastro e acesso por role.
  - [x] SubTask 4.3: Confirmar que labels e botões atualizados aparecem corretamente em desktop e mobile.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] can run in parallel with [Task 2.3] after definição de labels
- [Task 4] depends on [Task 1]
- [Task 4] depends on [Task 2]
- [Task 4] depends on [Task 3]
