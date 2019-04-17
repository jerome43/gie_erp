import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from '../../assets/fonts/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {PdfType} from './pdf-type';
import { staticsPhotos } from "../../assets/img/statics-photos";

@Injectable({
  providedIn: 'root'
})

export class PdfService {

  private pdfType:PdfType; // le type de pdf à générer

  constructor() {}

  wantGeneratePdf(client, products, numeroDelivery, dashboardDate, tva, pdfType: PdfType) {
    console.log("wantGeneratePdf : ", client, ' / ', products, ' / ', numeroDelivery);
    this.pdfType = pdfType;
    (this.pdfType === PdfType.deliveryReceipt) ? this.generateDeliveryReceiptPdf(client, products, numeroDelivery, dashboardDate, tva) : this.generateInvoicePdf();
  }


  generateDeliveryReceiptPdf(client, products, numeroDelivery, dashboardDate, tva) { // génération du bon de livraison

    console.log("generateDeliveryReceiptPdf");

    var totalPrice = this.getTotalProductsPrice(products);

    var metaDatas = {
      title:'Bon de livraison n° ',
      fileName:'bon-livraison'
    };

    var country;
    (client.country!="France" && client.country!="france")? country = client.country : country = "";
    var clientStack = [ // les infos clients en en-tête (nom, adresse, contac../
      'Entreprise ' + client.name,
      client.address,
      client.zipcode+ ' '+ client.town,
      country
     // client.contacts[0].contactName,
     // client.contacts[0].contactEmail,
     // client.contacts[0].contactCellPhone,
     // client.contacts[0].contactPhone,
    ];

    // tableau des produits
    var tableProducts : Array<any> = [[{text:'Produit', style: 'tableHeader', alignment:'left'}, {text:'Nbre d\'unités', style: 'tableHeader'},
      {text:'Poids unitaire', style: 'tableHeader'}, {text:'Poids Total', style: 'tableHeader'}, {text:'Prix au kg', style: 'tableHeader'},
      {text:'Prix total HT', style: 'tableHeader', alignment:'right'}]];

    for (var i = 0; i < products.length; i++) {
      let productRow=[];
      if (products[i].quantity!=null && products[i].price!=null && products[i].price>0 && products[i].display) {
        productRow.push(products[i].product.name, {text: products[i].quantity, alignment:'center'},
          {text: this.formatToTwoDecimal(products[i].product.weight)+'kg', alignment:'center'},
          {text: this.formatToTwoDecimal(products[i].quantity*products[i].product.weight)+'kg', alignment:'center'},
          {text: this.formatToTwoDecimal(products[i].price)+'€', alignment:'center'},
          {text: this.formatToTwoDecimal(products[i].quantity*products[i].product.weight*products[i].price)+'€', alignment:'right'});
        tableProducts.push(productRow);
      }
      else if (products[i].quantity!=null && (products[i].price==null || products[i].price==0) && products[i].display) {
        productRow.push(products[i].product.name, {text: products[i].quantity, alignment:'center'},
          {text: this.formatToTwoDecimal(products[i].product.weight)+'kg', alignment:'center'},
          {text: this.formatToTwoDecimal(products[i].quantity*products[i].product.weight)+'kg', alignment:'center'},
          {text: ''},
          {text: ''});
        tableProducts.push(productRow);
      }
    }

    var totalPricesTableBody = [];
    if (totalPrice!=undefined  && totalPrice!=null && totalPrice>0) {
      totalPricesTableBody = [
        [{text:'TOTAL PRODUITS HT', bold:'true'}, {text:this.formatToTwoDecimal(totalPrice) + '€', bold:'true', alignment:'right'} ],
        [{text:'TVA à '+tva+'%', bold:'true'}, {text:this.formatToTwoDecimal(totalPrice*tva/100) + '€', bold:'true', alignment:'right'}],
        [{text:'TOTAL TTC', bold:'true'}, {text:this.formatToTwoDecimal(totalPrice + totalPrice*tva/100) + '€', bold:'true', alignment:'right'}]
      ];
    }
    else {
      totalPricesTableBody = [
        ['',''],
        ['',''],
        ['','']
      ];
    }

/*
    var conditionsStack = [
      {	table: {
        widths: ['*', 80, 120],
        heights: [14, 70],
        body: [
          ['Observations ou réserve', 'date', 'Nom du signataire et Signature'],
          ['', '', '']
        ]
      }, margin: [0,14]},
      'CLAUSE DE RESERVE DE PROPRIETE : En application de la Loi 80-335 du 12 mai 1980, les marchandises restent la propriété du vendeur jusqu\'au paiement intégral de leur prix. Les risques afférents aux dites marchandises sont transférés à l\'achetur dès la livraison.',
    ];
    */

    var docDefinition = {
      // a string or { width: number, height: number }
      pageSize: 'A4',

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'portrait',

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      // margins are set in point that is 1/2.54*72 cm, soit env 28.35 équivaut à 1cm
      pageMargins: [ 42, 150, 42, 300],

      info: {
        title: metaDatas.title+'-'+client.name.split('.').join("")+'-'+numeroDelivery,
        author: 'GIE Fruits rouges du Velay',
      },

      header:     [
        {
          columns: [
            {
              stack: [
                {text:'GIE des Producteurs de Fruits Rouges des Monts du Velay',
                  bold:true},
                'Pouzols, 43200 SAINT-JEURES',
                'Tel: 04 71 59 61 91 - Port: 06 03 32 51 88 - Fax: 04 71 65 90 80',
                'Mail: contact@giefruitsrouges.fr',
              ],
              alignment: 'left',
              margin: [0, 14, 0, 0],
              width: '*'
            },
            {
              image: staticsPhotos.logo,
              width: 150,
              alignment: 'center',
              margin: [0, 0, 42, 0]
            },
          ],
          margin: [42, 28, 0, 42]
        }
      ],

      footer: [
          {
          stack: [
            {	table: {
              widths: ['*', 80, 120],
              heights: [14, 70],
              body: [
                ['Observations ou réserve', 'date', 'Nom du signataire et Signature'],
                ['', '', '']
              ]
            }, margin: [0,14]},
            {stack: ['CLAUSE DE RESERVE DE PROPRIETE : En application de la Loi 80-335 du 12 mai 1980, les marchandises restent la propriété du vendeur jusqu\'au paiement intégral de leur prix.',
              'Les risques afférents aux dites marchandises sont transférés à l\'acheteur dès la livraison.'],
              margin: [0,7,0,42],
              fontSize : 8,
              alignment:'left',
              italics :true},
            'GIE des Producteurs de Fruits Rouges des Monts du Velay',
            'Pouzols, 43200 SAINT-JEURES',
            'Tel: 04 71 59 61 91 - Port: 06 03 32 51 88 - Fax: 04 71 65 90 80 - Mail: contact@giefruitsrouges.fr',
            'SIRET: 412 119 588 000 25 - TVAI: FR74 412 119 588'
          ],
          fontSize: 10,
          alignment: 'center',
          margin: [42, 0, 42, 0]
        },
        {
          text: "fruitsrougesduvelay.com",
          link: "https://fruitsrougesduvelay.com/",
          color: "#abd500",
          fontSize: 12,
          bold: true,
          alignment: "center",
          margin: [0,0,0,8]
        },
      ],

      content: [
        {
          text: "Bon de livraison n°"+ numeroDelivery,
          fontSize: 12,
          bold:true,
          //color: "#abd500",
          margin: [0,0,0,7]
        },
        {
          text: 'Saint-Jeures, le '+ this.tolocaleDateString(dashboardDate),
         // margin : [0,0,0,28]
        },
        {
          stack : clientStack,
          bold: true,
          margin: [300,0,0,28]
        },

        {table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: ['25%','15%', '15%', '15%', '15%', '15%'],
          body: tableProducts
          },
          //  layout: 'noBorders',
          margin: [0,0,0,14],
          alignment: 'left',
        },
        {table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 0,
          widths: ['60%','40%'],
          body: totalPricesTableBody
          },
          layout: 'noBorders',
          margin: [300,0,0,28],
          alignment: 'left',
        },
        /*
        {
          stack : conditionsStack,
          fontSize: 10,
          margin: [0,0,0,0]
        }
        */
      ],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        alignment: 'left'
      },
      styles: {
        tableHeader: {
          fontSize: 10,
          bold: true,
          alignment:'center'
        },
        anotherStyleExample: {
          italic: true,
          alignment: 'right'
        }
      }
    };

    console.log("docDefinition", docDefinition);
    pdfMake.createPdf(docDefinition).download(metaDatas.fileName+'-'+client.name.split('.').join("")+'-'+numeroDelivery);
  }

  generateInvoicePdf() { // génération du devis ou de la facture
    console.log("generateInvoicePdf : ");
  }

  tolocaleDateString(date):string {
    if (date instanceof Date && date!=null && date!=undefined) {
      return date.toLocaleDateString('fr-FR');
    }
    else return "";
  }

  formatToTwoDecimal(x) {
    return Number.parseFloat(x).toFixed(2);
  }

  getTotalProductsPrice(products) {
    var price:number = 0;
    for (var i = 0; i < products.length; i++) {
      if (products[i].quantity != null && products[i].product.weight != null && products[i].price != null && products[i].price>0 && products[i].display) {
        price += products[i].quantity * products[i].product.weight * products[i].price;
      }
      else if (products[i].quantity != null && products[i].product.weight != null && (products[i].price == null || products[i].price ==0) && products[i].display) {return 0}
      console.log("price : ", price);
    }
    return price
  }
}
