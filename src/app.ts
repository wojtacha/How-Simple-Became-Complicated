import express, { Request, Response, NextFunction } from 'express';
import { check, header, oneOf, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import { userStore, XApiKeyToken } from './storage';

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


const optionsRequest = function (request: Request, response: Response, next: NextFunction) {
    const today = new Date(Date.now());
    response.status(204)
        .set('Date', today.toUTCString())
        .set('Access-Control-Allow-Methods', ['GET'])
        .set('Access-Control-Allow-Headers', ['x-api-keys', 'Content-Type']);
};

const getRoot = function () {
    return function (request: Request, response: Response, next: NextFunction) {
        const today = new Date(Date.now());
        response.status(200).json({ message: "If you don't have an account you can create one by making post request here: /createAccount" });
    };
};

app.options('/', optionsRequest);

app.get('/', getRoot);

app.post('/account',
    header('Content-Type').isIn(['application/json', 'application/vnd.api+json']),
    check('username').exists(),
    (request: Request, response: Response, next: NextFunction) => {
        try {
            validationResult(request).throw();
            let token: XApiKeyToken = userStore.addUser(request.body.username);
            response.status(201).json({
                status: "User created",
                "username": request.body.username,
                "x-api-key": token.value
            })

        } catch (err) {
            console.log(err);
            response.status(404).json({ message: "Zjebao sie", error: err });
        }
    });

app.put('/account/charge/:accountNumber',function(request:Request, response:Response){
    
} );

app.delete('/account/:accountNumber');


app.listen(port, () => {
    console.log(`Timezones by location application is running on port ${port}.`);
});

