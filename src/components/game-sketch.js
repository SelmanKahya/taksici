import {Network, Layer} from 'synaptic';

class NNetwork {
  learningRate = 0.3;

  constructor() {
    var inputLayer = new Layer(2);
    var hiddenLayer1 = new Layer(10);
    // var hiddenLayer2 = new Layer(5);
    var outputLayer = new Layer(2);
    inputLayer.project(hiddenLayer1);
    hiddenLayer1.project(outputLayer);
    // hiddenLayer2.project(outputLayer);
    this.nn = new Network({
    	input: inputLayer,
    	hidden: [hiddenLayer1],
    	output: outputLayer
    });

    // console.log(this.nn)
    // for (var i = 0; i < 10; i++) {
    // 	this.nn.activate([Math.random()]);
    // 	this.nn.propagate(
    //     this.learningRate,
    //     [Math.random(), Math.random(), Math.random(), Math.random()]
    //   );
    // }
    // console.log('trained')
    // console.log(this.nn.activate([Math.random()]));
  }
}

const WIDTH = 640;
const HEIGHT = 480;

const getRadian = angle => angle * Math.PI / 180

class DistanceSensor {
  maxDistance = 100;
  foundX = 0;
  foundY = 0;

  findIntersection = (counter, worldPixels, carX, carY, targetX, targetY, carAngle) => {
    const distance = Math.sqrt(
      Math.pow((carX - targetX), 2) +
      Math.pow((carY - targetY), 2)
    )
    // console.log(distance)
    if (counter > this.maxDistance) {
      return false;
    }
    const pixel = worldPixels[Math.floor(carY) * WIDTH + Math.floor(carX)];
    if (pixel && pixel[0] !== 0) {
      // const centerX = carX + (targetX - carX ) / 2
      // const centerY = carY + (targetY - carY ) / 2
      return this.findIntersection(
        counter + 1,
        worldPixels,
        carX + 1 * Math.cos(getRadian(carAngle)),
        carY + 1 * Math.sin(getRadian(carAngle)),
        targetX,
        targetY,
        carAngle
      )
    }
    return [carX, carY]
  }

  getValue = (worldPixels, carX, carY, carAngle) => {
    const targetX = carX + this.maxDistance * Math.cos(getRadian(carAngle)) + 20;
    const targetY = carY + this.maxDistance * Math.sin(getRadian(carAngle)) + 12.5;
    if (worldPixels) {
      const result = this.findIntersection(0, worldPixels, carX, carY, targetX, targetY, carAngle);
      const [foundX, foundY] = result ? result : [targetX, targetY]
      this.foundX = foundX;
      this.foundY = foundY;
      return Math.min(1,
        Math.sqrt(Math.pow((carX - foundX), 2) + Math.pow((carY - foundY), 2))
        / this.maxDistance
      );
    }
    return 0;
  };
}

let carCounter = 0;

class Car {
  constructor() {
    this.reset();
    this.id = carCounter++;
  }

  reset() {
    this.start = Date.now();
    this.x = 80;
    this.y = 50;
    this.width = 40;
    this.height = 25;
    this.angle = 0;
    this.sensors = [new DistanceSensor()];

    this.speed = 2;
    this.maxSpeed = 3;
    this.acc = 0.5;
  }

  speedUp = () => {
    // this.speed = Math.min(this.maxSpeed, this.speed += this.acc);
  };

  speedDown = () => {
    // this.speed = Math.max(0.1, this.speed -= this.acc);
  };

  steerLeft = () => {
    this.angle = (this.angle - 4) % 360;
  }

  steerRight = () => {
    this.angle = (this.angle + 4) % 360;
  }

  update = (myNetwork, worldPixels) => {
    this.x += this.speed * Math.cos(getRadian(this.angle));
    this.y += this.speed * Math.sin(getRadian(this.angle));

    const sensorData = this.collectSensorData(worldPixels);
    if (sensorData[0] === 0) {
      console.log('dead')
      this.reset();
    	// myNetwork.nn.propagate(0.3, [((Date.now() - this.start) / 1000) / 20]);
    } else {
    	// myNetwork.nn.propagate(0.3, [1]);
    }


    // TODO angle?
    let [output1, output2] = myNetwork.nn.activate([
      sensorData, this.angle
    ]);

    // if (this.speed === 0.1) {
    //   console.log(this.id);
    //   myNetwork.nn.propagate(0.1, [
    //     Math.random(),
    //     0.6
    //   ])
    // }

    const shouldSteerLeft = output1 > output2
    if (shouldSteerLeft) {
      this.steerLeft();
    } else {
      this.steerRight();
    }

    // if (speed <= 0.5) {
    //   this.speedDown();
    // } else if (speed > 0.5) {
    //   this.speedUp();
    // }

    const newSensorData = this.collectSensorData(worldPixels);
    if (newSensorData[0] === 1) {
      myNetwork.nn.propagate(0.3, [
        0.5,
        0.5
      ])
    } else if (newSensorData[0] < sensorData[0]){
      myNetwork.nn.propagate(0.2,
        shouldSteerLeft ? [0, 1] : [1, 0])
    } else {
      // myNetwork.nn.propagate(0.2, [output1, output2])
    }
  };

  collectSensorData = (worldPixels) => {
    return this.sensors.map(sensor =>
      sensor.getValue(worldPixels, this.x, this.y, this.angle));
  }
};

export default function sketch(p){
    let frameCount = 0;
    const cars = [];
    for (var i = 0; i < 100; i++) {
      cars.push(new Car())
    }
    const myNetwork = new NNetwork();
    let worldPixels;
    let canvas;
    let image;

    p.setup = () => {
      canvas = p.createCanvas(WIDTH, HEIGHT);
      p.noStroke();
      p.background(255);

      worldPixels = JSON.parse(window.localStorage.getItem('map')).values;
      const image1 = p.get(0, 0, WIDTH, HEIGHT);
      image1.loadPixels();
      for (var i = 0; i < image1.pixels.length; i += 4) {
        const startIndex = Math.floor(i / 4);
        image1.pixels[i] = worldPixels[startIndex][0];
        image1.pixels[i + 1] = worldPixels[startIndex][1];
        image1.pixels[i + 2] = worldPixels[startIndex][2];
        image1.pixels[i + 3] = 255;
      }
      image1.updatePixels();
      image = image1;
    }

    p.mousePressed = () => {
      console.log(p.get(p.mouseX, p.mouseY));
    }

    p.draw = () => {
      p.update();

      if (true ) { //frameCount++ % 30 === 0) {

        p.background(255);
        if (image) {
          p.image(image, 0, 0, WIDTH, HEIGHT);
        }

        const car = cars[0];
        p.rectMode(p.CENTER)
        p.translate(car.x, car.y);
        p.angleMode(p.DEGREES);
        p.rotate(car.angle);
        p.fill(150, 100, 200);
        p.rect(0, 0, car.width, car.height);
        p.fill(150, 150, 150);
        p.rect(10, 0, 10, 15);
        p.fill('black');
        p.rect(25, -8.5, 4, 6);
        p.rect(25, 8.5, 4, 6);

        p.stroke('red');
        car.sensors.map(sensor => {
          const targetX = sensor.maxDistance * Math.cos(getRadian(car.angle));
          const targetY = sensor.maxDistance * Math.sin(getRadian(car.angle));
          p.rotate(-car.angle);
          p.line(0, 0, targetX, targetY)
          p.rect(sensor.foundX - car.x, sensor.foundY - car.y, 15, 15);
        });
        p.stroke(0);
      }
    }

    p.update = () => {
      /*
      if (p.keyIsDown(87)) {
        // UP
        car.speedUp();
      }
      if (p.keyIsDown(83)) {
        car.speedDown();
      }
      if (p.keyIsDown(65)) {
        // LEFT
        car.steerLeft();
      }
      if (p.keyIsDown(68)) {
        car.steerRight();
      }
      */

      cars.forEach(car =>
        car.update(myNetwork, worldPixels)
      );
    };

    p.myCustomRedrawAccordingToNewPropsHandler = (newProps) => {
      if(canvas) //Make sure the canvas has been created
        p.fill(newProps.color);
    }

    p.keyPressed = () => {
      if (p.keyCode === 76) {

      }
    }
}
