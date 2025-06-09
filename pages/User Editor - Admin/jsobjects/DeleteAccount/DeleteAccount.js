export default {
	/**
	 * Handles the two-step delete confirmation process.
	 * 1st click: Sets a confirmation flag in appsmith.store.
	 * 2nd click: Executes the deletion query.
	 * @param {number | string} userId - The ID of the user to delete.
	 */
	handleDelete: async () => {
		// Check if we are already confirming deletion for THIS specific user
		if (appsmith.store.userToDelete === tbl_users.triggeredRow.Id) {
			// This is the SECOND click (the confirmation)
			try {
				// Change the button text to show it's working
				// (This is optional, but good for UX)
				await storeValue('deleteUserButton_Text', 'A eliminar...');

				// 1. TRIGGER THE QUERY
				// IMPORTANT: Replace 'deleteUserQuery' with the actual name of your delete query.
				await DeleteUser.run();

				// 2. VERIFY SUCCESS & SHOW ALERT
				// The query ran successfully.
				showAlert('Utilizador eliminado com sucesso!', 'success');

				// Refresh the table to remove the deleted user from the view
				// IMPORTANT: Replace 'GetAllUsers' with the name of your query that populates the table.
				await GetAllUsers.run();

			} catch (error) {
				// 3. HANDLE ERROR & SHOW ALERT
				// The query failed.
				showAlert('Falha ao eliminar o utilizador.', 'error');
				console.error("Delete query failed:", error);
			} finally {
				// This block runs whether the query succeeded or failed.
				// Reset the state completely.
				closeModal(modal_edit.name);
				await this.resetConfirmation();
			}

		} else {
			// This is the FIRST click
			// 1. UPDATE BUTTON TEXT via appsmith.store
			await storeValue('deleteUserButton_Text', 'Tem a certeza?');
			
			// 2. STORE THE USER ID to indicate which user is pending deletion
			await storeValue('userToDelete', tbl_users.triggeredRow.Id);
		}
	},

	/**
	 * Resets the delete confirmation state.
	 * Call this when a modal is closed or the user cancels the action.
	 */
	resetConfirmation: async () => {
		await storeValue('userToDelete', undefined);
		await storeValue('deleteUserButton_Text', undefined);
	}
}