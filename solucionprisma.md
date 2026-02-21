

 ## Guía: Solución de errores de build en el monorepo PadelGO

### Problema raíz

Una IA anterior cambió la configuración de TypeScript a `module: "NodeNext"` / `moduleResolution: "NodeNext"`, lo cual es incompatible con **Prisma v7** (que genera código ESM con imports `.js`) y con los paquetes internos `@repo/*` del monorepo.

---

### 1. base.json — Module Resolution

**Antes:**
```json
"module": "NodeNext",
"moduleResolution": "NodeNext"
```

**Después:**
```json
"module": "ESNext",
"moduleResolution": "Bundler"
```

**Por qué:** `Bundler` resuelve imports `.js` → `.ts` automáticamente, no requiere extensiones en imports, y soporta el campo `exports` de package.json. Es compatible con Prisma v7, webpack, y Next.js.

---

### 2. nest.json — Overrides de CommonJS eliminados

**Antes:**
```json
"module": "CommonJS",
"moduleResolution": "Node"
```

**Después:** Se eliminaron esas dos líneas. Ahora hereda `ESNext`/`Bundler` del base.

**Por qué:** `moduleResolution: "Node"` (el viejo) no puede resolver imports `.js` que genera Prisma v7, ni el campo `exports` en los `@repo/*`.

---

### 3. package.json — Propiedades de tsconfig mezcladas

**Antes:** El package.json contenía `"extends"`, `"compilerOptions"`, e `"include"` — propiedades que son de tsconfig.json, no de package.json. Además `main` apuntaba a `src/index.js` (inexistente).

**Después:** Se limpiaron esas propiedades y se creó un archivo tsconfig.json separado:

```json
// tsconfig.json
{
  "extends": "../typescript-config/base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src"]
}
```

```json
// package.json (campos relevantes)
{
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" }
}
```

---

### 4. tsconfig.json — Overrides CJS y falta de decorators

**Antes:**
```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**Después:**
```json
{
  "compilerOptions": {
    "rootDir": ".",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src", "generated"]
}
```

**Por qué:** Necesita decorators para NestJS (`@Injectable`, `@Global`, `@Module`). La carpeta `generated` con el código de Prisma debe estar incluida. `rootDir: "."` para que pueda importar desde `../generated/`.

---

### 5. package.json — `main` apuntaba a dist

**Antes:** `"main": "dist/index.js"` — el archivo no existe porque el paquete se consume como source TypeScript.

**Después:** `"main": index.ts"`

---

### 6. webpack.config.js — Paquetes `@repo/*` no se empaquetaban

**Problema:** Webpack externaliza todo node_modules por defecto. Los paquetes `@repo/*` están symlinked en node_modules, así que webpack generaba `require("@repo/database")` en el bundle. En runtime, Node intentaba cargar archivos `.ts` crudos y fallaba.

**Solución:** Se creó `webpack.config.js` custom:

```js
const nodeExternals = require(
  require.resolve('webpack-node-externals', {
    paths: [require.resolve('@nestjs/cli/package.json')],
  }),
);

module.exports = function (options) {
  options.externals = [
    nodeExternals({ allowlist: [/^@repo\//] }),
  ];

  if (options.module && options.module.rules) {
    options.module.rules = options.module.rules.map((rule) => {
      if (rule.test && rule.test.toString().includes('tsx?')) {
        return { ...rule, exclude: /node_modules\/(?!@repo)/ };
      }
      return rule;
    });
  }

  return options;
};
```

**Qué hace:**
- `allowlist: [/^@repo\//]` → Incluye `@repo/*` en el bundle (no los externaliza)
- `exclude: /node_modules\/(?!@repo)/` → Permite a `ts-loader` compilar TypeScript dentro de `node_modules/@repo/`

---

### 7. nest-cli.json — Apuntar al webpack config

```json
{
  "compilerOptions": {
    "webpack": true,
    "webpackConfigPath": "webpack.config.js",
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

---

### 8. app.module.ts — Faltaba `ConfigModule`

**Antes:** No importaba `ConfigModule`, entonces `ConfigService` no podía leer variables de entorno y `DATABASE_URL` nunca se cargaba.

**Después:**
```typescript
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '..', '..', '.env'),
    }),
    PrismaModule,
    AuthModule
  ],
})
```

---

### Resumen visual del flujo de resolución

```
base.json (ESNext/Bundler)
  ├── nest.json (hereda, agrega decorators)
  │     └── apps/api/tsconfig.json (hereda)
  ├── packages/shared/tsconfig.json (hereda)
  └── packages/database/tsconfig.json (hereda, agrega decorators + generated)
```

```
webpack build (nest build)
  ├── @repo/database → BUNDLED (no externalizado)
  ├── @repo/shared   → BUNDLED (no externalizado)
  └── todo lo demás  → externalizado (require normal)
```