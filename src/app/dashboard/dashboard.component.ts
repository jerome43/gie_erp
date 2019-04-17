import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {Product} from "../product/product";
import {Producer} from "../producer/producer";
import { Client } from "../client/client";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs'
import { tap, map } from 'rxjs/operators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import {Subscription} from "rxjs/index";
import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;
import { DashboardClient }  from './dashboard';
import { DashboardProducer }  from './dashboard';
import {PdfService} from "../pdf/pdf.service";
import {PdfType} from '../pdf/pdf-type';
import {ProgressSpinnerDialogComponent} from '../progress-spinner-dialog/progress-spinner-dialog.component';

export interface ClientId extends Client { id: string; }
export interface ProductId extends Product { id: string; }
export interface ProducerId extends Producer { id: string; }
export interface DialogDashboardData { message: string; contentType:string; date: Date; price:number }

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  dashboardClients: DashboardClient = {
    colProduct: [],
    row: [],
    sum: []
  };
  private dashboardClientsSubscription: Subscription;

  dashboardProducers: DashboardProducer = {
    colProduct: [],
    row: [],
    sum: []
  };
  private dashboardProducersSubscription: Subscription;


  private dashboardId: string;
  dashboardDate = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
  private lastDashboardDate: Date;

  // for client
  private fbClients: Observable<ClientId[]>; // clients on Firebase
  private fbClientsSubscription : Subscription; // then we can unsubscribe after having subscribe

  // for product
  private fbProducts: Observable<ProductId[]>; // products on Firebase
  private fbProductsSubscription : Subscription; // then we can unsubscribe after having subscribe

  // for producer
  private fbProducers: Observable<ProducerId[]>; // producers on Firebase
  private fbProducersSubscription : Subscription; // then we can unsubscribe after having subscribe

  // for notes
  private note: string='';
  private noteSubscription: Subscription;

  // for delivery
  private indexNumeroDelivery:number;
  private tva:number;

  // for spinner dialog
  private progressSpinnerDialogRef:MatDialogRef<ProgressSpinnerDialogComponent>;


  constructor(private db: AngularFirestore, private dialog: MatDialog, private bottomSheet: MatBottomSheet, private pdfService: PdfService) {
  }

  ngOnInit() {
    this.observeLastDashboardDate();
    this.testDashBoardExist(this.dashboardDate);
    this.getNote(this.dashboardDate);
    this.observeIndexNumeroDelivery();
    this.observeTva();
  }

  ngOnDestroy() {
    if (this.noteSubscription!=undefined) {this.noteSubscription.unsubscribe();}
    if (this.dashboardProducersSubscription!=undefined) {this.dashboardProducersSubscription.unsubscribe();}
    if (this.dashboardClientsSubscription!=undefined) {this.dashboardClientsSubscription.unsubscribe();}
  }

  // USER INTERFACE EVENTS

  change_cell_table(collection, dataset, iC, iP) {
    console.log(dataset, ' / ',iC, ' /' ,iP);
    collection=="clients"? this.calculateSumClients(()=>this.updateDashboard(collection)) : this.calculateSumProducers(()=>this.updateDashboard(collection));
  }

  editPrice(productId, clientId, indexRowClient, indexColumnProduct) {
    console.log(productId, clientId, indexRowClient, indexColumnProduct);
    this.openDialogWantEditPrice("Editer le prix", indexRowClient, indexColumnProduct, this.dashboardClients.row[indexRowClient].price[indexColumnProduct]);
  }

  toogleColProduct(idProduct) {
    console.log("hideColProduct");
    for (var i=0; i<this.dashboardClients.colProduct.length; i++) {
      //console.log('idProduct : ', idProduct, ' / ', this.dashboard.colProduct[i].id );
      if (idProduct==this.dashboardClients.colProduct[i].product.id) {
        this.dashboardClients.colProduct[i].display = this.dashboardClients.colProduct[i].display != true;
        this.dashboardClients.sum[i].display = this.dashboardClients.sum[i].display != true;
        this.dashboardProducers.colProduct[i].display = this.dashboardProducers.colProduct[i].display != true;
        this.dashboardProducers.sum[i].display = this.dashboardProducers.sum[i].display != true;
        this.calculateSumClients(()=>this.calculateSumProducers(()=>this.updateDashboard("both")));
        break;
      }
    }
  }

  toogleRowClient(idClient) {
    console.log("hideRowClient");
    for (var i=0; i<this.dashboardClients.row.length; i++) {
      //console.log('idClient : ', idClient, ' / ', this.dashboard.row[i].id );
      if (idClient==this.dashboardClients.row[i].id) {
        this.dashboardClients.row[i].display = this.dashboardClients.row[i].display != true;
        this.calculateSumClients(()=>this.updateDashboard("clients"));
        break;
      }
    }
  }

  toogleRowProducer(Producer) {
    console.log("hideRowProducer");
    for (var i=0; i<this.dashboardProducers.row.length; i++) {
      //console.log('Producer : ', Producer, ' / ', this.dashboard.rowProducer[i].id );
      if (Producer==this.dashboardProducers.row[i].id) {
        this.dashboardProducers.row[i].display = this.dashboardProducers.row[i].display != true;
        this.calculateSumProducers(()=>this.updateDashboard("producers"));
        break;
      }
    }
  }

  wantGenerateDeliveryPdf(clientId, indexClient) {
    console.log('wantGenerateDeliveryPdf : ', clientId, indexClient);
    var numeroDelivery: number;
    if (this.dashboardClients.row[indexClient].numeroDelivery==null) {
      numeroDelivery = this.indexNumeroDelivery+1;
      this.dashboardClients.row[indexClient].numeroDelivery = this.indexNumeroDelivery+1;
      this.updateNumeroDelivery();
      this.updateDashboard('clients');
    }
    else {
      numeroDelivery = this.dashboardClients.row[indexClient].numeroDelivery;
    }

    var products: {product: ProductId, quantity:number, price: number, display:boolean}[] = [];
      for (var i=0; i< this.dashboardClients.colProduct.length; i++) {
        products.push({product: this.dashboardClients.colProduct[i].product,
          quantity: this.dashboardClients.row[indexClient].quantity[i],
          price: this.dashboardClients.row[indexClient].price[i],
          display:this.dashboardClients.colProduct[i].display})
      }
      var client;
      var clientSubscription = this.db.doc<Client>('clients/'+clientId).valueChanges().pipe(
        tap(clientResult => {
          client = clientResult;
        })).subscribe(()=>{
        clientSubscription.unsubscribe();
        this.pdfService.wantGeneratePdf(client, products, numeroDelivery, this.dashboardDate, this.tva, PdfType.deliveryReceipt);
      });
  }

  changeDate() {
    console.log("dateChange: ", this.dashboardDate);
    this.testDashBoardExist(this.dashboardDate);
  }

  clearDashboard() {
    this.openDialogWantClearDashboard("Voulez-vous vraiment supprimer toutes les commandes et approvisionnements du tableau courant ?");
  }

  openBottomSheet(): void {
    const bottomSheet = this.bottomSheet.open(BottomSheetOverviewNote, {data: this.note});
      bottomSheet.afterDismissed().subscribe(data => {
      console.log('BottomSheet was closed', data);
        if (data!=undefined) { // car si la modale est fermée par clic en dehors de sa zone, data n'est pas transmis
          this.note = data;
          this.addNote(data);
        }
    });
  }

  // END USER INTERFACE EVENTS

  observeLastDashboardDate() {
    console.log("observeLastDashboardDate : ");
    this.db.doc<any>('parameters/lastDashboard').valueChanges().subscribe(
      lastDashboard => {
        if (lastDashboard.date!=undefined) {
          this.lastDashboardDate = lastDashboard.date.toDate();
          console.log("observeLastDashboardDate : ", this.lastDashboardDate);
        }
      });
  }

  observeIndexNumeroDelivery() {
    console.log("observeIndexNumeroDelivery : ");
    this.db.doc<any>('parameters/numeroDelivery').valueChanges().subscribe(
      numeroDelivery => {
        this.indexNumeroDelivery = numeroDelivery.index;
        console.log("observeIndexNumeroDeliverySubscribe : ", this.indexNumeroDelivery);
      });
  }

  observeTva() {
    console.log("observeTva : ");
    this.db.doc<any>('parameters/tva').valueChanges().subscribe(
      tva => {
        this.tva = tva.taux;
        console.log("observeTvaSubscribe : ", this.tva);
      });
  }

  updateNumeroDelivery() {
    this.db.collection('parameters').doc("numeroDelivery").update({index: this.indexNumeroDelivery+1});
  }

  createNewDashboard(date) {
    this.showProgressSpinnerDialog();
    this.dashboardClients = {
      colProduct: [],
      row: [],
      sum: []
    };
    this.dashboardProducers = {
      colProduct: [],
      row: [],
      sum: []
    };

     // loading clients and update dashboard
    //this.fbClients = this.db.collection('clients', ref => ref.where('active', '==', 'true')).snapshotChanges().pipe(
      this.fbClients = this.db.collection('clients', ref => ref.orderBy('name', 'asc')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Client;
        const name = data.name;
        const id = a.payload.doc.id;
        if (data.active=="true") {
          this.dashboardClients.row.push({id, name, numeroDelivery: null, display: true, quantity: [], price: []});
        }
        return {id, ...data };
      })));


    // loading products and update dashboard
       this.fbProducts = this.db.collection('products', ref => ref.orderBy('sortIndex', 'asc')).snapshotChanges().pipe(
         map(actions => actions.map(a => {
          const data = a.payload.doc.data() as ProductId;
          //const name = data.name;
          const id = a.payload.doc.id;
          data.id = a.payload.doc.id;
             if(data.active=="true") {
               this.dashboardClients.colProduct.push({product: data, display: true});
               this.dashboardProducers.colProduct.push({product: data, display: true});
               this.dashboardClients.row.forEach(function(client) {
                 client.quantity.push(null);
                 client.price.push(null);
               });
               this.dashboardProducers.row.forEach(function(producer) {
                 producer.quantity.push(null);
               });
               this.dashboardClients.sum.push({display: true, quantity: 0});
               this.dashboardProducers.sum.push({display: true, quantity: 0});
             }
     return {id, ...data };
     })));

    // loading producers and update dashboard
      this.fbProducers = this.db.collection('producers', ref => ref.orderBy("name", "asc")).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Producer;
          const name = data.name;
          const id = a.payload.doc.id;
            if (data.active=="true") {this.dashboardProducers.row.push({id, name, display: true, quantity: []});}
            // todo pour améliorer performance, il ne faudrait charger que les actives depuis la DB et trier ensuite
          //this.dashboardProducers.row.push({id, name, display: true, quantity: []});
          return {id, ...data };
        })));

    this.fbProducersSubscription = this.fbProducers.subscribe((producer)=>{ // subscribe to clients changes
      this.fbProducersSubscription.unsubscribe();// unsubscribe to avoid memory leaks
      this.fbClientsSubscription = this.fbClients.subscribe((clients)=>{ // subscribe to clients changes
        this.fbClientsSubscription.unsubscribe();// unsubscribe to avoid memory leaks
       // console.log('Current clients: ', clients);
        this.fbProductsSubscription = this.fbProducts.subscribe((products)=>{ // subscribe to products changes
          this.fbProductsSubscription.unsubscribe(); // unsubscribe to avoid memory leaks
       //   console.log('Current products: ', products);
          this.hideProgressSpinnerDialog();
          console.log('dashboard clients : ', this.dashboardClients);
          console.log('dashboard producers: ', this.dashboardProducers);
          this.addDashboard(date);
          })
        });
      });
  }


  updateDashboard(collection) {
    console.log("update dashboard");
    this.showProgressSpinnerDialog();
    if (collection=="clients") {
      this.db.collection('dashboardClients').doc(this.dashboardId).update({dashboard: this.dashboardClients, date: this.dashboardDate}).then(()=> {
          console.log("dashboard clients set with ID: ", this.dashboardId);
          this.hideProgressSpinnerDialog();
      })
        .catch(function(error) {
          console.error("Error set document: ", error);
          this.hideProgressSpinnerDialog();
        });
    }
    else if (collection=="producers") {
      this.db.collection('dashboardProducers').doc(this.dashboardId).update({dashboard: this.dashboardProducers, date: this.dashboardDate}).then(()=> {
          console.log("dashboard producers set with ID: ", this.dashboardId);
          this.hideProgressSpinnerDialog();})
        .catch(function(error) {
          console.error("Error set document: ", error);
          this.hideProgressSpinnerDialog();
        });
    }
    else if (collection=="both") {
      this.db.collection('dashboardProducers').doc(this.dashboardId).update({dashboard: this.dashboardProducers, date: this.dashboardDate}).then(()=> {
          console.log("dashboard producers set with ID: ", this.dashboardId);
          this.db.collection('dashboardClients').doc(this.dashboardId).update({dashboard: this.dashboardClients, date: this.dashboardDate}).then(()=> {
              console.log("dashboard clients set with ID: ", this.dashboardId);
              this.hideProgressSpinnerDialog();
            })
            .catch((error)=> {
              console.error("Error set document: ", error);
              this.hideProgressSpinnerDialog();
              // todo delete dashboad producer
            });
      })
        .catch((error)=> {
          console.error("Error set document: ", error);
          this.hideProgressSpinnerDialog();
        });
    }
  }


  testDashBoardExist(date) { // test si un dashboard existe à la date donnée en paramètre
    //this.showProgressSpinnerDialog();
    this.db.collection('dashboardClients', ref => ref.where('date', '==', date)).get().subscribe(querySnapshot=> {
     // this.hideProgressSpinnerDialog();
      console.log('querying dahboard exist : ', querySnapshot);
      if (querySnapshot.empty) {
        console.log(" dashboard does not exist at this date :", date);
        this.openDialogWantCreateDashboard("Aucun tableau à cette date. Voulez-vous en créer un nouveau vierge ou rempli à partir des données du dernier tableau consulté ?", date)
      }
      else {
        console.log("dashboard exist at this date : ", date);
        this.getDashboard(date);
        this.getNote(date);
      }
    })
  }

  getDashboard(date) {
    this.getDasboardClients(date);
    this.getDashboardProducers(date);
    this.lastDashboardDate = date;
    this.setLastDashboardDate(date);
  }

  getDashboardProducers(date) {
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
    if (this.dashboardProducersSubscription!=undefined) {this.dashboardProducersSubscription.unsubscribe()}
    this.dashboardProducersSubscription = this.db.collection('dashboardProducers', ref => ref.where('date', '==', date)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as {date: Timestamp, dashboard: DashboardProducer};
        const id = a.payload.doc.id;
        return {id, ...data };
      })))
      .subscribe((querySnapshot)=>{
        progressSpinnerDialogRef.close();
        console.log('get dashboard producers : ', querySnapshot);
        if (querySnapshot[0]==undefined) {
          console.warn("Aucun tableau à cette date ", date)
        }
        else {
          this.dashboardId = querySnapshot[0].id;
          this.dashboardProducers = querySnapshot[0].dashboard;
        }
      });
  }

  getDasboardClients(date) {
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
    if (this.dashboardClientsSubscription!=undefined) {this.dashboardClientsSubscription.unsubscribe()}
    this.dashboardClientsSubscription = this.db.collection('dashboardClients', ref => ref.where('date', '==', date)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as {date: Timestamp, dashboard: DashboardClient};
        const id = a.payload.doc.id;
        return {id, ...data };
      })))
      .subscribe((querySnapshot)=>{
        progressSpinnerDialogRef.close();
        console.log('get dashboard clients : ', querySnapshot);
        if (querySnapshot[0] == undefined) {
          console.warn("Aucun tableau à cette date ", date)
        }
        else {
          this.dashboardId = querySnapshot[0].id;
          this.dashboardClients = querySnapshot[0].dashboard;
        }
      });
  }

  getLastAndAddDashboard(date) {
    this.showProgressSpinnerDialog();
    this.db.collection('dashboardClients', ref => ref.where('date', '==', this.lastDashboardDate)).get().subscribe(querySnapshot=>{
      console.log('querying dahboard: ', querySnapshot);
      if (querySnapshot.empty) {
        this.hideProgressSpinnerDialog();
        console.log(" Aucun tableau à cette date :", this.lastDashboardDate);
      }
      else {
        this.dashboardClients = querySnapshot.docs[0].data().dashboard;
        this.db.collection('dashboardProducers', ref => ref.where('date', '==', this.lastDashboardDate)).get().subscribe(querySnapshot=>{
          this.hideProgressSpinnerDialog();
          console.log('querying dahboard: ', querySnapshot);
          if (querySnapshot.empty) {
            console.log(" Aucun tableau à cette date :", this.lastDashboardDate);
          }
          else {
            this.dashboardProducers = querySnapshot.docs[0].data().dashboard;
            this.addDashboard(date);
          }
        });
      }
    });
  }

  setLastDashboardDate(date) {
    console.log("setLastDashboardDate");
      this.db.collection('parameters').doc("lastDashboard").update({date: date})
        .catch(function(error) {
          console.error("Error updating document: ", error);
          });
  }

  addDashboard(date) {
    this.showProgressSpinnerDialog();
    var idDate= date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
    this.db.collection('dashboardClients').doc(idDate).set({dashboard: this.dashboardClients, date: date})
      .then((doc)=> {
        console.log("dashboard client add with ID: ", idDate);
        this.db.collection('dashboardProducers').doc(idDate).set({dashboard: this.dashboardProducers, date: date})
          .then((doc)=> {
            this.hideProgressSpinnerDialog();
            console.log("dashboard producers add with ID: ", idDate);
            this.dashboardId = idDate;
            this.getDashboard(date); // on relance pour pouvoir s'abonner à des mises à jours de données venant d'un autre utilisateur
          })
          .catch((error)=> {
            this.hideProgressSpinnerDialog();
            console.error("Error adding document dashboard producers : ", error);
          });
        })
      .catch((error)=> {
        this.hideProgressSpinnerDialog();
        console.error("Error adding document dashboard clients : ", error);
      });
  }

  addNote(note) {
    var idDate= this.dashboardDate.getDate()+'-'+(this.dashboardDate.getMonth()+1)+'-'+this.dashboardDate.getFullYear();
    this.db.collection('notes').doc(idDate).set({note: note, date: this.dashboardDate})
      .then((doc)=> {
        console.log("dashboard note add with ID: ", idDate);
      })
      .catch(function(error) {
        console.error("Error adding note : ", error);
      });
  }

  getNote(date) {
    if (this.noteSubscription!=undefined) {this.noteSubscription.unsubscribe()}
    this.noteSubscription = this.db.collection('notes', ref => ref.where('date', '==', date)).valueChanges().subscribe((querySnapshot:{date: Timestamp, note:string}[])=>{
      console.log('querying note : ', querySnapshot);
      if (querySnapshot[0]==undefined) {
        console.log("Aucune note à cette date : ", date);
        this.note='';
      }
      else {
        this.note = querySnapshot[0].note;
      }
    });
  }


  calculateSumProducers(callback) {
    console.log("calculateSumProducers");
    for (var i=0; i<this.dashboardProducers.colProduct.length; i++) {
      var quantity=0;
      if (this.dashboardProducers.colProduct[i].display) {
        for (var ii= 0; ii<this.dashboardProducers.row.length; ii++) {
          if (this.dashboardProducers.row[ii].display) {
            quantity+= this.dashboardProducers.row[ii].quantity[i];
          }
        }
        this.dashboardProducers.sum[i].quantity= quantity;
      }
    }
    console.log("calculateSumProducers finish");
    callback();
  }

  calculateSumClients(callback) {
    console.log("calculateSumClients");
    for (var i=0; i<this.dashboardClients.colProduct.length; i++) {
      var quantity=0;
      if (this.dashboardClients.colProduct[i].display) {
        for (var ii= 0; ii<this.dashboardClients.row.length; ii++) {
          if (this.dashboardClients.row[ii].display) {
            quantity+= this.dashboardClients.row[ii].quantity[i];
          }
        }
        this.dashboardClients.sum[i].quantity= quantity;
      }
    }
    console.log("calculateSumClients finish");
    callback();
  }

  openDialogWantCreateDashboard(message, date): void {
    const dialogRef = this.dialog.open(DialogDashboardOverview, {
      width: '450px',
      data: {
        message: message,
        contentType:"createDashboard",
        date : date
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result=='vierge') {
        this.createNewDashboard(date);
        this.getNote(date);
        }
      else if (result=='existant') {
        this.getLastAndAddDashboard(date);
        this.getNote(date);
      }
      else {
        this.dashboardDate = this.lastDashboardDate;
        }
      });
  }

  openDialogWantClearDashboard(message): void {
    const dialogRef = this.dialog.open(DialogDashboardOverview, {
      width: '450px',
      data: {
        message: message,
        contentType:"clearDashboard",
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result=='clear') {
        this.createNewDashboard(this.dashboardDate);
      }
    });
  }

  openDialogWantEditPrice(message, indexRowClient, indexColumnProduct, price): void {
    const dialogRef = this.dialog.open(DialogDashboardOverview, {
      width: '450px',
      data: {
        message: message,
        contentType:"editPrice",
        price: price
      }
    });

    dialogRef.afterClosed().subscribe(price => {
      console.log('The dialog was closed, nouveau prix : ', price);
      if (price!=undefined) { // car si la modale est fermée par clic en dehors de sa zone, data n'est pas transmis
        this.dashboardClients.row[indexRowClient].price[indexColumnProduct] = price;
        this.updateDashboard("clients");
      }
    });
  }

  showProgressSpinnerDialog() {
    if (this.progressSpinnerDialogRef!=undefined) {this.progressSpinnerDialogRef.close()} // previent de conflits de plusieur dialog ouvertes simultanément et non fermées
    this.progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
  }

  hideProgressSpinnerDialog() {
    this.progressSpinnerDialogRef.close();
  }

}

@Component({
  selector: 'dialog-dashboard-overview',
  templateUrl: 'dialog-dashboard-overview.html',
})

export class DialogDashboardOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogDashboardOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDashboardData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'bottom-sheet-overview-note',
  templateUrl: 'bottom-sheet-overview-note.html',
})
export class BottomSheetOverviewNote {
  constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewNote>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {}

  closeBottomSheet(event: MouseEvent, data:any): void {
    console.log(data);
    this.bottomSheetRef.dismiss(data);
    event.preventDefault();
  }
}
