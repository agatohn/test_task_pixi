import { ShapeModel, Shape, ShapeType } from "../models/ShapeModel";
import { ShapeView } from "../views/ShapeView";

export class ShapeController {
  model: ShapeModel;
  view: ShapeView;
  shapeIdCounter = 0;
  gravity = 1;
  shapesPerSecond = 1;
  private lastUpdateTime: number = 0;
  private shapeCreationAccumulator: number = 0;

  constructor(width: number, height: number) {
    this.model = new ShapeModel();
    this.view = new ShapeView(
      width,
      height,
      this.handleShapeClick.bind(this),
      this.generateShapes.bind(this)
    );

    this.startFalling();
    this.startGeneratingShapes();
  }

  private startGeneratingShapes() {
    requestAnimationFrame(this.generation.bind(this));
  }

  private generation(currentTime: number) {
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;
    this.shapeCreationAccumulator += deltaTime;
    if (this.gravity > 0) {
      const msPerShapeBatch = 1000 / this.shapesPerSecond;
      while (this.shapeCreationAccumulator >= msPerShapeBatch) {
        this.generateShapes();
        this.shapeCreationAccumulator -= msPerShapeBatch;
      }
    }
    this.updateStats();
    requestAnimationFrame(this.generation.bind(this));
  }

  initializeControls() {
    // Controls
    document.getElementById("increaseShapes")!.onclick = () => {
      this.shapesPerSecond++;
      this.updateButtonsState();
    };

    document.getElementById("decreaseShapes")!.onclick = () => {
      if (this.shapesPerSecond > 0) this.shapesPerSecond--;
      this.updateButtonsState();
    };

    document.getElementById("increaseGravity")!.onclick = () => {
      this.gravity++;
      this.updateButtonsState();
      this.model.updateShapesGravity(this.gravity);
    };

    document.getElementById("decreaseGravity")!.onclick = () => {
      if (this.gravity > 0) this.gravity--;
      this.updateButtonsState();
      this.model.updateShapesGravity(this.gravity);
    };

    // initialize UI with default values
    this.updateButtonsState();
  }

  updateButtonsState() {
    // update the View to reflect changes in shapesPerSecond and gravity
    document.getElementById("shapesPerSecondValue")!.innerText =
      this.shapesPerSecond.toString() + " Shapes/sec";
    document.getElementById("gravityValue")!.innerText =
      "Gravity: " + this.gravity.toString();
  }

  updateStats() {
    // update the View to reflect changes in shapes count and total area
    document.getElementById("shapeCount")!.innerText =
      " Shapes: " + this.model.shapes.length.toString();
    document.getElementById("area")!.innerText =
      "Area: " + this.model.totalSurfaceArea.toString();
  }

  generateShapes(x?: number, y?: number) {
    const shape: Shape = {
      id: this.shapeIdCounter++,
      type: this.getRandomShapeType(),
      color: Math.random() * 0xffffff,
      position: {
        x: x || Math.random() * this.view.app.renderer.width,
        y: y || -50,
      },
      size: { width: 50, height: 50 },
      velocity: this.gravity,
    };
    this.model.addShape(shape);
    this.updateStats();
    this.view.renderShapes(this.model.shapes);
  }

  handleShapeClick(shapeId: number, shapeType: ShapeType) {
    this.model.removeShape(shapeId);
    this.view.removeShape(shapeId);
    this.changeColorOfSameTypeShapes(shapeType);
    this.updateStats();
  }

  changeColorOfSameTypeShapes(shapeType: ShapeType) {
    const newColor = Math.random() * 0xffffff;
    this.model.updateShapesColor(shapeType, newColor);
  }

  getRandomShapeType(): ShapeType {
    const types = Object.values(ShapeType).filter((v) => typeof v === "number");
    return types[Math.floor(Math.random() * types.length)] as ShapeType;
  }

  startFalling() {
    this.view.app.ticker.add(() => {
      this.model.shapes.forEach((shape) => {
        shape.position.y += shape.velocity;
        if (
          shape.position.y - shape.size.height / 2 >
          this.view.app.renderer.height
        ) {
          this.model.removeShape(shape.id);
          this.view.removeShape(shape.id);
        }
      });
      this.view.updateShapes(this.model.shapes);
    });
    this.initializeControls();
  }
}
