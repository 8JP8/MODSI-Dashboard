export default {
  btn_confirmonClick: async () => {
    try {
      const result = await UpdateUser.run();

      // Sucesso — mostra o alerta
      showAlert("Utilizador atualizado com sucesso!", "success");
      console.log("Update bem-sucedido:", result);
      return result;

    } catch (error) {
      // Erro — mostra alerta de erro
      console.error("Erro ao atualizar utilizador:", error);
      showAlert(error.message || "Ocorreu um erro ao atualizar o utilizador", "error");
      throw error;
    }
  }
}
