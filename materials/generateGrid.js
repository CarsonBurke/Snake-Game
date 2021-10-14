function generateGrid() {

    // Create map and implement values

    map.el.style.width = mapDimensions + "px"
    map.el.style.height = mapDimensions + "px"

    // Dimensions / number of tiles will give size, size should be 10px

    globalThis.gridSize = mapDimensions / gridPartSize

    // Loop through each position

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {

            let type = "gridPartParent"
            let id = x * gridSize + y

            let gridPartParent = document.createElement("div")

            gridPartParent.classList.add("gridPartParent")

            gridPartParent.style.width = gridPartSize + "px"
            gridPartParent.style.height = gridPartSize + "px"

            map.el.appendChild(gridPartParent)

            map.positions[id] = { type: type, id: id, x: x, y: y }
        }
    }
}