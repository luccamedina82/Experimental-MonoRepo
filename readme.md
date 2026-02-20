

BRODEEERS
ACUERDENSE QUE PARA USAR EL PRISMA EN EL BACKEND
ES EL {prisma} en MINUSCULA.
levanten el docker con el
docker-compose up -d
despues hacen el generate parados en la raiz
pnpm run --filter @repo/database db:migrate

y bueno ahi ya se les crea todo.
estaria bueno definir las dtos en estos dias para poder trabajar unificados en las interfaces de datos que vamos a usar entre back y front.