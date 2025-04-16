export {};
const qrcodeContainer = document.getElementById('qrcode');
const form = document.getElementById('qr-form');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const qrTextInput = document.getElementById('qr-text');
const sizeInput = document.getElementById('qr-size');
const darkColorInput = document.getElementById('dark-color');
const lightColorInput = document.getElementById('light-color');
const formatSelect = document.getElementById('qr-format');
const logoInput = document.getElementById('logo-input');
const logoSizeInput = document.getElementById('logo-size');
const errorMsg = document.getElementById('error-msg');
const spinner = document.getElementById('spinner');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('theme-toggle');

let logoData = null;
logoInput.addEventListener('change', () => {
  const file = logoInput.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => logoData = e.target.result;
    reader.readAsDataURL(file);
  } else {
    logoData = null;
  }
});

qrTextInput.addEventListener('input', updateButtons);
sizeInput.addEventListener('input', updateButtons);
formatSelect.addEventListener('change', updateButtons);

function updateButtons() {
  const valid = qrTextInput.value.trim() !== '';
  generateBtn.disabled = !valid;
  clearBtn.disabled = !valid;
}

form.addEventListener('submit', e => { e.preventDefault(); generateBtn.click(); });

generateBtn.addEventListener('click', async () => {
  const text = qrTextInput.value.trim();
  const size = parseInt(sizeInput.value, 10) || 200;
  const dark = darkColorInput.value;
  const light = lightColorInput.value;
  const format = formatSelect.value;
  const logoScale = parseInt(logoSizeInput.value, 10) / 100;

  errorMsg.textContent = '';
  qrcodeContainer.innerHTML = '';
  downloadBtn.disabled = true;
  copyBtn.disabled = true;
  clearBtn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    if (format === 'svg') {
      const svgString = await QRCode.toString(text, { type: 'svg', width: size, color: { dark, light } });
      const wrapper = document.createElement('div'); wrapper.innerHTML = svgString;
      qrcodeContainer.appendChild(wrapper.firstChild);
    } else {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, text, { width: size, color: { dark, light } });
      if (logoData && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        const img = new Image(); img.src = logoData;
        await new Promise(res => img.onload = res);
        const logoSize = size * logoScale;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        ctx.drawImage(img, x, y, logoSize, logoSize);
      }
      qrcodeContainer.appendChild(canvas);
    }
    downloadBtn.disabled = false;
    copyBtn.disabled = false;
    clearBtn.disabled = false;
    showToast('QR code generated!');
  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Error generating QR code.';
  } finally {
    spinner.classList.add('hidden');
  }
});

downloadBtn.addEventListener('click', () => {
  const format = formatSelect.value;
  if (format === 'svg') {
    const svgEl = qrcodeContainer.querySelector('svg');
    const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'qr-code.svg'; link.click(); URL.revokeObjectURL(url);
  } else {
    const canvas = qrcodeContainer.querySelector('canvas');
    const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = 'qr-code.png'; link.click();
  }
});

copyBtn.addEventListener('click', async () => { /* unchanged copy logic */ });
clearBtn.addEventListener('click', () => { form.reset(); /* clear logic */ });

function showToast(msg, error = false) { /* unchanged toast */ }

themeToggle.addEventListener('click', () => { /* theme logic */ });
if (localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
