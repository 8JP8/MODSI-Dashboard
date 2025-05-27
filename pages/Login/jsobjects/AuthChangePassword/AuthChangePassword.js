export default {
  // Step 1: Hash and store old and new passwords separately
  prepareChangePasswordHashes: async () => {
    const oldResult = await Auth_PasswordCheck.getSaltAndHash(inp_oldPassword.text, false, false, 1);
    const newResult = await Auth_PasswordCheck.getSaltAndHash(inp_newPassword.text, true, false, 1);

    if (!oldResult?.pass || !newResult?.pass || !newResult?.salt) {
      throw new Error("Erro ao gerar hashes das passwords.");
    }

    storeValue("hashedOldPassword", oldResult.pass);
    storeValue("hashedNewPassword", newResult.pass);
    storeValue("newPasswordSalt", newResult.salt);
  },

  // Step 2: Hash reset password and store in individual vars
  prepareResetPasswordHashes: async () => {
    const result = await Auth_PasswordCheck.getSaltAndHash(inp_resetNewPassword.text, true, false);

    if (!result?.pass || !result?.salt) {
      throw new Error("Erro ao gerar hash da nova password.");
    }

    storeValue("resetPassword", result.pass);
    storeValue("resetSalt", result.salt);
  },

  // Change Password workflow
  ChangePassword: async () => {
		try {
			await AuthChangePassword.prepareChangePasswordHashes();
			await ChangePassword.run();
			showAlert("A password foi alterada com sucesso", "success");
			navigateTo("Main Page");  // Navigate here on success
		} catch (error) {
			let errorData = ChangePassword.data ?? "Erro desconhecido";
			let type = "error";

			if (errorData === "Current password incorrect or user not found.") {
				errorData = "Password atual errada ou utilizador não encontrado.";
				type = "warning";
			}

			showAlert("Erro ao alterar password: " + errorData, type);
		}
	},


  // Reset Password workflow
	ResetPassword: async () => {
		try {
			await this.prepareResetPasswordHashes();
			await SetNewPasswordWithResetCode.run();
			showAlert("Password redefinida com sucesso!", "success");
			navigateTo("Main Page");
		} catch (error) {
			let errorData = SetNewPasswordWithResetCode.data?.message ?? "Erro desconhecido";
			let type = SetNewPasswordWithResetCode.data?.style ?? "error";

			// Translate specific message
			if (
				errorData.toLowerCase().includes("invalid or expired code") ||
				errorData.toLowerCase().includes("invalid reset code")
			) {
				errorData = "Código inválido ou expirado.";
				type = "error"; // or "warning" if you prefer
			}

			showAlert("Erro ao redefinir password: " + errorData, type);
		}
	},

  // Email check before sending reset code
  handlePasswordResetRequest: () => {
    if (!inp_email.isValid || inp_email.text.trim() === "") {
      showAlert("Coloque o seu email e clique novamente.", "error");
      return;
    }

    PasswordResetRequest.run()
      .then(() => {
        showAlert("Código de redefinição de password enviado para o email", "success");
        Auth_UI.setDefaultTab("Password Reset");
      })
      .catch(() => {
        showAlert("Erro ao enviar o código. Tente novamente mais tarde.", "error");
      });
  }
};