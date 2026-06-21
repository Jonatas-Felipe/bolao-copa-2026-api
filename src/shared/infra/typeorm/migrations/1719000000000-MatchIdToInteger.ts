import { MigrationInterface, QueryRunner } from 'typeorm'

export class MatchIdToInteger1719000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar tipo atual da coluna id em matches
    const matchIdCol = await queryRunner.query(
      `SELECT data_type FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'id'`
    )
    const isAlreadyInt = matchIdCol.length > 0 && matchIdCol[0].data_type === 'integer'

    if (!isAlreadyInt) {
      // Remover FK de guesses para matches se existir
      const fks = await queryRunner.query(
        `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'guesses' AND constraint_type = 'FOREIGN KEY'`
      )
      for (const fk of fks) {
        if (fk.constraint_name.toLowerCase().includes('match')) {
          await queryRunner.query(`ALTER TABLE "guesses" DROP CONSTRAINT "${fk.constraint_name}"`)
        }
      }

      // Remover unique constraint de guesses que envolve matchId
      const uqs = await queryRunner.query(
        `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'guesses' AND constraint_type = 'UNIQUE'`
      )
      for (const uq of uqs) {
        await queryRunner.query(`ALTER TABLE "guesses" DROP CONSTRAINT "${uq.constraint_name}"`)
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

      // Recriar unique constraint
      await queryRunner.query(`ALTER TABLE "guesses" ADD CONSTRAINT "UQ_guesses_userId_matchId" UNIQUE ("userId", "matchId")`)

      // Criar FK
      await queryRunner.query(`ALTER TABLE "guesses" ADD CONSTRAINT "FK_guesses_matchId" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE`)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover FK
    await queryRunner.query(`ALTER TABLE "guesses" DROP CONSTRAINT IF EXISTS "FK_guesses_matchId"`)
    // Reverter para varchar
    await queryRunner.query(`ALTER TABLE "guesses" ALTER COLUMN "matchId" TYPE varchar USING "matchId"::varchar`)
    await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "id" TYPE varchar USING "id"::varchar`)
  }
}
