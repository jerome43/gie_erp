import { Component, OnInit, Inject } from '@angular/core';
import { Client } from '../client';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ProgressSpinnerDialogComponent} from '../../progress-spinner-dialog/progress-spinner-dialog.component';

export interface DialogCreateClientData {
  id: string;
}

@Component({
  selector: 'app-create-client',
  templateUrl: './createClient.component.html',
  styleUrls: ['./createClient.component.less']
})

export class CreateClientComponent implements OnInit {

  createClientForm;
  private clientsCollection: AngularFirestoreCollection<Client>;

  constructor(db: AngularFirestore, private fb: FormBuilder, private dialog: MatDialog) {
    this.clientsCollection = db.collection('clients');
  }

  ngOnInit() {
    this.initForm();
  }

  addClient() {
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {panelClass: 'transparent',disableClose: true});
    this.clientsCollection.add(this.createClientForm.value).then(data => {
      console.log("Document written with ID: ", data.id);
      progressSpinnerDialogRef.close();
      this.openDialog(data.id)});
  }


  get contacts() {
    return this.createClientForm.get('contacts') as FormArray;
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

  get name() { return this.createClientForm.get('name'); }

  openDialog(id): void {
    const dialogRef = this.dialog.open(DialogCreateClientOverview, {
      width: '450px',
      data: {id: id}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.initForm();
    });
  }

  initForm() {
     this.createClientForm = this.fb.group({
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
      date: [new Date()],
       active: ["false"],
    });
    this.createClientForm.valueChanges.subscribe(data => {
      console.log('Form changes', data);
    });
  }

  /*
  importClients() {
    var clients = [
      {"id":"1","nom":"Auvergne Provence","adresse":null,"code_postal":null,"ville":null,"telephone":"06 11 95 22 83","email":null,"date_add":"2018-04-02 00:00:00"},
      {"id":"2","nom":"Boisseret","adresse":null,"code_postal":null,"ville":null,"telephone":"04 73 91 07 53","email":null,"date_add":"2018-04-02 00:00:00"},
      {"id":"3","nom":"Comptoir du P\u00eacher","adresse":null,"code_postal":null,"ville":null,"telephone":"06 24 64 44 66","email":null,"date_add":"2018-04-02 00:00:00"},
      {"id":"4","nom":"DUMAY","adresse":null,"code_postal":null,"ville":null,"telephone":"06 71 91 72 81","email":null,"date_add":"2018-04-08 00:00:00"},
      {"id":"5","nom":"F. R. & CO","adresse":null,"code_postal":null,"ville":null,"telephone":"03 23 28 49 49","email":null,"date_add":"2018-04-08 00:00:00"},
      {"id":"6","nom":"GIRAUD FRUITS","adresse":null,"code_postal":null,"ville":null,"telephone":"04 74 84 85 40","email":null,"date_add":"2018-04-08 00:00:00"},
      {"id":"7","nom":"GRAND FRAIS","adresse":null,"code_postal":null,"ville":null,"telephone":"04 71 02 88 06","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"8","nom":"PRIM SERVICES","adresse":null,"code_postal":null,"ville":null,"telephone":"04 71 05 68 69","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"9","nom":"Jardin  Johana","adresse":null,"code_postal":null,"ville":null,"telephone":"04 71 08 32 77","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"10","nom":"Jardin Proven\u00e7al","adresse":null,"code_postal":null,"ville":null,"telephone":"04 75 35 36 79","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"11","nom":"JEANNINGROS","adresse":null,"code_postal":null,"ville":null,"telephone":"04 91 98 02 28","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"12","nom":"LYON SELECT","adresse":null,"code_postal":null,"ville":null,"telephone":"04 72 56 97 97","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"13","nom":"METRAL","adresse":null,"code_postal":null,"ville":null,"telephone":"04 74 79 39 79","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"14","nom":"MONLOUP","adresse":null,"code_postal":null,"ville":null,"telephone":"01 41 73 07 89","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"15","nom":"Pomona Clermont","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"16","nom":"PROSOL","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"17","nom":"PRIM SOLEIL","adresse":null,"code_postal":null,"ville":null,"telephone":"06 23 86 02 48","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"18","nom":"Savoie Volailles","adresse":null,"code_postal":null,"ville":null,"telephone":"06 80 57 40 68","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"19","nom":"Syst\u00e8me U","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"20","nom":"Super U","adresse":null,"code_postal":null,"ville":null,"telephone":"04 71 59 61 91","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"21","nom":"SICOLY","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"22","nom":"RIC Fruits","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"23","nom":"TESTUD","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"24","nom":"SOURCE FRUITS","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"25","nom":"DELICES FRUITS","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"26","nom":"AGROBIODROM","adresse":null,"code_postal":null,"ville":null,"telephone":null,"email":null,"date_add":"2018-04-09 00:00:00"}
    ];

    var date = new Date();
    var telephone;

    clients.forEach(function (clientImport) {
      clientImport.telephone!=null ? telephone=clientImport.telephone : telephone='';

      var client: Client = {name : clientImport.nom, address : '', zipcode : 0, town: '', country: 'France', phone : telephone, contacts: [{contactName : '', contactFunction: '', contactPhone: '', contactCellPhone: '', contactEmail : 'contact@contact.com'}], comment: '', date : date, active:'false'};
      this.clientsCollection.add(client).then(data => {
        console.log("Document written with ID: ", data.id)});
    }, this)
  };
  */

}

@Component({
  selector: 'dialog-create-client-overview',
  templateUrl: 'dialog-create-client-overview.html',
})
export class DialogCreateClientOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogCreateClientOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogCreateClientData) {}
}



