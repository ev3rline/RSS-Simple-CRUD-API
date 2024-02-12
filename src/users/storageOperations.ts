import * as uuid from 'uuid';

import { User } from '../utils/userType';
import { writeFile, readFile } from "../utils/fileOperations";

export default class UserStorage {
    async getUsersDBL() {
        return JSON.parse((await readFile()).toString());
    };

    async getUserByIdDBL(userId: string) {
        let users = JSON.parse((await readFile()).toString());
        let user = users.find((user: User) =>  user.id === userId);
        return user;
    };

    async saveUserDBL(user: User) {
        let users = JSON.parse((await readFile()).toString());
        user.id = uuid.v4();
        users.push(user);
        await writeFile(JSON.stringify(users));
        return user.id;
    };

    async updateUserDBL(userId: string, updatedUser: User) {
        let users = JSON.parse((await readFile()).toString());
        const userIndex = users.findIndex((user: User) => user.id === userId);

        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex],
                ...updatedUser,
                id: userId,
            };
            await writeFile(JSON.stringify(users));
            return users[userIndex];
        } else {
            return null;
        }
    };

    async removeUserDBL(userId: string) {
        let users = JSON.parse((await readFile()).toString());
        const userIndex = users.findIndex((user: User) => user.id === userId);

        if (userIndex !== -1) {
            let removedUser = users.splice(userIndex, 1)[0];
            await writeFile(JSON.stringify(users));
            return removedUser.id;
        } else {
            return null;
        }
    };
}
