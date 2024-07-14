import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {UserDialog} from "./user-dialog/user-dialog.component";
import {UsersService} from "./user.service";
import {User} from "./user";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  displayedColumns = ['username'
    , 'firstname'
    , 'lastname'
    , 'email'
    , 'userStatus'
    , 'department'];
  dataSource: User[] = [];
  getAllSubscription: Subscription;
  dialogSubscription: Subscription;

  constructor(public dialog: MatDialog, public service: UsersService) {}

  openEditDialog(u: User) {
    this.openDialog(new User(
      u.id, 
      u.username, 
      u.firstname, 
      u.lastname, 
      u.email, 
      u.userStatus, 
      u.department, 
    ));
  }

  openNewDialog(): void {
    this.openDialog(new User());
  }

  private openDialog(u: User): void {
    this.dialogSubscription = this.dialog
      .open(UserDialog, {data: u, minWidth: '30%'})
      .afterClosed().subscribe(() => this.loadUsersList());
  }

  private loadUsersList(): void {
    this.getAllSubscription = this.service.getAll()
      .subscribe(users => this.dataSource = users);
  }

  ngOnInit(): void {
    this.loadUsersList();
  }

  ngOnDestroy(): void {
    this.getAllSubscription.unsubscribe();
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }
}
