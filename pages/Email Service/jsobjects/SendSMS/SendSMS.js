export default {
	async sendEmails() {
		try{
			for (const row of Table1.selectedRows) {
				await storeValue('currentEmail_Target', row.Email);
				await SendEmail.run();
			}
		} catch {return false}
		return true;
	},

	
  SelectedMessages() {
		const messageslist = {
			welcome: "Olá! 👋 Seja muito bem-vindo(a)! É um prazer tê-lo(a) connosco. Caso necessite de assistência, não hesite em contactar-nos.",
			feedback: "A sua opinião é de extrema importância para nós. Por favor, partilhe o seu feedback para que possamos melhorar continuamente.",
			support: "Estamos ao seu dispor para ajudar. Por favor, descreva o problema que está a enfrentar para que possamos prestar o devido suporte.",
			feature: "Temos uma nova funcionalidade fantástica! 🚀 Convidamo-lo(a) a explorá-la e a partilhar a sua opinião.",
			sales: "🎉 Promoção imperdível! Aproveite as nossas ofertas especiais por tempo limitado. Clique aqui para obter mais informações."
		};
    return messageslist[MessageType.selectedOptionValue];
  }

}