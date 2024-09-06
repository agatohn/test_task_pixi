export enum ShapeType {
  Triangle = 3,
  Square = 4,
  Pentagon = 5,
  Hexagon = 6,
  Circle = 1,
  Ellipse = 2,
  Star = 7,
}

export interface Shape {
  id: number;
  type: ShapeType;
  color: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  velocity: number;
}

export class ShapeModel {
  shapes: Shape[] = [];
  totalSurfaceArea: number = 0;

  addShape(shape: Shape) {
    this.shapes.push(shape);
    this.totalSurfaceArea += this.calculateArea(shape);
  }

  updateShapesColor(shapeType: ShapeType, color: number) {
    this.shapes.forEach((shape) => {
      if (shape.type === shapeType) {
        shape.color = color;
      }
    });
  }

  updateShapesGravity(velocity: number) {
    this.shapes.forEach((shape) => {
      shape.velocity = velocity;
    });
  }

  removeShape(shapeId: number) {
    const shapeIndex = this.shapes.findIndex((shape) => shape.id === shapeId);
    if (shapeIndex >= 0) {
      this.totalSurfaceArea -= this.calculateArea(this.shapes[shapeIndex]);
      this.shapes.splice(shapeIndex, 1);
    }
  }

  calculateArea(shape: Shape): number {
    switch (shape.type) {
      case ShapeType.Triangle:
        return Math.round((shape.size.width * shape.size.height) / 2);
      case ShapeType.Square:
        return Math.round(shape.size.width * shape.size.height);
      case ShapeType.Pentagon:
        return Math.round(
          (5 *
            shape.size.width *
            shape.size.height *
            Math.sin((2 * Math.PI) / 5)) /
            2
        );
      case ShapeType.Hexagon:
        return Math.round(shape.size.width * shape.size.height * 0.75);
      case ShapeType.Circle:
        return Math.round(Math.PI * (shape.size.width / 2) ** 2);
      case ShapeType.Ellipse:
        return Math.round(Math.PI * shape.size.width * (shape.size.height / 2));
      case ShapeType.Star:
        let area = 0;
        const starPoints = [];
        const step = Math.PI / 5;
        for (let i = 0; i < 2 * 5; i++) {
          const radius = i % 2 === 0 ? 10 : shape.size.width / 2;
          const angle = i * step - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          starPoints.push(x, y);
        }
        const n = starPoints.length / 2;
        for (let i = 0; i < n; i++) {
          const x1 = starPoints[2 * i];
          const y1 = starPoints[2 * i + 1];
          const x2 = starPoints[(2 * (i + 1)) % (2 * n)];
          const y2 = starPoints[(2 * (i + 1) + 1) % (2 * n)];
          area += x1 * y2 - x2 * y1;
        }
        return Math.round(area / 2);
      default:
        return 0;
    }
  }
}
