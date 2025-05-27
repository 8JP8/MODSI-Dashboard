export default {
  async inp_registerUserNameonTextChanged() {
    const username = inp_registerUserName.text;
		

    let validationResult = {
      isValid: false,
      message: ""
    };

    if (!username || username.length < 3) {
      validationResult = {
        isValid: false,
        message: "O nome de utilizador deve ter pelo menos 3 caracteres!"
      };
    } else {
      try {
        await CheckIfUsernameExists.run({  });

        if (CheckIfUsernameExists.data.Exists === false) {
          validationResult = {
            isValid: true,
            message: ""
          };
        } else {
          validationResult = {
            isValid: false,
            message: "O nome de utilizador já existe!"
          };
        }
      } catch (e) {
        validationResult = {
          isValid: false,
          message: "Erro ao verificar o nome de utilizador."
        };
      }
    }

    await storeValue("usernameValidation", validationResult);
  }
};
