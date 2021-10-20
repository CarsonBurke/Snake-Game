let defaults = {
    learningRate: 0.1,
    bias: 1,
}

class Line {
    constructor(opts) {

        // Assign opts

        for (let propertyName in opts) {

            this[propertyName] = opts[propertyName]
        }

        // Create element

        let x1 = this.perceptron1.visual.getBoundingClientRect().left
        let y1 = this.perceptron1.visual.getBoundingClientRect().top

        let x2 = this.perceptron2.visual.getBoundingClientRect().left
        let y2 = this.perceptron2.visual.getBoundingClientRect().top

        let el = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        el.setAttribute('x1', x1 + this.perceptron1.visual.offsetWidth / 2 - this.network.visualsParent.getBoundingClientRect().left)
        el.setAttribute('y1', y1 + this.perceptron1.visual.offsetHeight / 2 - this.network.visualsParent.getBoundingClientRect().top)
        el.setAttribute('x2', x2 + this.perceptron2.visual.offsetWidth / 2 - this.network.visualsParent.getBoundingClientRect().left)
        el.setAttribute('y2', y2 + this.perceptron2.visual.offsetHeight / 2 - this.network.visualsParent.getBoundingClientRect().top)

        el.classList.add("line")

        this.network.svg.appendChild(el)
        this.el = el
    }
}

class Perceptron {
    constructor() {


    }
    mutateWeights() {

        // Randomly adjust a value by a set amount

        function mutate(value, amount) {

            // Decide if to subract or add

            let boolean = Math.floor(Math.random() * 2)

            // Random amount to mutate

            let mutation = Math.random() * amount

            // Apply mutation

            if (boolean == 0) value += Math.random() * mutation
            if (boolean == 1) value -= Math.random() * mutation

            return value
        }

        // Mutate weights

        let newWeights = []

        for (let weight of this.weights) newWeights.push(mutate(weight, this.learningRate))

        this.weights = newWeights
    }
    createWeights() {

        // Create one weight per input

        this.weights = []

        for (let input of this.inputs) {

            // Get a random value relative to the size of learningRate

            let value = Math.random() * this.learningRate

            this.weights.push(value)
        }
    }
    updateWeights() {

        // Reset weight results

        this.weightResults = []

        let i = 0

        for (let input of this.inputs) {

            let weight = this.weights[i]

            this.weightResults.push(input * weight)

            i++
        }
    }
    applyWeights() {

        // If no weights exist create them

        if (!this.weights) this.createWeights()

        // Update weightResults to match inputs

        this.updateWeights()
    }
    transfer() {

        this.transferValue = 0

        for (let weightResult of this.weightResults) this.transferValue += weightResult
    }
    activate() {

        this.activateValue = Math.max(this.transferValue, 0)
    }
    run(opts) {

        // Assign opts to usable values

        let importantValues = opts.importantValues

        for (let valueName in importantValues) {

            this[valueName] = importantValues[valueName]
        }

        this.inputs = opts.inputs

        // Run commands to take inputs into an end result

        this.applyWeights()

        this.transfer()

        this.activate()
    }
    learn() {

        this.mutateWeights()
    }
}

class Layer {
    constructor() {

        this.perceptrons = {}
    }
    addPerceptrons(amount) {

        let i = 0

        while (i < amount) {

            this.addPerceptron()

            i++
        }
    }
    addPerceptron() {

        // Set the requested layer to have the requested inputs

        let layer = this

        // Find number of perceptrons in this layer

        let perceptronCount = Object.keys(layer.perceptrons).length

        // Create and add new perceptron to the layer

        layer.perceptrons[perceptronCount] = new Perceptron()
    }
}

class NeuralNetwork {
    constructor(opts) {

        // Assign default values

        for (let valueName in defaults) {

            this[valueName] = defaults[valueName]
        }

        this.layers = {}


        // Assign opts

        for (let valueName in opts) {

            this[valueName] = opts[valueName]
        }
    }
    addLayer(opts) {

        let layersCount = Object.keys(this.layers).length

        this.layers[layersCount] = new Layer({
            perceptrons: opts.perceptrons
        })

        return this.layers[layersCount]
    }
    getPerceptrons() {

        let perceptrons = []

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            for (let perceptronName in layer.perceptrons) {

                let perceptron = layer.perceptrons[perceptronName]

                perceptrons.push(perceptron)
            }
        }

        return perceptrons
    }
    train() {


    }
    forwardPropagate(inputs) {

        let network = this

        function findInputs(layerName, perceptron) {

            let newInputs = []

            // If in first layer

            if (layerName == 0) {

                // Add values from default inputs

                for (let number of inputs) newInputs.push(number)

                // Add bias

                newInputs.push(network.bias)

                return newInputs
            }

            let previousLayer = network.layers[layerName - 1]

            for (let lineID in previousLayer.lines) {

                let line = previousLayer.lines[lineID]

                // Make sure line is connected to to perceptron

                if (line.perceptron2 != perceptron) continue

                // Add lines value to inputs

                newInputs.push(line.perceptron1.activateValue)
            }

            return newInputs
        }

        // Loop through layers

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through perceptrons in the layer

            for (let perceptronName in layer.perceptrons) {

                let perceptron = layer.perceptrons[perceptronName]

                // Run the perceptron

                perceptron.run({
                    importantValues: this.getImportantValues(),
                    inputs: findInputs(layerName, perceptron),
                })
            }
        }
    }
    getImportantValues() {

        let values = {}

        for (let valueName in defaults) {

            values[valueName] = this[valueName]
        }

        return values
    }
    run(opts) {

        this.forwardPropagate(opts.inputs)
    }
    learn() {

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through perceptrons in the layer

            for (let perceptron1Name in layer.perceptrons) {

                let perceptron1 = layer.perceptrons[perceptron1Name]

                // Mutate perceptron

                perceptron1.learn()

                // Find layer after this one

                let proceedingLayer = this.layers[parseInt(layerName) + 1]

                if (!proceedingLayer) continue

                // Loop through each perceptron in the next layer and draw a line

                for (let perceptron2Name in proceedingLayer.perceptrons) {

                    let perceptron2 = proceedingLayer.perceptrons[perceptron2Name]

                    let perceptronCount = Object.keys(layer.perceptrons).length

                    let lineID = perceptron1Name * perceptronCount + perceptron2Name

                    let line = layer.lines[lineID]

                    this.mutateLine(layer, line, perceptron1, perceptron2, lineID)
                }
            }
        }

        return this
    }
    createVisuals() {

        if (this.visualsParent) return

        // Create visuals parent

        let visualsParent = document.createElement("div")

        visualsParent.classList.add("visualsParent")

        visualsParent.style.width = Object.keys(this.layers).length * 80 + "px"

        document.body.appendChild(visualsParent)
        this.visualsParent = visualsParent

        // Create svg

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        svg.classList.add("lineParent")

        this.visualsParent.appendChild(svg)
        this.svg = svg

        // Loop through each layer

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // make sure there isn't already a visual

            if (layer.visual) continue

            // Create visuals for the layer

            let layerVisual = document.createElement("div")

            layerVisual.classList.add("layerVisual")

            this.visualsParent.appendChild(layerVisual)
            layer.visual = layerVisual

            // loop through perceptrons in the layer

            for (let perceptron1Name in layer.perceptrons) {

                let perceptron1 = layer.perceptrons[perceptron1Name]

                // Create visuals for the perceptron

                let perceptronVisual = document.createElement("div")

                perceptronVisual.classList.add("perceptronVisual")

                // Colour first and last perceptrons

                if (layerName == 0) {

                    perceptronVisual.classList.add("inputPerceptron")

                } else if (layerName == Object.keys(this.layers).length - 1) {

                    perceptronVisual.classList.add("outputPerceptron")
                }

                //

                layer.visual.appendChild(perceptronVisual)
                perceptron1.visual = perceptronVisual

                //

                layer.lines = {}
            }
        }

        this.createLines()
    }
    createLines() {

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through perceptrons in the layer

            for (let perceptron1Name in layer.perceptrons) {

                let perceptron1 = layer.perceptrons[perceptron1Name]

                // Find layer after this one

                let proceedingLayer = this.layers[parseInt(layerName) + 1]

                if (!proceedingLayer) continue

                // Loop through each perceptron in the next layer and draw a line

                for (let perceptron2Name in proceedingLayer.perceptrons) {

                    let perceptron2 = proceedingLayer.perceptrons[perceptron2Name]

                    let perceptronCount = Object.keys(layer.perceptrons).length

                    let lineID = perceptron1Name * perceptronCount + perceptron2Name

                    layer.lines[lineID] = new Line({
                        network: this,
                        perceptron1: perceptron1,
                        perceptron2: perceptron2,
                        id: lineID
                    })

                    let line = layer.lines[lineID]

                    this.mutateLine(layer, line, perceptron1, perceptron2, lineID)
                }
            }
        }
    }
    mutateLine(layer, line, perceptron1, perceptron2, lineID) {

        // Get random value influenced by learning rate

        let value = Math.random() * 5 / this.learningRate

        // Stop if value is more than 1

        if (value > 1) return

        // Decide if to subract or add

        let boolean = Math.floor(Math.random() * 2)

        // Create line if 2

        if (boolean == 0) {

            // Stop if line exists

            if (line) return

            // Create line

            layer.lines[lineID] = new Line({
                network: this,
                perceptron1: perceptron1,
                perceptron2: perceptron2,
                id: lineID
            })

            return
        }

        // Remove line if 1

        if (boolean == 1) {

            // Stop if line doesn't exist

            if (!line) return

            // Remove line el

            console.log(line.el)

            line.el.remove()

            console.log(line.el)

            // Delete line

            delete layer.lines[line.id]
            return
        }
    }
    updateLine(line) {

        let el = line.el

        if (line.perceptron1.activateValue > 0) {

            el.classList.add("lineConnection")
        } else el.classList.remove("lineConnection")
    }
    updateVisuals() {

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through perceptrons in the layer

            for (let perceptron1Name in layer.perceptrons) {

                let perceptron1 = layer.perceptrons[perceptron1Name]

                // Show perceptrons activateValue

                perceptron1.visual.innerText = (perceptron1.activateValue).toFixed(2)

                // Find layer after this one

                let proceedingLayer = this.layers[parseInt(layerName) + 1]

                if (!proceedingLayer) continue

                // Loop through each perceptron in the next layer and draw a line

                for (let perceptron2Name in proceedingLayer.perceptrons) {

                    // Get line

                    let perceptronCount = Object.keys(layer.perceptrons).length

                    let lineID = perceptron1Name * perceptronCount + perceptron2Name

                    let line = layer.lines[lineID]

                    // Iterate if there is no line

                    if (!line) continue

                    this.updateLine(line)
                }
            }
        }
    }
    config() {

        this.createVisuals()
    }
}