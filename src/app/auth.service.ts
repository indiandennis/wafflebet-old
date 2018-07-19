import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase';
import { from, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  ret = false;
  credential: auth.UserCredential;

  constructor(public afAuth: AngularFireAuth) {}

  logout() {
    this.afAuth.auth.signOut();
  }

  login(email: string, password: string) {
    return from(this.afAuth.auth.signInWithEmailAndPassword(email, password));
  }
}
