export default {
	UpdateTitle() {
		// Map the department index to the department names
		const departmentNames = [
			"Departamento Executivo",
			"Departamento Financeiro",
			"Departamento Tecnológico",
			"Departamento Contabilístico",
			"Departamento de R.H.",
			"Departamento de Operações",
			"Departamento de Marketing",
			"Departamento de Logística"
		];

		// Get the current value of Selected_Department from the store
		const selectedIndex = (appsmith.store.Selected_Department ?? 1) - 1;

		// Check if selectedIndex is valid and update the title
		if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < departmentNames.length) {
			return departmentNames[selectedIndex];
		} else {
			return "Departamento Desconhecido"; // Fallback title if the index is invalid
		}
	}
}