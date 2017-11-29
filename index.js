var SERVER_game = 'game-api'
var PORT = 3002;
var HOST = '127.0.0.1';
var logger = require('morgan')
var get = 0;
var post = 0;


var restify = require('restify')

// Get a persistence engine for the games
, gamesSave = require('save')('games')

// Create the restify server
, server = restify.createServer({ game: SERVER_game })

server.listen(PORT, HOST, function() {
    console.log('Server %s listening at %s', server.game, server.url)
    console.log('Resources:')
    console.log(' /games')
})

server
// Allow the use of POST
    .use(restify.fullResponse())

// Maps req.body to req.params so there is no switching between them
.use(restify.bodyParser())
    .use(logger('dev'))

// Get all games in the system
server.get('/games', function(req, res) {
    get = get + 1;
    console.log(`Get count: ` + get)

    // Find every entity within the given collection
    gamesSave.find({}, function(error, games) {

        // Return all of the games in the system
        res.send(games)

    })
})

// Create a new game
server.post('/games', function(req, res) {
    post = post + 1;
    console.log('Post count: ' + post)

    // Make sure title and platform are defined 
    if (req.params.title === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new restify.InvalidArgumentError('title must be supplied'))
    }
    if (req.params.platform === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new restify.InvalidArgumentError('platform must be supplied'))
    }
    var newgame = {
        title: req.params.title,
        platform: req.params.platform
    }

    // Create the game using the persistence engine
    gamesSave.create(newgame, function(error, game) {

        // If there are any errors, pass them to next in the correct format
        if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

        // Send the game if no issues
        res.send(201, game)
    })
})