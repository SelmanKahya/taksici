const WIDTH = 640;
const HEIGHT = 480;

export default function sketch(p){
    let canvas;

    p.setup = () => {
      canvas = p.createCanvas(WIDTH, HEIGHT);
      p.noStroke();
      p.background(255);
    }

    p.mousePressed = () => {
      console.log(p.get(p.mouseX, p.mouseY));
    }

    p.draw = () => {
      p.fill('black');
      p.noStroke();
      if (p.mouseIsPressed === true) {
        p.ellipse(p.mouseX, p.mouseY, 40, 40);
      }
    }

    p.myCustomRedrawAccordingToNewPropsHandler = (newProps) => {
      if(canvas) //Make sure the canvas has been created
        p.fill(newProps.color);
    }

    p.keyPressed = () => {
      console.log(p.keyCode)
      if (p.keyCode === 83) {
        console.log('z')
        const image1 = p.get(0, 0, WIDTH, HEIGHT);
        image1.loadPixels();
        const px = [];
        for (var i = 0; i < image1.pixels.length; i += 4) {
          const R = image1.pixels[i];
          const G = image1.pixels[i + 1];
          const B = image1.pixels[i + 2];
          px.push([R, G, B]);
        }
        console.log('saved')
        window.localStorage.setItem('map', JSON.stringify({values: px}));
      }
    }
}
