<template>
  <div class="reportes-container">
    <div class="header-section">
      <h2>Reportes Financieros</h2>
    </div>

    <div class="card chart-card">
      <div class="card-header">
        <h3>Ingresos del Año Actual</h3>
      </div>
      <div class="chart-wrapper">
        <Bar v-if="chartData.labels" :data="chartData" :options="chartOptions" />
        <div v-else class="loading-text">Cargando datos...</div>
      </div>
    </div>

    <div class="card calendar-card">
      <div class="card-header">
        <h3>Generar Reporte Detallado</h3>
      </div>

      <div class="controls-layout">
        
        <div class="date-inputs">
          <div class="input-group">
            <label>Fecha Inicio:</label>
            <input type="date" v-model="fechaInicio" class="custom-date-input">
          </div>
          
          <span class="arrow"></span>

          <div class="input-group">
            <label>Fecha Fin:</label>
            <input type="date" v-model="fechaFin" class="custom-date-input">
          </div>
        </div>

        <div class="action-area">
          <div class="summary" v-if="fechaInicio && fechaFin">
            <p>Periodo seleccionado:</p>
            <strong>{{ formatDate(fechaInicio) }} al {{ formatDate(fechaFin) }}</strong>
          </div>

          <button 
            v-if="authStore.canViewReports"
            class="btn-generar" 
            @click="generarPDF" 
            :disabled="!fechaInicio || !fechaFin || generating"
          >
            {{ generating ? 'Generando...' : '📄 Descargar Reporte PDF' }}
          </button>
          <div v-else class="alert-box">
            ⚠️ No tienes permisos para generar reportes financieros.
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import reporteService from '@/services/reporteService';
import clientService from '@/services/clientService';
import contratoService from '@/services/contratoService';
import operacionesService from '@/services/operacionesService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuthStore } from '../../stores/authStore';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

//inicialiazar AuthStore
const authStore = useAuthStore();

const loading = ref(true);
const generating = ref(false);

// Datos crudos
const pagosList = ref([]); 
const clientesMap = ref({});
const contratosMap = ref({});
const cajonesMap = ref({});

// Variables para el filtro
const fechaInicio = ref('');
const fechaFin = ref('');

// Configuración de la Gráfica
const chartData = ref({});
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { 
      callbacks: {
        label: (context) => `$${context.raw}` // Formato dinero
      }
    }
  }
};



// --- CARGA DE DATOS COMPLETA ---
onMounted(async () => {
  try {
    // Cargamos TODO en paralelo para poder cruzar los datos (Pago -> Contrato -> Cliente/Cajón)
    const [resPagos, resClientes, resContratos, resCajones] = await Promise.all([
      reporteService.getPagosReporte(),
      clientService.getClients(),
      contratoService.getContratos(),
      operacionesService.getCajones()
    ]);

    pagosList.value = resPagos.results || resPagos;
    const clientes = resClientes.results || resClientes;
    const contratos = resContratos.results || resContratos;
    const cajones = resCajones.results || resCajones;

    // Creamos mapas para búsqueda rápida por ID
    clientes.forEach(c => clientesMap.value[c.id] = c);
    cajones.forEach(c => cajonesMap.value[c.id] = c);
    contratos.forEach(c => contratosMap.value[c.id] = c);
    
    procesarDatosParaGrafica(pagosList.value);
  } catch (error) {
    console.error("Error al cargar reportes:", error);
  } finally {
    loading.value = false;
  }
});

// --- LÓGICA DE GRÁFICA ---
const procesarDatosParaGrafica = (pagos) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ingresos = new Array(12).fill(0);

  pagos.forEach(pago => {
    const fecha = new Date(pago.fecha_pago);
    if (fecha.getFullYear() === new Date().getFullYear()) {
      ingresos[fecha.getMonth()] += parseFloat(pago.monto);
    }
  });

  chartData.value = {
    labels: meses,
    datasets: [{
      label: 'Ingresos',
      backgroundColor: '#7C5CFF',
      borderRadius: 6,
      data: ingresos
    }]
  };
};

// --- LÓGICA DE PDF (MEJORADA) ---
const generarPDF = () => {
  generating.value = true;

  const pagosFiltrados = pagosList.value.filter(p => {
    return p.fecha_pago >= fechaInicio.value && p.fecha_pago <= fechaFin.value;
  });

  if (pagosFiltrados.length === 0) {
    alert("No hay pagos registrados en este periodo.");
    generating.value = false;
    return;
  }

  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(20);
  doc.setTextColor(124, 92, 255);
  doc.text("CONNOS Park", 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Reporte de Ingresos", 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 36);
  doc.text(`Periodo: ${formatDate(fechaInicio.value)} al ${formatDate(fechaFin.value)}`, 14, 42);

  // PREPARAR DATOS DE LA TABLA
  const tableBody = pagosFiltrados.map(p => {
    // 1. Obtener Contrato
    const contrato = contratosMap.value[p.contrato];
    
    let referenciaTexto = `Contrato #${p.contrato}`; // Valor por defecto
    
    if (contrato) {
      // 2. Obtener Cliente y Cajón a través del contrato
      const cliente = clientesMap.value[contrato.cliente];
      const cajon = cajonesMap.value[contrato.cajon];
      
      const nombreCliente = cliente ? cliente.nombre : 'Cliente Desconocido';
      const numCajon = cajon ? cajon.numero : '?';
      
      // Formato solicitado: Nombre Cliente + Cajón
      referenciaTexto = `${nombreCliente} (Cajón ${numCajon})`;
    }

    // Formato Periodo Cubierto: Inicio - Fin
    const periodoTexto = `${formatDate(p.periodo_inicio)} - ${formatDate(p.periodo_fin)}`;

    return [
      formatDate(p.fecha_pago),
      referenciaTexto,
      periodoTexto,
      `$${parseFloat(p.monto).toFixed(2)}`
    ];
  });

  // Total
  const total = pagosFiltrados.reduce((acc, curr) => acc + parseFloat(curr.monto), 0);
  tableBody.push(['', '', 'TOTAL INGRESOS', `$${total.toFixed(2)}`]);

  // Generar Tabla
  autoTable(doc, {
    startY: 50,
    // Encabezados actualizados
    head: [['Fecha Pago', 'Referencia (Cliente - Cajón)', 'Periodo Cubierto', 'Monto']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [124, 92, 255] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 }, // Fecha
      1: { cellWidth: 80 }, // Referencia (más ancha para el nombre)
      2: { cellWidth: 50 }, // Periodo
      3: { cellWidth: 30, halign: 'right' } // Monto
    }
  });

  doc.save(`Reporte_Connos_${fechaInicio.value}.pdf`);
  generating.value = false;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '---';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};
</script>

<style scoped>

/* Estilo opcional para el mensaje de alerta */
.alert-box {
  background-color: #FFF4E5;
  color: #663C00;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
}

.reportes-container { padding: 20px; }
h2 { font-size: 2rem; color: #333; margin-bottom: 20px; }

.card {
  background: white; border-radius: 15px; padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 30px;
}
.card-header h3 { margin: 0 0 20px 0; color: #444; font-size: 1.2rem; }

.chart-wrapper { height: 350px; position: relative; }
.loading-text { display: flex; align-items: center; justify-content: center; height: 100%; color: #888; }

.controls-layout {
  display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 30px;
}

.date-inputs {
  display: flex; align-items: center; gap: 15px; background: #F8F9FD;
  padding: 20px; border-radius: 12px; border: 1px solid #EEF2F6; flex: 2;
}

.input-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.input-group label { font-size: 0.9rem; font-weight: bold; color: #666; }

.custom-date-input {
  padding: 12px; border: 1px solid #ccc; border-radius: 8px; 
  font-size: 1rem; color: #333; outline: none; background: white; width: 100%;
}
.custom-date-input:focus { border-color: #7C5CFF; }

.arrow { font-size: 1.5rem; color: #ccc; font-weight: bold; }

.action-area {
  flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 15px;
}

.summary p { margin: 0; color: #666; font-size: 0.9rem; }
.summary strong { color: #333; font-size: 1.1rem; }

.btn-generar {
  background: #7C5CFF; color: white; border: none; padding: 15px 30px;
  border-radius: 10px; font-weight: bold; font-size: 1.1rem; cursor: pointer;
  transition: transform 0.2s, background 0.2s; width: 100%;
}
.btn-generar:hover:not(:disabled) { background: #6a4be0; transform: translateY(-2px); }
.btn-generar:disabled { background: #ccc; cursor: not-allowed; }

@media (max-width: 768px) {
  .controls-layout { flex-direction: column; align-items: stretch; }
  .date-inputs { flex-direction: column; }
  .arrow { transform: rotate(90deg); }
}
</style>