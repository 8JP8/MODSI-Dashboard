export default {
  ValidateForm: () => {
    const name = InputName.text?.trim();
    const description = InputDescription.text?.trim();
		const units =  InputUnits.text?.trim();
    const selectedDepartments = Departments.selectedOptionValues || [];
    
		storeValue("createNewKPI_isNameValid", !!name);
    storeValue("createNewKPI_isDescriptionValid", !!description);
		storeValue("createNewKPI_isUnitsValid", !!units);
    storeValue("createNewKPI_isDepartmentValid", selectedDepartments.length > 0);
    storeValue("createNewKPI_isFormValid", !!(name && description && selectedDepartments.length > 0));

    return !!(name && description && selectedDepartments.length > 0);
  },
	
	 ValidateName: () => {
    const name = InputName.text?.trim();
		storeValue("createNewKPI_isNameValid", !!name);
    return !!(name);
  },
	
	 ValidateDescription: () => {
    const description = InputDescription.text?.trim();
		storeValue("createNewKPI_isDescriptionValid", !!description);
    return !!(description);
  },
	
	ValidateUnits: () => {
    const units = InputUnits.text?.trim();
		storeValue("createNewKPI_isUnitsValid", !!units);
    return !!(units);
  },
  
  ValidateAndSubmit: async() => {
    if (this.ValidateForm()) {
			
      // Your submit logic here
      console.log("Form is valid, proceeding with submission");
      // Call your API or other submit logic
			try
			{
				await CreateNewKPI.run();
			}
			catch{}
			if (CreateNewKPI.responseMeta.isExecutionSuccess) {
				showAlert("O indicador \"" + InputName.text + "\" foi criado com sucesso", "success");
			}
    } else {
      showAlert("Preencha todos os campos", "error");
    }
  }
}