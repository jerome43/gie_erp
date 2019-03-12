import { Component, OnInit, Inject } from '@angular/core';
import { Producer } from '../producer';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface DialogCreateProducerData {
  id: string;
}

@Component({
  selector: 'app-create-producer',
  templateUrl: './createProducer.component.html',
  styleUrls: ['./createProducer.component.less']
})

export class CreateProducerComponent implements OnInit {

  private createProducerForm;
  private producersCollection: AngularFirestoreCollection<Producer>;

  constructor(db: AngularFirestore, private fb: FormBuilder, private dialog: MatDialog) {
    this.producersCollection = db.collection('producers');
  }

  ngOnInit() {
    this.initForm();
  }

  addProducer() {
    this.producersCollection.add(this.createProducerForm.value).then(data => {
      console.log("Document written with ID: ", data.id);
      this.openDialog(data.id)});
  }


  get contacts() {
    return this.createProducerForm.get('contacts') as FormArray;
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

  get name() { return this.createProducerForm.get('name'); }
  /*
  get email() { return this.createProducerForm.get('email'); }
  getEmailErrorMessage() {
    return this.email.hasError('required') ? 'Vous devez renseigner l\'émail' :
      this.email.hasError('email') ? 'L\'émail semble incorrect' :
        '';
  }
  */


  openDialog(id): void {
    const dialogRef = this.dialog.open(DialogCreateProducerOverview, {
      width: '450px',
      data: {id: id}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.initForm();
    });
  }

  initForm() {
     this.createProducerForm = this.fb.group({
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
      //discount: ['0'],
      //maintenance: ['false'],
      date: [new Date()]
    });
    this.createProducerForm.valueChanges.subscribe(data => {
      console.log('Form changes', data);
    });
  }

  importProducers() {
    var producers = [
      {"id":"1","nom":"BONNEFOY JF","adresse":"le bourg","code_postal":"43320","ville":"Chaspuzac","telephone":"0620867200","email":null,"date_add":"2018-05-03 00:00:00"},
      {"id":"2","nom":"BROTTES","adresse":"Pouzols","code_postal":"43200","ville":"Saint Jeures","telephone":"0622253481","email":"michelle.brottes@orange.fr","date_add":"2018-04-30 00:00:00"},
      {"id":"3","nom":"CHARETTE Stephane","adresse":"Le village","code_postal":"7240","ville":"Saint Jean Chambre","telephone":"0620064543","email":"charette.stephane@orange.fr","date_add":"2018-04-08 00:00:00"},
      {"id":"4","nom":"CHAUSSE Jean Marc","adresse":"Fuvel","code_postal":"43260","ville":"Saint romain Lachalm","telephone":"0607234842","email":"jean-marc.chausse@orange.fr","date_add":"2018-04-08 00:00:00"},
      {"id":"5","nom":"1001 Saveurs","adresse":"La Mothe","code_postal":"43500","ville":"Saint Georges Lagricol","telephone":"0681627606","email":"segolene.guerrier@orange.fr","date_add":"2018-04-08 00:00:00"},
      {"id":"6","nom":"COURBON Val\u00e9rie","adresse":"L'Holme","code_postal":"43260","ville":"St Julien Chapteuil","telephone":"0618065985","email":"v.courbon@sfr.fr","date_add":"2018-04-08 00:00:00"},
      {"id":"7","nom":"CHIROUZE Denis","adresse":"Pouzols","code_postal":"43200","ville":"Saint Jeures","telephone":"0603325188","email":"denis@giefruitsrouges.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"8","nom":"COURT Marie Fanelie","adresse":"Utiac","code_postal":"43190","ville":"Tence","telephone":"06 77 47 16 02","email":"vincent.court0229@orange.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"9","nom":"COTTE Bertrand","adresse":"Le Moulin de Boyer","code_postal":"43520","ville":"Le Mazet St Voy","telephone":"06 17 29 01 61","email":"bertrand.cotte43@orange.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"10","nom":"COTTIER Bernard","adresse":"Le Chomeil","code_postal":"43800","ville":"Rosi\u00e8res","telephone":"06 10 50 61 53","email":"cottier.monique@wanadoo.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"11","nom":"DEFOURS Christelle","adresse":"Les quatres routes","code_postal":"43190","ville":"Le Mas de Tence","telephone":"06 35 41 10 71","email":"christelle.defours@wanadoo.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"12","nom":"GAEC la Chataigneraie","adresse":null,"code_postal":null,"ville":null,"telephone":"06 31 41 74 83","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"13","nom":"GAEC les Petits Fruits Rouges","adresse":"Lagrvou","code_postal":"7240","ville":"Saint Jean Chambre","telephone":"06 99 35 09 63","email":"daniel.fayard@orange.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"14","nom":"FERRE Nolwen","adresse":"Le Bourg","code_postal":"43500","ville":"St Georges Lagricol","telephone":"06 16 76 64 72","email":"nono-ferre@live.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"15","nom":"FERRIER Seb","adresse":"Faurie","code_postal":"43520","ville":"Le Mazet St Voy","telephone":"06 72 64 33 48","email":"seb.ferrier@orange.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"16","nom":"EARL La VERSANNE","adresse":"Tirrebouras","code_postal":"43520","ville":"Le Mazet St Voy","telephone":"06 08 42 34 83","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"17","nom":"FOURNEL Pascal","adresse":"Aulagny","code_postal":"43290","ville":"Montregard","telephone":"06 85 41 59 31","email":"pascal.fournel@yahoo.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"18","nom":"GAEC de la SOUCHE","adresse":"La Souche","code_postal":"7690","ville":"St Andre en Vivarais","telephone":"06 09 57 94 62","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"19","nom":"GUERIN Isabelle","adresse":"La Rochette","code_postal":"43140","ville":"St Didier en Velay","telephone":"06 60 80 84 04","email":"exploitation.guerindidier@hotmail.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"20","nom":"JACCON Philippe","adresse":"Mazalibrand","code_postal":"43520","ville":"le Mazet St Voy","telephone":"06 82 21 49 59","email":"c.jaccon@orange.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"21","nom":"EARL SUC de MONTAIGU","adresse":"La Mathe","code_postal":"43200","ville":"Yssingeaux","telephone":"06 73 58 53 20","email":null,"date_add":"2018-04-09 00:00:00"},
      {"id":"22","nom":"LARDON David","adresse":"La Franchette","code_postal":"43290","ville":"St Bonnet le Froid","telephone":"06 71 41 55 33","email":"david.lardon@orange.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"23","nom":"MAIGNE S\u00e9gol\u00e8ne","adresse":"Le Coin de Mars","code_postal":"7320","ville":"Mars","telephone":"07 85 80 63 57","email":"munier.francis@neuf.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"24","nom":"EARL DOUCEURS DE FRUITS ROUGES","adresse":"la Chalenconniere","code_postal":"43200","ville":"St Julien Molhesabate","telephone":"06 83 20 82 80","email":"pauchon.eric@gmail.com","date_add":"2018-04-09 00:00:00"},
      {"id":"25","nom":"GAEC Minival","adresse":"La Rivallire","code_postal":"43620","ville":"Saint Romain Lachalm","telephone":"06 09 83 42 47","email":"minival@yahoo.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"26","nom":"GAEC de la FOUANT","adresse":"Fraisse","code_postal":"43500","ville":"St Georges Lagricol","telephone":"06 84 24 04 61","email":"gaecdelafouant@wanadoo.fr","date_add":"2018-04-09 00:00:00"},
      {"id":"27","nom":"TOURASSE Patrick","adresse":"Jarjat","code_postal":"7240","ville":"Saint Jean Chambre","telephone":"06 69 15 19 38","email":"pat.tourasse@orange.fr","date_add":"2018-04-09 00:00:00"}
    ];

    var date = new Date();
    var telephone, address, zipcode, town, contactEmail;

    producers.forEach(function (producerImport) {

      producerImport.telephone!=null ? telephone=producerImport.telephone : telephone='';
      producerImport.adresse!=null ? address=producerImport.adresse : address='';
      producerImport.code_postal!=null ? zipcode=Number(producerImport.code_postal) : zipcode=0;
      producerImport.ville!=null ? town=producerImport.ville : town='';
      producerImport.email != null ? contactEmail=producerImport.email : contactEmail='';

      var producer: Producer = {name : producerImport.nom, address : address, zipcode : zipcode, town: town, country: 'France', phone : telephone, contacts: [{contactName : '', contactFunction: '', contactPhone: '', contactCellPhone: '', contactEmail : contactEmail}], comment: '', date : date};
      this.producersCollection.add(producer).then(data => {
        console.log("Document written with ID: ", data.id)});
    }, this)
  };

}

@Component({
  selector: 'dialog-create-producer-overview',
  templateUrl: 'dialog-create-producer-overview.html',
})
export class DialogCreateProducerOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogCreateProducerOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogCreateProducerData) {}
}



