let defaults = {
    learningRate: 0.1,
    bias: 1,
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
    getImportantValues() {

        let values = {}

        for (let valueName in defaults) {

            values[valueName] = this[valueName]
        }

        return values
    }
    run(opts) {

        let network = this

        function findInputs(layerName) {

            let newInputs = []

            // If in first layer

            if (layerName == 0) {

                // Add values from default inputs

                for (let number of opts.inputs) newInputs.push(number)

                // Add bias

                newInputs.push(network.bias)

                return newInputs
            }

            // Otherwise give inputs from the previous layers' outputs

            let newLayers = []

            let previousLayer = network.layers[layerName - 1]

            // loop through each perceptron in the layer

            for (let perceptronName in previousLayer.perceptrons) {

                let perceptron = previousLayer.perceptrons[perceptronName]

                newLayers.push(perceptron.activateValue)
            }

            return newLayers
        }

        // Loop through each layer in the network

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through each perceptron in the layer

            for (let perceptronName in layer.perceptrons) {

                let perceptron = layer.perceptrons[perceptronName]

                // Use the layer and perceptron location to idenify what inputs it should have

                let inputs = findInputs(layerName)

                // Run the perceptron

                perceptron.run({
                    importantValues: this.getImportantValues(),
                    inputs: inputs,
                })
            }
        }
    }
    learn() {

        // For each perceptron mutate their weights

        let perceptrons = this.getPerceptrons()

        for (let perceptron of perceptrons) perceptron.learn()

        return this
    }
    UI() {

        // Loop through each layer in the network

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through each perceptron in the layer

            for (let perceptronName in layer.perceptrons) {

                let perceptron = layer.perceptrons[perceptronName]

                // Values to display

                let displayValues = {
                    inputs: perceptron.inputs,
                    weights: perceptron.weights,
                    weightResults: perceptron.weightResults,
                    transfer: perceptron.transferValue,
                    activate: perceptron.activateValue,
                }

                // If no elements create them

                if (!perceptron.parentEl) {

                    let UIParent = document.getElementById("UIParent")

                    //

                    perceptron.parentEl = document.createElement("div")

                    perceptron.parentEl.classList.add("perceptronParent")

                    UIParent.appendChild(perceptron.parentEl)

                    //

                    perceptron.titleEl = document.createElement("div")

                    perceptron.titleEl.classList.add("perceptronTitle")

                    perceptron.titleEl.innerText = "Layer: " + layerName + " Perceptron: " + perceptronName

                    perceptron.parentEl.appendChild(perceptron.titleEl)

                    for (let valueName in displayValues) {

                        let value = displayValues[valueName]

                        //

                        perceptron.headerEls = {}
                        perceptron.contentEls = {}

                        //

                        perceptron.headerEls[valueName] = document.createElement("h3")

                        perceptron.headerEls[valueName].classList.add("perceptronHeader")

                        perceptron.headerEls[valueName].innerText = valueName + ":"

                        perceptron.parentEl.appendChild(perceptron.headerEls[valueName])

                        //

                        perceptron.contentEls[valueName] = document.createElement("strong")

                        perceptron.contentEls[valueName].classList.add("perceptronContent")

                        perceptron.contentEls[valueName].id = valueName + layerName + perceptronName

                        perceptron.parentEl.appendChild(perceptron.contentEls[valueName])
                    }
                }

                // Find the number of decimals in a number

                Number.prototype.countDecimals = function() {

                    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;

                    var str = this.toString();
                    if (str.indexOf(".") !== -1 && str.indexOf("-") !== -1) {
                        return str.split("-")[1] || 0;
                    } else if (str.indexOf(".") !== -1) {
                        return str.split(".")[1].length || 0;
                    }
                    return str.split("-")[1] || 0;
                }

                function structureValue(value) {

                    // Check if value is an array

                    if (typeof value == "object") {

                        let newValue = []

                        for (let number of value) {

                            // Check if we need to fix the number

                            if (Math.abs(number).countDecimals() > 2) {

                                newValue.push(" " + number.toFixed(2))
                                continue
                            }

                            // Otherwise

                            newValue.push(" " + number)
                        }

                        return newValue
                    }

                    // Check if we need to fix number

                    if (Math.abs(value).countDecimals() > 2) {

                        return value.toFixed(2)
                    }

                    // Otherwise return as is

                    return value
                }

                for (let valueName in displayValues) {

                    let value = displayValues[valueName]

                    let el = document.getElementById(valueName + layerName + perceptronName)

                    el.innerText = structureValue(value)
                }
            }
        }
    }
    drawVisuals() {

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

            for (let perceptronName in layer.perceptrons) {

                let perceptron = layer.perceptrons[perceptronName]

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
                perceptron.visual = perceptronVisual

                //

                perceptron.lines = {}
            }
        }
    }
    drawLine(perceptron1, perceptron2, perceptron2Name) {

        // Create line

        let x1 = perceptron1.visual.getBoundingClientRect().left
        let y1 = perceptron1.visual.getBoundingClientRect().top

        let x2 = perceptron2.visual.getBoundingClientRect().left
        let y2 = perceptron2.visual.getBoundingClientRect().top

        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        line.setAttribute('x1', x1 + perceptron1.visual.offsetWidth / 2 - this.visualsParent.getBoundingClientRect().left)
        line.setAttribute('y1', y1 + perceptron1.visual.offsetHeight / 2 - this.visualsParent.getBoundingClientRect().top)
        line.setAttribute('x2', x2 + perceptron2.visual.offsetWidth / 2 - this.visualsParent.getBoundingClientRect().left)
        line.setAttribute('y2', y2 + perceptron2.visual.offsetHeight / 2 - this.visualsParent.getBoundingClientRect().top)

        line.classList.add("line")

        this.svg.appendChild(line)
        perceptron1.lines[perceptron2Name] = line
    }
    updateLine(perceptron1, perceptron2, perceptron2Name) {

        let line = perceptron1.lines[perceptron2Name]

        if (perceptron2.activateValue > 0) {

            line.classList.add("lineConnection")
        } else line.classList.remove("lineConnection")
    }
    updateVisuals() {

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through perceptrons in the layer

            for (let perceptronName in layer.perceptrons) {

                let perceptron = layer.perceptrons[perceptronName]

                // Show perceptrons activateValue

                perceptron.visual.innerText = (perceptron.activateValue).toFixed(2)

                // Find layer after this one

                let proceedingLayer = this.layers[parseInt(layerName) + 1]

                if (!proceedingLayer) continue

                // Loop through each perceptron in the next layer and draw a line

                for (let perceptron2Name in proceedingLayer.perceptrons) {

                    let perceptron2 = proceedingLayer.perceptrons[perceptron2Name]

                    // If line already exists update the line

                    let perceptronsAmountInProceedingLayer = Object.keys(proceedingLayer.perceptrons).length

                    if (Object.keys(perceptron.lines).length == perceptronsAmountInProceedingLayer) {

                        this.updateLine(perceptron, perceptron2, perceptron2Name)

                        continue
                    }

                    //

                    this.drawLine(perceptron, perceptron2, perceptron2Name)
                }
            }
        }
    }
    config() {

        this.drawVisuals()
    }
}

// Convert the weights into a single arbitrary value

// Make sure the value is greater than 0

export { NeuralNetwork }