import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";
import {UserDialog} from "./user-dialog/user-dialog.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {HttpClientModule} from "@angular/common/http";
import {MatToolbarModule} from "@angular/material/toolbar";
import {UsersService} from "./user.service";

@NgModule({
    declarations: [
        AppComponent,
        UserDialog
    ],
    imports: [
        MatInputModule,
        MatDialogModule,
        MatTableModule,
        BrowserModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        FormsModule,
        HttpClientModule,
        MatToolbarModule,
        ReactiveFormsModule
    ],
    providers: [
        UsersService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
