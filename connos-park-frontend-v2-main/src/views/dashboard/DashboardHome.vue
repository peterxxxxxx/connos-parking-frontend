<template>
  <div class="dashboard-wrapper">
    
    <div class="dashboard-header">
      <div>
        <h2>Panel de Control</h2>
        <p>Resumen de operaciones en tiempo real</p>
      </div>
      <div class="date-display">
        {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
      </div>
    </div>

    <div class="kpi-grid">
      
      <div class="kpi-card">
        <div class="icon-wrapper purple">
          <span class="emoji">🅿️</span>
        </div>
        <div class="kpi-content">
          <span class="label">Total Cajones</span>
          <h3 class="number">{{ stats.total }}</h3>
        </div>
      </div>

      <div class="kpi-card">
        <div class="icon-wrapper blue">
          <span class="emoji">🚘</span>
        </div>
        <div class="kpi-content">
          <span class="label">Ocupados</span>
          <h3 class="number">{{ stats.ocupados }}</h3>
        </div>
      </div>

      <div class="kpi-card">
        <div class="icon-wrapper green">
          <span class="emoji">✅</span>
        </div>
        <div class="kpi-content">
          <span class="label">Disponibles</span>
          <h3 class="number">{{ stats.disponibles }}</h3>
        </div>
      </div>

      <div class="kpi-card">
        <div class="icon-wrapper orange">
          <span class="emoji">🔧</span>
        </div>
        <div class="kpi-content">
          <span class="label">Mantenimiento</span>
          <h3 class="number">{{ stats.mantenimiento }}</h3>
        </div>
      </div>

    </div>

    <div class="content-grid">
      
      <div class="dashboard-card chart-card">
        <div class="card-header">
          <h3>Ingresos Mensuales</h3>
          <button class="btn-icon">📊</button>
        </div>
        <div class="chart-container">
           <Bar v-if="chartData.labels" :data="chartData" :options="chartOptions" />
           <div v-else class="loading-state">Cargando datos financieros...</div>
        </div>
      </div>

      <div class="dashboard-card list-card">
        <div class="card-header">
          <h3>Próximos Pagos</h3>
          <span class="badge-count">{{ vencimientos.length }}</span>
        </div>
        
        <div class="vencimientos-scroll">
          <div v-if="vencimientos.length === 0" class="empty-state">
            <div class="check-icon">🎉</div>
            <p>No hay pagos pendientes próximos</p>
          </div>

          <div 
            v-for="item in vencimientos" 
            :key="item.id" 
            class="vencimiento-row"
            :class="{ 'urgent': item.diasRestantes <= 3 }"
          >
            <div class="date-box">
              <span class="day">{{ item.diaPago }}</span>
              <span class="month">{{ item.mesPago }}</span>
            </div>
            
            <div class="info-box">
              <h4 class="client-name">{{ item.clienteNombre }}</h4>
              <p class="detail-text">Cajón {{ item.cajonNumero }}</p>
            </div>

            <div class="status-box">
              <span class="amount">${{ item.monto }}</span>
              <div class="days-tag" :class="getStatusClass(item.diasRestantes)">
                {{ getStatusLabel(item.diasRestantes) }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import operacionesService from '@/services/operacionesService';
import contratoService from '@/services/contratoService';
import clientService from '@/services/clientService';
import reporteService from '@/services/reporteService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const stats = ref({ total: 0, ocupados: 0, disponibles: 0, mantenimiento: 0 });
const vencimientos = ref([]);
const chartData = ref({});
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { 
    y: { 
      beginAtZero: true, 
      grid: { color: '#f0f0f0' },
      ticks: { font: { size: 10 } }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } }
    }
  },
  elements: {
    bar: { borderRadius: 6 }
  }
};

onMounted(async () => {
  try {
    const [resCajones, resContratos, resClientes, resPagos] = await Promise.all([
      operacionesService.getCajones(),
      contratoService.getContratos(),
      clientService.getClients(),
      reporteService.getPagosReporte()
    ]);

    const cajones = resCajones.results || resCajones;
    const contratos = resContratos.results || resContratos;
    const clientes = resClientes.results || resClientes;
    const pagos = resPagos.results || resPagos;

    procesarEstadisticas(cajones, contratos);
    procesarVencimientos(contratos, clientes, cajones);
    procesarGrafica(pagos);

  } catch (error) {
    console.error("Error dashboard:", error);
  }
});

const procesarEstadisticas = (cajones, contratos) => {
  const total = cajones.length;
  const mantenimiento = cajones.filter(c => c.estado === 'MANTENIMIENTO').length;
  const ocupados = contratos.filter(c => c.activo).length;
  
  stats.value = {
    total,
    ocupados,
    mantenimiento,
    disponibles: Math.max(0, total - ocupados - mantenimiento)
  };
};

const procesarVencimientos = (contratos, clientes, cajones) => {
  const hoy = new Date();
  const lista = [];
  const clientesMap = {}; clientes.forEach(c => clientesMap[c.id] = c);
  const cajonesMap = {}; cajones.forEach(c => cajonesMap[c.id] = c);

  contratos.filter(c => c.activo).forEach(contrato => {
    const fechaInicio = new Date(contrato.fecha_inicio);
    const diaPago = fechaInicio.getUTCDate();
    let fechaPago = new Date(hoy.getFullYear(), hoy.getMonth(), diaPago);
    if (fechaPago < new Date(hoy.setHours(0,0,0,0))) {
      fechaPago.setMonth(fechaPago.getMonth() + 1);
    }
    const diffTime = fechaPago - new Date();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    lista.push({
      id: contrato.id,
      clienteNombre: clientesMap[contrato.cliente]?.nombre || 'Desconocido',
      cajonNumero: cajonesMap[contrato.cajon]?.numero || '?',
      monto: contrato.monto_mensual,
      diaPago: diaPago,
      mesPago: fechaPago.toLocaleDateString('es-ES', { month: 'short' }),
      fechaSort: fechaPago,
      diasRestantes
    });
  });

  lista.sort((a, b) => a.fechaSort - b.fechaSort);
  vencimientos.value = lista;
};

const procesarGrafica = (pagos) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ingresos = new Array(12).fill(0);
  pagos.forEach(pago => {
    const f = new Date(pago.fecha_pago);
    if (f.getFullYear() === new Date().getFullYear()) ingresos[f.getMonth()] += parseFloat(pago.monto);
  });
  chartData.value = {
    labels: meses,
    datasets: [{
      label: 'Ingresos',
      backgroundColor: '#7C5CFF',
      data: ingresos,
      barPercentage: 0.6
    }]
  };
};

const getStatusLabel = (dias) => {
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  if (dias < 0) return 'Vencido';
  return `${dias} días`;
};

const getStatusClass = (dias) => {
  if (dias <= 0) return 'tag-red';
  if (dias <= 3) return 'tag-orange';
  return 'tag-blue';
};
</script>

<style scoped>
/* ESTRUCTURA GENERAL */
.dashboard-wrapper {
  padding: 25px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.dashboard-header h2 { margin: 0; font-size: 1.8rem; color: #1a1a1a; font-weight: 700; }
.dashboard-header p { margin: 5px 0 0; color: #666; font-size: 0.95rem; }
.date-display { 
  background: white; padding: 8px 16px; border-radius: 20px; 
  font-size: 0.9rem; color: #555; font-weight: 500; text-transform: capitalize;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

/* A1: KPIs GRID */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0,0,0,0.03);
}
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }

.icon-wrapper {
  width: 50px; height: 50px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
}
.icon-wrapper.purple { background: #F3F0FF; color: #7C5CFF; }
.icon-wrapper.blue { background: #E3F2FD; color: #2196F3; }
.icon-wrapper.green { background: #E8F5E9; color: #4CAF50; }
.icon-wrapper.orange { background: #FFF3E0; color: #FF9800; }

.kpi-content { display: flex; flex-direction: column; }
.kpi-content .label { font-size: 0.85rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-content .number { font-size: 1.8rem; font-weight: 700; color: #333; margin: 0; line-height: 1.2; }

/* A2 & A3: CONTENIDO PRINCIPAL */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 66% Gráfica - 33% Lista */
  gap: 25px;
  align-items: start;
}

.dashboard-card {
  background: white;
  border-radius: 18px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
}

.card-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.card-header h3 { margin: 0; font-size: 1.1rem; color: #333; font-weight: 700; }
.badge-count { background: #7C5CFF; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: bold; }
.btn-icon { background: #f5f5f5; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }

/* GRÁFICA */
.chart-container { height: 320px; position: relative; }
.loading-state { height: 100%; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 0.9rem; }

/* LISTA DE VENCIMIENTOS */
.list-card {
  max-height: 430px; /* Altura fija para hacer scroll interno */
  display: flex; flex-direction: column;
}

.vencimientos-scroll {
  overflow-y: auto;
  padding-right: 5px;
  display: flex; flex-direction: column; gap: 12px;
}
/* Scrollbar bonita */
.vencimientos-scroll::-webkit-scrollbar { width: 5px; }
.vencimientos-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }

.vencimiento-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px; border-radius: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}
.vencimiento-row:hover { border-color: #7C5CFF; background: #FBFBFF; }
.vencimiento-row.urgent { border-left: 3px solid #FF5252; background: #FFF5F5; }

.date-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #F4F6F8; width: 50px; height: 50px; border-radius: 10px;
}
.date-box .day { font-weight: 800; font-size: 1.1rem; color: #333; line-height: 1; }
.date-box .month { font-size: 0.7rem; color: #777; text-transform: uppercase; font-weight: 600; }

.info-box { flex: 1; }
.client-name { margin: 0; font-size: 0.95rem; font-weight: 600; color: #333; }
.detail-text { margin: 2px 0 0 0; font-size: 0.8rem; color: #888; }

.status-box { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.amount { font-weight: 700; font-size: 0.95rem; color: #333; }
.days-tag { font-size: 0.75rem; padding: 2px 8px; border-radius: 6px; font-weight: 600; }

.tag-red { color: #D32F2F; background: #FFEBEE; }
.tag-orange { color: #ED6C02; background: #FFF3E0; }
.tag-blue { color: #0288D1; background: #E1F5FE; }

.empty-state { text-align: center; padding: 40px 0; color: #999; }
.check-icon { font-size: 2rem; margin-bottom: 10px; }

/* Responsive */
@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .content-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>