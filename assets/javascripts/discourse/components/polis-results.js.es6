import Component from "@ember/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { isEmpty } from "@ember/utils";
import { ajax } from "discourse/lib/ajax";

export default class PolisResults extends Component {
  @tracked conversationId = null;
  @tracked isLoginBannerVisible = false;
  @tracked isLoadingInitial = true;

  // the first comment is initialized by getInitialComment.
  // The comments after the initial one, are set after voting one statement
  @tracked nextComment = null;

  tagName = "div";
  classNames = ["polis-results"];
  voteNameToValue = {
    YES: -1,
    NO: 1,
    "N/A": 0,
  };

  didInsertElement() {
    this._super(...arguments);
    this.getInitialComment();
  }

  @action
  getInitialComment() {
    const parentURL = encodeURIComponent(window.location.href);
    const iframeUrl = `https://pol.is/${this.siteId}/${this.topicId}?parent_url=${parentURL}`;
    const xId = this.getXid(this.currentUser);
    let username = "";
    let avatar = "";
    if (xId) {
      username = this.currentUser.username;
      // we need the full url, because it will be sent to Polis
      avatar =
        window.location.origin +
        this.currentUser.avatar_template.replace("{size}", "90");
    }
    let url = `/pcc_api/polis_comments/${
      this.topicId
    }.json?${this.encodeUserAttributesForURL(
      xId,
      username,
      avatar
    )}&iframe_url=${encodeURIComponent(iframeUrl)}`;

    return fetch(url, {
      headers: {
        "Access-Control-Request-Headers": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then((r) => {
        this.conversationId = r.conversation_id;
        const nextComment = JSON.parse(r.next_comment);
        // when there are no more comments, the api returns an object with only the currentPid
        if (nextComment.txt) {
          this.nextComment = JSON.parse(r.next_comment);
        } else {
          this.nextComment = null;
        }
        this.isLoadingInitial = false;
      })
      .catch(function (error) {
        this.isLoadingInitial = false;
        let message;
        if (error.hasOwnProperty("message")) {
          message = error.message;
        } else {
          message = error;
        }
        // eslint-disable-next-line no-console
        console.log(message);
      });
  }

  @action
  voteComment(comment, voteName) {
    const xId = this.getXid(this.currentUser);
    if (!this.currentUser || !xId) {
      this.isLoginBannerVisible = true;
      return;
    }
    const vote = this.voteNameToValue[voteName];
    let payload = {
      weight: 0,
      vote,
      tid: comment.tid,
      pid: "mypid",
      agid: 1,
      conversationId: this.conversationId,
    };

    payload.xid = xId;
    payload.xName = this.currentUser.username;
    payload.xProfileImageUrl =
      window.location.origin +
      this.currentUser.avatar_template.replace("{size}", "90");
    return ajax("/pcc_api/vote_comment.json", {
      type: "POST",
      data: payload,
    })
      .then((r) => {
        if (r.nextComment && r.nextComment.txt) {
          this.nextComment = r.nextComment;
        } else {
          this.nextComment = null;
        }
      })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
  }

  encodeUserAttributesForURL(xid, xName, xProfileImageURl) {
    return `xid=${encodeURIComponent(xid)}&x_name=${encodeURIComponent(
      xName
    )}&x_profile_image_url=${encodeURIComponent(xProfileImageURl)}`;
  }

  // todo, this is a copy of the helper until we can figure out how to import it
  getXid() {
    if (!isEmpty(this.currentUser)) {
      return this.currentUser.associated_account_ids &&
        this.currentUser.associated_account_ids.siwe
        ? this.currentUser.associated_account_ids.siwe
        : this.currentUser.primary_email.email;
    } else {
      return "";
    }
  }
}
