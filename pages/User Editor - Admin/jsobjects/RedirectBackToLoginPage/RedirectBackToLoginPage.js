export default {
  checkAuthToken: async () => {
    if (!appsmith.store.authToken) {
      // Call redirectToLogin function if no authToken
      await this.redirectToLogin();
      return; // Stop further execution
    }
    try {
      await CheckToken.run();
    } catch (e) {
      // You can optionally handle error here
    }
    if (CheckToken.responseMeta.statusCode !== "200 OK") {
      await this.redirectToLogin();
    }
  },

  redirectToLogin: async () => {
    // Redirect to the login page if authToken is null or empty
    navigateTo("Login");
    clearStore();
  }
}