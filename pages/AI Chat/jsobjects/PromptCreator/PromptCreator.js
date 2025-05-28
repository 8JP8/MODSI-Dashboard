export default {
	generateAnalysisPrompt(kpiList, analysisType) {
		if (!kpiList || kpiList.length === 0) {
			return "Erro: Nenhum KPI selecionado."; // Simple error string
		}
		if (!analysisType) {
			return "Erro: Tipo de análise não selecionado."; // Simple error string
		}

		// Helper to make strings super safe for direct embedding
		const makeStringUltraSafe = (value) => {
			if (typeof value !== 'string') {
				if (value === null || value === undefined) return 'null'; // Represent null/undefined as 'null' string
				return String(value); // Convert numbers/booleans to string
			}
			// Replace characters that could break JSON or the AI's understanding if not handled
			return value
				.replace(/\\/g, '\\\\') // Must be first: escape existing backslashes
				.replace(/"/g, '\\"')  // Escape double quotes
				.replace(/\n/g, ' ')   // Replace newlines with a space (for flatness)
				.replace(/\r/g, '')    // Remove carriage returns
				.replace(/\t/g, ' ')   // Replace tabs with a space
				.replace(/\[/g, '((')  // Replace [ with ((
				.replace(/\]/g, '))')  // Replace ] with ))
				.replace(/{/g, '{{')  // Replace { with {{
				.replace(/}/g, '}}'); // Replace } with }}
		};

		// 1. Transform KPI data to a string representation of the compact format.
		// Each KPI becomes a string like: "(('KPI Name' 'Value1' 'Value2' 0))"
		const kpiDataStringsArray = kpiList.map(kpi => {
			const name = makeStringUltraSafe(kpi.Name || "N/A");
			const val1 = makeStringUltraSafe(kpi.Value_1); // Handles null by converting to 'null'
			const val2 = makeStringUltraSafe(kpi.Value_2); // Handles null by converting to 'null'
			const byproduct = kpi.ByProduct ? '1' : '0';
			// Using single quotes internally for readability, makeStringUltraSafe handles double quotes
			return `((${name} ${val1} ${val2} ${byproduct}))`;
		});

		// Join these individual KPI strings with a common separator like a semicolon
		const kpiDataString = kpiDataStringsArray.join('; '); // Example: "((KPI A 100 null 0)); ((KPI B 50 45 1))"

		// For example questions, sanitize names
		let kpi1ExampleName = 'KPI_1';
		if (kpiList[0] && kpiList[0].Name) {
			kpi1ExampleName = makeStringUltraSafe(kpiList[0].Name);
		}
		let kpi2ExampleName = 'KPI_2';
		if (kpiList.length > 1 && kpiList[1] && kpiList[1].Name) {
			kpi2ExampleName = makeStringUltraSafe(kpiList[1].Name);
		}

		// 2. Build the prompt as a single flat string.
		// Use specific markers instead of characters that might clash with JSON.
		// All newlines are replaced with spaces.
		let promptParts = [];
		promptParts.push("IA, analise KPIs.");
		promptParts.push("FormatoDados: ((Nome Valor1 Valor2 ESubproduto_1ou0))."); // ESubproduto is now part of the description
		promptParts.push("KPIs:: " + kpiDataString + "."); // Use :: as a special separator
		promptParts.push("AnaliseTipo:: " + makeStringUltraSafe(analysisType) + ".");

		switch (analysisType) {
			case "Relacional":
				promptParts.push("Foco:: Interdependencias, correlacoes, causa-efeito.");
				promptParts.push("Exemplo:: Relacao entre " + kpi1ExampleName + " e " + kpi2ExampleName + "?");
				break;
			case "Comparativa":
				promptParts.push("Foco:: Comparar, benchmarks, pontos fortes/fracos.");
				promptParts.push("Exemplo:: " + kpi1ExampleName + " vs " + kpi2ExampleName + ", qual priorizar?");
				break;
			case "Preditiva":
				promptParts.push("Foco:: Tendencias, riscos, oportunidades.");
				promptParts.push("Exemplo:: Projecao " + kpi1ExampleName + "?");
				break;
			default:
				return "Erro: Analise " + makeStringUltraSafe(analysisType) + " invalida.";
		}
		promptParts.push("Resposta concisa e acionavel.");

		return promptParts.join(' '); // Join all parts with a single space for flatness
	},

	// ... (formatKpiOption and loadKpiOptionsForMultiSelect from previous answers,
	//      ensure they provide Name, Value_1, Value_2, ByProduct to kpiList)
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
	}
}