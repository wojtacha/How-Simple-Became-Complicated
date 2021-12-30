import express, { Request, Response, NextFunction } from "express";
import { body, param, check, header, oneOf, validationResult } from "express-validator";
import bodyParser from "body-parser";
import { userStore, Token } from "./storage";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ADMIN_TOKEN = "adminc78-d566-4bfb-958f-d127bc8admin";

const optionsRequest = function (request: Request, response: Response, next: NextFunction) {
    const today = new Date(Date.now());
    return response
        .status(204)
        .set("Date", today.toUTCString())
        .set("Access-Control-Allow-Methods", ["GET"])
        .set("Access-Control-Allow-Headers", ["Content-Type"])
        .end();
};

const getRoot = (request: Request, response: Response, next: NextFunction) => {
    return response.status(200).json({
        message: "Hi this is your favorite bank, please take a look at all API paths that you can interact with.",
        line1: "POST, OPTIONS      -- /user",
        line2: "GET, DELETE        -- /user/{userId}",
        line3: "POST               -- /user/{userId}/account",
        line4: "GET DELETE         -- /user/{userId}/account/{accountId}",
        line5: "PUT                -- /user/{userId}/account/{accountId}/insert",
    }).end();
};

app.options("/", optionsRequest);
app.get("/", getRoot);

app.get("/user/:userId",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    param("userId").exists(),
    (request: Request, response: Response, next: NextFunction) => {
        try {
            validationResult(request).throw();
            const userToken = request.params.userId;
            if (userToken === ADMIN_TOKEN) {
                let values = userStore.getUsers();
                response.status(200).json(values);
            }
            const userIdasToken: Token = { value: userToken };
            let value = userStore.getUser(userIdasToken);
            response.status(200).json(value ?? { message: "No such user" });
        } catch (err) {
            response.status(404).json({ message: "Zjebao sie", error: err });
        }
    }
);

const createUser = (request: Request, response: Response) => {
    try {
        validationResult(request).throw();
        let token: Token = userStore.createUser(request.body.username);
        response.status(201).json({
            status: "User created",
            username: request.body.username,
            "userId": token.value,
        });
    } catch (err) {
        console.log(JSON.stringify(err))
        response.status(404).json(err);
    }
};

app.post(
    "/user",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    check("username").exists().isString(),
    createUser
);

const createAccount = (request: Request, response: Response) => {
    try {
        validationResult(request).throw();
        let token: Token = userStore.createAccount({ value: request.params.userId });

        response.status(201).json({
            status: "Account created",
            "accountId": token.value,
        });
    } catch (err) {
        response.status(404).json(err);
    }
};

app.post(
    "/user/:userId/account",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    param("userId").exists(),
    createAccount
);

app.put(
    "/user/:userId/account/:accountId/insert",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    body("amount").exists().isInt(),
    param("userId").exists(),
    (request: Request, response: Response, next: NextFunction) => {
        try {
            validationResult(request).throw();
            const userId: Token = { value: request.params.userId };
            const accountId: Token = { value: request.params.accountId };
            const amount = request.body.amount;
            
            let isUpdated: Boolean = userStore.addFunds(userId, accountId, amount);
            if (isUpdated) {
                return response.status(201).json({ message: "Amount: "+ amount +" added to account." });
            }
            return response.status(200).json({ message: "Cannot add money, all your accounts are suspended due to tax regulations." });
        } catch (err) {
            return response.status(404).json( err );
        }
    }
);

app.delete(
    "/user/:userId",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    param("userId"),
    (request: Request, response: Response, next: NextFunction) => {
        try {
            const userId = { value: request.body.userId };
            userStore.deleteUser(userId);
        } catch (err) {
            return response.status(404).json({ message: "Zjebao sie", error: err });
        }

    }
);

app.delete(
    "/user/:userId/account/:accountId",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    param("userId"),
    param("accountId"),
    (request: Request, response: Response, next: NextFunction) => {
        try {
            const userId: Token = { value: request.params.userId };
            const accountId: Token = { value: request.params.accountId };
            userStore.deleteAccount(userId, accountId);
        } catch (err) {
            console.log(err);
            return response.status(404).json({ message: "Zjebao sie", error: err });
        }
    }
);


app.listen(port, () => {
    console.log(`Timezones by location application is running on port ${port}.`);
});