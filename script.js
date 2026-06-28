// ============================================
// MOBILE NAV TOGGLE
// ============================================
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('nav-list');

navToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navList.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// LIVE FUNCTION PLOTTER (hero signature element)
// ============================================
const fnSelect = document.getElementById('fnSelect');
const plotSvg = document.getElementById('plotSvg');

const functions = {
  sinx:  { fn: x => Math.sin(x),            domain: [-7, 7],  range: [-1.4, 1.4] },
  x2:    { fn: x => x * x,                  domain: [-3, 3],  range: [-0.5, 9]   },
  x3:    { fn: x => x*x*x - 3*x,             domain: [-2.4, 2.4], range: [-5, 5]  },
  logx:  { fn: x => x > 0 ? Math.log(x) : NaN, domain: [0.05, 8], range: [-3.5, 2.2] },
  expx:  { fn: x => Math.exp(x) / 4,         domain: [-3, 2.2], range: [-0.5, 4.5] }
};

const W = 320, H = 220, PAD = 28;

function mapX(x, domain) {
  return PAD + (x - domain[0]) / (domain[1] - domain[0]) * (W - 2 * PAD);
}
function mapY(y, range) {
  return H - PAD - (y - range[0]) / (range[1] - range[0]) * (H - 2 * PAD);
}

function drawPlot(key) {
  const { fn, domain, range } = functions[key];
  const steps = 140;
  let pathParts = [];
  let started = false;

  for (let i = 0; i <= steps; i++) {
    const x = domain[0] + (domain[1] - domain[0]) * (i / steps);
    const y = fn(x);
    if (!isFinite(y) || y < range[0] - 1 || y > range[1] + 1) {
      started = false;
      continue;
    }
    const px = mapX(x, domain).toFixed(1);
    const py = mapY(y, range).toFixed(1);
    pathParts.push((started ? 'L' : 'M') + px + ' ' + py);
    started = true;
  }

  const axisX0 = mapX(Math.max(domain[0], 0), domain);
  const axisY0 = mapY(0, range);
  const hasZeroX = 0 >= range[0] && 0 <= range[1];
  const hasZeroY = 0 >= domain[0] && 0 <= domain[1];

  let svgContent = '';

  // grid
  svgContent += `<rect x="0" y="0" width="${W}" height="${H}" fill="white"/>`;

  // axes (only drawn where they fall within view)
  if (hasZeroX) {
    svgContent += `<line x1="${PAD}" y1="${axisY0}" x2="${W - PAD}" y2="${axisY0}" stroke="#C9C2AE" stroke-width="1"/>`;
  }
  if (hasZeroY) {
    svgContent += `<line x1="${axisX0}" y1="${PAD}" x2="${axisX0}" y2="${H - PAD}" stroke="#C9C2AE" stroke-width="1"/>`;
  }

  // curve
  svgContent += `<path d="${pathParts.join(' ')}" fill="none" stroke="#C84A3D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

  plotSvg.innerHTML = svgContent;
}

fnSelect.addEventListener('change', () => drawPlot(fnSelect.value));
drawPlot(fnSelect.value);

// ============================================
// QUIZ GRADING
// ============================================
const quizForm = document.getElementById('quizForm');
const quizScore = document.getElementById('quizScore');

const answerKey = {
  q1: { correct: 'a', explain: { a: 'Correcto — 15% de $80 es 0.15 × 80 = $12 de descuento.', b: 'No es correcto — revisa la conversión de 15% a decimal (0.15), no 0.15 × algo distinto.', c: 'No es correcto — esa sería la cantidad después del descuento, no el descuento mismo.' } },
  q2: { correct: 'b', explain: { a: 'No es correcto — 1/4 es igual a 0.25, no 0.75.', b: 'Correcto — 3 ÷ 4 = 0.75.', c: 'No es correcto — 7/5 es mayor que 1, así que no puede ser igual a 0.75.' } },
  q3: { correct: 'b', explain: { a: 'No es correcto — la multiplicación se resuelve antes que la suma.', b: 'Correcto — el orden de operaciones resuelve la multiplicación antes que la suma: 4 × 2 = 8, luego 3 + 8 = 11.', c: 'No es correcto — el orden sí importa; cambia el resultado final.' } },
  q4: { correct: 'b', explain: { a: 'No es correcto — esto no incluye el impuesto de ventas.', b: 'Correcto — 8% de $25 es $2, así que el total es $25 + $2 = $27.', c: 'No es correcto — revisa el cálculo del 8%; el impuesto no es tan alto.' } },
  q5: { correct: 'b', explain: { a: 'No es correcto — el nombre de la categoría va debajo de la barra, no en su altura.', b: 'Correcto — la altura de la barra muestra la cantidad o valor de esa categoría.', c: 'No es correcto — el color suele usarse para distinguir grupos, no para mostrar la cantidad.' } },
  q6: { correct: 'b', explain: { a: 'No es correcto — el Cuadrante I tiene X y Y positivos; aquí X es negativo.', b: 'Correcto — X negativo y Y positivo corresponde al Cuadrante II (arriba a la izquierda).', c: 'No es correcto — el Cuadrante III tiene X y Y negativos; aquí Y es positivo.' } },
  q7: { correct: 'b', explain: { a: 'No es correcto — el primer número (2) se mueve sobre el eje X, antes de moverte en Y.', b: 'Correcto — el primer número del par (2) indica el movimiento horizontal, así que te mueves 2 a la derecha primero.', c: 'No es correcto — el segundo número es −5, así que te moverás hacia abajo, no hacia arriba, y solo después de moverte en X.' } }
};

quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let correctCount = 0;
  let answeredCount = 0;

  Object.keys(answerKey).forEach(qName => {
    const selected = quizForm.querySelector(`input[name="${qName}"]:checked`);
    const feedbackEl = quizForm.querySelector(`.quiz-feedback[data-for="${qName}"]`);

    if (!selected) {
      feedbackEl.hidden = true;
      return;
    }
    answeredCount++;
    const isCorrect = selected.value === answerKey[qName].correct;
    if (isCorrect) correctCount++;

    feedbackEl.hidden = false;
    feedbackEl.textContent = answerKey[qName].explain[selected.value];
    feedbackEl.classList.toggle('correct', isCorrect);
    feedbackEl.classList.toggle('incorrect', !isCorrect);
  });

  if (answeredCount === 0) {
    quizScore.textContent = 'Elige al menos una respuesta primero.';
  } else {
    quizScore.textContent = `Puntaje: ${correctCount} de ${answeredCount} respondidas correctamente.`;
  }
});
