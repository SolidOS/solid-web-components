import {defineElements} from '../sol-core.js';

export class SolLogin extends HTMLElement {
 
  constructor() {
    super(); 
  }
  async connectedCallback(){
    this.authSession = UI.authn.authSession;
    if (this.authSession) {
      this.style.display="none";
      this.authSession.onLogin(this.mungeLoginArea);
      this.authSession.onLogout(this.mungeLoginArea);
      this.authSession.onSessionRestore(this.mungeLoginArea);
    }    
    this.mungeLoginArea();
  }
  async mungeLoginArea(){
    const loginButtonArea = this.tagName ?this :document.querySelector('SOL-LOGIN');
    loginButtonArea.classList.add('sol-login');
    loginButtonArea.innerHTML="";
    loginButtonArea.appendChild(UI.login.loginStatusBox(document, null, {}));
    const signupButton = loginButtonArea.querySelectorAll('input')[1];
    if(signupButton) signupButton.style.display="none";
    let me = await UI.authn.checkUser();
    defineElements();
    let button = loginButtonArea.querySelector('input');         
    let transparent = loginButtonArea.hasAttribute('transparent');
    if (me) {       
      loginButtonArea.style.display="inline-block";
      button.value = 'Log out!';           
      button.title = "--- logged in as " + me.value + "\n--- click to logout";
    }
    else {
      loginButtonArea.style.display="inline-block";
      button.value = "Log in!";           
      button.title = "--- click to log in!";
    }
    button.style.margin="0";
    button.style.padding="0.5rem";
    if(transparent) button.style.backgroundColor="transparent";
    if(me) button.style.color="green";
  }      

}
customElements.define("sol-login",SolLogin);
/* END */
