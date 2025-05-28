export default {
	generateAnalysisPrompt(kpiList, analysisType) {
        // kpiList is now expected to have: Name, Unit, Value_1, Value_2, ByProduct

        if (!kpiList || kpiList.length === 0) {
            return "Erro: Nenhum KPI foi selecionado.";
        }
        if (!analysisType) {
            return "Erro: Tipo de análise não selecionado.";
        }

        const makeStringUltraSafe = (value) => {
            if (typeof value !== 'string') {
                if (value === null || value === undefined) return 'null';
                return String(value);
            }
            return value
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, ' ')
                .replace(/\r/g, '')
                .replace(/\t/g, ' ')
                .replace(/\[/g, '((')
                .replace(/\]/g, '))')
                .replace(/{/g, '{{')
                .replace(/}/g, '}}');
        };

        // 1. Transform KPI data to include Unit.
        // New format: ((NomeKPI Unidade Valor1 Valor2 ESubproduto_1ou0))
        const kpiDataStringsArray = kpiList.map(kpi => {
            const name = makeStringUltraSafe(kpi.Name || "N/A");
            const unit = makeStringUltraSafe(kpi.Unit || "N/A"); // Add Unit
            const val1 = makeStringUltraSafe(kpi.Value_1);
            const val2 = makeStringUltraSafe(kpi.Value_2);
            const byproduct = kpi.ByProduct ? '1' : '0';
            return `((${name} ${unit} ${val1} ${val2} ${byproduct}))`;
        });

        const kpiDataString = kpiDataStringsArray.join('; ');

        let kpi1ExampleName = 'KPI_1';
        if (kpiList[0] && kpiList[0].Name) {
            kpi1ExampleName = makeStringUltraSafe(kpiList[0].Name);
        }
        let kpi2ExampleName = 'KPI_2';
        if (kpiList.length > 1 && kpiList[1] && kpiList[1].Name) {
            kpi2ExampleName = makeStringUltraSafe(kpiList[1].Name);
        }

        // 2. Build the prompt with more detail.
        let promptParts = [];
        promptParts.push("Voce e um assistente de IA especialista em analise de dados de negocios e estrategia empresarial.");
        promptParts.push("Sua tarefa e realizar uma analise aprofundada dos Indicadores de Desempenho Chave (KPIs) fornecidos, considerando o tipo de analise solicitado.");
        promptParts.push("Formato dos dados de cada KPI:: ((NomeDoKPI UnidadeDoKPI ValorPrincipalDoKPI ValorSecundarioOuComparativoDoKPI ESubproduto_Sim_1_Nao_0)). O ValorSecundario pode ser 'null' se nao aplicavel.");
        promptParts.push("KPIsFornecidos:: " + kpiDataString + ".");
        promptParts.push("TipoDeAnaliseSolicitada:: " + makeStringUltraSafe(analysisType) + ".");
        promptParts.push("InstrucoesAdicionais:: Forneca insights claros, concisos, e acionaveis. Estruture a resposta logicamente. Considere o contexto empresarial implicito e as unidades dos KPIs.");

        switch (analysisType) {
            case "Relacional":
                promptParts.push("FocoAnaliseRelacional:: 1. Identifique e explique detalhadamente as interdependencias e correlacoes (positivas, negativas, fortes, fracas) entre os KPIs listados. 2. Descreva como uma mudanca significativa em um KPI (aumento ou diminuicao) pode potencialmente impactar os outros, incluindo a direcao e magnitude estimada do impacto. 3. Aponte possiveis relacoes de causa e efeito, mesmo que hipoteticas, baseadas na natureza dos KPIs e conhecimento de negocios. 4. Sugira como a otimizacao de um KPI especifico poderia alavancar o desempenho de outros KPIs relacionados, ou como um trade-off pode ser necessario. 5. Mencione KPIs que parecem operar de forma mais independente, se houver.");
                promptParts.push("ExemploPerguntaGuiaRelacional:: Como o KPI '" + kpi1ExampleName + "' (com seus valores e unidade) se relaciona com o KPI '" + kpi2ExampleName + "' (com seus valores e unidade), e quais sao as implicacoes praticas dessa relacao para a gestao do negocio?");
                break;
            case "Comparativa":
                promptParts.push("FocoAnaliseComparativa:: 1. Compare os KPIs fornecidos entre si, especialmente se representarem metricas de natureza similar ou partes de um mesmo processo. 2. Analise como os valores e unidades de cada KPI se posicionam em relacao a benchmarks comuns do setor (use seu conhecimento geral se benchmarks especificos nao forem fornecidos) ou metas organizacionais tipicas. 3. Identifique, com base nos valores, unidades e natureza dos KPIs, quais representam potenciais pontos fortes, fracos, ou areas de destaque/alerta para a organizacao. 4. Destaque as diferencas e semelhancas mais significativas no proposito ou impacto de cada KPI. 5. Se os KPIs sugerem estagios de um funil ou processo, analise o fluxo, possiveis gargalos ou eficiencias entre eles.");
                promptParts.push("ExemploPerguntaGuiaComparativa:: Considerando os KPIs '" + kpi1ExampleName + "' e '" + kpi2ExampleName + "', qual deles (analisando seus valores e unidades) sugere uma maior urgencia de atencao, representa uma maior alavanca de crescimento, ou indica um desempenho superior/inferior em relacao a expectativas comuns?");
                break;
            case "Preditiva":
                promptParts.push("FocoAnalisePreditiva:: 1. Com base na natureza, valores atuais e unidades dos KPIs, projete tendencias futuras provaveis (curto e medio prazo) para cada um. 2. Identifique riscos e ameacas potenciais (internos ou externos) que poderiam impactar negativamente o desempenho futuro desses KPIs. 3. Aponte oportunidades emergentes ou fatores positivos que poderiam ser explorados para melhorar esses KPIs. 4. Sugira possiveis cenarios futuros (otimista, pessimista, realista) para o conjunto de KPIs, explicando os principais fatores e premissas que levariam a cada cenario. 5. Indique que tipo de dados adicionais, historicos ou contextuais seriam mais uteis para refinar essas previsoes e aumentar sua robustez.");
                promptParts.push("ExemploPerguntaGuiaPreditiva:: Quais sao as projecoes de tendencia para o KPI '" + kpi1ExampleName + "' (considerando seu valor e unidade) nos proximos 6-12 meses, e quais fatores externos (economicos, de mercado, tecnologicos) ou internos (estrategia da empresa, operacoes) poderiam influenciar significativamente essa trajetoria?");
                break;
            default:
                return "Erro: Tipo de analise '" + makeStringUltraSafe(analysisType) + "' nao reconhecido. Use Relacional, Comparativa, ou Preditiva.";
        }
        promptParts.push("Conclusao:: Apresente sua analise de forma organizada, com clareza nos argumentos e insights praticos que possam auxiliar na tomada de decisoes estrategicas.");

        return promptParts.join(' '); // Join all parts with a single space for flatness
    },

    // ... (formatKpiOption and loadKpiOptionsForMultiSelect from previous answers)
    // formatKpiOption should map kpi.Name to label and kpi.Id to value
    // loadKpiOptionsForMultiSelect should ensure it's fetching/providing data
    // that includes Name, Unit, Value_1, Value_2, ByProduct, Id for each kpi object.
	formatKpiOption: (kpi) => {
		return {
			label: kpi.Name || "Nome Indisponível",
			value: kpi.Id
		};
	},

	loadKpiOptionsForMultiSelect: async () => {
		storeValue('kpiOptionsLoading', true);
		let kpiSourceData = [];
		const userGroup = appsmith.store.userGroup;

		// Ensure these data sources are populated and contain all necessary fields
		// (Id, Name, Unit, Value_1, Value_2, ByProduct)
		if (userGroup === 'ADMIN') {
			kpiSourceData = GetAllKPIs.data || [];
		} else {
			kpiSourceData = GetRoleKPIs.data || [];
		}

		if (!Array.isArray(kpiSourceData) || kpiSourceData.length === 0) {
			showAlert('Dados de KPI não encontrados ou formato inválido para o seletor.', 'warning');
			storeValue('kpiOptionsLoading', false);
			return [];
		}

        const uniqueKpisMap = new Map();
        kpiSourceData.forEach(kpi => {
            if (kpi && kpi.Id !== undefined) {
                 if (!uniqueKpisMap.has(kpi.Id)) {
                    uniqueKpisMap.set(kpi.Id, kpi);
                }
            }
        });
        const uniqueKpis = Array.from(uniqueKpisMap.values());

		const multiSelectOptions = uniqueKpis.map(kpi => this.formatKpiOption(kpi));
		multiSelectOptions.sort((a, b) => a.label.localeCompare(b.label));

		storeValue('kpiOptionsLoading', false);
		return multiSelectOptions;
	},

	convertMarkdownToAppsmithHtml(markdownText) {
        if (!markdownText || typeof markdownText !== 'string') {
            return ""; // Return empty string if input is invalid
        }

        let html = markdownText;

        // 1. Convert Bold: **text** -> <b>text</b>
        // The (.*?) is a non-greedy match for any characters between the **
        html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        // 2. Convert Bullet Points (unordered lists)
        // This is a bit more involved as we need to handle multiple lines
        // and wrap them correctly.
        const lines = html.split('\n');
        let newLines = [];
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            // Regex to match lines starting with "* " or "- " (with optional leading spaces)
            const listItemMatch = line.match(/^(\s*(\*|-)\s+)(.*)/);

            if (listItemMatch) {
                if (!inList) {
                    newLines.push('<ul>');
                    inList = true;
                }
                // listItemMatch[3] is the content after the bullet point marker
                newLines.push(`<li>${listItemMatch[3]}</li>`);
            } else { // Not a list item
                if (inList) {
                    // Current line is not a list item, but previous was, so close the list
                    newLines.push('</ul>');
                    inList = false;
                }
                newLines.push(line); // Add the non-list item line
            }
        }

        // If the text ends with a list, ensure the <ul> is closed
        if (inList) {
            newLines.push('</ul>');
        }

        html = newLines.join('\n'); // Appsmith Text widget handles newlines in string

        // Optional: Convert standalone newlines (not part of HTML structure like <ul>) to <br>
        // This might be useful if the AI uses double newlines for paragraphs.
        // However, Appsmith's Text widget usually respects newlines in the string itself.
        // Let's try without explicit <br> first. If paragraph spacing is an issue,
        // we can add a step to convert double newlines to <p> tags or single newlines to <br>.
        // For now, simple newline handling by the Text widget should be okay.

        return html;
    }
}