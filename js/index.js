(function() {
  const configuration = {
    CIRCLE_COLOR: "#FF0000",
    POINT_DIAMETER: 11,
  }

  const CanvasElement = (function() {
    'use strict';

    class CanvasElement {
      context = null
      color = ''
      x = 0
      y = 0

      constructor({ x, y, context, color }) {
        this.x = x
        this.y = y
        this.context = context
        this.color = color
      }

      changeCoords = (x, y) => {
        this.x = x
        this.y = y
      }
    }

    return CanvasElement
  })()

  const Circle = (function() {
    'use strict';

    class Circle extends CanvasElement {
      diameter = 0

      constructor(initialValue) {
        super(initialValue)

        const { diameter } = initialValue

        this.diameter = diameter
      }

      draw = () => {
        this.context.strokeStyle = this.color

        this.context.beginPath()
        this.context.arc(this.x, this.y, this.diameter, 0, 2 * Math.PI, false)
        this.context.lineWidth = 1
        this.context.stroke()
      }
    }

    return Circle
  })()

  const Point = (function() {
    'use strict';

    class Point extends CanvasElement {
      outerCircle = null

      constructor(initialValue) {
        super(initialValue)

        this.outerCircle = new Circle({ ...initialValue, diameter: configuration.POINT_DIAMETER })
      }

      draw = () => {
        this.outerCircle.draw()

        this.context.strokeStyle = this.color

        // dot drawing
        this.context.beginPath()
        this.context.arc(this.x, this.y, 1, 0, 2 * Math.PI)
        this.context.stroke()
      }
    }

    return Point
  })()

  const App = (function () {
    'use strict';
    class App {
      canvas = null
      context = null
      draggingPoint = null
      pointsArray = []

      constructor(canvasNode) {
        this.canvas = canvasNode
        this.context = canvasNode.getContext('2d')

        this.setCanvasSize()
        this.setListening()
        this.render()
      }

      onClick = (e) => {
        if (this.draggingPoint) {
        } else {
          // for (let i = 0; i < this.pointsArray.length; i++) {
            // нужно спросить у точек -- это на тебя кликнули?
            // если кликнули на нее, то нужно isDragging = true поставить в App и в конкретной точке
          // }

          // сейчас научимся просто добавлять точки
          const [x, y] = [e.clientX, e.clientY];

          this.pointsArray.push(new Point({ x, y, context: this.context, color: configuration.CIRCLE_COLOR }))

          this.render()
        }
      }

      onMouseMove = (e) => {
        if (this.isDragging) {}
      }

      onMouseDown = () => {
        this.isDragging = false
      }

      setListening = () => {
        window.addEventListener('resize', () => {
          this.setCanvasSize()
          this.render()
        })

        canvasNode.addEventListener('click', this.onClick)
        canvasNode.addEventListener('mousemove', this.onMouseMove)
        canvasNode.addEventListener('mousedown', this.onMouseDown)
      }

      setCanvasSize = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }

      clearCanvas = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      }

      render = () => {
        this.clearCanvas()

        for (let i = 0; i < this.pointsArray.length; i++) {
          const currentPoint = this.pointsArray[i]

          currentPoint.draw()
        }
      }

      reset = () => {
        this.pointsArray = []
        this.draggingPoint = null

        this.clearCanvas()
      }
    }

    return App
  })()

  const canvasNode = document.querySelector('#shapesCanvas')
  const resetButton = document.querySelector('#reset-button')
  const infoButton = document.querySelector('#info-button')

  // running app
  const app = new App(canvasNode)

  resetButton.addEventListener('click', app.reset)
})()