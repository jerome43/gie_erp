import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Producer } from '../producer';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray  } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Subscription} from "rxjs/index";
import {ProgressSpinnerDialogComponent} from '../../progress-spinner-dialog/progress-spinner-dialog.component';

export interface DialogDetailProducerData {
  message: string;
  displayNoButton:boolean;
}

@Component({
  selector: 'app-detail-producer',
  templateUrl: './detail-producer.component.html',
  styleUrls: ['./detail-producer.component.less']
})

export class DetailProducerComponent implements OnInit, OnDestroy {
  private producerId: String;
  private producerDoc: AngularFirestoreDocument<Producer>;
  private producer: Observable<Producer>;
  private producerSubscription : Subscription;
  inputContactNotEmpty=[];
  detailProducerForm;

  constructor(private router: Router, private route: ActivatedRoute, private db: AngularFirestore, private fb: FormBuilder, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.producerId = this.getProducerId();
    this.initForm();
    this.observeProducer(this.producerId);
  }

  ngOnDestroy() {
    this.producerSubscription.unsubscribe();
  }

  updateProducer() {
    console.warn(this.detailProducerForm.value);
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
    this.producerDoc = this.db.doc<Producer>('producers/' + this.producerId );
    //this.producerDoc.update(this.detailProducerForm.value);
    this.producerDoc.update(this.detailProducerForm.value).then(data => {
      progressSpinnerDialogRef.close();
      this.openDialogUpdate("Le producteur "+this.producerId+" a été mis à jour.")});
  }

  wantDeleteProducer() {
    console.warn("wantDeleteProducer"+this.producerId);
    this.openDialogWantDelete("Voulez-vous vraiment supprimer le producteur "+this.producerId+" ?");
  }

  deleteProducer() {
    console.warn("deleteProducer"+this.producerId);
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
    this.producerDoc = this.db.doc<Producer>('producers/' + this.producerId );
    this.producerDoc.delete().then(data => {
      progressSpinnerDialogRef.close();
      this.openDialogDelete("Le producteur "+this.producerId+" a été supprimé.")});
  }


  observeProducer(producerId: String) {
    console.log("observeProducer : "+producerId);
    this.producer = this.db.doc<Producer>('producers/'+producerId).valueChanges().pipe(
      tap(producer => {
        if (producer != undefined) {
          var l = producer.contacts.length;
          this.setContacts(l);
          this.detailProducerForm.patchValue(producer);
        }
      })
    );
    this.producerSubscription = this.producer.subscribe({
      next(producer) { console.log('Current producers ', producer); },
      error(msg) { console.log('Error Getting producer ', msg);},
      complete() {console.log('complete')}
    });
  }

  getProducerId(): string {
    return this.route.snapshot.paramMap.get('producerId');
  }

  get contacts() {
    return this.detailProducerForm.get('contacts') as FormArray;
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

  get name() { return this.detailProducerForm.get('name'); }

  initForm() {
    this.inputContactNotEmpty=[];
    this.detailProducerForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      zipcode: [''],
      town: [''],
      country: ['France'],
      phone: [''],
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
      active: ['false'],
    });

    this.detailProducerForm.valueChanges.subscribe(data => {
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
    const dialogRef = this.dialog.open(DialogDetailProducerOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.router.navigate(['list-producers/']);
    });
  }

  openDialogWantDelete(message): void {
    const dialogRef = this.dialog.open(DialogDetailProducerOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result=='yes') {
        this.deleteProducer();
      }
    });
  }

  openDialogDelete(message): void {
    const dialogRef = this.dialog.open(DialogDetailProducerOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.router.navigate(['list-producers/']);
    });
  }
}

@Component({
  selector: 'dialog-detail-producer-overview',
  templateUrl: 'dialog-detail-producer-overview.html',
})
export class DialogDetailProducerOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogDetailProducerOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDetailProducerData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
