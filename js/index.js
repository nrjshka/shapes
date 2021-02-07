(function() {
  'use strict';

  const configuration = {
    CIRCLE_COLOR: "#FF0000",
    POINT_DIAMETER: 11,
    CLICKED_POINT_COLOR: 'green',
    RECTANGLE_COLOR: 'blue',
    CENTER_CIRCLE_COLOR: 'green',
    FONT: {
      COLOR: 'black',
      STYLE: 'normal 12px Arial',
    },
    POPUP: {
      SHOWN_CLASSNAME: 'popup--shown',
    },
  }

  const MathCalculations = (function () {
    const getCenterPoint = (A, B) => {
      const x = (A.x + B.x) / 2;
      const y = (A.y + B.y) / 2;

      return {
        x, y
      };
    }

    const getFourthPoint = (A, B) => {
      const x = 2 * B.x - A.x;
      const y = 2 * B.y - A.y;

      return {
        x, y
      };
    }

    const getRadiusCircle = (area) => Math.sqrt(area / Math.PI)

    const getVector = (A, B) => ({ x: B.x - A.x, y: B.y - A.y })

    return {
      getCenterPoint,
      getFourthPoint,
      getRadiusCircle,
      getVector,
    }
  })()

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

  const Rectange = (function(props) {
    'use strict';

    const {
      MathCalculations,
      configuration,
    } = props

    class Rectangle {
      context = null
      color = ''
      points = null

      constructor({ points, color, context }) {
        this.points = points
        this.color = color
        this.context = context
      }

      setPoint = (points) => this.points = points

      draw = () => {
        this.context.beginPath()

        this.context.moveTo(this.points.x, this.points.y)
        for (let i = 0; i < this.points.length; i++) {
          const curentPoint = this.points[i]

          this.context.lineTo(curentPoint.x, curentPoint.y)
        }

        this.context.closePath()

        this.context.strokeStyle = this.color
        this.context.stroke()

        // Text
        this.context.strokeStyle = configuration.FONT.COLOR
        this.context.font = configuration.FONT.STYLE

        const { x, y } = this.getCenter()
        this.context.strokeText(`${x}, ${y}`, x, y)
        this.context.strokeText(`Area is: ${this.getArea()}`, x, y + 15)
      }

      getArea = () => {
        const AB = MathCalculations.getVector(this.points[0], this.points[1])
        const AC = MathCalculations.getVector(this.points[0], this.points[2])

        return Math.round(Math.abs((AB.x * AC.y) - (AB.y * AC.x)))
      }

      getCenter = () => MathCalculations.getCenterPoint(this.points[0], this.points[2])
    }

    return Rectangle
  })({
    MathCalculations,
    configuration,
  })

  const Circle = (function(props) {
    'use strict';

    const {
      CanvasElement,
    } = props
    class Circle extends CanvasElement {
      diameter = 0

      constructor(initialValue) {
        super(initialValue)

        const { diameter } = initialValue

        this.diameter = diameter
      }

      setDiameter = (diameter) => this.diameter = diameter

      draw = () => {
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.diameter, 0, 2 * Math.PI, false)
        this.context.closePath()

        this.context.strokeStyle = this.color
        this.context.lineWidth = 1
        this.context.stroke()
      }
    }

    return Circle
  })({
    CanvasElement,
  })

  const Point = (function(props) {
    'use strict';

    const {
      CanvasElement,
      Circle,
      configuration,
    } = props

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

        // Text
        const textOffset = configuration.POINT_DIAMETER

        this.context.strokeStyle = configuration.FONT.COLOR
        this.context.font = configuration.FONT.STYLE
        this.context.strokeText(`${this.x}, ${this.y}`, this.x + textOffset, this.y + textOffset)
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
  })({
    CanvasElement,
    Circle,
    configuration,
  })

  const App = (function (props) {
    'use strict';

    const {
      Point,
      Circle,
      Rectange,
      configuration,
    } = props
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

        if (this.pointsArray.length >= 3 && (!this.circle || !this.rectangle)) {
          this.setElements()
        }

        this.render()
      }

      onMouseMove = (e) => {
        if (this.draggingPoint) {
          const [x, y] = [e.clientX, e.clientY];

          this.draggingPoint.changeCoords(x, y)
          this.setElements()

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

      calculateFourthPointPosition = () => {
        const [A, B, C] = this.pointsArray

        const centerPoint = MathCalculations.getCenterPoint(A, C)
        const D = MathCalculations.getFourthPoint(B, centerPoint)

        return D
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

      setElements = () => {
        if (this.pointsArray.length >= 3) {
          const points = [...this.pointsArray, this.calculateFourthPointPosition()]

          if (this.rectangle) {
            this.rectangle.setPoint(points)
          } else {
            this.rectangle = new Rectange({ points, color: configuration.RECTANGLE_COLOR, context: this.context })
          }

          const circleRadius = MathCalculations.getRadiusCircle(this.rectangle.getArea())
          const { x, y } = this.rectangle.getCenter()

          if (this.circle) {
            this.circle.setCoords(x, y)
            this.circle.setDiameter(circleRadius)
          }
          else {
            this.circle = new Circle({
              x,
              y,
              color: configuration.CENTER_CIRCLE_COLOR,
              context: this.context,
              diameter: circleRadius,
            })
          }
        }
      }

      render = () => {
        this.clearCanvas()

        for (let i = 0; i < this.pointsArray.length; i++) {
          const currentPoint = this.pointsArray[i]

          currentPoint.draw()
        }

        if (this.rectangle) {
          this.rectangle.draw()
        }

        if (this.circle) {
          this.circle.draw()
        }
      }

      reset = () => {
        this.pointsArray = []
        this.circle = null
        this.rectangle = null
        this.draggingPoint = null

        this.clearCanvas()
      }
    }

    return App
  })({
    Point,
    Circle,
    Rectange,
    configuration,
  })

  function infoPopupClick() {
    const infoPopup = document.querySelector('#info-popup')

    if (infoPopup.classList.contains(configuration.POPUP.SHOWN_CLASSNAME)) {
      infoPopup.classList.remove(configuration.POPUP.SHOWN_CLASSNAME)
    } else {
      infoPopup.classList.add(configuration.POPUP.SHOWN_CLASSNAME)
    }
  }

  const canvasNode = document.querySelector('#shapesCanvas')
  const resetButton = document.querySelector('#reset-button')
  const infoButton = document.querySelector('#info-button')
  const infoPopupClose = document.querySelector('#info-popup__close-button')

  // running app
  const app = new App(canvasNode)

  resetButton.addEventListener('click', app.reset)
  infoButton.addEventListener('click', infoPopupClick)
  infoPopupClose.addEventListener('click', infoPopupClick)
})()