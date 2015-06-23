// http://fluxxor.com/guides/quick-start.html から引用

var React = require('react');
var Fluxxor = require('fluxxor');

var constants = {
  ADD_TODO: "ADD_TODO",
  TOGGLE_TODO: "TOGGLE_TODO",
  CLEAR_TODOS: "CLEAR_TODOS"
};

var TodoStore = Fluxxor.createStore({
  initialize: function() {
    this.todoId = 0;
    this.todos={};
    this.bindActions(
      constants.ADD_TODO, this.onAddTodo,
      constants.TOGGLE_TODO, this.onToggleTodo,
      constants.CLEAR_TODOS, this.onClearTodos
    );
  },
  onAddTodo: function(payload) {
    var id = this._nextTodoId();
    var todo = {
      id: id,
      text: payload.text,
      complete: false
    };
    this.todos[id] = todo;
    this.emit("change");
  },
  onToggleTodo: function(payload) {
    var id = payload.id;
    this.todos[id].complete = !this.todos[id].complete;
    this.emit("change");
  },
  onClearTodos: function(payload) {
    var todos = this.todos;
    Object.keys(todos).forEach(function(key) {
      if(todos[key].complete) {
        delete todos[key];
      }
    });
    this.emit("change");
  },
  _nextTodoId: function() {
    return ++this.todoId;
  },
  getState: function() {
    return { todos: this.todos }
  }
});

var actions = {
  addTodo: function(text) {
    this.dispatch(constants.ADD_TODO, {text: text});
  },
  toggleTodo: function(id) {
    this.dispatch(constants.TOGGLE_TODO, {id: id});
  },
  clearTodos: function() {
    this.dispatch(constants.CLEAR_TODOS);
  }
};

var stores = { TodoStore: new TodoStore() };
var flux = new Fluxxor.Flux(stores, actions);

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Application = React.createClass({
  mixins: [ FluxMixin, StoreWatchMixin("TodoStore") ],
  getInitialState: function() {
    return { newTodoText: "" };
  },
  getStateFromFlux: function() {
    return this.getFlux().store('TodoStore').getState();
  },
  handleTodoTextChange: function(e) {
    this.setState({newTodoText: e.target.value});
  },
  onSubmitForm: function(e) {
    e.preventDefault();
    if (this.state.newTodoText.trim()) {
      this.getFlux().actions.addTodo(this.state.newTodoText);
      this.setState({newTodoText: ""});
    }
  },
  clearCompletedTodos: function(e) {
    this.getFlux().actions.clearTodos();
  },
  render: function() {
    var todos = this.state.todos;
    return (
      <div>
        <ul>
          {Object.keys(todos).map(function(id) {
            return <li key={id}><TodoItem todo={todos[id]} /></li>;
          })}
        </ul>
        <form onSubmit={this.onSubmitForm}>
          <input type="text" size="30" placeholder="New Todo"
                 value={this.state.newTodoText}
                 onChange={this.handleTodoTextChange} />
          <input type="submit" value="Add Todo" />
        </form>
        <button onClick={this.clearCompletedTodos}>Clear Completed</button>
      </div>
    );
  }
});

var TodoItem = React.createClass({
  mixins: [FluxMixin],
  propTypes: {
    todo: React.PropTypes.object.isRequired
  },
  onClick: function() {
    this.getFlux().actions.toggleTodo(this.props.todo.id);
  },
  render: function() {
    var style = {
      textDecoration: this.props.todo.complete ? "line-through" : ""
    };
    return <span style={style} onClick={this.onClick}>{this.props.todo.text}</span>;
  }
});

React.render(
  <Application flux={flux} />,
  document.getElementById('app')
);