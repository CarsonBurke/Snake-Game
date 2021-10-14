let options = {
    moveUp: function(snake) {

        if (snake.y <= 0) return

        snake.y -= 1

        setPosition(snake)
    },
    moveLeft: function(snake) {

        if (snake.x <= 0) return

        snake.x -= 1

        setPosition(snake)
    },
    moveDown: function(snake) {

        if (snake.y >= gridSize - 1) return

        snake.y += 1

        setPosition(snake)
    },
    moveRight: function(snake) {

        if (snake.x >= gridSize - 1) return

        snake.x += 1

        setPosition(snake)
    },
}