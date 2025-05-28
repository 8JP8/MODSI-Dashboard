export default {
	async UpdateUserProfile () {
		try {
			if (!(NameInput.isValid)) {
				showAlert("O nome de utilizador inserido é inválido.", "error");
				return;
			}
			else if (!(PhoneInput.isValid)) {
				showAlert("O nome de telemóvel inserido é inválido.", "error");
				return;
			}
			else {
				storeValue("userName", NameInput.text) // Save the new name
				storeValue("userPhone",PhoneInput.dialCode+PhoneInput.value.replace(" ","")); // Save the new phone number
			}

			await ProfileEditor_Submit.run();
			if (!ProfileEditor_Submit.responseMeta.isExecutionSuccess) {
				console.error("API Error:", ProfileEditor_Submit.responseMeta);
				throw new Error(`Falha ao atualizar usuário: ${ProfileEditor_Submit.responseMeta.statusCode}`);
			}
			else
			{
				showAlert("Usuário atualizado com sucesso!", "success");
				console.log("Update successful:", ProfileEditor_Submit.data);

				//Store the user details
				const getUserDetailsresponse = await GetUserDetails.run();
				if (getUserDetailsresponse && getUserDetailsresponse.Name)
				{ 
					storeValue('userName', getUserDetailsresponse.Name);
					storeValue('userEmail', getUserDetailsresponse.Email);
					storeValue('userUsername', getUserDetailsresponse.Username);
					storeValue('userRole', getUserDetailsresponse.Role);
					storeValue('userGroup', getUserDetailsresponse.Group);
					storeValue('userTel', getUserDetailsresponse.Tel);
					storeValue('userPhoto', getUserDetailsresponse.Photo);
				}
			}
			//resetWidget("fpk_selectImage");

		} catch (error) {
			console.error("Update error:", error);
			showAlert(error.message || "Ocorreu um erro ao atualizar o usuário", "error");
			throw error;
		}
	}
}
