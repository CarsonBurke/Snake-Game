let tick = 0
let generation = 0
let lastReset = 0
let score = 0
let bestScore = 0

function createNetwork(snake, opts) {

    // Create neural network

    let network = new NeuralNetwork()

    // Create layers

    let layerCount = 4

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

function moveSnake(snake) {

    let lastLayer = snake.network.layers[Object.keys(snake.network.layers).length - 1]

    // Loop through each perceptron in the lastLayer

    for (let perceptronName in lastLayer.perceptrons) {

        let perceptron = lastLayer.perceptrons[perceptronName]

        if (perceptron.activateValue > 0) continue

        //

        let option = options[Object.keys(options)[perceptronName]]

        option(snake)
    }
}

function getFoodArray() {

    let foodArray = []

    for (let foodID in objects.food) {

        let food = objects.food[foodID]

        foodArray.push(food)
    }

    return foodArray
}

function getSnakeArray() {

    let snakeArray = []

    for (let snakeID in objects.snake) {

        let snake = objects.snake[snakeID]

        snakeArray.push(snake)
    }

    return snakeArray
}

function findDistance(pos1, pos2) {

    let distance = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
    return distance
}

function findClosestFood(snake) {

    let foodArray = getFoodArray()

    // 

    let lowestValue = Math.min.apply(Math, foodArray.map(food => findDistance(food, snake)))

    snake.el.innerText = lowestValue.toFixed(2)

    //

    let closestFood = foodArray.filter(food => findDistance(food, snake) == lowestValue)[0]

    return closestFood
}


function isSnakeOnFood(snake, closestFood) {

    if (closestFood.x == snake.x && closestFood.y == snake.y) return true
}

function findSnakeWithMostScore(snakes) {

    // 

    let highestValue = Math.max.apply(Math, snakes.map(snake => snake.score))

    // 

    let bestSnake = snakes.filter(snake => snake.score == highestValue)[0]

    return bestSnake
}

function findBestSnake(snakes) {

    ///

    let bestSnake = findSnakeWithMostScore(snakes)

    if (bestSnake.score > 0) return bestSnake

    // Find snake closest to a food

    let snakesWithDistance = []

    for (let snake of snakes) {

        let closestFood = findClosestFood(snake)

        let distance = Math.sqrt(Math.pow(closestFood.x - snake.x, 2) + Math.pow(closestFood.y - snake.y, 2))

        snakesWithDistance.push({ snake: snake, food: closestFood, distance: distance })
    }

    // 

    let lowestValue = Math.min.apply(Math, snakesWithDistance.map(object => object.distance))

    //

    bestSnakeWithDistance = snakesWithDistance.filter(object => object.distance == lowestValue)[0]
    return bestSnakeWithDistance.snake
}

function reproduce(snake, snakes, tick) {

    // Record stats

    generation++
    lastReset = tick

    if (score > bestScore) bestScore = score

    score = 0

    // Loop through layers

    for (let snake of snakes) {

        // Delete el

        let el = snake.el
        el.remove()

        //

        snake.network.visualsParent.classList.remove("visualsParentShow")

        // Delete snake

        delete objects.snake[snake.id]
    }

    // Create new snakes

    for (let i = 0; i < snakes.length; i++) {

        let duplicateNetwork = _.cloneDeep(snake.network)
        duplicateNetwork.learn()

        generateSnake({ network: duplicateNetwork, color: snake.color })
    }
}

function updateUI() {

    // For each UI display update to current values

    let el

    el = document.getElementById("tick")
    el.innerText = tick

    el = document.getElementById("generation")
    el.innerText = generation

    el = document.getElementById("score")
    el.innerText = score

    el = document.getElementById("bestScore")
    el.innerText = bestScore
}

function run(opts) {

    setInterval(runTick, opts.tickSpeed)

    function runTick() {

        tick += 1

        runBatch()

        updateUI()
    }

    function runBatch() {

        let snakes = getSnakeArray()

        for (let snake of snakes) {

            //

            let closestFood = findClosestFood(snake)

            let inputs = [closestFood.x, snake.x, closestFood.y, snake.y]
            let outputCount = Object.keys(options).length

            //

            if (!snake.network) createNetwork(snake, {
                inputCount: inputs.length,
                outputCount: outputCount,
            })

            //

            snake.network.run({ inputs: inputs })

            //

            moveSnake(snake)

            //

            if (isSnakeOnFood(snake, closestFood)) {

                //

                closestFood.el.remove()

                //

                delete objects.food[closestFood.id]

                //

                snake.score += 1
                score += 1

                //

                generateFood({
                    color: "#11dfd8"
                })
            }

            //
        }

        //

        let bestSnake = findBestSnake(snakes)

        bestSnake.network.visualsParent.classList.add("visualsParentShow")

        bestSnake.network.updateVisuals()

        if (tick - lastReset >= gridSize * 4) {

            // Reproduce with closest snake

            reproduce(bestSnake, snakes, tick)
        }

        return

    }
}

function setPosition(snake) {

    let el = snake.el

    el.style.top = gridPartSize * snake.y + "px"
    el.style.left = gridPartSize * snake.x + "px"
}