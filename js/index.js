(function() {
  const configuration = {
    CIRCLE_COLOR: "#FF0000",
    POINT_DIAMETER: 11,
    CLICKED_POINT_COLOR: 'green'
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

      setCoords = (x, y) => {
        this.x = x
        this.y = y
      }

      getCoords = () => {
        return {
          x: this.x,
          y: this.y,
        }
      }

      setColor = (color) => this.color = color
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

      changeColor = (color) => {
        this.setColor(color)

        this.outerCircle.setColor(color)
      }

      changeCoords = (x, y) => {
        this.setCoords(x, y)

        this.outerCircle.setCoords(x, y)
      }

      isClickedInside = ({ x, y }) => {
        const currentRadius = configuration.POINT_DIAMETER

        if (x > this.x - currentRadius && x < this.x + currentRadius
          && y > this.y - currentRadius && y < this.y + currentRadius) {
          return true
        }

        return false
      }
    }

    return Point
  })()

  const App = (function () {
    'use strict';
    class App {
      canvas = null
      context = null

      pointsArray = []
      draggingPoint = null
      circle = null
      rectangle = null

      constructor(canvasNode) {
        this.canvas = canvasNode
        this.context = canvasNode.getContext('2d')

        this.setCanvasSize()
        this.setListening()
        this.render()
      }

      onClick = (e) => {
        const [x, y] = [e.clientX, e.clientY];

        for (let i = 0; i < this.pointsArray.length; i++) {
          const currentPoint = this.pointsArray[i]

          if (currentPoint.isClickedInside({ x, y })) {
            this.draggingPoint = currentPoint
            this.draggingPoint.changeColor(configuration.CLICKED_POINT_COLOR)

            break;
          }
        }

        if (!this.draggingPoint && this.pointsArray.length < 3) {
          this.pointsArray.push(new Point({ x, y, context: this.context, color: configuration.CIRCLE_COLOR }))
        }

        this.render()
      }

      onMouseMove = (e) => {
        if (this.draggingPoint) {
          const [x, y] = [e.clientX, e.clientY];

          this.draggingPoint.changeCoords(x, y)

          this.render()
        }
      }

      onMouseUp = () => {
        if (this.draggingPoint) {
          this.draggingPoint.changeColor(configuration.CIRCLE_COLOR)

          this.draggingPoint = null

          this.render()
        }
      }

      setListening = () => {
        window.addEventListener('resize', () => {
          this.setCanvasSize()
          this.render()
        })

        canvasNode.addEventListener('mousedown', this.onClick)
        canvasNode.addEventListener('mousemove', this.onMouseMove)
        canvasNode.addEventListener('mouseup', this.onMouseUp)
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