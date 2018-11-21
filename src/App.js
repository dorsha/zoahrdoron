import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import firebase from 'firebase';
import clone from 'lodash/clone';
import uuid from 'uuid';

const allowedUsers = ['dorsha123@gmail.com', 'zohar.g88@gmail.com'];

class App extends Component {

  constructor(props) {
    super(props);

    firebase.initializeApp({
      apiKey: "AIzaSyAOYF1BfbEXQmcrcOTVVWef0Oia74pyTRw",
      authDomain: "zohardoron-love.firebaseapp.com",
      databaseURL: "https://zohardoron-love.firebaseio.com"
    });

    this.state = { comment: '', comments: [], currentUser: null };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(currentUser => {
      if (currentUser && allowedUsers.includes(currentUser.email)) {
        this.setState({ currentUser });
        this.firebaseRefs = firebase.database().ref('data');
        this.firebaseRefs.on("child_added", function (dataSnapshot) {
          const { comments } = this.state;
          const clonedComments = clone(comments);
          clonedComments.push(dataSnapshot);
          this.setState({ comments: clonedComments });
        }.bind(this));
      }
    });
  }

  componentWillUnmount() {
    this.firebaseRefs.off();
  }

  addComment(e) {
    e.preventDefault();
    e.stopPropagation();
    const { comment, currentUser } = this.state;
    this.firebaseRefs.push({
      id: uuid.v1(),
      comment,
      userId: currentUser.displayName,
      userImage: currentUser.photoURL,
      createdTime: new Date().getTime()
    });
    this.setState({ comment: '' });
  }

  deleteComment(comment) {
    comment.ref.remove().then(() => {
      const { comments } = this.state;
      this.setState({ comments: comments.filter(c => c.val().id !== comment.val().id) });
    });
  }

  handleCommentChanged(e) {
    this.setState({ comment: e.target.value });
  }

  signIn() {
    const { currentUser } = this.state;
    if (!currentUser) {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    } else {
      firebase.auth().signOut();
      window.location.reload();
    }
  }

  render() {
    const { comment, comments, currentUser } = this.state;

    if (!currentUser) {
      return <button className="comment-submit btn btn-primary" onClick={this.signIn.bind(this)}>כניסה</button>;
    }

    return (
      <div className="App">
        <div className="App-header">
          <div className="user-details">
            <img
              className="user-image"
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              onClick={this.signIn.bind(this)}
              title="Logout"
            />
            <div className="user-name">{currentUser.displayName}</div>
          </div>
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Zohar & Doron</h2>
        </div>
        <div className="app-body">
          <p className="App-intro">
          </p>
          <div className="comments">
            {comments.map((com, i) => {
              const commObj = com.val();
              return (
                <div
                  key={commObj.id}
                  className="comment-display"
                >
                  <i
                    className="delete-comment fa fa-times pull-left"
                    onClick={this.deleteComment.bind(this, com)}
                    title="Delete post"
                  />
                  <div className="comment-user-details">
                    <img className="comment-user-image" src={commObj.userImage} alt={commObj.userId} />
                    <span className="comment-user-name">{commObj.userId}</span>
                  </div>
                  {commObj.createdTime &&
                    <div className="comment-created-time">{new Date(commObj.createdTime).toLocaleString()}</div>
                  }
                  <div className="comment-text">
                    {commObj.comment}
                  </div>
                </div>
              )})
            }
          </div>
          <div className="comment-form form-group">
            <form onSubmit={this.addComment.bind(this)} id="comment-form">
              <textarea
                className="comment-textarea form-control"
                placeholder='מחשבות...'
                value={comment}
                onChange={this.handleCommentChanged.bind(this)}
              />
              <div>
                <button
                  className="comment-submit btn btn-primary"
                  type='submit'
                  form="comment-form"
                >
                  סיימתי!
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
