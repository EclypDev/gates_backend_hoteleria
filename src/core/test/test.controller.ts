import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  getTestPage(): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GalaxyPos - Test Panel</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .container { background: #1e293b; border-radius: 16px; padding: 2rem; width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; color: #34d399; }
  .subtitle { font-size: 0.8rem; color: #64748b; margin-bottom: 1.5rem; }
  label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.4rem; margin-top: 1rem; }
  select, input { width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.95rem; outline: none; }
  select:focus, input:focus { border-color: #34d399; }
  .btn-group { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  button { flex: 1; padding: 0.75rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-on { background: #059669; color: white; }
  .btn-on:hover { background: #047857; }
  .btn-off { background: #dc2626; color: white; }
  .btn-off:hover { background: #b91c1c; }
  .status { margin-top: 1.25rem; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; display: none; }
  .status.success { display: block; background: #064e3b; color: #34d399; border: 1px solid #059669; }
  .status.error { display: block; background: #450a0a; color: #fca5a5; border: 1px solid #dc2626; }
  .status.loading { display: block; background: #1e3a5f; color: #7dd3fc; border: 1px solid #0284c7; }
  .devices-info { font-size: 0.75rem; color: #64748b; margin-top: 0.3rem; }
  .refresh-btn { background: none; border: 1px solid #334155; color: #94a3b8; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; flex: none; margin-top: 0.3rem; }
  .refresh-btn:hover { border-color: #34d399; color: #34d399; }
</style>
</head>
<body>
<div class="container">
  <h1>GalaxyPos Test Panel</h1>
  <p class="subtitle">Control de dispositivos IoT</p>

  <label>Dispositivo</label>
  <select id="deviceSelect">
    <option value="">Cargando dispositivos...</option>
  </select>
  <div style="display:flex;justify-content:flex-end;">
    <button class="refresh-btn" onclick="loadDevices()">Recargar</button>
  </div>

  <label>Pin (GPIO)</label>
  <input type="number" id="pinInput" value="2" min="0" max="34" placeholder="Ej: 2, 4, 5, 13...">

  <div class="btn-group">
    <button class="btn-on" onclick="sendCommand('on')">ENCENDER</button>
    <button class="btn-off" onclick="sendCommand('off')">APAGAR</button>
  </div>

  <div id="status" class="status"></div>
</div>

<script>
const API = '/api';

async function loadDevices() {
  const select = document.getElementById('deviceSelect');
  try {
    const res = await fetch(API + '/iot/devices');
    const devices = await res.json();
    select.innerHTML = '';
    if (devices.length === 0) {
      select.innerHTML = '<option value="">No hay dispositivos</option>';
      return;
    }
    devices.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.macAddress;
      opt.textContent = d.alias + ' (' + d.macAddress + ')' + (d.isOnline ? ' [ONLINE]' : ' [OFFLINE]');
      select.appendChild(opt);
    });
  } catch (e) {
    select.innerHTML = '<option value="">Error cargando dispositivos</option>';
  }
}

async function sendCommand(action) {
  const mac = document.getElementById('deviceSelect').value;
  const pin = parseInt(document.getElementById('pinInput').value);
  const status = document.getElementById('status');

  if (!mac) {
    status.className = 'status error';
    status.textContent = 'Selecciona un dispositivo';
    return;
  }
  if (isNaN(pin)) {
    status.className = 'status error';
    status.textContent = 'Ingresa un pin válido';
    return;
  }

  status.className = 'status loading';
  status.textContent = 'Enviando comando...';

  try {
    const res = await fetch(API + '/iot/devices/' + mac + '/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, action })
    });

    if (res.ok) {
      status.className = 'status success';
      status.textContent = 'Pin ' + pin + ' → ' + action.toUpperCase() + ' enviado a ' + mac;
    } else {
      const err = await res.json();
      status.className = 'status error';
      status.textContent = 'Error: ' + (err.message || res.statusText);
    }
  } catch (e) {
    status.className = 'status error';
    status.textContent = 'Error de conexión: ' + e.message;
  }
}

loadDevices();
</script>
</body>
</html>`;
  }
}
