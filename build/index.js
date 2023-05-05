"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const SharedModels_1 = require("./Models/SharedModels");
class App {
    constructor() {
        this.gc = {};
        this.result = [];
        this.DEGREES_IN_RADIAN = 57.29577951;
        this.MEAN_EARTH_RADIUS_KM = 6371;
        this.KILOMETRES_IN_MILE = 1.60934;
        this.app = (0, express_1.default)();
        debugger;
        this.routes();
    }
    // calcGreatCircle(name1: string, latitude1_degrees: number, longitude1_degrees: number, name2: string, latitude2_degrees: number, longitude2_degrees: number) {
    calcGreatCircle(start) {
        this.gc = new SharedModels_1.UserLocationDetails();
        debugger;
        //start
        this.gc.name1 = start[0];
        this.gc.latitude1_degrees = start[1];
        this.gc.longitude1_degrees = start[2];
        //stop
        this.gc.name2 = "FINTECH CO";
        this.gc.latitude2_degrees = 52.493256;
        this.gc.longitude2_degrees = 13.446082;
        if (this.gc.valid) {
            this.calculateRadians(this.gc);
            this.calculateCentralAngle(this.gc);
            this.calculateDistance(this.gc);
        }
        return this.gc;
    }
    calculateRadians(gc) {
        gc.latitude1_radians = gc.latitude1_degrees / this.DEGREES_IN_RADIAN;
        gc.longitude1_radians = gc.longitude1_degrees / this.DEGREES_IN_RADIAN;
        gc.latitude2_radians = gc.latitude2_degrees / this.DEGREES_IN_RADIAN;
        gc.longitude2_radians = gc.longitude2_degrees / this.DEGREES_IN_RADIAN;
    }
    calculateCentralAngle(gc) {
        let longitudes_abs_diff;
        if (gc.longitude1_radians > gc.longitude2_radians) {
            longitudes_abs_diff = gc.longitude1_radians - gc.longitude2_radians;
        }
        else {
            longitudes_abs_diff = gc.longitude2_radians - gc.longitude1_radians;
        }
        gc.central_angle_radians = Math.acos(Math.sin(gc.latitude1_radians)
            * Math.sin(gc.latitude2_radians)
            + Math.cos(gc.latitude1_radians)
                * Math.cos(gc.latitude2_radians)
                * Math.cos(longitudes_abs_diff));
        gc.central_angle_degrees = gc.central_angle_radians * this.DEGREES_IN_RADIAN;
    }
    calculateDistance(gc) {
        gc.distance_kilometres = this.MEAN_EARTH_RADIUS_KM * gc.central_angle_radians;
        gc.distance_miles = gc.distance_kilometres / this.KILOMETRES_IN_MILE;
    }
    routes() {
        var fs = require('fs');
        const amqp = require('amqplib/callback_api');
        console.log('ready');
        var data = fs.readFileSync('./build/customer', 'utf8');
        var splitted = data.split('\r\n');
        let arrayKeysObject = [];
        let arrayValuesObject = [];
        let array1 = [];
        let array3 = [];
        // console.log(splitted);
        splitted.forEach(firstElement => {
            let obj2 = firstElement.trim().split(',');
            obj2.forEach(secondElement => {
                let obj3 = secondElement.trim().split(',');
                obj3.forEach(thirdElement => {
                    let obj4 = thirdElement.trim().split(':');
                    obj4.forEach(fourthElement => {
                        if (fourthElement != '') {
                            if (obj4.indexOf(fourthElement) == 0) {
                                arrayKeysObject.push(fourthElement !== null && fourthElement !== void 0 ? fourthElement : 0);
                            }
                            else {
                                arrayValuesObject.push(fourthElement !== null && fourthElement !== void 0 ? fourthElement : 0);
                            }
                        }
                    });
                });
            });
        });
        let i = 0;
        for (let index = i; index < arrayValuesObject.length; index++) {
            array1 = [];
            for (let j = 0; j < 3; j++) {
                array1.push(arrayValuesObject[index + j]);
                i = index + j;
            }
            index = i;
            array3.push(array1);
        }
        // console.log(array3);
        this.app.route("/").get((req, res) => {
            this.result = [];
            for (let i = 0; i < array3.length; i++) {
                let output = this.calcGreatCircle(array3[i]);
                if (output.distance_kilometres <= 100)
                    this.result.push(output);
            }
            console.log(this.result);
            // Step 1: Create Connection
            amqp.connect('amqp://localhost', (connError, connection) => {
                if (connError) {
                    throw connError;
                }
                // Step 2: Create Channel
                connection.createChannel((channelError, channel) => {
                    if (channelError) {
                        throw channelError;
                    }
                    // Step 3: Assert Queue
                    for (let index = 0; index < this.result.length; index++) {
                        // const element = result[index];
                        const QUEUE = this.result[index].name1;
                        //   console.log(result[index]);
                        channel.assertQueue(QUEUE);
                        // Step 4: Send message to queue
                        channel.sendToQueue(QUEUE, Buffer.from(`${QUEUE} You have been invited to FINTECH CO Anniversary celebration`));
                        console.log(`Message sent to ${QUEUE}`);
                    }
                });
            });
            //console.log(thirdArray);
            res.send(this.result);
        });
        this.app.route("/user").get((req, res) => {
            // Step 1: Create Connection
            amqp.connect('amqp://localhost', (connError, connection) => {
                if (connError) {
                    throw connError;
                }
                // Step 2: Create Channel
                connection.createChannel((channelError, channel) => {
                    if (channelError) {
                        throw channelError;
                    }
                    // Step 3: Assert Queue
                    for (let index = 0; index < this.result.length; index++) {
                        const QUEUE = this.result[index].name1;
                        // const QUEUE = 'codingtest'
                        channel.assertQueue(QUEUE);
                        // Step 4: Receive Messages
                        channel.consume(QUEUE, (msg) => {
                            console.log(`Message received: ${msg.content.toString()}`);
                        }, {
                            noAck: true
                        });
                    }
                });
            });
        });
    }
}
exports.App = App;
const port = 700;
const app = new App().app;
app.listen(port, () => {
    console.log('server started successfully');
});
