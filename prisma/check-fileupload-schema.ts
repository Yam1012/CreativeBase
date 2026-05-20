import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw<Array<{ column_name: string; is_nullable: string; data_type: string }>>`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'FileUpload'
    ORDER BY ordinal_position
  `;
  console.log("FileUpload table schema:");
  console.table(result);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
