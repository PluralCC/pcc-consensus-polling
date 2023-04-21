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
        console.log("Element with ID 'targetId' not found");
      }
    }, 300);
  }

  @action
  insertPolisIframe() {
    if (this.siteSettings.plural_polis_site_id && this.model.has_polis) {
      const post1 = document.getElementById('post_1');
      const pageId = this.model.id;
      const siteId = this.siteSettings.plural_polis_site_id;
      const xid = this.getXid(this.currentUser);

      const polisDiv = document.createElement('div');
      polisDiv.classList.add('polis');
      polisDiv.dataset.page_id = pageId;
      polisDiv.dataset.site_id = siteId;
      polisDiv.dataset.auth_opt_allow_3rdparty = true;
      polisDiv.dataset.auth_opt_tw = false;
      polisDiv.dataset.auth_opt_fb = false;
      if (xid) {
        const username = this.currentUser.username;
        const avatar =  window.location.origin + this.currentUser.avatar_template.replace('{size}', '90');
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
      polisDiv.dataset.border = 'none';
      polisDiv.dataset.show_share = false;
      polisDiv.style.overflowY = 'hidden';
      polisDiv.style.overflowX = 'hidden';
      polisDiv.setAttribute('scrolling', 'no');
      // TODO: see final results

      const statementDiv = document.createElement('div');
      statementDiv.textContent = 'Contribute a statement to the Polis consensus poll or participate in the Discourse discussion below it?';
      statementDiv.classList.add('polis-statement');
      post1.appendChild(statementDiv);
      post1.appendChild(polisDiv);

      const script = document.createElement('script');
      script.src = 'https://pol.is/embed.js';
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
