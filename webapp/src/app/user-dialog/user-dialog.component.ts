import {Component, Inject, OnDestroy} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UsersService} from "../user.service";
import {User} from "../user";
import {Subscription} from 'rxjs';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {InstantErrorStateMatcher} from "./instant-error-state.matcher";

@Component({
  selector: 'user-dialog',
  templateUrl: 'user-dialog.component.html',
  styleUrls: ['user-dialog.component.scss']
})
export class UserDialog implements OnDestroy {
  controlGroup: UntypedFormGroup;
  errorStateMatcher = new InstantErrorStateMatcher();
  addSubscription: Subscription;
  updateSubscription: Subscription;
  deleteSubscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public user: User,
    public dialogRef: MatDialogRef<UserDialog>,
    public service: UsersService
  ) {
    this.controlGroup = new UntypedFormGroup({
      username: new UntypedFormControl(user.username, Validators.required),
      firstname: new UntypedFormControl(user.firstname, Validators.required),
      lastname: new UntypedFormControl(user.lastname, Validators.required),
      email: new UntypedFormControl(user.email, [Validators.required,Validators.email ]),
      userStatus: new UntypedFormControl(user.userStatus, Validators.required),
      department: new UntypedFormControl(user.department),
    });
  }

  save(): void {
    this.user.username = this.formValue('username');
    this.user.firstname = this.formValue('firstname');
    this.user.lastname = this.formValue('lastname');
    this.user.email = this.formValue('email');
    this.user.userStatus = this.formValue('userStatus');
    this.user.department = this.formValue('department');
  
    const action = !this.user.id ? 'add' : 'update';
  
    const subscription = this.service[action](this.user).subscribe({
      next: () => this.dialogRef.close(),
      error: (err) => {
        if (err.status === 409) { // Assuming 409 Conflict for existing user
          this.showErrorPopup('Username already exists');
        } else {
          // Handle other errors as needed
          console.error(err);
        }
      }
    });
  }

  delete(): void {
    this.deleteSubscription = this.service.delete(this.user.id)
      .subscribe(this.dialogRef.close);
  }

  hasError(controlName: string, errorCode: string): boolean {
    return !this.controlGroup.valid && this.controlGroup.hasError(errorCode, [controlName]);
  }
  showErrorPopup(message: string): void {
    // Implementation for showing the error popup
    alert(message); // You can replace this with a dialog service for a better UI
  }
  ngOnDestroy(): void {
    if (this.addSubscription) {
      this.addSubscription.unsubscribe();
    }
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    if (this.deleteSubscription) {
      this.deleteSubscription.unsubscribe();
    }
  }

  private formValue(controlName: string): any {
    return this.controlGroup.get(controlName).value;
  }
}
