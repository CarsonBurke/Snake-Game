function run(opts) {

    setInterval(runAI, opts.tickSpeed)

    function runAI() {

        console.log(objects)

        let snake = objects.snake[(Object.keys(objects.snake)[0])]

        options.moveLeft(snake)
    }
}

function setPosition(snake) {

    let el = snake.el

    el.style.top = gridPartSize * snake.y + "px"
    el.style.left = gridPartSize * snake.x + "px"
}