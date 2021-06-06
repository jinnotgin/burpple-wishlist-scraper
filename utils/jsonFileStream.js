import fs from "fs";
import readline from "readline";

const dataTypeMap = {
	array: ["[", "]"],
	object: ["{", "}"],
};

export default class JsonFileStream {
	constructor(filePath, dataType = "array") {
		this.filePath = filePath;
		this.hasInit = false;
		this.dataType = dataType;
	}

	init() {
		if (this.hasInit) throw "File stream in progress.";
		const startCharacter = dataTypeMap[this.dataType][0];
		fs.writeFile(
			this.filePath,
			`{"start": "${new Date().toJSON()}",\n "data": ${startCharacter}\n`,
			(error) => {
				if (error) throw error;
			}
		);
		this.hasInit = true;
	}

	append(entries) {
		if (!!!this.hasInit) throw "File stream not initialised yet.";
		var stream = fs.createWriteStream(this.filePath, { flags: "a" });
		entries.forEach(function (item, index) {
			stream.write(`${JSON.stringify(item)},\n`);
		});
		stream.end();
	}

	end() {
		if (!!!this.hasInit) throw "File stream not initialised yet.";
		const endCharacter = dataTypeMap[this.dataType][1];
		fs.appendFile(
			this.filePath,
			`${endCharacter}, "end": "${new Date().toJSON()}" }\n`,
			(error) => {
				if (error) throw error;
			}
		);
		this.hasInit = false;
	}

	get readline() {
		const fileStream = fs.createReadStream(this.filePath);

		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		});

		return rl;
	}
}
