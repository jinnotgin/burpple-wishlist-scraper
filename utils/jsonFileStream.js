import fs from "fs";
import readline from "readline";
import outputFile from "output-file";

const dataTypeMap = {
	array: ["[", "]"],
	dictionary: ["{", "}"],
};

export default class JsonFileStream {
	constructor(filePath, dataType = "array") {
		this.filePath = filePath;
		this.dataType = dataType;
		this.hasInit = false;
		this.firstLineWritten = false;
	}

	init() {
		return new Promise((resolve, reject) => {
			try {
				if (this.hasInit) throw "File stream in progress.";

				const startCharacter = dataTypeMap[this.dataType][0];
				outputFile(
					this.filePath,
					// `{"start": "${new Date().toJSON()}", "data": ${startCharacter}\n`
					`{"data": ${startCharacter}\n`
				).then(() => {
					this.hasInit = true;
					this.firstLineWritten = false;
					resolve();
				});
				/*fs.writeFile(
					this.filePath,
					`{"start": "${new Date().toJSON()}", "data": ${startCharacter}\n`,
					(error) => {
						if (error) throw error;
					}
				);*/
			} catch (e) {
				reject(e);
			}
		});
	}

	append(entries, isString = false) {
		return new Promise((resolve, reject) => {
			console.log(entries.length);
			if (!!!this.hasInit) throw "File stream not initialised yet.";
			var stream = fs.createWriteStream(this.filePath, { flags: "a" });

			const thisClass = this;
			entries.forEach(function (item, index) {
				let content = "";
				if (!isString) {
					switch (thisClass.dataType) {
						case "dictionary": {
							content = `"${item.id}": ${JSON.stringify(item)}`;
							break;
						}
						default: {
							content = JSON.stringify(item);
						}
					}
				} else {
					content = item;
				}

				stream.write(`${!!thisClass.firstLineWritten ? "," : ""}${content}\n`);
				if (!!!thisClass.firstLineWritten) thisClass.firstLineWritten = true;
			});
			stream.end();
			stream.on("finish", resolve);
			stream.on("error", reject);
		});
	}

	end(customEndDate = false) {
		return new Promise((resolve, reject) => {
			try {
				if (!!!this.hasInit) throw "File stream not initialised yet.";
				const endCharacter = dataTypeMap[this.dataType][1];
				const endDate = customEndDate ? customEndDate : new Date();

				fs.promises
					.appendFile(
						this.filePath,
						`${endCharacter}, "end": "${endDate.toJSON()}" }\n`,
						(error) => {
							if (error) throw error;
						}
					)
					.then(() => {
						this.hasInit = false;
						this.firstLineWritten = false;

						resolve();
					});
			} catch (e) {
				reject(e);
			}
		});
	}

	get exists() {
		try {
			if (fs.existsSync(this.filePath)) {
				return true;
			}
		} catch (err) {
			return false;
		}
	}

	get readline() {
		try {
			if (this.exists) {
				const fileStream = fs.createReadStream(this.filePath);

				const rl = readline.createInterface({
					input: fileStream,
					crlfDelay: Infinity,
				});

				return rl;
			} else {
				throw "File does not exist.";
			}
		} catch (err) {
			console.error(err);
		}
	}
}
