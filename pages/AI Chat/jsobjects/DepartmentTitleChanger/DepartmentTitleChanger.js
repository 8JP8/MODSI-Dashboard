export default {
  departmentNames: [
    "Departamento Executivo",
    "Departamento Financeiro",
    "Departamento Tecnológico",
    "Departamento Contabilístico",
    "Departamento de R.H.",
    "Departamento de Operações",
    "Departamento de Marketing",
    "Departamento de Logística"
  ],

  UpdateTitle() {
    const selectedIndex = (appsmith.store.Selected_Department ?? 1) - 1;

    if (selectedIndex >= 0 && selectedIndex < this.departmentNames.length) {
      return this.departmentNames[selectedIndex];
    } else {
      return "Departamento Desconhecido";
    }
  },

  MapTitleFromId(departmentId) {
    const index = (departmentId ?? 1) - 1;

    if (index >= 0 && index < this.departmentNames.length) {
      return this.departmentNames[index];
    } else {
      return "Departamento Desconhecido";
    }
  }
};