import React from 'react';
import '../Styles/Welcome.css';
class Welcome extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return(
            <div className="viewWelcomeBoard">
                <img
                className="avatarWelcome"
                src={this.props.currentUserPhoto ? this.props.currentUserPhoto : "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/nopic.jpg?alt=media&token=7f99a2d8-9304-4a01-be6a-076abbbcb8ff" }
                alt=""
                />
                <span className="textTitleWelcome">{`Welcome,${this.props.currentUserName}` }</span>
                <span className="textDescriptionWelcome">Start Chatting</span>
            </div>
        )
    }
}
export default Welcome;