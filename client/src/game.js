import React from 'react';

//import 'bootstrap/dist/css/bootstrap.min.css';

import './game.css';

export default class Game extends React.Component {

    constructor(props) {

        super(props);       

        const games = [
            {hands: [{hand: 'TC JC QC KC AC', name: null}, {hand: '7S 7D 7H 6H 6D', name: null}], result: null},  // royal flush,full house
            {hands: [{hand: '3H 4S 5D 6C 7S', name: null}, {hand: '3S 4S 5S 6S 7S', name: null}], result: null},   // straight, straight flush
            {hands: [{hand: 'KC KS KD KH 2D', name: null}, {hand:'2D 3H 7S 3D 3C', name: null}], result: null},         // four of a kind, three of a kind
            {hands: [{hand: '2H 5H 7H 9H KH', name: null}, {hand:'7S 7D 7H 6H 6D', name: null}], result: null},           // flush, full house
            {hands: [{hand: '2H 5H 7H 9H KH', name: null}, {hand:'JD 4S 2D QC JS', name: null}], result: null},          // flush, one pair
            {hands: [{hand: 'JD 4S 2D QC JS', name: null}, {hand:'3H 4S 5D 6C 7S', name: null}], result: null},          // one pair, straight
            {hands: [{hand: '2D 3H 7S 3D 3C', name: null}, {hand:'3H 4S 5D 6C 7S', name: null}], result: null},         // three of a kind, straight
            {hands: [{hand: 'KD KS 2D QC QS', name: null}, {hand:'TC JC QC KC AC', name: null}], result: null},         // two pair, royal flush
            {hands: [{hand: 'JD 4S 2D QC JS', name: null}, {hand:'2H 5H 7H 9H KH', name: null}], result: null},          // one pair
            {hands: [{hand: '9H 2S 5D 4C 8S', name: null}, {hand:'AH 2S 5D 4C 8S', name: null}], result: null}           // high card, high card
        ];

        this.state = {processing: false, games: games, result: ''};
    }

    componentWillReceiveProps(nextProps) {

        //this.setState({result: nextProps.result});
    }

    onChange(id, i, e) {

        const val = e.target.value;

        let { games } = this.state;

        let game = games[i];

        if (id == 'player1')
            game.hands[0].hand = val
        else
            game.hands[1].hand = val

        this.setState({games: games});
    }

    onGo() {

        const { games } = this.state;

        const url = 'http://localhost:8081/api/poker'

        let data = {
            games: []
        }

        games.forEach(game => {

            data.games.push({hands: [ game.hands[0].hand, game.hands[1].hand ]});
        })

        let self = this;

        fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            //credentials: "same-origin", // include, same-origin, *omit
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                //"Content-name": "application/json; charset=utf-8",
                // "Content-name": "application/x-www-form-urlencoded",
            },
            redirect: "follow", // manual, *follow, error
            referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify(data), // body data name must match "Content-name" header
        })
        .then (response => response.json()) // parses response to JSON   
        .then(res => {

            // res.games.forEach(game => {

            //     game.hands.forEach(h => {
            //         h.hand = h.hand.join(' ');
            //     })
            // })            

            self.setState({games: res.games, result: 'winner: player ' + (res.score[0] > res.score[1] ? '1' : '2')});
        });     
    }

    render() {

        const {games, result } = this.state;     

        return (

            <div>

                <div className='row'>
                            
                    <table className='col-8'>
                        <thead>
                            <tr>
                                <th>player 1</th>
                                <th></th>
                                <th>player 2</th>
                                <th></th>
                                <th>winner</th>
                            </tr>
                        </thead>
                    
                        <tbody>

                            {
                                games.map((game, i) => 

                                    <tr className="game" key={i}>

                                        <td>
                                            <input className='hand1' placeholder='hand 1' onChange={this.onChange.bind(this, 'player1', i)} value={game.hands[0].hand} />  
                                        </td>

                                        <td>
                                            {game.hands[0].name}
                                        </td>

                                        <td>
                                            <input className='hand2' placeholder='hand 2' onChange={this.onChange.bind(this, 'player2', i)} value={game.hands[1].hand} />
                                        </td>

                                        <td>
                                            {game.hands[1].name}
                                        </td>     

                                        <td>
                                            {game.result}
                                        </td>                                                                      

                                    </tr>                                    
                                )
                            }

                        </tbody>
                    </table>

                    <div className='col-4'>
                        <ul>
                            <li>Rank Combination Description</li>
                            <li>1 High card Highest value card</li>
                            <li>2 Pair Two cards of same value</li>
                            <li>3 Two pairs Two different pairs</li>
                            <li>4 Three of a kind Three cards of the same value</li>
                            <li>5 Straight All five cards in consecutive value order</li>
                            <li>6 Flush All five cards having the same suit</li>
                            <li>7 Full house Three of a kind and a Pair</li>
                            <li>8 Four of a kind Four cards of the same value</li>
                            <li>9 Straight flush All five cards in consecutive value order, with the same suit</li>
                            <li>10 Royal Flush Ten, Jack, Queen, King and Ace in the same suit</li>
                        </ul>

                    </div>

                </div>                    

                <br />

                <div className='field'>
                    <button name="button" className="btn btn-primary active" onClick={this.onGo.bind(this)}>Go</button>
                </div>

                <div className='field'>
                    {result}
                </div>

            </div>
        );
    }
}