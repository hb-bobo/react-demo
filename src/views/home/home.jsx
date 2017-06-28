import * as React from 'react';
import { Link } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
class HomePage extends React.Component{
  render () {
     return (
        <div>
          <div>
            Home
          </div>
          <RaisedButton>
            <Link to="/EQRHotIssue">EQR热点</Link>
          </RaisedButton>
          <RaisedButton>
            <Link to="/manage/project-quality">项目质量</Link>
          </RaisedButton>
          <RaisedButton>
            <Link to="/manage/quality-month-report">质量月报</Link>
          </RaisedButton>
         {/* <RaisedButton>
            <Link to="/manage/quality-month-report1">质量月报(点击全屏缩放版)</Link>
          </RaisedButton>*/}
          <TodoList></TodoList>
        </div>
    );
  }
}
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items: ['hello', 'world', 'click', 'me']};
    this.handleAdd = this.handleAdd.bind(this);
  }

  handleAdd() {
    const newItems = this.state.items.concat([
      prompt('Enter some text')
    ]);
    this.setState({items: newItems});
  }

  handleRemove(i) {
    let newItems = this.state.items.slice();
    newItems.splice(i, 1);
    this.setState({items: newItems});
  }

  render() {
    const items = this.state.items.map((item, i) => (
      <div key={item} onClick={() => this.handleRemove(i)}>
        {item}
      </div>
    ));

    return (
      <div>
        <button onClick={this.handleAdd}>Add Item</button>
        <ReactCSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {items}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
export default HomePage
