import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Client } from '../client';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray  } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Subscription} from "rxjs/index";
import {ProgressSpinnerDialogComponent} from '../../progress-spinner-dialog/progress-spinner-dialog.component';

export interface DialogDetailClientData {
  message: string;
  displayNoButton:boolean;
}

@Component({
  selector: 'app-detail-client',
  templateUrl: './detail-client.component.html',
  styleUrls: ['./detail-client.component.less']
})

export class DetailClientComponent implements OnInit, OnDestroy {
  private clientId: String;
  private clientDoc: AngularFirestoreDocument<Client>;
  private client: Observable<Client>;
  private clientSubscription : Subscription;
  inputContactNotEmpty=[];
  detailClientForm;

  constructor(private router: Router, private route: ActivatedRoute, private db: AngularFirestore, private fb: FormBuilder, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.clientId = this.getClientId();
    this.initForm();
    this.observeClient(this.clientId);
  }

  ngOnDestroy() {
    this.clientSubscription.unsubscribe();
  }

  updateClient() {
    console.warn(this.detailClientForm.value);
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
    this.clientDoc = this.db.doc<Client>('clients/' + this.clientId );
    //this.clientDoc.update(this.detailClientForm.value);
    this.clientDoc.update(this.detailClientForm.value).then(data => {
      progressSpinnerDialogRef.close();
      this.openDialogUpdate("Le client "+this.clientId+" a été mis à jour.")});
  }

  wantDeleteClient() {
    console.warn("wantDeleteClient"+this.clientId);
    this.openDialogWantDelete("Voulez-vous vraiment supprimer le client "+this.clientId+" ?");
  }

  deleteClient() {
    console.warn("deleteClient"+this.clientId);
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
    this.clientDoc = this.db.doc<Client>('clients/' + this.clientId );
    this.clientDoc.delete().then(data => {
      progressSpinnerDialogRef.close();
      this.openDialogDelete("Le client "+this.clientId+" a été supprimé.")});
  }


  observeClient(clientId: String) {
    console.log("observeClient : "+clientId);
    this.client = this.db.doc<Client>('clients/'+clientId).valueChanges().pipe(
      tap(client => {
        if (client != undefined) {
          var l = client.contacts.length;
          this.setContacts(l);
          this.detailClientForm.patchValue(client);
        }
      })
    );
    this.clientSubscription = this.client.subscribe({
      next(client) { console.log('Current clients ', client); },
      error(msg) { console.log('Error Getting client ', msg);},
      complete() {console.log('complete')}
    });
  }

  getClientId(): string {
    return this.route.snapshot.paramMap.get('clientId');
  }

  get contacts() {
    return this.detailClientForm.get('contacts') as FormArray;
  }

  setContacts(l) {
    while (this.contacts.length !== 1) {
      this.contacts.removeAt(1)
    }

    for (var i=0; i<l-1; i++) {
      this.addContacts();
    }
    this.inputContactNotEmpty = [false];
    if (l>1) {
      for (var i=1; i<l; i++) {
          this.inputContactNotEmpty.push(true);
      }
    }
  }

  addContacts() {
    this.contacts.push(this.fb.group({
      contactName: [''],
      contactFunction: [''],
      contactPhone: [''],
      contactCellPhone: [''],
      contactEmail: ['', [Validators.email]]}));
  }

  rmContacts(i) {
    //console.log("rmContact : "+i);
    this.contacts.removeAt(Number(i));
  }

  get name() { return this.detailClientForm.get('name'); }

  initForm() {
    this.inputContactNotEmpty=[];
    this.detailClientForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      zipcode: [''],
      town: [''],
      country: ['France'],
      phone: [''],
      //email: ['', [Validators.required, Validators.email]],
      contacts: this.fb.array([
        this.fb.group({
          contactName: [''],
          contactFunction: [''],
          contactPhone: [''],
          contactCellPhone: [''],
          contactEmail: ['', [Validators.email]]})
      ]),
      comment: [''],
      date: [''],
      active: [''],
    });

    this.detailClientForm.valueChanges.subscribe(data => {
      console.log('Form changes', data);
      var l = data.contacts.length;

      if (data.contacts[l-1]!="") {
        this.inputContactNotEmpty[l-1]=true;
      }
      else {
        this.inputContactNotEmpty[l-1]=false;
      }
    });
  }

  openDialogUpdate(message): void {
    const dialogRef = this.dialog.open(DialogDetailClientOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.router.navigate(['list-clients/']);
    });
  }

  openDialogWantDelete(message): void {
    const dialogRef = this.dialog.open(DialogDetailClientOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result=='yes') {
        this.deleteClient();
      }
    });
  }

  openDialogDelete(message): void {
    const dialogRef = this.dialog.open(DialogDetailClientOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.router.navigate(['list-clients/']);
    });
  }
}

@Component({
  selector: 'dialog-detail-client-overview',
  templateUrl: 'dialog-detail-client-overview.html',
})
export class DialogDetailClientOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogDetailClientOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDetailClientData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
