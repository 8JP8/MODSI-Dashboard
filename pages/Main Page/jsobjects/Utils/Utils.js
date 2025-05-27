export default {
  Greetings() {
    const hora = new Date().getHours();
		if (hora < 6) return "Boa noite";
    if (hora < 12) return "Bom dia";
    if (hora < 19) return "Boa tarde";
    return "Boa noite";
	}
}