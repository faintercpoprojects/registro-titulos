// Site de Registro de Títulos: páginas montadas a partir de data.js, navegação por #/rota.
(() => {
  const app = document.getElementById("app");
  const ORDEM = ["convalida", "parcial", "condicoes", "nao", "sem-info"];
  const SIMBOLO = { sim: "✓", cond: "!", nao: "✕", aguarda: "?" };
  const ESP_TEXTO = { sim: "Convalida", cond: "Com condições", nao: "Não convalida", aguarda: "Aguardando" };
  const filtro = { busca: "", status: "", esp: "" };

  const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const bandeira = (p, w = 80) =>
    `<img class="bandeira" src="https://flagcdn.com/w${w}/${p.bandeira}.png" alt="Bandeira: ${p.nome}" loading="lazy">`;
  const selo = (status) => `<span class="selo s-${status}"><span class="dot d-${status}"></span>${STATUS[status].nome}</span>`;
  const temDetalhe = (p) => Boolean(p.orgao || p.requisitos);
  const nomeEsp = (sigla) => ESPECIALIDADES.find((e) => e.sigla === sigla)?.nome || sigla;

  function marcarMenu(rota) {
    document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("ativo", a.dataset.nav === rota));
  }

  // ---------- início: países ----------
  function inicio() {
    marcarMenu("inicio");
    const cont = Object.fromEntries(ORDEM.map((s) => [s, PAISES.filter((p) => p.status === s).length]));
    app.innerHTML = `
      <section class="hero">
        <h1>Registro de Títulos</h1>
        <p>Onde e como os títulos de especialização da UniCPO podem ser convalidados fora do Brasil: situação de cada país, órgão responsável, documentos e próximos passos.</p>
        <div class="resumo-status">
          ${ORDEM.map((s) => `<button data-status="${s}" title="${STATUS[s].desc}"><span class="dot d-${s}"></span><b>${cont[s]}</b> ${STATUS[s].nome}</button>`).join("")}
        </div>
      </section>
      <div class="filtros">
        <label class="busca">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="busca" type="search" placeholder="Buscar país" value="${filtro.busca}" aria-label="Buscar país">
        </label>
        <select id="fStatus" aria-label="Filtrar por situação">
          <option value="">Todas as situações</option>
          ${ORDEM.map((s) => `<option value="${s}">${STATUS[s].nome}</option>`).join("")}
        </select>
        <select id="fEsp" aria-label="Filtrar por especialidade">
          <option value="">Todas as especialidades</option>
          ${ESPECIALIDADES.map((e) => `<option value="${e.sigla}">Convalida ${e.nome}</option>`).join("")}
        </select>
      </div>
      <p class="contagem" id="contagem"></p>
      <div class="grade" id="grade"></div>`;

    const fStatus = document.getElementById("fStatus");
    const fEsp = document.getElementById("fEsp");
    fStatus.value = filtro.status;
    fEsp.value = filtro.esp;
    document.getElementById("busca").addEventListener("input", (e) => ((filtro.busca = e.target.value), desenharGrade()));
    fStatus.addEventListener("change", () => ((filtro.status = fStatus.value), desenharGrade()));
    fEsp.addEventListener("change", () => ((filtro.esp = fEsp.value), desenharGrade()));
    document.querySelectorAll(".resumo-status button").forEach((b) =>
      b.addEventListener("click", () => {
        filtro.status = filtro.status === b.dataset.status ? "" : b.dataset.status;
        fStatus.value = filtro.status;
        desenharGrade();
      })
    );
    desenharGrade();
  }

  function desenharGrade() {
    const termo = semAcento(filtro.busca.trim());
    const lista = PAISES.filter(
      (p) =>
        (!termo || semAcento(p.nome).includes(termo)) &&
        (!filtro.status || p.status === filtro.status) &&
        (!filtro.esp || ["sim", "cond"].includes(p.esp[filtro.esp]))
    ).sort((a, b) => ORDEM.indexOf(a.status) - ORDEM.indexOf(b.status) || a.nome.localeCompare(b.nome, "pt-BR"));

    document.querySelectorAll(".resumo-status button").forEach((b) => b.classList.toggle("ativo", b.dataset.status === filtro.status));
    document.getElementById("contagem").textContent =
      `${lista.length} ${lista.length === 1 ? "país" : "países"}` + (filtro.esp ? ` onde ${nomeEsp(filtro.esp)} convalida (com ou sem condições)` : "");
    document.getElementById("grade").innerHTML = lista.length
      ? lista
          .map(
            (p) => `
        <a class="pais" href="#/pais/${p.id}">
          <div class="pais-topo">${bandeira(p)}<h3>${p.nome}</h3></div>
          <p>${p.resumo}</p>
          <div class="rodape">${selo(p.status)}${
            Colab.contagem(p.id) ? `<span class="detalhado" title="Informações e anexos do Acadêmico">📎 ${Colab.contagem(p.id)}</span>` : temDetalhe(p) ? '<span class="detalhado">Guia completo →</span>' : "<span>Ver detalhes →</span>"
          }</div>
        </a>`
          )
          .join("")
      : `<div class="vazio">Nenhum país encontrado com esses filtros.</div>`;
  }

  // ---------- página do país ----------
  function pais(id, aba) {
    const p = PAISES.find((x) => x.id === id);
    if (!p) return naoEncontrado();
    marcarMenu("");
    const abas = [
      p.orgao && ["orgao", "Órgão responsável"],
      p.requisitos && ["requisitos", "Requisitos e documentos"],
      p.questionamentos?.length && ["questionamentos", "Principais questionamentos"],
      p.acoes?.length && ["acoes", "Próximas ações"],
      ["documentos", `Documentos e atualizações${Colab.contagem(p.id) ? ` (${Colab.contagem(p.id)})` : ""}`],
    ].filter(Boolean);
    const atual = abas.find(([k]) => k === aba)?.[0] || abas[0]?.[0];

    app.innerHTML = `
      <a class="voltar" href="#/">← Todos os países</a>
      <section class="pais-cab">
        ${bandeira(p, 160)}
        <div>
          <h1>${p.nome}</h1>
          ${selo(p.status)}
        </div>
      </section>
      <section class="secao">
        <h2>Situação da convalidação</h2>
        <ul>${p.convalidacao.map((t) => `<li>${t}</li>`).join("")}</ul>
        <div class="esp-lista">
          ${ESPECIALIDADES.map((e) => `<div class="esp-item" title="${e.nome}"><span>${e.nome}</span><span class="cel c-${p.esp[e.sigla]}" title="${ESP_TEXTO[p.esp[e.sigla]]}">${SIMBOLO[p.esp[e.sigla]]}</span></div>`).join("")}
        </div>
      </section>
      ${temDetalhe(p) ? "" : `<p class="muted aviso-guia">Ainda não temos o guia completo de ${p.nome}. Tem alguma dúvida? <a href="#/perguntar">Envie sua pergunta</a>.</p>`}
      <div class="abas" role="tablist">${abas.map(([k, t]) => `<button role="tab" data-aba="${k}" class="${k === atual ? "ativo" : ""}" aria-selected="${k === atual}">${t}</button>`).join("")}</div>
      <section class="secao aba-conteudo" id="abaConteudo"></section>`;
    mostrarAba(p, atual);

    // Troca de aba sem recarregar a página nem voltar ao topo.
    document.querySelectorAll(".abas button").forEach((b) =>
      b.addEventListener("click", () => {
        history.replaceState(null, "", `#/pais/${p.id}/${b.dataset.aba}`);
        document.querySelectorAll(".abas button").forEach((x) => {
          x.classList.toggle("ativo", x === b);
          x.setAttribute("aria-selected", x === b);
        });
        mostrarAba(p, b.dataset.aba);
      })
    );
  }

  function mostrarAba(p, aba) {
    const el = document.getElementById("abaConteudo");
    if (aba === "documentos") return Colab.desenharAba(p, el);
    el.innerHTML = conteudoAba(p, aba);
  }

  function conteudoAba(p, aba) {
    if (aba === "orgao") return `<p class="orgao-nome">${p.orgao.nome}</p>${p.orgao.html}`;
    if (aba === "requisitos") return p.requisitos;
    if (aba === "questionamentos")
      return (
        p.questionamentos.map((q, i) => `<details class="q" ${i === 0 ? "open" : ""}><summary>${q.p}</summary><div class="resp">${q.r}</div></details>`).join("") +
        `<p class="muted">Não achou sua dúvida? <a href="#/perguntar">Envie sua pergunta</a>.</p>`
      );
    if (aba === "acoes") return `<ol class="passos">${p.acoes.map((a) => `<li>${a}</li>`).join("")}</ol>`;
    return "";
  }

  // ---------- quadro por especialidade ----------
  function especialidades(sel) {
    marcarMenu("especialidades");
    const ordenados = [...PAISES].sort((a, b) => ORDEM.indexOf(a.status) - ORDEM.indexOf(b.status) || a.nome.localeCompare(b.nome, "pt-BR"));
    const esp = ESPECIALIDADES.find((e) => e.sigla === sel);
    const grupos = esp && {
      sim: PAISES.filter((p) => p.esp[esp.sigla] === "sim"),
      cond: PAISES.filter((p) => p.esp[esp.sigla] === "cond"),
      nao: PAISES.filter((p) => p.esp[esp.sigla] === "nao"),
      aguarda: PAISES.filter((p) => p.esp[esp.sigla] === "aguarda"),
    };

    app.innerHTML = `
      <h1 class="pagina-titulo">Quadro por especialidade</h1>
      <p class="pagina-sub">Veja de uma vez em quais países cada especialização pode ser convalidada. Escolha uma especialidade para ver a lista de países.</p>
      <div class="chips">
        <button data-esp="" class="${!esp ? "ativo" : ""}">Todas</button>
        ${ESPECIALIDADES.map((e) => `<button data-esp="${e.sigla}" class="${esp?.sigla === e.sigla ? "ativo" : ""}">${e.nome}</button>`).join("")}
      </div>
      ${
        esp
          ? `<div class="esp-resumo">
              ${["sim", "cond", "nao", "aguarda"]
                .map(
                  (k) => `<div><h4><span class="cel c-${k}">${SIMBOLO[k]}</span> ${ESP_TEXTO[k]} (${grupos[k].length})</h4>
                    <p>${grupos[k].map((p) => `<a href="#/pais/${p.id}">${p.nome}</a>`).join(", ") || "—"}</p></div>`
                )
                .join("")}
            </div>`
          : ""
      }
      <div class="legenda">
        ${["sim", "cond", "nao", "aguarda"].map((k) => `<span><span class="cel c-${k}">${SIMBOLO[k]}</span>${ESP_TEXTO[k]}</span>`).join("")}
      </div>
      <div class="tabela-wrap">
        <table>
          <thead><tr><th>País</th>${ESPECIALIDADES.map((e) => `<th title="${e.nome}" class="${esp?.sigla === e.sigla ? "col-ativa" : ""}">${e.sigla}</th>`).join("")}</tr></thead>
          <tbody>
            ${ordenados
              .map(
                (p) => `<tr><td><a href="#/pais/${p.id}">${bandeira(p, 40)}${p.nome}</a></td>${ESPECIALIDADES.map(
                  (e) => `<td class="${esp?.sigla === e.sigla ? "col-ativa" : ""}"><span class="cel c-${p.esp[e.sigla]}" title="${p.nome} · ${e.nome}: ${ESP_TEXTO[p.esp[e.sigla]]}">${SIMBOLO[p.esp[e.sigla]]}</span></td>`
                ).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="muted">"Com condições" significa que depende de carga horária, exame, revalidação da graduação ou outro requisito. Abra o país para ver qual.</p>`;

    document.querySelectorAll(".chips button").forEach((b) =>
      b.addEventListener("click", () => (location.hash = b.dataset.esp ? `#/especialidades/${b.dataset.esp}` : "#/especialidades"))
    );
  }

  // ---------- enviar pergunta ----------
  function perguntar() {
    marcarMenu("perguntar");
    app.innerHTML = `
      <div class="perguntar">
        <div class="info">
          <h1>Enviar pergunta</h1>
          <p>Não encontrou o que precisava? Envie sua dúvida sobre o registro de títulos em qualquer país.</p>
          <ul>
            <li>O prazo de resposta pode variar conforme a complexidade da pergunta.</li>
            <li>Em alguns casos é preciso aguardar a resposta de órgãos públicos de outros países.</li>
            <li>Assim que tivermos a informação, você será avisado por e-mail, e a pergunta com a resposta será publicada em "Principais questionamentos" do país.</li>
          </ul>
        </div>
        <div class="form-wrap">
          <iframe src="${FORMULARIO}" title="Formulário de questionamentos" loading="lazy">Carregando…</iframe>
        </div>
      </div>`;
  }

  // ---------- área interna ----------
  function atualizacoes() {
    marcarMenu("");
    app.innerHTML = `<h1 class="pagina-titulo">Últimas atualizações</h1>
      <p class="pagina-sub">Informações e anexos adicionados pelo Acadêmico em todos os países.</p><div id="feed"></div>`;
    Colab.desenharAtualizacoes(document.getElementById("feed"), (id) => PAISES.find((p) => p.id === id)?.nome || id);
  }

  function equipe() {
    marcarMenu("");
    app.innerHTML = `<h1 class="pagina-titulo">Equipe e permissões</h1>
      <p class="pagina-sub"><b>Administrador</b> faz tudo e cuida da equipe. <b>Acadêmico</b> adiciona, edita e apaga informações e anexos. <b>Visualizador</b> só vê e baixa.
      A pessoa convidada recebe um e-mail para criar a própria senha.</p>
      <div id="equipe"></div>`;
    Colab.desenharEquipe(document.getElementById("equipe"));
  }

  function naoEncontrado() {
    marcarMenu("");
    app.innerHTML = `<div class="vazio" style="margin-top:32px">Página não encontrada. <a href="#/">Voltar para os países</a></div>`;
  }

  function rotear() {
    const [, rota, a, b] = location.hash.replace(/^#/, "").split("/");
    if (!rota) return inicio();
    if (rota === "pais") return pais(a, b);
    if (rota === "especialidades") return especialidades(a);
    if (rota === "perguntar") return perguntar();
    if (rota === "atualizacoes") return atualizacoes();
    if (rota === "equipe") return equipe();
    naoEncontrado();
  }

  document.getElementById("atualizado").textContent = ATUALIZADO_EM;
  window.addEventListener("hashchange", () => {
    if (/access_token|error_description/.test(location.hash)) return; // link de convite/senha: o login trata
    rotear();
    window.scrollTo({ top: 0 });
  });
  // Entrou ou saiu: redesenha a página atual (contagens e aba de documentos mudam).
  Colab.aoMudar(rotear);
  // Espera o login (inclusive o de links de convite) antes de desenhar.
  Promise.resolve(Colab.iniciar()).catch((e) => console.error(e)).finally(rotear);
})();
