import { Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: firebase.User;
  loggedIn: boolean;

  openLogin() {
    const loginDialogRef = this.dialog.open(LoginDialogComponent, {
      panelClass: 'login-dialog-container'
    });
  }

  checkLogin(): boolean {

    return this.loggedIn;
  }

  loginHandler(user: firebase.User) {
    if (user) {
      this.user = user;
      this.loggedIn = true;
    } else {
      this.user = null;
      this.loggedIn = false;
    }
    console.log('login handler called: ' + this.loggedIn);
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  constructor(public dialog: MatDialog, public afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.afAuth.user.subscribe(
      user => {
        console.log(user);
        this.loginHandler(user);
      }
    );

  }

}
