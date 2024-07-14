import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDialog } from './user-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersService } from '../user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { User } from '../user';

describe('UserDialog', () => {
  let component: UserDialog;
  let fixture: ComponentFixture<UserDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<UserDialog>>;
  let mockUsersService: jasmine.SpyObj<UsersService>;

  const mockUser: User = {
    id: null,
    username: 'testuser',
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com',
    userStatus: 'active',
    department: 'IT'
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockUsersService = jasmine.createSpyObj('UsersService', ['add', 'update', 'delete']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UserDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockUser },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: UsersService, useValue: mockUsersService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the UserDialog component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with user data', () => {
    expect(component.controlGroup.value).toEqual({
      username: 'testuser',
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      userStatus: 'active',
      department: 'IT'
    });
  });

  it('should save user and close dialog on successful add', () => {
    mockUsersService.add.and.returnValue(of({ ...mockUser, id: "1" }));

    component.save();

    expect(mockUsersService.add).toHaveBeenCalledWith(mockUser);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should save user and close dialog on successful update', () => {
    const updatedUser = { ...mockUser, id: "1" };
    component.user = updatedUser;
    mockUsersService.update.and.returnValue(of(updatedUser));

    component.save();

    expect(mockUsersService.update).toHaveBeenCalledWith(updatedUser);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show error popup on conflict error', () => {
    spyOn(component, 'showErrorPopup');
    mockUsersService.add.and.returnValue(throwError({ status: 409 }));

    component.save();

    expect(component.showErrorPopup).toHaveBeenCalledWith('Username already exists');
  });

  it('should return true for hasError if form is invalid', () => {
    component.controlGroup.controls['username'].setValue('');
    expect(component.hasError('username', 'required')).toBe(true);
  });

});