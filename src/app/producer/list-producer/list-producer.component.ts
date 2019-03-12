import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {MatSort, MatPaginator, MatTableDataSource, MatSortable} from '@angular/material';
import { Producer } from '../producer';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Subscription} from "rxjs/index";

export interface DialogListProducerData { message: string; displayNoButton:boolean }
export interface ProducerId extends Producer { id: string; }

@Component({
  selector: 'app-list-producer',
  templateUrl: './list-producer.component.html',
  styleUrls: ['./list-producer.component.less']
})

export class ListProducerComponent implements OnInit, OnDestroy {
  private fbProducers: Observable<ProducerId[]>; // producers on Firebase
  private fbProducersSubscription : Subscription;
  private displayedColumns: string[] = ['name', 'date', 'edit', 'delete', 'id']; // colones affichées par le tableau
  private producersData : Array<any>; // tableau qui va récupérer les données adéquates de fbProducers pour être ensuite affectées au tableau de sources de données
  private dataSource : MatTableDataSource<ProducerId>; // source de données du tableau

  @ViewChild(MatPaginator) paginator: MatPaginator; // pagination du tableau
  @ViewChild(MatSort) sort: MatSort; // tri sur le tableau

  constructor(private router: Router, private db: AngularFirestore, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.initListProducers();
  }

  ngOnDestroy() {
    this.fbProducersSubscription.unsubscribe();
  }

  initListProducers() {
    this.fbProducers = this.db.collection('producers').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Producer;
        const id = a.payload.doc.id;
        return {id, ...data };
      })));
    if (this.fbProducersSubscription instanceof  Subscription) {this.fbProducersSubscription.unsubscribe()}
    this.fbProducersSubscription = this.fbProducers.subscribe((producers)=>{
       console.log('Current producers: ', producers);
        this.producersData = [];
        producers.forEach((producer)=> {
          const id = producer.id;
          const name = producer.name;
          const date = producer.date;
          this.producersData.push({id, name, date});
        });
        console.log("this.producersData : ", this.producersData);
        this.dataSource = new MatTableDataSource<ProducerId>(this.producersData);
        this.dataSource.paginator = this.paginator; // pagination du tableau
        //this.sort.sort(<MatSortable>({id: 'name', start: 'desc'})); // pour trier sur les noms par ordre alphabétique
        this.dataSource.sort = this.sort; // tri sur le tableau
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase(); // filtre sur le tableau
  }

  editProducer(eventTargetId) {
    console.log(eventTargetId);
    this.router.navigate(['detail-producer/'+eventTargetId]);
  }

  wantDeleteProducer(eventTargetId) {
    console.log("wantDeleteProducer"+eventTargetId);
    this.openDialogWantDelete(eventTargetId, "Voulez-vous vraiment supprimer le producteur "+eventTargetId+" ?")
  }

  openDialogWantDelete(id, message): void {
    const dialogRef = this.dialog.open(DialogListProducerOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:true}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed'+result);
      if (result=='yes') {
        this.deleteProducer(id);
      }
    });
  }


  deleteProducer(eventTargetId) {
    console.log("deleteProducer"+eventTargetId);
    this.producersData = [];
    this.db.doc("producers/"+eventTargetId).delete().then(data => {
      this.openDialogDelete("Le producteur "+eventTargetId+" a été supprimé.")
    });
  }

  openDialogDelete(message): void {
    const dialogRef = this.dialog.open(DialogListProducerOverview, {
      width: '450px',
      data: {
        message: message,
        displayNoButton:false}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'dialog-list-producer-overview',
  templateUrl: 'dialog-list-producer-overview.html',
})
export class DialogListProducerOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogListProducerOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogListProducerData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}


