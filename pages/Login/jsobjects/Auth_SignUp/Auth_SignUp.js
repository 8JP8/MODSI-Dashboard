export default {
	async Register() {
		const inputs = [inp_registerEmail, inp_registerPassword, inp_registerName, inp_registerUserName];

		if (inputs.some(inp => !inp.isValid || !inp.text.trim())) {
			showAlert("Preencha os campos corretamente", "error");
			return;
		}

		await CheckIfUsernameExists.run();

		if (CheckIfUsernameExists.data.Exists) {
			storeValue("usernameValidation", {
				isValid: false,
				message: "O nome de utilizador já existe!"
			});
			showAlert("O nome de utilizador já existe!", "error");
			return;
		} else {
			storeValue("usernameValidation", {
				isValid: true,
				message: "Formato Inválido"
			});
		}

		await CheckIfEmailExistsRegister.run()

		if (CheckIfEmailExistsRegister.data.Exists) {
			storeValue("emailValidation", {
				isValid: false,
				message: "O email de utilizador já existe!"
			});
			showAlert("O email de utilizador já existe!", "error");
			return;
		} else {
			storeValue("emailValidation", {
				isValid: true,
				message: "Formato Inválido"
			});
		}


		try {
			await Auth_PasswordCheck.getSaltAndHash(inp_registerPassword.text, true);
			let response = await SignUp_RegisterUser.run();

			// Log the response status to help debug
			console.log("Response status:", response.status);

			const rawResponse = response.text; // Fetch raw response
			if (response || SignUp_RegisterUser.responseMeta.statusCode == "200 OK") {
				// Log and display success
				showAlert("Registado com sucesso. Espere por aprovação do administrador.", "success");
				if (SendVerificationEmail.responseMeta.isExecutionSuccess) {showAlert("Um email de verificação foi enviado para o seu email", "success"); }
			} else {
				// Try to parse JSON, with better error handling
				try {
					// Check if response is empty or not valid JSON
					if (!rawResponse || rawResponse.trim() === '') {
						showAlert(`Erro no registo: Resposta vazia do servidor (Status: ${response.status})`, "error");
					} else {
						const errorData = JSON.parse(rawResponse);
						showAlert("Erro no registo: " + JSON.stringify(errorData), "error");
					}
				} catch (parseError) {
					console.error("Error parsing JSON:", parseError);
					showAlert(`Erro no registo: ${rawResponse || response.statusText}`, "error");
				}
			}
		} catch (error) {
			console.error("Registration error:", error);
			showAlert("Erro no registo. Tente novamente mais tarde.", "error");
		}
	}
};