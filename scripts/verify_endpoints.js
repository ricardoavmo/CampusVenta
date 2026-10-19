const fs = require('fs');
const path = require('path');

// 1. Cargar colección Postman
const postmanRaw = fs.readFileSync(path.join(__dirname, '../docs/CampusVenta_API.postman_collection.json'), 'utf8');
const postmanData = JSON.parse(postmanRaw);

function extractPostmanEndpoints(items, list = []) {
  for (const item of items) {
    if (item.item) {
      extractPostmanEndpoints(item.item, list);
    } else if (item.request) {
      const method = item.request.method.toUpperCase();
      let pathStr = '/' + item.request.url.path.join('/');
      // Normalizar parámetros numéricos de ejemplo a {id} / {productoId}
      // En Postman: /api/usuarios/me/favoritos/1 -> /api/usuarios/me/favoritos/{emprendimientoId}
      list.push({
        name: item.name,
        method: method,
        rawPath: pathStr
      });
    }
  }
  return list;
}

const postmanEndpoints = extractPostmanEndpoints(postmanData.item);

// 2. Extraer endpoints de los controladores Spring Boot
const controllerDir = path.join(__dirname, '../backend/src/main/java/pe/edu/utp/campusventa/controller');
const controllerFiles = fs.readdirSync(controllerDir).filter(f => f.endsWith('Controller.java'));

const controllerEndpoints = [];

for (const file of controllerFiles) {
  const content = fs.readFileSync(path.join(controllerDir, file), 'utf8');
  
  // Base path
  const baseMatch = content.match(/@RequestMapping\("([^"]+)"\)/);
  const basePath = baseMatch ? baseMatch[1] : '';

  // Buscar métodos anotados
  const mappingRegex = /@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)(?:\((?:value\s*=\s*)?(?:"([^"]*)")?[^)]*\))?/g;
  let match;
  while ((match = mappingRegex.exec(content)) !== null) {
    const annot = match[1];
    const subPath = match[2] !== undefined ? match[2] : '';
    let method = 'GET';
    if (annot === 'PostMapping') method = 'POST';
    else if (annot === 'PutMapping') method = 'PUT';
    else if (annot === 'PatchMapping') method = 'PATCH';
    else if (annot === 'DeleteMapping') method = 'DELETE';

    let fullPath = basePath + (subPath ? (subPath.startsWith('/') ? subPath : '/' + subPath) : '');
    // Normalizar final slash
    if (fullPath.length > 1 && fullPath.endsWith('/')) {
      fullPath = fullPath.slice(0, -1);
    }
    controllerEndpoints.push({
      controller: file,
      method: method,
      path: fullPath
    });
  }
}

// 3. Función de normalización de paths para matching (convertir {param} o números a {param})
function normalizePath(p) {
  return p
    .replace(/\/1(\/|$)/g, '/{param}$1')
    .replace(/\/\{[^}]+\}/g, '/{param}')
    .toLowerCase();
}

console.log('========================================================');
console.log('COMPARACIÓN POSTMAN VS CONTROLADORES SPRING BOOT');
console.log('========================================================');
console.log(`Total endpoints detectados en Spring Boot: ${controllerEndpoints.length}`);
console.log(`Total endpoints detectados en Postman:    ${postmanEndpoints.length}`);
console.log('--------------------------------------------------------');

let matches = 0;
const matchedControllers = new Set();

for (const postmanEp of postmanEndpoints) {
  const normPostman = normalizePath(postmanEp.rawPath);
  const foundIndex = controllerEndpoints.findIndex((c, idx) => {
    if (matchedControllers.has(idx)) return false;
    return c.method === postmanEp.method && normalizePath(c.path) === normPostman;
  });

  if (foundIndex !== -1) {
    matches++;
    matchedControllers.add(foundIndex);
    const c = controllerEndpoints[foundIndex];
    console.log(`[COINCIDE 36/36] ${postmanEp.method.padEnd(6)} ${postmanEp.rawPath.padEnd(45)} ➔ ${c.controller} (${c.path})`);
  } else {
    console.log(`[NO COINCIDE]   ${postmanEp.method.padEnd(6)} ${postmanEp.rawPath} (${postmanEp.name})`);
  }
}

console.log('--------------------------------------------------------');
console.log(`Resultado final: ${matches} de ${controllerEndpoints.length} endpoints coinciden exactamente.`);
if (matches === 36 && controllerEndpoints.length === 36 && postmanEndpoints.length === 36) {
  console.log('✅ ÉXITO TOTAL: 36 de 36 endpoints alineados al 100%');
  process.exit(0);
} else {
  console.error('❌ DISCREPANCIA DETECTADA');
  process.exit(1);
}
