import { useState } from "react";
import axios from "axios";

function App() {
	const [message, setMessage] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [buttons, setButtons] = useState([
		{ text: "", url: "", callback_data: "" },
	]);

	const handleFileChange = (e) => {
		setSelectedFile(e.target.files[0]);
	};

	const handleButtonChange = (index, event) => {
		const { name, value } = event.target;
		const newButtons = [...buttons];
		newButtons[index][name] = value;
		setButtons(newButtons);
	};

	const addButton = () => {
		setButtons([...buttons, { text: "", url: "", callback_data: "" }]);
	};

	const removeButton = (index) => {
		const newButtons = buttons.filter((_, i) => i !== index);
		setButtons(newButtons);
	};

	const createButton = ({ text, url, callback_data }) => {
		if (url && url !== "") {
			return { text, url };
		} else if (callback_data && callback_data !== "") {
			return { text, callback_data };
		}
		return { text: `${text}` };
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const formData = new FormData();
			formData.append("caption", message);
			if (selectedFile) {
				formData.append("photo", selectedFile);
			}

			const replyMarkup = {
				inline_keyboard: buttons.map(createButton).map((button) => [button]),
			};

			formData.append("reply_markup", JSON.stringify(replyMarkup));

			await axios.post(
				`https://api.hibra.org/api/v1/admin/post-notice`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			setSuccess("Message sent successfully!");
		} catch (err) {
			setError("Sent message failed with error: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="telegram-form p-4 w-[1500px]">
			<h1 className="text-2xl mb-4">Create Notice</h1>
			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label htmlFor="message" className="block text-lg mb-2">
						Caption:
					</label>
					<textarea
						id="message"
						type="text"
						className="w-full p-2 border rounded"
						placeholder="Enter caption..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
				</div>

				<div className="mb-4">
					<label htmlFor="file" className="block text-lg mb-2">
						Upload Image:
					</label>
					<input
						id="file"
						type="file"
						className="w-full p-2 border rounded"
						accept="image/*"
						onChange={handleFileChange}
					/>
				</div>

				<div className="mb-4">
					<h3 className="text-lg mb-2">Buttons:</h3>
					{buttons.map((button, index) => (
						<div key={index} className="mb-2 flex space-x-2">
							<input
								type="text"
								name="text"
								className="w-1/2 p-2 border rounded"
								placeholder="Button's text..."
								value={button.text}
								onChange={(e) => handleButtonChange(index, e)}
							/>
							<input
								type="text"
								name="url"
								className="w-1/2 p-2 border rounded"
								placeholder="Button's URL..."
								value={button.url}
								onChange={(e) => handleButtonChange(index, e)}
							/>
							<input
								type="text"
								name="callback_data"
								className="w-1/2 p-2 border rounded"
								placeholder="Button's command..."
								value={button.callback_data}
								onChange={(e) => handleButtonChange(index, e)}
							/>
							<button
								type="button"
								className="bg-red-500 text-white px-2 rounded w-[45px]"
								onClick={() => removeButton(index)}
							>
								X
							</button>
						</div>
					))}
					<button
						type="button"
						className="bg-green-500 text-white px-4 py-2 rounded"
						onClick={addButton}
					>
						Add Button
					</button>
				</div>

				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded"
					disabled={loading}
				>
					{loading ? "Sending..." : "Send message"}
				</button>
			</form>

			{error && <p className="text-red-500 mt-4">{error}</p>}
			{success && <p className="text-green-500 mt-4">{success}</p>}
		</div>
	);
}

export default App;
