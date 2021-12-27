import express, { Request, Response, NextFunction } from "express";
import { body, param, check, header, oneOf, validationResult } from "express-validator";
import bodyParser from "body-parser";
import { userStore, Token } from "./storage";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//     res.setTimeout(10000, function(){
//             res.status(408).json({"message":"Request has timed out."});
//         });

//     // next();
// });

const allUsers = (request: Request, response: Response, next: NextFunction) => {
    try {
        validationResult(request).throw();
        let values = userStore.getUsers();
        response.status(200).json(values);
    } catch (err) {
        response.status(404).json({ message: "Zjebao sie", error: err });
    }
};

const optionsRequest = function (request: Request, response: Response, next: NextFunction
) {
    const today = new Date(Date.now());
    return response
        .status(204)
        .set("Date", today.toUTCString())
        .set("Access-Control-Allow-Methods", ["GET"])
        .set("Access-Control-Allow-Headers", ["x-api-keys", "Content-Type"])
        .end();
};

const getRoot = (request: Request, response: Response, next: NextFunction) => {
    const today = new Date(Date.now());
    return response.status(200).json({
        message: "If you don't have an account you can create one by making post request here: /createAccount"
    }).end();
};

app.options("/", optionsRequest);
app.get("/", getRoot);

const ADMIN_TOKEN = "adminc78-d566-4bfb-958f-d127bc8admin";

app.get("/users/:token",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]), param("token").equals(ADMIN_TOKEN),
    allUsers);

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
        response.status(404).json({ message: "Zjebao sie", error: err });
    }
};

app.post(
    "/user",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    check("username").exists(),
    createUser
);

const createAccount = (request: Request, response: Response) => {
    try {
        validationResult(request).throw();
        let token: Token = userStore.createAccount(request.body.userId);
        console.log("po wsio");
        console.log(token);
        
        response.status(201).json({
            status: "Account created",
            "accountId": token.value,
        });
    } catch (err) {
        // console.log(err);
        
        response.status(404).json({ message: "Zjebao sie", error: err });
    }
};
app.post(
    "/account",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    check("userId").exists(),
    createAccount
);

app.put(
    "/account/charge/:accountId",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    body("amount").exists().isInt(),
    body("userId").exists(),
    (request: Request, response: Response, next: NextFunction) => {
        try {
            validationResult(request).throw();
            const userId = request.body.userId;
            const accountId: Token = { value: request.params.accountId };
            const amount = request.body.amount;
            let isUpdated: Boolean = userStore.addFunds(userId, accountId, amount);
            if (isUpdated) {
                return response.status(201);
            }
            return response.status(200).json({ message: "" });
        } catch (err) {
            console.log(err);
            return response.status(404).json({ message: "Zjebao sie", error: err });
        }
    }
);

app.delete(
    "/account/:accountNumber",
    header("Content-Type").isIn(["application/json", "application/vnd.api+json"]),
    (request: Request, response: Response, next: NextFunction) => {
        console.log(request.params);
        return response.status(201);
    }
);

app.listen(port, () => {
    console.log(`Timezones by location application is running on port ${port}.`);
});