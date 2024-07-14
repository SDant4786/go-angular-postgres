import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from './user.service';
import { UserDialog } from './user-dialog/user-dialog.component';
import { of } from 'rxjs';
import { User } from './user';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockUsersService: jasmine.SpyObj<UsersService>;

  const mockUser: User = {
    id: "1",
    username: 'testuser',
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com',
    userStatus: 'active',
    department: 'IT'
  };

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockUsersService = jasmine.createSpyObj('UsersService', ['getAll']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: UsersService, useValue: mockUsersService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockUsersService.getAll.and.returnValue(of([mockUser]));
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the AppComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should load users list on ngOnInit', () => {
    component.ngOnInit();
    expect(mockUsersService.getAll).toHaveBeenCalled();
    expect(component.dataSource).toEqual([mockUser]);
  });

  it('should subscribe to dialog close and load users list', () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog.open.and.returnValue(dialogRefSpy);
    dialogRefSpy.afterClosed.and.returnValue(of(null)); // Simulate dialog close

    component.openNewDialog();
    expect(component.dialogSubscription).toBeDefined();
    expect(mockUsersService.getAll).toHaveBeenCalled();
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const mockGetAllSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') };
    const mockDialogSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') };

    component.getAllSubscription = mockGetAllSubscription as any;
    component.dialogSubscription = mockDialogSubscription as any;

    component.ngOnDestroy();

    expect(mockGetAllSubscription.unsubscribe).toHaveBeenCalled();
    expect(mockDialogSubscription.unsubscribe).toHaveBeenCalled();
  });
});