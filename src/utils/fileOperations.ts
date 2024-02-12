import fs from 'node:fs';
import path from 'node:path';

const currentDirectory = path.dirname(__dirname);
const pathToUserStorage = path.join(currentDirectory, 'users', 'userStorage.json');

export const readFile = async() => {
    let response = await fs.promises.readFile(pathToUserStorage);
    return response;
}

export const writeFile = async(data: string) => {
    await fs.promises.writeFile(pathToUserStorage, data);
}