-- Registro de Títulos: banco, regras de acesso e pasta de anexos.
-- Rode tudo de uma vez no Supabase: SQL Editor → New query → cole este arquivo → Run.
-- Pode rodar de novo sem problema (só cria o que faltar).

-- ---------- perfis (quem é quem) ----------
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  email text not null default '',
  papel text not null default 'leitor' check (papel in ('leitor', 'academico', 'admin')),
  criado_em timestamptz not null default now()
);

-- Todo usuário novo vira "leitor" automaticamente.
create or replace function public.novo_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.novo_perfil();

-- Perfis de quem já existia antes deste script.
insert into public.perfis (id, nome, email)
select id, split_part(email, '@', 1), email from auth.users
on conflict (id) do nothing;

create or replace function public.meu_papel()
returns text language sql stable security definer set search_path = public as $$
  select papel from public.perfis where id = auth.uid()
$$;

create or replace function public.pode_editar()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_papel() in ('academico', 'admin'), false)
$$;

-- ---------- registros (informações por país) ----------
create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  pais text not null,
  categoria text not null default 'informacao'
    check (categoria in ('informacao', 'documento', 'resposta_orgao', 'andamento_aluno')),
  titulo text not null check (length(titulo) between 1 and 200),
  conteudo text not null default '',
  autor_id uuid references auth.users (id) on delete set null default auth.uid(),
  autor_nome text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists registros_pais on public.registros (pais, criado_em desc);

-- ---------- anexos (arquivos de cada registro) ----------
create table if not exists public.anexos (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references public.registros (id) on delete cascade,
  pais text not null,
  nome text not null,
  caminho text not null unique,
  tamanho bigint not null default 0,
  tipo text not null default '',
  autor_id uuid references auth.users (id) on delete set null default auth.uid(),
  criado_em timestamptz not null default now()
);
create index if not exists anexos_registro on public.anexos (registro_id);

-- ---------- regras de acesso ----------
-- Quem entrou com login vê tudo; só Acadêmico e admin criam, editam e apagam.
alter table public.perfis enable row level security;
alter table public.registros enable row level security;
alter table public.anexos enable row level security;

drop policy if exists "perfis: ver" on public.perfis;
create policy "perfis: ver" on public.perfis for select to authenticated using (true);
drop policy if exists "perfis: admin altera" on public.perfis;
create policy "perfis: admin altera" on public.perfis for update to authenticated
  using (public.meu_papel() = 'admin') with check (public.meu_papel() = 'admin');

drop policy if exists "registros: ver" on public.registros;
create policy "registros: ver" on public.registros for select to authenticated using (true);
drop policy if exists "registros: criar" on public.registros;
create policy "registros: criar" on public.registros for insert to authenticated with check (public.pode_editar());
drop policy if exists "registros: editar" on public.registros;
create policy "registros: editar" on public.registros for update to authenticated
  using (public.pode_editar()) with check (public.pode_editar());
drop policy if exists "registros: apagar" on public.registros;
create policy "registros: apagar" on public.registros for delete to authenticated using (public.pode_editar());

drop policy if exists "anexos: ver" on public.anexos;
create policy "anexos: ver" on public.anexos for select to authenticated using (true);
drop policy if exists "anexos: criar" on public.anexos;
create policy "anexos: criar" on public.anexos for insert to authenticated with check (public.pode_editar());
drop policy if exists "anexos: apagar" on public.anexos;
create policy "anexos: apagar" on public.anexos for delete to authenticated using (public.pode_editar());

-- Ninguém muda o próprio papel nem o autor de um registro pela página.
create or replace function public.protege_campos()
returns trigger language plpgsql as $$
begin
  if tg_table_name = 'registros' then
    new.autor_id := old.autor_id;
    new.autor_nome := old.autor_nome;
    new.criado_em := old.criado_em;
    new.atualizado_em := now();
  end if;
  return new;
end $$;
drop trigger if exists protege_registros on public.registros;
create trigger protege_registros before update on public.registros
  for each row execute function public.protege_campos();

-- Nome do autor sempre vem do perfil de quem está logado.
create or replace function public.preenche_autor()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.autor_id := auth.uid();
  new.autor_nome := coalesce((select nome from public.perfis where id = auth.uid()), '');
  return new;
end $$;
drop trigger if exists autor_registros on public.registros;
create trigger autor_registros before insert on public.registros
  for each row execute function public.preenche_autor();

-- ---------- pasta de arquivos (privada) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('anexos', 'anexos', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "anexos storage: ver" on storage.objects;
create policy "anexos storage: ver" on storage.objects for select to authenticated
  using (bucket_id = 'anexos');
drop policy if exists "anexos storage: enviar" on storage.objects;
create policy "anexos storage: enviar" on storage.objects for insert to authenticated
  with check (bucket_id = 'anexos' and public.pode_editar());
drop policy if exists "anexos storage: apagar" on storage.objects;
create policy "anexos storage: apagar" on storage.objects for delete to authenticated
  using (bucket_id = 'anexos' and public.pode_editar());

-- ---------- depois de criar a sua conta ----------
-- Troque o e-mail abaixo pelo seu e rode só esta linha para virar administrador:
-- update public.perfis set papel = 'admin' where email = 'seu-email@exemplo.com';


-- ---------- especialidade de cada envio (27/10/2026) ----------
alter table public.registros add column if not exists especialidade text
  check (especialidade is null or especialidade in ('IMPL', 'PERIO', 'PROT', 'ODONTOP', 'ENDO', 'ORTO', 'DENT', 'AOF'));
create index if not exists registros_especialidade on public.registros (pais, especialidade);
-- Registros antigos: reconhece a especialidade pelo título.
update public.registros set especialidade = case
  when titulo ~* 'odontop|odontoped|pediatr' then 'ODONTOP'
  when titulo ~* 'implant|\mimpl\M' then 'IMPL'
  when titulo ~* 'periodont|\mperio\M' then 'PERIO'
  when titulo ~* 'pr[oó]tese|\mprot\M' then 'PROT'
  when titulo ~* 'endodont|\mendo\M' then 'ENDO'
  when titulo ~* 'ortodont|\morto\M' then 'ORTO'
  when titulo ~* 'dent[ií]stica|\mdent\M' then 'DENT'
  when titulo ~* '\maof\M|orofacial' then 'AOF'
end
where especialidade is null;

-- ---------- títulos convalidados de alunos (27/10/2026) ----------
-- Cada diploma convalidado enviado conta como um aluno no Painel.
alter table public.registros drop constraint if exists registros_categoria_check;
alter table public.registros add constraint registros_categoria_check
  check (categoria in ('titulo_convalidado', 'informacao', 'documento', 'resposta_orgao', 'andamento_aluno'));
update public.registros set categoria = 'titulo_convalidado' where titulo ~* 'convalidad';
