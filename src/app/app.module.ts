import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule }    from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatSortModule, MatPaginatorModule, MatTableModule, MatInputModule, MatMenuModule, MatToolbarModule, MatListModule, MatNativeDateModule, MAT_DATE_LOCALE} from '@angular/material';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { HeaderComponent } from './header/header.component';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatDialogModule} from '@angular/material/dialog';
import {MatBottomSheetModule} from '@angular/material';
import { CreateClientComponent } from './client/create-client/createClient.component';
import { ListClientComponent } from './client/list-client/list-client.component';
import { DetailClientComponent } from './client/detail-client/detail-client.component';
import {DialogCreateClientOverview} from "./client/create-client/createClient.component";
import {DialogDetailClientOverview} from "./client/detail-client/detail-client.component";
import {DialogListClientOverview} from "./client/list-client/list-client.component";
import { CreateProducerComponent } from './producer/create-producer/createProducer.component';
import { DetailProducerComponent } from './producer/detail-producer/detail-producer.component';
import { ListProducerComponent } from './producer/list-producer/list-producer.component';
import {DialogCreateProducerOverview} from "./producer/create-producer/createProducer.component";
import {DialogDetailProducerOverview} from "./producer/detail-producer/detail-producer.component";
import {DialogListProducerOverview} from "./producer/list-producer/list-producer.component";
import {CreateProductComponent} from "./product/create-product/createProduct.component";
import {ListProductComponent} from "./product/list-product/list-product.component";
import {DetailProductComponent} from "./product/detail-product/detail-product.component";
import {DialogCreateProductOverview} from "./product/create-product/createProduct.component";
import {DialogDetailProductOverview} from "./product/detail-product/detail-product.component";
import {DialogListProductOverview} from "./product/list-product/list-product.component";
import {CreateEmployeComponent} from "./employe/create-employe/createEmploye.component";
import {DetailEmployeComponent} from "./employe/detail-employe/detail-employe.component";
import {ListEmployeComponent} from "./employe/list-employe/list-employe.component";
import {DialogCreateEmployeOverview} from "./employe/create-employe/createEmploye.component";
import {DialogDetailEmployeOverview} from "./employe/detail-employe/detail-employe.component";
import {DialogListEmployeOverview} from "./employe/list-employe/list-employe.component";
import { DashboardComponent } from './dashboard/dashboard.component';
import { DialogDashboardOverview } from './dashboard/dashboard.component';
import {BottomSheetOverviewNote} from "./dashboard/dashboard.component";


@NgModule({
  declarations: [
    AppComponent,
    CreateClientComponent,
    ListClientComponent,
    DetailClientComponent,
    CreateProducerComponent,
    ListProducerComponent,
    DetailProducerComponent,
    CreateProductComponent,
    ListProductComponent,
    DetailProductComponent,
    HeaderComponent,
    MobileMenuComponent,
    DialogCreateClientOverview,
    DialogDetailClientOverview,
    DialogListClientOverview,
    DialogCreateProducerOverview,
    DialogDetailProducerOverview,
    DialogListProducerOverview,
    DialogCreateProductOverview,
    DialogDetailProductOverview,
    DialogListProductOverview,
    CreateEmployeComponent,
    DetailEmployeComponent,
    ListEmployeComponent,
    DialogCreateEmployeOverview,
    DialogDetailEmployeOverview,
    DialogListEmployeOverview,
    DashboardComponent,
    DialogDashboardOverview,
    BottomSheetOverviewNote
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),// imports firebase/app needed for everything
    AngularFirestoreModule.enablePersistence(), // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule,// imports firebase/storage only needed for storage features
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    MatTableModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FlexLayoutModule,
    MatDialogModule,
    MatBottomSheetModule,
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
  ],
  bootstrap: [AppComponent],
  entryComponents : [
    DialogCreateClientOverview,
    DialogDetailClientOverview,
    DialogListClientOverview,
    DialogCreateProducerOverview,
    DialogDetailProducerOverview,
    DialogListProducerOverview,
    DialogCreateProductOverview,
    DialogDetailProductOverview,
    DialogListProductOverview,
    DialogCreateEmployeOverview,
    DialogDetailEmployeOverview,
    DialogListEmployeOverview,
    DialogDashboardOverview,
    BottomSheetOverviewNote]
})
export class AppModule { }
