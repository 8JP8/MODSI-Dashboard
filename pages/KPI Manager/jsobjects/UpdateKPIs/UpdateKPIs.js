export default {
  async UpdateEachKPI() {
    const updatedRows = KPIs_Table.updatedRows;

    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];

      try {
				await storeValue("KPIUpdate_currentID", KPIs_Table.updatedRows[i].allFields.Id);
				await storeValue("KPIUpdate_currentValue_1", KPIs_Table.updatedRows[i].allFields.Value_1);
				await storeValue("KPIUpdate_currentValue_2", KPIs_Table.updatedRows[i].allFields.Value_2);
        await UpdateKPIValues.run();
      } catch (error) {
        console.error(`Error updating row with ID ${row.id}:`, error);
				return false;
      }
    };
		await GetDepartmentKPIs.run(); //Reset the table
		showAlert("Valores atualizados com sucesso", "success");
  }
};