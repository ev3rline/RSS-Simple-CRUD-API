import http from 'node:http';
import * as uuid from 'uuid';

import { sendResponse } from '../utils/responseHandler';
import { User } from '../utils/userType';
import UserStorage from './storageOperations';

const userStorage = new UserStorage();

export const getUsers = async (res: http.ServerResponse<http.IncomingMessage>) => {
    let users = await userStorage.getUsersDBL();
    sendResponse(res, 200, { "Content-Type": "application/json" }, users);
}

export const getUserById = async (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>, userId: string) => {
    if (!uuid.validate(userId)){
        sendResponse(
            res,
            400,
            { "Content-Type": "application/json" },
            'User Id is incorrect'
        );
        return;
    }
    const user = await userStorage.getUserByIdDBL(userId);
    if (user) {
        sendResponse(
            res,
            200,
            { "Content-Type": "application/json" },
            user
        );
    } else {
        sendResponse(
            res,
            404,
            { "Content-Type": "application/json" },
            `User with id equals ${userId} does not exists`
        );
    }
}

export const saveUser = async (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) => {
    let requestBody = '';
    req.on('data', async (chunk) => {
        requestBody += chunk;
        try {
            const { username, age, hobbies, id} = JSON.parse(requestBody);
            let isValidInput =
                typeof username === 'string' &&
                typeof age === 'number' &&
                Array.isArray(hobbies) &&
                !hobbies?.find((item: any) => {
                    return typeof item !== 'string';
                });
            if (id) {
                sendResponse(
                    res,
                    500,
                    { "Content-Type": "application/json" },
                    `You cannot set user id. This parameter will be set automatically`
                );
                return;
            }
            if (isValidInput) {
                const user = JSON.parse(requestBody) as User;
                const newUserId = await userStorage.saveUserDBL(user);
                sendResponse(
                    res,
                    201,
                    { "Content-Type": "application/json" },
                    `The new user was saved with id:${newUserId}`
                );
            } else {
                sendResponse(
                    res,
                    400,
                    { "Content-Type": "application/json" },
                    'The new user record does not contain one of the following required parameters or has wrong type of parameter'
                );
            }
        } catch (error) {
            sendResponse(
                res,
                500,
                { "Content-Type": "application/json" },
                'Cannot process sended record'
            );
        }
    });
}

export const updateUser = async (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>, userId: string) => {
    if (!uuid.validate(userId)){
        sendResponse(
            res,
            400,
            { "Content-Type": "application/json" },
            'User Id is incorrect'
        );
        return;
    }

    let requestBody = '';
    req.on('data', async (chunk) => {
        requestBody += chunk;
        try {
            const { username, age, hobbies, id} = JSON.parse(requestBody);
            let isValidInput =
                typeof username === 'string' ||
                typeof age === 'number' ||
                (   Array.isArray(hobbies) &&
                    !hobbies?.find((item: any) => {
                        return typeof item !== 'string';
                    })
                );

            if (id) {
                sendResponse(
                    res,
                    500,
                    { "Content-Type": "application/json" },
                    `You cannot update user id`
                );
                return;
            }
            if (isValidInput) {
                const user = JSON.parse(requestBody) as User;
                const updatedUser = await userStorage.updateUserDBL(userId, user);
                if (updatedUser) {
                    sendResponse(
                        res,
                        200,
                        { "Content-Type": "application/json" },
                        updatedUser
                    );
                } else {
                    sendResponse(
                        res,
                        404,
                        { "Content-Type": "application/json" },
                        `User with id equals ${userId} does not exists`
                    );
                }
            } else {
                sendResponse(
                    res,
                    500,
                    { "Content-Type": "application/json" },
                    'The new user record does not contain one of the following required parameters or has wrong type of parameter'
                );
            }
        } catch (error) {
            sendResponse(
                res,
                500,
                { "Content-Type": "application/json" },
                'Cannot process sended record'
            );
        }
    });
}

export const removeUser = async (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>, userId: string) => {
    if (!uuid.validate(userId)){
        sendResponse(
            res,
            400,
            { "Content-Type": "application/json" },
            'User Id is incorrect'
        );
        return;
    }
    const removedUserId = await userStorage.removeUserDBL(userId);
    if (removedUserId) {
        sendResponse(
            res,
            204,
            { "Content-Type": "application/json" },
            `User with id equals ${removedUserId} was successfully removed`
        );
    } else {
        sendResponse(
            res,
            404,
            { "Content-Type": "application/json" },
            `User with id equals ${userId} does not exists`
        );
    }
}
