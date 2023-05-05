import express, { Application, Request, Response } from "express";
import { UserLocationDetails } from "./Models/SharedModels";

export class App {
    public app: Application;
    public gc: UserLocationDetails = {} as UserLocationDetails;
    public result:any[] = []
    private readonly DEGREES_IN_RADIAN: number=57.29577951;
    private readonly MEAN_EARTH_RADIUS_KM: number = 6371;
    private readonly KILOMETRES_IN_MILE: number = 1.60934;

    constructor() {
        this.app = express();
        debugger;
        this.routes()
    }

        calcGreatCircle(start:any[]) {
       
    this.gc = new UserLocationDetails();
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



    



    calculateRadians(gc: UserLocationDetails) {
        gc.latitude1_radians = gc.latitude1_degrees / this.DEGREES_IN_RADIAN;
        gc.longitude1_radians = gc.longitude1_degrees / this.DEGREES_IN_RADIAN;

        gc.latitude2_radians = gc.latitude2_degrees / this.DEGREES_IN_RADIAN;
        gc.longitude2_radians = gc.longitude2_degrees / this.DEGREES_IN_RADIAN;
    }

    calculateCentralAngle(gc: UserLocationDetails) {
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

    calculateDistance(gc: UserLocationDetails) {
        gc.distance_kilometres = this.MEAN_EARTH_RADIUS_KM * gc.central_angle_radians;

        gc.distance_miles = gc.distance_kilometres / this.KILOMETRES_IN_MILE;
    }




    protected routes(): void {

        var fs = require('fs');
        const amqp = require('amqplib/callback_api');

        console.log('ready');
        





        var data = fs.readFileSync('./build/customer', 'utf8');

        var splitted = data.split('\r\n') as string[]


        let arrayKeysObject: String[] = [];
        let arrayValuesObject: String[] = [];
        let array1 = [];
        let array3: String[][] = []; 

        splitted.forEach(firstElement => {
            let obj2 = firstElement.trim().split(',');

            obj2.forEach(secondElement => {
                let obj3 = secondElement.trim().split(',');

                obj3.forEach(thirdElement => {
                    let obj4 = thirdElement.trim().split(':');

                    obj4.forEach(fourthElement => {
                        if (fourthElement != '') {

                            if (obj4.indexOf(fourthElement) == 0) {
                                arrayKeysObject.push(fourthElement ?? 0);
                            } else {
                                arrayValuesObject.push(fourthElement ?? 0);
                            }
                        }
                    })
                })
            });
        });
        let i = 0
        for (let index = i; index < arrayValuesObject.length; index++) {
            array1 = [];
            for (let j = 0; j < 3; j++) {
                array1.push(arrayValuesObject[index + j])
                i = index + j;
            }
            index = i;
            array3.push(array1);
        }
 
        this.app.route("/").get((req: Request, res: Response) => {
           
            
             this.result=[];

                for (let i = 0; i < array3.length; i++) {
            let output = this.calcGreatCircle(array3[i]);

            if(output.distance_kilometres<=100)
            this.result.push(output);
                   
                    
                }

            console.log(this.result)
             
amqp.connect('amqp://localhost', (connError:any, connection:any) => {
    if (connError) {
        throw connError;
    } 
    connection.createChannel((channelError:any, channel:any) => {
        if (channelError) {
            throw channelError;
        } 
        for (let index = 0; index < this.result.length; index++) {
             const QUEUE = this.result[index].name1;  
              channel.assertQueue(QUEUE); 
        channel.sendToQueue(QUEUE, Buffer.from(`${QUEUE} You have been invited to FINTECH CO Anniversary celebration`));
        console.log(`Message sent to ${QUEUE}`);
        }
      
    })
}) 
            res.send(this.result)
        });

















        this.app.route("/user").get((req: Request, res: Response) => {
 
   amqp.connect('amqp://localhost', (connError:any, connection:any) => {
    if (connError) {
        throw connError;
    } 
    connection.createChannel((channelError:any, channel:any) => {
        if (channelError) {
            throw channelError;
        } 
        for (let index = 0; index < this.result.length; index++) {
            const QUEUE = this.result[index].name1;
         
        channel.assertQueue(QUEUE); 
        channel.consume(QUEUE, (msg:any) => {
            console.log(`Message received: ${msg.content.toString()}`)
        }, {
            noAck: true
        })
        }
        
    })
})

        })

    }
}

const port: number = 700
const app = new App().app

app.listen(port, () => {
    console.log('server started successfully')
})