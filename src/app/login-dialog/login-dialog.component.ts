import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AuthService } from '../auth.service';
import {
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
  FormControl,
  FormControlDirective,
  FormControlName
} from '@angular/forms';
import { MatDialogRef } from '@angular/material';
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

  signUp(): void {}

  constructor(
    private auth: AuthService,
    private dialogRef: MatDialogRef<LoginDialogComponent>
  ) {}

  ngOnInit() {}
}
