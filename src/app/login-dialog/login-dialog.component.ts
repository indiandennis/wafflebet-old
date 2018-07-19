import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import {
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
  FormControl
} from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when invalid control is dirty or touched*/
export class CustomErrorMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent implements OnInit {
  dialogState = {
    state: 'login',
    title: 'Sign In',
    form: 'loginForm',
    emailError: 'Enter your email',
    passwordError: 'Enter your password'
  };

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  matcher = new CustomErrorMatcher();
  closeLogin(): void {}

  login(): void {
    if (this.loginForm.valid) {
      this.auth
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe(
          value => {
            console.log(value);
          },
          err => {
            console.error('Oops:', err.message);
            switch (err.code) {
              case 'auth/invalid-email':
                this.dialogState.emailError = 'No user found with email';
                this.loginForm.reset();
                this.loginForm.controls.email.markAsTouched();
                this.loginForm.controls.password.markAsPristine();
                break;
              case 'auth/user-not-found':
                this.dialogState.emailError = 'Invalid email';
                this.loginForm.reset();
                this.loginForm.controls.email.markAsTouched();
                this.loginForm.controls.password.markAsPristine();
                break;
              case 'auth/user-disabled':
                this.dialogState.emailError = 'User has been disabled';
                this.loginForm.reset();
                this.loginForm.controls.email.markAsTouched();
                this.loginForm.controls.password.markAsPristine();
                break;
              case 'auth/wrong-password':
                this.dialogState.passwordError = 'Incorrect password';
                console.log(this.loginForm);
                this.loginForm.controls.password.setValue('');
                break;
            }
          },
          () => {
            console.log(`We're done here!`);
            this.dialogRef.close();
          }
        );
    }
  }

  signUp(): void {}

  constructor(
    private auth: AuthService,
    private dialogRef: MatDialogRef<LoginDialogComponent>
  ) {}

  ngOnInit() {}
}
