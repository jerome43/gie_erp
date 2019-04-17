import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.less']
})
export class ParametersComponent implements OnInit {

  private tva:number = 5.5; // taux par défaut
  constructor(private db: AngularFirestore) { }

  ngOnInit() {
    this.observeTva();
  }

  observeTva() {
    console.log("observeTva : ");
    this.db.doc<any>('parameters/tva').valueChanges().subscribe(
      tva => {
        this.tva = tva.taux;
        console.log("observeTvaSubscribe : ", this.tva);
      });
  }

  change_tva() {
    if (this.tva!=null && this.tva!=undefined && typeof this.tva=="number") {
      this.db.collection('parameters').doc('tva').update({taux: this.tva}).then(()=> {
          console.log("tva updated ")})
        .catch(function(error) {
          console.error("Error updating tva: ", error);
        });
    }
  }
}
