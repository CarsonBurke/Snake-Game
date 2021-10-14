let tick = 0

function run(opts) {

    setInterval(runAI, opts.tickSpeed)

    function createNetwork(snake, opts) {

        // Create neural network

        let network = new NeuralNetwork()

        // Create layers

        let layerCount = 3

        for (let i = 0; i < layerCount; i++) network.addLayer({})

        // Create perceptrons

        // Create input perceptrons

        network.layers[0].addPerceptrons(opts.inputCount)

        // Create hidden perceptrons

        let hiddenPerceptronsNeed = 5

        // Loop through layers

        for (let layerName in network.layers) {

            // Filter only hidden layers

            let layersCount = Object.keys(network.layers).length

            if (layerName > 0 && layerName < layersCount - 1) {

                let layer = network.layers[layerName]

                layer.addPerceptrons(hiddenPerceptronsNeed)
            }
        }

        // Create output perceptrons

        network.layers[layerCount - 1].addPerceptrons(opts.outputCount)

        //

        network.config()

        //

        snake.network = network
    }

    function runAI() {

        tick += 1

        //

        let snake = objects.snake[(Object.keys(objects.snake)[0])]

        let closestFood

        let inputs = [snake.x, snake.y]
        let outputCount = Object.keys(options).length

        //

        if (!snake.network) createNetwork(snake, {
            inputCount: inputs.length,
            outputCount: outputCount,
        })

        //

        snake.network.run({ inputs: inputs })
        snake.network.learn()

        //

        movePlayer()

        function movePlayer() {

            let lastLayer = snake.network.layers[Object.keys(snake.network.layers).length - 1]

            // Loop through each perceptron in the lastLayer

            for (let perceptronName in lastLayer.perceptrons) {

                let perceptron = lastLayer.perceptrons[perceptronName]

                if (perceptron.activateValue > 0) continue

                //

                let option = options[Object.keys(options)[perceptronName]]
                option(snake, tick)
            }
        }

        //

        console.log(snake.network)

        snake.network.drawVisuals()
        snake.network.updateVisuals()
    }
}

function setPosition(snake) {

    let el = snake.el

    el.style.top = gridPartSize * snake.y + "px"
    el.style.left = gridPartSize * snake.x + "px"
}