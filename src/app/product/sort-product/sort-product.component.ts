import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import {Subscription} from "rxjs/index";
import {map} from 'rxjs/operators';
import {Product} from "../product";
import {MatDialog} from '@angular/material';
import {ProgressSpinnerDialogComponent} from '../../progress-spinner-dialog/progress-spinner-dialog.component';

@Component({
  selector: 'app-sort-product',
  templateUrl: './sort-product.component.html',
  styleUrls: ['./sort-product.component.less']
})
export class SortProductComponent implements OnInit {

  private productsSubscription : Subscription;
  productsSort: {id: string, sortIndex:number; name:string}[] =[];
  private productSortLastIndex:number;

  constructor( private db: AngularFirestore, private dialog: MatDialog) { }

  ngOnInit() {
    this.observeProducts();
    this.observeProductSortLastIndex();
  }

  ngOnDestroy() {
    if (this.productsSubscription!=undefined) {this.productsSubscription.unsubscribe();}
  }


  observeProductSortLastIndex() {
    console.log("observeProductSortLastIndex: ");
    this.db.doc<any>('parameters/productSort').valueChanges().subscribe(
      productSort => {
        this.productSortLastIndex = productSort.lastIndex;
        console.log("observeProductSortLastIndexSubscribe : ", this.productSortLastIndex);
      });
  }

  observeProducts() {
    this.productsSubscription = this.db.collection('products', ref => ref.orderBy('sortIndex', 'asc')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        const id = a.payload.doc.id;
        return {id, ...data };
      }))).subscribe((products)=> {
      console.log("observeProducts.snapshotChanges");
      this.productsSort = [];
      products.forEach((product)=> {
        this.productsSort.push({id: product.id, sortIndex:product.sortIndex, name: product.name});
      });
    });
  }

  changeSortIndex(oldIndex, newIndex) {
    console.log("changeSortIndex : ", oldIndex, ' / ', newIndex, this.productsSort);
    if (newIndex>0 && newIndex<=this.productSortLastIndex) {
      this.calculateNewSortIndex(oldIndex, newIndex);
    }
  }

  calculateNewSortIndex(oldIndex, newIndex) {
    console.log("calculateNewSortIndex");
    if (newIndex > oldIndex+1) {
      console.log("case 1");
      for (var i=0; i<this.productsSort.length; i++) {
        if (i > oldIndex && i + 1 < newIndex) {
          //console.log("case 1.1");
          this.productsSort[i].sortIndex = i;
        }
      }
      this.productsSort[oldIndex].sortIndex=newIndex-1;
    }

    else if (newIndex<oldIndex+1) {
      console.log("case 2");
      for (var i=0; i<this.productsSort.length; i++) {
        if (i < oldIndex && i +2 > newIndex ) {
          //console.log("case 2.2");
          this.productsSort[i].sortIndex = i+2;
        }
      }
    }
    console.log("calculateNewSortIndex: ", this.productsSort);
    this.updateProductSort();

  }

  updateProductSort() {
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, { panelClass: 'transparent', disableClose: true });
    // Get a new write batch
    var batch = this.db.firestore.batch();

    for (var i=0; i<this.productsSort.length; i++) {
      // Update the product
      var productRef = this.db.collection('products').doc(this.productsSort[i].id).ref;
      batch.update(productRef, {sortIndex: this.productsSort[i].sortIndex});
    }
    // Commit the batch
    batch.commit()
      .then(()=> {
        progressSpinnerDialogRef.close();
        console.log("product sortIndex updated")})
      .catch(function(error) {
        progressSpinnerDialogRef.close();
        console.error("Error updating product sortIndex: ", error);
      });
  }

}
