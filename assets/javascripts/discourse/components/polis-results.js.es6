import Component from "@ember/component";
import { action } from "@ember/object";
import { isEmpty } from "@ember/utils";

export default class PolisResults extends Component {
  didInsertElement() {
    this._super(...arguments);

    const interval = setInterval(() => {
      const element = document.querySelector("#post_1");
      if (element) {
        clearInterval(interval);
        this.insertPolisIframe();
      } else {
        // eslint-disable-next-line no-console
        console.log("Element with ID 'targetId' not found");
      }
    }, 300);
  }

  @action
  insertPolisIframe() {
    if (this.siteSettings.plural_polis_site_id && this.hasPolis) {
      const post1 = document.getElementById("post_1");
      const pageId = this.pageId;
      const siteId = this.siteSettings.plural_polis_site_id;
      const xid = this.getXid(this.currentUser);

      const polisDiv = document.createElement("div");
      polisDiv.classList.add("polis");
      polisDiv.dataset.page_id = pageId;
      polisDiv.dataset.site_id = siteId;
      polisDiv.dataset.auth_opt_allow_3rdparty = true;
      polisDiv.dataset.auth_opt_tw = false;
      polisDiv.dataset.auth_opt_fb = false;
      if (xid) {
        const username = this.currentUser.username;
        const avatar =
          window.location.origin +
          this.currentUser.avatar_template.replace("{size}", "90");
        polisDiv.dataset.xid = xid;
        polisDiv.dataset.x_name = username;
        polisDiv.dataset.x_profile_image_url = avatar;
      }
      // polisDiv.dataset.ucv = false;
      polisDiv.dataset.ucw = true;
      polisDiv.dataset.ucsv = false;
      polisDiv.dataset.auth_needed_to_vote = true;
      polisDiv.dataset.auth_needed_to_write = true;
      polisDiv.dataset.ucsh = false;
      polisDiv.dataset.ucsd = false;
      polisDiv.dataset.ucsf = false;
      polisDiv.dataset.ucst = false;
      polisDiv.dataset.subscribe_type = 0;
      polisDiv.dataset.padding = 0;
      polisDiv.dataset.border = "none";
      polisDiv.dataset.show_share = false;
      polisDiv.style.overflowY = "hidden";
      polisDiv.style.overflowX = "hidden";
      polisDiv.setAttribute("scrolling", "no");

      const statementDiv = document.createElement("div");
      statementDiv.textContent = "Pol.is";
      statementDiv.classList.add("polis-statement");

      if (!this.currentUser) {
        polisDiv.style.opacity = 0.4;
        polisDiv.style.pointerEvents = "none"; // Disable clicking on the iframe
        statementDiv.textContent =
          "Log in to participate in the Pol.is conversation";
        statementDiv.classList.add("polis-statement-sign-in");
      }
      // TODO: see final results

      const button = document.createElement("button");
      button.textContent = "Hide Polis";
      button.classList.add("btn");
      button.classList.add("btn-default");
      button.classList.add("polis-button");
      button.addEventListener("click", () => {
        polisDiv.style.display =
          polisDiv.style.display === "none" ? "block" : "none";
        button.textContent =
          polisDiv.style.display === "none" ? "Show Polis" : "Hide Polis";
      });

      const containerDiv = document.createElement("div");
      containerDiv.classList.add("polis-container");
      containerDiv.appendChild(statementDiv);
      containerDiv.appendChild(button);
      post1.appendChild(containerDiv);
      post1.appendChild(polisDiv);

      const script = document.createElement("script");
      script.src = "https://pol.is/embed.js";
      script.async = true;
      post1.appendChild(script);
    }
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
