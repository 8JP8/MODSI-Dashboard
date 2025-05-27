export default {
	async inp_emailonTextChanged() {
		// Verifica se o campo está vazio ou tem menos de 3 caracteres
		if (!inp_email.text || inp_email.text.length < 5) {
			btn_navigateToSignUp.setColor('blue');
			txt_emailCheck.setText(""); // Limpa a mensagem
			return; // Interrompe a execução
		}
		try{
			// Atualiza o texto baseado no resultado (assumindo que `Exists` é a propriedade retornada)
			if (inp_email.isValid) {
				// Executa a query apenas se o email for válido
				await CheckIfEmailExists.run();
				if (CheckIfEmailExists.data.Exists === true) {
					btn_navigateToSignUp.setColor('blue')
					txt_emailCheck.setTextColor('green')
					txt_emailCheck.setText("Email Encontrado");
					txt_emailCheckCopy.setTextColor('green')
					txt_emailCheckCopy.setText("Email Encontrado");
				} else {
					btn_navigateToSignUp.setColor('red')
					txt_emailCheck.setTextColor('red')
					txt_emailCheck.setText("Email Não Registado");
					txt_emailCheckCopy.setTextColor('red')
					txt_emailCheckCopy.setText("Email Não Registado");
				}
			}
			else { btn_navigateToSignUp.setColor('blue'); }
		} catch{}
	},

	async checkEmail() {
		try{
			if (inp_email.isValid) {
				// Run the query only if the email is valid
				await CheckIfEmailExists.run();
				return CheckIfEmailExists.data.Exists === true;
			}
		} catch{}
		return false;
	}
}