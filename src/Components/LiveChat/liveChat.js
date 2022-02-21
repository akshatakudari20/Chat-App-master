import React from "react";
import ReactLoading from "react-loading";
import firebase from "../Firebase/firebase";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/liveChat.css";
import LocalStorageStrings from "../LoginStrings";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import "../Styles/liveChat.css";
import { fontSize } from "@material-ui/system";
const Filter = require("bad-words");

class LiveChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isShowSticker: false,
      inputValue: "",
      currentPeerUser: this.props.currentPeerUser
    };
    this.currentUserName = localStorage.getItem(LocalStorageStrings.Name);
    this.currentUserId = localStorage.getItem(LocalStorageStrings.ID);
    this.currentUserPhoto = localStorage.getItem(LocalStorageStrings.PhotoURL);
    this.currentUserDocumentId = localStorage.getItem(
      LocalStorageStrings.FirebaseDocumentId
    );
    this.stateChanged = LocalStorageStrings.UPLOAD_CHANGED;
    this.listMessage = [];
    this.removeListener = null;
    this.groupChatId = null;
    this.currentPhotoFile = null;
  }
  componentDidUpdate(prevProps, preState) {
    this.scrollToBottom();
    if (this.props.currentPeerUser !== prevProps.currentPeerUser) {
      this.getListHistory();
    }
  }
  componentDidMount() {
    this.getListHistory();
  }
  static getDerivedStateFromProps(props, state) {
    if (props.currentPeerUser !== state.currentPeerUser) {
      return { currentPeerUser: props.currentPeerUser };
    }
  }
  componentWillUnmount() {
    if (this.removeListener) {
      this.removeListener();
    }
  }
  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({});
    }
  };
  onKeyboardPress = event => {
    if (event.key === "Enter") {
      this.onSendMessage(this.state.inputValue, 0);
    }
  };
  openListSticker = () => {
    this.setState({ isShowSticker: !this.state.isShowSticker });
  };
  getListHistory = () => {
    if (this.removeListener) {
      this.removeListener();
    }
    this.listMessage.length = 0;
    this.setState({ isLoading: true });
    if (
      this.hashString(this.currentUserId) <=
      this.hashString(this.state.currentPeerUser.id)
    ) {
      this.groupChatId = `${this.currentUserId}-${this.state.currentPeerUser.id}`;
    } else {
      this.groupChatId = `${this.state.currentPeerUser.id}-${this.currentUserId}`;
    }
    this.removeListener = firebase
      .firestore()
      .collection("Messages")
      .doc(this.groupChatId)
      .collection(this.groupChatId)
      .onSnapshot(
        onSnapshot => {
          onSnapshot.docChanges().forEach(change => {
            if (change.type === LocalStorageStrings.DOC) {
              this.listMessage.push(change.doc.data());
            }
          });
          this.setState({ isLoading: false });
        },
        err => {
          this.props.showToast(0, err.toString());
        }
      );
  };
  onSendMessage = (content, type) => {
    const filter = new Filter();
    if (filter.isProfane(this.state.inputValue)) {
      const cleaned = filter.clean(this.state.inputValue);
      //this.state.showToast(0, 'U are not allowed to send such words');
      alert("U are not allowed to send such words");
      this.state.inputValue = "";
    } else {
      if (this.state.isShowSticker && type === 2) {
        this.setState({ isShowSticker: false });
      }
      if (content.trim() === "") {
        return;
      }
      const timestamp = moment()
        .valueOf()
        .toString();
      const itemMessage = {
        idFrom: this.currentUserId,
        idTo: this.state.currentPeerUser.id,
        timestamp: timestamp,
        content: content.trim(),
        type: type
      };
      firebase
        .firestore()
        .collection("Messages")
        .doc(this.groupChatId)
        .collection(this.groupChatId)
        .doc(timestamp)
        .set(itemMessage)
        .then(() => {
          this.setState({ inputValue: "" });
        });
    }
  };
  render() {
    return (
      <div className="content">
        {this.state.isLoading ? (
          <div className="viewLoading">
            <ReactLoading
              type={"spin"}
              color={"black"}
              height={"10%"}
              width={"10%"}
            />
          </div>
        ) : null}
        <div class="contact-profile">
          <img
            src={
              this.state.currentPeerUser.URL
                ? this.state.currentPeerUser.URL
                : "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/nopic.jpg?alt=media&token=7f99a2d8-9304-4a01-be6a-076abbbcb8ff"
            }
          />
          <p>{this.state.currentPeerUser.name}</p>
          {/* <div class="social-media">
            <i class="fa fa-facebook" aria-hidden="true"></i>
            <i class="fa fa-twitter" aria-hidden="true"></i>
            <i class="fa fa-instagram" aria-hidden="true"></i>
          </div> */}
        </div>
        <div className="viewListContentChat">
          {this.renderListMessage()}
          <div
            styles={{ float: "left", clear: "both" }}
            ref={el => {
              this.messagesEnd = el;
            }}
          />
        </div>
        {this.state.isShowSticker ? this.renderStickers() : null}
        <div className="message-input">
          <div class="wrap">
            <input
              className="viewInput"
              placeholder="Type a message"
              value={this.state.inputValue}
              onChange={event => {
                this.setState({ inputValue: event.target.value });
              }}
              onKeyPress={this.onKeyboardPress}
              
            />
            <img
              className="icOpenGallery"
              src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/ic_photo.png?alt=media&token=95a00a30-8f61-49a8-b50b-184bb59469ec"
              alt="icon open gallery"
              onClick={() => this.refInput.click()}
            />
            <input
              ref={el => {
                this.refInput = el;
              }}
              accept="image/*"
              className="viewInputGallery"
              type="file"
              onChange={this.onChoosePhoto}
            />
            <img
              className="icOpenSticker"
              src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/ic_sticker.png?alt=media&token=4389e979-fbda-46b5-921c-4b1e9f1fdd49"
              alt="icon open sticker"
              onClick={this.openListSticker}
            />
            <img
              className="icSend"
              src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/ic_send.png?alt=media&token=d7ea02e8-923f-4b61-a619-a4db60205768"
              alt="icon send"
              onClick={() => this.onSendMessage(this.state.inputValue, 0)}
            />
          </div>
        </div>
      </div>
    );
  }
  onChoosePhoto = event => {
    if (event.target.files && event.target.files[0]) {
      this.setState({ isLoading: true });
      this.currentPhotoFile = event.target.files[0];
      const prefixFiletype = event.target.files[0].type.toString();
      if (prefixFiletype.indexOf("image/") === 0) {
        this.uploadPhoto();
      } else {
        this.setState({ isLoading: false });
        this.props.showToast(0, "This is not an image");
      }
    } else {
      this.setState({ isLoading: false });
    }
  };
  uploadPhoto = () => {
    if (this.currentPhotoFile) {
      const timestamp = moment()
        .valueOf()
        .toString();
      const uploadTask = firebase
        .storage()
        .ref()
        .child(timestamp)
        .put(this.currentPhotoFile);
      uploadTask.on(
        LocalStorageStrings.UPLOAD_CHANGED,
        null,
        err => {
          this.setState({ isLoading: false });
          this.props.showToast(0, err.message);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            this.onSendMessage(downloadURL, 1);
            this.setState({ isLoading: false });
          });
        }
      );
    } else {
      this.setState({ isLoading: false });
      this.props.showToast(0, "File is null");
    }
  };
  renderListMessage = () => {
    if (this.listMessage.length > 0) {
      let viewListMessage = [];
      this.listMessage.forEach((item, index) => {
        if (item.idFrom === this.currentUserId) {
          if (item.type === 0) {
            viewListMessage.push(
              <div className="viewItemRight" key={item.timestamp}>
                <span className="textContentItem">{item.content}</span>
              </div>
            );
          } else if (item.type === 1) {
            viewListMessage.push(
              <div className="viewItemRight2" key={item.timestamp}>
                <img
                  className="imgItemRight"
                  src={item.content}
                  alt="content message"
                />
              </div>
            );
          } else {
            viewListMessage.push(
              <div className="viewItemRight3" key={item.timestamp}>
                <img
                  className="imgItemRightSticker"
                  src={this.getGifImage(item.content)}
                  alt="content message"
                />
              </div>
            );
          }
        } else {
          if (item.type === 0) {
            viewListMessage.push(
              <div className="viewWrapItemLeft" key={item.timestamp}>
                <div className="viewWrapItemLeft3">
                  {this.isLastMessageLeft(index) ? (
                    <img
                      src={
                        this.state.currentPeerUser.URL
                          ? this.state.currentPeerUser.URL
                          : "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/nopic.jpg?alt=media&token=7f99a2d8-9304-4a01-be6a-076abbbcb8ff"
                      }
                      alt="avatar"
                      className="peerAvatarLeft"
                    />
                  ) : (
                    <div className="viewPaddingLeft"></div>
                  )}
                  <div className="viewItemLeft">
                    <span className="textContentItem">{item.content}</span>
                  </div>
                </div>
                {this.isLastMessageLeft(index) ? (
                  <span className="textTimeLeft">
                    <div className="time">
                      {moment(Number(item.timestamp)).format("MM/DD/YYYY")}
                    </div>
                  </span>
                ) : null}
              </div>
            );
          } else if (item.type === 1) {
            viewListMessage.push(
              <div className="viewWrapItemLeft2" key={item.timestamp}>
                <div className="viewWrapItemleft3">
                  {this.isLastMessageLeft(index) ? (
                    <img
                      src={
                        this.state.currentPeerUser.URL
                          ? this.state.currentPeerUser.URL
                          : "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/nopic.jpg?alt=media&token=7f99a2d8-9304-4a01-be6a-076abbbcb8ff"
                      }
                      alt="avatar"
                      className="peerAvatarLeft"
                    />
                  ) : (
                    <div className="viewPaddingLeft"></div>
                  )}
                  <div className="viewItemLeft2">
                    <img
                      className="imgItemLeft"
                      src={item.content}
                      alt="content message"
                    />
                  </div>
                </div>
                {this.isLastMessageLeft(index) ? (
                  <span className="textTimeLeft">
                    <div className="time">
                      {moment(Number(item.timestamp)).format("MM/DD/YYYY")} 
                      
                    </div>
                  </span>
                ) : null}
              </div>
            );
          } else {
            viewListMessage.push(
              <div className="viewWrapItemleft2" key={item.timestamp}>
                <div className="viewWrapitemLeft3">
                  {this.isLastMessageLeft(index) ? (
                    <img
                      src={
                        this.state.currentPeerUser.URL
                          ? this.state.currentPeerUser.URL
                          : "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/nopic.jpg?alt=media&token=7f99a2d8-9304-4a01-be6a-076abbbcb8ff"
                      }
                      alt="avatar"
                      className="peerAvatarLeft"
                    />
                  ) : (
                    <div className="veiwPaddingLeft" />
                  )}
                  <div className="viewItemLeft3" key={item.timestamp}>
                    <img
                      className="imgItemLeftSticker"
                      src={this.getGifImage(item.content)}
                      alt="content message"
                    />
                  </div>
                </div>
                {this.isLastMessageLeft(index) ? (
                  <span className="textTimeLeft">
                    <div className="time">
                      <div className="timesetup">
                        {moment(Number(item.timestamp)).format("MM/DD/YYYY")}
                      </div>
                    </div>
                  </span>
                ) : null}
              </div>
            );
          }
        }
      });
      return viewListMessage;
    } else {
      return (
        <div className="viewWrapSayHi">
          <span className="textSayHi"> No messages</span>
          <img
            className="imgWaveHand"
            src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/14-wave_hand.png?alt=media&token=76e678d1-6496-4c26-9f05-5b3a03cc6b2a"
            alt="wave hand"
          />
        </div>
      );
    }
  };
  renderStickers = () => {
    return (
      <div className="viewStickers">
        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l1.png?alt=media&token=f7d1ccb9-a154-490f-9ea2-57dce88a0598"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("l1", 2);
          }}
        />

        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l2.png?alt=media&token=0771c9aa-d50e-4889-b39a-f7523fdeea01"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("l2", 2);
          }}
        />
        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l3.png?alt=media&token=f11507a1-6eed-4e4d-8956-16ef3faf6e66"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("l3", 2);
          }}
        />
        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l4.png?alt=media&token=008568d2-daea-4e91-b2d9-fa326621ff9b"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("l4", 2);
          }}
        />
        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l5.png?alt=media&token=ae598538-6825-4183-87a8-aacfaf078230"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("l5", 2);
          }}
        />
        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l6.png?alt=media&token=ef9cfe7d-1c37-4c35-9c3a-a16d105f3ed8"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("l6", 2);
          }}
        />

        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m1.gif?alt=media&token=0b4e7e33-564b-4174-8008-3e7e163c189d"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("m1", 2);
          }}
        />
        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m2.gif?alt=media&token=5cbf383a-ecb0-4956-9d75-98597dd18817"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("m2", 2);
          }}
        />
        <img
          className="imgSticker"
          src="https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m3.gif?alt=media&token=8213cc49-0e65-4bfb-a061-2b67a18c8401"
          alt="sticker"
          onClick={() => {
            this.onSendMessage("m3", 2);
          }}
        />
      </div>
    );
  };
  getGifImage = value => {
    switch (value) {
      case "l1":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l1.png?alt=media&token=f7d1ccb9-a154-490f-9ea2-57dce88a0598";
      case "l2":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l2.png?alt=media&token=0771c9aa-d50e-4889-b39a-f7523fdeea01";
      case "l3":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l3.png?alt=media&token=f11507a1-6eed-4e4d-8956-16ef3faf6e66";
      case "l4":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l4.png?alt=media&token=008568d2-daea-4e91-b2d9-fa326621ff9b";
      case "l5":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l5.png?alt=media&token=ae598538-6825-4183-87a8-aacfaf078230";
      case "l6":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l6.png?alt=media&token=ef9cfe7d-1c37-4c35-9c3a-a16d105f3ed8";
      case "l7":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l7.png?alt=media&token=4dab5f90-fbd8-403f-add2-72b0fd85ed5c";
      case "l8":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/l8.png?alt=media&token=cf9d1d76-e5f5-43a1-979e-82686393b038";
      case "m1":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m1.gif?alt=media&token=0b4e7e33-564b-4174-8008-3e7e163c189d";
      case "m2":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m2.gif?alt=media&token=5cbf383a-ecb0-4956-9d75-98597dd18817";
      case "m3":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m3.gif?alt=media&token=8213cc49-0e65-4bfb-a061-2b67a18c8401";
      case "m4":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m4.gif?alt=media&token=a873fef3-9235-4981-b1d6-4c0d66dcceea";
      case "m5":
        return "https://firebasestorage.googleapis.com/v0/b/chat-application-21b00.appspot.com/o/m5.gif?alt=media&token=451cb1ff-ea2d-47e6-a48a-3612bb0a47f8";
    }
  };
  hashString = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
      hash = hash & hash;
    }
    return hash;
  };
  isLastMessageLeft = index => {
    if (
      (index + 1 < this.listMessage.length &&
        this.listMessage[index + 1].idFrom === this.currentUserId) ||
      index === this.listMessage.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  };
}
export default LiveChat;
