function randomColor() {

    let value = Math.floor(Math.random() * Object.keys(colors).length)

    let key = Object.keys(colors)[value]

    let color = colors[key]
    return color
}

// Place game objects

function placeObject(opts) {

    // Create object

    let object = {}

    // Add property to objects

    for (let propertyName in opts) {

        object[propertyName] = opts[propertyName]
    }

    let type = object.type

    object.id = newId()
    let id = object.id

    // Style element

    object.el = document.createElement("div")
    let el = object.el

    el.classList.add(type)
    el.id = id

    el.style.position = "absolute"

    el.style.top = gridPartSize * object.y + "px"
    el.style.left = gridPartSize * object.x + "px"

    el.style.width = gridPartSize + "px"
    el.style.height = gridPartSize + "px"

    let color = object.color
    if (color) el.style.backgroundColor = color

    //

    if (!objects[type]) objects[type] = {}
    objects[type][id] = object

    //

    map.el.appendChild(el)
}

function findRandomPos() {

    let posAmount = Object.values(map.positions).length - 1
    let posId = Math.floor(Math.random() * posAmount)

    let pos = map.positions[posId]
    return pos
}

function generateSnake(opts) {

    let type = "snake"

    let pos = { x: gridSize / 2, y: gridSize / 2 }
        /* let pos = { x: 0, y: 0 } */

    placeObject({
        type: type,
        x: pos.x,
        y: pos.y,
        direction: "up",
        score: 0,
        color: opts.color,
        network: opts.network
    })
}

function generateFood(opts) {

    let type = "food"

    let pos = findRandomPos()

    placeObject({
        type: type,
        x: pos.x,
        y: pos.y,
        color: opts.color
    })
}

function initWorld() {

    for (let i = 0; i < 10; i++) {

        generateSnake({
            color: randomColor()
        })
    }

    for (let i = 0; i < 1; i++) {

        generateFood({
            color: "#11dfd8"
        })
    }
}