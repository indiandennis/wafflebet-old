import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AuthService } from '../auth.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
  AUTO_STYLE
} from '@angular/animations';
import {
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
  FormControl,
  FormControlDirective,
  FormControlName
} from '@angular/forms';
import { MatDialogRef, AUTOCOMPLETE_OPTION_HEIGHT } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

export class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

const originFormControlNgOnChanges = FormControlDirective.prototype.ngOnChanges;
FormControlDirective.prototype.ngOnChanges = function() {
  this.form.nativeElement = this.valueAccessor._elementRef.nativeElement;
  return originFormControlNgOnChanges.apply(this, arguments);
};

const originFormControlNameNgOnChanges = FormControlName.prototype.ngOnChanges;
FormControlName.prototype.ngOnChanges = function() {
  const result = originFormControlNameNgOnChanges.apply(this, arguments);
  this.control.nativeElement = this.valueAccessor._elementRef.nativeElement;
  return result;
};

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css'],
  animations: [
    trigger('slideInOut', [
      state(
        'login, signUp',
        style({ transform: 'none', height: '*', '-webkit-transform': 'none' })
      ),
      state('forgotPass', style({ transform: 'none', height: '*' })),
      state('endState', style({ transform: 'none', height: '*' })),
      transition('signUp => login', [
        style({
          transform: 'translate3d(115%, 0, 0)',
          '-webkit-transform': 'translate(115%, 0)'
        }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('login => signUp', [
        style({
          transform: 'translate3d(-115%, 0, 0)',
          '-webkit-transform': 'translate(-115%, 0)'
        }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('login => forgotPass', [
        style({
          transform: 'translate3d(115%, 0, 0)',
          '-webkit-transform': 'translate(115%, 0)'
        }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('forgotPass => login', [
        style({
          transform: 'translate3d(-115%, 0, 0)',
          '-webkit-transform': 'translate(-115%, 0)'
        }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('signUp => endState', [
        style({
          transform: 'translate3d(0, 110%, 0)',
          '-webkit-transform': 'translate(0, 110%)'
        }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('forgotPass => endState', [
        style({
          transform: 'translate3d(0, 110%, 0)',
          '-webkit-transform': 'translate(0, 110%)'
        }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('endState => login', [
        style({
          transform: 'translate3d(0, -110%, 0)',
          '-webkit-transform': 'translate(0, -110%)'
        }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ])
    ])
  ]
})
export class LoginDialogComponent implements OnInit {
  dialogState = {
    state: 'login',
    title: 'Sign In',
    emailError: 'Enter your email',
    passwordError: 'Enter your password',
    endStateMessage: ''
  };

  matcher = new CustomErrorStateMatcher();

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  resetEmailErrorState(): void {
    const email: any = this.loginForm.controls.email;
    email.nativeElement.focus();
    this.loginForm.reset();
    this.loginForm.controls.email.markAsDirty();
    this.dialogState.passwordError = 'Enter your password';
  }
  submitHandler(): void {
    switch (this.dialogState.state) {
      case 'login':
        this.login();
        break;
      case 'signUp':
        this.signUp();
        break;
      case 'forgotPass':
        this.forgotPass();
        break;
      case 'endState':
        this.dialogRef.close();
        break;
    }
  }
  login(): void {
    if (this.loginForm.valid) {
      this.auth
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe(
          value => {},
          err => {
            console.error('Oops:', err.message);
            switch (err.code) {
              case 'auth/invalid-email':
                this.dialogState.emailError = 'Invalid email';
                this.resetEmailErrorState();
                break;
              case 'auth/user-not-found':
                this.dialogState.emailError = 'No user found with email';
                this.loginForm.reset();
                this.resetEmailErrorState();
                break;
              case 'auth/user-disabled':
                this.dialogState.emailError = 'User has been disabled';
                this.loginForm.reset();
                this.resetEmailErrorState();
                break;
              case 'auth/wrong-password':
                this.dialogState.emailError = 'Enter your email';
                this.dialogState.passwordError = 'Incorrect password';
                console.log(this.loginForm);
                const password: any = this.loginForm.controls.password;
                password.nativeElement.focus();
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

  signUp(): void {
    if (this.loginForm.valid) {
      this.auth
        .createUser(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe(
          value => {},
          err => {
            console.log('error hit: ');
            console.log(err.code);
            switch (err.code) {
              case 'auth/email-already-in-use':
                this.dialogState.emailError = 'Email already in use';
                this.resetEmailErrorState();
                break;
              case 'auth/invalid-email':
                this.dialogState.emailError = 'Invalid email';
                this.resetEmailErrorState();
                break;
              case 'auth/operation-not-allowed':
                this.dialogState.emailError = 'Account creation disabled';
                this.resetEmailErrorState();
                break;
              case 'auth/weak-password':
                this.dialogState.emailError = 'Enter your email';
                this.dialogState.passwordError = 'Weak password';
                const password: any = this.loginForm.controls.password;
                password.nativeElement.focus();
                this.loginForm.controls.password.setValue('');
                break;
            }
          },
          () => {
            this.auth.verifyEmail();
            console.log(`We're done here!`);
            this.dialogState = {
              state: 'endState',
              title: 'Verification Email Sent',
              emailError: 'Enter your email',
              passwordError: 'Enter your password',
              endStateMessage:
                'Please click the verification link emailed to you to complete account creation.'
            };
          }
        );
    }
  }

  forgotPass(): void {
    if (this.loginForm.controls.email.valid) {
      this.auth.resetPass(this.loginForm.value.email).subscribe(
        value => {},
        err => {
          switch (err.code) {
            case 'auth/invalid-email':
              this.dialogState.emailError = 'Invalid email';
              this.resetEmailErrorState();
              break;
            case 'auth/user-not-found':
              this.dialogState.emailError = 'No user with this email';
              this.resetEmailErrorState();
              break;
          }
        },
        () => {
          this.dialogState = {
            state: 'endState',
            title: 'Reset Email Sent',
            emailError: 'Enter your email',
            passwordError: 'Enter your password',
            endStateMessage:
              'Please click the password reset link emailed to you to complete the reset process.'
          };
        }
      );
    }
  }

  switchToSignUp(): void {
    this.loginForm.reset();
    const email: any = this.loginForm.controls.email;
    email.nativeElement.focus();
    this.dialogState = {
      state: 'signUp',
      title: 'Sign Up',
      emailError: 'Enter your email',
      passwordError: 'Enter your password',
      endStateMessage: 'Please check your email for verification'
    };
  }

  switchToLogin(): void {
    this.loginForm.reset();
    const email: any = this.loginForm.controls.email;
    email.nativeElement.focus();
    this.dialogState = {
      state: 'login',
      title: 'Sign In',
      emailError: 'Enter your email',
      passwordError: 'Enter your password',
      endStateMessage: ''
    };
  }

  switchToForgotPass(): void {
    this.loginForm.reset();
    const email: any = this.loginForm.controls.email;
    email.nativeElement.focus();
    this.dialogState = {
      state: 'forgotPass',
      title: 'Password Reset',
      emailError: 'Enter your email',
      passwordError: 'Enter your password',
      endStateMessage: 'Please check your email for verification'
    };
  }

  constructor(
    private auth: AuthService,
    private dialogRef: MatDialogRef<LoginDialogComponent>
  ) {}

  ngOnInit() {}
}
