require(`../sass/pave/main.sass`);
const Experimental = require('./experimental/Experimental.jsx');

/**
 * MAIN CLASS
 */
class Pave extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <Experimental />;
  }
}

ReactDOM.render(<Pave />, document.getElementById('root'));
