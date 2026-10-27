// Parte colaborativa: login, informações e anexos por país (Supabase).
// Quem entra vê tudo; só o Acadêmico (e o admin) adiciona, edita e apaga.
(() => {
  const BUCKET = "anexos";
  const MAX_MB = 50;
  const CATEGORIAS = {
    informacao: "Informação",
    documento: "Documento / modelo",
    resposta_orgao: "Resposta de órgão",
    andamento_aluno: "Andamento de aluno",
  };
  const PAPEIS = { leitor: "Visualizador", academico: "Acadêmico", admin: "Administrador" };
  const PAPEIS_DESC = {
    admin: "Vê, adiciona, edita e apaga; convida e remove pessoas",
    academico: "Vê, adiciona, edita e apaga informações e anexos",
    leitor: "Só vê e baixa",
  };

  const configurado = Boolean(window.SUPABASE_URL && window.SUPABASE_KEY && window.supabase);
  // Links de convite e de nova senha chegam com "#access_token=...&type=invite|recovery".
  // A biblioteca do Supabase apaga isso do endereço ao iniciar, então guardamos antes de criar o cliente.
  const tipoLink = /[#&]type=(invite|recovery|signup|magiclink)/.exec(location.hash)?.[1] || null;
  const sb = configurado ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
  let usuario = null; // { id, email, nome, papel }
  let contagens = {}; // pais -> nº de registros
  const ouvintes = [];

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // Texto livre: escapa tudo e só depois transforma links e quebras de linha.
  const textoRico = (s) => esc(s).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`).replace(/\n/g, "<br>");
  const data = (d) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const tamanho = (b) => (b > 1048576 ? (b / 1048576).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
  const podeEditar = () => ["academico", "admin"].includes(usuario?.papel);
  const avisar = () => ouvintes.forEach((f) => f());

  // ---------- sessão ----------
  async function carregarUsuario(session) {
    if (!session?.user) {
      usuario = null;
      return;
    }
    const { data: perfil } = await sb.from("perfis").select("nome, papel").eq("id", session.user.id).maybeSingle();
    usuario = { id: session.user.id, email: session.user.email, nome: perfil?.nome || session.user.email, papel: perfil?.papel || "leitor" };
  }

  async function carregarContagens() {
    contagens = {};
    if (!usuario) return;
    const { data: linhas } = await sb.from("registros").select("pais");
    for (const r of linhas || []) contagens[r.pais] = (contagens[r.pais] || 0) + 1;
  }

  async function iniciar() {
    if (!sb) return;
    const erroLink = /error_description=([^&]+)/.exec(location.hash)?.[1];
    const { data: s } = await sb.auth.getSession();
    await carregarUsuario(s.session);
    await carregarContagens();
    if (/access_token|error_description/.test(location.hash)) history.replaceState(null, "", location.pathname + "#/");
    if (erroLink) {
      alert("Esse link não vale mais (expirou ou já foi usado). Peça um link novo ao administrador.");
    } else if (tipoLink && usuario) {
      definirSenha(tipoLink === "recovery" ? "Crie uma nova senha" : "Bem-vindo! Crie sua senha", true);
    }
    sb.auth.onAuthStateChange(async (evento, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(evento)) return;
      await carregarUsuario(session);
      await carregarContagens();
      desenharConta();
      avisar();
    });
    desenharConta();
  }

  // ---------- topo: entrar / usuário ----------
  function desenharConta() {
    const el = document.getElementById("conta");
    if (!el) return;
    if (!configurado) return (el.innerHTML = "");
    if (!usuario) {
      el.innerHTML = `<button class="btn-sec" id="btnEntrar">Entrar</button>`;
      el.querySelector("#btnEntrar").onclick = () => entrar();
      return;
    }
    el.innerHTML = `
      <details class="menu-conta">
        <summary title="${esc(usuario.email)}"><span class="avatar">${esc(usuario.nome[0]?.toUpperCase() || "?")}</span></summary>
        <div class="menu">
          <b>${esc(usuario.nome)}</b>
          <small>${esc(usuario.email)} · ${PAPEIS[usuario.papel]}</small>
          ${usuario.papel === "admin" ? `<a href="#/equipe">Equipe e permissões</a>` : ""}
          <a href="#/atualizacoes">Últimas atualizações</a>
          <button id="btnSenha">Trocar senha</button>
          <button id="btnSair">Sair</button>
        </div>
      </details>`;
    el.querySelector("#btnSair").onclick = () => sb.auth.signOut();
    el.querySelector("#btnSenha").onclick = () => definirSenha("Trocar senha");
    el.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => el.querySelector("details").removeAttribute("open")));
  }

  // ---------- janelas (login, senha, edição) ----------
  function janela(html, aoAbrir, fixa = false) {
    const fundo = document.createElement("div");
    fundo.className = "modal-fundo";
    fundo.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    const fechar = () => fundo.remove();
    if (!fixa) {
      fundo.addEventListener("mousedown", (e) => e.target === fundo && fechar());
      fundo.addEventListener("keydown", (e) => e.key === "Escape" && fechar());
    }
    fundo.querySelectorAll("[data-fechar]").forEach((b) => (b.onclick = fechar));
    document.body.appendChild(fundo);
    fundo.querySelector("input, textarea, select, button")?.focus();
    aoAbrir?.(fundo.querySelector(".modal"), fechar);
    return fechar;
  }

  function entrar() {
    janela(
      `<h2>Entrar</h2>
       <p class="muted">Use o e-mail e a senha do convite que você recebeu.</p>
       <form id="fLogin">
         <label>E-mail<input type="email" name="email" required autocomplete="username"></label>
         <label>Senha<input type="password" name="senha" required autocomplete="current-password"></label>
         <p class="erro" hidden></p>
         <div class="acoes-form">
           <button type="button" class="link" id="esqueci">Esqueci a senha</button>
           <button type="button" class="btn-sec" data-fechar>Cancelar</button>
           <button class="btn">Entrar</button>
         </div>
       </form>`,
      (m, fechar) => {
        const f = m.querySelector("form");
        const erro = m.querySelector(".erro");
        f.onsubmit = async (e) => {
          e.preventDefault();
          ocupado(f, true);
          const { error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.senha.value });
          ocupado(f, false);
          if (error) return mostrarErro(erro, /invalid/i.test(error.message) ? "E-mail ou senha incorretos." : error.message);
          fechar();
        };
        m.querySelector("#esqueci").onclick = async () => {
          if (!f.email.value.trim()) return mostrarErro(erro, "Digite seu e-mail acima e clique de novo.");
          const { error } = await sb.auth.resetPasswordForEmail(f.email.value.trim(), { redirectTo: location.origin + location.pathname });
          mostrarErro(erro, error ? error.message : "Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.", !error);
        };
      }
    );
  }

  // obrigatoria: veio de convite/link de nova senha; a janela só fecha depois de salvar.
  function definirSenha(titulo, obrigatoria = false) {
    janela(
      `<h2>${esc(titulo)}</h2>
       ${obrigatoria ? `<p class="muted">Crie a senha que você vai usar para entrar no site (mínimo de 8 caracteres).</p>` : ""}
       <form>
         <label>Nova senha<input type="password" name="senha" minlength="8" required autocomplete="new-password"></label>
         <label>Repita a senha<input type="password" name="senha2" minlength="8" required autocomplete="new-password"></label>
         <p class="erro" hidden></p>
         <div class="acoes-form">${obrigatoria ? "" : `<button type="button" class="btn-sec" data-fechar>Cancelar</button>`}<button class="btn">Salvar senha</button></div>
       </form>`,
      (m, fechar) => {
        const f = m.querySelector("form");
        f.onsubmit = async (e) => {
          e.preventDefault();
          if (f.senha.value !== f.senha2.value) return mostrarErro(m.querySelector(".erro"), "As senhas não são iguais.");
          ocupado(f, true);
          const { error } = await sb.auth.updateUser({ password: f.senha.value });
          ocupado(f, false);
          if (error) return mostrarErro(m.querySelector(".erro"), /should be different/i.test(error.message) ? "A senha nova precisa ser diferente da anterior." : error.message);
          fechar();
          if (obrigatoria) alert("Senha criada! A partir de agora entre com o seu e-mail e essa senha.");
        };
      },
      obrigatoria
    );
  }

  function mostrarErro(el, texto, ok = false) {
    el.hidden = false;
    el.textContent = texto;
    el.classList.toggle("ok", ok);
  }
  function ocupado(form, sim) {
    form.querySelectorAll("button, input, textarea, select").forEach((x) => (x.disabled = sim));
  }

  // ---------- aba "Documentos e atualizações" de um país ----------
  async function desenharAba(pais, el) {
    if (!configurado) {
      el.innerHTML = `<p class="muted">A área de documentos ainda não foi ligada ao banco de dados. Veja o passo a passo no LEIA-ME.</p>`;
      return;
    }
    if (!usuario) {
      el.innerHTML = `<div class="trava"><p>Os documentos e atualizações deste país são internos da UniCPO.</p><button class="btn" id="entrarAba">Entrar para ver</button></div>`;
      el.querySelector("#entrarAba").onclick = entrar;
      return;
    }
    el.innerHTML = `<p class="muted">Carregando…</p>`;
    const { data: regs, error } = await sb
      .from("registros")
      .select("id, categoria, titulo, conteudo, autor_nome, criado_em, atualizado_em, anexos (id, nome, caminho, tamanho, tipo, criado_em)")
      .eq("pais", pais.id)
      .order("criado_em", { ascending: false });
    if (error) {
      el.innerHTML = `<p class="erro">Não consegui carregar: ${esc(error.message)}</p>`;
      return;
    }
    contagens[pais.id] = regs.length;
    const aba = document.querySelector('.abas [data-aba="documentos"]');
    if (aba) aba.textContent = `Documentos e atualizações${regs.length ? ` (${regs.length})` : ""}`;
    el.innerHTML = `
      ${podeEditar() ? `<div class="barra-reg"><p class="muted">${regs.length ? `${regs.length} ${regs.length === 1 ? "registro" : "registros"}` : ""}</p><button class="btn" id="novoReg">+ Adicionar informação ou anexo</button></div>` : ""}
      ${
        regs.length
          ? `<div class="regs">${regs.map((r) => cartaoRegistro(r)).join("")}</div>`
          : `<div class="vazio">Nenhuma informação ou anexo de ${esc(pais.nome)} ainda.${podeEditar() ? " Clique em “Adicionar” para começar." : ""}</div>`
      }`;

    el.querySelector("#novoReg")?.addEventListener("click", () => editarRegistro(pais, null, () => desenharAba(pais, el)));
    el.querySelectorAll("[data-editar]").forEach((b) =>
      b.addEventListener("click", () => editarRegistro(pais, regs.find((r) => r.id === b.dataset.editar), () => desenharAba(pais, el)))
    );
    el.querySelectorAll("[data-apagar]").forEach((b) =>
      b.addEventListener("click", async () => {
        const r = regs.find((x) => x.id === b.dataset.apagar);
        if (!confirm(`Apagar "${r.titulo}" e ${r.anexos.length} anexo(s)? Não dá para desfazer.`)) return;
        if (r.anexos.length) await sb.storage.from(BUCKET).remove(r.anexos.map((a) => a.caminho));
        const { error: e } = await sb.from("registros").delete().eq("id", r.id);
        if (e) return alert("Não consegui apagar: " + e.message);
        contagens[pais.id] = Math.max(0, (contagens[pais.id] || 1) - 1);
        desenharAba(pais, el);
      })
    );
    el.querySelectorAll("[data-baixar]").forEach((a) => a.addEventListener("click", (e) => (e.preventDefault(), baixar(a.dataset.baixar, a.dataset.nome))));
  }

  function cartaoRegistro(r) {
    const editado = new Date(r.atualizado_em) - new Date(r.criado_em) > 60000;
    return `
      <article class="reg">
        <header>
          <span class="cat cat-${r.categoria}">${CATEGORIAS[r.categoria] || r.categoria}</span>
          <h3>${esc(r.titulo)}</h3>
          ${
            podeEditar()
              ? `<div class="reg-acoes"><button class="link" data-editar="${r.id}">Editar</button><button class="link perigo" data-apagar="${r.id}">Apagar</button></div>`
              : ""
          }
        </header>
        ${r.conteudo ? `<p class="reg-texto">${textoRico(r.conteudo)}</p>` : ""}
        ${
          r.anexos.length
            ? `<ul class="anexos">${r.anexos
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map(
                  (a) => `<li><a href="#" data-baixar="${esc(a.caminho)}" data-nome="${esc(a.nome)}">
                    <span class="ext">${esc((a.nome.split(".").pop() || "arq").slice(0, 4).toUpperCase())}</span>
                    <span class="anexo-nome">${esc(a.nome)}</span><small>${tamanho(a.tamanho)}</small></a></li>`
                )
                .join("")}</ul>`
            : ""
        }
        <footer>${esc(r.autor_nome || "—")} · ${data(r.criado_em)}${editado ? ` · editado ${data(r.atualizado_em)}` : ""}</footer>
      </article>`;
  }

  async function baixar(caminho, nome) {
    const { data: d, error } = await sb.storage.from(BUCKET).createSignedUrl(caminho, 300);
    if (error) return alert("Não consegui abrir o arquivo: " + error.message);
    window.open(d.signedUrl, "_blank", "noopener");
  }

  // Roda tarefas com no máximo "limite" ao mesmo tempo (envios em paralelo sem travar a conexão).
  async function emParalelo(itens, limite, tarefa) {
    let proximo = 0;
    const trabalhador = async () => {
      while (proximo < itens.length) await tarefa(itens[proximo++]);
    };
    await Promise.all(Array.from({ length: Math.min(limite, itens.length) }, trabalhador));
  }

  // Envia um arquivo direto para o Storage com progresso (a biblioteca não informa o progresso).
  async function anexarArquivo(paisId, registroId, file, aoProgredir) {
    const seguro = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_").slice(-120);
    const caminho = `${paisId}/${registroId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${seguro}`;
    const { data: s } = await sb.auth.getSession();
    await new Promise((ok, falha) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${caminho}`);
      xhr.setRequestHeader("Authorization", `Bearer ${s.session?.access_token}`);
      xhr.setRequestHeader("apikey", SUPABASE_KEY);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("x-upsert", "false");
      xhr.upload.onprogress = (ev) => ev.lengthComputable && aoProgredir(ev.loaded);
      xhr.onload = () => {
        if (xhr.status < 300) return ok();
        let msg = xhr.statusText;
        try {
          msg = JSON.parse(xhr.responseText).message || msg;
        } catch {}
        falha(new Error(`Falha ao enviar "${file.name}": ${msg}`));
      };
      xhr.onerror = () => falha(new Error(`Falha de conexão ao enviar "${file.name}".`));
      xhr.send(file);
    });
    const { error } = await sb.from("anexos").insert({ registro_id: registroId, pais: paisId, nome: file.name, caminho, tamanho: file.size, tipo: file.type });
    if (error) throw error;
  }

  function editarRegistro(pais, reg, depois) {
    const novos = [];
    const remover = new Set();
    janela(
      `<h2>${reg ? "Editar" : "Adicionar"} · ${esc(pais.nome)}</h2>
       <form>
         <label>Tipo
           <select name="categoria">${Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}" ${reg?.categoria === k ? "selected" : ""}>${v}</option>`).join("")}</select>
         </label>
         ${
           reg
             ? ""
             : `<label class="check"><input type="checkbox" name="lote"> Vários documentos de uma vez: cada arquivo vira um registro, com o nome do arquivo como título</label>`
         }
         <label class="campo-titulo">Título<input name="titulo" required maxlength="200" value="${esc(reg?.titulo || "")}" placeholder="Ex.: Resposta da SUNEDU sobre AOF"></label>
         <label>Informações<textarea name="conteudo" rows="6" placeholder="Detalhes, prazos, contatos, links…">${esc(reg?.conteudo || "")}</textarea></label>
         <div class="anexar">
           <span>Anexos</span>
           <ul class="lista-anexos" id="listaAnexos"></ul>
           <label class="soltar" id="soltar">
             <input type="file" multiple hidden id="arquivos">
             Arraste arquivos aqui ou <u>clique para escolher</u><small>Até ${MAX_MB} MB por arquivo</small>
           </label>
         </div>
         <div class="progresso" hidden><div class="barra"><span></span></div><small></small></div>
         <p class="erro" hidden></p>
         <div class="acoes-form"><button type="button" class="btn-sec" data-fechar>Cancelar</button><button class="btn">Salvar</button></div>
       </form>`,
      (m, fechar) => {
        const f = m.querySelector("form");
        const lista = m.querySelector("#listaAnexos");
        const erro = m.querySelector(".erro");
        const prog = m.querySelector(".progresso");
        const botao = f.querySelector(".btn:not(.btn-sec)");
        // Modo lote: o título vem do nome de cada arquivo, então o campo título some.
        f.lote?.addEventListener("change", () => {
          m.querySelector(".campo-titulo").hidden = f.lote.checked;
          f.titulo.required = !f.lote.checked;
        });
        const desenharLista = () => {
          const antigos = (reg?.anexos || []).filter((a) => !remover.has(a.id));
          lista.innerHTML =
            antigos.map((a) => `<li><span>${esc(a.nome)}</span><small>${tamanho(a.tamanho)}</small><button type="button" class="link perigo" data-tirar-antigo="${a.id}">remover</button></li>`).join("") +
            novos.map((a, i) => `<li class="novo"><span>${esc(a.name)}</span><small>${tamanho(a.size)} · novo</small><button type="button" class="link perigo" data-tirar-novo="${i}">remover</button></li>`).join("");
          lista.querySelectorAll("[data-tirar-antigo]").forEach((b) => (b.onclick = () => (remover.add(b.dataset.tirarAntigo), desenharLista())));
          lista.querySelectorAll("[data-tirar-novo]").forEach((b) => (b.onclick = () => (novos.splice(+b.dataset.tirarNovo, 1), desenharLista())));
        };
        const adicionar = (files) => {
          for (const file of files) {
            if (file.size > MAX_MB * 1048576) mostrarErro(erro, `"${file.name}" passa de ${MAX_MB} MB e ficou de fora.`);
            else novos.push(file);
          }
          desenharLista();
        };
        const zona = m.querySelector("#soltar");
        m.querySelector("#arquivos").onchange = (e) => adicionar(e.target.files);
        zona.addEventListener("dragover", (e) => (e.preventDefault(), zona.classList.add("sobre")));
        zona.addEventListener("dragleave", () => zona.classList.remove("sobre"));
        zona.addEventListener("drop", (e) => (e.preventDefault(), zona.classList.remove("sobre"), adicionar(e.dataTransfer.files)));
        desenharLista();

        // Barra de progresso somando os bytes enviados de todos os arquivos.
        const enviados = new Map();
        const total = () => novos.reduce((s, x) => s + x.size, 0) || 1;
        const atualizar = (texto) => {
          const feito = [...enviados.values()].reduce((s, x) => s + x, 0);
          prog.hidden = false;
          prog.querySelector("span").style.width = Math.min(100, Math.round((feito / total()) * 100)) + "%";
          prog.querySelector("small").textContent = texto;
        };
        let concluidos = 0;
        const anexar = async (registroId, file) => {
          await anexarArquivo(pais.id, registroId, file, (b) => {
            enviados.set(file, b);
            atualizar(`Enviando ${concluidos} de ${novos.length} arquivos…`);
          });
          enviados.set(file, file.size);
          concluidos++;
          atualizar(`Enviando ${concluidos} de ${novos.length} arquivos…`);
        };

        f.onsubmit = async (e) => {
          e.preventDefault();
          erro.hidden = true;
          const lote = Boolean(f.lote?.checked);
          if (lote && !novos.length) return mostrarErro(erro, "Escolha os arquivos: cada um vira um registro.");
          ocupado(f, true);
          botao.textContent = "Enviando…";
          try {
            const campos = { categoria: f.categoria.value, titulo: f.titulo.value.trim(), conteudo: f.conteudo.value.trim() };
            if (lote) {
              // Um registro por arquivo, vários ao mesmo tempo.
              await emParalelo(novos, 4, async (file) => {
                const titulo = file.name.replace(/\.[^.]+$/, "").slice(0, 200) || file.name;
                const { data: novo, error } = await sb.from("registros").insert({ ...campos, titulo, pais: pais.id }).select("id").single();
                if (error) throw error;
                await anexar(novo.id, file);
              });
            } else {
              let id = reg?.id;
              if (reg) {
                const { error } = await sb.from("registros").update(campos).eq("id", id);
                if (error) throw error;
              } else {
                const { data: novo, error } = await sb.from("registros").insert({ ...campos, pais: pais.id }).select("id").single();
                if (error) throw error;
                id = novo.id;
              }
              const tirar = (reg?.anexos || []).filter((a) => remover.has(a.id));
              if (tirar.length) {
                await sb.storage.from(BUCKET).remove(tirar.map((a) => a.caminho));
                const { error } = await sb.from("anexos").delete().in("id", tirar.map((a) => a.id));
                if (error) throw error;
              }
              await emParalelo(novos, 4, (file) => anexar(id, file));
            }
            fechar();
            depois();
          } catch (err) {
            ocupado(f, false);
            botao.textContent = "Salvar";
            const parcial = lote && concluidos ? ` ${concluidos} de ${novos.length} já foram enviados; confira a lista antes de tentar de novo.` : "";
            mostrarErro(erro, "Não consegui salvar: " + (err.message || err) + parcial);
          }
        };
      }
    );
  }

  // ---------- últimas atualizações (todos os países) ----------
  async function desenharAtualizacoes(el, nomePais) {
    if (!usuario) {
      el.innerHTML = `<div class="trava"><p>Entre para ver as últimas atualizações do Acadêmico.</p><button class="btn" id="entrarAt">Entrar</button></div>`;
      el.querySelector("#entrarAt").onclick = entrar;
      return;
    }
    const { data: regs, error } = await sb
      .from("registros")
      .select("id, pais, categoria, titulo, autor_nome, criado_em, anexos (id)")
      .order("atualizado_em", { ascending: false })
      .limit(40);
    if (error) return (el.innerHTML = `<p class="erro">Não consegui carregar: ${esc(error.message)}</p>`);
    el.innerHTML = regs.length
      ? `<ul class="feed">${regs
          .map(
            (r) => `<li><a href="#/pais/${esc(r.pais)}/documentos">
              <span class="cat cat-${r.categoria}">${CATEGORIAS[r.categoria] || ""}</span>
              <b>${esc(r.titulo)}</b>
              <small>${esc(nomePais(r.pais))} · ${esc(r.autor_nome)} · ${data(r.criado_em)}${r.anexos.length ? ` · ${r.anexos.length} anexo(s)` : ""}</small></a></li>`
          )
          .join("")}</ul>`
      : `<div class="vazio">Nenhuma atualização ainda.</div>`;
  }

  // Convidar e remover pessoas precisa da chave secreta, então passa pela função "equipe" no Supabase.
  async function chamarEquipe(corpo) {
    const { data: d, error } = await sb.functions.invoke("equipe", { body: corpo });
    if (!error) return d || {};
    try {
      return { erro: (await error.context.json()).erro || error.message };
    } catch {
      return { erro: "Não consegui falar com o servidor: " + error.message };
    }
  }

  // Administrador define a senha de alguém da equipe (sem link nem e-mail).
  function definirSenhaDeOutro(id, email) {
    janela(
      `<h2>Definir senha</h2>
       <p>Nova senha de <b>${esc(email)}</b>. Depois é só passar o e-mail e essa senha para a pessoa entrar.</p>
       <form>
         <label>Senha<input type="text" name="senha" minlength="8" required autocomplete="off" spellcheck="false"></label>
         <p class="muted">Mínimo de 8 caracteres. A pessoa pode trocar depois em "Trocar senha", no menu do ícone.</p>
         <p class="erro" hidden></p>
         <div class="acoes-form"><button type="button" class="btn-sec" data-fechar>Cancelar</button><button class="btn">Salvar senha</button></div>
       </form>`,
      (m, fechar) => {
        const f = m.querySelector("form");
        f.onsubmit = async (e) => {
          e.preventDefault();
          ocupado(f, true);
          const r = await chamarEquipe({ acao: "definir_senha", id, senha: f.senha.value });
          ocupado(f, false);
          if (r.erro) return mostrarErro(m.querySelector(".erro"), r.erro);
          fechar();
          alert(`Senha salva! ${email} já pode entrar com essa senha.`);
        };
      }
    );
  }

  function mostrarLink(email, link, depois, titulo = "Link de acesso", motivo = "O limite de e-mails grátis por hora foi atingido, então o convite não foi por e-mail.") {
    janela(
      `<h2>${esc(titulo)}</h2>
       <p>${esc(motivo)}
       Copie o link abaixo e envie para <b>${esc(email)}</b> (WhatsApp, por exemplo). Ao abrir, a pessoa cria a própria senha.</p>
       <textarea readonly rows="4" id="linkConvite">${esc(link)}</textarea>
       <p class="muted">O link vale por pouco tempo (normalmente 1 hora) e só pode ser usado uma vez. Se expirar, convide de novo.</p>
       <div class="acoes-form"><button class="btn-sec" data-fechar>Fechar</button><button class="btn" id="copiarLink">Copiar link</button></div>`,
      (m, fechar) => {
        const t = m.querySelector("#linkConvite");
        m.querySelector("#copiarLink").onclick = async () => {
          t.select();
          try {
            await navigator.clipboard.writeText(link);
          } catch {
            document.execCommand("copy");
          }
          m.querySelector("#copiarLink").textContent = "Copiado!";
        };
        m.querySelectorAll("[data-fechar]").forEach((b) => b.addEventListener("click", depois));
      }
    );
  }

  // ---------- equipe (só admin) ----------
  async function desenharEquipe(el) {
    if (usuario?.papel !== "admin") {
      el.innerHTML = `<div class="vazio">Só o administrador acessa esta página.</div>`;
      return;
    }
    const { data: perfis, error } = await sb.from("perfis").select("id, nome, email, papel").order("nome");
    if (error) return (el.innerHTML = `<p class="erro">${esc(error.message)}</p>`);
    const opcoes = (atual) =>
      ["leitor", "academico", "admin"].map((k) => `<option value="${k}" ${atual === k ? "selected" : ""}>${PAPEIS[k]}</option>`).join("");
    el.innerHTML = `
      <form class="convidar" id="fConvite">
        <h2>Convidar pessoa</h2>
        <div class="campos">
          <label>Nome<input name="nome" required maxlength="120" placeholder="Ex.: Maria Souza"></label>
          <label>E-mail<input name="email" type="email" required placeholder="nome@exemplo.com"></label>
          <label>Permissão<select name="papel">${opcoes("leitor")}</select></label>
          <button class="btn">Enviar convite</button>
        </div>
        <p class="muted" id="descPapel">${PAPEIS_DESC.leitor}</p>
        <p class="erro" hidden></p>
      </form>
      <div class="tabela-wrap"><table class="equipe">
        <thead><tr><th>Nome</th><th>E-mail</th><th>Permissão</th><th></th></tr></thead>
        <tbody>${perfis
          .map(
            (p) => `<tr><td>${esc(p.nome)}</td><td>${esc(p.email)}</td><td>
              <select data-perfil="${p.id}" ${p.id === usuario.id ? "disabled title='Você não pode mudar a sua própria permissão'" : ""}>${opcoes(p.papel)}</select></td>
              <td class="acoes-pessoa"><button class="link" data-definir="${p.id}" data-email="${esc(p.email)}">Definir senha</button><button class="link" data-senha="${p.id}" data-email="${esc(p.email)}">Link de nova senha</button>${
                p.id === usuario.id ? "" : `<button class="link perigo" data-remover="${p.id}" data-nome="${esc(p.nome)}">Remover acesso</button>`
              }</td></tr>`
          )
          .join("")}</tbody>
      </table></div>`;

    const f = el.querySelector("#fConvite");
    const erro = f.querySelector(".erro");
    f.papel.addEventListener("change", () => (el.querySelector("#descPapel").textContent = PAPEIS_DESC[f.papel.value]));
    f.onsubmit = async (e) => {
      e.preventDefault();
      erro.hidden = true;
      ocupado(f, true);
      const r = await chamarEquipe({ acao: "convidar", nome: f.nome.value.trim(), email: f.email.value.trim(), papel: f.papel.value, site: location.origin + location.pathname });
      ocupado(f, false);
      if (r.erro) return mostrarErro(erro, r.erro);
      if (r.link) {
        // Sem e-mail (limite do plano grátis): o administrador copia o link e manda por WhatsApp.
        mostrarLink(f.email.value.trim(), r.link, () => desenharEquipe(el));
        return;
      }
      mostrarErro(erro, `Convite enviado para ${f.email.value.trim()}. A pessoa recebe um e-mail para criar a senha.`, true);
      setTimeout(() => desenharEquipe(el), 1800);
    };
    el.querySelectorAll("[data-definir]").forEach((b) => b.addEventListener("click", () => definirSenhaDeOutro(b.dataset.definir, b.dataset.email)));
    el.querySelectorAll("[data-senha]").forEach((b) =>
      b.addEventListener("click", async () => {
        b.disabled = true;
        const r = await chamarEquipe({ acao: "senha", id: b.dataset.senha, site: location.origin + location.pathname });
        b.disabled = false;
        if (r.erro) return alert(r.erro);
        mostrarLink(b.dataset.email, r.link, () => {}, "Link de nova senha", "A senha atual continua valendo até a pessoa criar a nova.");
      })
    );
    el.querySelectorAll("[data-remover]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (!confirm(`Remover o acesso de ${b.dataset.nome}? Os registros que essa pessoa criou continuam no site.`)) return;
        b.disabled = true;
        const r = await chamarEquipe({ acao: "remover", id: b.dataset.remover });
        if (r.erro) {
          b.disabled = false;
          return alert(r.erro);
        }
        desenharEquipe(el);
      })
    );
    el.querySelectorAll("select[data-perfil]").forEach((s) =>
      s.addEventListener("change", async () => {
        s.disabled = true;
        const { error: e } = await sb.from("perfis").update({ papel: s.value }).eq("id", s.dataset.perfil);
        s.disabled = false;
        if (e) alert("Não consegui mudar: " + e.message);
      })
    );
  }

  // ---------- painel (dashboard) ----------
  const DIA = 86400000;
  const PERIODOS = { 7: "7 dias", 30: "30 dias", 90: "90 dias", 0: "Tudo" };
  let periodo = 30;

  // Barras horizontais de uma série só (uma cor, rótulo e valor em texto).
  function barras(itens, { link } = {}) {
    if (!itens.length) return `<p class="muted">Nada no período.</p>`;
    const max = Math.max(...itens.map((i) => i.valor)) || 1;
    return `<ul class="barras">${itens
      .map(
        (i) => `<li data-dica="${esc(i.rotulo)}: ${i.valor}${i.extra ? " · " + esc(i.extra) : ""}">
          <span class="rot">${link ? `<a href="${link(i)}">${esc(i.rotulo)}</a>` : esc(i.rotulo)}</span>
          <span class="trilho"><span class="fill" style="width:${Math.max(2, (i.valor / max) * 100)}%"></span></span>
          <span class="val">${i.valor}</span></li>`
      )
      .join("")}</ul>`;
  }

  // Colunas por dia (atividade). Rótulo só no primeiro, no meio e no último dia.
  function colunas(dias) {
    const max = Math.max(1, ...dias.map((d) => d.valor));
    const meio = Math.floor(dias.length / 2);
    return `<div class="colunas" role="img" aria-label="Registros por dia">${dias
      .map(
        (d, i) => `<div class="col" data-dica="${d.rotulo}: ${d.valor} registro${d.valor === 1 ? "" : "s"}">
          <span class="fill" style="height:${d.valor ? Math.max(4, (d.valor / max) * 100) : 0}%"></span>
          ${i === 0 || i === meio || i === dias.length - 1 ? `<small>${d.curto}</small>` : ""}</div>`
      )
      .join("")}</div>`;
  }

  function contar(lista, chave) {
    const m = new Map();
    for (const x of lista) m.set(chave(x), (m.get(chave(x)) || 0) + 1);
    return [...m.entries()].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
  }

  async function desenharPainel(el, paises, status) {
    if (!configurado) return (el.innerHTML = `<div class="vazio">O banco de dados ainda não foi ligado.</div>`);
    if (!usuario) {
      el.innerHTML = `<div class="trava"><p>O painel mostra dados internos da UniCPO.</p><button class="btn" id="entrarPainel">Entrar para ver</button></div>`;
      el.querySelector("#entrarPainel").onclick = entrar;
      return;
    }
    el.innerHTML = `<p class="muted">Carregando…</p>`;
    const { data: regs, error } = await sb.from("registros").select("id, pais, categoria, titulo, autor_nome, criado_em, anexos (tamanho)").order("criado_em", { ascending: false });
    if (error) return (el.innerHTML = `<p class="erro">Não consegui carregar: ${esc(error.message)}</p>`);

    const nomePais = (id) => paises.find((p) => p.id === id)?.nome || id;
    const desde = periodo ? Date.now() - periodo * DIA : 0;
    const noPeriodo = regs.filter((r) => new Date(r.criado_em).getTime() >= desde);
    const anexosTodos = regs.flatMap((r) => r.anexos);
    const bytes = anexosTodos.reduce((s, a) => s + (a.tamanho || 0), 0);
    const comRegistro = new Set(regs.map((r) => r.pais));
    const ultimo = regs[0];

    // Atividade diária: últimos N dias (no "Tudo", os últimos 90).
    const nDias = periodo || 90;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dias = Array.from({ length: nDias }, (_, i) => {
      const d = new Date(hoje.getTime() - (nDias - 1 - i) * DIA);
      return { t: d.getTime(), valor: 0, rotulo: d.toLocaleDateString("pt-BR"), curto: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) };
    });
    for (const r of regs) {
      const d = new Date(r.criado_em);
      d.setHours(0, 0, 0, 0);
      const alvo = dias.find((x) => x.t === d.getTime());
      if (alvo) alvo.valor++;
    }

    const porPais = contar(noPeriodo, (r) => r.pais).map((x) => ({ ...x, id: x.rotulo, rotulo: nomePais(x.rotulo) }));
    const porTipo = contar(noPeriodo, (r) => CATEGORIAS[r.categoria] || r.categoria);
    const porPessoa = contar(noPeriodo, (r) => r.autor_nome || "—");
    const semRegistro = paises.filter((p) => !comRegistro.has(p.id));
    const situacao = Object.keys(status).map((s) => ({ s, valor: paises.filter((p) => p.status === s).length }));
    const maxSit = Math.max(...situacao.map((x) => x.valor));

    el.innerHTML = `
      <div class="filtros-painel" role="group" aria-label="Período">
        ${Object.entries(PERIODOS)
          .sort((a, b) => (+a[0] || 999) - (+b[0] || 999))
          .map(([k, v]) => `<button data-periodo="${k}" class="${+k === periodo ? "ativo" : ""}">${v}</button>`)
          .join("")}
      </div>
      <div class="kpis">
        <div class="kpi"><small>Registros no período</small><b>${noPeriodo.length}</b><span>${regs.length} no total</span></div>
        <div class="kpi"><small>Anexos</small><b>${anexosTodos.length}</b><span>${noPeriodo.reduce((s, r) => s + r.anexos.length, 0)} no período</span></div>
        <div class="kpi"><small>Espaço usado</small><b>${tamanho(bytes)}</b><span>${((bytes / 1073741824) * 100).toFixed(1).replace(".", ",")}% de 1 GB grátis</span></div>
        <div class="kpi"><small>Países com registros</small><b>${comRegistro.size} <em>de ${paises.length}</em></b><span>${semRegistro.length} ainda sem nada</span></div>
        <div class="kpi"><small>Última atualização</small><b class="kpi-texto">${ultimo ? data(ultimo.criado_em).split(",")[0] : "—"}</b><span>${ultimo ? esc(ultimo.autor_nome) + " · " + esc(nomePais(ultimo.pais)) : "Nada ainda"}</span></div>
      </div>
      <div class="grade-painel">
        <section class="cartao largo"><h3>Registros por dia</h3><p class="sub">${periodo ? `Últimos ${periodo} dias` : "Últimos 90 dias"}</p>${colunas(dias)}</section>
        <section class="cartao"><h3>Registros por país</h3><p class="sub">No período · clique para abrir</p>${barras(porPais, { link: (i) => `#/pais/${i.id}/documentos` })}</section>
        <section class="cartao"><h3>Por tipo</h3><p class="sub">No período</p>${barras(porTipo)}</section>
        <section class="cartao"><h3>Quem adicionou</h3><p class="sub">No período</p>${barras(porPessoa)}</section>
        <section class="cartao"><h3>Situação da convalidação</h3><p class="sub">Dos ${paises.length} países do guia</p>
          <ul class="barras">${situacao
            .map(
              (x) => `<li data-dica="${status[x.s].nome}: ${x.valor} países">
                <span class="rot"><span class="dot d-${x.s}"></span>${status[x.s].nome}</span>
                <span class="trilho"><span class="fill f-${x.s}" style="width:${Math.max(2, (x.valor / maxSit) * 100)}%"></span></span>
                <span class="val">${x.valor}</span></li>`
            )
            .join("")}</ul></section>
        <section class="cartao largo"><h3>Países sem nenhum registro</h3>
          ${semRegistro.length ? `<div class="chips-paises">${semRegistro.map((p) => `<a href="#/pais/${p.id}/documentos">${esc(p.nome)}</a>`).join("")}</div>` : `<p class="muted">Todos os países têm pelo menos um registro.</p>`}
        </section>
        <section class="cartao largo"><h3>Últimos registros</h3>
          ${
            regs.length
              ? `<table class="tabela-simples"><thead><tr><th>Data</th><th>País</th><th>Título</th><th>Tipo</th><th>Quem</th><th>Anexos</th></tr></thead><tbody>${regs
                  .slice(0, 10)
                  .map(
                    (r) => `<tr><td>${data(r.criado_em).split(",")[0]}</td><td><a href="#/pais/${esc(r.pais)}/documentos">${esc(nomePais(r.pais))}</a></td><td>${esc(r.titulo)}</td><td>${CATEGORIAS[r.categoria] || ""}</td><td>${esc(r.autor_nome)}</td><td>${r.anexos.length}</td></tr>`
                  )
                  .join("")}</tbody></table>`
              : `<p class="muted">Nenhum registro ainda.</p>`
          }
        </section>
      </div>
      <div class="dica" hidden></div>`;

    el.querySelectorAll("[data-periodo]").forEach((b) => b.addEventListener("click", () => ((periodo = +b.dataset.periodo), desenharPainel(el, paises, status))));
    // Dica ao passar o mouse sobre barras e colunas.
    const dica = el.querySelector(".dica");
    el.querySelectorAll("[data-dica]").forEach((alvo) => {
      alvo.addEventListener("mousemove", (e) => {
        dica.hidden = false;
        dica.textContent = alvo.dataset.dica;
        dica.style.left = e.clientX + 12 + "px";
        dica.style.top = e.clientY + 12 + "px";
      });
      alvo.addEventListener("mouseleave", () => (dica.hidden = true));
    });
  }

  window.Colab = {
    desenharPainel,
    configurado,
    iniciar,
    entrar,
    desenharAba,
    desenharAtualizacoes,
    desenharEquipe,
    usuario: () => usuario,
    contagem: (pais) => contagens[pais] || 0,
    aoMudar: (f) => ouvintes.push(f),
  };
})();
