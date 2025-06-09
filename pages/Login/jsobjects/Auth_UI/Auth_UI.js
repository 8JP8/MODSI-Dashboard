export default {
	defaultTab: 'Log In',

	setDefaultTab: function(newTab) {
		this.defaultTab = newTab;
	},
 
	loggedInCheck: function() {
		if (appsmith.store.authToken && appsmith.store.authToken.length > 0) {
			if (!appsmith.store.authDefaultTab) { this.setDefaultTab("Sign Out"); }
			else { this.setDefaultTab(appsmith.store.authDefaultTab); }
		}
	}
};