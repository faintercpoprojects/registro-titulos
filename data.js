// Conteúdo do site. Para atualizar um país, edite só este arquivo.
// status: "convalida" | "parcial" | "condicoes" | "nao" | "sem-info"
// esp: situação por especialidade — "sim" | "cond" (com condições) | "nao" | "aguarda" (sem resposta ainda)

window.ATUALIZADO_EM = "outubro de 2026";

window.FORMULARIO =
  "https://docs.google.com/forms/d/e/1FAIpQLSeHtsW9dYD7TY-5iVl4MNxZKJ77RhPQ_BH1HRoiYhiXRF0PDg/viewform?embedded=true";

window.ESPECIALIDADES = [
  { sigla: "IMPL", nome: "Implantodontia" },
  { sigla: "PERIO", nome: "Periodontia" },
  { sigla: "PROT", nome: "Prótese Dentária" },
  { sigla: "ODONTOP", nome: "Odontopediatria" },
  { sigla: "ENDO", nome: "Endodontia" },
  { sigla: "ORTO", nome: "Ortodontia" },
  { sigla: "DENT", nome: "Dentística" },
  { sigla: "AOF", nome: "AOF" },
];

const todas = (v) => Object.fromEntries(window.ESPECIALIDADES.map((e) => [e.sigla, v]));

window.PAISES = [
  {
    id: "chile",
    nome: "Chile",
    bandeira: "cl",
    status: "parcial",
    resumo: "Convalida apenas Implantodontia. Ainda não cumprimos os requisitos das demais especializações.",
    convalidacao: [
      "Cumprimos os requisitos para convalidar: <b>IMPL</b>.",
      "Não cumprimos os requisitos de: PERIO, PROT, ODONTOP, ENDO e ORTO.",
      "Não são especializações no país: DENT e AOF (ou seja, não convalidam).",
    ],
    esp: { IMPL: "sim", PERIO: "nao", PROT: "nao", ODONTOP: "nao", ENDO: "nao", ORTO: "nao", DENT: "nao", AOF: "nao" },
    orgao: {
      nome: "Corporación Nacional Autónoma de Certificación de Especialidades Odontológicas (CONACEO)",
      html: `
        <p>É uma corporação autônoma de direito privado formada para realizar a certificação das especialidades em Odontologia, credenciando aqueles que, por sua experiência e qualidade, são reconhecidos como aptos para exercê-la.</p>
        <h4>Perfil institucional</h4>
        <p>A CONACEO foi criada pelo Colégio de Cirurgiões-Dentistas do Chile, por todas as Sociedades Científicas relacionadas à Odontologia e pelas Faculdades de Odontologia da Universidade do Chile, da Universidade de Concepción e da Universidade de Valparaíso. Todos são fundadores e participantes igualitários nesta agência certificadora, reconhecida pelos Ministérios da Saúde, Educação e Justiça. A CONACEO atua em prol da saúde pública ao certificar a competência e capacidade do Cirurgião-Dentista para exercer uma especialidade, buscando também a validação de seus pares.</p>
        <h4>Objetivos</h4>
        <p>A CONACEO sustenta que a ciência e a técnica estão em constante evolução. O odontólogo deve estar atualizado, motivo pelo qual a certificação concedida tem validade de sete anos, após os quais deve ser reavaliada pelos seus pares.</p>
        <p>A seriedade do processo é assegurada pela participação de renomados profissionais nas Comissões de Certificação, que analisam os documentos apresentados de forma científica.</p>
        <h4>História</h4>
        <p>Diante da falta de normas e acreditação de especialidades odontológicas, o Colégio de Dentistas decidiu determinar as especialidades e quem as exerceria. As Sociedades Científicas foram convidadas e a Corporação foi constituída com o apoio dos Ministérios da Saúde e das Faculdades de Odontologia, sendo reconhecida pelo Ministério da Justiça. O Ministério da Saúde autorizou a inscrição da CONACEO no Registro Nacional e Regional de entidades certificadoras de especialidades médicas e odontológicas.</p>
        <h4>Marco legal</h4>
        <ul>
          <li>Personalidade jurídica concedida pelo Ministério da Justiça através do Decreto N° 1052, de 24 de agosto de 1992.</li>
          <li>Resolução Exenta IP N° 1055 de 07/07/2016: registro no Registro de Entidades Certificadoras de Especialidades Médicas e Odontológicas.</li>
          <li>Resolução Exenta DJ 014-4 de 09/12/2013 da Comissão Nacional de Acreditação (CNA): aprova os "Criterios de Evaluación para la Acreditación de las Especialidades Odontológicas".</li>
          <li>Resolução Exenta 794 de 28/06/2016 do Ministério da Saúde: autoriza a CONACEO como entidade certificadora de especialidades odontológicas.</li>
        </ul>`,
    },
    requisitos: `
      <h4>Requisitos gerais para inscrição na CONACEO</h4>
      <ul>
        <li>Diploma de Cirurgião-Dentista de uma universidade chilena ou revalidado pelo Estado chileno, legalizado se concedido por universidade estrangeira.</li>
        <li>Ter obtido, em uma universidade chilena, a hierarquia acadêmica correspondente ao nível de Professor na área específica em que se inscreve.</li>
        <li>Ter completado integralmente um programa de formação de especialista certificado por uma universidade chilena ou estrangeira.</li>
        <li>Formação de especialista no exterior equivalente em duração e conteúdo à exigida pelas universidades chilenas.</li>
        <li>Capacidade na especialidade adquirida por trabalho contínuo não inferior a 5 anos, com mínimo de 4 horas diárias em Serviço Odontológico, Hospital ou ensino universitário.</li>
        <li>Currículo Vitae e certificados, em original ou cópias.</li>
        <li>Continuidade mínima de 5 anos no exercício da especialidade entre a formação e a inscrição.</li>
      </ul>
      <h4>Procedimento para obter a certificação</h4>
      <ol>
        <li>Adquirir o formulário de inscrição na Secretaria da CONACEO.</li>
        <li>Apresentar a documentação que comprove as qualificações (a Comissão pode solicitar outras informações).</li>
        <li>Entregar os documentos nos escritórios da CONACEO ou enviar por carta registrada.</li>
        <li>Pagar a certificação: <b>20 UF</b> (15 UF na inscrição e o saldo ao retirar o diploma).</li>
      </ol>
      <div class="box">
        <b>Dados bancários</b><br>
        Conta corrente · Banco Edwards do Banco de Chile · N° 00160973518 · RUT 72.322.900-6<br>
        Envie o comprovante com os dados do requerente para <a href="mailto:tesoreria@conaceo.cl">tesoreria@conaceo.cl</a>, com cópia para info@conaceo.cl e secretaria@conaceo.cl.
      </div>
      <p>A Comissão de Especialidade estuda os antecedentes e o Conselho da CONACEO concede (ou não) a certificação. O resultado é comunicado por carta. Em caso de discordância, é possível apelar em até 15 dias úteis.</p>
      <h4>Recertificação</h4>
      <p>Apresentar os documentos acumulados nos últimos 5 anos. Valor: <b>3 UF</b>.</p>
      <p class="muted">Atendimento de segunda a sexta, das 12h30 às 18h, na Avenida Santa María 1990, escritório 9.</p>`,
    questionamentos: [
      {
        p: "A CONACEO é o único órgão responsável pelo registro de títulos no Chile?",
        r: `<p>As normativas chilenas não são muito claras. Existem pelo menos três vias para o reconhecimento do título:</p>
          <ul>
            <li><b>Convalidação via Ministério das Relações Exteriores:</b> trâmite administrativo, sem exames teóricos ou práticos. Válido para Bolívia, Brasil, Colômbia, Costa Rica, El Salvador, Guatemala, Honduras, Nicarágua, Peru e Uruguai.</li>
            <li><b>Reconhecimento via Ministério da Educação:</b> para títulos da Argentina, Equador, Espanha e Reino Unido.</li>
            <li><b>Convalidação junto à Universidade do Chile:</b> para os demais países, com exames para validar o título (<a href="https://uchile.cl/u159574" target="_blank" rel="noopener">uchile.cl/u159574</a>).</li>
          </ul>`,
      },
      { p: "O diploma (título) da UniCPO é aceito pela CONACEO?", r: "<p>A UniCPO iniciou a emissão dos primeiros títulos em 2024.</p>" },
      {
        p: "Todas as normas estão claras para o registro de títulos no Chile?",
        r: `<p>Não. Não há requisitos específicos públicos para cada especialidade (carga horária mínima, créditos, disciplinas). A única informação específica, para <b>Ortodontia</b> (MINSAL e CNA), exige de programas não acreditados:</p>
          <ol>
            <li>Duração mínima de 24 meses e pelo menos 3.000 horas (idealmente 3.700), com mínimo de 50% em prática clínica.</li>
            <li>Supervisão de tutoria direta por docentes especialistas.</li>
            <li>Assistentes do programa especialistas certificados em ortodontia.</li>
            <li>Programa sob os auspícios e direção de universidade acreditada em odontologia no país.</li>
            <li>Duração mínima de 2 anos.</li>
            <li>Pelo menos 22 horas semanais presenciais.</li>
            <li>Mínimo de 2.400 horas presenciais cronológicas (aconselhável chegar a 3.000).</li>
            <li>Mínimo de 1.400 horas de tutoria direta.</li>
            <li>Tratamento de pelo menos 20 pacientes, com alta de 10 concluídos e mínimo de 6 tratados completamente pelo aluno.</li>
          </ol>
          <p class="muted">Cursos curtos, estágios, congressos e jornadas não contam para esses requisitos.</p>`,
      },
    ],
    acoes: [
      "Envio do primeiro diploma emitido pela UniCPO para análise pela CONACEO.",
      "Tentativa com aluno da especialidade de Ortodontia, que tem a maior carga horária (2.880 horas), levando toda a documentação requisitada.",
    ],
  },
  {
    id: "colombia",
    nome: "Colômbia",
    bandeira: "co",
    status: "nao",
    resumo: "Não convalida: exige 5.000 horas.",
    convalidacao: ["Não convalida, devido à quantidade de horas exigida, que é de <b>5.000 horas</b>."],
    esp: todas("nao"),
    orgao: {
      nome: "CONACES – Comisión Nacional Intersectorial de Aseguramiento de la Calidad de la Educación Superior",
      html: `
        <p>Órgão avaliador designado pelo Ministério da Educação Nacional que estuda, avalia e emite parecer sobre a formação acadêmica adquirida no exterior, em relação aos programas oferecidos na Colômbia. Permite ou nega a validação do título por meio de uma análise técnica que avalia:</p>
        <ol><li>conteúdo;</li><li>carga horária do programa acadêmico;</li><li>duração dos períodos acadêmicos;</li><li>modalidade.</li></ol>
        <p>Todos os títulos na área da saúde são avaliados exclusivamente sob o critério de avaliação acadêmica.</p>`,
    },
    requisitos: `
      <h4>Documentos para solicitar o reconhecimento</h4>
      <ul>
        <li><b>Diploma de pós-graduação</b>, com: nome da instituição; nome e documento do graduado; nome do programa; título concedido; data de emissão; registro da ata de graduação.</li>
        <li><b>Certificado de disciplinas</b> (apostilado).</li>
        <li><b>Certificado do programa acadêmico:</b> disciplinas e conteúdo, modalidade (presencial, a distância, combinada, residência), créditos e equivalência em horas, duração, horas teóricas, teórico-práticas e práticas assistenciais sob supervisão docente direta.</li>
        <li><b>Diploma de graduação</b> concedido por instituição reconhecida na Colômbia.</li>
        <li><b>Cédula de identidade.</b></li>
        <li><b>Registro de procedimentos</b> realizados durante a formação, com: data; idade do paciente; diagnóstico; procedimento ou tratamento; atuação (operador principal, auxiliar ou observador); assinatura de representante da instituição.</li>
        <li><b>Certificação de atividades acadêmicas e assistenciais:</b> rotações e práticas (clínicas e não clínicas), modalidade, datas, horas práticas, mecanismos de supervisão e instituições onde foram realizadas, além do vínculo entre a instituição e os hospitais ou clínicas.</li>
        <li><b>Título de especialidade base</b> (no caso de subespecialidade ou segunda especialidade), ou número da resolução de convalidação.</li>
        <li><b>Movimentos migratórios</b> (pode ser substituído pela cópia do passaporte) para especialidades médico-cirúrgicas presenciais.</li>
      </ul>
      <p class="muted">Todos os documentos em outro idioma precisam de tradução. A tradução não requer apostila nem legalização por via diplomática.</p>`,
    questionamentos: [],
    acoes: [],
  },
  {
    id: "costa-rica",
    nome: "Costa Rica",
    bandeira: "cr",
    status: "condicoes",
    resumo: "Exige mínimo de 1.620 horas e dois semestres de aulas.",
    convalidacao: ["É necessário ter um mínimo de <b>1.620 horas</b> e <b>dois semestres</b> de aulas."],
    esp: todas("cond"),
    orgao: {
      nome: "Colegio de Cirujanos Dentistas de Costa Rica",
      html: `<p>Para exercer a profissão odontológica na Costa Rica é necessário estar devidamente incorporado a este colégio profissional.</p>
        <p><a href="https://www.colegiodentistas.org/" target="_blank" rel="noopener">www.colegiodentistas.org</a></p>`,
    },
    requisitos: `
      <h4>Documentos para solicitar o reconhecimento</h4>
      <ul>
        <li>Título (original e cópia).</li>
        <li>Certificado de notas (original).</li>
        <li>Número de horas.</li>
        <li>Cópia do plano ou programa de estudos completo (conteúdo e objetivos de cada matéria).</li>
        <li>Pedido escrito à Junta Diretiva.</li>
        <li>Pagamento de <b>₡16.950</b> (dezesseis mil novecentos e cinquenta colones).</li>
      </ul>`,
    questionamentos: [
      {
        p: "Temos alunos com títulos convalidados na Costa Rica?",
        r: "<p>Temos 1 aluno titulado pela UNINGÁ que relata ter convalidado os títulos de Implantodontia e Periodontia (solicitamos comprovação e estamos aguardando devolutiva).</p>",
      },
    ],
    acoes: ["Envio do primeiro diploma emitido pela UniCPO para análise."],
  },
  {
    id: "equador",
    nome: "Equador",
    bandeira: "ec",
    status: "convalida",
    resumo: "Cumprimos todos os requisitos desde 2025. AOF ainda em validação como especialização.",
    convalidacao: [
      "Cumprimos todos os requisitos para a convalidação desde 2025, porém a Especialização em <b>AOF</b> ainda está em processo de ser validada como título de especialização.",
      "A SENESCYT faz o registro do título, que é suficiente para trabalhar no país.",
      "Não registram Diplomados, só Especialização.",
    ],
    esp: { ...todas("sim"), AOF: "aguarda" },
    orgao: {
      nome: "Secretaría de Educación Superior, Ciencia, Tecnología e Innovación (SENESCYT)",
      html: `<h4>Quem pode realizar este trâmite</h4>
        <p>Cidadãos nacionais ou estrangeiros que precisam registrar, no Sistema Nacional de Informação de Educação Superior do Equador (SNIESE), título da área de saúde e bem-estar obtido em Instituição de Educação Superior do Brasil, de categoria <i>lato sensu</i>, na área de especializações odontológicas.</p>`,
    },
    requisitos: `
      <h4>Documentos para solicitar o reconhecimento</h4>
      <ol>
        <li>Cédula de identidade ou cidadania, passaporte ou documento de refugiado (original e válido).</li>
        <li>Título original apostilado conforme a Convenção de Haia, ou com legalização consular.</li>
        <li>Plano de estudos, histórico acadêmico ou documentos que comprovem a duração dos estudos, em nome do requerente (original ou cópia autenticada, assinada pela IES).</li>
        <li>Documento da IES que identifique o campo de conhecimento do curso conforme a CINE-UNESCO, assinado pela autoridade competente.</li>
        <li>Certificado que comprove a modalidade de estudos, em nome do requerente (original ou cópia autenticada).</li>
      </ol>
      <h4>Recomendações</h4>
      <ul>
        <li>Confirmar que a IES estrangeira é credenciada pelo órgão regulador do seu país.</li>
        <li>O nível de formação do título deve corresponder ao estabelecido na LOES.</li>
        <li>Informar um e-mail oficial da IES, caso sejam necessárias mais informações.</li>
        <li>Conferir se os documentos enviados ao sistema SIAU estão legíveis.</li>
        <li>No certificado de campo de conhecimento, detalhar área, campo e ramo do programa (informação que cada universidade possui).</li>
      </ul>
      <h4>Outras informações</h4>
      <ul>
        <li>Duração do trâmite: <b>30 dias úteis</b>, contados a partir do Ato de Entrega e Recepção emitido no atendimento presencial.</li>
        <li>Custo: <b>US$ 30,00</b>.</li>
        <li>Cumprir os cinco requisitos evita atrasos.</li>
        <li>Resultado "Favorável": notificação pelo SIAU; o reconhecimento aparece em <a href="https://www.senescyt.gob.ec/web/guest/consultas" target="_blank" rel="noopener">senescyt.gob.ec/consultas</a>.</li>
        <li>Resultado "Rejeitado": notificação via Quipux (<a href="https://web.gestiondocumental.gob.ec/" target="_blank" rel="noopener">gestiondocumental.gob.ec</a>).</li>
        <li><a href="https://www.youtube.com/watch?v=8RIYC8fwcl0" target="_blank" rel="noopener">Vídeo tutorial</a> de como solicitar o trâmite.</li>
      </ul>`,
    questionamentos: [],
    acoes: [],
  },
  {
    id: "peru",
    nome: "Peru",
    bandeira: "pe",
    status: "convalida",
    resumo: "Todas as especializações registram na SUNEDU. AOF não registra no Colegio de Odontólogos.",
    convalidacao: [
      "Todas as especializações podem ser reconhecidas e registradas na <b>SUNEDU</b> (equivalente ao MEC no Brasil).",
      "Porém a <b>AOF</b> não pode ser registrada no Colegio de Odontólogos (equivalente ao CRO no Brasil), o que causou o problema com médicos e dentistas no país. O Colegio é mais rigoroso, mas é possível registrar na SUNEDU.",
    ],
    esp: { ...todas("sim"), AOF: "cond" },
    orgao: {
      nome: "SUNEDU (Superintendencia Nacional de Educación Superior Universitaria)",
      html: `<p>Existem duas maneiras para o reconhecimento de títulos por meio da SUNEDU:</p>
        <ul>
          <li><b>Primeira alternativa:</b> quando a faculdade está entre as 500 instituições de ensino ranqueadas (apenas algumas faculdades públicas brasileiras estão nesse ranking).</li>
          <li><b>Segunda alternativa:</b> quando o título foi emitido por país com acordo bilateral com o Peru. <b>A UniCPO se enquadra neste caso.</b></li>
        </ul>`,
    },
    requisitos: `
      <h4>Documentos para solicitar o reconhecimento</h4>
      <ol>
        <li>Solicitação de reconhecimento de graus e títulos concedidos no exterior (<a href="https://www.sunedu.gob.pe/presentar-solicitud-reconocimiento-grados-titulos-forma-virtual/" target="_blank" rel="noopener">formulário da SUNEDU</a>).</li>
        <li>Diploma original apostilado. Se não estiver em espanhol, apresentar tradução feita por tradutor credenciado pelo Colégio de Tradutores do Peru.</li>
        <li>Comprovante de pagamento da taxa: <b>S/ 325,10</b>.</li>
      </ol>
      <h4>A SUNEDU pode ainda solicitar</h4>
      <ul>
        <li>Impressão da busca em registro público online da instituição do país de origem (situação da UniCPO no e-MEC).</li>
        <li>Impressão da busca na área do aluno onde se verifique o título (situação da especialidade no e-MEC).</li>
        <li>Confirmação de instituições privadas ou agências oficiais de verificação de títulos.</li>
        <li>E-mail institucional do setor de registro de diplomas da universidade confirmando as informações do título.</li>
      </ul>`,
    questionamentos: [
      { p: "O diploma (título) da Uningá é aceito pela SUNEDU?", r: "<p>Sim, todos os diplomas emitidos pela Uningá que foram submetidos à SUNEDU foram devidamente registrados.</p>" },
      {
        p: "O diploma (título) da UniCPO é aceito pela SUNEDU?",
        r: "<p>A UniCPO iniciou a emissão dos primeiros títulos em 2024. A instituição adere a todas as normas e atende a todos os requisitos estabelecidos pela SUNEDU.</p>",
      },
    ],
    acoes: [
      "Envio do primeiro diploma emitido pela UniCPO para análise pela SUNEDU.",
      "O prazo de resposta é de até 30 dias a partir do envio dos documentos.",
    ],
  },
  {
    id: "venezuela",
    nome: "Venezuela",
    bandeira: "ve",
    status: "convalida",
    resumo: "Convalida todas as especialidades, mediante solicitação por escrito ao Colegio de Odontólogos.",
    convalidacao: [
      "É possível a convalidação de <b>todas as especialidades</b>, desde que o aluno solicite o Reconhecimento da Especialização por escrito ao Colegio de Odontólogos de Venezuela.",
    ],
    esp: todas("sim"),
    orgao: {
      nome: "Colegio de Odontólogos de Venezuela (COV)",
      html: `<p>Não existe informação oficial para Registro de Títulos na Venezuela. Contactamos o Presidente do Colégio, que informou que é importante comunicar ao colégio a intenção de fazer a especialidade em outro país <b>antes de iniciar o curso</b>.</p>`,
    },
    requisitos: `
      <p>Segundo o Presidente do Colegio de Odontólogos da Venezuela:</p>
      <ol>
        <li>Contactar o representante Dr. Marco V. Marcial (+58 414-3332284) para informar a intenção de fazer um curso de especialização em instituição estrangeira. O aluno recebe uma <b>carta de comunicação</b>, que facilita o processo no registro do título.</li>
        <li>Ao final do curso, apresentar: título apostilado e a carta de comunicação emitida pelo representante do Colegio.</li>
      </ol>
      <p class="muted">Não fomos informados de custos relacionados ao processo.</p>`,
    questionamentos: [{ p: "Temos histórico de problemas de convalidação na Venezuela?", r: "<p>Não temos histórico de problemas de convalidação na Venezuela.</p>" }],
    acoes: ["Envio do primeiro diploma emitido pela UniCPO para análise do Colegio de Odontólogos da Venezuela."],
  },
  {
    id: "honduras",
    nome: "Honduras",
    bandeira: "hn",
    status: "parcial",
    resumo: "Só existem PROT, IMPL, ORTO e ENDO (com condições). As demais aguardam resposta da UNAH.",
    convalidacao: [
      "Só existem as especializações <b>PROT, IMPL, ORTO e ENDO</b>. Para elas é necessário ter mais de um ano e meio de duração, inscrição no site global e 60 créditos.",
      "ODONTOP, PERIO, DENT e AOF: aguardando resposta da UNAH.",
    ],
    esp: { PROT: "cond", IMPL: "cond", ORTO: "cond", ENDO: "cond", ODONTOP: "aguarda", PERIO: "aguarda", DENT: "aguarda", AOF: "aguarda" },
  },
  {
    id: "el-salvador",
    nome: "El Salvador",
    bandeira: "sv",
    status: "parcial",
    resumo: "Só convalida títulos com mais de 1.920 horas e 3 anos, ou seja, apenas Ortodontia.",
    convalidacao: ["Somente convalida títulos com mais de <b>1.920 horas</b> e <b>3 anos</b>, ou seja, somente convalida <b>Ortodontia</b>."],
    esp: { ...todas("nao"), ORTO: "sim" },
  },
  {
    id: "mexico",
    nome: "México",
    bandeira: "mx",
    status: "convalida",
    resumo: "Nenhum requisito de horas nos impede: é possível convalidar.",
    convalidacao: ["Não há nada que se refira a quantidade de horas ou requisitos que nos impossibilite, ou seja, <b>é possível convalidar</b>."],
    esp: todas("sim"),
  },
  {
    id: "republica-dominicana",
    nome: "República Dominicana",
    bandeira: "do",
    status: "convalida",
    resumo: "Cumprimos todos os requisitos para a convalidação.",
    convalidacao: ["Cumprimos <b>todos os requisitos</b> para a convalidação."],
    esp: todas("sim"),
  },
  {
    id: "cuba",
    nome: "Cuba",
    bandeira: "cu",
    status: "sem-info",
    resumo: "Ainda não temos informações sobre a convalidação.",
    convalidacao: ["Não temos informações sobre a convalidação."],
    esp: todas("aguarda"),
  },
  {
    id: "argentina",
    nome: "Argentina",
    bandeira: "ar",
    status: "condicoes",
    resumo: "PROT, ORTO, ODONTOP, PERIO e ENDO, com revalidação em universidade pública.",
    convalidacao: [
      "Especialidades permitidas: <b>PROT, ORTO, ODONTOP, PERIO e ENDO</b>.",
      "É preciso fazer a revalidação em uma universidade pública, pois o Brasil não possui convênio com a Argentina. A universidade escolhida envia os próprios requisitos para a revalidação.",
    ],
    esp: { PROT: "cond", ORTO: "cond", ODONTOP: "cond", PERIO: "cond", ENDO: "cond", IMPL: "nao", DENT: "nao", AOF: "nao" },
  },
  {
    id: "paraguai",
    nome: "Paraguai",
    bandeira: "py",
    status: "condicoes",
    resumo: "Nada indica impedimento, mas é preciso fazer um exame além da solicitação.",
    convalidacao: ["Não há informação que indique que o título não pode ser convalidado, mas é preciso fazer um <b>exame</b> além da solicitação."],
    esp: todas("cond"),
  },
  {
    id: "uruguai",
    nome: "Uruguai",
    bandeira: "uy",
    status: "sem-info",
    resumo: "Ainda não temos informações sobre a convalidação.",
    convalidacao: ["Não temos informações sobre a convalidação."],
    esp: todas("aguarda"),
  },
  {
    id: "bolivia",
    nome: "Bolívia",
    bandeira: "bo",
    status: "condicoes",
    resumo: "Exige 2.000 horas acadêmicas, 50 créditos, 24 meses ou fazer parte do Mercosul.",
    convalidacao: ["Necessita <b>2.000 horas acadêmicas</b> (de 45 min) <b>ou 50 créditos ou 24 meses</b>, ou fazer parte do Mercosul."],
    esp: todas("cond"),
  },
  {
    id: "guatemala",
    nome: "Guatemala",
    bandeira: "gt",
    status: "condicoes",
    resumo: "Convalida programas com 45 créditos e duração maior que um ano.",
    convalidacao: ["Convalida, desde que o programa tenha <b>45 créditos</b> e duração <b>maior que um ano</b>."],
    esp: todas("cond"),
  },
  {
    id: "nicaragua",
    nome: "Nicarágua",
    bandeira: "ni",
    status: "condicoes",
    resumo: "Possível para programas de dois ou três anos; sem requisitos específicos divulgados.",
    convalidacao: ["Informaram que é possível desde que o programa tenha <b>dois ou três anos</b> de duração, mas não citam requisitos específicos."],
    esp: todas("cond"),
  },
  {
    id: "haiti",
    nome: "Haiti",
    bandeira: "ht",
    status: "condicoes",
    resumo: "Documentação deve passar por avaliador internacional (WES ou Josef Silny).",
    convalidacao: [
      "É preciso enviar a documentação para um avaliador internacional (<b>World Education Services</b> ou <b>Josef Silny</b>), que confere se tudo está dentro dos parâmetros do MSPP (Ministério da Saúde Pública e População).",
    ],
    esp: todas("cond"),
  },
  {
    id: "eua",
    nome: "Estados Unidos",
    bandeira: "us",
    status: "condicoes",
    resumo: "Possível após revalidar a graduação (Advanced Standing) e cumprir o processo do estado.",
    convalidacao: [
      "É possível desde que já tenha sido feita a revalidação da graduação (<b>Advanced Standing</b>) e cumprido o processo exigido pelo órgão do estado onde a pessoa vai atuar.",
    ],
    esp: todas("cond"),
  },
  {
    id: "canada",
    nome: "Canadá",
    bandeira: "ca",
    status: "condicoes",
    resumo: "Possível após revalidar a graduação (NDEB) e fazer os exames DSATP e NDSE.",
    convalidacao: [
      "É possível desde que já tenha sido feita a revalidação da graduação (<b>Advanced Standing / NDEB</b>) e uma série de exames (<b>DSATP – NDSE</b>).",
    ],
    esp: todas("cond"),
  },
  {
    id: "espanha",
    nome: "Espanha",
    bandeira: "es",
    status: "condicoes",
    resumo: "Basta convalidar a graduação; a especialização conta como conhecimento adicional.",
    convalidacao: [
      "É necessário convalidar o título de <b>Odontologia</b> (graduação); com isso a especialização já é aceita como parte do conhecimento do dentista.",
      "Não há lei de especialidades no país, então ela conta como conhecimento adicional ou educação continuada.",
    ],
    esp: todas("cond"),
  },
];

window.STATUS = {
  convalida: { nome: "Convalida", desc: "Cumprimos os requisitos" },
  parcial: { nome: "Parcial", desc: "Só algumas especialidades" },
  condicoes: { nome: "Com condições", desc: "Depende de horas, exames ou revalidação" },
  nao: { nome: "Não convalida", desc: "Requisitos fora do nosso alcance" },
  "sem-info": { nome: "Sem informação", desc: "Ainda sem retorno" },
};
