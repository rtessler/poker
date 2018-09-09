const express = require('express')
const app = express()
var bodyParser = require('body-parser')
var fs = require('fs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    //res.setHeader("Access-Control-Allow-Credentials", "true");
    //res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    //res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");    

    next();
  });

app.get('/', (req,res,next) => {

    // display server api details

    fs.readFile('instructions.html', (err, data) => {

        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'})
            return res.end("404 Not Found")
        } 

        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write(data)
        res.end()
    });
});

// function countOccurrence(array) {

//     var result = {};

//     array.forEach(function (v, i) {

//         if (!result[v]) { 
//             result[v] = 1; 
//         } else { 
//             result[v]++; 
//         }
//     });

//     return result;
// };


function groupBy(objectArray, property) {

    return objectArray.reduce(function (acc, obj) {

      var key = obj[property];

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(obj);

      return acc;

    }, {});

}

function playHand(str) {

    if (!str)
        return {hand: str, name: 'bad hand', score: 0}

    const hand = str.toUpperCase().split(' ');

    if (hand.length < 5)
        return {hand: str, name: 'bad hand', score: 0}


    let poker = {HIGH_CARD:     {hand: str, name: 'high card', score: 1},
                ONE_PAIR:       {hand: str, name: 'one pair', score: 20},
                TWO_PAIR:       {hand: str, name: 'two pair', score: 40}, 
                THREE_OF_A_KIND: {hand: str, name: 'three of a kind', score: 60},
                STRAIGHT:       {hand: str, name: 'straight', score: 80}, 
                FLUSH:          {hand: str, name: 'flush', score: 100}, 
                FULL_HOUSE:     {hand: str, name: 'full house', score: 120}, 
                FOUR_OF_A_KIND: {hand: str, name: 'four of a kind', score: 140}, 
                STRAIGHT_FLUSH: {hand: str, name: 'straight flush', score: 160}, 
                ROYAL_FLUSH:    {hand: str, name: 'royal flush', score: 180}
                };
    
        // 1 High card: Highest value card
        // 2 Pair: Two cards of same value
        // 3 Two pairs: Two different pairs
        // 4 Three of a kind: Three cards of the same value
        // 5 Straight All five cards in consecutive value order
        // 6 Flush: All five cards having the same suit
        // 7 Full house: Three of a kind and a Pair
        // 8 Four of a kind: Four cards of the same value
        // 9 Straight flush: All five cards in consecutive value order, with the same suit
        // 10 Royal Flush: Ten, Jack, Queen, King and Ace in the same suit    
    

    // pre-process

    // convert T,J,Q,K,A to numbers
    // make an array of cards {val, suit}

    let cards = [];

    hand.forEach(card => {

        const len = card.length;
        let suit = card[len-1];
        let val = card.substring(0, len-1);  
        
        switch (val) {
            case 'T': val = 10; break;
            case 'J': val = 11; break;
            case 'Q': val = 12; break;
            case 'K': val = 13; break;
            case 'A': val = 14; break;
        }

        cards.push({val: val, suit: suit});
    });

    // sort cards by value in ascending order

    cards = cards.sort(function(a, b) { return a.val - b.val });  

    // royal flush: Ten, Jack, Queen, King and Ace in the same suit  

    const cardsBySuit = groupBy(cards, 'suit')

    // a flush is all cards in the same suit

    const isFlush = (Object.keys(cardsBySuit).length == 1)

    // a straight is all cards in series with value increasing by 1

    let isStraight = true;

    for (let i = 1; i < cards.length; i++) {

        if (parseInt(cards[i].val) != parseInt(cards[0].val)+i) {
            isStraight = false;
            break;
        }
    }

    // to resolve ties we add the high card to the score

    let highCard = cards[cards.length-1].val

    //---------------------------------------------------------------------------------    

    if ( isStraight && cards[0].val == '10' && isFlush) {

        poker.ROYAL_FLUSH.score += parseInt(highCard)

        return poker.ROYAL_FLUSH;
    }

    // Straight Flush: All five cards in consecutive value order, with the same suit

    if (isStraight && isFlush) {

        poker.STRAIGHT_FLUSH.score += parseInt(highCard)

        return poker.STRAIGHT_FLUSH;
    }

    const cardsByValue = groupBy(cards, 'val')

    if ( Object.keys(cardsByValue).length == 2 ) {

        // we have 2 different values

        const k1 = Object.keys(cardsByValue)[0]
        const k2 = Object.keys(cardsByValue)[1]

        // Four of a Kind: Four cards of the same value

        if (cardsByValue[k1].length == 4 || cardsByValue[k2].length == 4) {

            highCard = (cardsByValue[k1].length == 4) ? k1 : k2

            poker.FOUR_OF_A_KIND.score += parseInt(highCard)

            return poker.FOUR_OF_A_KIND;
        }

        // Full House: Three of a kind and a Pair

        if ( (cardsByValue[k1].length == 3 && cardsByValue[k2].length == 2) ||
             (cardsByValue[k1].length == 2 && cardsByValue[k2].length == 3)) {

            highCard = (k1 > k2) ? k1 : k2

            poker.FULL_HOUSE.score += parseInt(highCard)

            return poker.FULL_HOUSE;    
        }
    }

    // Flush: All five cards having the same suit

    if (isFlush) {

        poker.FLUSH.score += parseInt(highCard)

        return poker.FLUSH;
    }

    // Straight: All five cards in consecutive value order

    if (isStraight) {

        poker.STRAIGHT.score += parseInt(highCard)

        return poker.STRAIGHT;
    }

    // Three of a kind: Three cards of the same value

    for (var key in cardsByValue) {

        if (cardsByValue.hasOwnProperty(key)) {           
            if (cardsByValue[key].length == 3) {

                poker.THREE_OF_A_KIND.score += parseInt(key)

                return poker.THREE_OF_A_KIND
            }
        }
    }

    // Two pairs: Two different pairs

    let pair_count = 0;
    let highKey = 0;

    for (var key in cardsByValue) {

        if (cardsByValue.hasOwnProperty(key)) {           
            if (cardsByValue[key].length == 2)
            {
                if (parseInt(key) > highKey)
                    highKey = parseInt(key) 

                pair_count++;
            }
        }
    }

    if (pair_count == 2) {

        poker.TWO_PAIR.score += parseInt(highKey)

        return poker.TWO_PAIR;
    }

    if (pair_count == 1) {

        poker.ONE_PAIR.score += parseInt(highKey)

        return poker.ONE_PAIR;        
    }

    // return the value of the high card

    poker.HIGH_CARD.score += parseInt(highCard);      //Math.max(...val);

    return poker.HIGH_CARD;
}

app.get('/api/test', (req, res, next) => {

    // identify the various hands

    const hands = [
                'TC JC QC KC AC',           // royal flush
                '3S 4S 5S 6S 7S',           // straight flush
                'KC KS KD KH 2D',           // four of a kind
                '7S 7D 7H 6H 6D',           // full house
                '2H 5H 7H 9H KH',           // flush
                '3H 4S 5D 6C 7S',           // straight
                '2D 3H 7S 3D 3C',           // three of a kind
                'KD KS 2D QC QS',           // two pair
                'JD 4S 2D QC JS',           // one pair
                '9H 2S 5D 4C 8S'            // high card
                ];

    let data = [];

    hands.forEach(hand => { 

        data.push(playHand(hand));
    });

    const response = {
        result: data,
    };

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(data));
});

app.post('/api/poker', (req, res, next) => {    

    // process a json array of 5 card 2 player poker hands
    // eg

    /*
            "games": [
                    {hands: ['AH AS AD AC 8S', '4H JS 3C TC 8D']},
                    {hands: ['QC 2D 5C 7D KS', '2H TC 4H 9D AC']}
                    ...
            ]
    */

    const games = req.body.games;

    let response = {
        games: [],
        score: [0, 0]
    }    
    
    games.forEach(game => {

        if (game.hands.length > 1) {

            const hand1 = game.hands[0]
            const hand2 = game.hands[1]

            const hands = [playHand(hand1), playHand(hand2)];

            let gameResult = {hands: hands};
                                        
            if (hands[0].score > hands[1].score) {
                response.score[0]++
                gameResult.result = 'player 1'                    
            }
            else 
            if (hands[1].score > hands[0].score) {
                response.score[1]++
                gameResult.result = 'player 2'  
            }
            else {
                gameResult.result = 'tie'  
            }

            response.games.push(gameResult)
        }
        else {
            response.games.push({hands: [{hand: game.hands[0], name: 'less than 2 hands', score: 0}, {hand: game.hands[1], name: 'less than 2 hands', score: 0}]});
        }
    });   

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(response))
})

const server = app.listen(8081, () => {

    const host = server.address().address
    const port = server.address().port
    
    console.log("Poker Server listening at http://%s:%s", host, port)
})