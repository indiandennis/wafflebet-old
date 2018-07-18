import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  openLogin() {
    const loginDialogRef = this.dialog.open(LoginDialogComponent, {
    });
  }

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

}
