import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';

interface OrdenItem {
  producto_id:     number;
  nombre:          string;
  cantidad:        number;
  precio_unitario: number;
  subtotal:        number;
}

interface Orden {
  id:              number;
  paypal_order_id: string;
  total:           number;
  moneda:          string;
  estado:          string;
  cancelado:       number;
  direccion:       string;
  fecha_creacion:  string;
  items:           OrdenItem[];
}

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historial_pedidos.component.html',
  styleUrls: ['./historial_pedidos.component.css']
})
export class HistorialPedidosComponent implements OnInit {

  carritoService = inject(CarritoService);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);
  router         = inject(Router);
  authService    = inject(AuthService);

  ordenes:  Orden[] = [];
  cargando = true;

  modalCancelarVisible    = false;
  ordenACancelar: Orden | null = null;

  // Datos fijos de la empresa (idénticos a tu ReceiptViewComponent)
  readonly company = {
    name: 'ZETEC S.A. DE C.V.',
    rfc: 'ZET123456ABC',
    address: 'Av. Vallarta #5000, Guadalajara, Jal. CP 44100',
    phone: '33 1234 5678',
    email: 'contacto@zetec.com.mx',
    regimen: '601 - General de Ley Personas Morales'
  };

  irAlPerfil() {
    this.authService.isLoggedIn()
      ? this.router.navigate(['/perfil_usuario'])
      : this.router.navigate(['/inicio_sesion']);
  }

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.http.get<{ orders: Orden[] }>(
      `http://localhost:3000/api/user/orders?t=${Date.now()}`
    ).subscribe({
      next: (res) => {
        this.ordenes = res.orders.map(o => ({
          ...o,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCancelar(orden: Orden) {
    this.ordenACancelar       = orden;
    this.modalCancelarVisible = true;
  }

  cerrarModalCancelar() {
    this.ordenACancelar       = null;
    this.modalCancelarVisible = false;
  }

  confirmarCancelar() {
    if (!this.ordenACancelar) return;

    this.http.delete(`http://localhost:3000/api/user/orders/${this.ordenACancelar.id}`)
      .subscribe({
        next: () => {
          this.cerrarModalCancelar();
          this.cargarOrdenes();
        },
        error: (err) => alert(err.error?.message || 'Error al cancelar la orden')
      });
  }

  // ===== NUEVO MÉTODO: DESCARGAR XML DESDE EL HISTORIAL =====
  descargarXMLPedido(orden: Orden) {
    // Primero, recuperamos el perfil para rellenar los datos fiscales del receptor
    this.http.get<{ user: any }>('http://localhost:3000/api/user/profile').subscribe({
      next: (res) => {
        this.procesarGeneracionXML(orden, res.user);
      },
      error: () => {
        // En caso de error o sesión intermitente, se genera con datos genéricos
        this.procesarGeneracionXML(orden, null);
      }
    });
  }

  private procesarGeneracionXML(orden: Orden, user: any | null) {
    // Cálculo de montos simulando la estructura del componente de recibo original
    const subtotal = Number(orden.total) || 0;
    const iva = subtotal * 0.16;
    const totalGlobal = subtotal + iva;

    // Estructuración de los conceptos CFDI basados en los items de la orden
    // Estructuración de los conceptos CFDI basados en los items de la orden
    const xmlItems = (orden.items || []).map(item => {
      // 🌟 Forzamos la conversión a números reales para evitar fallos si el backend envía strings
      const cant = Number(item.cantidad) || 1;
      const precio = Number(item.precio_unitario) || 0;
      const importe = cant * precio;
      
      return `
        <cfdi:Concepto 
            Cantidad="${cant.toFixed(2)}" 
            Unidad="PIEZA" 
            ClaveUnidad="H87" 
            Descripcion="${item.nombre}" 
            ValorUnitario="${precio.toFixed(2)}" 
            Importe="${importe.toFixed(2)}">
        <cfdi:Impuestos>
            <cfdi:Traslados>
            <cfdi:Traslado Base="${importe.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${(importe * 0.16).toFixed(2)}"/>
            </cfdi:Traslados>
        </cfdi:Impuestos>
        </cfdi:Concepto>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <cfdi:Comprobante 
        xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
        Version="4.0"
        Folio="${orden.paypal_order_id || orden.id}" 
        Fecha="${new Date(orden.fecha_creacion).toISOString()}"
        SubTotal="${subtotal.toFixed(2)}"
        Moneda="${orden.moneda || 'MXN'}"
        Total="${totalGlobal.toFixed(2)}"
        TipoDeComprobante="I"
        LugarExpedicion="44100">

    <cfdi:Emisor 
        Rfc="${this.company.rfc}" 
        Nombre="${this.company.name}" 
        RegimenFiscal="${this.company.regimen?.split(' ')[0] || '601'}"/>

    <cfdi:Receptor 
        Rfc="XAXX010101000" 
        Nombre="${user ? user.username?.toUpperCase() : 'CLIENTE GENERAL'}" 
        UsoCFDI="G03"/>

    <cfdi:Conceptos>
        ${xmlItems}
    </cfdi:Conceptos>

    <cfdi:Impuestos TotalImpuestosTrasladados="${iva.toFixed(2)}">
        <cfdi:Traslados>
        <cfdi:Traslado 
            Base="${subtotal.toFixed(2)}" 
            Impuesto="002" 
            TipoFactor="Tasa" 
            TasaOCuota="0.160000" 
            Importe="${iva.toFixed(2)}"/>
        </cfdi:Traslados>
    </cfdi:Impuestos>

    <cfdi:Complemento>
        <tfd:TimbreFiscalDigital 
            xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
            UUID="550e8400-e29b-41d4-a716-446655440000"/>
    </cfdi:Complemento>
    </cfdi:Comprobante>`;

    // Ejecución de la descarga nativa en navegador
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_Pedido_${orden.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}