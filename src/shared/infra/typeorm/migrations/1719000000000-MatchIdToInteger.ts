import { MigrationInterface, QueryRunner } from 'typeorm'

export class MatchIdToInteger1719000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar tipo atual da coluna id em matches
    const matchIdCol = await queryRunner.query(
      `SELECT data_type FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'id'`
    )
    const isAlreadyInt = matchIdCol.length > 0 && matchIdCol[0].data_type === 'integer'

    if (!isAlreadyInt) {
      // Remover todas as FK de guesses que referenciam matches
      const fks = await queryRunner.query(
        `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'guesses' AND constraint_type = 'FOREIGN KEY'`
      )
      for (const fk of fks) {
        if (fk.constraint_name.toLowerCase().includes('match')) {
          await queryRunner.query(`ALTER TABLE "guesses" DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"`)
        }
      }

      // Remover unique constraints de guesses
      const uqs = await queryRunner.query(
        `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'guesses' AND constraint_type = 'UNIQUE'`
      )
      for (const uq of uqs) {
        await queryRunner.query(`ALTER TABLE "guesses" DROP CONSTRAINT IF EXISTS "${uq.constraint_name}"`)
      }

      // Converter matchId em guesses para integer
      const guessMatchCol = await queryRunner.query(
        `SELECT data_type FROM information_schema.columns WHERE table_name = 'guesses' AND column_name = 'matchId'`
      )
      if (guessMatchCol.length > 0 && guessMatchCol[0].data_type !== 'integer') {
        await queryRunner.query(`ALTER TABLE "guesses" ALTER COLUMN "matchId" TYPE integer USING "matchId"::integer`)
      }

      // Converter id em matches para integer
      await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "id" TYPE integer USING "id"::integer`)
    }

    // Garantir unique constraint (idempotente)
    const hasUq = await queryRunner.query(
      `SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'guesses' AND constraint_type = 'UNIQUE' AND constraint_name = 'UQ_guesses_userId_matchId'`
    )
    if (hasUq.length === 0) {
      await queryRunner.query(`ALTER TABLE "guesses" ADD CONSTRAINT "UQ_guesses_userId_matchId" UNIQUE ("userId", "matchId")`)
    }

    // NÃO criar FK aqui — o synchronize do TypeORM cuida disso via @ManyToOne na entidade
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "guesses" ALTER COLUMN "matchId" TYPE varchar USING "matchId"::varchar`)
    await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "id" TYPE varchar USING "id"::varchar`)
  }
}
