import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { Product } from '../product';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';
import {ProgressSpinnerDialogComponent} from '../../progress-spinner-dialog/progress-spinner-dialog.component';

export interface DialogCreateProductData {
  message: string;
}

@Component({
  selector: 'app-create-product',
  templateUrl: './createProduct.component.html',
  styleUrls: ['./createProduct.component.less']
})

export class CreateProductComponent implements OnInit {

  createProductForm;
  private productsCollection: AngularFirestoreCollection<Product>;
  photoFile:File;
  @ViewChild('inputPhoto') inputPhoto: ElementRef;
  private productSortLastIndex:number;

  constructor(private db: AngularFirestore, private fb: FormBuilder, private dialog: MatDialog, private storage: AngularFireStorage) {
    this.productsCollection = db.collection('products');
  }

  ngOnInit() {
    this.initForm();
    this.observeProductSortLastIndex();
  }


  observeProductSortLastIndex() {
    console.log("observeProductSortLastIndex: ");
    this.db.doc<any>('parameters/productSort').valueChanges().subscribe(
      productSort => {
        this.productSortLastIndex = productSort.lastIndex;
        console.log("observeProductSortLastIndexSubscribe : ", this.productSortLastIndex);
    });
  }

  updateProductSortLastIndex() {
    if (this.productSortLastIndex!=null && this.productSortLastIndex!=undefined && typeof this.productSortLastIndex=="number") {
      this.db.collection('parameters').doc('productSort').update({lastIndex: this.productSortLastIndex+1}).then(()=> {
          console.log("productSortLastIndex updated ")})
        .catch(function(error) {
          console.error("Error updating productSortLastIndex: ", error);
        });
    }
  }


  /**
   * FILE GESTION
   */

  updateFile(event) {
    this.photoFile = event.target.files[0];
   // console.log("updateFile :"+this.photoFile.name);
  }

  uploadFile() {
    console.log("uploadFile :"+this.photoFile.name + ' / '+this.photoFile);
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, { panelClass: 'transparent', disableClose: true });
    const fileRef = this.storage.ref('products/'+this.photoFile.name);
    // test si le fichier existe déjà
    fileRef.getDownloadURL().toPromise().then(
      onResolve=> { // le fichier existe
        progressSpinnerDialogRef.close();
        this.openDialogMessage("Le fichier existe déjà, veuillez en utiliser un autre !");
      },
      onReject => {// le fichier n'existe pas, on peut l'uploader
        console.log("file doesn't exists");
        this.storage.upload('products/'+this.photoFile.name, this.photoFile).then(()=>{
          progressSpinnerDialogRef.close();
        });
         //this.storage.ref("products/"+this.photoFile.name).putString(encode64, 'base64', {contentType:'image/jpg'});
        this.addProduct();
      }
    );
  }

  deletePhoto(inputPhoto) {
    inputPhoto.value='';
    this.photoFile=undefined;
  }


  /**
   * END FILE GESTION
   */


  wantAddProduct() {
     if (this.photoFile!=undefined) {
      this.uploadFile();
    }
    else {
      this.addProduct();
    }
  }

  addProduct() {
    if (this.photoFile!=undefined) {this.createProductForm.value.photo='products/'+this.photoFile.name;}
    const progressSpinnerDialogRef = this.dialog.open(ProgressSpinnerDialogComponent, {panelClass: 'transparent',disableClose: true});
    this.productsCollection.add(this.createProductForm.value).then(data => {
      console.log("Document written with ID: ", data.id);
      progressSpinnerDialogRef.close();
      this.openDialogProductAdded('Le produit a bien été enregistré sous le numéro ' + data.id)});
      this.updateProductSortLastIndex();
  }

  get name() { return this.createProductForm.get('name'); }
  get internal_number() { return this.createProductForm.get('internal_number'); }


  openDialogProductAdded(message): void {
    const dialogRef = this.dialog.open(DialogCreateProductOverview, {
      width: '450px',
      data: {message: message}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.initForm();
    });
  }

  openDialogMessage(message): void {
    const dialogRef = this.dialog.open(DialogCreateProductOverview, {
      width: '450px',
      data: {message: message}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  initForm() {
    this.photoFile=undefined;
    this.inputPhoto.nativeElement.value='';
     this.createProductForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      internal_number: ['', Validators.required],
      weight : [0, Validators.required],
      photo: [''],
      comment: [''],
      date: [new Date()],
      active: ['false'],
      sortIndex:[null]
    });
    this.createProductForm.valueChanges.subscribe(data => {
      console.log('Form changes', data);
      this.createProductForm.value.sortIndex=this.productSortLastIndex+1;
    });
  }

  importProducts() {
    var products = [
      {"id":"1","nom":"FRAISES 500g couv", "weight":"0.5", "reference":"1","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"2","nom":"FRAISE 500g nu", "weight":"0.5", "reference":"2","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"3","nom":"CIJOSEE 500g Carton", "weight":"0.5", "reference":"3","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"5","nom":"FRAISE 500g conf", "weight":"0.5", "reference":"5","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"6","nom":"FRAISES vrac industrie", "weight":"1", "reference":"6","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"7","nom":"CIJOSEE bq carton 10x250g", "weight":"2.5", "reference":"7","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"8","nom":"Cijos\u00e9e bq carton 10x300 g s\u00e9lection", "weight":"3", "reference":"7S","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"9","nom":"CIJOSEE bq carton 10x500g", "weight":"5", "reference":"8","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"10","nom":"CIJOSEE bq plastique 10x500g couv", "weight":"5", "reference":"9","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"11","nom":"CIJOSEE bq plastique 10x250g PLATE", "weight":"2.5", "reference":"191","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"12","nom":"MARA bq carton 10x250g", "weight":"2.5", "reference":"10","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"13","nom":"MARA 10x250g s\u00e9lection", "weight":"2.5", "reference":"10 S","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"14","nom":"MARA bq plastique 10x250g", "weight":"2.5", "reference":"11","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"15","nom":"MARA bq plastique 16x250g", "weight":"4", "reference":"12","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"16","nom":"MARA bq carton 10x500g", "weight":"5", "reference":"13","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"17","nom":"MARA bq carton 16x250g", "weight":"4", "reference":"14","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"18","nom":"MARA bq plastique 10x250g plate", "weight":"2.5", "reference":"192","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"19","nom":"FRAISES des BOIS 10x100g", "weight":"1", "reference":"16","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"20","nom":"FRAISES DES BOIS vrac congel", "weight":"1", "reference":"17","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"21","nom":"FBO bq plast 8x125 g", "weight":"1", "reference":"20","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"22","nom":"FBO bq plast 10x250 g", "weight":"2.5", "reference":"27","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"23","nom":"FBO bq plast 10x250 g plate",  "weight":"2.5", "reference":"26","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"24","nom":"FBO bq plast 16x125g", "weight":"2", "reference":"22","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"25","nom":"FBO bq plast 16x250 g", "weight":"4", "reference":"35","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"26","nom":"FBO bq plast 32x125g", "weight":"4", "reference":"23","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"27","nom":"FBO bq carton 10x250g", "weight":"2.5", "reference":"28","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"28","nom":"FBO bq carton 16x125g", "weight":"2", "reference":"25","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"29","nom":"FBO bq carton 16x250g", "weight":"4", "reference":"34","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"30","nom":"FBO cong\u00e9lation 2.5kg", "weight":"2.5", "reference":"29","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"31","nom":"FBO cong\u00e9lation 2.5kg petit calibre", "weight":"2.5", "reference":"291","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"32","nom":"FBO cong\u00e9lation 5kg", "weight":"5", "reference":"292","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"33","nom":"FBO confiture 10x500g", "weight":"5", "reference":"30","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"34","nom":"FBO vrac", "weight":"1", "reference":"31","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"35","nom":"MURES bq plast 8x125g", "weight":"1", "reference":"90","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"36","nom":"MURES bq plast 10x250g", "weight":"2.5", "reference":"91","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"37","nom":"MURES bq plast 32x125g", "weight":"4", "reference":"95","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"38","nom":"MURES bq carton 10x250g", "weight":"2.5", "reference":"92","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"39","nom":"MURES bq carton 16x125g", "weight":"2", "reference":"98","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"40","nom":"MURES confiture 10x500g", "weight":"5", "reference":"97","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"41","nom":"MURES vrac", "weight":"1", "reference":"93","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"42","nom":"GR bq carton 10x250g", "weight":"2.5", "reference":"46","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"43","nom":"GR bq carton 16x125g", "weight":"2", "reference":"401","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"44","nom":"GR bq plast 8x125g", "weight":"1", "reference":"40","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"45","nom":"GR bq plast 10x250g", "weight":"2.5", "reference":"43","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"46","nom":"GR bq plast 10x500g", "weight":"5", "reference":"44","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"47","nom":"GR bq plas 16x250g", "weight":"4", "reference":"45","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"48","nom":"GR bq plast 32x125g", "weight":"4", "reference":"41","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"49","nom":"GR confiture", "weight":"1", "reference":"49","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"50","nom":"GR vrac", "weight":"1", "reference":"48","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"51","nom":"GB bq carton 10x250g", "weight":"2.5", "reference":"53","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"52","nom":"GB bq carton 16x125g", "weight":"2", "reference":"57","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"53","nom":"GB bq plast 8x125g", "weight":"1", "reference":"50","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"54","nom":"GB bq plast 10x250g", "weight":"2.5", "reference":"52","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"55","nom":"GB bq plast 10x500g", "weight":"5", "reference":"54","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"56","nom":"GB bq plast 16x250g", "weight":"4", "reference":"56","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"57","nom":"GB bq plast 32x125g", "weight":"4", "reference":"51","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"58","nom":"GR MAQ bq carton 10x250g", "weight":"2.5", "reference":"61","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"59","nom":"GR MAQ bq carton 16x125g", "weight":"2", "reference":"62","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"60","nom":"GR MAQ bq plast 8x125g", "weight":"1", "reference":"60","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"61","nom":"GR MAQ bq plast 32x125g", "weight":"4", "reference":"63","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"62","nom":"CASSIS bq carton 10x250g", "weight":"2.5", "reference":"71","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"63","nom":"CASSIS bq carton 12x125g", "weight":"1.5", "reference":"78","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"64","nom":"CASSIS bq carton 16x125g", "weight":"2", "reference":"79","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"65","nom":"CASSIS bq plast 8x125g", "weight":"1", "reference":"70","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"66","nom":"CASSIS bq plast 10x250g", "weight":"2.5", "reference":"74","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"67","nom":"CASSIS bq plast 10x500g", "weight":"5", "reference":"72","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"68","nom":"CASSIS bq plast 32x125g", "weight":"4", "reference":"73","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"69","nom":"CASSIS vrac", "weight":"1", "reference":"77","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"70","nom":"MYRTILLE bq carton 10x250g", "weight":"2.5", "reference":"82","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"71","nom":"MYRTILLE bq carton 16x125g", "weight":"2", "reference":"83","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"72","nom":"MYRTILLE bq plast 8x125g", "weight":"1", "reference":"80","description":null,"date_add":"2018-05-28 00:00:00"}
    ];

    var date = new Date();
    var sortIndex = 1;
    products.forEach(function (productImport) {
      var product: Product = {name : productImport.nom, description : '', internal_number: productImport.reference, weight : Number(productImport.weight),  photo:'', comment: '', date : date, active:'false', sortIndex:sortIndex};
      sortIndex++;
      this.productsCollection.add(product).then(data => {
        console.log("Document written with ID: ", data.id)});
    }, this)
  };

}

@Component({
  selector: 'dialog-create-product-overview',
  templateUrl: 'dialog-create-product-overview.html',
})
export class DialogCreateProductOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogCreateProductOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogCreateProductData) {}
}



