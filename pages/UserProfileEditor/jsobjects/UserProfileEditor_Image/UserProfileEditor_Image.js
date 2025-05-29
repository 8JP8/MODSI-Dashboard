export default {
	selectImageonFilesSelected() {
		if (ProfileEditor_ImageUpload.data.data.url && ProfileEditor_ImageUpload.data.data.url.trim().length > 0) {
			img_uploadImage.setImage(ProfileEditor_ImageUpload.data.data.url);
			storeValue("tempUserPhoto",ProfileEditor_ImageUpload.data.data.url);
		}
		else { showAlert("Erro ao fazer o upload da imagem. URL não encontrado.", "error"); }
	},

	resetImage() {
		const defaultimage = "https://www.pngmart.com/files/21/Account-User-PNG-Clipart.png";
		img_uploadImage.setImage(defaultimage);
		storeValue("tempUserPhoto",defaultimage);
	}
}