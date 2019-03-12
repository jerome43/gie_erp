import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { Product } from '../product';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';

export interface DialogCreateProductData {
  message: string;
}

@Component({
  selector: 'app-create-product',
  templateUrl: './createProduct.component.html',
  styleUrls: ['./createProduct.component.less']
})

export class CreateProductComponent implements OnInit {

  private isSellable:boolean;// utilisé pour indiquer si le produit est en vente ou prestation de service (true) ou en location (false)
  private apply_degressivity:boolean;// utilisé pour indiquer si c'est un produit en location de type degressif (true) ou de type prestation de service (false)
  private createProductForm;
  private productsCollection: AngularFirestoreCollection<Product>;
  //private uploadPercent: Observable<number>;
  //private downloadURL: Observable<string>;
  private photoFile:File;
  @ViewChild('inputPhoto') inputPhoto: ElementRef;


  constructor(db: AngularFirestore, private fb: FormBuilder, private dialog: MatDialog, private storage: AngularFireStorage) {
    this.productsCollection = db.collection('products');
  }

  ngOnInit() {
    this.initForm();
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
    const fileRef = this.storage.ref('products/'+this.photoFile.name);
    // test si le fichier existe déjà
    fileRef.getDownloadURL().toPromise().then(
      onResolve=> { // le fichier existe
        this.openDialogMessage("Le fichier existe déjà, veuillez en utiliser un autre !");
      },
      onReject => {// le fichier n'existe pas, on peut l'uploader
        console.log("file doesn't exists");
        this.storage.upload('products/'+this.photoFile.name, this.photoFile);
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
    this.productsCollection.add(this.createProductForm.value).then(data => {
      console.log("Document written with ID: ", data.id);
      this.openDialogProductAdded('Le produit a bien été enregistré sous le numéro ' + data.id)});
  }

  get name() { return this.createProductForm.get('name'); }
  get internal_number() { return this.createProductForm.get('internal_number'); }
  //get stock() { return this.createProductForm.get('stock'); }


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
    this.isSellable=false;
    this.apply_degressivity=true;
    this.photoFile=undefined;
    this.inputPhoto.nativeElement.value='';
     this.createProductForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      //serial_number: [''],
      internal_number: ['', Validators.required],
      //barcode: [''],
      //stock: ['1', Validators.required],
      //type: ['rental', Validators.required],
      sell_price : [0, Validators.required],
      //rent_price : [0, Validators.required],
      //apply_degressivity: ['true', Validators.required],
      photo: [''],
      comment: [''],
      date: [new Date()]
    });
    this.createProductForm.valueChanges.subscribe(data => {
      console.log('Form changes', data);
      /*
      if (data.type=='sale' || data.type=='service') {
        this.isSellable=true;
        if (data.apply_degressivity==="true") {this.createProductForm.controls['apply_degressivity'].patchValue('false');}
      }
      else {this.isSellable=false}

      if (data.apply_degressivity=='true') {
        this.apply_degressivity=true;
      }
      else {this.apply_degressivity=false}
      */
    });
  }

  importProducts() {
    var products = [
      {"id":"1","nom":"1 FRAISES 500g couv","reference":"1","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"2","nom":"2 FRAISE 500g nu","reference":"2","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"3","nom":"3 CIJOSEE 500g Carton","reference":"3","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"4","nom":"4 -","reference":"4","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"5","nom":"5 FRAISE 500g conf","reference":"5","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"6","nom":"6 FRAISES vrac industrie","reference":"6","description":null,"date_add":"2018-05-21 00:00:00"},
      {"id":"7","nom":"7 CIJOSEE bq carton 10x250g","reference":"7","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"8","nom":"7S Cijos\u00e9e bq carton 10x300 g s\u00e9lection","reference":"7S","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"9","nom":"8 CIJOSEE bq carton 10x500g","reference":"8","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"10","nom":"9 CIJOSEE bq plastique 10x500g couv","reference":"9","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"11","nom":"191 CIJOSEE bq plastique 10x250g PLATE","reference":"191","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"12","nom":"10 MARA bq carton 10x250g","reference":"10","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"13","nom":"10 S MARA 10x250g s\u00e9lection","reference":"10 S","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"14","nom":"11 MARA bq plastique 10x250g","reference":"11","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"15","nom":"12 MARA bq plastique 16x250g","reference":"12","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"16","nom":"13 MARA bq carton 10x500g","reference":"13","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"17","nom":"14 MARA bq carton 16x250g","reference":"14","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"18","nom":"192 MARA bq plastique 10x250g plate","reference":"192","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"19","nom":"16 FRAISES des BOIS 10x100g","reference":"16","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"20","nom":"17 FRAISES DES BOIS vrac congel","reference":"17","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"21","nom":"20 FBO bq plast 8x125 g","reference":"20","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"22","nom":"27 FBO bq plast 10x250 g","reference":"27","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"23","nom":"26 FBO bq plast 10x250 g plate","reference":"26","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"24","nom":"22 FBO bq plast 16x125g","reference":"22","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"25","nom":"35 FBO bq plast 16x250 g","reference":"35","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"26","nom":"23 FBO bq plast 32x125g","reference":"23","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"27","nom":"28 FBO bq carton 10x250g","reference":"28","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"28","nom":"25 FBO bq carton 16x125g","reference":"25","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"29","nom":"34 FBO bq carton 16x250g","reference":"34","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"30","nom":"29 FBO cong\u00e9lation 2.5kg","reference":"29","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"31","nom":"291 FBO cong\u00e9lation 2.5kg petit calibre","reference":"291","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"32","nom":"292 FBO cong\u00e9lation 5kg","reference":"292","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"33","nom":"30 FBO confiture 10x500g","reference":"30","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"34","nom":"31 FBO vrac","reference":"31","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"35","nom":"90 MURES bq plast 8x125g","reference":"90","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"36","nom":"91 MURES bq plast 10x250g","reference":"91","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"37","nom":"95 MURES bq plast 32x125g","reference":"95","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"38","nom":"92 MURES bq carton 10x250g","reference":"92","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"39","nom":"98 MURES bq carton 16x125g","reference":"98","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"40","nom":"97 MURES confiture 10x500g","reference":"97","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"41","nom":"93 MURES vrac","reference":"93","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"42","nom":"46 GR bq carton 10x250g","reference":"46","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"43","nom":"401 GR bq carton 16x125g","reference":"401","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"44","nom":"40 GR bq plast 8x125g","reference":"40","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"45","nom":"43 GR bq plast 10x250g","reference":"43","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"46","nom":"44 GR bq plast 10x500g","reference":"44","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"47","nom":"45 GR bq plas 16x250g","reference":"45","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"48","nom":"41 GR bq plast 32x125g","reference":"41","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"49","nom":"49 GR confiture","reference":"49","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"50","nom":"48 GR vrac","reference":"48","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"51","nom":"53 GB bq carton 10x250g","reference":"53","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"52","nom":"57 GB bq carton 16x125g","reference":"57","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"53","nom":"50 GB bq plast 8x125g","reference":"50","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"54","nom":"52 GB bq plast 10x250g","reference":"52","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"55","nom":"54 GB bq plast 10x500g","reference":"54","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"56","nom":"56 GB bq plast 16x250g","reference":"56","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"57","nom":"51 GB bq plast 32x125g","reference":"51","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"58","nom":"61 GR MAQ bq carton 10x250g","reference":"61","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"59","nom":"62 GR MAQ bq carton 16x125g","reference":"62","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"60","nom":"60 GR MAQ bq plast 8x125g","reference":"60","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"61","nom":"63 GR MAQ bq plast 32x125g","reference":"63","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"62","nom":"71 CASSIS bq carton 10x250g","reference":"71","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"63","nom":"78 CASSIS bq carton 12x125g","reference":"78","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"64","nom":"79 CASSIS bq carton 16x125g","reference":"79","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"65","nom":"70 CASSIS bq plast 8x125g","reference":"70","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"66","nom":"74 CASSIS bq plast 10x250g","reference":"74","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"67","nom":"72 CASSIS bq plast 10x500g","reference":"72","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"68","nom":"73 CASSIS bq plast 32x125g","reference":"73","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"69","nom":"77 CASSIS vrac","reference":"77","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"70","nom":"82 MYRTILLE bq carton 10x250g","reference":"82","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"71","nom":"83 MYRTILLE bq carton 16x125g","reference":"83","description":null,"date_add":"2018-05-28 00:00:00"},
      {"id":"72","nom":"80 MYRTILLE bq plast 8x125g","reference":"80","description":null,"date_add":"2018-05-28 00:00:00"}
    ];

    var date = new Date();
    products.forEach(function (productImport) {
      var product: Product = {name : productImport.nom, description : '', internal_number: productImport.reference, sell_price : 0,  photo:'', comment: '', date : date};
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



