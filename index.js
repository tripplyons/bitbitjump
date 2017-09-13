var fs = require('fs')

function run(contents, input) {
	var bits = 16

	var memory = "0".repeat(2 ** bits).split('')

	contents.split('').forEach(function(item, index) {
		memory[index] = item
	})

	var instrPtr = 0
	var running = true

	var output = "0".repeat(2 ** (bits-2)).split('')

	function pad(str) {
		return ("0".repeat(bits - 1)+str).slice(-bits)
	}

	function convertToString(int) {
		return pad(int.toString(2))
	}

	function get(index) {
		if(convertToString(index).startsWith('10')) {
			return (input[index - (2 ** (bits-1))] || 0)
		}
		return memory[index]
	}

	function set(index, value) {
		if(index === '1'.repeat(bits) && value === 1) {
			running = false
			return
		}
		if(convertToString(index).startsWith('11')) {
			output[index - (2 ** (bits-1)) - (2 ** (bits-2))] = value
			return
		}
		memory[index] = value
	}

	function getChunk(index) {
		var chunk = ''
		for(var i=0; i<bits; i++) {
			chunk += get(index + i)
		}
		return chunk
	}

	while(running) {
		var toCopy = parseInt(getChunk(instrPtr), 2)
		var target = parseInt(getChunk(instrPtr + bits), 2)
		var next = parseInt(getChunk(instrPtr + bits * 2), 2)
		console.log(`${convertToString(instrPtr)}: ${convertToString(toCopy)} ${convertToString(target)} ${convertToString(next)}`)
		set(target, get(toCopy))
		instrPtr = next
		if(instrPtr === 2^bits-1) {
			running = false
		}
	}
	var hasReachedOne = false
	var goodForOutput = output.reverse().map(function(item) {
		if(item === '1') {
			hasReachedOne = true
		}
		return hasReachedOne
	}).reverse()
	return output.reverse().filter((item, index) => goodForOutput[index]).join('') || '0'
}

var output = []
var input = process.argv[3]
fs.readFile(__dirname + '/' + process.argv[2], 'utf8', function(err, contents) {
	console.log(run(contents.split(/\s+/).join(''), input))
})
