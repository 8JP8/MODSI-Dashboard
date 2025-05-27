export default {
  async SignIn() {
    // Validate inputs
    if (!(inp_email.isValid && inp_email.text !== "" && inp_password.isValid && inp_password.text !== "")) {
      showAlert("Preencha os campos corretamente", "error");
      return;
    }

    try {
      // Get user details
      const userDetails = await GetUserDetails.run();

      if (userDetails?.Name) {
        storeValue('userId', userDetails.Id);
        storeValue('userName', userDetails.Name);
        storeValue('userEmail', userDetails.Email);
        storeValue('userUsername', userDetails.Username);
        storeValue('userRole', userDetails.Role);
        storeValue('userGroup', userDetails.Group);
        storeValue('userTel', userDetails.Tel);
        storeValue('userPhoto', userDetails.Photo);

        await GetAllRoles.run();
        storeValue('userRoleId', GetAllRoles.data.find(role => role.Name === userDetails.Role)?.Id);

        if (!userDetails.IsVerified) {
          showAlert(
            "Não verificou a sua conta: verifique a sua conta clicando no link enviado para o seu email",
            "error"
          );
          clearStore();
          return false;
        }

        if (userDetails.Role === null) {
          showAlert(
            "Ainda não foi aprovado para entrar no sistema, aguarde pela aprovação de um administrador",
            "error"
          );
          clearStore();
          return false;
        }
      }

      // Hash password
      await Auth_PasswordCheck.getSaltAndHash(inp_password.text, false);

      // Attempt login
      const loginResponse = await Login_GetAuthToken.run();

      if (loginResponse?.Token) {
        storeValue('authToken', loginResponse.Token);
        showAlert("Autenticado com Sucesso", "success");
        navigateTo("Main Page");
        removeValue("wrongPasswordCount");
        return true;
      } 

      // If no token and no error, fallback to generic error alert
      showAlert("Erro no Login: resposta inesperada do servidor", "error");
      
    } catch (error) {
			// Try to read error message from API response data
			const apiErrorMsg = error?.response?.data?.error || "";

			// If API error message contains 'Invalid username/email or password'
			if (
				Login_GetAuthToken.responseMeta?.statusCode?.includes("401") ||
							Login_GetAuthToken.data.ToString().toLowerCase().includes("invalid username/email or password")
			) {
				showAlert("Erro: Password Incorreta", "warning");
				storeValue("wrongPasswordCount", (appsmith.store.wrongPasswordCount ?? 0) + 1);
			} else {
				showAlert("Erro no Login: " + (error.message || "Erro desconhecido"), "error");
			}
		}
  }
}