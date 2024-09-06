import * as PIXI from "pixi.js";
import { Shape, ShapeType } from "../models/ShapeModel";

export class ShapeView {
  app: PIXI.Application;
  container: PIXI.Container;
  shapeSprites: Map<number, PIXI.Graphics> = new Map();
  onShapeClick: (id: number, shapeType: ShapeType) => void;
  onAreaClick: (x?: number, y?: number) => void;

  constructor(
    width: number,
    height: number,
    onShapeClick: (id: number, shapeType: ShapeType) => void,
    onAreaClick: (x?: number, y?: number) => void
  ) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff,
    });
    document
      .getElementById("app")
      ?.appendChild(this.app.view as HTMLCanvasElement);
    this.container = new PIXI.Container();
    this.onShapeClick = onShapeClick;
    this.onAreaClick = onAreaClick;
    this.container.interactive = true;
    this.container.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.container.on("pointerdown", this.handleClick.bind(this));
    this.app.stage.addChild(this.container);
  }

  renderShapes(shapes: Shape[]) {
    shapes.forEach((shape) => {
      if (!this.shapeSprites.has(shape.id)) {
        const graphic = this.createShapeGraphic(shape);
        this.container.addChild(graphic);
        this.shapeSprites.set(shape.id, graphic);
      }
    });
  }

  updateShapes(shapes: Shape[]) {
    shapes.forEach((shape) => {
      const sprite = this.shapeSprites.get(shape.id);
      if (sprite) {
        sprite.position.set(shape.position.x, shape.position.y);
        sprite.tint = shape.color;
      }
    });
  }

  removeShape(shapeId: number) {
    const sprite = this.shapeSprites.get(shapeId);
    if (sprite) {
      this.container.removeChild(sprite);
      this.shapeSprites.delete(shapeId);
    }
  }

  createShapeGraphic(shape: Shape): PIXI.Graphics {
    const graphic = new PIXI.Graphics();
    graphic.beginFill(shape.color);
    switch (shape.type) {
      case ShapeType.Triangle:
        graphic.drawPolygon([
          0,
          0,
          shape.size.width,
          0,
          shape.size.width / 2,
          shape.size.height,
        ]);
        break;
      case ShapeType.Square:
        graphic.drawRect(0, 0, shape.size.width, shape.size.height);
        break;
      case ShapeType.Pentagon:
        this.drawPolygon(graphic, shape, 5);
        break;
      case ShapeType.Hexagon:
        this.drawPolygon(graphic, shape, 6);
        break;
      case ShapeType.Circle:
        graphic.drawCircle(0, 0, shape.size.width / 2);
        break;
      case ShapeType.Ellipse:
        graphic.drawEllipse(0, 0, shape.size.width, shape.size.height / 2);
        break;
      case ShapeType.Star:
        const starPoints = [];
        const step = Math.PI / 5;
        for (let i = 0; i < 2 * 5; i++) {
          const radius = i % 2 === 0 ? 10 : shape.size.width / 2;
          const angle = i * step - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          starPoints.push(x, y);
        }
        graphic.drawPolygon(starPoints);
        break;
    }
    graphic.endFill();
    graphic.interactive = true;
    graphic.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
      e.stopPropagation();
      this.onShapeClick(shape.id, shape.type);
    });
    graphic.position.set(shape.position.x, shape.position.y);
    return graphic;
  }

  drawPolygon(graphic: PIXI.Graphics, shape: Shape, sides: number) {
    const step = (Math.PI * 2) / sides;
    const radius = shape.size.width / 2;
    const points: number[] = [];
    for (let i = 0; i < sides; i++) {
      points.push(Math.cos(step * i) * radius, Math.sin(step * i) * radius);
    }
    graphic.drawPolygon(points);
  }

  handleClick(event: PIXI.FederatedPointerEvent) {
    const { x, y } = event.global;
    this.onAreaClick(x, y);
  }
}
