# Instruções do Projeto

Este arquivo contém regras persistentes para o assistente de IA.

## Diretrizes de Comunicação
- **Seja Conciso**: Evite introduções longas, avisos repetitivos sobre tecnologias que já estão em uso (como Vite, Tailwind, etc.) e explicações que já foram dadas em turnos anteriores.
- **Ação sobre Explicação**: Priorize a implementação do código. Só explique o "porquê" se for uma mudança estrutural complexa ou se houver um erro crítico.

## Gerenciamento de Banco de Dados (Supabase)
- **Evite SQL Duplicado**: Antes de sugerir qualquer comando SQL para o painel do Supabase, verifique o arquivo `supabase_setup.sql` no diretório raiz para entender o esquema atual.
- **Incrementalismo**: Apenas sugira novos campos ou tabelas que ainda não existam.
- **Nomenclatura**: Siga o padrão de snake_case para tabelas e colunas.

## Padrões de Código
- **React**: Use componentes funcionais e hooks.
- **Tailwind**: Continue usando utilitários do Tailwind para o design.
- **Gerenciamento de Estado**: O projeto utiliza Context API (`BankrollContext.tsx`) para o estado global das bancas.
