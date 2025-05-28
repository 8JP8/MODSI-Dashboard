export default {
	fpk_selectImageonFilesSelected () {
		if (ProfileEditor_FileUpload.data.url && ProfileEditor_FileUpload.data.url.trim().length > 0) {
			img_uploadImage.setImage(ProfileEditor_FileUpload.data.url);
			storeValue("tempUserPhoto",ProfileEditor_FileUpload.data.url);
		}
		else { showAlert("Erro ao fazer o upload da imagem. URL não encontrado.", "error"); }
	},

	resetImage() {
		const defaultimage = "https://www.pngmart.com/files/21/Account-User-PNG-Clipart.png";
		img_uploadImage.setImage(defaultimage);
		storeValue("tempUserPhoto",defaultimage);
	}
}