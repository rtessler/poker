import React from 'react';
import ReactDOM from 'react-dom';

import Header from './header';
import Game from './game';

export default class Main extends React.Component {

	render() {
	
		return (
			<div className='main'>
			
				<Header />

				<br />

				<div className='container'>
			
					<Game />

				</div>
				
			</div>
		);
	}
}

ReactDOM.render(<Main />, document.getElementById('content'));