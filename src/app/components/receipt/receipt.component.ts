import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptData } from '../../services/receipt.service';

@Component({
  selector: 'app-receipt-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})
export class ReceiptViewComponent {
  @Input() data!: ReceiptData;

  readonly company = {
    name: 'ZETEC S.A. DE C.V.',
    rfc: 'ZET123456ABC',
    address: 'Av. Vallarta #5000, Guadalajara, Jal. CP 44100',
    phone: '33 1234 5678',
    email: 'contacto@zetec.com.mx',
    regimen: '601 - General de Ley Personas Morales'
  };

  get subtotal(): number { return Number(this.data?.amount) || 0; }
  get iva(): number { return this.subtotal * 0.16; }
  get total(): number { return this.subtotal + this.iva; }

  downloadXML() {

    const xmlItems = (this.data.items || []).map(item => {
        const cant = item.quantity || 1;
        const precio = item.unit_amount?.value || 0;
        const importe = cant * precio;
        return `
        <cfdi:Concepto 
            Cantidad="${cant.toFixed(2)}" 
            Unidad="PIEZA" 
            ClaveUnidad="H87" 
            Descripcion="${item.name}" 
            ValorUnitario="${precio.toFixed(2)}" 
            Importe="${importe.toFixed(2)}">
        <cfdi:Impuestos>
            <cfdi:Traslados>
            <cfdi:Traslado Base="${importe.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${(importe * 0.16).toFixed(2)}"/>
            </cfdi:Traslados>
        </cfdi:Impuestos>
        </cfdi:Concepto>`;
    }).join('');

    // Calcular montos globales
    const subtotalValue = this.subtotal;
    const ivaValue = this.iva;
    const totalValue = this.total;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <cfdi:Comprobante 
        xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
        Version="4.0"
        Folio="${this.data.orderId}" 
        Fecha="${new Date().toISOString()}"
        SubTotal="${subtotalValue.toFixed(2)}"
        Moneda="${this.data.moneda || 'MXN'}"
        Total="${totalValue.toFixed(2)}"
        TipoDeComprobante="${this.data.receiptType?.split(' ')[0] || 'I'}"
        LugarExpedicion="${this.data.lugarExpedicion || '44100'}">

    <cfdi:Emisor 
        Rfc="${this.company.rfc}" 
        Nombre="${this.company.name}" 
        RegimenFiscal="${this.company.regimen?.split(' ')[0] || '601'}"/>

    <cfdi:Receptor 
        Rfc="${this.data.payerRFC || 'XAXX010101000'}" 
        Nombre="${this.data.payerName}" 
        UsoCFDI="${this.data.usoCFDI?.split(' ')[0] || 'G03'}"/>

    <cfdi:Conceptos>
        ${xmlItems}
    </cfdi:Conceptos>

    <cfdi:Impuestos TotalImpuestosTrasladados="${ivaValue.toFixed(2)}">
        <cfdi:Traslados>
        <cfdi:Traslado 
            Base="${subtotalValue.toFixed(2)}" 
            Impuesto="002" 
            TipoFactor="Tasa" 
            TasaOCuota="0.160000" 
            Importe="${ivaValue.toFixed(2)}"/>
        </cfdi:Traslados>
    </cfdi:Impuestos>

    <cfdi:Complemento>
        <tfd:TimbreFiscalDigital 
            xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
            UUID="${this.data.folioFiscal}"/>
    </cfdi:Complemento>
    </cfdi:Comprobante>`;

    // Proceso de descarga
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${this.data.orderId}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  print() { window.print(); }
}