# Registro de Títulos (UniCPO)

Site que junta o conteúdo do Google Sites "REGISTRO DE TÍTULOS" (6 países com guia completo) com o PDF "Convalidação" (21 países).
O Acadêmico adiciona informações e anexos em cada país, e o restante da UniCPO vê e baixa.

## Quem pode o quê
| Permissão | Vê o guia público | Vê informações e anexos | Adiciona, edita e apaga |
|---|---|---|---|
| Sem login | sim | não | não |
| Leitura | sim | sim | não |
| Acadêmico | sim | sim | sim |
| Administrador | sim | sim | sim, e muda as permissões da equipe |

O guia de cada país (órgão, requisitos, perguntas) continua aberto. A aba **Documentos e atualizações** só aparece para quem entra com login.

## Ligar o banco de dados (Supabase, grátis): fazer uma vez
1. Crie uma conta em **supabase.com** (pode entrar com o GitHub ou e-mail) e clique em **New project**.
   Nome: `registro-titulos`. Anote a senha do banco. Região: **South America (São Paulo)**.
2. No projeto, abra **SQL Editor → New query**, cole todo o arquivo **supabase.sql** e clique em **Run**.
3. Em **Authentication → Sign In / Providers**, desligue **Allow new users to sign up**. Assim só entra quem for convidado.
4. Em **Authentication → Users → Add user → Send invitation**, convide o seu e-mail.
   Abra o convite no e-mail e crie a sua senha.
5. Volte ao **SQL Editor** e rode a linha abaixo com o seu e-mail para virar administrador:
   ```sql
   update public.perfis set papel = 'admin' where email = 'seu-email@exemplo.com';
   ```
6. Em **Project Settings → API** (ou no botão **Connect**), copie a **Project URL** e a chave **publishable** (ou **anon public**).
   Cole as duas no arquivo **config.js**. Nunca use a chave *secret*/*service_role*.

## Depois de publicar o site
- Em **Authentication → URL Configuration**, coloque o endereço do site em **Site URL**. Os links de convite e de troca de senha abrem nesse endereço.
- Para cadastrar alguém: **Authentication → Users → Send invitation**. A pessoa entra como **Leitura**.
- Para tornar alguém **Acadêmico**: entre no site como administrador, clique no seu ícone (canto superior direito) e abra **Equipe e permissões**.

## Ver no computador
Dê dois cliques em **Abrir site.bat**, ou abra o `index.html` direto no navegador.

## Atualizar o guia de cada país
O conteúdo fixo (situação, especialidades, órgão, requisitos e perguntas) fica em **data.js**.
A data do rodapé é a linha `ATUALIZADO_EM`.
O que o Acadêmico adiciona pelo site fica no Supabase e não precisa mexer em arquivo nenhum.

## Publicar (grátis)
- **Netlify Drop:** acesse app.netlify.com/drop e arraste esta pasta. Ele gera um link público na hora.
- **GitHub Pages:** suba a pasta em um repositório e ative o Pages.
- **Dentro do Google Sites:** depois de publicado, use Inserir → Incorporar → URL com o link do site.

## Limites do plano grátis do Supabase
- 1 GB de arquivos e 500 MB de banco. Os anexos podem ter até 50 MB cada.
- O projeto grátis **pausa depois de 7 dias sem nenhum acesso**. Basta abrir o painel do Supabase e clicar em **Restore** (os dados não se perdem).

O formulário "Enviar pergunta" é o mesmo Google Forms do site antigo, então as respostas continuam chegando no mesmo lugar.
