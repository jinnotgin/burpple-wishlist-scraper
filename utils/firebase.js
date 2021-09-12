import admin from "firebase-admin";
import { readFile } from "fs/promises";
import appRoot from "app-root-path";
const serviceAccount = JSON.parse(
	await readFile(
		new URL(`${appRoot}/secrets/service-account-file.json`, import.meta.url)
	)
);

// ENV alternative
// export GOOGLE_APPLICATION_CREDENTIALS="/Users/jin/Downloads/service-account-file.json"

const getFirestore = () => {
	admin.initializeApp({
		// credential: admin.credential.applicationDefault(), ENV
		credential: admin.credential.cert(serviceAccount),
	});

	const db = admin.firestore();
	const usersRef = db.collection("users");

	const getSnapshot = async () => {
		const snapshot = await usersRef.get();
		return snapshot;
	};

	const getUsernames = async () => {
		const snapshot = await getSnapshot();

		const array = [];
		snapshot.forEach(async (doc) => {
			const username = await doc.data().usernameBurpple;

			array.indexOf(username) === -1
				? array.push(username)
				: console.log(`${username} already exists / is duplicated`);
		});

		return data;
	};

	return {
		getSnapshot,
		getUsernames,
	};
};

const firestore = getFirestore();
export default firestore;
